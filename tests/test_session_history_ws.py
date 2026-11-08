"""Regression for read-only finished-session archive authorization and lap truth."""
from __future__ import annotations

import asyncio
import importlib.util
import sys
import tempfile
import types
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor"
PKG = "motogp_finished_session_tests"


def load():
    package = types.ModuleType(PKG)
    package.__path__ = [str(ROOT)]
    vol = types.ModuleType("voluptuous")
    vol.Required = lambda name: name
    ha = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    core = types.ModuleType("homeassistant.core")
    ws = types.ModuleType("homeassistant.components.websocket_api")
    ws.ActiveConnection = type("ActiveConnection", (), {})
    ws.websocket_command = lambda schema: (lambda fn: fn)
    ws.async_response = lambda fn: fn
    ws.async_register_command = lambda hass, fn: None
    core.HomeAssistant = type("HomeAssistant", (), {})
    mods = {
        PKG: package, "voluptuous": vol, "homeassistant": ha,
        "homeassistant.components": components, "homeassistant.core": core,
        "homeassistant.components.websocket_api": ws,
    }
    old = {k: sys.modules.get(k) for k in mods}
    sys.modules.update(mods)
    try:
        const = types.ModuleType(f"{PKG}.const")
        const.DOMAIN = "motogp_sensor"
        sys.modules[f"{PKG}.const"] = const
        for name in ("session_lap_archive", "session_history_response", "session_history_ws"):
            spec = importlib.util.spec_from_file_location(f"{PKG}.{name}", ROOT / f"{name}.py")
            assert spec and spec.loader
            module = importlib.util.module_from_spec(spec)
            sys.modules[spec.name] = module
            spec.loader.exec_module(module)
        return tuple(sys.modules[f"{PKG}.{name}"] for name in
                     ("session_lap_archive", "session_history_response", "session_history_ws"))
    finally:
        for name, old_value in old.items():
            if old_value is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = old_value


Archive, Summary, Ws = load()


class Connection:
    def __init__(self):
        self.error = None
        self.result = None

    def send_error(self, rid, error, message):
        self.error = error

    def send_result(self, rid, result):
        self.result = result


class FinishedSessionTests(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        archive = Archive.SessionLapArchive(Path(tmp.name) / "motogp_data")
        self.archive = archive
        payload = {
            "season": 2026, "event_id": "qatar-evt", "event_name": "Qatar GP",
            "category": "MotoGP", "championship_id": "3",
            "session_id": "sprint-26", "session_shortname": "SPR",
            "session_status_id": "S", "tv_delay_ready": True,
            "tv_delay_seconds": 0,
            "riders": [
                {"rider_id": "72", "surname": "BEZZECCHI", "number": "72",
                 "last_lap": 1, "last_lap_time": "1'54.500"},
                {"rider_id": "93", "surname": "MARQUEZ", "number": "93",
                 "last_lap": 1, "last_lap_time": "1'53.800"}
            ]
        }
        now = datetime(2026, 11, 7, 16, tzinfo=timezone.utc)
        archive.observe(payload, 2026, now)
        payload["riders"][0]["last_lap"] = 3
        payload["riders"][0]["last_lap_time"] = "1'54.280"
        archive.observe(payload, 2026, now)
        payload["session_status_id"] = "F"
        archive.observe(payload, 2026, now)
        self.session = {"id": "sprint-26", "category": "MotoGP",
                        "name": "Sprint", "status": "FINISHED"}
        self.coordinator = types.SimpleNamespace(
            no_spoiler=False,
            static={"next_event": {"id": "qatar-evt"},
                    "season": {"year": 2026},
                    "weekend_sessions_all": [self.session]},
            _session_lap_archive=archive,
        )
        self.hass = types.SimpleNamespace(data={"motogp_sensor": {"entry": self.coordinator}})
        async def executor(fn):
            return fn()
        self.hass.async_add_executor_job = executor

    def call(self, session_id="sprint-26"):
        connection = Connection()
        asyncio.run(Ws.websocket_session_history(
            self.hass, connection, {"id": 4, "session_id": session_id}))
        return connection

    def test_observed_not_official(self):
        result = self.call()
        self.assertIsNone(result.error)
        self.assertTrue(result.result["available"])
        self.assertEqual(result.result["observed_laps"], 3)
        self.assertTrue(result.result["partial"])
        self.assertEqual([x["name"] for x in result.result["riders"]],
                         ["MARQUEZ", "BEZZECCHI"])
        self.assertEqual(result.result["riders"][1]["missing_laps"], 1)
        self.assertEqual(result.result["riders"][1]["best_time"], "1'54.280")
        self.assertNotIn("position", result.result["riders"][0])
        self.assertNotIn("path", result.result)

    def test_only_explicit_finished_session(self):
        for state in ("NOT-STARTED", "CURRENT", "CANCELLED", "UNKNOWN"):
            self.session["status"] = state
            self.assertEqual(self.call().error, "not_available")
        self.session["status"] = "FINISHED"
        self.assertEqual(self.call("unlisted").error, "not_available")

    def test_spoiler_and_async_race(self):
        self.coordinator.no_spoiler = True
        self.assertEqual(self.call().error, "spoiler_mode")
        self.coordinator.no_spoiler = False
        async def flip(fn):
            data = fn()
            self.coordinator.no_spoiler = True
            return data
        self.hass.async_add_executor_job = flip
        self.assertEqual(self.call().error, "unavailable")

    def test_wrong_event_and_category_do_not_leak(self):
        self.coordinator.static["next_event"]["id"] = "other-event"
        self.assertFalse(self.call().result["available"])
        self.coordinator.static["next_event"]["id"] = "qatar-evt"
        self.session["category"] = "Moto2"
        self.assertFalse(self.call().result["available"])
        self.session["category"] = "MotoGP"
        self.coordinator.static["season"]["year"] = 2027
        self.assertFalse(self.call().result["available"])
        self.hass.data["motogp_sensor"]["duplicate"] = self.coordinator
        self.assertEqual(self.call().error, "unavailable")

    def test_corrupt_summary_rejected(self):
        with self.assertRaises(ValueError):
            Summary.session_history_response({"identity": {}, "riders": {
                "72": {"laps": {str(i): {} for i in range(501)}}}})
        self.assertFalse(Summary.session_history_response(None)["available"])


if __name__ == "__main__":
    unittest.main()
