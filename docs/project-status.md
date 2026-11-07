# MotoGP status — 2026-11-07

## Release track

- `dev`: latest candidate `2026.11.0b2`, Next `0.3.0-dev.9`, including corrected WebSocket import.
- `beta`: `2026.11.0b2` HACS prerelease, pending on-host acceptance.
- `main`: unchanged.

## Features in this beta

1. Mobile (<620px) condensed four-column timing, desktop unmodified.
2. Rider-row popups with only observed archive laps, PB/difference, explicit holes and no invented times.
3. Authenticated WebSocket history endpoint restricted to the currently exposed TV-delayed session and guarded by no-spoiler both before and after loading.
4. Moto3/Moto2/MotoGP distinct standings via the official category UUIDs, with legacy MotoGP entity kept compatible.
5. A top **Visa VM-ställning** control, LIVE **Visa schema**, and qualifying grid companion labelled as either published grid or provisional order.
6. HACS-served Next JS uses the clean URL `/motogp_sensor/ha-motogp-next.js` **without `?v=`**.

## Safety and validation

The b2 pre-release review found and fixed a startup-blocking typo: `import probatio` instead of Home Assistant's `import voluptuous`. CI now has explicit guards against that regression. Three dev workflow families passed; beta publishing independently runs weekend/archive regression, WebSocket projection/security tests, frontend lifecycle/mobile regression and HACS integrity checks.

No automatic resource registration, no direct HA service calls from frontend, no generated lap times, no new config entries, and no changes to `main`.

## On-host acceptance

Update via HACS, restart after the current racing session, leave the existing Next JS resource URL unchanged if already using the HACS path. Confirm version `0.3.0-dev.9`, test driver-popup on mobile, class-specific VM standings and qualifying/grid labeling. Preserve `/config/motogp_data/`. Roll back via `2026.11.0b1` without deleting the integration.
