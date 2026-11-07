"""Pure standings parser tests: numbers, names, official team colors, no guessing.

Run without Home Assistant or network. The provider keeps the Results and
Broadcast API in different category/ID namespaces, so each category is joined
only to the corresponding Broadcast team's own metadata.
"""
from __future__ import annotations

import importlib.util
import sys
import types
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor"


def load_helpers():
    package = types.ModuleType("motogp_standings_test")
    package.__path__ = [str(ROOT)]
    config = types.ModuleType("motogp_standings_test.const")
    config.SESSION_STATUS_MAP = {}
    names = {"motogp_standings_test": package, "motogp_standings_test.const": config}
    old = {name: sys.modules.get(name) for name in names}
    sys.modules.update(names)
    try:
        spec = importlib.util.spec_from_file_location(
            "motogp_standings_test.helpers", ROOT / "helpers.py"
        )
        assert spec and spec.loader
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    finally:
        for name, previous in old.items():
            if previous is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = previous


helpers = load_helpers()


class StandingsColorTests(unittest.TestCase):
    def test_official_number_team_and_broadcast_rider_uuid(self):
        rows = helpers.parse_standings([
            {
                "position": 1,
                "points": 399,
                "rider": {
                    "full_name": "Marc Marquez",
                    "country": {"iso": "SPA"},
                    "number": 93,
                    "riders_api_uuid": "broadcast-93",
                },
                "team": {"name": "Ducati Lenovo Team", "id": "results-team-id"},
            }
        ])
        self.assertEqual(rows[0]["number"], 93)
        self.assertEqual(rows[0]["nation"], "SPA")
        self.assertEqual(rows[0]["team"], "Ducati Lenovo Team")
        self.assertEqual(rows[0]["rider_api_uuid"], "broadcast-93")
        self.assertEqual(rows[0]["team_color"], "")
        teams = [{
            "id": "broadcast-team-id",
            "name": "Ducati Lenovo Team",
            "color": "#CC0000",
            "riders": [{"id": "broadcast-93"}],
        }]
        enriched = helpers.add_official_standings_colors(rows, teams)
        self.assertEqual(enriched[0]["team_color"], "#CC0000")
        self.assertEqual(enriched[0]["number"], 93)
        self.assertEqual(enriched[0]["nation"], "SPA")
        self.assertEqual(enriched[0]["points"], 399)
        self.assertEqual(rows[0]["team_color"], "", "must not mutate initial standings")

    def test_moto2_moto3_independent_teams(self):
        for category, number, team_name, color in (
            ("Moto2", 18, "SPEEDUP Moto2", "#123ABC"),
            ("Moto3", 28, "Ajo Moto3", "#abc"),
        ):
            with self.subTest(category=category):
                standings = helpers.parse_standings([{
                    "rider": {"number": number, "full_name": "Rider"},
                    "team": {"name": team_name}, "points": 10
                }])
                result = helpers.add_official_standings_colors(
                    standings, [{"name": team_name, "color": color, "riders": []}]
                )
                self.assertEqual(result[0]["team_color"], color)
                self.assertEqual(result[0]["number"], number)

    def test_no_guessed_nation_when_provider_omits_country(self):
        rows = helpers.parse_standings([
            {"rider": {"full_name": "Unknown origin", "number": 9}, "points": 10}
        ])
        self.assertEqual(rows[0]["nation"], "")

    def test_no_color_without_verified_source(self):
        standings = helpers.parse_standings([{
            "position": 1,
            "rider": {"full_name": "No Match", "number": 42},
            "team": {"name": "Unknown Team"}
        }])
        self.assertEqual(
            helpers.add_official_standings_colors(
                standings, [{"name": "Other Team", "color": "#FF0000"}]
            )[0]["team_color"],
            "",
        )

    def test_reject_css_injection_and_ambiguous_teams(self):
        malicious = 'red";background:url(javascript:alert(1))'
        source = [{
            "rider": {"full_name": "Rider", "number": 28},
            "team": {"name": "Example", "color": malicious},
        }]
        rows = helpers.parse_standings(source)
        self.assertEqual(rows[0]["team_color"], "")
        teams = [
            {"name": "Example", "color": "#112233"},
            {"name": "Example", "color": "#445566"},
        ]
        self.assertEqual(
            helpers.add_official_standings_colors(rows, teams)[0]["team_color"],
            "",
        )

    def test_bad_rider_api_mapping_not_accepted_as_different_team(self):
        rows = helpers.parse_standings([{
            "rider": {"full_name": "Rider", "riders_api_uuid": "rid-1"},
            "team": {"name": "New Team"},
        }])
        teams = [{"name": "Old Team", "color": "#123456",
                  "riders": [{"id": "rid-1"}]}]
        self.assertEqual(
            helpers.add_official_standings_colors(rows, teams)[0]["team_color"],
            "",
        )

    def test_api_endpoint_and_category_guards(self):
        api = (ROOT / "api.py").read_text(encoding="utf-8")
        coord = (ROOT / "coordinator.py").read_text(encoding="utf-8")
        self.assertIn("async_get_broadcast_categories", api)
        self.assertIn("async_get_broadcast_teams", api)
        self.assertIn('categoryUuid={category_uuid}', api)
        self.assertIn("by_category[name] = add_official_standings_colors(", coord)
        self.assertIn("verified_categories", coord)
        self.assertIn('self.static["rider_standings_by_category"] = by_category', coord)


if __name__ == "__main__":
    unittest.main()
