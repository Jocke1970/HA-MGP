"""Authenticated on-demand rider lap history for the currently exposed session.

Never adds the archive to HA states/Recorder. Honors the no-spoiler switch,
the coordinator TV-delay gate, and the currently exposed session identity.
"""

from __future__ import annotations

import logging
from functools import partial
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .session_lap_archive import ArchiveError, SpoilerHidden, _identity
from .lap_history_response import rider_laps_response

_LOGGER = logging.getLogger(__name__)
COMMAND = f"{DOMAIN}/rider_laps"


@websocket_api.websocket_command(
    {
        vol.Required("type"): COMMAND,
        vol.Required("rider_id"): str,
    }
)
@websocket_api.async_response
async def websocket_rider_laps(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return only recorded laps for one rider in the currently exposed session."""
    rider_id = msg["rider_id"].strip()
    if not rider_id or len(rider_id) > 128:
        connection.send_error(msg["id"], "invalid_rider", "Invalid rider identifier")
        return

    # A second coordinator must not silently select a different MotoGP session.
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if len(coordinators) != 1:
        connection.send_error(msg["id"], "unavailable", "Expected one active MotoGP integration")
        return
    coordinator = coordinators[0]
    if coordinator.no_spoiler:
        connection.send_error(msg["id"], "spoiler_mode", "Lap history hidden in spoiler mode")
        return
    live = (coordinator.data or {}).get("live")
    if not isinstance(live, dict) or live.get("tv_delay_ready") is not True:
        connection.send_error(msg["id"], "unavailable", "No TV-delayed live snapshot")
        return

    # Never let a client specify arbitrary event/session/file path.
    riders = live.get("riders")
    if not isinstance(riders, list) or not any(
        isinstance(r, dict) and str(r.get("rider_id") or "") == rider_id
        for r in riders
    ):
        connection.send_error(msg["id"], "not_found", "Rider not in exposed session")
        return
    season = coordinator.static.get("season")
    year = season.get("year") if isinstance(season, dict) else None
    try:
        identity = _identity(live, int(year))
    except (ValueError, TypeError):
        identity = None
    if identity is None:
        connection.send_error(msg["id"], "unavailable", "Session identity not verified")
        return

    try:
        archive = await hass.async_add_executor_job(
            partial(coordinator._session_lap_archive.read, identity, no_spoiler=False)
        )
    except (ArchiveError, SpoilerHidden, OSError) as err:
        _LOGGER.warning("MotoGP lap history unavailable: %s", err)
        connection.send_error(msg["id"], "archive_unavailable", "Cannot read lap archive")
        return

    # Recheck both fences after the awaited read. A switched session or newly
    # enabled no-spoiler mode must never expose the previous session's history.
    current = (coordinator.data or {}).get("live")
    current_identity = (
        _identity(current, int(year))
        if isinstance(current, dict) and current.get("tv_delay_ready") is True
        else None
    )
    if coordinator.no_spoiler or current_identity != identity:
        connection.send_error(msg["id"], "unavailable", "Session changed or spoiler enabled")
        return
    try:
        response = rider_laps_response(archive, rider_id, identity)
    except (TypeError, ValueError, KeyError) as err:
        _LOGGER.warning("MotoGP lap history invalid: %s", err)
        connection.send_error(msg["id"], "archive_unavailable", "Invalid lap archive data")
        return
    connection.send_result(msg["id"], response)


def async_register_rider_laps(hass: HomeAssistant) -> None:
    """Register the single read-only websocket command during integration setup."""
    websocket_api.async_register_command(hass, websocket_rider_laps)
