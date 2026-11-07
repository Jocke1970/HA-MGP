# HA-MGP 2026.11.0b13 — nya JavaScript-filnamn

**HACS beta:** `2026.11.0b13` · **UI:** `0.3.0-dev.25`.

## Ändringar sedan b12

- Repo, UI-rubrik, UI-fot och integrationsnamn är HA-MGP.
- Ny resurs `/motogp_sensor/ha-mgp.js`, samt bibehållen `/motogp_sensor/ha-motogp-next.js` med identiskt innehåll.
- Helgschema och VM-ställning öppnas en åt gången.
- Den dubbla schemarubriken och överflödig VM-klassrad tas bort, men klassflikarna finns kvar.
- VM-ställning visar alla förare som backend skickar, inte bara tio.
- Intern `motogp_sensor`-domän, backendlogik och main är oförändrade.

## Uppdatering

Installera `2026.11.0b13` från HACS beta och starta om HA när inget pass är aktivt. Kontrollera att `/motogp_sensor/ha-mgp.js` kan öppnas, redigera sedan **befintlig** Lovelace JavaScript module-resurs från `/motogp_sensor/ha-motogp-next.js` till `/motogp_sensor/ha-mgp.js`. **Skapa ingen andra resurs.** Ladda om med `Ctrl+Shift+R` och kontrollera UI `0.3.0-dev.25`.

Rollback: välj `2026.11.0b12` i HACS och återställ tidigare resursadress. Bevara dashboard, konfigurationspost och `/config/motogp_data/`. Förarflaggor och klassloggor ingår inte i denna beta.
