"""Offline regression tests for passive Pulselive telemetry."""
from datetime import datetime, timedelta, timezone
from pathlib import Path
import importlib.util
import unittest

source = Path(__file__).resolve().parents[1] / "custom_components/motogp_sensor/api_diagnostics.py"
spec = importlib.util.spec_from_file_location("api_diagnostics", source)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


def sample(*, session="session-a", status="N", riders=(), ready=True):
    return {
        "event_id": "event-a", "category": "Moto3", "session_id": session,
        "session_status_id": status, "tv_delay_ready": ready,
        "riders": list(riders),
    }


class TestPulseliveDiagnostics(unittest.TestCase):
    def test_session_roster_first_lap_and_stable_recorder_state(self):
        d = mod.PulseliveDiagnostics()
        t = datetime(2026, 11, 8, 12, 0, tzinfo=timezone.utc)
        d.observe(sample(status="N"), True, t)
        self.assertEqual(d.attributes()["session_first_seen_at"], t.isoformat())
        self.assertIsNone(d.attributes()["first_roster_at"])
        d.observe(sample(status="S", riders=[{"num_lap": 0}]), True, t + timedelta(seconds=5))
        self.assertEqual(d.attributes()["rider_count"], 1)
        self.assertIsNone(d.attributes()["first_lap_at"])
        lap_time = t + timedelta(seconds=10)
        d.observe(sample(status="S", riders=[{"num_lap": 1}]), True, lap_time)
        self.assertEqual(d.attributes()["first_lap_at"], lap_time.isoformat())
        state = d.state()
        attrs = d.attributes()
        d.observe(sample(status="S", riders=[{"num_lap": 1}]), True, lap_time + timedelta(seconds=5))
        self.assertEqual(d.state(), state)
        self.assertEqual(d.attributes(), attrs)

    def test_unready_data_does_not_leak(self):
        d = mod.PulseliveDiagnostics()
        t = datetime(2026, 11, 8, tzinfo=timezone.utc)
        d.observe(sample(status="S", riders=[{"num_lap": 6}], ready=False), True, t)
        self.assertIsNone(d.attributes()["session_id"])
        self.assertIsNone(d.attributes()["first_lap_at"])

    def test_new_session_resets_roster_and_lap_baseline(self):
        d = mod.PulseliveDiagnostics()
        t = datetime(2026, 11, 8, tzinfo=timezone.utc)
        d.observe(sample(status="S", riders=[{"num_lap": 2}]), True, t)
        d.observe(sample(session="session-b", status="N"), True, t + timedelta(minutes=2))
        self.assertEqual(d.attributes()["session_id"], "session-b")
        self.assertIsNone(d.attributes()["first_lap_at"])
        self.assertEqual(d.attributes()["rider_count"], 0)

    def test_unknown_identity_cannot_associate_roster(self):
        d = mod.PulseliveDiagnostics()
        t = datetime(2026, 11, 8, tzinfo=timezone.utc)
        row = sample(status="S", riders=[{"num_lap": 3}])
        row["session_id"] = ""
        d.observe(row, True, t)
        self.assertEqual(d.state(), "feed_online")
        self.assertIsNone(d.attributes()["first_roster_at"])


if __name__ == "__main__":
    unittest.main()
