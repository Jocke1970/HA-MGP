# ha-motogp — HACS beta

Home Assistant integration derived from [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor), unaffiliated with MotoGP or its rights holders.

**Current beta: `2026.11.0b4` · Next UI `0.3.0-dev.11`.** Development policy: **`dev → beta → main`**. Stable `main` is unchanged.

## Improved MotoGP / Moto2 / Moto3 standings

The optional **Visa VM-ställning** control opens a responsive leaderboard with position, number, rider, team and verified team-color stripe, official points and a leader-relative points bar on wide displays. Top-three drivers receive subdued podium styling and points behind the class leader are shown without estimation. The comparative bar is hidden on narrow displays.

The b3 backend and all live timing / archive / spoiler / qualifying-grid functionality remain unchanged. Next and the legacy UI are HACS-managed under `custom_components/motogp_sensor/www/`; the already-registered Lovelace JavaScript module URL remains **`/motogp_sensor/ha-motogp-next.js`**, with **no `?v=` query suffix** and no duplicate resource.

See [installation and rollback](docs/hacs-beta-installation.md) and [release notes](docs/hacs-beta-release-notes.md).

The previously approved MGP brand icon is pending separate binary check-in and is **not** included in b4. Manual HA acceptance is required before considering `main`; never install a `dev` build directly.
