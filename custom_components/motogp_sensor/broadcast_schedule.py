"""Verified Broadcast API fallback for future MotoGP weekend sessions.

Broadcast UUIDs are never treated as Results API session UUIDs.
The API gives offset-aware starts, unlike Results API's disguised wall times.
"""
from __future__ import annotations

from datetime import date, datetime, timedelta, timezone
import re
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
        valid_short = short in {"RAC", "SPR", "WUP", "PR"} or bool(
            re.fullmatch(r"(?:FP[1-9][0-9]?|Q[1-9][0-9]?)", short)
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


def results_sessions_for_event(
    sessions: list[dict[str, Any]],
    event: dict[str, Any],
) -> tuple[list[dict[str, Any]], int]:
    """Exclude stale Results timetable rows, preserving authenticated IDs.

    Compare API wall-calendar dates with the event's calendar dates: Results
    timestamps may contain a misleading UTC offset. Allow one adjacent day
    for legitimate Thursday sessions and midnight/time-zone boundaries.
    Never rewrite a stale Results timestamp or borrow a Broadcast UUID.
    """
    try:
        start = date.fromisoformat(str(event["date_start"])[:10])
        end = date.fromisoformat(str(event["date_end"])[:10])
        if end < start:
            raise ValueError("reversed event window")
    except (KeyError, TypeError, ValueError):
        return [], len(sessions)

    earliest, latest = start - timedelta(days=1), end + timedelta(days=1)
    accepted: list[dict[str, Any]] = []
    rejected = 0
    for session in sessions:
        if not isinstance(session, dict):
            rejected += 1
            continue
        try:
            day = date.fromisoformat(str(session.get("date") or "")[:10])
        except ValueError:
            rejected += 1
            continue
        if earliest <= day <= latest:
            accepted.append(session)
        else:
            rejected += 1
    return accepted, rejected
