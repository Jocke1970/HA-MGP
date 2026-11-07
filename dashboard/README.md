# HA-MGP – dashboard

Det aktuella HACS-levererade gränssnittet består av två kort:
- `custom:ha-motogp-next-overview-card` – Grand Prix, schema och VM-ställning
- `custom:ha-motogp-next-timing-card` – livetiming

En JS-module-resurs: `/motogp_sensor/ha-motogp-next.js`.

Korttaggarna behåller ordet `next` för bakåtkompatibilitet; **HA-MGP** är produktnamnet. Gamla YAML-filer i denna mapp är utvecklings-/referensexempel och ska inte läggas under `/config/packages` eller köras parallellt med aktiva kort. Se [HACS-instruktioner](../docs/hacs-beta-installation.md).
