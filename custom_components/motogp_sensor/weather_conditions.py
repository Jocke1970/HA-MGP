"""Select Pulselive Results API session weather without mixing events/classes.

Results API uses its own event and category UUIDs.  Broadcast IDs must
never be passed to /results/sessions.  A condition is a session report:
its availability does NOT prove live measurements or a measurement time.
"""

from __future__ import annotations

from typing import Any


def _name(row: dict[str, Any]) -> str:
    kind = str(row.get("type") or "").strip().upper()
    number = row.get("number")
    if kind in ("FP", "Q") and number not in (None, "", 0, "0"):
        return f"{kind}{number}"
    return kind


def _session_condition(row: dict[str, Any]) -> bool:
    return isinstance(row.get("condition"), dict) and any(
        row["condition"].get(k) not in (None, "")
        for k in ("track", "air", "ground", "humidity", "weather")
    )


def select_session_weather(
    sessions: Any,
    *,
    event_uuid: str,
    category_uuid: str,
    session_shortname: str | None = None,
) -> dict[str, Any] | None:
    """Choose an exact session (live) or last reported session (archive).

    A live request never falls back to another session.  Archive selection
    only includes FINISHED sessions, in chronological schedule order. Session
    dates are used solely for ordering, never treated as authoritative UTC.
    """
    if not isinstance(sessions, list) or not event_uuid or not category_uuid:
        return None
    requested = str(session_shortname or "").strip().upper()
    candidates: list[dict[str, Any]] = []
    for session in sessions:
        if not isinstance(session, dict) or not _session_condition(session):
            continue
        event = session.get("event")
        category = session.get("category")
        if not isinstance(event, dict) or str(event.get("id") or "") != str(event_uuid):
            continue
        if not isinstance(category, dict) or str(category.get("id") or "") != str(category_uuid):
            continue
        if requested:
            if _name(session) != requested:
                continue
        elif str(session.get("status") or "").upper() != "FINISHED":
            continue
        candidates.append(session)
    if not candidates:
        return None
    selected = candidates[0] if requested else max(
        candidates, key=lambda s: str(s.get("date") or "")
    )
    condition = selected["condition"]
    return {
        "track": condition.get("track") or "",
        "air": condition.get("air") or "",
        "ground": condition.get("ground") or "",
        "humidity": condition.get("humidity") or "",
        "weather": condition.get("weather") or "",
        "source_session": _name(selected),
        "source_session_id": str(selected.get("id") or ""),
        "source_session_status": str(selected.get("status") or ""),
        "results_event_uuid": str(event_uuid),
        "results_category_uuid": str(category_uuid),
        "report_type": "session_report",
        "live_weather_verified": False,
    }
