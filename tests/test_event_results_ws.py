"""Verify on-demand Pulselive event results, identity fencing and no spoilers."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import importlib.util
from pathlib import Path
import sys
import types
import unittest

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor"
PKG = "motogp_event_results_test"


def load():
    package = types.ModuleType(PKG)
    package.__path__ = [str(ROOT)]
    vol = types.ModuleType("voluptuous")
    vol.Required = lambda key: key
    ha = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    ws = types.ModuleType("homeassistant.components.websocket_api")
    core = types.ModuleType("homeassistant.core")
    ws.ActiveConnection = type("ActiveConnection", (), {})
    ws.websocket_command = lambda schema: (lambda fn: fn)
    ws.async_response = lambda fn: fn
    ws.async_register_command = lambda hass, fn: None
    core.HomeAssistant = type("HomeAssistant", (), {})
    const = types.ModuleType(f"{PKG}.const")
    const.DOMAIN = "motogp_sensor"
    api = types.ModuleType(f"{PKG}.api")
    api.MotogpApiError = type("MotogpApiError", (Exception,), {})
    helpers = types.ModuleType(f"{PKG}.helpers")
    def parse(raw):
        try:
            return datetime.fromisoformat(str(raw).replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None
    helpers.parse_api_date = parse
    def normalize(raw):
        result = []
        for item in raw:
            result.append({
                "position": item.get("position"),
                "rider": item.get("rider", {}).get("full_name", ""),
                "team": item.get("team", {}).get("name", ""),
                "time": item.get("time", ""),
                "gap": item.get("gap", ""),
                "status": item.get("status", ""),
                "points": item.get("points"),
            })
        return result
    helpers.parse_classification = normalize
    mods = {
        PKG: package, "voluptuous": vol, "homeassistant": ha,
        "homeassistant.components": components,
        "homeassistant.components.websocket_api": ws,
        "homeassistant.core": core,
        f"{PKG}.const": const, f"{PKG}.api": api, f"{PKG}.helpers": helpers,
    }
    old = {key: sys.modules.get(key) for key in mods}
    sys.modules.update(mods)
    try:
        spec = importlib.util.spec_from_file_location(f"{PKG}.event_results_ws", ROOT / "event_results_ws.py")
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        return module
    finally:
        for key, previous in old.items():
            if previous is None:
                sys.modules.pop(key, None)
            else:
                sys.modules[key] = previous


WS = load()


class FakeApi:
    def __init__(self):
        self.sessions_calls = []
        self.classification_calls = []

    async def async_get_sessions(self, eid, cid):
        self.sessions_calls.append((eid, cid))
        return [
            {"id": cid+"-race", "type": "RAC", "status": "OFFICIAL"},
            {"id": cid+"-sprint", "type": "SPR", "status": "FINISHED"},
            {"id": cid+"-q1", "type": "Q", "number": 1, "status": "OFFICIAL"},
            {"id": cid+"-q2", "type": "Q", "number": 2, "status": "OFFICIAL"},
            {"id": cid+"-future", "type": "RAC", "status": "NOT_STARTED"},
        ]

    async def async_get_classification(self, sid):
        self.classification_calls.append(sid)
        leader = sid+"-winner"
        return {"classification": [
            {"position": 1, "rider": {"full_name": leader}, "team": {"name": "Test"},
             "time": "1:30.111" if sid.endswith("q2") else "40:01.000", "points": 25},
            {"position": 2, "rider": {"full_name": "Rider 2"}, "time": "40:02.000"}
        ]}


class Conn:
    def __init__(self):
        self.error = None
        self.result = None
    def send_error(self, rid, code, message):
        self.error = code
    def send_result(self, rid, payload):
        self.result = payload


class Tests(unittest.TestCase):
    def setUp(self):
        self.api = FakeApi()
        self.co = types.SimpleNamespace(api=self.api, no_spoiler=False, static={
            "events": [
                {"id": "past", "date_end": "2025-10-01T22:00:00+00:00"},
                {"id": "future", "date_end": "2090-10-01T22:00:00+00:00"},
            ],
            "categories": [
                {"id": "gp", "name": "MotoGP™"},
                {"id": "m2", "name": "Moto2™"},
                {"id": "m3", "name": "Moto3™"},
            ],
        })
        self.hass = types.SimpleNamespace(data={"motogp_sensor": {"entry": self.co}})

    def call(self, event="past"):
        conn = Conn()
        asyncio.run(WS.websocket_event_results(self.hass, conn, {"id": 7, "event_id": event}))
        return conn

    def test_past_results_per_class_with_pole_from_q2_only(self):
        c = self.call()
        self.assertIsNone(c.error)
        self.assertEqual(c.result["event_id"], "past")
        self.assertEqual(c.result["source"], "pulselive_results")
        self.assertEqual(list(c.result["categories"]), ["MotoGP", "Moto2", "Moto3"])
        self.assertEqual(c.result["categories"]["MotoGP"]["pole"],
                         {"rider": "gp-q2-winner", "time": "1:30.111", "session": "Q2"})
        self.assertEqual(c.result["categories"]["Moto2"]["race"][0]["rider"], "m2-race-winner")
        self.assertTrue(all(not x.endswith(("q1", "future")) for x in self.api.classification_calls))
        self.assertEqual(len(self.api.sessions_calls), 3)
        self.assertEqual(len(self.api.classification_calls), 9)
        again = self.call()
        self.assertIsNone(again.error)
        self.assertEqual(len(self.api.sessions_calls), 3, "in-memory cache avoids repeated requests")

    def test_reject_future_unknown_and_spoiler(self):
        self.assertEqual(self.call("future").error, "not_available")
        self.assertEqual(self.call("missing").error, "not_available")
        self.assertEqual(self.api.sessions_calls, [])
        self.co.no_spoiler = True
        self.assertEqual(self.call().error, "spoiler_mode")
        self.co.no_spoiler = False
        self.hass.data["motogp_sensor"]["other"] = self.co
        self.assertEqual(self.call().error, "unavailable")

    def test_no_q1_as_pole_and_no_unofficial_results(self):
        selected = WS._pick_sessions([
            {"id": "q1", "type": "Q", "number": 1, "status": "Official"},
            {"id": "bad", "type": "RAC", "status": "NOT_STARTED"},
            {"id": "good", "type": "RAC", "status": "Official"},
        ])
        self.assertNotIn("q2", selected)
        self.assertEqual(selected["race"]["id"], "good")
        self.assertNotIn("sprint", selected)

    def test_explicit_event_whitelist_and_result_escape(self):
        self.co.static["events"][0]["test"] = True
        self.assertEqual(self.call().error, "not_available")


if __name__ == "__main__":
    unittest.main()
