# HA-MGP 2026.11.0b43 – kvalets pole-tid, banrekord och API-verktygets placering

**HACS beta:** `2026.11.0b43` · **Frontend:** `0.3.0-dev.82`

## Ändrat sedan b42
- Startgridden visar separat P1:s verifierade kvaltid för det aktuella loppet och absolut varvrekord från den aktuella klassens banrekord-API. Historiska pole-rekord används **inte** som aktuell kvaltid.
- Uppgifterna ligger i timingkortets startgridvy och finns kvar vid T−15; saknad kvaltid eller banrekord visas som —, utan gissning.
- Frontend hindrar tidigare sessions snabbaste observerade varv från att visas under en annan klass startgrid. Verifierat avslutat pass behåller sin historik.
- Det manuella, läsande API-verktyget ligger efter timing-/startgridkortet, längst ned; ingen extra Lovelace-resurs krävs.
- Regressionstest för kvaltid kontra historiskt pole-rekord, T−15, klassisolering och API-verktygets placering.
- b42:s enhetliga grid, TV-delay-värden, b41:s livetiming och No Spoiler-skydd bevaras.

## Verifiering
- I Home Assistant: bekräfta en enda grid, aktuell kvaltid och absolut varvrekord där API:t levererar dessa, samt att uppgifterna kvarstår under T−15.
- Kontrollera att API-verktyget ligger efter timing och att tidigare klassers varvtider inte följer med.
- **Rollback:** `2026.11.0b42`. **Main orörd.**
