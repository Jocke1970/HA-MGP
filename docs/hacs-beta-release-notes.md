# HA-MGP 2026.11.0b39 – API-verktyg för aktuell racehelg

**HACS beta:** `2026.11.0b39` · **Frontend:** `0.3.0-dev.77`

## Nytt sedan b38
- I översiktskortet finns nu **🔧 API-verktyg**. Klicka Visa/Dölj.
- Visar aktuell GP:s Results-UUID, klass, sessionens status, säsongs-ID, klassens Results-UUID, livefeedens numeriska session-ID samt en vald Results-sessions UUID. Identiteterna hålls uttryckligen isär.
- Välj MotoGP, Moto2 eller Moto3 och en verifierad Results-session. Manuella knappar: **Visa alla ID:n**, **Live timing**, **Broadcast-schema**, **Results-sessioner**, **Startgrid**, **Klassificering**.
- Svaret visar API-metod, faktiskt endpoint, UTC-hämtningstid, kontext och API:s JSON. Kopiera JSON för granskning.
- Kräver HA-administratör och respekterar No Spoiler. Endast läsande, explicit anrop via WebSocket med fördefinierade endpoints och verifierade ID:n. Ingen automatisk polling, ingen ny YAML och ingen filcache.
- Svar över 250 000 tecken blockeras i stället för att belasta HA-WebSocket.

## Oförändrat
- Vanliga sensorers polling, livekort, kvalformat, TV-delay, förseningscheckpoint och b38:s banfakta-popup.
- Backend och frontend distribueras fortfarande inom samma HACS-integration.

## Testa
Öppna översiktskortets API-verktyg, kontrollera ID:n, välj klass och session, testa anrop och kopiera JSON. Bekräfta även att No Spoiler blockerar hämtning och döljer tidigare svar.

**Rollback:** `2026.11.0b38`. **Main orörd.**
