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
live_payload=probe("live timing lite", "/timing-gateway/livetiming-lite")
if isinstance(live_payload,dict):
    head=live_payload.get("head")
    rr=live_payload.get("rider")
    print(f"LIVE HEAD: keys={list(head) if isinstance(head,dict) else type(head).__name__}, status={head.get('session_status_id') if isinstance(head,dict) else '-'}, session={head.get('session_shortname') if isinstance(head,dict) else '-'}, category={head.get('category') if isinstance(head,dict) else '-'}",flush=True)
    sample=next((x for x in rr if isinstance(x,dict)),None) if isinstance(rr,list) else None
    print(f"LIVE RIDER: type={type(rr).__name__}, count={len(rr) if isinstance(rr,list) else '-'}, keys={list(sample) if sample else []}",flush=True)
    if sample:
        print(f"LIVE RIDER IDENTITY: number={sample.get('number')}, rider_id={sample.get('rider_id')}, position={sample.get('position')}, num_lap={sample.get('num_lap')}",flush=True)
if isinstance(broadcast,list):
    print(f"broadcast event count: {len(broadcast)}", flush=True)
if not isinstance(events,list) or not isinstance(categories,list):
    raise SystemExit("Dynamic dependent tests skipped: events/categories unavailable")
gp=next((c for c in categories if isinstance(c,dict) and "motogp" in str(c.get("name","")).lower()),None)
if not gp: raise SystemExit("MotoGP category unavailable")
event=next((e for e in reversed(events) if isinstance(e,dict) and e.get("id") and not e.get("test") and str(e.get("status","")).lower() in ("finished","official","completed")),None) or next((e for e in events if isinstance(e,dict) and e.get("id") and not e.get("test")),None)
if not event: raise SystemExit("Event ID unavailable")
print(f"Selected event: {event.get('sponsored_name') or event.get('name')}, ID={event['id']}, class={gp['id']}",flush=True)
sessions=probe("event sessions", "/results/sessions", {"eventUuid":event["id"],"categoryUuid":gp["id"]})
entry=probe("entry with Results UUID", f"/event/{event['id']}/entry", {"categoryUuid":gp["id"]})
if not isinstance(entry, dict):
    broadcast_uuid=event.get("toad_api_uuid")
    if broadcast_uuid:
        entry=probe("entry with Broadcast UUID + Results category", f"/event/{broadcast_uuid}/entry", {"categoryUuid":gp["id"]})
        bcat=next((c for c in (probe("event broadcast metadata", f"/events/{broadcast_uuid}") or {}).get("categories",[]) if isinstance(c,dict) and "motogp" in str(c.get("name","")).lower()),None)
        if bcat and bcat.get("id"):
            probe("entry with Broadcast event/category UUIDs", f"/event/{broadcast_uuid}/entry", {"categoryUuid":bcat["id"]})
if not isinstance(entry, dict):
    probe("alternate Results event entry", f"/results/event/{event['id']}/entry", {"categoryUuid":gp["id"]})
    probe("alternate category entry", f"/results/event/{event['id']}/category/{gp['id']}/entry")
grid=probe("event grid", f"/results/event/{event['id']}/category/{gp['id']}/grid")
bcategories=probe("broadcast category IDs", "/categories", {"seasonYear":2026})
b_gp=next((x for x in bcategories if isinstance(x,dict) and "motogp" in str(x.get("name","")).lower()),None) if isinstance(bcategories,list) else None
if b_gp:
    teams=probe("broadcast teams for fallback", "/teams", {"categoryUuid":b_gp["id"],"seasonYear":2026})
    if isinstance(teams,list):
        print(f"TEAMS DIAG: teams={len(teams)}, rider_count={sum(len(x.get('riders',[])) for x in teams if isinstance(x,dict) and isinstance(x.get('riders'),list))}, first_keys={list(teams[0])[:18] if teams and isinstance(teams[0],dict) else []}",flush=True)
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
        results=probe("classification",f"/results/session/{sess['id']}/classification",{"test":"false"})
        if not isinstance(results, dict):
            results=probe("classification (no params)",f"/results/session/{sess['id']}/classification")
        if isinstance(results,dict):
            print(f"CLASSIFICATION: classification_type={type(results.get('classification')).__name__}, records_type={type(results.get('records')).__name__}",flush=True)
print("=== Broadcast session ID and rider directory investigation ===",flush=True)
b_uuid=event.get("toad_api_uuid")
b_event=probe("deep broadcast event",f"/events/{b_uuid}") if b_uuid else None
if isinstance(b_event,dict):
    bc=b_event.get("broadcasts")
    print(f"ID CHAIN: results_event={event.get('id')} broadcast_event={b_event.get('id')} timing_id={b_event.get('timing_id')} broadcast_passes={len(bc) if isinstance(bc,list) else '-'}",flush=True)
    if isinstance(bc,list) and bc and isinstance(bc[0],dict):
        print(f"BROADCAST PASS: keys={list(bc[0])[:30]}, category_keys={list(bc[0].get('category',{})) if isinstance(bc[0].get('category'),dict) else []}",flush=True)
if isinstance(sessions,list) and sessions:
    sess=sessions[-1]
    print(f"RESULT SESSION: id={sess.get('id')}, category={sess.get('category')}, event={sess.get('event')}, type={sess.get('type')}",flush=True)
    probe("session details",f"/results/sessions/{sess['id']}")
riders=probe("broadcast rider directory","/riders")
if isinstance(riders,list):
    print(f"RIDER DIR: count={len(riders)}, first_keys={list(riders[0])[:25] if riders and isinstance(riders[0],dict) else []}",flush=True)
    curr=[r for r in riders if isinstance(r,dict) and isinstance(r.get('current_career_step'),dict) and r['current_career_step'].get('season')==2026]
    print(f"RIDER CURRENT 2026: count={len(curr)}, first_step_keys={list(curr[0]['current_career_step'])[:22] if curr else []}",flush=True)
    if curr and curr[0].get('id'):
        probe("single rider profile",f"/riders/{curr[0]['id']}")
if isinstance(grid,list) and grid and isinstance(teams,list):
    gridnums={str(g.get('rider',{}).get('number')) for g in grid if isinstance(g,dict) and isinstance(g.get('rider'),dict)}
    teamrows=[r for t in teams if isinstance(t,dict) for r in t.get('riders',[]) if isinstance(r,dict)]
    teamnums={str(r.get('number')) for r in teamrows if r.get('number') is not None}
    print(f"GRID vs TEAMS: grid_numbers={len(gridnums)} team_numbers={len(teamnums)} overlap={len(gridnums & teamnums)} grid_only={len(gridnums-teamnums)}",flush=True)
if isinstance(grid,list) and grid:
    g=grid[0]
    ri=g.get('rider') if isinstance(g,dict) else None
    print(f"GRID RIDER SHAPE: keys={list(ri)[:30] if isinstance(ri,dict) else type(ri).__name__}, number_sample={repr(ri.get('number')) if isinstance(ri,dict) else '-'}, grid_item_keys={list(g) if isinstance(g,dict) else []}",flush=True)
if isinstance(teams,list) and teams:
    tr=next((r for t in teams if isinstance(t,dict) for r in t.get('riders',[]) if isinstance(r,dict)),None)
    print(f"TEAM RIDER SHAPE: keys={list(tr)[:35] if tr else []}, number_sample={repr(tr.get('number')) if tr else '-'}",flush=True)
if isinstance(riders,list):
    from collections import Counter
    current=[r for r in riders if isinstance(r,dict) and isinstance(r.get('current_career_step'),dict) and r['current_career_step'].get('current') is True]
    print(f"RIDER FILTERS: all={len(riders)}, current_step={len(current)}, in_grid_true={sum(r['current_career_step'].get('in_grid') is True for r in current)}, by_category={dict(Counter(str(r['current_career_step'].get('category',{}).get('name')) for r in current if isinstance(r['current_career_step'].get('category'),dict)))}",flush=True)
    print(f"CURRENT NUMBER SHAPE: first={repr(current[0]['current_career_step'].get('number')) if current else '-'}",flush=True)
print("Diagnostics complete. No raw full JSON or secrets written.",flush=True)
