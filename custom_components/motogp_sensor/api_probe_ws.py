"""Read-only, admin-only on-demand API explorer for the active GP weekend.

A fixed allowlist of existing MotogpApiClient methods is used. Frontend
never supplies a URL or arbitrary event/category/session ID to the API.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import json
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .api import MotogpApiError
from .const import DOMAIN, LIVE_SOURCE_PULSELIVE

COMMAND = f"{DOMAIN}/api_probe"
ACTIONS = ("ids", "live", "broadcast", "sessions", "grid", "classification")
CATEGORIES = ("MotoGP", "Moto2", "Moto3")
MAX_JSON_CHARS = 250_000


def _category_id(coordinator: Any, category: str) -> str | None:
    for row in coordinator.static.get("categories", []):
        if isinstance(row, dict) and category.casefold() in str(row.get("name") or "").casefold():
            return str(row["id"]) if row.get("id") else None
    return None


def _context(coordinator: Any, category: str) -> dict[str, Any]:
    event = coordinator.static.get("next_event") or {}
    season = coordinator.static.get("season") or {}
    live = coordinator.live_data or {}
    sessions = coordinator.static.get("weekend_sessions_all") or []
    allowed = [
        {"id": str(row.get("id")), "name": row.get("name"),
         "date": row.get("date"), "status": row.get("status")}
        for row in sessions
        if isinstance(row, dict) and row.get("id") and row.get("category") == category
        and row.get("category_id") and row.get("source") != "broadcast_schedule"
    ]
    return {
        "season_id": season.get("id"),
        "event_uuid": event.get("id"),
        "event_name": event.get("name") or event.get("sponsored_name"),
        "category": category,
        "results_category_uuid": _category_id(coordinator, category),
        "live_event_id": live.get("event_id"),
        "live_category": live.get("category"),
        "live_session_id": live.get("session_id"),
        "live_session": live.get("session_shortname"),
        "live_status": live.get("session_status_id"),
        "results_sessions": allowed,
        "time_zone": coordinator.static.get("schedule_time_zone"),
        "note": "Live event/session IDs are not Results UUIDs; Broadcast session IDs are also separate.",
    }


@websocket_api.websocket_command({
    vol.Required("type"): COMMAND,
    vol.Required("action"): vol.In(ACTIONS),
    vol.Optional("category", default="MotoGP"): vol.In(CATEGORIES),
    vol.Optional("session_uuid", default=""): str,
})
@websocket_api.async_response
async def websocket_api_probe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    if not connection.user.is_admin:
        connection.send_error(msg["id"], "unauthorized", "Administrator only")
        return
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if len(coordinators) != 1:
        connection.send_error(msg["id"], "unavailable", "Expected one active HA-MGP integration")
        return
    coordinator = coordinators[0]
    if coordinator.no_spoiler:
        connection.send_error(msg["id"], "spoiler_mode", "API explorer disabled in No Spoiler mode")
        return
    action = msg["action"]
    category = msg["category"]
    context = _context(coordinator, category)
    if not context["event_uuid"]:
        connection.send_error(msg["id"], "unavailable", "No current GP event")
        return
    session_id = str(msg["session_uuid"]).strip()
    if action == "classification" and session_id not in {
        row["id"] for row in context["results_sessions"]
    }:
        connection.send_error(msg["id"], "invalid_session", "Select a verified Results session UUID")
        return
    if action in ("sessions", "grid") and not context["results_category_uuid"]:
        connection.send_error(msg["id"], "unavailable", "No verified Results category UUID")
        return

    # Manual requests only. No continuous polling, file writes or API proxying.
    if action != "ids":
        now = asyncio.get_running_loop().time()
        last = getattr(coordinator, "_api_probe_last_request", 0.0)
        if now - last < 1.5:
            connection.send_error(msg["id"], "rate_limit", "Wait briefly between API requests")
            return
        coordinator._api_probe_last_request = now
    try:
        if action == "ids":
            data = context
        elif action == "live":
            data = await coordinator.api.async_get_live_timing(LIVE_SOURCE_PULSELIVE)
        elif action == "broadcast":
            data = await coordinator.api.async_get_broadcast_event(context["event_uuid"])
        elif action == "sessions":
            data = await coordinator.api.async_get_sessions(
                context["event_uuid"], context["results_category_uuid"]
            )
        elif action == "grid":
            data = await coordinator.api.async_get_grid(
                context["event_uuid"], context["results_category_uuid"]
            )
        else:
            data = await coordinator.api.async_get_classification(session_id)
    except (MotogpApiError, ValueError, TypeError, asyncio.TimeoutError) as err:
        connection.send_error(msg["id"], "api_unavailable", str(err)[:250])
        return
    if coordinator.no_spoiler or context["event_uuid"] != str(
        (coordinator.static.get("next_event") or {}).get("id") or ""
    ):
        connection.send_error(msg["id"], "stale", "GP changed or No Spoiler enabled")
        return
    # Avoid flooding HA's WebSocket with a large payload.
    if len(json.dumps(data, ensure_ascii=False, default=str)) > MAX_JSON_CHARS:
        connection.send_error(msg["id"], "large_response", "Response exceeds 250,000 characters")
        return
    connection.send_result(msg["id"], {
        "action": action,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "context": context,
        "data": data,
    })


def async_register_api_probe(hass: HomeAssistant) -> None:
    websocket_api.async_register_command(hass, websocket_api_probe)
