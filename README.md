# ha-motogp — HACS beta

Home Assistant MotoGP Sensor fork. Independent project derived from [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor); no affiliation with MotoGP.

**Latest HACS prerelease: `2026.11.0b11` · Next `0.3.0-dev.22`.** SOP: **dev → beta → main**. Stable main is unchanged.

## Next UI

- **Navigation i toppkortet:** Helgschema-knapp, nästa pass med nedräkning och högerställd VM-ställning. UI-information ligger i kortets fot.
- **Branding:** Godkänd MGP-logga i toppkortet och nationsflagga vid GP-namnet.
- **White event hero:** Grand Prix details and VM toggle left, real reported track weather center, locally bundled schematic circuit layout far right. On narrow cards everything remains inside the same white header.
- **Timing:** latest lap with PB highlight and each rider's fastest verified lap immediately below, across training, Q1/Q2, Sprint and Race. Clickable rider lap archive retained.
- **Qualifying:** 3–3–3 staggered provisional versus published grid, with Q1 non-transferees from P13 (MotoGP) / P19 (Moto2, Moto3).
- **Championship and freshness:** full category standings, points bars, team accents, live feed age, spoiler protections.

**Only one existing Lovelace JavaScript module** at `/motogp_sensor/ha-motogp-next.js` — no `?v=` and no duplicate resources.

[Beta release notes](docs/hacs-beta-release-notes.md) · [Install and rollback](docs/hacs-beta-installation.md) · [Track attribution](docs/track-layout-attribution.md).

The 2026-11-07 Red Flag observation (API status `N`, 30-second fallback polling despite schedule `CURRENT`) is **not fixed in this frontend-only beta**. Investigate separately with explicit safety/regression gates. Godkänd MGP-grafik är inbäddad i Next JS; befintlig integrationsikon är oförändrad.
