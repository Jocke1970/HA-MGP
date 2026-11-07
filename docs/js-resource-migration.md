# HA-MGP – JavaScript-resursmigrering

Från och med HACS-beta `2026.11.0b13` erbjuds `/motogp_sensor/ha-mgp.js` som huvudresurs. Den tidigare `/motogp_sensor/ha-motogp-next.js` finns kvar, med samma innehåll.

Efter installation och HA-omstart: kontrollera nya URL:en, **ändra** den befintliga Lovelace-resursen och gör hård omladdning. **Registrera inte båda** eftersom de definierar samma korttyper. Återgå till den gamla URL:en vid behov.

Utvecklingsmodulerna heter nu `frontend/ha-mgp-*.js`. Interna kort-ID:n och integrationsdomänen `motogp_sensor` har inte bytts.
