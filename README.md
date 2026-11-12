# HA-MGP — Home Assistant MotoGP beta

Inofficiell integration för MotoGP, Moto2 och Moto3.

**Kandidat för HACS beta: `2026.11.0b29` · UI `0.3.0-dev.63`.**

Denna kandidat är ännu inte publicerad som prerelease förrän tester och release-gate är godkända. Fungerande beta b28 är rollback.

## Nytt i b29
- Större banlayouter i kalender och popup, utan ändrad popupbredd.
- 22 preliminära 2027-banunderlag från Pulselive och 22 delvis dokumenterade 2026-banlängder visas källmärkt.
- Gula statuspluttar även innan första statusrapporten.
- Övergången från avslutad MotoGP-helg till nästa GP förbereder sessionsschema i den befintliga uppdateringscykeln.
- Visuella statuspluttar för **Schema/Bana/Startlista** med strikt eventkoppling.
- Underlag för 2027-banorna och verifiering av banvarianter (offline referensdata, ännu inte runtime).
- Korrigerad banpopup-header och uppdatering efter målgång.

Begränsningar: event-specifik preliminär startlista är ännu inte verifierad; månatlig/48h automatisk kontroll är inte aktiv. Se [release notes](docs/hacs-beta-release-notes.md).

## Installation
Via **HACS beta**, aldrig direkt från dev. En JS-resurs: `/motogp_sensor/ha-mgp.js`. Behåll `/config/motogp_data/`. Läs [instruktionerna](docs/hacs-beta-installation.md).

**Releaseflöde:** dev → granskad kandidat → beta → main. Main orörd.
