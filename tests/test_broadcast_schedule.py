"""Broadcast schedule fallback tests: future GP, timezone, category, identity and duplicates."""
from __future__ import annotations

import importlib
from pathlib import Path
import sys
import types
import unittest

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor"
PACKAGE = "_motogp_broadcast_schedule_tests"
module = types.ModuleType(PACKAGE)
module.__path__ = [str(ROOT)]
sys.modules[PACKAGE] = module
Broadcast = importlib.import_module(f"{PACKAGE}.broadcast_schedule")


def session(start, label, category="MotoGP", kind="SESSION", status="NOT-STARTED"):
    return {
        "type": kind, "category": {"name": category}, "shortname": label,
        "date_start": start, "status": status,
    }


class BroadcastScheduleTests(unittest.TestCase):
    def test_future_portugal_available_without_results(self):
        event = {"broadcasts": [
            session("2026-11-20T10:45:00+0000", "FP1", "MotoGP"),
            session("2026-11-20T09:50:00+0000", "FP1", "Moto2"),
            session("2026-11-20T09:00:00+0000", "FP1", "Moto3"),
            session("2026-11-22T13:00:00+0000", "RAC", "MotoGP"),
            session("2026-11-20T08:00:00+0000", "SHOW", "MotoGP", "MEDIA"),
        ]}
        result = Broadcast.broadcast_schedule_rows(event, [], "Europe/Lisbon")
        self.assertEqual(len(result), 4)
        self.assertEqual({row["category"] for row in result}, {"MotoGP", "Moto2", "Moto3"})
        self.assertTrue(all(row["id"] == "" and row["source"] == "broadcast_schedule" for row in result))
        self.assertEqual(result[-1]["name"], "Race")
        self.assertEqual(result[0]["date_utc"], "2026-11-20T10:45:00+00:00")

    def test_existing_results_session_wins(self):
        old = [{"category": "MotoGP", "date_utc": "2026-11-20T10:45:00+00:00",
                "id": "verified-results-uuid", "name": "FP1"}]
        data = {"broadcasts": [
            session("2026-11-20T10:45:00+0000", "FP1"),
            session("2026-11-20T15:00:00+0000", "PR"),
        ]}
        rows = Broadcast.broadcast_schedule_rows(data, old, "Europe/Lisbon")
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["name"], "Practice")
        self.assertNotIn("verified-results-uuid", [x["id"] for x in rows])

    def test_offset_aware_start_is_not_misread_as_results_wall_time(self):
        event = {"broadcasts": [session("2026-11-20T10:45:00+0100", "FP1")]}
        rows = Broadcast.broadcast_schedule_rows(event, [], "Europe/Lisbon")
        self.assertEqual(rows[0]["date_utc"], "2026-11-20T09:45:00+00:00")

    def test_invalid_or_media_rows_cannot_create_fake_races(self):
        event = {"broadcasts": [
            session("bad-date", "RAC"),
            session("2026-11-20T12:00:00+0000", "SHOW", kind="MEDIA"),
            session("2026-11-20T12:00:00+0000", "FP1", category="Unknown"),
            {"type": "SESSION", "date_start": "2026-11-20T12:00:00+0000"},
        ]}
        self.assertEqual(Broadcast.broadcast_schedule_rows(event, [], "Europe/Lisbon"), [])


if __name__ == "__main__":
    unittest.main()
