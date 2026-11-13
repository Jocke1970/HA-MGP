"""Offline collector tests: zero calls, precision and no false green."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("pilot",ROOT/"scripts"/"audit_official_circuits.py")
PILOT=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PILOT)

class PilotTest(unittest.TestCase):
    def test_three_circuits_offline(self):
        source=json.loads(PILOT.SOURCES.read_text())
        with tempfile.TemporaryDirectory() as tmp:
            reports=[PILOT.audit(x,fetch=False,cache_dir=Path(tmp)) for x in source["sources"]]
        self.assertEqual(len(reports),3)
        self.assertEqual(sum(x["requests"] for x in reports),0)
        for row in reports:
            self.assertEqual(row["technical_comparison"],"matching")
            self.assertFalse(row["layout_variant_verified"])
            self.assertFalse(row["full_green_status_allowed"])
        self.assertTrue(reports[1]["review_flags"])
        self.assertTrue(reports[2]["review_flags"])

    def test_precision_rounding(self):
        p=PILOT.parse_specs("Circuit Specs\nTotal length\n4.01Km\nTotal Width\n12m\nLongest Straight\n876m\nRight Corners\n5\nLeft Corners\n9")
        self.assertEqual(p["length_m"],4010)
        self.assertEqual(p["length_precision_m"],5)
        self.assertEqual(p["left"],9)

    def test_missing_fields_never_invented(self):
        self.assertEqual(PILOT.parse_specs("Race distance 121.74 km. 4.318km 10 turns."),{})
        self.assertEqual(PILOT.parse_specs("Circuit Specs\nTotal length\n4.35Km"),{"length_m":4350,"length_precision_m":5})

    def test_host_restriction(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                PILOT.live_read("https://example.com/track",Path(tmp))

if __name__=="__main__":
    unittest.main()
