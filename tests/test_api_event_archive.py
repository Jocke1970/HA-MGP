"""Offline regression for append-only Pulselive events and TV-delay handling."""
from datetime import datetime, timedelta, timezone
from pathlib import Path
import importlib.util
import json
import tempfile
import unittest


def load(module):
    path=Path(__file__).resolve().parents[1]/"custom_components"/"motogp_sensor"/(module+".py")
    spec=importlib.util.spec_from_file_location(module,path)
    obj=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(obj)
    return obj


tracker=load("api_diagnostics")
journal=load("api_event_archive")


def payload(*, session="session-1", status="N", laps=0, riders=0, ready=True):
    return {
        "event_id":"test-event", "category":"MotoGP","session_id":session,
        "session_status_id":status,"tv_delay_ready":ready,
        "riders":[{"num_lap":laps} for _ in range(riders)],
    }


class TestEventJournal(unittest.TestCase):
    def test_transitions_are_persistent_and_not_per_poll(self):
        with tempfile.TemporaryDirectory() as directory:
            d=tracker.PulseliveDiagnostics()
            j=journal.PulseliveEventArchive(directory)
            t=datetime(2026,11,8,15,0,tzinfo=timezone.utc)
            self.assertEqual(j.append(d.observe(payload(ready=False,riders=24),True,t)),1)
            entries=d.observe(payload(riders=24),True,t+timedelta(seconds=5))
            self.assertIn("first_roster",[e["event"] for e in entries])
            self.assertEqual(j.append(entries),len(entries))
            t+=timedelta(seconds=10)
            self.assertEqual(d.observe(payload(riders=24),True,t),[])
            t+=timedelta(seconds=10)
            entries=d.observe(payload(status="S",laps=1,riders=24),True,t)
            self.assertIn("first_lap",[e["event"] for e in entries])
            j.append(entries)
            file=Path(directory)/"api_diagnostics"/"2026-11-08.jsonl"
            saved=[json.loads(x) for x in file.read_text().splitlines()]
            self.assertIn("first_lap",[row["event"] for row in saved])
            self.assertNotIn("riders",file.read_text())
            self.assertEqual(saved[-1]["category"],"MotoGP")
            self.assertTrue(all(row["schema_version"]==1 for row in saved))
            j2=journal.PulseliveEventArchive(directory)
            j2.append([{"observed_at":t.isoformat(),"event":"feed_offline","tv_delay_ready":False}])
            self.assertEqual(len(file.read_text().splitlines()),len(saved)+1)

    def test_invalid_event_and_symlink_fail_closed(self):
        with tempfile.TemporaryDirectory() as directory:
            j=journal.PulseliveEventArchive(directory)
            now=datetime.now(timezone.utc).isoformat()
            with self.assertRaises(journal.DiagnosticArchiveError):
                j.append([{"event":"rider_full_payload","observed_at":now}])
            root=Path(directory)/"api_diagnostics"
            root.symlink_to(Path(directory)/"other")
            with self.assertRaises(journal.DiagnosticArchiveError):
                j.append([{"event":"feed_online","observed_at":now}])

    def test_session_switch_resets_and_does_not_invent_timestamps(self):
        d=tracker.PulseliveDiagnostics()
        t=datetime.now(timezone.utc)
        d.observe(payload(status="S",laps=1,riders=26),True,t)
        changes=d.observe(payload(session="session-2",status="N",riders=0),True,t+timedelta(minutes=1))
        self.assertIn("session_changed",[e["event"] for e in changes])
        self.assertIsNone(d.attributes()["first_lap_at"])
        self.assertEqual(d.attributes()["session_id"],"session-2")


if __name__=="__main__":
    unittest.main()
