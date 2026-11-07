# ha-motogp — HACS beta

Independent Home Assistant companion/derived integration based on [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor), unaffiliated with MotoGP or its rights holders.

**Current HACS beta candidate: `2026.11.0b1`.** Strict SOP: `dev → beta → main`. The stable `main` branch remains unchanged pending successful live/on-host beta testing.

## November 2026 — HACS-bundled Next UI

The integration ships the Next JS at `custom_components/motogp_sensor/www/ha-motogp-next.js`. After installation it is served by HA at `/motogp_sensor/ha-motogp-next.js`. This file includes the overview and full-width timing cards. Next version **0.3.0-dev.7** fixes a live-feed freshness badge that could remain on “Uppdateringstid okänd” despite valid backend `live_poll_at`.

The legacy preview `ha-motogp-card.js` is also bundled at `/motogp_sensor/ha-motogp-card.js` but is optional.

HACS upgrades the two JS files and Python integration together. **It does not automatically replace your existing Lovelace resource URL**, avoiding duplicate custom element registration. See [installation and rollback](docs/hacs-beta-installation.md) and [release notes](docs/hacs-beta-release-notes.md).

## Preserved backend behavior

- Red Flag and Delayed sessions retain 5-second active polling.
- Prestart tiers remain 15 seconds around scheduled start, with the later fallback and idle cadences retained.
- Circuit timezone normalization uses IANA metadata and adds `date_utc` for the schedule.
- A permanent observed-lap archive remains under `/config/motogp_data/`.
- `sensor.motogp_rider_positions` exposes `live_poll_at` and `live_poll_interval_seconds`.
- `main` is unaffected; beta needs on-host validation.

Never install a `dev` branch directly in HA. Always upgrade with tagged HACS beta prereleases before considering promotion to `main`.
