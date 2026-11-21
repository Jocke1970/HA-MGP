# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b40` · Frontend `0.3.0-dev.78`.**

## Nytt i b40
- Kompaktare tredelad startgrid, tydligare positioner, markerad pole, verifierade teamfärger/nationsflaggor när metadata finns.
- Publicerad fullständig startgrid visas även när API:t utelämnar vissa startnummer. Saknade nummer gissas aldrig; matchning görs endast mot verifierade förare i samma klass.
- Befintlig väntelogik vid schemaförskjutningar och automatisk övergång till matchande verifierad livetiming bibehålls.
- b39:s manuella API-verktyg och tidigare korrigeringar behålls.

**Beta för okulärbesiktning.** Installera via HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b39 är rollback. Main ändras först efter godkännande.
