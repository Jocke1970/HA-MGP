# HA-MGP 2026.11.0b45 – omstartade lopp RAC2

**HACS beta:** `2026.11.0b45` · **Frontend:** `0.3.0-dev.87`

## Ändrat sedan b44
- Stöd för Pulselives `RAC2` / `Race PART 2` efter röd flagg. Det nya delpasset kopplas till samma klass och schemalagda Race, men egen `session_id` separerar snapshot och varvräkning.
- Frontend visar `Moto2 · Race · Del 2` när live-API:t rapporterar `RAC2`.
- Om sensorernas kategorier, sessions-ID eller pass skiljer sig visas inte gamla förardata som live. TV-delay och No Spoiler gäller även RAC2.
- Backend exponerar `session_id` som attribut på live-sensorerna.
- b44:s historiska och preliminära rekordvisning ingår oförändrad. `main` orörd.

## Verifiering
- Kontrollera att `RAC2` med status `S` visas som live, att korrekt ny 7-varvsdistans används och att startgridden inte återkommer.
- Kontrollera att ny session inte ärver gamla förarpositioner eller varvtider.
- Efter installation via HACS: starta om HA och hårduppdatera webbläsaren. **Rollback b44.**
