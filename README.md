# ha-motogp — HACS beta

Home Assistant companion/derived integration based on [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor). Not affiliated with MotoGP or rights holders.

**Current beta:** `2026.11.0b2` (Next UI `0.3.0-dev.9`). SOP: `dev → beta → main`; `main` remains unchanged.

## MotoGP Next

The integration's Next JavaScript is HACS-managed under `custom_components/motogp_sensor/www/ha-motogp-next.js` and served at the stable URL `/motogp_sensor/ha-motogp-next.js`. No manual JS copying, query-string `?v=` suffixes or duplicate Lovelace resources. See [install / rollback](docs/hacs-beta-installation.md).

New in b2: responsive mobile timing; per-rider authenticated, spoiler-safe on-demand observed-lap popup; class-specific MotoGP/Moto2/Moto3 championship standings behind a top toggle; collapsible LIVE weekend schedule; and a qualifying sidecar distinguishing published grid from provisional order.

The b1 live-feed freshness fix, Red Flag polling, TV delay, schedule timezone correction and session archives remain. Archival files remain under `/config/motogp_data/`.

The beta requires on-host acceptance before considering `main`. Never install directly from `dev`.

See [release notes](docs/hacs-beta-release-notes.md).
