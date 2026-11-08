# HA-MGP — status 2026-11-08

## Projekt och releaser

- GitHub: [Jocke1970/HA-MGP](https://github.com/Jocke1970/HA-MGP), tidigare `ha-motogp`.
- Produktnamn: **HA-MGP**, med backend + frontend i samma HACS-integration.
- Publicerad HACS-beta: **2026.11.0b17**, frontend **0.3.0-dev.37** (verifierad GitHub-prerelease).
- Nästa dev-kandidat: **0.3.0-dev.38**. Helgschema som modal, passiv API-diagnostik och klassfilterregressioner. **Inte publicerad som beta.**
- Ordning: **dev → beta → main**.

## Funktioner

Grand Prix-toppkort, banväder och schematisk banlayout, dynamisk nationsflagga för värdlandet, helgschema och nedräkning, livetiming, varvdata, spoilerskydd och klassvis VM-ställning.

I den ännu opublicerade dev-versionen är helgschema och VM-ställning ömsesidigt uteslutande, dubbel schemarubrik borttagen och VM-listan inte längre begränsad till tio förare.

**Kvar att göra:** riktiga licens-/ursprungsverifierade klasslogotyper (tills dess används textbaserade SVG-märken), verkliga livepassprov och jämförelse mellan sista PB/varv och sessionsarkiv. Förarflaggor och klassknappar finns redan i b17; deras visuella layout behöver fortfarande HA-granskas.

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


## Avflaggning och sena varvtider (dev.36, ej beta)

- Problem observerat i b16: UI byter direkt till nästa race efter att föregående session markerats Finished, medan eventuella slutvarv ännu inte visas. Varvarkivet kunde visa Di Giannantonios 1'52.281 från varv 5 och sex varv, medan resultatlistans frysta snapshot visade 1'52.558 och fyra.
- Dev.36 inför ett **högst två minuter långt** avslutsfönster vid bekräftad övergång från matchad LIVE till Finished. Rubriken visar 'Avflaggat' och resultatuppdatering, inte nästa pass, under denna period.
- Under tidsfönstret får bara **samma klass, session, event och TV-delay-godkända** förarlista ersätta den frysta snapshoten. Förare kopieras så att kommande feed-objekt inte muterar det visade resultatet. Nästa-passets nedräkning återkommer automatiskt när fönstret gått ut.
- Inga varvtider konstrueras eller hämtas från okända/andra sessioner. Om källan fortfarande saknar senaste arkiverade varv kan resultatlistan fortfarande avvika från popupen. Arkivet är separat källa för observerade varv; detta kräver särskild uppföljning innan slutresultat kan kallas verifierade.
- Endast på dev; behöver testas i Home Assistant under ett riktigt pass/slutvarv och jämföras med arkiv.

## T−30-startlista och resultat mellan pass (dev.37, ej beta)

- Utanför aktiv session behåller timingkortet **senast verifierade** resultatet öppet fram till 30 minuter före nästa schemalagda pass. Rubriken anger tydligt att resultatet inte är live. Manuellt hopfällt resultat respekteras.
- Från T−30 visas officiell startgrid för race/sprint, om den är publicerad; annars används anmälda förare för rätt kategori i nummerordning. För träning/kval visas deltagarlistan, inte påhittade startpositioner. Inga tider fylls innan matchande live-feed är verifierad.
- När schemalagd starttid passerat behålls deltagarlistan som väntvy i högst 15 minuter om matchad live-feed ännu saknas. Matchad live-feed tar alltid över. Spoilerläge stoppar båda vyerna.
- Nytt öppet Pulselive-anrop `/event/{eventId}/entry?categoryUuid={categoryId}` ger backend `entry_lists` på `sensor.motogp_next_race`. Detta behöver testas mot aktuellt verkligt API-svar och i HA.
- **Begränsning:** Resultatvisningen mellan pass använder det senaste bekräftade live-snapshot som timingkortet faktiskt har sett. Efter omstart/ny laddning utan sådant snapshot finns ännu ingen automatisk återhämtning av hela föregående resultatet.
- CI kör separat T−30-regression för roster, grid, post-start väntläge, spoiler, manuell hopfällning och saknad startlista. `dev`-ändringar är inte en publicerad beta.

## Pulselive API – verklig responskontroll 2026-11-08 (dev)

Kördes via GitHub Actions `Pulselive public API diagnostics` utan kontouppgifter eller HA-åtkomst. Endpoints för 2026 års säsonger (78 totalt), categories (3), results events (29), broadcast events (46), live-timing lite, sessions, race grid (20 för Malaysias GP) och classification (inklusive `classification`/`records`) svarade HTTP 200.

**Verifierat blockerande fynd för dev.37:** `/event/{eventId}/entry?categoryUuid={categoryId}` svarade HTTP 400 för Malaysias GP även med Results-/Broadcast-event-ID och motsvarande kategori-ID. Alternativa `/results/event/.../entry`-vägar gav HTTP 424/400. Backend fångar felet och lämnar roster tom, men det är **inte en bekräftad funktionell deltagarlista**. Resultatgrid fungerar för race/sprint när publicerad, men kan inte ersätta en officiell anmälningslista för träning/kval innan grid finns.

Broadcast `/teams?categoryUuid=...&seasonYear=2026` svarade HTTP 200 med 12 team och 34 förarposter. Det är en *säsongsroster*, inte verifierat deltagande i en specifik session; visas därför inte automatiskt som officiell startlista.

**Före beta:** välj dokumenterad fallback (t.ex. preliminär säsongslista tydligt märkt, eller förbli i väntläge), testa förar-ID:n och undvik upprepade onödiga 400-anrop. Ingen HA-installation från dev.

Verifiering: [API-testets Actions-logg](https://github.com/Jocke1970/HA-MGP/actions/workflows/pulselive-probe.yml).

## Nästa beta-kandidat: helgschema, klassknappar och Pulselive-debug (dev, ej release)

- **Helgschema:** översiktskortets knapp öppnar ett modal-fönster i stället för att lägga schemat mellan toppkort och den separata livetimingen. Stäng-knapp och Escape stöds. Tester täcker öppen/stängd visning och att schemat inte skjuter ned layouten. Tillhör UI `0.3.0-dev.38`, bara på dev.
- **Klassknappar:** de befintliga grafiska/typografiska klassmarkörerna och klickbara filtren för **Moto3, Moto2, MotoGP** finns i VM-ställningen och i schemats kategorifilter. Ytterligare regressionstest låser ordning, tillgängliga knappar och klassisolerad data. Originalmärken får inte förväxlas med dessa interimistiska SVG-märken.
- **Diagnostiksensor:** `sensor.motogp_pulselive_api_debug` (föreslaget namn; exakt entity_id kan avvika) skapas som **diagnostikentitet avstängd som standard**. Den använder redan hämtade, TV-delay-godkända data från `livetiming-lite`; inga extra HTTP-anrop. Övergångar registrerar källstatus, sessions-ID, klass, status, första förarlistan, första varvet och högsta observerade varv. **Inga stora rider-payloads eller nya tidsstämplar per poll** i Recorder.
- **Sekundära API-källor:** `/riders` och `/teams` har verifierats som öppna kataloger men är inte verifierade startlistor för en viss session. Därför introduceras ännu inga regelbundna anrop för dem i produktion. `/event/.../entry` svarar 400 och ingår inte i b17; dev-koden behöver städas för den vägen före nästa beta.
- **Spoiler-/sessionssäkerhet:** diagnostik sparar bara koordinatorns *exponerade* TV-delay-godkända snapshot, inte råfeed. Diagnostiksensorn visar `Hidden` och inga sessionsattribut i spoilerläge. Kända begränsningar: efter integrationens omstart återställs debug-observationsminnet och dess 'första' observation är relativ till startup, inte garanterad officiell start.
- **Kvar inför beta:** kör full CI, paketeringskontroll, kontroll av eventuella missade API-svar och installations-/rollbackdokumentation. Ingen direktinstallation av dev.
