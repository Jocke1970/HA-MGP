"""Verified, explicitly time-scoped published schedule fallback.

This is NOT live timing, a Results-session ID, or an automatic API.
Published on the official MotoGP Portugal 2026 event page (checked 2026-11-08).
Only used while Results/Broadcast supply no matching session. Refresh/review
before the event if start times are changed by the organiser.
https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from zoneinfo import ZoneInfo

# Date, local wall time, class, name, type. MotoGP 2026 Algarve only.
_PORTUGAL_2026 = (
    ("2026-11-20", "09:00", "Moto3", "FP1", "FP"),
    ("2026-11-20", "09:50", "Moto2", "FP1", "FP"),
    ("2026-11-20", "10:45", "MotoGP", "FP1", "FP"),
    ("2026-11-20", "13:15", "Moto3", "Practice", "PR"),
    ("2026-11-20", "14:05", "Moto2", "Practice", "PR"),
    ("2026-11-20", "15:00", "MotoGP", "Practice", "PR"),
    ("2026-11-21", "08:40", "Moto3", "FP2", "FP"),
    ("2026-11-21", "09:25", "Moto2", "FP2", "FP"),
    ("2026-11-21", "10:10", "MotoGP", "FP2", "FP"),
    ("2026-11-21", "10:50", "MotoGP", "Q1", "Q"),
    ("2026-11-21", "11:15", "MotoGP", "Q2", "Q"),
    ("2026-11-21", "12:45", "Moto3", "Q1", "Q"),
    ("2026-11-21", "13:10", "Moto3", "Q2", "Q"),
    ("2026-11-21", "13:40", "Moto2", "Q1", "Q"),
    ("2026-11-21", "14:05", "Moto2", "Q2", "Q"),
    ("2026-11-21", "15:00", "MotoGP", "Sprint", "SPR"),
    ("2026-11-22", "09:40", "MotoGP", "Warm Up", "WUP"),
    ("2026-11-22", "11:15", "Moto2", "Race", "RAC"),
    ("2026-11-22", "13:00", "MotoGP", "Race", "RAC"),
    ("2026-11-22", "14:30", "Moto3", "Race", "RAC"),
)

SOURCE_URL = "https://www.motogp.com/en/calendar/2026/event/portugal/c7f7626b-807f-4a6f-813e-7ad2c68302a3"


def published_schedule_rows(
    event: dict[str, Any] | None,
    current_sessions: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Return only uncovered classes/times for the exact Portugal 2026 event."""
    if not isinstance(event, dict):
        return []
    if str(event.get("date_start") or "")[:10] != "2026-11-20" or str(event.get("date_end") or "")[:10] != "2026-11-22":
        return []
    country = event.get("country")
    country_name = str(country.get("name") or "") if isinstance(country, dict) else str(country or "")
    if "portugal" not in country_name.casefold():
        return []
    known = {
        (str(s.get("category") or ""), str(s.get("date_utc") or "")[:16])
        for s in current_sessions if isinstance(s, dict)
    }
    zone = ZoneInfo("Europe/Lisbon")
    result = []
    for day, clock, category, name, type_ in _PORTUGAL_2026:
        local = datetime.fromisoformat(day + "T" + clock).replace(tzinfo=zone)
        utc = local.astimezone(timezone.utc).isoformat()
        if (category, utc[:16]) in known:
            continue
        result.append({
            "id": "", "category": category, "category_raw": category,
            "category_id": None, "name": name, "type": type_,
            "date": day + "T" + clock + ":00",
            "date_utc": utc, "status": "SCHEDULED",
            "source": "official_published_schedule", "source_url": SOURCE_URL,
        })
    return result
