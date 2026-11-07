"""Pure, bounded projection of observed archive laps for a single rider."""

from __future__ import annotations

from typing import Any


def rider_laps_response(
    archive: dict[str, Any] | None, rider_id: str, identity: dict[str, Any]
) -> dict[str, Any]:
    """Project observed laps only; report holes without fabricating timestamps."""
    item = (archive or {}).get("riders", {}).get(rider_id, {})
    rows = item.get("laps", {})
    if not isinstance(rows, dict):
        rows = {}
    if len(rows) > 500:
        raise ValueError("Unexpectedly many laps for a single rider")

    laps: list[dict[str, Any]] = []
    for key, row in rows.items():
        if not isinstance(row, dict):
            continue
        try:
            lap = int(key)
            seconds = float(row["seconds"])
        except (TypeError, ValueError, KeyError):
            continue
        if not 1 <= lap <= 500 or not 0 < seconds < 3600:
            continue
        laps.append(
            {
                "lap": lap,
                "time": str(row.get("time") or ""),
                "seconds": seconds,
            }
        )
    laps.sort(key=lambda x: x["lap"])

    coverage = (archive or {}).get("coverage", {})
    missing = coverage.get("missing_laps_by_rider", {}).get(rider_id, [])
    missing = sorted({int(n) for n in missing if isinstance(n, int) and 1 <= n <= 500})
    best = min((r["seconds"] for r in laps), default=None)
    return {
        "rider_id": rider_id,
        "name": str(item.get("name") or ""),
        "number": str(item.get("number") or ""),
        "session": str(identity.get("session") or ""),
        "session_id": str(identity.get("session_id") or ""),
        "laps": laps,
        "best_seconds": best,
        "missing_laps": missing,
        "partial": bool(missing),
        "ended": bool((archive or {}).get("ended")),
    }
