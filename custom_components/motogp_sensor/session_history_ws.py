"""Authenticated, read-only historical MotoGP laps for finished weekend sessions."""
from __future__ import annotations

import logging
from functools import partial
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .session_lap_archive import ArchiveError, SpoilerHidden
from .session_history_response import session_history_response

_LOGGER = logging.getLogger(__name__)
COMMAND = f"{DOMAIN}/session_history"


def _approved(coordinator: Any, session_id: str) -> tuple[str, str, int] | None:
    if coordinator.no_spoiler:
        return None
    static = coordinator.static
    event = static.get("next_event")
    season = static.get("season")
    event_id = str(event.get("id") or "") if isinstance(event, dict) else ""
    year = season.get("year") if isinstance(season, dict) else None
    if not event_id or type(year) is not int or not 1900 <= year <= 2100:
        return None
    schedule = static.get("weekend_sessions_all")
    if not isinstance(schedule, list):
        return None
    matches = [
        s for s in schedule if isinstance(s, dict)
        and s.get("id") == session_id
        and str(s.get("status") or "").upper() == "FINISHED"
        and str(s.get("category") or "") in {"MotoGP", "Moto2", "Moto3"}
    ]
    if len(matches) != 1:
        return None
    return event_id, matches[0]["category"], year


@websocket_api.websocket_command({
    vol.Required("type"): COMMAND,
    vol.Required("session_id"): str,
})
@websocket_api.async_response
async def websocket_session_history(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    session_id = str(msg.get("session_id") or "").strip()
    if not session_id or len(session_id) > 128:
        connection.send_error(msg["id"], "invalid_session", "Invalid session ID")
        return
    all_coordinators = list(hass.data.get(DOMAIN, {}).values())
    if len(all_coordinators) != 1:
        connection.send_error(msg["id"], "unavailable", "Expected a single integration")
        return
    coordinator = all_coordinators[0]
    if coordinator.no_spoiler:
        connection.send_error(msg["id"], "spoiler_mode", "History hidden by spoiler mode")
        return
    allowed = _approved(coordinator, session_id)
    if allowed is None:
        connection.send_error(msg["id"], "not_available", "Session not verified FINISHED")
        return
    event_id, category, year = allowed
    try:
        archive = await hass.async_add_executor_job(partial(
            coordinator._session_lap_archive.read_finished_session,
            season=year, event_id=event_id, session_id=session_id,
            category=category, no_spoiler=False,
        ))
    except (ArchiveError, SpoilerHidden, OSError, ValueError, TypeError) as err:
        _LOGGER.warning("MotoGP session history inaccessible: %s", err)
        connection.send_error(msg["id"], "archive_unavailable", "Cannot access archive")
        return
    # The user can toggle spoiler or a new race can become active while the
    # executor reads files. Re-authorize before returning historical data.
    if coordinator.no_spoiler or _approved(coordinator, session_id) != allowed:
        connection.send_error(msg["id"], "unavailable", "Session selection changed")
        return
    try:
        response = session_history_response(archive)
    except (TypeError, ValueError, KeyError) as err:
        _LOGGER.warning("MotoGP historical archive invalid: %s", err)
        connection.send_error(msg["id"], "archive_unavailable", "Invalid archive")
        return
    if response.get("available") and (
        response.get("session_id") != session_id or response.get("category") != category
    ):
        connection.send_error(msg["id"], "archive_unavailable", "Archive identity mismatch")
        return
    connection.send_result(msg["id"], response)


def async_register_session_history(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_session_history)
