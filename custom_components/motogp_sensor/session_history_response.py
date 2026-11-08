"""Source-honest read-only summary of observed archived MotoGP laps."""
from __future__ import annotations

import math
from typing import Any


def session_history_response(archive: dict[str, Any] | None) -> dict[str, Any]:
    if archive is None:
        return {"available": False, "riders": [], "observed_laps": 0, "partial": True}
    identity = archive.get("identity")
    riders = archive.get("riders")
    if not isinstance(identity, dict) or not isinstance(riders, dict) or len(riders) > 100:
        raise ValueError("Invalid historical archive")
    result: list[dict[str, Any]] = []
    for rider_id, item in riders.items():
        if not isinstance(item, dict) or not 1 <= len(str(rider_id)) <= 128:
            raise ValueError("Invalid historical rider entry")
        raw = item.get("laps")
        if not isinstance(raw, dict) or len(raw) > 500:
            raise ValueError("Invalid historical laps")
        laps = []
        for number, lap in raw.items():
            if not isinstance(lap, dict):
                continue
            try:
                lap_number = int(number)
                seconds = float(lap.get("seconds"))
            except (ValueError, TypeError, OverflowError):
                continue
            if not (1 <= lap_number <= 500 and math.isfinite(seconds) and 0 < seconds < 3600):
                continue
            laps.append((lap_number, seconds, str(lap.get("time") or "")[:32]))
        if not laps:
            continue
        laps.sort(key=lambda x: x[0])
        best = min(laps, key=lambda x: (x[1], x[0]))
        last = laps[-1]
        missing = len(set(range(1, last[0] + 1)) - {row[0] for row in laps})
        result.append({
            "rider_id": str(rider_id),
            "name": str(item.get("name") or "")[:96],
            "number": str(item.get("number") or "")[:8],
            "lap_count": len(laps),
            "last_lap": last[0], "last_time": last[2],
            "best_lap": best[0], "best_time": best[2],
            "best_seconds": best[1],
            "missing_laps": missing, "partial": bool(missing),
        })
    result.sort(key=lambda r: (r["best_seconds"], r["name"], r["rider_id"]))
    coverage = archive.get("coverage")
    return {
        "available": bool(result),
        "category": str(identity.get("category") or "")[:32],
        "session": str(identity.get("session") or "")[:32],
        "session_id": str(identity.get("session_id") or "")[:128],
        "updated_at": str(archive.get("updated_at") or "")[:64],
        "ended": bool(archive.get("ended")),
        "observed_laps": sum(r["lap_count"] for r in result),
        "partial": any(r["partial"] for r in result) or
            (bool(coverage.get("partial")) if isinstance(coverage, dict) else False),
        "riders": result,
    }
