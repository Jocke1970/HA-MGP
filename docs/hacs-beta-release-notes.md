# HA-MGP 2026.11.0b20 – samlad beta inklusive Pulselive-loggning

**HACS-beta:** `2026.11.0b20`. **Frontend:** `0.3.0-dev.43`.

- Behåller b19:s beständiga JSONL-händelsejournal under `/config/motogp_data/api_diagnostics/`, inklusive första förarlista/varv och sessionsstatus. Ingen extra polling eller rå timingdata.
- Tar bort den gamla parallella Helgschema-panelen som syntes under toppkortet vid aktiv live-timing. Bara toppkortets modal ska finnas.
- Markerar endast sessionens snabbaste observerade varv rött; övrigas personliga bästa visas neutralt. Gröna PB-chip består.
- Förbättrar toppchippets prioritet mellan aktuell matchad session, pågående status med väntande timing och nästa schemalagda pass utan att hitta på LIVE-status.
- Behåller befintliga klassfilter, T−30-startgrid, historik och spoilerskydd.

**Kända begränsningar:** Officiella grafiska klasslogotyper återstår; nuvarande egna SVG-märken är typografiska. Öppen `/event/.../entry` gav HTTP 400 och används inte. Journalen kan inte retroaktivt fylla på äldre sessioner.

**Installation:** HACS beta, HA-omstart endast mellan pass. Behåll `/config/motogp_data/`. En JS module: `/motogp_sensor/ha-mgp.js`. **Rollback:** `2026.11.0b19`. Main orörd.
