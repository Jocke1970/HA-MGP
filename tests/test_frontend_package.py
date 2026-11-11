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
    assert manifest["version"] == "2026.11.0b28"
    assert {"http", "frontend"}.issubset(manifest["dependencies"])

    # Beta is intentionally a minimal HACS tree (without frontend/ or dist/).
    # Lock bundled bytes to reviewed Git blobs in both dev and beta.
    pairs = {
        "ha-mgp.js": (
            "dist/ha-mgp.js",
            None,
        ),
        "ha-motogp-next.js": (
            "dist/ha-motogp-next.js",
            None,  # The current dev build is rebuilt from blob-locked sources and equality-checked below.
        ),
        "ha-motogp-card.js": (
            "frontend/ha-mgp-legacy-card.js",
            "fef8e3e4f09d30f01385d6e8417e96ae923cb65d",
        ),
    }
    for filename, (source, pinned_blob) in pairs.items():
        actual = (ASSETS / filename).read_bytes()
        assert pinned_blob is None or git_blob_sha(actual) == pinned_blob, (
            f"Bundled {filename} does not match its reviewed Git blob"
        )
        source_path = ROOT / source
        if source_path.exists():  # dev has original sources; beta does not.
            assert actual == source_path.read_bytes(), (
                f"Bundled {filename} drifted from {source}"
            )
        assert len(actual) > 1000
        print(f"Bundled {filename}: {len(actual)} bytes, Git blob {git_blob_sha(actual)}")

    assert (ASSETS / "ha-mgp.js").read_bytes() == (ASSETS / "ha-motogp-next.js").read_bytes(), "legacy resource must exactly match canonical HA-MGP JS"
    next_js = (ASSETS / "ha-mgp.js").read_text(encoding="utf-8")
    assert "ha-motogp-next-overview-card" in next_js
    assert "ha-motogp-next-timing-card" in next_js
    assert "0.3.0-dev.62" in next_js
    assert "mgp-timing-header" in next_js, "records must render inside unified timing header"
    assert "header-track-weather-20261110-01" in next_js
    assert "mgp-country-flag" in next_js
    assert "mgp-brand-logo" in next_js
    assert "data:image/webp;base64," in next_js
    assert "__MGP_APPROVED_BRAND_DATA_URI__" not in next_js
    assert "Flagga: " in next_js
    assert "ui-preview-20261108-06" in next_js
    assert "history-20261107-01" in next_js
    assert "motogp_sensor/session_history" in next_js
    assert "data-motogp-history-session" in next_js
    assert "Sorterat efter snabbaste observerade varv" in next_js
    assert "np-standing-track{height:9px;width:100%;box-sizing:border-box" in next_js
    assert "nt-lap-pair" in next_js
    assert "Snabbaste: " in next_js
    assert "riderStart=/<div" in next_js
    assert "header-track-weather-20261110-01" in next_js
    assert "data-mgp-hero-grid" in next_js
    assert "mgp-venue-strip" in next_js
    assert "MELLAN PASSEN" in next_js
    assert "STATUS OKÄND:" not in next_js
    assert "qual-grid-20261107-02" in next_js
    assert "nt-qual-slot-3" in next_js
    assert "qualifying_q1_eliminated" in next_js
    assert "header-track-weather-20261110-01" in next_js
    assert "mgp-venue-strip" in next_js
    assert "mgp-track-svg" in next_js
    assert "Senast rapporterat" in next_js
    assert "GameDev-Toolkit/global-motorsport-circuits-json" in next_js
    assert "np-standing-track" in next_js
    assert "np-standing-rank" in next_js
    assert "np-standing-score" in next_js
    assert "leaderboard=shown.map" in next_js
    assert "Q1 · ej vidare" in next_js
    assert "data-motogp-standings-toggle" in next_js
    assert "standings_by_category" in next_js
    assert "np-standing-color" in next_js
    assert "teamColor(r.team_color)" in next_js
    assert "mgp-rider-flag" in next_js
    assert "mgp-class-mark" in next_js
    assert "mgp-all-mark" in next_js
    assert "mgp-timing-record-chip" in next_js
    assert "ha-motogp-next-overview-card" in next_js
    assert "Championship standings" in next_js
    assert "mgp-season" in next_js
    assert "calendar-20261109-10" in next_js
    assert "api-status-20261108-01" in next_js
    assert "binary_sensor.motogp_live_timing_online" in next_js
    assert "session-dots-20261108-01" in next_js
    assert "timing-icons-20261108-01" in next_js
    assert "active-chip-20261108-02" in next_js
    assert "finish-settling-20261108-01" in next_js
    assert '"es":{' in next_js, "Spanish must be bundled alongside the English fallback"
    assert "records_by_category" in next_js
    assert "data-mgp-schedule-jump" in next_js
    assert "mgp-weekend-inline" in next_js
    assert "data-motogp-schedule-toggle" not in next_js, "Legacy inline schedule must never reappear"
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
    assert "async_register_session_history(hass)" in setup
    # Custom HA 2026.3+ local brands: only the exact approved pair may ship.
    expected_icons = (
        ("icon.png", (256, 256), "18f8fb9a4ff64e079d726a33f2b5176295a2bb2f8ab43fc9688301245e8730f7"),
        ("icon@2x.png", (512, 512), "30cbbaaa530097a47e8c08265ec7415f1e5efd9bbf08cb8dce0ffe8acb7202a5"),
    )
    for name, (width, height), expected_hash in expected_icons:
        png = PKG / "brand" / name
        assert png.is_file() and not png.is_symlink()
        data = png.read_bytes()
        assert data[:8] == b"\x89PNG\r\n\x1a\n"
        assert (int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")) == (width, height)
        assert hashlib.sha256(data).hexdigest() == expected_hash
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
        assert len(paths) == 3
        assert {x.url_path for x in paths} == {
            "/motogp_sensor/ha-mgp.js",
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
