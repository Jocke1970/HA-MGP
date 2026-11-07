# HA-MGP — HACS beta

HA-MGP är ett Home Assistant-projekt med frontend och egen backend för MotoGP, Moto2 och Moto3. Härstammar från [Liionboy/motogp_sensor](https://github.com/Liionboy/motogp_sensor); inte officiellt anslutet till MotoGP.

**HACS beta `2026.11.0b13` · UI `0.3.0-dev.25`.** Ordning: **dev → beta → main**.

Ny huvudresurs: `/motogp_sensor/ha-mgp.js`. Tidigare `/motogp_sensor/ha-motogp-next.js` behålls byte-identisk för kompatibilitet. **Ladda endast en av adresserna** i Lovelace-resurser.

UI har nu produktnamnet HA-MGP, hopfällbart helgschema, ömsesidigt uteslutande VM-ställning, hela förarlistan och sessionsstyrd livetiming. Förarflaggor och klassloggor är fortfarande kommande arbete.

[Installera och återställ](docs/hacs-beta-installation.md) · [Release notes](docs/hacs-beta-release-notes.md) · [JS-migrering](docs/js-resource-migration.md).

Intern HA-domän `motogp_sensor`, befintliga entiteter och de två interna korttyperna `ha-motogp-next-overview-card` och `ha-motogp-next-timing-card` behålls.
