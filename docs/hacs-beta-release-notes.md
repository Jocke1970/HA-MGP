# MotoGP Sensor 2026.11.0b3 — enriched championship standings

**HACS beta / prerelease**, Next frontend **0.3.0-dev.10**. All changes have passed dev CI before promotion; actual Home Assistant acceptance testing is still required.

## Changes since 2026.11.0b2

- Championship tables for **MotoGP, Moto2 and Moto3** now show **position, rider number, rider name, team and points**.
- A thin team-color marker matches the style of live timing. The backend uses the provider's official Broadcast teams metadata, resolving the season and separate Broadcast category UUIDs; colors are matched conservatively by team within a category, never fabricated from a name. Missing, invalid or ambiguous colors appear in neutral grey.
- Mobile standings use compact spacing and retain readable team labels.
- Legacy MotoGP standings sensor retains existing entity IDs and values while adding optional `number`/`team_color` attributes in each relevant normalized standing entry.
- No changes to poll cadence, TV delay, no-spoiler mode, rider-lap archives, or on-demand WebSocket history. The b2 mobile live timing, qualifying sidebar, collapsed schedule and lap popup are preserved.

## Installation and rollback

1. **Do not restart Home Assistant during the sprint or another live session.** Wait for the session to finish.
2. Take a Home Assistant backup. Preserve `/config/motogp_data/` and the existing MotoGP config entry.
3. Install prerelease `2026.11.0b3` using HACS/Marketplace and restart HA after the session.
4. The already registered Next resource stays exactly **`/motogp_sensor/ha-motogp-next.js`**, JavaScript module. Do not add duplicate entries or `?v=` parameters.
5. Reload the dashboard with Ctrl+Shift+R. Confirm Next **0.3.0-dev.10** and verify MotoGP/Moto2/Moto3 rows show correct number, team, points and verified stripe.
6. If anything misbehaves, return to `2026.11.0b2` through HACS/Marketplace, restart after a session and reload the dashboard; retain all archive files.

## Release checks

The release workflow compiles Python, runs weekend, archive, authenticated WebSocket, color/standing normalization regressions, checks the exact packaged Next JS, syntax and mobile/freshness regressions, and only then creates the prerelease tag.

## Planned separately

The approved custom MGP icon (256px and 512px, local `brand/`) is **not yet included** in this prerelease. The artwork is retained as a verified package for a later release; it needs a separate binary-asset upload and integration check. Existing integration artwork is unaffected.

All patches follow `dev → beta → main`; stable `main` is unchanged.
