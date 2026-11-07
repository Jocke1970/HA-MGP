"""WebSocket security regression for MotoGP lap history, running without Home Assistant."""

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


def load_ws():
    pkg_name = "motogp_lap_ws_test"
    pkg = types.ModuleType(pkg_name)
    pkg.__path__ = [str(ROOT)]
    fake_vol = types.ModuleType("voluptuous")
    fake_vol.Required = lambda text: text

    ha = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    core = types.ModuleType("homeassistant.core")
    ws = types.ModuleType("homeassistant.components.websocket_api")
    ws.ActiveConnection = type("ActiveConnection", (), {})
    ws.websocket_command = lambda schema: (lambda fn: fn)
    ws.async_response = lambda fn: fn
    ws.async_register_command = lambda hass, handler: None
    core.HomeAssistant = type("HomeAssistant", (), {})

    injected = {
        pkg_name: pkg,
        "voluptuous": fake_vol,
        "homeassistant": ha,
        "homeassistant.components": components,
        "homeassistant.core": core,
        "homeassistant.components.websocket_api": ws,
    }
    orig = {key: sys.modules.get(key) for key in injected}
    sys.modules.update(injected)
    try:
        for name in ("const", "session_lap_archive", "lap_history_response", "lap_history_ws"):
            if name == "const":
                fake_const = types.ModuleType(f"{pkg_name}.const")
                fake_const.DOMAIN = "motogp_sensor"
                sys.modules[f"{pkg_name}.const"] = fake_const
                continue
            spec = importlib.util.spec_from_file_location(f"{pkg_name}.{name}", ROOT / f"{name}.py")
            assert spec and spec.loader
            mod = importlib.util.module_from_spec(spec)
            sys.modules[spec.name] = mod
            spec.loader.exec_module(mod)
        return (sys.modules[f"{pkg_name}.lap_history_ws"],
                sys.modules[f"{pkg_name}.session_lap_archive"])
    finally:
        for key, value in orig.items():
            if value is None:
                sys.modules.pop(key, None)
            else:
                sys.modules[key] = value


ws, archive_module = load_ws()


class Conn:
    def __init__(self):
        self.result = None
        self.error = None

    def send_result(self, req_id, result):
        self.result = result

    def send_error(self, req_id, code, description):
        self.error = code


class Case(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        archive = archive_module.SessionLapArchive(Path(tmp.name) / "laps")
        self.live = dict(event_id="evt", event_name="Test", category="MotoGP",
                         championship_id="3", session_id="s1", session_shortname="Q2",
                         session_status_id="S", tv_delay_ready=True, tv_delay_seconds=15,
                         riders=[{"rider_id": "r1", "surname": "BINDER", "number": 33,
                                  "last_lap": 1, "last_lap_time": "1'45.000"}])
        archive.observe(self.live, 2026, datetime(2026, 11, 7, 11, tzinfo=timezone.utc))
        self.coordinator = types.SimpleNamespace(
            no_spoiler=False,
            data={"live": self.live},
            static={"season": {"year": 2026}},
            _session_lap_archive=archive,
        )
        self.hass = types.SimpleNamespace(data={"motogp_sensor": {"entry": self.coordinator}})

        async def job(fn):
            return fn()
        self.hass.async_add_executor_job = job

    def call(self, rider_id="r1"):
        connection = Conn()
        asyncio.run(ws.websocket_rider_laps(
            self.hass, connection, {"id": 2, "rider_id": rider_id}
        ))
        return connection

    def test_only_observed_current_rider(self):
        c = self.call()
        self.assertIsNone(c.error)
        self.assertEqual([r["lap"] for r in c.result["laps"]], [1])
        self.assertEqual(c.result["name"], "BINDER")
        self.assertNotIn("riders", c.result)

    def test_spoiler_denies(self):
        self.coordinator.no_spoiler = True
        self.assertEqual(self.call().error, "spoiler_mode")

    def test_missing_rider_and_invalid_live(self):
        self.assertEqual(self.call("different").error, "not_found")
        self.live["tv_delay_ready"] = False
        self.assertEqual(self.call().error, "unavailable")

    def test_spoiler_toggled_while_read_pending(self):
        async def job(fn):
            data = fn()
            self.coordinator.no_spoiler = True
            return data
        self.hass.async_add_executor_job = job
        c = self.call()
        self.assertEqual(c.error, "unavailable")
        self.assertIsNone(c.result)

    def test_session_changes_while_read_pending(self):
        async def job(fn):
            data = fn()
            self.coordinator.data["live"] = {**self.live, "session_id": "s2"}
            return data
        self.hass.async_add_executor_job = job
        c = self.call()
        self.assertEqual(c.error, "unavailable")
        self.assertIsNone(c.result)

    def test_refuse_ambiguous_instances(self):
        self.hass.data["motogp_sensor"]["second"] = self.coordinator
        self.assertEqual(self.call().error, "unavailable")


if __name__ == "__main__":
    unittest.main()
