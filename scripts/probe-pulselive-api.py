#!/usr/bin/env python3
"""Read-only, rate-limited Pulselive response-shape diagnostic; no credentials or HA."""
import json
import time
import urllib.error
import urllib.parse
import urllib.request

ROOT = "https://api.motogp.pulselive.com/motogp/v1"
HEADERS = {"Accept": "application/json", "User-Agent": "HA-MGP-API-Diagnostics/1.0"}

def probe(title, path, parameters=None):
    if parameters:
        path += "?" + urllib.parse.urlencode(parameters)
    url = ROOT + path
    request = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(request, timeout=14) as response:
            data = json.load(response)
            code = response.status
    except urllib.error.HTTPError as exc:
        print(f"{title}: HTTP {exc.code}; endpoint={path.split('?')[0]}", flush=True)
        return None
    except Exception as exc:
        print(f"{title}: ERROR {type(exc).__name__}: {str(exc)[:120]}", flush=True)
        return None
    items = data if isinstance(data, list) else []
    shape = "list" if isinstance(data, list) else "dict" if isinstance(data, dict) else type(data).__name__
    keys = list(data[0]) if items and isinstance(items[0], dict) else list(data) if isinstance(data, dict) else []
    print(f"{title}: HTTP {code}, shape={shape}, count={len(items) if isinstance(data,list) else '-'}, keys={keys[:26]}", flush=True)
    time.sleep(0.4)
    return data

def choose(items, field, desired):
    if not isinstance(items, list):
        return None
    return next((x for x in items if isinstance(x, dict) and str(x.get(field)) == str(desired)), None)

seasons = probe("seasons", "/results/seasons")
season = choose(seasons, "year", 2026)
if not season:
    raise SystemExit("No current 2026 season: cannot safely continue")
sid=season["id"]
categories=probe("results categories", "/results/categories", {"seasonUuid":sid})
events=probe("results events", "/results/events", {"seasonUuid":sid})
probe("broadcast categories", "/categories", {"seasonYear":2026})
broadcast=probe("broadcast events", "/events", {"seasonYear":2026})
probe("live timing lite", "/timing-gateway/livetiming-lite")
if isinstance(broadcast,list):
    print(f"broadcast event count: {len(broadcast)}", flush=True)
if not isinstance(events,list) or not isinstance(categories,list):
    raise SystemExit("Dynamic dependent tests skipped: events/categories unavailable")
gp=next((c for c in categories if isinstance(c,dict) and "motogp" in str(c.get("name","")).lower()),None)
if not gp: raise SystemExit("MotoGP category unavailable")
event=next((e for e in reversed(events) if isinstance(e,dict) and e.get("id")),None)
if not event: raise SystemExit("Event ID unavailable")
print(f"Selected event: {event.get('sponsored_name') or event.get('name')}, ID={event['id']}, class={gp['id']}",flush=True)
sessions=probe("event sessions", "/results/sessions", {"eventUuid":event["id"],"categoryUuid":gp["id"]})
entry=probe("event entry", f"/event/{event['id']}/entry", {"categoryUuid":gp["id"]})
grid=probe("event grid", f"/results/event/{event['id']}/category/{gp['id']}/grid")
if isinstance(entry,dict):
    entrants=entry.get("entry")
    print(f"ENTRY DIAG: entry_type={type(entrants).__name__},count={len(entrants) if isinstance(entrants,list) else '-'}, first_keys={list(entrants[0]) if isinstance(entrants,list) and entrants and isinstance(entrants[0],dict) else []}",flush=True)
    if isinstance(entrants,list) and entrants:
        row=entrants[0]
        rider=row.get("rider") if isinstance(row,dict) else {}
        print(f"ENTRY FIELD TYPES: number={type(row.get('number')).__name__}, rider={list(rider)[:18] if isinstance(rider,dict) else type(rider).__name__}, team={type(row.get('team')).__name__}",flush=True)
if isinstance(grid,list):
    print(f"GRID DIAG: first_keys={list(grid[0])[:25] if grid and isinstance(grid[0],dict) else []}",flush=True)
if isinstance(sessions,list) and sessions:
    sess=next((x for x in reversed(sessions) if isinstance(x,dict) and x.get("id") and str(x.get("status","")).lower() in ("official","finished")),None)
    if sess:
        results=probe("classification",f"/results/session/{sess['id']}/classification")
        if isinstance(results,dict):
            print(f"CLASSIFICATION: classification_type={type(results.get('classification')).__name__}, records_type={type(results.get('records')).__name__}",flush=True)
print("Diagnostics complete. No raw full JSON or secrets written.",flush=True)
