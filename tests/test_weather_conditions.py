"""Regression tests for Results API weather session matching."""
import importlib.util
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor" / "weather_conditions.py"
SPEC = importlib.util.spec_from_file_location("weather_conditions", PATH)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
select = MODULE.select_session_weather

EVENT = "results-event"
GP = "results-motogp"
M2 = "results-moto2"


def session(kind, *, ident="race", category=GP, event=EVENT, status="FINISHED",
            condition=None, date="2026-11-08T19:00:00+00:00", number=None):
    return {
        "id": ident, "type": kind, "number": number, "date": date,
        "event": {"id": event}, "category": {"id": category},
        "status": status, "condition": condition,
    }


class WeatherSelection(unittest.TestCase):
    def test_exact_race_not_previous_practice(self):
        rows = [
            session("FP", ident="fp1", number=1, condition={"air": "35º"}),
            session("RAC", condition={"air": "31º", "ground": "33º", "weather": "Clear"}),
        ]
        got = select(rows, event_uuid=EVENT, category_uuid=GP, session_shortname="RAC")
        self.assertEqual(got["air"], "31º")
        self.assertEqual(got["source_session"], "RAC")
        self.assertEqual(got["source_session_id"], "race")
        self.assertEqual(got["report_type"], "session_report")
        self.assertIs(got["live_weather_verified"], False)

    def test_missing_exact_session_does_not_fallback(self):
        rows = [session("FP", number=1, condition={"air": "35º"})]
        self.assertIsNone(select(rows, event_uuid=EVENT, category_uuid=GP,
                                 session_shortname="RAC"))

    def test_cannot_mix_category_or_event(self):
        rows = [session("RAC", event="wrong", condition={"air": "90º"}),
                session("RAC", category=M2, condition={"air": "55º"})]
        self.assertIsNone(select(rows, event_uuid=EVENT, category_uuid=GP,
                                 session_shortname="RAC"))

    def test_practice_numbers_remain_distinct(self):
        rows = [session("FP", number=1, ident="fp1", condition={"air": "30º"}),
                session("FP", number=2, ident="fp2", condition={"air": "32º"})]
        self.assertEqual(select(rows, event_uuid=EVENT, category_uuid=GP,
                                session_shortname="FP2")["air"], "32º")

    def test_historical_weather_only_finished(self):
        rows = [session("FP", ident="fp1", number=1,
                        date="2026-11-07T13:00:00+00:00", condition={"air": "34º"}),
                session("RAC", ident="race", status="SCHEDULED",
                        condition={"air": "31º"}),
                session("SPR", ident="sprint", date="2026-11-07T20:00:00+00:00",
                        condition={"air": "30º"})]
        got = select(rows, event_uuid=EVENT, category_uuid=GP)
        self.assertEqual(got["source_session"], "SPR")
        self.assertEqual(got["air"], "30º")

    def test_missing_or_empty_weather_safe(self):
        self.assertIsNone(select([session("RAC", condition={})],
                                 event_uuid=EVENT, category_uuid=GP,
                                 session_shortname="RAC"))
        self.assertIsNone(select(None, event_uuid=EVENT, category_uuid=GP,
                                 session_shortname="RAC"))


if __name__ == "__main__":
    unittest.main()
