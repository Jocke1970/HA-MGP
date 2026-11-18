#!/usr/bin/env python3
"""Read-only Home Assistant FP1 diagnostics capture. Standard library only."""
from __future__ import annotations

import argparse
import json
import os
import signal
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_START = "2026-11-20T09:45:00+01:00"
DEFAULT_END = "2026-11-20T12:45:00+01:00"
ENTITIES = (
    "sensor.motogp_next_race",
    "sensor.motogp_rider_positions",
    "sensor.motogp_current_session",
    "sensor.motogp_session_status",
    "sensor.motogp_api_debug",
)
NEXT_KEYS = ("event_id", "date_start", "date_end", "time_zone",
             "next_weekend_api_status", "session_count", "session_count_all")
LIVE_KEYS = ("live_poll_at", "live_poll_interval_seconds", "tv_delay_seconds",
             "tv_delay_ready", "session_id", "event_id", "category",
             "session_status_id", "session_name", "session_shortname",
             "riders", "count", "track_status_codes", "rider_status_codes")
DEBUG_KEYS = ("feed_online", "results_event_id", "category", "session_id",
              "session_status_id", "rider_count", "max_observed_lap",
              "session_first_seen_at", "session_started_at",
              "first_roster_at", "first_lap_at", "first_position_at",
              "first_gap_at", "first_lap_completed_at", "feed_changed_at")
_STOP = False


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse_date(value: str) -> datetime:
    result = datetime.fromisoformat(value)
    if result.tzinfo is None or result.utcoffset() is None:
        raise ValueError("Timestamp requires UTC offset (e.g. +01:00)")
    return result.astimezone(timezone.utc)


def compact_schedule(rows: object) -> list[dict]:
    if not isinstance(rows, list):
        return []
    return [
        {key: row.get(key) for key in ("id", "category", "name", "type",
                                      "date_utc", "status", "source")}
        for row in rows if isinstance(row, dict)
    ]


def normalize(entity_id: str, payload: dict) -> dict:
    attrs = payload.get("attributes") or {}
    if not isinstance(attrs, dict):
        attrs = {}
    result = {"entity_id": entity_id, "state": payload.get("state"),
              "last_changed": payload.get("last_changed"),
              "last_updated": payload.get("last_updated")}
    if entity_id.endswith("next_race"):
        result["attributes"] = {k: attrs.get(k) for k in NEXT_KEYS if k in attrs}
        result["attributes"]["sessions_all"] = compact_schedule(attrs.get("sessions_all"))
    elif entity_id.endswith("rider_positions"):
        result["attributes"] = {k: attrs.get(k) for k in LIVE_KEYS if k in attrs}
    elif entity_id.endswith("api_debug"):
        result["attributes"] = {k: attrs.get(k) for k in DEBUG_KEYS if k in attrs}
    else:
        result["attributes"] = {k: attrs.get(k) for k in
                                ("event_id", "category", "session_id",
                                 "session_status_id", "session_name",
                                 "session_shortname", "tv_delay_ready") if k in attrs}
    return result


def capture(url: str, token: str, entities: tuple[str, ...], timeout: float) -> dict:
    record = {"timestamp_utc": utc_now(), "entities": {}, "errors": {}}
    for entity in entities:
        request = Request(
            f'{url.rstrip("/")}/api/states/{entity}',
            headers={"Authorization": f"Bearer {token}",
                     "Accept": "application/json"},
            method="GET",
        )
        try:
            with urlopen(request, timeout=timeout) as response:
                payload = json.load(response)
            record["entities"][entity] = normalize(entity, payload)
        except HTTPError as error:
            record["errors"][entity] = f"HTTP {error.code}"
        except (URLError, TimeoutError, OSError, ValueError) as error:
            # No response body or Authorization header is written to disk.
            record["errors"][entity] = type(error).__name__
    return record


def write_line(target: Path, value: dict) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(str(target), os.O_CREAT | os.O_APPEND | os.O_WRONLY, 0o600)
    with os.fdopen(fd, "a", encoding="utf-8") as output:
        output.write(json.dumps(value, ensure_ascii=False,
                                separators=(",", ":")) + "\n")


def stop(_sig, _frame):
    global _STOP
    _STOP = True


def run(args) -> int:
    token = os.environ.get(args.token_env, "").strip()
    if args.token_file:
        try:
            token = Path(args.token_file).expanduser().read_text(encoding="utf-8").strip()
        except OSError as err:
            print(f"Unable to read token file: {type(err).__name__}", file=sys.stderr)
            return 2
    if not token:
        print("Missing HA token (environment or --token-file)", file=sys.stderr)
        return 2
    start, end = parse_date(args.start), parse_date(args.end)
    if not start < end:
        print("End must be after start", file=sys.stderr)
        return 2
    if not args.ha_url.startswith(("http://", "https://")):
        print("Invalid HA URL", file=sys.stderr)
        return 2
    now = datetime.now(timezone.utc)
    if now >= end and not args.once:
        print("Capture window has already ended", file=sys.stderr)
        return 2
    signal.signal(signal.SIGINT, stop)
    signal.signal(signal.SIGTERM, stop)
    output = Path(args.output).expanduser()
    if args.once:
        # Intended for HA shell_command: finish in one short invocation.
        # HA automation controls the schedule. --once also permits an
        # intentional immediate smoke-test outside the FP1 window.
        record = capture(args.ha_url, token, ENTITIES, args.timeout)
        write_line(output, record)
        print(f'{record["timestamp_utc"]}: {len(record["entities"])} OK, '
              f'{len(record["errors"])} errors', flush=True)
        return 0 if record["entities"] else 1
    print(f"Window {start.isoformat()} – {end.isoformat()}; output={output}",
          flush=True)
    while not _STOP:
        now = datetime.now(timezone.utc)
        if now >= end:
            break
        if now < start:
            time.sleep(min((start - now).total_seconds(), 30))
            continue
        record = capture(args.ha_url, token, ENTITIES, args.timeout)
        write_line(output, record)
        print(f'{record["timestamp_utc"]}: {len(record["entities"])} OK, '
              f'{len(record["errors"])} errors', flush=True)
        time.sleep(args.interval)
    write_line(output, {"capture_finished_utc": utc_now(), "interrupted": _STOP})
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ha-url", default=os.environ.get(
        "HA_URL", "http://homeassistant.local:8123"))
    parser.add_argument("--token-env", default="HA_TOKEN")
    parser.add_argument("--token-file", default=None,
                        help="Read token from protected file, without command-line exposure")
    parser.add_argument("--once", action="store_true",
                        help="Collect one HA snapshot and return (for shell_command)")
    parser.add_argument("--start", default=DEFAULT_START)
    parser.add_argument("--end", default=DEFAULT_END)
    parser.add_argument("--interval", type=int, default=15)
    parser.add_argument("--timeout", type=float, default=8)
    parser.add_argument("--output", default="mgp-fp1-2026-11-20.jsonl")
    args = parser.parse_args()
    if args.interval < 5 or args.timeout <= 0:
        parser.error("Interval must be >= 5 seconds and timeout positive")
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
