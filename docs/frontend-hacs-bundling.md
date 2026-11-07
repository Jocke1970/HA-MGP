# HACS-bundled MotoGP dashboard cards — dev candidate 2026.11.0b3

The MotoGP integration ships its two **ready-to-load** JS resources inside the same HACS package:

```text
custom_components/motogp_sensor/
  __init__.py
  manifest.json
  web_assets.py
  www/
    ha-motogp-next.js       # One self-contained resource: Next Overview + Timing
    ha-motogp-card.js       # Legacy preview card (opt-in only)
```

The Next file is byte-identical to `dist/ha-motogp-next.js` (frontend `0.3.0-dev.11`).
The legacy file is byte-identical to `frontend/ha-motogp-card.js`.
`tests/test_frontend_package.py` enforces these contracts in CI.

## Serving vs. loading

Home Assistant serves the bundled cards at:

- `/motogp_sensor/ha-motogp-next.js`
- `/motogp_sensor/ha-motogp-card.js`

The integration registers these HTTP static paths once during `async_setup` using
`async_register_static_paths`, with non-caching HTTP headers. The Lovelace resource is **not**
automatically added or replaced. Two loaded resources defining the same custom card tag
can conflict and leave a stale build active.

No dashboard resources, cards or existing `/config/www` files are modified by this candidate.
Existing `/local/ha-motogp-next.js` remains the user's live UI until explicit migration.

## Controlled migration after a beta passes CI

1. Update the HACS integration to the tested **beta** (never install `dev`) and restart HA.
2. Open `/motogp_sensor/ha-motogp-next.js` in a browser on the HA host to verify the path.
3. In **Settings → Dashboards → Resources**, edit the **existing** Next resource
   `/local/ha-motogp-next.js` instead of adding a second one.
4. Change only the resource URL to `/motogp_sensor/ha-motogp-next.js`
   and retain type `JavaScript module`.
5. Hard reload the dashboard (Ctrl+Shift+R). Confirm the expected card build identity
   and that overview/timing, no-spoiler mode, live states and session archive work.
6. Leave `/config/www/ha-motogp-next.js` intact for rollback. To roll back the UI, restore
   the previous Lovelace resource URL; do not remove the MotoGP config entry.

For YAML resource mode, edit the single existing `resources:` entry and reload resources.
Do not include both URLs for the same card. The legacy `ha-motogp-card.js` is available
but should not be added unless that original custom card is actually used.

HACS updates the JS **files** along with the integration on future beta/main releases.
Do not append query-string version parameters to bundled JS resources. The stable resource URL remains unchanged across HACS upgrades. Reload the dashboard with Ctrl+Shift+R after updating the integration.
The freshness badge previously rendered a placeholder and depended on a timer
which might not have started on a pre-connected card. The bundled Next
`0.3.0-dev.11` renders a green/amber/red/unknown label from `live_poll_at`
**immediately**, and starts/restarts the clock on a subsequent connected render.
The new `tests/frontend-live-freshness.cjs` covers these states plus the
spoiler guard and timer cleanup.

## Release boundary

- **dev:** new, safe read-only package candidate; CI checks Python registration and both bundled JS.
- **beta:** `2026.11.0b1` published and live freshness confirmed; next mobile-laps work remains dev-only pending beta tests.
- **main:** unchanged.
- `/config/motogp_data/` and integration entity IDs are untouched.

No automatic resource installation, no legacy patch scripts, no changes to the feed polling or
TV-delay controls.

## Next mobile timing and rider lap history (dev candidate)

Next `0.3.0-dev.11` uses a card-width container query: below 620px the table fits four
essential cells (position, rider, lap count, latest lap) without horizontal scrolling.
On desktop the original seven-column display is unchanged.

Touch, click, Enter or Space on a rider row opens a dialog with only verified
recorded laps, their times, and delta versus that rider's best observed time.
The dialog reports gaps by lap number without inventing times. Close with ×,
Escape or tapping the backdrop. No per-rider history is placed in HA state
attributes: an authenticated read-only `motogp_sensor/rider_laps` WebSocket
command loads only the currently exposed TV-delayed session and requested rider.

Spoiler mode blocks both the dialog and the backend read. An in-flight response
is rejected if the active session changes or spoiler is enabled, and the modal
is cleared on session changes or spoiler activation.

This is a `dev`-only candidate; HACS `2026.11.0b1` is unchanged. The next
beta should validate mobile widths ~320–430px and both popup behavior and
backend authorization on the user's HA before any `main` promotion.

## Qualifying, schedule and championship standings (dev candidate)

The Overview displays a **Visa VM-ställning** button by the event header. The full
points tables are hidden until pressed. MotoGP, Moto2 and Moto3 each have
their own classification fetched using their own season-category UUID. If one
API returns no data, that class correctly shows an unavailable message; no
MotoGP points are relabeled as another class. The legacy MotoGP standings
sensor retains its original values, with a new `standings_by_category` attribute.

During a verified live session, **Helgens schema** is collapsed and exposes
**Visa schema / Dölj schema**. Outside live sessions the complete weekend
schedule is shown as before. The button does not issue HA service calls.

The Timing card displays a qualifying side panel for Q1/Q2. When the event's
published grid is valid, it says **Publicerad startgrid**. Otherwise it labels
the current observed live order as **Kvalordning · preliminär**, explicitly
not claiming this is a confirmed grid. The panel is shown alongside timing
on wide cards and below the table on narrower displays. It is hidden in
spoiler mode and outside a matching LIVE qualifying session.

Dev UI is `0.3.0-dev.11`; the next HACS candidate remains
`2026.11.0b3` on dev. No new beta or main release was triggered.

## Championship standings presentation (dev b3 candidate)

The rider standings now display **Position | No. | Rider / team | Points**.
Each driver name has the officially reported team below it and an unobtrusive
team-color stripe, matching the live timing visual language. A missing or
unverified provider color intentionally uses a neutral stripe; colors are never
guessed from constructor or team-name substrings.

Backend continues to fetch MotoGP/Moto2/Moto3 rankings independently. It now
preserves `rider.number` and existing `team.name` from Results standings.
A best-effort six-hour static refresh resolves Broadcast season categories
and team colors via `/categories?seasonYear=YYYY` and
`/teams?categoryUuid=<broadcast_uuid>&seasonYear=YYYY`. The Results and
Broadcast category UUID namespaces differ. Joining is **class-scoped**, based
on the exact normalized team name and, where available, broadcast rider UUID.
Invalid/ambiguous color metadata produces neutral fallback; API errors never
interrupt live timing or standings.

Offline regressions cover rider numbers, team names, all three category
mappings, valid/malicious colors and ambiguous metadata.
`2026.11.0b2` is the last public HACS beta; the next target is
`2026.11.0b3` with Next `0.3.0-dev.11` after acceptance.

## Leaderboard polish (next candidate on dev)

The championship standings retain **position, rider number, name, official team
and points** in all three categories, with a quieter, more balanced visual
hierarchy. Top-three ranks receive restrained podium markers. On wide cards,
the previously unused horizontal area shows a slim color-coded progress rail
representing **points relative to the current category's leader** (not a
championship-winning probability or a projection). The exact published point
value and gap to the current leader appear at the right.

The points rail and leader gap are derived from the *selected category's*
published standings only. Decimal scores are supported, negative/non-finite
values are not plotted, and team-accent CSS continues to accept only safe,
provider-supplied hex colors. Where no verified team color exists, the rail
uses a neutral fallback. A narrow-card container query hides the decorative
rail while keeping all essential text. The table does not invent standings
for missing categories. Both light/dark themes use Home Assistant variables.

Candidate only: `2026.11.0b4` and Next `0.3.0-dev.11` on **dev**.
Public beta `2026.11.0b3` and `main` remain unchanged.

## Integrated circuit header + track weather (next dev candidate)

The Overview event header now includes a two-column circuit-layout and
track-weather strip. It replaces the old independent weather card without
changing the `sensor.motogp_track_weather` entity or its backend poller.
Existing reports supply air temperature, ground/track temperature, humidity,
surface condition and weather description; if metadata contains a category,
session and report timestamp, those are shown as provenance. The card labels
conditions **Senast rapporterat · inte livegaranti**, never an inferred live
reading or forecast. Absent values show neutral placeholders.

21 simplified SVG circuit outlines are bundled directly in the single Next
JS file, with no runtime network or image-service dependency. They are
derived from the Apache-2.0 dataset
[GameDev-Toolkit/global-motorsport-circuits-json](https://github.com/GameDev-Toolkit/global-motorsport-circuits-json);
see `docs/track-layout-attribution.md` and the bundled third-party licence.
All outlines are *schematic*, not guaranteed to include official sector markers
or start/finish. Qatar / Lusail is included. Unknown circuits show an honest
missing-layout message instead of a guessed outline.

Responsive container queries stack track/conditions on mobile and use four
weather chips where width permits. The standings toggle stays in the header,
and its open/closed state is unchanged. UI `0.3.0-dev.12` and backend manifest
`2026.11.0b5` are staged on **dev** only. Public beta b4 and main are unchanged.

## 3–3–3 staggered grid incl. Q1 non-qualifiers (dev)

The qualifying sidecar now renders a compact *in echelon* grid: P1 at
left, P2 indented, P3 further indented, then the pattern repeats P4–P6,
P7–P9 etc. This works next to desktop timing without squashing three full
rider names into 250px and becomes a single staggered grid below mobile
timing. Each starting slot shows position, start number, surname and
verified team color when available.

**Correct 2026 FIM Q1/Q2 positions:**
- MotoGP: Q2 riders occupy P1–P12; Q1 non-transferees from P13.
- Moto2 and Moto3: Q2 riders P1–P18; Q1 non-transferees from P19.

The coordinator reads each category's Q1 results *only after scheduled Q2
begins*. The archive and live session are not guessed or combined; each Q1
position is normalized, validated for unique contiguous ranks/numbers and
mapped to the exact starting position. If the Q1 classification is missing,
incomplete, duplicated or invalid, the tail is omitted with an explicit
explanation, never filled from a different class or guessed. During Q1 itself
the list is labelled **Kvalordning · preliminär**, never a final grid.

A fully published event grid remains authoritative **only if** the returned
positions are complete, unique and consistent with the known Q1 tail. A
partial grid response remains marked provisional. In Q2 provisional mode,
we show the observed Q2 classification plus verified Q1 tail, with a clear
section separator. During race/sprint we render **only** a complete published
grid. Spoiler mode blocks the panel and its Q1 attribute.

Manifest candidate `2026.11.0b6` and Next `0.3.0-dev.13` are staged on
**dev**. Existing beta b4 and main remain unchanged.

## Upcoming pass status isolation (dev)

When the timing card displays **Nästa: MotoGP · Sprint**, the status line
describes the **upcoming** session, not an unrelated earlier class. A prior
unconfirmed session such as Moto2 Q2 does not put `STATUS OKÄND: Moto2 Q2`
under the Sprint title. The neutral status is **MELLAN PASSEN** when no
matching live session is confirmed. Existing last-session rider results remain
clearly marked **SENASTE PASS · EJ LIVE** if present. When a scheduled session
just began but no authenticated matching live session is available, the
existing **STARTTID PASSERAD · INVÄNTAR MATCHANDE DATA** guard is preserved.
No event is assumed started/finished on wall-clock time alone.

Regression covers the specific Qatar Moto2 Q2 -> MotoGP Sprint transition
and the next-day MotoGP Warm Up -> Moto3 Race transition. No change to
backend polling, archive, spoiler semantics or schedule timestamps.

Staged dev `2026.11.0b7` / Next `0.3.0-dev.14`. After all CI gates
pass this candidate can be promoted to HACS beta. Stable main untouched.
