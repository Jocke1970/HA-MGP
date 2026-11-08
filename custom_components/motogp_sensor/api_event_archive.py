"""Append-only, bounded Pulselive API event journal.

Stores only transition metadata, never raw riders or non-approved live payloads.
Uses a dedicated directory within the existing motogp_data archive root.
"""
from __future__ import annotations

import json
import os
import threading
from datetime import datetime
from pathlib import Path
from typing import Any

SCHEMA_VERSION = 1
EVENT_TYPES = frozenset({
    "feed_online", "feed_offline", "session_changed", "status_changed",
    "first_roster", "roster_count_changed", "first_lap", "lap_count_increased",
    "session_started", "first_position", "first_gap_reported", "gap_updated",
    "first_lap_started", "first_lap_completed",
})


class DiagnosticArchiveError(ValueError):
    """Unsafe or unwritable diagnostic archive."""


class PulseliveEventArchive:
    """Append-only JSON Lines archive, one file per UTC observation day."""

    def __init__(self, root: str | Path) -> None:
        self.root = Path(root) / "api_diagnostics"
        self._lock = threading.RLock()

    def append(self, changes: list[dict[str, Any]]) -> int:
        """Persist event batches in observation order; perform in HA executor."""
        if not changes:
            return 0
        normalized: list[tuple[str, str]] = []
        for change in changes:
            if not isinstance(change, dict) or change.get("event") not in EVENT_TYPES:
                raise DiagnosticArchiveError("Invalid event type")
            try:
                stamp = datetime.fromisoformat(str(change["observed_at"]))
            except (KeyError, TypeError, ValueError) as err:
                raise DiagnosticArchiveError("Invalid observation timestamp") from err
            if stamp.tzinfo is None or stamp.utcoffset() is None:
                raise DiagnosticArchiveError("Naive observation timestamp")
            date = stamp.date().isoformat()
            safe: dict[str, Any] = {
                "schema_version": SCHEMA_VERSION,
                "observed_at": stamp.isoformat(),
                "event": change["event"],
                "source": "pulselive_livetiming_lite",
            }
            for key in ("event_id", "category", "session_id", "session_status_id"):
                value = change.get(key)
                if value is not None:
                    value = str(value)
                    if len(value) > 128:
                        raise DiagnosticArchiveError("Oversized identity")
                    safe[key] = value
            for key in ("rider_count", "max_observed_lap", "changed_rider_count"):
                value = change.get(key)
                if value is not None:
                    if isinstance(value, bool) or not isinstance(value, int) or not 0 <= value <= 500:
                        raise DiagnosticArchiveError("Invalid count")
                    safe[key] = value
            safe["tv_delay_ready"] = change.get("tv_delay_ready") is True
            normalized.append((date, json.dumps(safe, ensure_ascii=False, separators=(",", ":"))+"\n"))

        with self._lock:
            if self.root.is_symlink():
                raise DiagnosticArchiveError("Archive root must not be a symlink")
            self.root.mkdir(parents=True, exist_ok=True)
            if self.root.is_symlink():
                raise DiagnosticArchiveError("Archive root became a symlink")
            groups: dict[str, list[str]] = {}
            for date, line in normalized:
                groups.setdefault(date, []).append(line)
            for date, lines in groups.items():
                path = self.root / (date + ".jsonl")
                if path.is_symlink():
                    raise DiagnosticArchiveError("Archive file must not be a symlink")
                flags = os.O_WRONLY | os.O_CREAT | os.O_APPEND
                if hasattr(os, "O_NOFOLLOW"):
                    flags |= os.O_NOFOLLOW
                fd = os.open(path, flags, 0o600)
                with os.fdopen(fd, "a", encoding="utf-8") as out:
                    out.writelines(lines)
                    out.flush()
                    os.fsync(out.fileno())
        return len(normalized)
