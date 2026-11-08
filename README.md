# HA-MGP — HACS beta

MotoGP, Moto2 och Moto3 i Home Assistant. Inofficiell, fristående integration.

**HACS beta `2026.11.0b18` · Frontend `0.3.0-dev.40`**

## Nytt sedan b17

- **Helgschema** öppnas i en dialog ovanpå vyn. Översiktskort och livetiming förblir placerade bredvid varandra i Lovelace-layouten utan extra schema mellan dem.
- **Moto3, Moto2 och MotoGP** behåller sina klickbara, grafiska kategorifilter. Nu med tydliga regressionstester. Markörerna är egna text-SVG, inte officiella logotyper.
- Förarens giltiga bästa varv är **rött** i timingtabellen. Sessionens snabbaste **observerade** varv ligger kvar på avslutat sessionssnapshot efter målflagga.
- Ny **Pulselive API debug**-diagnostiksensor: avstängd som standard. Registrerar först observerad session, statusändringar, förarlista och första varv utan extra anrop och utan att kringgå TV-fördröjning eller spoilerskydd.
- Behåller b17:s T−30-startgrid och säkra väntläge när öppen deltagar-endpoint inte fungerar.

## Installation

Använd endast **HACS beta**, aldrig direktinstallation från dev. Endast en Lovelace JS module: `/motogp_sensor/ha-mgp.js` (äldre `/motogp_sensor/ha-motogp-next.js` är identiskt alias). Behåll integrationsdomän och entiteter samt `/config/motogp_data/`. Se [installation och rollback](docs/hacs-beta-installation.md), [release notes](docs/hacs-beta-release-notes.md) och [status](docs/project-status.md).

**SOP:** dev → beta → main. Main orörd. Rollback: `2026.11.0b17`.

**Utvecklingsgren:** dev kan innehålla ytterligare experiment som inte ingår i publicerad b18. Installera därför aldrig dev direkt i HA.
