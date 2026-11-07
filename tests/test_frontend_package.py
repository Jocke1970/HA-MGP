#!/usr/bin/env python3
"""Offline checks: HACS-bundled card bytes, routes, and no auto-resource side effects."""

from __future__ import annotations

import asyncio
import hashlib
import importlib.util
import json
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PKG = ROOT / "custom_components" / "motogp_sensor"
ASSETS = PKG / "www"


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest()


def check_bundle_integrity() -> None:
    manifest = json.loads((PKG / "manifest.json").read_text(encoding="utf-8"))
    assert manifest["version"] == "2026.11.0b2"
    assert {"http", "frontend"}.issubset(manifest["dependencies"])

    # Beta is intentionally a minimal HACS tree (without frontend/ or dist/).
    # Lock bundled bytes to reviewed Git blobs in both dev and beta.
    pairs = {
        "ha-motogp-next.js": (
            "dist/ha-motogp-next.js",
            "f806f06f51e6d15d23d0cb0ec5dbabf2029f4d26",
        ),
        "ha-motogp-card.js": (
            "frontend/ha-motogp-card.js",
            "fef8e3e4f09d30f01385d6e8417e96ae923cb65d",
        ),
    }
    for filename, (source, pinned_blob) in pairs.items():
        actual = (ASSETS / filename).read_bytes()
        assert git_blob_sha(actual) == pinned_blob, (
            f"Bundled {filename} does not match its reviewed Git blob"
        )
        source_path = ROOT / source
        if source_path.exists():  # dev has original sources; beta does not.
            assert actual == source_path.read_bytes(), (
                f"Bundled {filename} drifted from {source}"
            )
        assert len(actual) > 1000
        print(f"Bundled {filename}: {len(actual)} bytes, Git blob {git_blob_sha(actual)}")

    next_js = (ASSETS / "ha-motogp-next.js").read_text(encoding="utf-8")
    assert "ha-motogp-next-overview-card" in next_js
    assert "ha-motogp-next-timing-card" in next_js
    assert "0.3.0-dev.8" in next_js
    assert "motogp_sensor/rider_laps" in next_js
    assert "@container (max-width:620px)" in next_js
    assert "data-motogp-rider-id" in next_js
    assert "data-motogp-laps-close" in next_js
    assert "hass.callService(" not in next_js
    assert "window.location" not in next_js
    assert "const health=feedHealth(age,expected)" in next_js
    assert "if(this.isConnected)ensureAgeTimer(this)" in next_js

    setup = (PKG / "__init__.py").read_text(encoding="utf-8")
    assert "async def async_setup(" in setup
    assert "await async_register_frontend_paths(hass)" in setup
    assert "async_register_rider_laps(hass)" in setup
    assert "lovelace.resources" not in setup


def check_static_registration() -> None:
    fake_ha = types.ModuleType("homeassistant")
    fake_components = types.ModuleType("homeassistant.components")
    fake_http = types.ModuleType("homeassistant.components.http")
    fake_core = types.ModuleType("homeassistant.core")

    class StaticPathConfig:
        def __init__(self, url_path: str, path: str, cache_headers: bool) -> None:
            self.url_path, self.path, self.cache_headers = url_path, path, cache_headers

    fake_http.StaticPathConfig = StaticPathConfig
    fake_core.HomeAssistant = type("HomeAssistant", (), {})
    injected = {
        "homeassistant": fake_ha,
        "homeassistant.components": fake_components,
        "homeassistant.components.http": fake_http,
        "homeassistant.core": fake_core,
    }
    previous = {name: sys.modules.get(name) for name in injected}
    sys.modules.update(injected)
    try:
        spec = importlib.util.spec_from_file_location("motogp_web_assets_test", PKG / "web_assets.py")
        assert spec and spec.loader
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)

        class MockHTTP:
            def __init__(self) -> None:
                self.calls: list[list[StaticPathConfig]] = []

            async def async_register_static_paths(self, paths: list[StaticPathConfig]) -> None:
                self.calls.append(paths)

        http = MockHTTP()
        hass = types.SimpleNamespace(http=http)
        asyncio.run(module.async_register_frontend_paths(hass))
        assert len(http.calls) == 1
        paths = http.calls[0]
        assert len(paths) == 2
        assert {x.url_path for x in paths} == {
            "/motogp_sensor/ha-motogp-next.js",
            "/motogp_sensor/ha-motogp-card.js",
        }
        assert all(Path(x.path).is_file() and not x.cache_headers for x in paths)
        print("Bundled static routes OK; no Lovelace resource is auto-registered")
    finally:
        for name, value in previous.items():
            if value is None:
                sys.modules.pop(name, None)
            else:
                sys.modules[name] = value


if __name__ == "__main__":
    check_bundle_integrity()
    check_static_registration()
    print("MotoGP HACS frontend packaging OK")
