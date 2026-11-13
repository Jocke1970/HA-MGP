# HA-MGP – Home Assistant MotoGP

Inofficiell integration för MotoGP, Moto2 och Moto3.

**HACS beta-kandidat: `2026.11.0b31` · UI `0.3.0-dev.66`.**

## Nytt i b31
- Tydligare banpopuper: större nationsflagga, bannamn först, GP-namn och datum/plats.
- Tryck på banbilden för att stänga, även Escape och bakgrundsklick; ingen synlig "Stäng"-knapp i banpopupen.
- Kompakta 3/2-kolumners faktarutor, tydligare text och källstatus.
- Separat **read-only** pilot för historiska officiella banprofiler, offline som standard, utan HA-API-anrop. Den ger inte automatiskt verifierad banlayout.

Se [release notes](docs/hacs-beta-release-notes.md), [HACS-betainstruktioner](docs/hacs-beta-installation.md), [banpilotens avgränsning](circuit_data/pilot_sources/README.md).

**Arbetsflöde:** dev → beta → main. **b30 är rollback. Main väntar till efter nästa racehelgs praktiska godkännande.**
