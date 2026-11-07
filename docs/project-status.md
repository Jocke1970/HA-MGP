# MotoGP project status — 2026-11-07

- **dev:** validated b7 candidate, Next `0.3.0-dev.14`, screenshot regression for Qatar Moto2 Q2 → MotoGP Sprint and existing live/next/schedule tests.
- **beta:** HACS prerelease `2026.11.0b7`, to be installed/tested on-host after live racing.
- **main:** unchanged, pending manual acceptance.

## Scope since b4

1. Event top card integrates 21 Apache-2.0-derived schematic track outlines, existing sensor's reported weather, provenance and responsive layout.
2. 3–3–3 staggered grid, with verified Q1 non-transferees correctly assigned P13+ (MotoGP) and P19+ (Moto2/Moto3); never fabricate placements, and reject partial/contradictory public grids.
3. Fixed cross-session timing subtitle: **Nästa: MotoGP Sprint** no longer incorrectly displays a prior **STATUS OKÄND: Moto2 Q2**. Uses **MELLAN PASSEN** or accurately labelled previous-pass rider data; retains safe unmatched start-time handling.
4. Existing high-contrast three-class standings and on-demand rider popup are retained.

## Verification and next steps

Dev CI checks backend, archive, frontend, assembled JS and regressions. The b7 beta release gate additionally tests qualified Q1 projection, the actual bundled JS for header/grid and status, and HACS integrity. Manual Home Assistant inspection remains necessary.

Use existing clean Lovelace resource `/motogp_sensor/ha-motogp-next.js` without `?v=`. Preserve `/config/motogp_data/`. Wait until the current live session ends before updating or restarting HA. The custom MGP brand icon is approved but still uncommitted and not included in b7.
