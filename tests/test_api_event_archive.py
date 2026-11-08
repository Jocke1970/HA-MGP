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

    def test_first_gap_precedes_completed_lap_and_gap_updates_throttled(self):
        with tempfile.TemporaryDirectory() as directory:
            d=tracker.PulseliveDiagnostics()
            j=journal.PulseliveEventArchive(directory)
            t=datetime(2026,11,8,15,0,tzinfo=timezone.utc)
            def sample(lap, gap=None, last="", ready=True, session="race-a"):
                return {
                    "event_id":"event-qatar", "category":"Moto2",
                    "session_id":session, "session_status_id":"S",
                    "tv_delay_ready":ready,
                    "riders":[{"rider_id":11,"position":1,"num_lap":lap,
                               "gap_first":"", "gap_prev":""},
                              {"rider_id":96,"position":2,"num_lap":lap,
                               "gap_first":gap, "gap_prev":gap,
                               "last_lap_time":last}],
                }
            changes=d.observe(sample(1),True,t)
            self.assertIn("first_lap_started",[x["event"] for x in changes])
            self.assertIn("first_position",[x["event"] for x in changes])
            self.assertNotIn("first_lap_completed",[x["event"] for x in changes])
            j.append(changes)
            changes=d.observe(sample(1,"0.594"),True,t+timedelta(seconds=5))
            self.assertIn("first_gap_reported",[x["event"] for x in changes])
            self.assertNotIn("first_lap_completed",[x["event"] for x in changes])
            j.append(changes)
            changes=d.observe(sample(1,"0.665"),True,t+timedelta(seconds=8))
            self.assertTrue(any(x["event"]=="gap_updated" for x in changes))
            j.append(changes)
            changes=d.observe(sample(1,"0.750"),True,t+timedelta(seconds=10))
            self.assertFalse(any(x["event"]=="gap_updated" for x in changes),
                             "gap log limited to one summary per 15 seconds")
            changes=d.observe(sample(2,"0.820","1'59.910"),True,t+timedelta(seconds=25))
            self.assertIn("first_lap_completed",[x["event"] for x in changes])
            self.assertIn("gap_updated",[x["event"] for x in changes])
            j.append(changes)
            saved=[json.loads(x) for x in
                   (Path(directory)/"api_diagnostics"/"2026-11-08.jsonl").read_text().splitlines()]
            names=[x["event"] for x in saved]
            self.assertLess(names.index("first_gap_reported"),
                            names.index("first_lap_completed"))
            self.assertNotIn("0.594",str(saved), "no full raw gap values archived")
            self.assertEqual(d.attributes()["first_lap_started_at"],t.isoformat())
            self.assertEqual(d.attributes()["first_lap_completed_at"],
                             (t+timedelta(seconds=25)).isoformat())

    def test_no_unverified_gap_or_lap_and_session_reset(self):
        d=tracker.PulseliveDiagnostics()
        t=datetime(2026,11,8,15,0,tzinfo=timezone.utc)
        base={"event_id":"event","category":"MotoGP","session_id":"race-a",
              "session_status_id":"S","tv_delay_ready":False,
              "riders":[{"rider_id":1,"position":1,"num_lap":1,
                         "gap_first":"0.250","last_lap_time":"1'52.300"}]}
        changes=d.observe(base,True,t)
        self.assertNotIn("first_gap_reported",[r["event"] for r in changes])
        self.assertIsNone(d.attributes()["first_gap_at"])
        ready=dict(base,tv_delay_ready=True)
        changes=d.observe(ready,True,t+timedelta(seconds=5))
        self.assertIn("first_lap_completed",[r["event"] for r in changes])
        reset=dict(ready,session_id="race-b",riders=[])
        d.observe(reset,True,t+timedelta(minutes=1))
        self.assertIsNone(d.attributes()["first_gap_at"])
        self.assertIsNone(d.attributes()["first_lap_completed_at"])

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
