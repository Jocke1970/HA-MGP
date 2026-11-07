# ha-motogp — HACS beta

Independent Home Assistant companion/derived integration based on [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor). Not affiliated with MotoGP or its rights holders.

**Current HACS beta: `2026.11.0b3`**, with Next UI **`0.3.0-dev.10`**. SOP: `dev → beta → main`. The stable `main` branch remains unchanged.

## Championship standings (new in b3)

The top **Visa VM-ställning** control expands class-specific MotoGP/Moto2/Moto3 tables showing **position, #number, rider, team and points**, with a verified team-color accent whenever official team metadata supplies a unique match. Without authoritative color data the accent is neutral; no values are guessed. All existing timing and archive functionality remains.

The integration includes Next and legacy JS under `custom_components/motogp_sensor/www/`. The clean, stable Lovelace URL is `/motogp_sensor/ha-motogp-next.js`; **never append `?v=`** or register a duplicate resource.

The mobile timing view, rider-lap popup, separate standings categories, qualifying grid/provisional order and collapsed live schedule from b2 are preserved. See [installation/rollback](docs/hacs-beta-installation.md) and [release notes](docs/hacs-beta-release-notes.md).

The previously approved MGP brand icon is still a separate asset and **not included in b3**. On-host acceptance is required before any `main` release. Never install code directly from `dev`.
