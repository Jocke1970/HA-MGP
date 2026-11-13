# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b32` · Frontend `0.3.0-dev.68`.**

## Nytt i b32
- GP-namn visas i stället för kortkoderna `VAL`/`POR` i banpopupen.
- Hela banbildsområdet är klickbart för stängning, inte bara själva banformen.
- Bakgrundsklick kräver att klicket är utanför popupens synliga yta.
- Befintliga faktarutor, källor, resultat och API-beteenden är oförändrade.

**Testversion för okulärbesiktning.** Installera via HACS beta – aldrig dev. [Release notes](docs/hacs-beta-release-notes.md) och [installationstest](docs/hacs-beta-installation.md). Historisk banverifieringspilot är fortsatt separat/offline.

**Dev → beta → main.** b31 är rollback. Main uppdateras först efter praktisk granskning och separat klartecken.
