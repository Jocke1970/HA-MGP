"""Event- and session-scoped Pulselive timing status for the weekend schedule.

Results timetable status can lag the timing gateway, especially when RAC2
restarts a race. Never infer Finished from a passed calendar start time.
"""
from __future__ import annotations

import re
from typing import Any

DONE = frozenset({"F", "C"})
KNOWN = frozenset({"I", "S", "R", "D", "F", "C"})


def _canon(value: Any) -> str:
    return re.sub(r"[^A-Z0-9]", "", str(value or "").upper())


def _session_name(value: Any) -> str:
    key = _canon(value)
    if re.fullmatch(r"RAC(?:[2-9][0-9]*)?", key) or re.fullmatch(r"RACEPART[2-9][0-9]*", key):
        return "Race"
    return {
        "RAC": "Race", "RACE": "Race", "SPR": "Sprint",
        "SPRINT": "Sprint", "TISSOTSPRINT": "Sprint",
        "PR": "Practice", "PRACTICE": "Practice",
        "WUP": "Warm Up", "WARMUP": "Warm Up",
    }.get(key, key if re.fullmatch(r"(?:FP|Q)[1-9][0-9]*", key) else "")


def observe_session_status(
    observed: dict[str, dict[str, dict[str, str]]],
    live: dict[str, Any] | None,
    event: dict[str, Any] | None,
    schedule: list[dict[str, Any]] | None,
) -> dict[str, dict[str, dict[str, str]]]:
    """Retain only directly observed timing-gateway statuses for this event.

    Distinct live session IDs protect a RAC2 restart from inheriting RAC
    status. No inference from rider count, lap count or wall clock.
    """
    if not isinstance(live, dict) or not isinstance(event, dict):
        return observed
    event_name = _canon(event.get("name") or event.get("short_name"))
    live_name = _canon(live.get("event_name"))
    if not event_name or not live_name or not (
        event_name in live_name or live_name in event_name
    ):
        return observed
    category = str(live.get("category") or "").strip()
    session = _session_name(live.get("session_shortname"))
    status = str(live.get("session_status_id") or "").upper()
    session_id = str(live.get("session_id") or "").strip()
    if not session_id or status not in KNOWN or category not in {"MotoGP", "Moto2", "Moto3", "MotoE"}:
        return observed
    candidates = [
        row for row in (schedule or [])
        if isinstance(row, dict) and row.get("category") == category
        and _session_name(row.get("name") or row.get("type")) == session
        and row.get("id") and row.get("category_id")
    ]
    if len(candidates) != 1:
        return observed
    previous = observed.get(category, {}).get(session)
    if previous and previous.get("session_id") == session_id and previous.get("status_id") in DONE:
        # A late/stale 'in progress' poll cannot undo an observed finish.
        if status not in DONE:
            return observed
    updated = {key: dict(value) for key, value in observed.items()}
    updated.setdefault(category, {})[session] = {
        "status_id": status, "session_id": session_id,
        "session_shortname": str(live.get("session_shortname") or ""),
        "source": "timing-gateway",
    }
    return updated
