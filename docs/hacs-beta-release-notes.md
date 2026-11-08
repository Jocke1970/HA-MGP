# HA-MGP 2026.11.0b19 — beständig Pulselive-diagnostik

**Beta:** `2026.11.0b19` · **UI:** `0.3.0-dev.40` (samma frontend som b18).

- Beständig append-only JSONL-journal i `/config/motogp_data/api_diagnostics/YYYY-MM-DD.jsonl`.
- Registrerar feed_online/offline, session_changed, status_changed, first_roster, roster_count_changed, first_lap och lap_count_increased.
- Endast ändringar från befintlig TV-delay-godkänd data. Inga nya API-anrop, ingen rå förardump. Filskrivning via HA-executor.
- Journalen fungerar även om `Pulselive API debug` är inaktiverad; entiteten är fortsatt opt-in för Recorder.
- UI och befintlig b18-backend i övrigt oförändrade. `/event/.../entry` används inte (HTTP 400 vid tidigare test).

**Begränsningar:** Endast framtida observationer från när b19 startats; tiden är HA:s observationstid, inte officiell bantid. Omstart kan ge ny first_seen för pågående session. Ingen automatisk gallring ännu.

Installera via HACS-beta och starta om HA **mellan pass**, aldrig under aktivt race. Rollback `2026.11.0b18`; `main` förblir orörd.
