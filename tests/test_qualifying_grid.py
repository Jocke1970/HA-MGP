"""2026 FIM Q1/Q2 grid projection: only validated classification ranks."""

from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

SOURCE = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor" / "qualifying_grid.py"
spec = importlib.util.spec_from_file_location("motogp_q1_projection_test", SOURCE)
assert spec and spec.loader
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def classification(count: int) -> dict:
    return {"classification": [
        {"position": i, "rider": {"number": i + 10, "full_name": f"Rider {i}"},
         "team": {"name": f"Team {i % 2}"}}
        for i in range(1, count + 1)
    ]}


class Q1EliminatedTests(unittest.TestCase):
    def test_motogp_q1_losers_start_at_p13(self):
        rows = module.q1_eliminated_rows(classification(10), "MotoGP")
        self.assertEqual([r["position"] for r in rows], list(range(13, 21)))
        self.assertEqual([r["q1_position"] for r in rows], list(range(3, 11)))
        self.assertEqual(rows[0]["number"], "13")

    def test_moto2_moto3_q1_losers_start_at_p19(self):
        for category in ("Moto2", "Moto3"):
            with self.subTest(category=category):
                rows = module.q1_eliminated_rows(classification(13), category)
                self.assertEqual([r["position"] for r in rows], list(range(19, 28)))
                self.assertEqual([r["q1_position"] for r in rows], list(range(5, 14)))
                self.assertEqual(rows[0]["number"], "15")
                self.assertNotIn(11, [int(r["number"]) for r in rows])

    def test_safe_color_from_matching_rider_team_and_category(self):
        data = classification(6)
        standings = [{"number": 15, "rider": "Rider 5", "team": "Team 1",
                      "team_color": "#AA3344"},
                     {"number": 16, "rider": "Rider 6", "team": "WRONG TEAM",
                      "team_color": "#008800"}]
        rows = module.q1_eliminated_rows(data, "Moto3", standings)
        self.assertEqual(rows[0]["color"], "#AA3344")
        self.assertEqual(rows[1]["color"], "")
        self.assertEqual(rows[1]["position"], 20)

    def test_reject_incomplete_and_inconsistent_q1(self):
        payload = classification(6)
        self.assertEqual(module.q1_eliminated_rows({"classification": []}, "Moto2"), [])
        self.assertEqual(module.q1_eliminated_rows(classification(4), "Moto3"), [])
        self.assertEqual(module.q1_eliminated_rows(payload, "MotoE"), [])
        duplicated = classification(6)
        duplicated["classification"][5]["rider"]["number"] = 13
        self.assertEqual(module.q1_eliminated_rows(duplicated, "Moto2"), [])
        gap = classification(6)
        gap["classification"][4]["position"] = 7
        self.assertEqual(module.q1_eliminated_rows(gap, "Moto2"), [])
        bad = classification(6)
        bad["classification"][3]["rider"]["number"] = None
        self.assertEqual(module.q1_eliminated_rows(bad, "Moto2"), [])

    def test_no_invented_q1_riders_and_no_early_q1_exposure(self):
        # The gate is in coordinator, not here. Verify its on-host structure.
        coordinator = (SOURCE.parent / "coordinator.py").read_text(encoding="utf-8")
        sensor = (SOURCE.parent / "sensor.py").read_text(encoding="utf-8")
        self.assertIn("now >= q2_start", coordinator)
        self.assertIn("not self.no_spoiler", coordinator)
        self.assertIn('q1_sessions[0]["id"]', coordinator)
        self.assertIn("q1_eliminated_rows(", coordinator)
        self.assertIn('attrs["qualifying_q1_eliminated"]', sensor)
        self.assertIn("coordinator.no_spoiler", sensor)


if __name__ == "__main__":
    unittest.main()
