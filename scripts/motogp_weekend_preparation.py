"""Pure, offline scheduling rules for HA-MGP next-weekend preparations.

No network calls, filesystem writes, or Home Assistant side effects.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any


def _datetime(value: Any) -> datetime | None:
    if not isinstance(value, str):
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    return parsed.astimezone(timezone.utc) if parsed.tzinfo else None


def next_gp_after_completed_weekend(events: list[dict], now: datetime) -> dict | None:
    """Return next GP only when the previous GP weekend has ended.

    Exclude tests and unknown/broken dates. The schedule can be refreshed
    without assuming that published race results are final.
    """
    if now.tzinfo is None:
        raise ValueError("now must be timezone-aware")
    now = now.astimezone(timezone.utc)
    races = []
    for event in events:
        if not isinstance(event, dict):
            continue
        if str(event.get("kind", "GP")).upper() != "GP":
            continue
        start, end = _datetime(event.get("date_start")), _datetime(event.get("date_end"))
        if start is not None and end is not None and start <= end:
            races.append((start, end, event))
    completed = [row for row in races if row[1] <= now]
    if not completed:
        return None
    after = [row for row in races if row[0] > max(row[1] for row in completed)]
    return min(after, key=lambda row: row[0])[2] if after else None


def prep_check_due(
    *,
    now: datetime,
    last_monthly_check: datetime | None,
    previous_event_end: datetime | None,
    last_transition_check: datetime | None,
    next_first_session: datetime | None,
    last_preflight_check: datetime | None,
) -> list[str]:
    """Determine due checks without generating fetches.

    Monthly cadence is at most one check per calendar month, and
    transition checks only occur after the prior GP has ended. The
    48h preflight is due once in the 48-hour window before session start.
    Caller persists successful check timestamps and applies backoff on errors.
    """
    if now.tzinfo is None:
        raise ValueError("now must be timezone-aware")
    now = now.astimezone(timezone.utc)
    due = []
    if last_monthly_check is None or (
        last_monthly_check.astimezone(timezone.utc).year,
        last_monthly_check.astimezone(timezone.utc).month,
    ) != (now.year, now.month):
        due.append("monthly")
    if previous_event_end is not None:
        end = previous_event_end.astimezone(timezone.utc)
        if end <= now and (last_transition_check is None or last_transition_check < end):
            due.append("next_weekend")
    if next_first_session is not None:
        start = next_first_session.astimezone(timezone.utc)
        window_open = start - timedelta(hours=48)
        if window_open <= now < start and (
            last_preflight_check is None or last_preflight_check < window_open
        ):
            due.append("preflight_48h")
    return due


def entry_list_status(payload: Any, event_uuid: str, category_uuid: str) -> str:
    """No claim of provisional entrants without event/category identity.

    Never substitute /riders or /teams directory data for an entry list.
    """
    if not isinstance(payload, dict):
        return "unavailable"
    if payload.get("event_uuid") != event_uuid or payload.get("category_uuid") != category_uuid:
        return "unavailable"
    entries = payload.get("entry")
    if not isinstance(entries, list) or not entries:
        return "unavailable"
    if any(not isinstance(row, dict) or not (row.get("rider_id") or row.get("rider")) for row in entries):
        return "unavailable"
    return "provisional"
