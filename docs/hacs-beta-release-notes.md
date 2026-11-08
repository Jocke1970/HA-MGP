# HA-MGP 2026.11.0b16 — visuell säsongskalender

**HACS beta `2026.11.0b16` · Frontend `0.3.0-dev.32`**

## Nytt jämfört med b15

- Visuell säsongskalender inbyggd i översiktskortet **när ingen racehelg pågår**. Kalendern använder den befintliga `season_calendar` i `sensor.motogp_next_race`.
- Nästa Grand Prix lyfts fram, med datum, flagga, bana och nedräkning. Kommande race visas i responsiva kort; äldre race nås i en hopfällbar sektion.
- Växlar automatiskt tillbaka till ordinarie översikt under racehelger. Vid saknad kalenderdata visas ordinarie kort i stället för att gissa.
- Bevarar fem UI-språk med engelsk fallback, nationsflaggor, VM-ställning och rekordchips i livetimingkortet.
- Ett enda JS-bundle, med ett byte-identiskt alias för äldre installations-URL. Inga nya API-anrop, konfigurationsändringar eller entiteter.

## Verifiera i Home Assistant

Installera från HACS beta, ladda om med `Ctrl+Shift+R`, verifiera UI `0.3.0-dev.32`. Kalenderns faktiska utseende på desktop/mobil behöver fortfarande **visuell kontroll i Home Assistant**. Skärmbilder och synpunkter används i nästa dev-omgång. Under racehelgen ska kalendern inte ersätta ordinarie toppkort.

**Rollback:** beta `2026.11.0b15`. `main` är oförändrad.
