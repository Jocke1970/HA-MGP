"""Offline checks for event-to-event preparation scheduling."""
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from motogp_weekend_preparation import (  # noqa: E402
    next_gp_after_completed_weekend, prep_check_due, entry_list_status
)

UTC = timezone.utc
def dt(day, hour=0):
    return datetime(2027, 3, day, hour, tzinfo=UTC)


class PrepTests(unittest.TestCase):
    def setUp(self):
        self.events = [
            {"kind": "GP", "id": "gp-a", "date_start": "2027-03-05T09:00:00+00:00",
             "date_end": "2027-03-07T18:00:00+00:00"},
            {"kind": "TEST", "id": "test", "date_start": "2027-03-08T09:00:00+00:00",
             "date_end": "2027-03-08T18:00:00+00:00"},
            {"kind": "GP", "id": "gp-b", "date_start": "2027-03-12T09:00:00+00:00",
             "date_end": "2027-03-14T18:00:00+00:00"},
        ]

    def test_advance_only_after_weekend_end(self):
        self.assertIsNone(next_gp_after_completed_weekend(self.events, dt(7, 17)))
        self.assertEqual(next_gp_after_completed_weekend(self.events, dt(7, 19))["id"], "gp-b")
        self.assertIsNone(next_gp_after_completed_weekend(self.events, dt(15)))

    def test_checks(self):
        args=dict(now=dt(10),last_monthly_check=datetime(2027,2,26,tzinfo=UTC),
                  previous_event_end=dt(7,18),last_transition_check=None,
                  next_first_session=dt(12,9),last_preflight_check=None)
        self.assertEqual(prep_check_due(**args), ["monthly","next_weekend"])
        args["now"]=dt(10, 10)
        self.assertEqual(prep_check_due(**args), ["monthly","next_weekend","preflight_48h"])
        args["last_monthly_check"]=dt(10)
        args["last_transition_check"]=dt(8)
        args["last_preflight_check"]=dt(10,10)
        self.assertEqual(prep_check_due(**args), [])
    def test_entries_not_directory_or_mismatched(self):
        self.assertEqual(entry_list_status({"entry":[{"rider_id":"x"}]}, "evt","cat"),"unavailable")
        payload={"event_uuid":"evt","category_uuid":"cat","entry":[{"rider_id":"x"}]}
        self.assertEqual(entry_list_status(payload,"evt","cat"),"provisional")
        self.assertEqual(entry_list_status(payload,"other","cat"),"unavailable")


if __name__ == "__main__":
    unittest.main()
