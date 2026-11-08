# Uppdatera HA-MGP HACS beta b20 → b21

1. Kontrollera att GitHub-prerelease `2026.11.0b21` är publicerad i HACS beta. Installera uppdateringen.
2. Välj ett mellanrum **mellan sessioner** för HA-omstart. Starta inte om under ett race för att undvika förlorade observationer.
3. Behåll `/config/motogp_data/` med JSONL-journal och befintliga sessionsarkiv. Inga entiteter behöver raderas eller omkonfigureras.
4. Använd endast en Lovelace-modul `/motogp_sensor/ha-mgp.js`; uppdatera webbläsaren med `Ctrl+Shift+R`.
5. Bekräfta UI `0.3.0-dev.46`. Under race: aktuellt varv ingår i `kvar`, slutvarvet visas som `Sista varvet`; efter F/C fortsätter uppdatering en kort stund.
6. Kontrollera efter nästa observerade förändring att `/config/motogp_data/api_diagnostics/YYYY-MM-DD.jsonl` innehåller nya eventtyper. Journalen kräver inte att debug-entiteten aktiveras.

Rollback: b20. Main förblir orörd.
