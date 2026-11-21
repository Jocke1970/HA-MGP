# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b41` · Frontend `0.3.0-dev.79`.**

## Nytt i b41
- API-bekräftad livetiming prioriteras framför förskjuten schematid för samma verifierade session.
- Avslutad Sprint (status C/F) kan återhämta slutresultat även om kortet missade själva starten.
- Föregående sessions förare får inte återanvändas när ett annat pass väntar på start.
- b40:s tredelade startgrid, pole-markering, teamfärger, flaggor och försiktig hantering av saknade startnummer finns kvar.
- API-verktygets JSON-kopiering har reservmetod och återkoppling; TV-delay, klassisolering och No Spoiler behålls.

**Beta för okulärbesiktning.** Installera via HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b40 är rollback. Main ändras först efter godkännande.
