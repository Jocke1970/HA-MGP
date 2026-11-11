# HA-MGP – frontend

HA-MGP:s aktiva UI levereras **tillsammans med backenden från HACS-beta**, som en enda JS-modul. **Ny huvudresurs från nästa beta:** `/motogp_sensor/ha-mgp.js`. **Publicerade b12:** `/motogp_sensor/ha-motogp-next.js`. De aktiva korten är `custom:ha-motogp-next-overview-card` och `custom:ha-motogp-next-timing-card`.

**NEXT är ett historiskt tekniskt namn.** Källfilerna heter nu `ha-mgp-*.js`. Den gamla resursadressen är ett kompatibilitetsalias och de interna kort-ID:na ändras inte. Produktens namn är HA-MGP.

Utvecklingskoden i `frontend/ha-mgp-*.js` byggs till en resurs med `scripts/build-next-ui-preview.py`. Byggskriptet kontrollerar källornas Git-blobbar och testflödet säkerställer att `dist/` och HACS-kopian matchar.

Senaste publicerade beta: `2026.11.0b12` (UI `0.3.0-dev.23`). `dev` installeras **aldrig** direkt i HA. Se [status](../docs/project-status.md), [versionsguide](../docs/frontend-versioning.md) och [installation](../docs/hacs-beta-installation.md).

`ha-mgp-legacy-card.js` och äldre prototyper är historiskt/valfritt material och ska inte laddas parallellt med de aktiva korten.


## Class selector artwork

The Moto3, Moto2 and MotoGP tabs in the championship standings and weekend filter use the genuine 2024 SVG class marks from Wikimedia Commons (Moto3 logo (2024).svg, Moto2 logo (2024).svg, MotoGP logo (2024).svg), rather than synthetic italic text rendered inside an SVG. Wikimedia Commons lists these as PD-textlogo, with trademark restrictions potentially remaining. The image elements load from `upload.wikimedia.org` and degrade to readable, accessible class names if an external asset cannot load; no SVG artwork is copied into the HACS distribution. The existing class-selection and standings behavior is unchanged.
