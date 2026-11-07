# HACS beta installation and rollback — 2026.11.0b1

Keep the existing MotoGP config entry. The integration domain is `motogp_sensor`.

## Upgrade via HACS

1. Back up Home Assistant. Preserve `/config/motogp_data/` and `/config/www/ha-motogp-next.js`.
2. Enable HACS prereleases and install **2026.11.0b1** for the existing MotoGP Sensor integration.
3. Restart Home Assistant to load new Python files and register the HTTP resource paths.
4. Check MotoGP entities. During live data, `sensor.motogp_rider_positions` should expose `live_poll_at` and `live_poll_interval_seconds`.
5. Confirm `/motogp_sensor/ha-motogp-next.js` can be opened via your Home Assistant server.

## Enable the bundled Next frontend

The JS files now come with HACS, but the integration **does not change Lovelace resources**.

In **Settings → Dashboards → Resources**, find your **existing** resource with URL `/local/ha-motogp-next.js`. Change **that same resource URL** to:

```text
/motogp_sensor/ha-motogp-next.js
```

Keep type **JavaScript module**; do not add a duplicate resource or append `?v=` to the URL. If resources are configured via YAML, update the single existing `resources:` entry instead. Reload the dashboard with `Ctrl+Shift+R`.

This release's Next JS identifies as **0.3.0-dev.7**; overview and timing still share one JS resource. `/config/www/ha-motogp-next.js` is left intact for rollback. The optional `/motogp_sensor/ha-motogp-card.js` is the legacy preview only.

## Acceptance and rollback

Check that a valid recent `live_poll_at` immediately yields `● Feed OK · N s` during a live session. Delayed or missing polls should show amber or red states, and invalid/missing timestamps should show `Uppdateringstid okänd`. Confirm session/lap data and spoiler mode still work.

For a UI-only problem, revert the one resource URL to `/local/ha-motogp-next.js` and hard-reload. For backend problems, downgrade HACS to `2026.10.0b5` and restart. Do not remove the MotoGP config entry or run historical Python overlays.
