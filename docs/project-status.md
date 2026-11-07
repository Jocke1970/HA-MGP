# MotoGP project status — 2026-11-07

## Release track
- `dev`: backend + bundled Next UI candidate tested; source JS `0.3.0-dev.7`.
- `beta`: `2026.11.0b1` HACS prerelease; pending on-host acceptance.
- `main`: unchanged.
- Strict `dev → beta → main`. Never install dev.

## Fixes included
The b5 backend already exposes successful poll timestamps on `sensor.motogp_rider_positions`. Today's real FP2 exposed a separate frontend problem: “Uppdateringstid okänd” persisted despite a valid timestamp and 5-second poll interval. The JS had hard-coded the unknown label at render time, relying on a clock to update later. Next dev.7 fixes this by calculating status during the render and recovering its timer when the timing card is already connected.

The integration now includes read-only JS resources under `custom_components/motogp_sensor/www/`, served as `/motogp_sensor/ha-motogp-next.js` and `/motogp_sensor/ha-motogp-card.js` with `web_assets.py`. It does not change existing Lovelace resources; the resource URL must be edited explicitly to avoid duplicate registration.

## Verification
The verified JS is byte-for-byte identical to reviewed `dev` dist blob `ca30bf00cd3245730983b8491637a868979f1fc3`. A separate lifecycle test checks immediately fresh/delayed/missing indicators, adaptive intervals, invalid timestamps, preconnected-card recovery, spoiler mode and cleanup. Frontend and Next regressions passed on dev. Beta workflow reruns backend/archive tests, JS syntax, package integrity and lifecycle checks before publishing a prerelease.

## On-host acceptance
After HACS beta and HA restart, verify the bundled URL resolves, edit the **existing** Next resource to `/motogp_sensor/ha-motogp-next.js`, reload the browser without any `?v=` suffix, then confirm UI `0.3.0-dev.7` and the freshness badge. Preserve the old `/config/www` JS and `/config/motogp_data` for rollback. Do not promote `main` from CI alone.
