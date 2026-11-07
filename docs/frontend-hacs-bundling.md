# HACS-bundled MotoGP dashboard cards — dev candidate 2026.11.0b1

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

The Next file is byte-identical to `dist/ha-motogp-next.js` (frontend `0.3.0-dev.7`).
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
`0.3.0-dev.7` renders a green/amber/red/unknown label from `live_poll_at`
**immediately**, and starts/restarts the clock on a subsequent connected render.
The new `tests/frontend-live-freshness.cjs` covers these states plus the
spoiler guard and timer cleanup.

## Release boundary

- **dev:** new, safe read-only package candidate; CI checks Python registration and both bundled JS.
- **beta:** `2026.11.0b1` published after frontend and backend CI passed; awaiting on-host acceptance.
- **main:** unchanged.
- `/config/motogp_data/` and integration entity IDs are untouched.

No automatic resource installation, no legacy patch scripts, no changes to the feed polling or
TV-delay controls.
