# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b36` · Frontend `0.3.0-dev.74`.**

## Nytt i b36
- Backend avvisar Results API-sessioner som ligger utanför det aktuella GP:s datumfönster (med ett dygns tolerans för torsdagspass/tidszonsgräns).
- Broadcast API används fortsatt för schemafallback, utan att hitta på Results-ID:n.
- Helgschema, kval-/rekordurval och timingunderlag använder datumskyddet; diagnostik visar bortfiltrerade Results-rader och antalet Broadcast-fallbackrader.
- Moto2 och Moto3 visar inte längre någon Sprint-ruta i popupen. MotoGP behåller sin Sprint-ruta.
- Befintlig UI-layout, nästa-session-visning, pollingintervall och historiska resultat-WS lämnas oförändrade.

**Beta för okulärbesiktning.** Installera genom HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b35 är rollback. Main ändras först efter separat godkännande.
