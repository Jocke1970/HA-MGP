# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b37` · Frontend `0.3.0-dev.75`.**

## Nytt i b37
- Q1 visar de två (MotoGP) respektive fyra (Moto2/Moto3) förare som går vidare och preliminära startplatser för övriga (P13+/P19+). Q1-ledaren kallas inte poleman.
- Q1/Q2 visar förarens snabbaste varv överst och senaste varv under. Race/Sprint behåller sin visning.
- Kompakt TV-delay-knapp öppnar skjutreglage som styr befintliga `input_number.motogp_tv_delay_seconds`.
- Efter schemalagd start utan bekräftat live visas en checkpoint; efter fem minuter markeras möjlig försening utan att hitta på ny starttid.
- b36:s datumskydd, Broadcast-fallback och klasspecifika Sprint-ruta behålls.

**Beta för okulärbesiktning.** Installera via HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b36 är rollback. Main ändras först efter separat godkännande.
