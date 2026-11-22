#!/usr/bin/env python3
"""Pulselive session-status overlay, using an actual Portugal RAC2-shaped feed."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / "custom_components/motogp_sensor/session_status_overlay.py"
spec = importlib.util.spec_from_file_location("motogp_status_overlay", PATH)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
observe = mod.observe_session_status

EVENT = {"id": "4b3882a8-24b2-4321-aa12-d1847c989438",
         "name": "GRAND PRIX OF PORTUGAL"}
SCHEDULE = [
    {"id": "moto2-results-uuid", "category_id": "moto2-uuid", "category": "Moto2",
     "name": "Race", "type": "RAC", "status": "NOT-STARTED"},
    {"id": "motogp-results-uuid", "category_id": "motogp-uuid", "category": "MotoGP",
     "name": "Race", "type": "RAC", "status": "NOT-STARTED"},
]


def live(shortname="RAC2", code="S", session_id="7", category="Moto2",
         event_name="Repsol Grand Prix of Portugal"):
    return {
        "event_name": event_name, "category": category,
        "session_shortname": shortname, "session_status_id": code,
        "session_id": session_id,
    }


class TestSessionStatusOverlay(unittest.TestCase):
    def test_portugal_rac2_status_and_finish(self):
        statuses = observe({}, live(), EVENT, SCHEDULE)
        self.assertEqual(statuses["Moto2"]["Race"]["status_id"], "S")
        self.assertEqual(statuses["Moto2"]["Race"]["session_id"], "7")
        statuses = observe(statuses, live(code="C"), EVENT, SCHEDULE)
        self.assertEqual(statuses["Moto2"]["Race"]["status_id"], "C")
        statuses = observe(statuses, live(code="S"), EVENT, SCHEDULE)
        self.assertEqual(statuses["Moto2"]["Race"]["status_id"], "C")
        self.assertNotIn("MotoGP", statuses)

    def test_restart_supersedes_previous_segment_only(self):
        history = observe({}, live("RAC", "F", "6"), EVENT, SCHEDULE)
        self.assertEqual(history["Moto2"]["Race"]["status_id"], "F")
        history = observe(history, live("RAC2", "S", "7"), EVENT, SCHEDULE)
        self.assertEqual(history["Moto2"]["Race"]["status_id"], "S")
        self.assertEqual(history["Moto2"]["Race"]["session_id"], "7")
        history = observe(history, live("RAC2", "F", "7"), EVENT, SCHEDULE)
        self.assertEqual(history["Moto2"]["Race"]["status_id"], "F")

    def test_wrong_event_or_unmatched_session_ignored(self):
        for data in (
            live(event_name="Completely different Grand Prix"),
            live(category="Moto3"),
            live(shortname="Q2"),
            live(session_id=""),
            live(code="N"),
        ):
            with self.subTest(data=data):
                self.assertEqual(observe({}, data, EVENT, SCHEDULE), {})

    def test_ambiguous_result_session_is_unsafe(self):
        self.assertEqual(observe({}, live(), EVENT, SCHEDULE + [SCHEDULE[0]]), {})
        self.assertEqual(observe({}, live(), EVENT, []), {})

    def test_existing_five_minute_results_refresh(self):
        from_results = mod.refreshed_results_statuses(
            SCHEDULE, "Moto2",
            [{"id": "moto2-results-uuid", "status": "FINISHED"}],
        )
        self.assertEqual(from_results[0]["status"], "FINISHED")
        self.assertEqual(from_results[1]["status"], "NOT-STARTED")
        stale = mod.refreshed_results_statuses(
            from_results, "Moto2",
            [{"id": "moto2-results-uuid", "status": "NOT-STARTED"}],
        )
        self.assertEqual(stale[0]["status"], "FINISHED")
        self.assertEqual(SCHEDULE[0]["status"], "NOT-STARTED")
        self.assertEqual(
            mod.refreshed_results_statuses(SCHEDULE, "Moto2",
                [{"id": "other-event-id", "status": "FINISHED"}])[0]["status"],
            "NOT-STARTED",
        )

    def test_separate_classes(self):
        previous = observe({}, live(), EVENT, SCHEDULE)
        later = observe(previous, live(shortname="RAC", category="MotoGP",
                                       code="F", session_id="8"), EVENT, SCHEDULE)
        self.assertEqual(later["Moto2"]["Race"]["status_id"], "S")
        self.assertEqual(later["MotoGP"]["Race"]["status_id"], "F")
        self.assertEqual(previous["Moto2"]["Race"]["status_id"], "S")


if __name__ == "__main__":
    unittest.main()
