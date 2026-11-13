# Dev.69 – circuit popup hitbox, source label, next-session countdown

Scoped UI-only correction after the b32 Home Assistant screenshots.

- Circuit facts official-source link: `Official MotoGP-page` (the existing URL remains the official MotoGP race/circuit page; no network calls added).
- Both calendar and current-GP dialogs bind a click listener directly to the **entire rectangular map region**, not only through card click delegation/SVG geometry. The visual map button fills the height, preventing narrow hit targets. Existing backstage/ESC behavior remains.
- `next-countdown` now labels **days, hours, minutes** as `0d 12h 37m till start`, avoiding ambiguous `12:37:50` display. It is still calculated from the existing timestamp, not fetched anew. Sub-minute seconds intentionally hidden.
- Nothing in backend, Pulselive, source-audit or banfakta statuses changed. No beta/main release here; b32 remains available for HA users.
- Regression expectations and pinned UI blobs updated to `0.3.0-dev.69`. HA visual test on desktop/mobile still required before subsequent beta.
