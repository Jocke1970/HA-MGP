# MotoGP status — 2026-11-07

- `dev`: candidate 2026.11.0b4 with Next 0.3.0-dev.11, four green dev CI workflows.
- `beta`: controlled prerelease 2026.11.0b4; on-host acceptance remains pending.
- `main`: unchanged.

## Scope

Premium responsive leaderboard UI for the existing VM-standing cards: subdued podium rank markers, preserved rider number/team and team-color accent, a published-points bar relative to the *currently selected class leader*, explicit total points and the gap to first place. Supports fractional Moto2/Moto3 scores. On narrow cards the bar is hidden, leaving essentials readable.

Backend timing, poll, archive, static standings sources, spoiler guard and existing custom component names are unchanged. HACS Next remains one bundled JavaScript file at `/motogp_sensor/ha-motogp-next.js` (without `?v=`).

## Verification

New frontend tests cover podium ranks, percent bars, category-specific gap calculation, neutral and malicious-color fallbacks, and narrow-card CSS. The beta gate executes the UI regression on JavaScript extracted from the actual HACS-distributed Next bundle, as well as package integrity, backend regression and syntax checks. Manual acceptance in Home Assistant is still required.

MGP brand image files are separately approved but have not yet been committed; b4 intentionally excludes the icon. No promotion to main.
