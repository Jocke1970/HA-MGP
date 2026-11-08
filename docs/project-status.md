# HA-MGP — status 2026-11-07

## Projekt och releaser

- GitHub: [Jocke1970/HA-MGP](https://github.com/Jocke1970/HA-MGP), tidigare `ha-motogp`.
- Produktnamn: **HA-MGP**, med backend + frontend i samma HACS-integration.
- Publicerad HACS-beta: **2026.11.0b12**, frontend **0.3.0-dev.23**.
- Aktuell dev-kandidat: **0.3.0-dev.25** med det nya produktnamnet **HA-MGP** i UI. Den är **inte** publicerad som beta.
- Ordning: **dev → beta → main**.

## Funktioner

Grand Prix-toppkort, banväder och schematisk banlayout, dynamisk nationsflagga för värdlandet, helgschema och nedräkning, livetiming, varvdata, spoilerskydd och klassvis VM-ställning.

I den ännu opublicerade dev-versionen är helgschema och VM-ställning ömsesidigt uteslutande, dubbel schemarubrik borttagen och VM-listan inte längre begränsad till tio förare.

**Kvar att göra:** förarnas nationsflaggor i livetiming och VM-ställning, klassloggor som filterknappar (originalmaterialet måste hittas/verifieras), verkliga livepassprov och kontroll av historikfunktionens beroende till backend.

## Kompatibilitet

Vi behåller `motogp_sensor` som intern HA-domän, den gamla resursen `/motogp_sensor/ha-motogp-next.js` som alias och nya `/motogp_sensor/ha-mgp.js` som avsedd huvudresurs från nästa beta, korttaggarna `ha-motogp-next-*` och sessionslagringen `/config/motogp_data/`. NEXT är bara ett äldre internt identifierarnamn. Repo/produkt heter HA-MGP.

Övriga äldre anteckningar dokumenterar tidigare tester och ska inte följas som aktuella installationsinstruktioner. Se [installation](hacs-beta-installation.md) och [dokumentationsindex](README.md).

## Namnbyte av JavaScript (dev)

Källmodulerna är nu omdöpta till `frontend/ha-mgp-*.js`, den byggda huvudfilen heter `ha-mgp.js` och den gamla HACS-filen behålls byte-identisk som kompatibilitetsalias. Samma interna Lovelace-taggar används. **Inte publicerat till beta eller verifierat i HA ännu.** Se [migrationsguide](js-resource-migration.md).

## Rekordchips i livetiming-header (dev)

Frontend `0.3.0-dev.29` visar klassberoende rekordchips direkt under livetimingkortets header (MotoGP, Moto2 eller Moto3). Data hämtas från den befintliga sensorns `records_by_category` för aktiv eller senast visad sessionsklass. Endast igenkända rekordtyper och giltiga tider visas; detaljer finns i chipsets beskrivning. Inga nya API-anrop eller backendändringar krävs. Rekord visas inte i GP-toppkortet, kan ses även när förarlistan i livetiming är hopfälld och döljs i spoilerläge. Ändringen är på `dev` och ännu inte verifierad visuellt i HACS-beta.

## Språkstöd (dev)

Frontend `0.3.0-dev.30` innehåller de första fem inbyggda språkfilerna för `en`, `sv`, `es`, `it` och `fr`, med engelska som fallback; HA-integrationens konfigurations-/entitetsöversättningar levereras som separata JSON-filer. UI-texten översätts i den enda JS-resursen, utan nya anrop eller ändrade entiteter. **Visuell granskning av dynamiska texter återstår.** Se [språkguiden](localization.md).

## Säsongskalender utanför racehelg (dev)

I frontend `0.3.0-dev.32` ersätter en responsiv säsongskalender översiktskortet utanför racehelger. Data kommer från `sensor.motogp_next_race.attributes.season_calendar`, som redan innehåller hela säsongen. Nästa Grand Prix markeras separat med nedräkning, återstående tävlingar visas som kort och tidigare tävlingar ligger under en hopfällbar sektion. Racehelgen (primärt `binary_sensor.motogp_race_weekend_active`, alternativt `binary_sensor.motogp_race_week`, med datumbaserad reserv) lämnar det befintliga livegränssnittet orört. Ingen ny backendhämtning eller ny Lovelace-resurs. Kalendern har de fem befintliga UI-språken och engelsk fallback. **Endast på dev; inte testad visuellt i HA eller publicerad till beta.**

## Status- och klockchips för livetiming (dev.35, ej beta)

- Toppchipet visar en verifierad pågående session från kortets befintliga live-matchning innan nästa schemalagda pass; annars kvarstår nedräkningen till nästa pass.
- `binary_sensor.motogp_live_timing_online` ger en separat grön/grå/orange API-indikator i eventheadern. Detta är inte detsamma som att ett pass är live.
- `sensor.motogp_session_status` ger gul/grön/grå/orange sessionsindikator endast när klass **och** sessionstitel matchar, i livetimingens rubrik samt i motsvarande schemapass; aldrig ärvs en sessions status av andra klasser.
- Starttid har klockikon och nedräkningen timerikon; nedräkningen blir röd under fem minuter. Inga backend- eller väderändringar i dessa UI-commits.
- En synlighetstest bör säkerställa att `Helgschema` inte öppnas automatiskt av live-data och att manuellt öppet schema fortfarande respekteras.
- Väder från Open-Meteo vid banans koordinater är en separat möjlig backendfeature, med tydlig källmärkning och attribution. **Inte implementerat.**

