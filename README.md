# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b43` · Frontend `0.3.0-dev.82`.**

## Nytt i b43
- Startgridden visar nu separat P1:s verifierade pole-tid från aktuellt kval och absolut varvrekord, utan att blanda ihop historiskt pole-rekord med årets kval.
- Den kompletterande tidsinformationen behålls även efter T−15 och visar ett streck om API:t saknar verifierad tid.
- Föregående sessions snabbaste observerade varv visas inte längre under en annan klass startgrid.
- Det manuella API-verktyget ligger efter timing-/startgridkortet, längst ned i vyn.
- b42:s enhetliga startgrid, TV-delay-kontroll och b41:s säkra liveövergångar behålls.

**Beta för okulärbesiktning.** Installera via HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b42 är rollback. Main ändras först efter godkännande.
