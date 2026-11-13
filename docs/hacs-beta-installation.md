# HA-MGP b31 – HACS-beta-test

1. Säkerhetskopiera Home Assistant och behåll `/config/motogp_data/` samt tidigare arkiv.
2. Välj **`2026.11.0b31`** under HACS-beta när prereleasen publicerats. Installera **inte `dev`**.
3. Starta om HA mellan sessioner. Gör `Ctrl+Shift+R` i webbläsaren.
4. Kontrollera att frontend visar **`0.3.0-dev.66`** och att bara den ordinarie HA-MGP-resursen är registrerad.
5. Öppna kalenderns och kommande GP:s banpopuper. Kontrollera **nationsflagga → bannamn → GP-namn → datum**, större faktarutor med 3/2-kolumnslayout och att Stäng-knappen inte visas.
6. Tryck på banbilden för att stänga, prova Escape och klick utanför. Vid saknad banbild ska det finnas alternativ för att stänga. Kontrollera att källänkar och resultatflikar **inte** stänger popupen.
7. Prova livetiming, klassbyte, spoilerläge, helgschema och nästa-GP-övergång under racehelgen.
8. Rollback vid behov: **b30** via HACS beta, utan att radera data eller entiteter.

`main` släpps först efter praktisk verifiering och uttryckligt godkännande.
