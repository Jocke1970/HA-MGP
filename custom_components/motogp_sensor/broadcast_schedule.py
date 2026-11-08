"""Verified Broadcast API fallback for future MotoGP weekend sessions.

Broadcast UUIDs are never treated as Results API session UUIDs.
The API gives offset-aware starts, unlike Results API's disguised wall times.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .schedule_time import session_wall_time_to_utc


def broadcast_schedule_rows(
    event: dict[str, Any] | None,
    known_sessions: list[dict[str, Any]],
    time_zone: str | None,
) -> list[dict[str, Any]]:
    broadcasts = event.get("broadcasts") if isinstance(event, dict) else None
    if not isinstance(broadcasts, list):
        return []
    known = {
        (str(row.get("category") or ""), str(row.get("date_utc") or row.get("date") or "")[:16])
        for row in known_sessions if isinstance(row, dict)
    }
    result: list[dict[str, Any]] = []
    for item in broadcasts:
        if not isinstance(item, dict) or str(item.get("type") or "").upper() != "SESSION":
            continue
        category = item.get("category")
        if not isinstance(category, dict):
            continue
        name = str(category.get("name") or category.get("acronym") or "").lower()
        if "motogp" in name or name == "mgp":
            category_name = "MotoGP"
        elif "moto2" in name or name in ("mt2", "m2"):
            category_name = "Moto2"
        elif "moto3" in name or name in ("mt3", "m3"):
            category_name = "Moto3"
        elif "motoe" in name or name in ("mte", "me"):
            category_name = "MotoE"
        else:
            continue
        raw = item.get("date_start")
        if not isinstance(raw, str) or not raw:
            continue
        try:
            moment = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        except ValueError:
            continue
        if moment.tzinfo is not None:
            utc = moment.astimezone(timezone.utc).isoformat()
        else:
            utc = session_wall_time_to_utc(raw, time_zone)
        if utc is None:
            continue
        identity = (category_name, utc[:16])
        if identity in known:
            continue
        known.add(identity)
        short = str(item.get("shortname") or "").upper()
        valid_short = short in {"RAC", "SPR", "WUP", "PR"} or (
            len(short) <= 5 and short.startswith(("FP", "Q")) and short[2:].isdigit()
            if short.startswith("FP") else len(short) <= 5 and short.startswith("Q") and short[1:].isdigit()
        )
        label = short if valid_short else str(item.get("name") or "").strip()[:80]
        label = {"RAC": "Race", "SPR": "Sprint",
                 "WUP": "Warm Up", "PR": "Practice"}.get(label, label)
        if not label:
            continue
        result.append({
            "id": "",  # Deliberately not an authenticated Results-session ID.
            "category": category_name,
            "category_raw": category.get("name") or category_name,
            "category_id": None,
            "name": label,
            "type": short,
            "date": raw,
            "date_utc": utc,
            "status": item.get("status") or "",
            "source": "broadcast_schedule",
        })
    return result
