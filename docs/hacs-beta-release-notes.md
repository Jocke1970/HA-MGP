# MotoGP Sensor 2026.11.0b12 — dolt helgschema och sessionsstyrd livetiming

**HACS beta:** `2026.11.0b12` · **MotoGP Next UI:** `0.3.0-dev.23`.

## Ändringar sedan b11

- **Helgschema är dolt från början.** Knappen 🗓️ Helgschema i toppkortet öppnar och stänger det. Sessionschip och nedräkning fortsätter visas även när schemat är dolt.
- **Livetiming visas automatiskt från 30 minuter före schemalagd start**, samt alltid när en session är verifierat aktiv av befintlig sessionmatchning. Inget extra reglage i toppkortet.
- **Förseningar:** Ej avslutade schemalagda sessioner får en tidsmarginal på högst tre timmar efter planerad start. Markerade FINISHED/CANCELLED/CANCELED öppnar inte timingkortet på grund av schemat.
- Befintligt spoilerläge, liveidentifiering, MGP-logga, Qatarflagga, banväder och banlayout lämnas i övrigt oförändrade.
- Regressionstester för stängt/öppet schema, 35/31/25 minuter före start, försening, avslutad och verifierat aktiv session.
- Backend, Red Flag, polling, TV-delay och `main` är oförändrade. Arkivläget kräver fortsatt separat backendstöd.

## Installera och kontrollera

Välj beta **2026.11.0b12** i HACS när inget pass pågår. Starta om HA och gör en hård omladdning (`Ctrl+Shift+R`). Behåll exakt en Lovelace JS-module-resurs: `/motogp_sensor/ha-motogp-next.js` utan `?v=`.

Kontrollera att schemat först är dolt, går att öppna/stänga med Helgschema-knappen, att nästa-pass-chipet fortsätter räkna ner och att timingkortet saknas när nästa pass är längre än 30 minuter bort. Visa en ny skärmbild inför nästa layoutdiskussion. Verifiering av skiftet till aktivt pass kräver en riktig livesession.

**Rollback:** HACS beta `2026.11.0b11`. Bevara `/config/motogp_data/`, dashboard och konfigurationspost. Projektet är fristående från officiella MotoGP.
