# HA-MGP localization

The Home Assistant integration and its dashboard support **English, Swedish, Spanish, Italian and French**.

## Language selection

Home Assistant supplies `hass.language` (for example `sv-SE`, `en-GB`, `es-ES`, `it-IT` or `fr-FR`). The dashboard automatically selects the matching base language. Unsupported languages fall back to **English**. No additional Lovelace resources, network requests or language settings are needed.

- **Integration translations:** `custom_components/motogp_sensor/translations/{en,sv,es,it,fr}.json` supply config/options text, available sensors and entity display labels.
- **Dashboard translations:** `frontend/locales/{en,sv,es,it,fr}.json` contain user-facing UI text. `frontend/ha-mgp-i18n.js` localizes visible labels without touching race data, rider/team names, entity IDs, API states or HTML attributes.
- **Single-resource bundling:** `scripts/build-next-ui-preview.py` validates that every dashboard language contains precisely the same keys, then embeds all five catalogs into `ha-mgp.js`.
- **Fallback:** English is the base catalog; an unavailable locale uses English. A missing `hass.language` in legacy test harnesses retains its historical fixture text.
- **Contributions:** Add/edit an entry in each `frontend/locales/*.json` and update corresponding integration `translations/*.json` as appropriate. Keep translation keys exactly aligned, then run `node tests/frontend-i18n.cjs` and the frontend CI checks. Do **not** translate sensor state values, backend enums or source API data.

The initial localization primarily covers configuration, entity labels, the prominent frontend menus/headings, timing-record labels and common statuses. Additional dynamic copy and historical experimental dialogs may still need translation keys. **Do not claim 100% string coverage before a visual language review.**

## Release procedure

Strict **dev → beta → main**. Test in HACS beta only, after confirming the new UI bundle and both compatibility URLs. Switch Home Assistant's own language and reload the dashboard to inspect text wrapping and layout.
