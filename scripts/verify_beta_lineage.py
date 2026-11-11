#!/usr/bin/env python3
"""Fail-closed gate for HA-MGP beta releases; no modification of runtime files."""
from __future__ import annotations
import argparse
import json
import subprocess
import sys
from pathlib import Path

LEGACY_BETA = "2026.11.0b27"
LEGACY_UI_GIT_BLOB = "c4dccf1b2a5fd53bbd4c6cd8acb528ea8a65ea8f"


def git(*args: str) -> str:
    done = subprocess.run(["git", *args], check=True, text=True, capture_output=True)
    return done.stdout.strip()


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def run(reference: str) -> None:
    root = Path("custom_components/motogp_sensor")
    manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
    version = manifest["version"]
    ui = root / "www" / "ha-mgp.js"
    alias = root / "www" / "ha-motogp-next.js"
    require(ui.is_file() and alias.is_file(), "Missing shipped UI bundle/alias")
    main_sha, alias_sha = git("hash-object", str(ui)), git("hash-object", str(alias))
    require(main_sha == alias_sha, "STOP: shipped HA-MGP JS aliases differ")

    if version == LEGACY_BETA:
        # This is the already-published b27. Allow its existing packaging
        # checks but NEVER accept silent modification of its working UI.
        require(main_sha == LEGACY_UI_GIT_BLOB,
                "STOP: published b27 UI changed without a new version")
        print("PASS: immutable published b27 bundle; dev ancestry is not retroactively claimed")
        return

    require(version.startswith("2026.11.0b"), "STOP: unexpected beta manifest version")
    require(version != LEGACY_BETA, "STOP: legacy version was already checked")
    # Fetch only the named branch; don't trust a stale local remote ref.
    git("fetch", "--no-tags", "origin", "dev")
    source = git("rev-parse", "FETCH_HEAD")
    candidate = git("rev-parse", "HEAD")
    status = subprocess.run(["git", "merge-base", "--is-ancestor", source, candidate],
                            check=False)
    require(status.returncode == 0,
            f"STOP: beta candidate {candidate[:12]} is not descended from dev {source[:12]}; "
            "do not merge/cherry-pick a parallel release branch")
    # Check beta lineage too, to ensure a dev-built release does not revert
    # previously published changes. Exempt PR checkout synthetic merge by
    # checking only the beta branch's most recently published commit.
    git("fetch", "--no-tags", "origin", "beta")
    beta = git("rev-parse", "FETCH_HEAD")
    beta_ok = subprocess.run(["git", "merge-base", "--is-ancestor", beta, candidate],
                             check=False)
    require(beta_ok.returncode == 0,
            f"STOP: beta release candidate {candidate[:12]} does not include published beta "
            f"history {beta[:12]}")
    print(f"PASS: beta candidate {version}; ancestry dev={source[:12]} beta={beta[:12]}; UI aliases match")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--reference", default="beta", help="Reserved for future reporting")
    args = p.parse_args()
    try:
        run(args.reference)
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as e:
        print(str(e), file=sys.stderr)
        raise SystemExit(1) from e
