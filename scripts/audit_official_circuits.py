#!/usr/bin/env python3
"""Read-only, low-request pilot for official historic MotoGP circuit references.

Offline by default: consumes tiny reviewed reference extracts. Live fetch is opt-in,
strictly allowlisted, at most one request per listed source, with persistent cache.
Never updates circuit_data, runtime, UI, or verification flags.
"""
from __future__ import annotations
import argparse
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "circuit_data" / "pilot_sources" / "sources.json"
FIELDS = ("length_m", "width_m", "longest_straight_m", "right", "left")


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript"):
            self.skip += 1
        elif tag in ("div", "p", "li", "h1", "h2", "h3", "td", "th", "br"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript"):
            self.skip = max(0, self.skip - 1)
        elif tag in ("div", "p", "li", "h1", "h2", "h3", "td", "th"):
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)

    def get_text(self):
        return "\n".join(x.strip() for x in self.parts if x.strip())


def normalize(raw: str) -> str:
    if "<html" in raw.lower() or "<body" in raw.lower():
        extractor = TextExtractor()
        extractor.feed(raw)
        return extractor.get_text()
    return raw


def parse_specs(raw: str) -> dict:
    """Only parse labelled Circuit Specs; never infer from prose or lap distances."""
    s = normalize(raw)
    pos = s.find("Circuit Specs")
    if pos < 0:
        return {}
    s = s[pos:pos + 3000]
    rules = {
        "length_m": r"Total length\s*([\d,.]+)\s*Km",
        "width_m": r"Total Width\s*([\d,.]+)\s*m",
        "longest_straight_m": r"Longest Straight\s*([\d,.]+)\s*m",
        "right": r"Right Corners\s*(\d+)",
        "left": r"Left Corners\s*(\d+)",
    }
    parsed = {}
    for field, rx in rules.items():
        match = re.search(rx, s, re.I)
        if match is None:
            continue
        value = match.group(1).replace(",", "")
        if field == "length_m":
            parsed[field] = round(float(value) * 1000)
            parsed["length_precision_m"] = 5 if "." in value and len(value.split(".")[-1]) == 2 else 1
        else:
            parsed[field] = int(float(value))
    return parsed


def live_read(url: str, cache_dir: Path, *, max_bytes=2_000_000) -> tuple[str | None, str, int]:
    """One request maximum; cached successful responses create zero requests thereafter."""
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.hostname != "www.motogp.com":
        raise ValueError("Refusing non-official host")
    cache = cache_dir / (hashlib.sha256(url.encode()).hexdigest() + ".html")
    if cache.exists():
        return cache.read_text(encoding="utf-8"), "cache", 0
    req = urllib.request.Request(url, headers={"User-Agent": "HA-MGP-circuit-audit/0.1 (read-only)"})
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            if response.geturl().split("/")[2] != "www.motogp.com":
                return None, "redirect-outside-official-host", 1
            if "text/html" not in response.headers.get("Content-Type", ""):
                return None, "not-html", 1
            payload = response.read(max_bytes + 1)
        if len(payload) > max_bytes:
            return None, "too-large", 1
        body = payload.decode("utf-8", errors="replace")
        cache_dir.mkdir(parents=True, exist_ok=True)
        cache.write_text(body, encoding="utf-8")
        return body, "fetched", 1
    except (OSError, urllib.error.URLError) as err:
        return None, type(err).__name__, 1


def audit(source: dict, *, fetch: bool, cache_dir: Path) -> dict:
    circuit = source["circuit_id"]
    original = json.loads((ROOT / "circuit_data" / circuit / "season_2027.json").read_text())
    facts = original["technical_facts"]
    expected = dict(length_m=facts["length_m"], width_m=facts["width_m"],
                    longest_straight_m=facts["longest_straight_m"],
                    right=facts["corners"]["right"], left=facts["corners"]["left"])
    requests = 0
    mode = "reviewed-extract"
    if fetch:
        body, mode, requests = live_read(source["url"], cache_dir)
    else:
        body = (SOURCES.parent / source["fixture"]).read_text(encoding="utf-8")
    extracted = parse_specs(body) if body else {}
    comparisons = {}
    for field in FIELDS:
        found = extracted.get(field)
        baseline = expected.get(field)
        tol = extracted.get("length_precision_m", 0) if field == "length_m" else 0
        comparisons[field] = {"official": found, "pulselive_2027": baseline,
                              "difference": None if found is None or baseline is None else baseline - found,
                              "tolerance": tol,
                              "result": ("not_found" if found is None or baseline is None else
                                         "matches_precision" if abs(found - baseline) <= tol else "differs")}
    match = all(v["result"] == "matches_precision" for v in comparisons.values())
    return {"circuit_id": circuit, "historical_year": source["year"], "official_reference": source["url"],
            "source_method": mode, "requests": requests, "fields": comparisons,
            "technical_comparison": "matching" if match else "incomplete_or_discrepant",
            "layout_variant_verified": False, "full_green_status_allowed": False,
            "review_flags": source.get("review_flags", [])}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fetch", action="store_true", help="Opt in to max one HTTPS request per circuit, cached")
    parser.add_argument("--cache-dir", type=Path, default=ROOT / ".cache" / "ha-mgp-circuits")
    parser.add_argument("--output", type=Path, help="Optional path for JSON report")
    args = parser.parse_args(argv)
    config = json.loads(SOURCES.read_text(encoding="utf-8"))
    if len(config["sources"]) != 3 or len({x["circuit_id"] for x in config["sources"]}) != 3:
        raise ValueError("Pilot is restricted to exactly three unique circuits")
    reports = [audit(x, fetch=args.fetch, cache_dir=args.cache_dir) for x in config["sources"]]
    result = {"schema_version": 1, "mode": "opt-in-live" if args.fetch else "offline-reviewed-extract",
              "request_count": sum(x["requests"] for x in reports), "max_requests_per_run": 3,
              "registry_mutated": False, "results": reports}
    serialized = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(serialized, encoding="utf-8")
    else:
        print(serialized)
    return 0


if __name__ == "__main__":
    sys.exit(main())
