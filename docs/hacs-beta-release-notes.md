# MotoGP Sensor 2026.11.0b1 — backend + bundled Next UI beta

Combined HACS prerelease with the unchanged field-tested b5 timing backend and the fixed Next frontend. The integration domain remains `motogp_sensor`.

## What is new since 2026.10.0b5

- **Both JS cards ship inside the HACS integration:** `custom_components/motogp_sensor/www/ha-motogp-next.js` and `www/ha-motogp-card.js`. No manual copying to `/config/www`.
- **Read-only UI resource URLs:** `/motogp_sensor/ha-motogp-next.js` (overview + timing together) and `/motogp_sensor/ha-motogp-card.js` (legacy preview). These paths are served by Home Assistant after the integration loads.
- **Next frontend 0.3.0-dev.7:** the live-feed freshness chip renders the correct green, amber, red or unknown status immediately on a card render. Previously it could remain on "Uppdateringstid okänd" because it waited for a timer that had not started on a card already connected to the DOM. The next connected render also restores its one-second timer.
- **Grounded freshness:** the badge uses `sensor.motogp_rider_positions.attributes.live_poll_at` and `live_poll_interval_seconds`, never HA's `last_updated`.
- **Tests:** package integrity and HTTP path registration, front-end syntax, timing badge first render, late attachment, poll interval, delayed/missing feed, spoiler mode and timer teardown.

## Unchanged

- b5 successful live-poll timestamp, R/D and prestart polling, timezone correction, entity names, data source, TV delay and archive structure.
- `/config/motogp_data` and the existing `/config/www/ha-motogp-next.js` remain untouched.
- No duplicate Lovelace resource is automatically registered. **Do not add a second URL defining the same custom elements.**
- Stable `main` is not changed. This is a beta for acceptance testing on HA.

## Installation and controlled UI migration

1. Back up HA, keeping `/config/motogp_data/` and the existing JS under `/config/www/`.
2. Upgrade the existing HACS MotoGP integration to prerelease **2026.11.0b1**, keeping the existing config entry; restart Home Assistant.
3. Confirm that `/motogp_sensor/ha-motogp-next.js` returns JavaScript through your HA address.
4. Go to **Settings → Dashboards → Resources**. **Edit the existing** JavaScript-module resource `/local/ha-motogp-next.js` to `/motogp_sensor/ha-motogp-next.js?v=2026.11.0b1`. Do not create a second Next resource.
5. Reload the dashboard with `Ctrl+Shift+R`; confirm UI `0.3.0-dev.7`, preserved overview/timing, and a meaningful freshness indicator during a live session.
6. Roll back the UI by restoring the old resource URL; roll back the backend by selecting HACS prerelease `2026.10.0b5` and restarting HA.

The bundled legacy JS card is optional and should not be added unless actually needed. A green CI run is not a substitute for an on-host HACS/HA smoke test.
