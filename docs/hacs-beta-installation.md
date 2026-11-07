# Installera HA-MGP HACS beta 2026.11.0b13

**Frontend:** `0.3.0-dev.25`. Installera endast från `beta`, aldrig från `dev`.

1. Ta backup och bevara `/config/motogp_data/` och din HA-konfiguration.
2. Välj betan `2026.11.0b13` i HACS. Starta om HA när inget pass pågår.
3. Kontrollera `/motogp_sensor/ha-mgp.js` i webbläsaren.
4. Gå till **Inställningar → Dashboards → Resurser**. **Redigera befintlig** JavaScript module-resurs till `/motogp_sensor/ha-mgp.js`; lägg inte till ytterligare en.
5. Hård omladdning (`Ctrl+Shift+R`). Verifiera UI-version, helgschema, VM-ställning och timing.

**Rollback:** återgå till HACS beta `2026.11.0b12` och resursen `/motogp_sensor/ha-motogp-next.js`. Radera inte integrationskonfiguration, entiteter eller arkiv.

Den interna domänen är fortsatt `motogp_sensor`, och de interna Lovelace-korttyperna är oförändrade.
