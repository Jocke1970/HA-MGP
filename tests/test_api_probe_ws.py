"""Offline tests for the explicit, read-only HA-MGP API explorer."""
from __future__ import annotations
import asyncio
import importlib.util
from pathlib import Path
import sys
import types
import unittest

ROOT = Path(__file__).resolve().parents[1] / "custom_components" / "motogp_sensor"
PACKAGE = "motogp_api_probe_test"


def load():
    package = types.ModuleType(PACKAGE)
    package.__path__ = [str(ROOT)]
    vol = types.ModuleType("voluptuous")
    vol.Required = lambda value, **kwargs: value
    vol.Optional = lambda value, **kwargs: value
    vol.In = lambda choices: choices
    ha = types.ModuleType("homeassistant")
    components = types.ModuleType("homeassistant.components")
    ws = types.ModuleType("homeassistant.components.websocket_api")
    core = types.ModuleType("homeassistant.core")
    ws.ActiveConnection = type("ActiveConnection", (), {})
    ws.websocket_command = lambda schema: (lambda fn: fn)
    ws.async_response = lambda fn: fn
    ws.async_register_command = lambda hass, fn: None
    core.HomeAssistant = type("HomeAssistant", (), {})
    const = types.ModuleType(f"{PACKAGE}.const")
    const.DOMAIN = "motogp_sensor"
    const.LIVE_SOURCE_PULSELIVE = "pulselive"
    api = types.ModuleType(f"{PACKAGE}.api")
    api.MotogpApiError = type("MotogpApiError", (Exception,), {})
    mods = {PACKAGE: package, "voluptuous": vol, "homeassistant": ha,
            "homeassistant.components": components,
            "homeassistant.components.websocket_api": ws, "homeassistant.core": core,
            f"{PACKAGE}.const": const, f"{PACKAGE}.api": api}
    old = {name: sys.modules.get(name) for name in mods}
    sys.modules.update(mods)
    try:
        spec = importlib.util.spec_from_file_location(f"{PACKAGE}.api_probe_ws", ROOT / "api_probe_ws.py")
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)
        return module
    finally:
        for name, previous in old.items():
            if previous is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = previous


WS = load()


class FakeAPI:
    def __init__(self):
        self.calls = []
    async def async_get_live_timing(self, source):
        self.calls.append(("live", source))
        return {"head": {"session_id": "5"}}
    async def async_get_broadcast_event(self, event):
        self.calls.append(("broadcast", event))
        return {"id": event}
    async def async_get_sessions(self, event, category):
        self.calls.append(("sessions", event, category))
        return [{"id": "q2-uuid"}]
    async def async_get_grid(self, event, category):
        self.calls.append(("grid", event, category))
        return []
    async def async_get_classification(self, session):
        self.calls.append(("classification", session))
        return {"classification": []}


class Connection:
    def __init__(self, admin=True):
        self.user = types.SimpleNamespace(is_admin=admin)
        self.error = None
        self.result = None
    def send_error(self, req, code, message):
        self.error = code
    def send_result(self, req, data):
        self.result = data


class ProbeTests(unittest.TestCase):
    def setUp(self):
        self.api = FakeAPI()
        self.co = types.SimpleNamespace(no_spoiler=False, api=self.api,
            live_data={"event_id": "21", "session_id": "5", "category": "Moto2",
                       "session_shortname": "Q2", "session_status_id": "S"},
            static={"next_event": {"id": "event-uuid", "name": "Portugal"},
                    "season": {"id": "season-uuid"},
                    "categories": [{"id": "m2-uuid", "name": "Moto2"}],
                    "schedule_time_zone": "Europe/Lisbon",
                    "weekend_sessions_all": [
                        {"id": "q2-uuid", "category": "Moto2", "category_id": "m2-uuid",
                         "name": "Q2"},
                        {"id": "", "category": "Moto2", "source": "broadcast_schedule",
                         "name": "Race"},
                    ]})
        self.hass = types.SimpleNamespace(data={"motogp_sensor": {"entry": self.co}})
    def call(self, action, category="Moto2", session_uuid="", admin=True):
        conn = Connection(admin)
        asyncio.run(WS.websocket_api_probe(self.hass, conn, {
            "id": 1, "action": action, "category": category, "session_uuid": session_uuid,
        }))
        return conn
    def test_ids_keep_three_identity_domains_separate(self):
        c = self.call("ids")
        self.assertIsNone(c.error)
        d = c.result["data"]
        self.assertEqual((d["event_uuid"], d["live_event_id"], d["live_session_id"]),
                         ("event-uuid", "21", "5"))
        self.assertEqual(d["results_category_uuid"], "m2-uuid")
        self.assertEqual(d["results_sessions"][0]["id"], "q2-uuid")
        self.assertEqual(self.api.calls, [], "ID reading must not generate new requests")
    def test_all_manual_requests_are_scoped(self):
        for action, session in (("live", ""), ("broadcast", ""), ("sessions", ""),
                                ("grid", ""), ("classification", "q2-uuid")):
            self.co._api_probe_last_request = -100
            c = self.call(action, session_uuid=session)
            self.assertIsNone(c.error, action)
        self.assertEqual(self.api.calls, [
            ("live", "pulselive"),
            ("broadcast", "event-uuid"),
            ("sessions", "event-uuid", "m2-uuid"),
            ("grid", "event-uuid", "m2-uuid"),
            ("classification", "q2-uuid"),
        ])
    def test_unauthorized_spoilers_and_unverified_ids_blocked(self):
        self.assertEqual(self.call("live", admin=False).error, "unauthorized")
        self.co.no_spoiler = True
        self.assertEqual(self.call("live").error, "spoiler_mode")
        self.co.no_spoiler = False
        self.assertEqual(self.call("classification", session_uuid="arbitrary-uuid").error,
                         "invalid_session")
        self.assertEqual(self.api.calls, [])


if __name__ == "__main__":
    unittest.main()
