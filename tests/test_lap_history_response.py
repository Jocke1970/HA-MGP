"""Pure projection regressions: never infer or synthesize missing rider laps."""

import importlib.util
import unittest
from pathlib import Path

FILE = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor" / "lap_history_response.py"
spec = importlib.util.spec_from_file_location("motogp_lap_projection", FILE)
assert spec and spec.loader
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class LapProjectionTests(unittest.TestCase):
    def test_exact_recorded_laps_and_missing_numbers(self):
        identity = {"session": "Q2", "session_id": "uuid-q2"}
        data = {
            "riders": {
                "r1": {"name": "BINDER", "number": "33", "laps": {
                    "1": {"lap": 1, "time": "1'51.321", "seconds": 111.321},
                    "3": {"lap": 3, "time": "1'49.111", "seconds": 109.111},
                }},
                "r2": {"name": "SECRET", "number": "55", "laps": {
                    "1": {"seconds": 95.000, "time": "1'35.000"}
                }},
            },
            "coverage": {"partial": True, "missing_laps_by_rider": {"r1": [2]}},
        }
        result = mod.rider_laps_response(data, "r1", identity)
        self.assertEqual([r["lap"] for r in result["laps"]], [1, 3])
        self.assertEqual(result["missing_laps"], [2])
        self.assertEqual(result["best_seconds"], 109.111)
        self.assertNotIn("SECRET", str(result))
        self.assertTrue(result["partial"])
        self.assertEqual(result["session_id"], "uuid-q2")

    def test_empty_missing_and_invalid_readings(self):
        identity = {"session": "FP2", "session_id": "fp2"}
        self.assertEqual(mod.rider_laps_response(None, "99", identity)["laps"], [])
        data = {"riders": {"99": {"laps": {
            "2": {"time": "1'30.000", "seconds": 90},
            "1": {"time": "bad", "seconds": -1},
            "x": {"time": "broken", "seconds": 92},
        }}}, "coverage": {"missing_laps_by_rider": {}}}
        result = mod.rider_laps_response(data, "99", identity)
        self.assertEqual([r["lap"] for r in result["laps"]], [2])
        self.assertEqual(result["missing_laps"], [])
        self.assertFalse(result["partial"])

    def test_no_full_archive_accidentally_returned(self):
        data = {"riders": {"1": {"laps": {str(i): {"seconds": 120, "time": "2'00.000"} for i in range(1, 502)}}}}
        with self.assertRaises(ValueError):
            mod.rider_laps_response(data, "1", {"session": "RAC", "session_id": "id"})


if __name__ == "__main__":
    unittest.main()
