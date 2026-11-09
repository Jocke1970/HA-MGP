# HA-MGP 2026.11.0b25 — säsongskalender, historiska resultat och 2027

**Beta:** `2026.11.0b25` · **UI:** `0.3.0-dev.59`

## Nytt
- Klickbara kommande och avverkade Grand Prix med banlayout och baninformation. Avverkade tävlingar är nedtonade. Nästa GP dupliceras inte under kommande lopp.
- Återanvänder standardkortets GP-rubrik när aktuell API-säsong visas, inklusive befintliga knappar för helgschema, VM-ställning och banfakta.
- Avverkade GP kan hämta officiell resultatklassificering, Sprint och Q2-poletid per MotoGP/Moto2/Moto3 genom en **läsande**, autentiserad Home Assistant WebSocket på begäran. Inga egna uppskattade pole-tider, inga nya varvtidsarkiv. Respekterar no-spoiler och filtrerar på evenemangs-ID.
- Säsongsväljare 2026/2027. Preliminär publicerad 2027-kalender med 22 GP kan visas innan Pulselive har 2027 som aktiv säsong, utan att förhandsvisnings-ID:n skickas till API:t.
- Adelaide: tydligt markerad föreslagen banritning, attribution till Houseofsloth och CC BY 4.0. Buenos Aires: attribution Gustavo Girardelli, CC BY-SA 4.0 och OSM/ODbL-proveniens. Ingen av dessa utges för att vara verifierad tävlingslayout.
- Klassloggor använder riktiga SVG-referenser med textfallback.

## Beta-granskning / kända begränsningar
- Kontrollera visuellt i HA att GP-toppkort, popupfönster, små banlayouter och årsväxlare sitter rätt på mobil och desktop.
- Äldre helgschema- och banpopupgeometri samt officiellt banväder är fortfarande öppna UI-/datakällefrågor; b25 löser inte allt där.
- Pulselive kan sakna resultatuppgifter för äldre sessioner eller kvalformat som inte har verifierad Q2. Då visas **ej tillgängligt**.
- Den preliminära 2027-kalendern kan ändras; banprofil för Adelaide/Buenos Aires måste dubbelkontrolleras inför race.

## Installation och återgång
Installera via HACS beta mellan sessioner. Starta om Home Assistant (ny WebSocket-handler) och ladda om webbläsaren med Ctrl+Shift+R. Använd endast `/motogp_sensor/ha-mgp.js` som Lovelace-resource.

**Rollback:** `2026.11.0b24`. **Main oförändrad.**
