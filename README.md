# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b42` · Frontend `0.3.0-dev.81`.**

## Nytt i b42
- Den dubbla startgridden är borttagen: endast timingkortets verifierade tredelade grid visas från T−30.
- TV-delay-reglaget använder Home Assistant-hjälparens verkliga min/max/step i stället för ett hårdkodat 300-sekundersintervall.
- TV-delay-panelen ligger under sin knapp och täcker inte varvtider eller förarlistan.
- VM-ställningsknapp och panel fungerar även utan den gamla översiktsgridden.
- b41:s API-styrda sessionövergång, slutresultat, No Spoiler och JSON-kopiering behålls.

**Beta för okulärbesiktning.** Installera via HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b41 är rollback. Main ändras först efter godkännande.
