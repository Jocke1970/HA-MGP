# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b39` · Frontend `0.3.0-dev.77`.**

## Nytt i b39
- Ny hopfällbar **🔧 API-verktyg**-meny i det befintliga översiktskortet.
- Visar aktuellt GP-ID, klass, live-session, Results-sessionens UUID samt säsongs-ID.
- Manuella knappar för API:ets live timing, Broadcast-schema, Results-sessioner, startgrid och klassificering.
- En JSON-vy med kopieringsknapp gör det enkelt att dela exakt vilka data källorna levererar.
- Säkra, autentiserade och läsande förfrågningar. Inga automatiska API-anrop eller extra filer i HA-roten.
- Tidigare fixes i b38 och b37 behålls.

**Beta för okulärbesiktning.** Installera via HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b38 är rollback. Main ändras först efter godkännande.
