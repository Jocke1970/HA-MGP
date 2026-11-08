# HA-MGP — HACS beta

Home Assistant-integration och frontend för **MotoGP, Moto2 och Moto3**. Projektet bygger vidare på [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor) och är inte officiellt anslutet till MotoGP.

**HACS-beta `2026.11.0b16` · UI `0.3.0-dev.32`**.

## Nytt sedan b15

- **Visuell säsongskalender mellan racehelgerna.** Nästa GP i fokus, kommande race som responsiva kort och avverkade race i en hopfällbar historik. Data kommer från `sensor.motogp_next_race.attributes.season_calendar`.
- Under racehelgen visas det vanliga översiktskortet automatiskt, med banlayout, schema och VM-ställning. Inga extra API-anrop eller separata YAML-kort.
- Fem språk: engelska (fallback), svenska, spanska, italienska och franska.
- Klassvisa rekordchips i livetimingens header från b15.

**Lovelace-resurs:** `/motogp_sensor/ha-mgp.js` (JavaScript module). `/motogp_sensor/ha-motogp-next.js` är ett byte-identiskt alias; registrera **endast en** av dem.

**SOP:** `dev → beta → main`. `main` förblir orörd.

[Installation](docs/hacs-beta-installation.md) · [Versionsinformation](docs/hacs-beta-release-notes.md) · [Översättningar](docs/localization.md).
