"""Recorder-friendly, TV-delay-safe Pulselive transition diagnostics.

No additional HTTP requests. Never expose raw or unapproved live payloads.
"""
from __future__ import annotations

from datetime import datetime, timedelta
import re
from typing import Any

# Only elapsed-time gaps are counted: ignore blanks, leaders and textual gaps
# such as "PIT", "+1 Lap" or placeholders.
_GAP_RE = re.compile(r"^[+]?(?:\\d+:)?\\d+(?:[.,]\\d{1,3})?$")
_LAP_RE = re.compile(r"^(?:\\d+[':])?\\d{1,2}\\.\\d{3}$")
_GAP_SUMMARY_INTERVAL = timedelta(seconds=15)


def _gap(value: Any) -> str | None:
    if not isinstance(value, (str, int, float)) or isinstance(value, bool):
        return None
    candidate = str(value).strip().replace(",", ".")
    return candidate if _GAP_RE.fullmatch(candidate) else None


def _completed_lap(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    candidate = value.strip()
    return bool(_LAP_RE.fullmatch(candidate)) and any(c in "123456789" for c in candidate)


class PulseliveDiagnostics:
    """Track changes without writing a fresh timestamp at every polling tick."""

    def __init__(self) -> None:
        self._identity: tuple[str, str, str] | None = None
        self._status: str | None = None
        self._count = 0
        self._max_laps = 0
        self._first_roster_at: str | None = None
        self._first_lap_at: str | None = None  # legacy: first positive num_lap
        self._first_gap_at: str | None = None
        self._first_position_at: str | None = None
        self._first_lap_completed_at: str | None = None
        self._previous_gaps: dict[str, tuple[str | None, str | None]] = {}
        self._last_gap_summary_at: datetime | None = None
        self._session_seen_at: str | None = None
        self._status_changed_at: str | None = None
        self._feed_changed_at: str | None = None
        self._online: bool | None = None
        self._last_event = "No data"

    def observe(
        self, live: dict[str, Any] | None, online: bool, at: datetime,
    ) -> list[dict[str, Any]]:
        """Return meaningful transition events from TV-delay-approved samples."""
        timestamp = at.isoformat()
        changes: list[dict[str, Any]] = []
        def record(kind: str) -> None:
            approved = isinstance(live, dict) and live.get("tv_delay_ready") is True
            identity = self._identity if approved and self._identity else ("", "", "")
            changes.append({
                "observed_at": timestamp,
                "event": kind,
                "source": "pulselive_livetiming_lite",
                "event_id": identity[0] or None,
                "category": identity[1] or None,
                "session_id": identity[2] or None,
                "session_status_id": self._status,
                "rider_count": self._count,
                "max_observed_lap": self._max_laps,
                "tv_delay_ready": approved,
            })
            self._last_event = kind
        if self._online is not online:
            self._online = online
            self._feed_changed_at = timestamp
            # Feed events do not include raw session data (unapproved until delay).
            record("feed_online" if online else "feed_offline")

        if not live or live.get("tv_delay_ready") is not True:
            return changes

        identity = tuple(str(live.get(field) or "") for field in (
            "event_id", "category", "session_id"
        ))
        if not all(identity):
            # No trusted identity: do not associate riders with a session.
            return changes

        if identity != self._identity:
            self._identity = identity
            self._status = None
            self._count = 0
            self._max_laps = 0
            self._first_roster_at = None
            self._first_lap_at = None
            self._first_gap_at = None
            self._first_position_at = None
            self._first_lap_completed_at = None
            self._previous_gaps = {}
            self._last_gap_summary_at = None
            self._session_seen_at = timestamp
            record("session_changed")

        status = str(live.get("session_status_id") or "")
        if status != self._status:
            self._status = status
            self._status_changed_at = timestamp
            record("status_changed")
            if status in ("S", "I"):
                record("session_started")

        riders = live.get("riders")
        if not isinstance(riders, list):
            return changes
        count = len(riders)
        if count and not self._first_roster_at:
            self._first_roster_at = timestamp
            record("first_roster")
        if count != self._count:
            self._count = count
            record("roster_count_changed")

        laps = []
        for rider in riders:
            if not isinstance(rider, dict):
                continue
            try:
                laps.append(max(0, int(rider.get("num_lap") or 0)))
            except (TypeError, ValueError):
                continue
        max_laps = max(laps, default=0)
        if max_laps and not self._first_lap_at:
            self._first_lap_at = timestamp
            record("first_lap")  # legacy
            record("first_lap_started")
        if max_laps > self._max_laps:
            self._max_laps = max_laps
            record("lap_count_increased")

        # No sectors are inferred from gaps. First availability and changes
        # are evidence of timing data, not proof of a particular timing loop.
        valid_positions = [
            r for r in riders if isinstance(r, dict)
            and isinstance(r.get("position"), int)
            and not isinstance(r.get("position"), bool) and r["position"] > 0
        ]
        if valid_positions and self._first_position_at is None:
            self._first_position_at = timestamp
            record("first_position")

        if any(_completed_lap(r.get("last_lap_time")) for r in riders
               if isinstance(r, dict)) and self._first_lap_completed_at is None:
            self._first_lap_completed_at = timestamp
            record("first_lap_completed")

        gaps: dict[str, tuple[str | None, str | None]] = {}
        for index, rider in enumerate(riders):
            if not isinstance(rider, dict):
                continue
            # Use provider ID, not position; positions change during racing.
            rider_id = rider.get("rider_id")
            if rider_id is None or isinstance(rider_id, bool):
                continue
            key = str(rider_id)
            if not key or key in gaps:
                continue
            gaps[key] = (_gap(rider.get("gap_first")), _gap(rider.get("gap_prev")))
        if any(gap is not None for pair in gaps.values() for gap in pair):
            if self._first_gap_at is None:
                self._first_gap_at = timestamp
                record("first_gap_reported")
        # First roster is only a baseline; avoid a flood of "changes" when
        # our integration starts during an already running session.
        if self._previous_gaps:
            changed = sum(
                1 for rider_id, value in gaps.items()
                if rider_id in self._previous_gaps
                and value != self._previous_gaps[rider_id]
            )
            if changed and (
                self._last_gap_summary_at is None
                or at - self._last_gap_summary_at >= _GAP_SUMMARY_INTERVAL
            ):
                record("gap_updated")
                changes[-1]["changed_rider_count"] = changed
                self._last_gap_summary_at = at
        self._previous_gaps = gaps
        return changes

    def state(self) -> str:
        """Small, stable Recorder state for meaningful transitions."""
        return self._last_event

    def attributes(self) -> dict[str, Any]:
        """Never include entire rider payloads or regularly changing poll times."""
        identity = self._identity or ("", "", "")
        return {
            "source": "pulselive_livetiming_lite",
            "feed_online": self._online,
            "results_event_id": identity[0] or None,
            "category": identity[1] or None,
            "session_id": identity[2] or None,
            "session_status_id": self._status,
            "rider_count": self._count,
            "max_observed_lap": self._max_laps,
            "session_first_seen_at": self._session_seen_at,
            "session_status_changed_at": self._status_changed_at,
            "first_roster_at": self._first_roster_at,
            "first_lap_at": self._first_lap_at,
            "first_lap_started_at": self._first_lap_at,
            "first_position_at": self._first_position_at,
            "first_gap_at": self._first_gap_at,
            "first_lap_completed_at": self._first_lap_completed_at,
            "feed_changed_at": self._feed_changed_at,
            "tv_delay_note": "timestamps refer to TV-delay-approved exposed data",
        }
