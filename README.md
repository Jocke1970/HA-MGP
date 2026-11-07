# HA-MGP — HACS beta

**HA-MGP** kombinerar Home Assistant-backend och UI för MotoGP, Moto2 och Moto3. Projektet härstammar från [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor) och är inte officiellt anslutet till MotoGP.

**HACS beta `2026.11.0b14` · UI `0.3.0-dev.27`**. SOP: **dev → beta → main**. `main` förblir oförändrad.

## Nytt i b14

- Förarflaggor i livetiming och VM-ställning från API:s `nation`-fält (ingen flagga gissas om uppgiften saknas).
- Grafiska, lokala SVG-klassknappar för **MotoGP, Moto2, Moto3**, och **🏁 ALL** i helgschemat. Dessa är tillfälliga stiliserade märken – inte originalbilderna från det gamla kortet.
- Fortsatt hela VM-listor, exklusiv panelväxling och 30-minutersstyrd livetiming.

Huvudresurs `/motogp_sensor/ha-mgp.js`; `/motogp_sensor/ha-motogp-next.js` finns som identiskt kompatibilitetsalias. Registrera **en** JavaScript module-resurs, aldrig båda.

[Installationsguide](docs/hacs-beta-installation.md) · [Release notes](docs/hacs-beta-release-notes.md). Intern domän `motogp_sensor` och Lovelace-korttyper är oförändrade.
