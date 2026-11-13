# dev.67 — expanded circuit map click target and safe backdrop dismiss

Follow-up from Home Assistant b31 screenshots, on dev only. No beta/main release.

- In calendar circuit popup and active GP circuit popup, the complete visual map area retains a semantic button target with a full-height hitbox, rather than requiring the user to hit the SVG line or a numbered bend.
- Backdrop clicks use native dialog target plus a bounding-rectangle check to distinguish actual outside click from blank space within the dialog.
- Escape remains supported. Fact tiles, links, race tabs and other dialog content are not generic close targets.
- Contract tests for map hitbox and backdrop geometry added in the two existing frontend tests.
- No backend or network/API changes; render bundle `0.3.0-dev.67` is pinned to source blobs.

QA needed in HACS after a future beta: click gray track line, white space inside the map area, black backdrop, Escape; do not close on facts or links. Mobile and desktop. b31 stays rollback-safe.
