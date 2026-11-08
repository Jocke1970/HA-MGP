# HA-MGP — HACS beta

**HACS beta `2026.11.0b21` · UI `0.3.0-dev.46`.**

Uppdateringen är komplett från b20 och inkluderar befintlig, beständig Pulselive-händelselogg i `/config/motogp_data/api_diagnostics/YYYY-MM-DD.jsonl`.

**Nytt:** `session_started`, `first_lap_started`, `first_position`, `first_gap_reported`, begränsade `gap_updated`, `first_lap_completed`; befintliga events kvar. Observationer kommer från redan TV-delay-godkänd polling utan extra HTTP-anrop eller råa riders-data. UI visar pågående varv inklusive nuvarande och **Sista varvet** när `num_lap == num_laps`, inte målgång förrän officiellt C/F. Efter F/C fortsätter samma sessions polling var 15 s under fyra minuter för att fånga senare korrigeringar.

Helgschema-modal, klassfilter och röd sessionens snabbaste varvtid från b20 består.

**Installera via HACS beta**, starta om Home Assistant mellan pass. Behåll `/config/motogp_data/` och en JS module: `/motogp_sensor/ha-mgp.js`. Rollback b20; main orörd.

[Release notes](docs/hacs-beta-release-notes.md) · [Installation](docs/hacs-beta-installation.md) · [Status](docs/project-status.md).
