# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b35` · Frontend `0.3.0-dev.73`.**

## Nytt i b35
- Timingkortet, förstartsläget och timingfönstrets synlighetskontroll avvisar gamla sessioner utanför valt GP:s datumfönster eller med annat uttryckligt event-ID.
- En gammal Moto2 FP2 kan inte ersätta Portugal GP:s kommande Moto3 FP1 eller skapa en falsk startlista.
- Utökade regressionstester för samtliga tre sessionsvägar och korrekta förstarts-/livegränser.
- Toppkortets redan fungerande sessionsurval och övrig b34-layout är oförändrade.

**Beta för okulärbesiktning.** Installera med HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b34 är rollback. Main ändras först efter separat godkännande.
