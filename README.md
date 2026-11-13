# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b34` · Frontend `0.3.0-dev.72`.**

## Nytt i b34
- Kalenderns GP-namn använder beskrivande namn framför kortkoder som `VAL`, med fallback för Valencia/Portugal och land.
- Pole (Q2) i officiella sessionsresultat har egen verifieringsplupp: röd om kvalresultatet inte är verifierat, gul vid partiella data, grön endast vid verifierad Q2-förare och kvaltid.
- Popup kan stängas via tomma/icke-interaktiva ytor; knappar, klassflikar och länkar fortsätter fungera.
- b33:s sessionsgränser, nedräkning och senaste-avverkade-GP-först behålls.

**Okulärbesiktning krävs.** Installera via HACS beta – aldrig dev. [Release notes](docs/hacs-beta-release-notes.md) och [installationscheck](docs/hacs-beta-installation.md).

**Dev → beta → main.** b33 är rollback. Main lämnas orörd tills separat godkännande.
