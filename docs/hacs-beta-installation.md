# Installera HA-MGP beta 2026.11.0b19

**Frontend:** `0.3.0-dev.40`, oförändrad från b18.

1. Säkerhetskopiera Home Assistant och bevara `/config/motogp_data/`.
2. Installera `2026.11.0b19` via HACS-beta efter publicerad prerelease. **Starta inte om HA mitt i ett pågående race**; välj ett mellanrum mellan pass.
3. Behåll en JS module: `/motogp_sensor/ha-mgp.js`. Hård omladdning (`Ctrl+Shift+R`) vid behov.
4. Efter nästa observerade API-övergång: inspektera `/config/motogp_data/api_diagnostics/YYYY-MM-DD.jsonl` med File Editor eller SSH. Datum i filnamnet följer observationens datum.
5. Journalen kräver **inte** att `Pulselive API debug` aktiveras. Vill du ha en sammanfattning i entitetsregistret, aktivera den separat under Inställningar → Enheter och tjänster → Entiteter.

Ingen retroaktiv återfyllning av tidigare pass. Rollback: `2026.11.0b18`, utan att radera journalen eller sessionsarkivet.
