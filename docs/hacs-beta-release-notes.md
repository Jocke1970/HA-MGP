# HA-MGP 2026.11.0b44 – banrekord och preliminära helgrekord

**HACS beta:** `2026.11.0b44` · **Frontend:** `0.3.0-dev.86`

## Ändrat sedan b43
- Rekordtyperna från verkligt Pulselive-API: `recordLap` för publicerat absolut varvrekord, `bestLap` för publicerat bästa racevarv. `poleLap` och `fastestLap` är sessionsuppgifter och får inte felmärkas som historiska banrekord.
- Årets pole-tid kommer från verifierad P1 i startgridden.
- Om ett verifierat varv under pågående GP slår det senast publicerade `recordLap` visas **preliminärt nytt banrekord** direkt, utan att invänta officiell rekorduppdatering. En känd referenstid krävs; värden från annan klass eller inte färdig TV-delay används inte.
- Förare och år visas när recordsposten innehåller dem; startgridden visar förare för pole och rekord.
- Bara en sammanfattning av sessionens snabbaste varv behålls, med förare, tid och varvnummer; klockan visas även vid den aktuella snabbaste varvtiden i förarlistan.
- Den tidigare grid- och API-verktygslayouten är oförändrad. Röd flagg härleds inte från en oförändrad `In Progress`-status.

## Verifiering
- Kontrollera klassvisa rekord i HA, och att snabbare helgvarv markeras som preliminära till dess `recordLap` har uppdaterats.
- Kontrollera att ett rekord inte påstås vara slaget utan publicerat jämförelsevärde; ingen klassblandning eller avsteg från TV-delay.
- **Rollback:** `2026.11.0b43`. **Main orörd.**
