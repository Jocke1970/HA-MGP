# HA-MGP b30 – installation och test

1. Ta en Home Assistant-backup. Behåll `/config/motogp_data/` och dina sessionsarkiv.
2. Installera **`2026.11.0b30`** via HACS beta när prereleasen publicerats; installera aldrig `dev` på HA.
3. Starta om Home Assistant **mellan sessioner**, sedan hård omladdning (`Ctrl+Shift+R`).
4. Kontrollera UI-version **`0.3.0-dev.64`** och att en enda Lovelace-resurs `/motogp_sensor/ha-mgp.js` finns.
5. Öppna banpopupen från GP-rubriken och kalendern: kontrollera att båda ligger lagom långt ned, att Stäng alltid syns, att bilden har rätt skala och att fakta fortfarande visas.
6. Under nästa tävlingshelg: kontrollera livetiming, klassbyte, helgschema, spoilerläge och övergång till nästa GP. Inga nya API-anrop ska skapas.
7. Vid problem: gå tillbaka till **b29** via HACS, utan att ta bort arkiv eller entiteter.

Ingen main-release före praktisk utvärdering och godkännande.
