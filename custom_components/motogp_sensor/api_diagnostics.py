"""Recorder-friendly, TV-delay-safe Pulselive transition diagnostics.

No additional HTTP requests. Never expose raw or unapproved live payloads.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any


class PulseliveDiagnostics:
    """Track changes without writing a fresh timestamp at every polling tick."""

    def __init__(self) -> None:
        self._identity: tuple[str, str, str] | None = None
        self._status: str | None = None
        self._count = 0
        self._max_laps = 0
        self._first_roster_at: str | None = None
        self._first_lap_at: str | None = None
        self._session_seen_at: str | None = None
        self._status_changed_at: str | None = None
        self._feed_changed_at: str | None = None
        self._online: bool | None = None
        self._last_event = "No data"

    def observe(
        self, live: dict[str, Any] | None, online: bool, at: datetime,
    ) -> None:
        """Observe *exposed* TV-delayed data, not raw/undelayed data."""
        timestamp = at.isoformat()
        if self._online is not online:
            self._online = online
            self._feed_changed_at = timestamp
            self._last_event = "feed_online" if online else "feed_offline"

        if not live or live.get("tv_delay_ready") is not True:
            return

        identity = tuple(str(live.get(field) or "") for field in (
            "event_id", "category", "session_id"
        ))
        if not all(identity):
            # No trusted identity: do not associate riders with a session.
            return

        if identity != self._identity:
            self._identity = identity
            self._status = None
            self._count = 0
            self._max_laps = 0
            self._first_roster_at = None
            self._first_lap_at = None
            self._session_seen_at = timestamp
            self._last_event = "session_changed"

        status = str(live.get("session_status_id") or "")
        if status != self._status:
            self._status = status
            self._status_changed_at = timestamp
            self._last_event = "status_changed"

        riders = live.get("riders")
        if not isinstance(riders, list):
            return
        count = len(riders)
        if count and not self._first_roster_at:
            self._first_roster_at = timestamp
            self._last_event = "first_roster"
        if count != self._count:
            self._count = count
            self._last_event = "roster_count_changed"

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
            self._last_event = "first_lap"
        if max_laps > self._max_laps:
            self._max_laps = max_laps
            self._last_event = "lap_count_increased"

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
            "feed_changed_at": self._feed_changed_at,
            "tv_delay_note": "timestamps refer to TV-delay-approved exposed data",
        }
