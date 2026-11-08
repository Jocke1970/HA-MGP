# HA-MGP projektstatus — 2026-11-08

**b19-kandidat:** `2026.11.0b19`, UI `0.3.0-dev.40` (oförändrad från publicerad b18). Main oförändrad.

- Ny beständig JSONL-händelsejournal `/config/motogp_data/api_diagnostics/YYYY-MM-DD.jsonl`; endast ändringar i TV-delay-godkänd redan pollad Pulselive-data. Ingen rå rider-payload, ingen extra polling.
- Händelser: feed_online/offline, session_changed, status_changed, first_roster, roster_count_changed, first_lap och lap_count_increased.
- Fristående från Recorder och den som standard inaktiverade debug-sensorn. Journalen lever kvar efter HA-omstart; dock ingen retroaktiv loggning och ingen retention implementerad.
- UI från b18 bevarat: helgschema-modal, Moto3/Moto2/MotoGP, röd förarsnabbaste, kvarvarande observerat sessionssnabbaste efter målflagga.
- Ej med i b19: `/event/.../entry` (HTTP 400); fortsatt separat research kring `/riders`, `/teams`, timing-lite-grid och PyMotoGP:s historiska Analysis-PDF.

**Verifiera i HA efter beta:** journalfil, riktiga sessions-ID:n, första roster och varv, inget brus var tredje sekund och spoilerskydd. Rollback b18.
