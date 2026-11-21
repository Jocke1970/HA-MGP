# HA-MGP 2026.11.0b40 – putsad startgrid

**HACS beta:** `2026.11.0b40` · **Frontend:** `0.3.0-dev.78`

## Ändrat sedan b39
- Tydligare och tätare tre-kolumns startled med större positioner, teamfärger och markerad pole.
- Nationsflaggor och startnummer när dessa uppgifter finns och är verifierade.
- En komplett publicerad grid kan visas även när API:t utelämnar startnummer. Okända nummer gissas inte eller visas som `#–`; en exakt matchning inom samma klass kan fylla i uppgiften.
- Schemalagd start och växlingen från startgrid till verifierad livetiming är oförändrade. Ingen Sprint-tid hårdkodas.
- b39:s manuella API-verktyg och tidigare rättningar behålls.

**Rollback:** `2026.11.0b39`. **Main orörd.**
