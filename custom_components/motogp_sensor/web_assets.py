"""Serve bundled MotoGP JS cards from this integration's HACS-managed directory.

The resource URL is opt-in: do not auto-register the same custom elements
already loaded by an existing /local/ Lovelace resource.
"""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

ASSETS_DIR = Path(__file__).parent / "www"
RESOURCE_PREFIX = "/motogp_sensor"
RESOURCE_FILES = ("ha-mgp.js", "ha-motogp-next.js", "ha-motogp-card.js")


async def async_register_frontend_paths(hass: HomeAssistant) -> None:
    """Expose JS resources exactly once; preserve existing Lovelace settings."""
    try:
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(
                    f"{RESOURCE_PREFIX}/{name}",
                    str(ASSETS_DIR / name),
                    False,  # Versioned Lovelace URL handles browser caching.
                )
                for name in RESOURCE_FILES
            ]
        )
    except (OSError, RuntimeError) as err:
        # A frontend routing failure must not take the live timing backend down.
        _LOGGER.error("Unable to serve bundled MotoGP cards: %s", err)
