# Uppdatera HA-MGP b19 → b20

**B20:** `2026.11.0b20`, UI `0.3.0-dev.43`. Innehåller alla b19-ändringar.

1. Välj `2026.11.0b20` i HACS beta när prerelease visas. Ingen mellaninstallation eller ominstallation krävs.
2. **Starta om Home Assistant mellan MotoGP-passen**, aldrig mitt under aktiv timing. Skydda `/config/motogp_data/` och den beständiga journalen.
3. Behåll en JS-resurs: `/motogp_sensor/ha-mgp.js` (äldre alias är identiskt). Gör hård omladdning `Ctrl+Shift+R`.
4. Kontrollera att UI visar `0.3.0-dev.43`. Säkerställ att Helgschema enbart öppnas i toppkortets dialog, utan dubblett över timingkortet.
5. Kontrollera att bara sessionens snabbaste observerade varv är rött, att toppchippet visar rätt aktiv session och att loggen får nya händelser efter sessionsväxling.

Loggningen fungerar även om diagnostiksensorn är inaktiverad. **Rollback:** HACS beta `2026.11.0b19`. Radera inte entiteter eller loggfiler.
