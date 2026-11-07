# HA-MGP

**HA-MGP** är en Home Assistant-integration med både Python-backend och ett samlat gränssnitt för MotoGP, Moto2 och Moto3. Projektet bygger vidare på [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor) men har en egen API-klient och kräver ingen separat installation av uppströmsintegrationen. Projektet är inte knutet till MotoGP eller dess rättighetsinnehavare.

## Funktioner

Grand Prix-översikt med MGP-logga, land, bana, banlayout och banväder; helgschema och nästa pass med nedräkning; livetiming och varvdata; förar-VM per klass; spoilerskydd och sessionsrelaterad historik där backendstödet finns. Information från MotoGP/Pulselive är beroende av extern datatillgänglighet och inte garanterad som realtid.

## Installera

**Senaste publicerade HACS-beta: `2026.11.0b12`** (UI `0.3.0-dev.23`). Uppdatera endast från **beta**, aldrig direkt från `dev`. Se [installations- och rollbackguide](docs/hacs-beta-installation.md).

**I publicerade b12:** Lovelace-resursen är `/motogp_sensor/ha-motogp-next.js` (JavaScript module). **I kommande beta:** ny huvudresurs `/motogp_sensor/ha-mgp.js`; den gamla URL:en finns kvar som kompatibilitetsalias. Registrera aldrig båda samtidigt. Korttyperna är `custom:ha-motogp-next-overview-card` och `custom:ha-motogp-next-timing-card`.

**Viktigt vid namnbytet:** Repo och visningsnamn blir HA-MGP, men integrationsdomänen `motogp_sensor`, befintliga interna korttyper, entiteter och `/config/motogp_data/` behålls för bakåtkompatibilitet. Frontendens källmoduler heter numera `frontend/ha-mgp-*.js`. Äldre JS-resursnamn finns kvar enbart som övergångsadresser. Se [migrering av resursnamn](docs/js-resource-migration.md).

## Utveckling

**dev → beta → main.** Utveckling och CI på dev; HACS- och verkliga sessionsprov på beta; stabil main först efter godkända tester. Ingen direktinstallation från dev.

- [Aktuell projektstatus](docs/project-status.md)
- [Installera och återställ](docs/hacs-beta-installation.md)
- [HACS och frontend](docs/frontend-hacs-bundling.md)
- [Frontendversioner](docs/frontend-versioning.md)
- [Release notes](docs/hacs-beta-release-notes.md)
- [Dokumentationsindex och äldre anteckningar](docs/README.md)
- [Källor för banlayout](docs/track-layout-attribution.md)

Äldre tester, YAML-exempel och prototyper är referensmaterial, inte alternativa installationspaket. Skydda befintlig HA-konfiguration och sessionsarkiv. Rättigheter till varumärken och tredjepartsmaterial tillhör respektive ägare.
