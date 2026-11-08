# HA-MGP — HACS beta

**HACS-beta: `2026.11.0b19` · Frontend: `0.3.0-dev.40` (oförändrad från b18).**

Nyhet: beständig, append-only Pulselive-händelselogg under `/config/motogp_data/api_diagnostics/YYYY-MM-DD.jsonl`. Loggar endast förändringar (feed, session, status, första förarlista och första varv) från redan pollad TV-fördröjd data. Inga extra API-anrop eller råa förarlistor. Loggningen fungerar även när diagnostiksensorn är inaktiverad.

Tidigare b18-funktioner (helgschema i dialog, klassknappar, röd snabbaste tid, kvarvarande sessionssnabbaste efter målflagga) behålls. Installera via HACS-beta, inte dev. JS module: `/motogp_sensor/ha-mgp.js` (endast en resurs). Återgång: `2026.11.0b18`. Main orörd.

[Installation](docs/hacs-beta-installation.md) · [Release notes](docs/hacs-beta-release-notes.md) · [Status](docs/project-status.md).
