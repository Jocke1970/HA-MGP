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
