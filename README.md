# ha-motogp — HACS beta

Home Assistant integration derived from [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor). Independent project, not affiliated with MotoGP or any rights holder.

**Latest prerelease: `2026.11.0b7` · Next UI `0.3.0-dev.14`.** Development policy: **`dev → beta → main`**. Stable `main` remains untouched.

## Next features in b7

- **Event header:** locally bundled schematic circuit outlines (21 circuits) alongside weather from the existing HA sensor, marked **Senast rapporterat · inte livegaranti**. The independent Overview weather card is replaced, without removing its sensor.
- **Grid:** visual staggered 3–3–3 presentation. Verified Q1 non-transferees fill P13+ in MotoGP and P19+ in Moto2/Moto3 when an actual Q1 classification is available. A partial grid never claims to be official; race/sprint uses published grid only.
- **Accurate next-session banner:** a future MotoGP Sprint is labelled **MELLAN PASSEN** when no matching live session exists, rather than **STATUS OKÄND: Moto2 Q2** from an unrelated prior session.
- Existing three-category standings, premium points leaderboard, freshness, TV-delay/spoiler protection, mobile timing and rider-lap popup remain.

Frontend JS is HACS-managed in `custom_components/motogp_sensor/www/`. The single existing Next Lovelace JavaScript module resource is `/motogp_sensor/ha-motogp-next.js`. **Never add `?v=` or a second resource.**

See [install and rollback](docs/hacs-beta-installation.md) and [release notes](docs/hacs-beta-release-notes.md). Circuit track-outline attribution and Apache 2.0 license are included in `docs/track-layout-attribution.md` and `docs/third-party-track-APACHE-2.0.txt`.

The previously approved MGP brand icon is pending a separate binary check-in and is **not included in b7**. Actual HA testing is required before considering `main`.
