"""Authenticated read-only on-demand MotoGP race results from Pulselive.

Only event UUIDs from the coordinator's current season are accepted.
No arbitrary URL, category UUID, session UUID or filename is client-controlled.
We never store rider lap archives or persist fetched classifications.
"""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone
import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant

from .api import MotogpApiError
from .const import DOMAIN
from .helpers import parse_api_date, parse_classification

_LOGGER = logging.getLogger(__name__)
COMMAND = f"{DOMAIN}/event_results"
_CATEGORIES = ("MotoGP", "Moto2", "Moto3")
_CACHE_SECONDS = 900


def _category_name(value: Any) -> str | None:
    raw = str(value or "").casefold()
    for name in _CATEGORIES:
        if name.casefold() in raw:
            return name
    return None


def _session_kind(session: dict[str, Any]) -> str:
    """Name only explicit races and Q2; never treat Q1 as pole."""
    kind = str(session.get("type") or "").upper().strip()
    short = str(session.get("shortname") or session.get("name") or "").upper().strip()
    number = session.get("number")
    if kind in ("RAC", "RACE") or short in ("RAC", "RACE"):
        return "race"
    if kind == "SPR" or short in ("SPR", "SPRINT"):
        return "sprint"
    if kind == "Q2" or short == "Q2" or (kind == "Q" and str(number) == "2"):
        return "q2"
    # Some seasons have a single qualifying session (not Q2). Do not label
    # it as a Q2 pole without verifying its format.
    return ""


def _official_session(session: dict[str, Any]) -> bool:
    return str(session.get("status") or "").strip().upper() in {
        "OFFICIAL", "FINISHED", "FINAL"
    }


def _pick_sessions(sessions: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    chosen: dict[str, dict[str, Any]] = {}
    for session in sessions:
        if not isinstance(session, dict) or not session.get("id") or not _official_session(session):
            continue
        kind = _session_kind(session)
        if kind and kind not in chosen:
            chosen[kind] = session
    return chosen


def _session_rows(raw: dict[str, Any]) -> list[dict[str, Any]]:
    classification = raw.get("classification") if isinstance(raw, dict) else None
    if not isinstance(classification, list):
        return []
    # The existing helper is used for current race results as well.
    normalized = parse_classification(classification)
    rows: list[dict[str, Any]] = []
    for item in normalized[:40]:
        if not isinstance(item, dict):
            continue
        rows.append({
            "position": item.get("position"),
            "rider": str(item.get("rider") or "")[:100],
            "team": str(item.get("team") or "")[:100],
            "time": str(item.get("time") or "")[:40],
            "gap": str(item.get("gap") or "")[:40],
            "status": str(item.get("status") or "")[:40],
            "points": item.get("points"),
        })
    return rows


async def _fetch_class(api: Any, event_id: str, category_id: str) -> dict[str, Any]:
    try:
        sessions = await api.async_get_sessions(event_id, category_id)
    except MotogpApiError as err:
        _LOGGER.debug("Past event sessions unavailable: %s", err)
        return {"status": "unavailable", "race": [], "sprint": [], "pole": None}
    selected = _pick_sessions(sessions)
    output: dict[str, Any] = {
        "status": "available" if selected else "unavailable",
        "race": [], "sprint": [], "pole": None,
    }
    for kind in ("race", "sprint", "q2"):
        session = selected.get(kind)
        if not session:
            continue
        try:
            response = await api.async_get_classification(str(session["id"]))
        except MotogpApiError as err:
            _LOGGER.debug("Past %s classification unavailable: %s", kind, err)
            continue
        rows = _session_rows(response)
        if kind == "q2":
            # A verified P1 from official Q2, not a separately estimated lap.
            first = next((r for r in rows if str(r["position"]) == "1"), None)
            if first and first.get("time"):
                output["pole"] = {"rider": first["rider"], "time": first["time"], "session": "Q2"}
        else:
            output[kind] = rows
    return output


async def fetch_event_results(coordinator: Any, event_id: str) -> dict[str, Any]:
    """Resolve category UUIDs from the current season; restrict to finished events."""
    event = next(
        (e for e in coordinator.static.get("events", []) if isinstance(e, dict)
         and str(e.get("id") or "") == event_id and not e.get("test")),
        None,
    )
    if event is None:
        raise ValueError("Event not in current season")
    end = parse_api_date(event.get("date_end"))
    if end is None or end.date() >= datetime.now(timezone.utc).date():
        raise ValueError("Event has not finished")
    categories = coordinator.static.get("categories", [])
    category_ids = {
        name: str(category.get("id"))
        for category in categories if isinstance(category, dict)
        for name in [_category_name(category.get("name"))]
        if name and category.get("id")
    }
    result: dict[str, Any] = {"event_id": event_id, "source": "pulselive_results", "categories": {}}
    for name in _CATEGORIES:
        cid = category_ids.get(name)
        if cid:
            result["categories"][name] = await _fetch_class(coordinator.api, event_id, cid)
    return result


@websocket_api.websocket_command({
    vol.Required("type"): COMMAND,
    vol.Required("event_id"): str,
})
@websocket_api.async_response
async def websocket_event_results(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    event_id = msg["event_id"].strip()
    if not event_id or len(event_id) > 128:
        connection.send_error(msg["id"], "invalid_event", "Invalid event identifier")
        return
    coordinators = list(hass.data.get(DOMAIN, {}).values())
    if len(coordinators) != 1:
        connection.send_error(msg["id"], "unavailable", "Expected one active MotoGP integration")
        return
    coordinator = coordinators[0]
    if coordinator.no_spoiler:
        connection.send_error(msg["id"], "spoiler_mode", "Results hidden in spoiler mode")
        return

    # Shared short-lived in-memory cache: no disk persistence or lap archive.
    now = asyncio.get_running_loop().time()
    cache = getattr(coordinator, "_event_results_cache", {})
    if not isinstance(cache, dict):
        cache = {}
    cached = cache.get(event_id)
    if cached and cached[0] > now:
        connection.send_result(msg["id"], cached[1])
        return
    try:
        response = await fetch_event_results(coordinator, event_id)
    except (ValueError, MotogpApiError, TypeError) as err:
        _LOGGER.debug("Event results unavailable: %s", err)
        connection.send_error(msg["id"], "not_available", "Event not available")
        return

    # Recheck access after the network calls, since spoiler mode may change.
    if coordinator.no_spoiler or not any(
        isinstance(e, dict) and str(e.get("id")) == event_id
        for e in coordinator.static.get("events", [])
    ):
        connection.send_error(msg["id"], "unavailable", "Event changed or spoiler enabled")
        return
    cache[event_id] = (now + _CACHE_SECONDS, response)
    # Bound cache to the season, and avoid retaining results for older seasons.
    if len(cache) > 30:
        cache = {event_id: cache[event_id]}
    coordinator._event_results_cache = cache
    connection.send_result(msg["id"], response)


def async_register_event_results(hass: HomeAssistant) -> None:
    """Register read-only WS event results; matches existing lap-history commands."""
    websocket_api.async_register_command(hass, websocket_event_results)
