# MotoGP project status — 2026-11-07

- **dev:** `2026.11.0b9`, MotoGP Next `0.3.0-dev.16`; four required GitHub Action suites green before beta promotion.
- **beta:** HACS prerelease `2026.11.0b9`; install and validate on host after live session.
- **main:** unchanged; user acceptance required.

## Since prior released beta b7

1. White unified top hero: Grand Prix title/standings toggle left, reported weather center, right-aligned schematic circuit drawing, container responsive.
2. Per-rider latest lap and fastest lap shown together. A race screenshot revealed that enhanced clickable row tags caused Next UI preview per-rider formatting to be skipped. The row matcher now supports attributes; PB formatting, rider-lap popup and spoiler remain.
3. Added an asynchronous addon-install-order regression, verified against the HACS bundle in the beta-release gate.

## Separate issues / limitations

- **Red Flag**: observed 2026-11-07 MotoGP Sprint sensor remained `session_status_id: N`, poll 30 s, while schedule said CURRENT and archive held observed laps. No polling/backend change in b9; need targeted tests before future fix.
- Public grid numbers can be `null` in source. Remains a known issue to review before claiming every official grid is complete.
- The agreed MGP brand icon was not shipped.
- Circuit drawings are schematic; weather data may legitimately be unavailable during Sprint.

Keep one JS module resource at `/motogp_sensor/ha-motogp-next.js`, no cache query or duplicate resource; preserve `/config/motogp_data/`.
