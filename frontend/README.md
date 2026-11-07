# HA-MGP – frontend

HA-MGP:s aktiva UI levereras **tillsammans med backenden från HACS-beta**, som en enda JS-modul vid `/motogp_sensor/ha-motogp-next.js`. De aktiva korten är `custom:ha-motogp-next-overview-card` och `custom:ha-motogp-next-timing-card`.

**NEXT är ett historiskt tekniskt namn**, som behålls i resursfilen och kort-ID:n för att befintliga HA-konfigurationer ska fortsätta fungera. Produktens namn är HA-MGP.

Utvecklingskoden i `frontend/ha-motogp-next-*.js` byggs till en resurs med `scripts/build-next-ui-preview.py`. Byggskriptet kontrollerar källornas Git-blobbar och testflödet säkerställer att `dist/` och HACS-kopian matchar.

Senaste publicerade beta: `2026.11.0b12` (UI `0.3.0-dev.23`). `dev` installeras **aldrig** direkt i HA. Se [status](../docs/project-status.md), [versionsguide](../docs/frontend-versioning.md) och [installation](../docs/hacs-beta-installation.md).

`ha-motogp-card.js` och äldre prototyper är historiskt/valfritt material och ska inte laddas parallellt med de aktiva korten.
