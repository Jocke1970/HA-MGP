# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b33` · Frontend `0.3.0-dev.71`.**

## Nytt i b33
- Baninformationens officiella källänk heter `Official MotoGP-page`.
- Hela den rektangulära banbilden är klickbar för att stänga popupen.
- Nedräkning visar dagar, timmar och minuter i stället för tvetydig klocknotation.
- Nästa session måste tillhöra relevant GP-helg och matcha event-ID när det anges; annars visas `Nästa pass ej verifierat`.
- Genomförda GP visas senaste först utan omnumrering.

**Testversion för okulärbesiktning.** Installera via HACS beta – aldrig dev. [Release notes](docs/hacs-beta-release-notes.md) och [installationstest](docs/hacs-beta-installation.md). Ingen backend/API-förändring; banverifieringspiloten är fortsatt offline.

**Dev → beta → main.** b32 är rollback. Main uppdateras först efter praktisk granskning och separat klartecken.
