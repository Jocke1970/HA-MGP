# HA-MGP – dashboard

Det aktuella HACS-levererade gränssnittet består av två kort:
- `custom:ha-motogp-next-overview-card` – Grand Prix, schema och VM-ställning
- `custom:ha-motogp-next-timing-card` – livetiming

JS-module-resurs i publicerade b12: `/motogp_sensor/ha-motogp-next.js`. Efter en framtida beta kan man växla till `/motogp_sensor/ha-mgp.js` genom att **ersätta**, inte lägga till, resursadressen.

Korttaggarna behåller ordet `next` för bakåtkompatibilitet; **HA-MGP** är produktnamnet. Gamla YAML-filer i denna mapp är utvecklings-/referensexempel och ska inte läggas under `/config/packages` eller köras parallellt med aktiva kort. Se [HACS-instruktioner](../docs/hacs-beta-installation.md).
