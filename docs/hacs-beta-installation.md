# Installera HA-MGP HACS beta 2026.11.0b18

**Frontend:** `0.3.0-dev.40`. Installera enbart via HACS beta, inte från dev.

1. Säkerhetskopiera HA-konfigurationen. Behåll `/config/motogp_data/`.
2. Välj HACS-prerelease `2026.11.0b18` när den publicerats. Starta om HA när inga sessioner pågår.
3. Behåll exakt **en** JavaScript module-resurs: `/motogp_sensor/ha-mgp.js`. Registrera inte det identiska aliaset samtidigt.
4. Gör hård omladdning i webbläsaren (`Ctrl+Shift+R`); kontrollera `0.3.0-dev.40`.
5. Verifiera: helgschema i dialog (Stäng/Escape), Moto3/Moto2/MotoGP-knappar, röd snabbaste-tid, sessionens snabbaste varv efter målflagga, T−30 startgrid, spoilerskydd och mobil.
6. Valfri loggning: i HA:s entitetsregister, aktivera den som standard **inaktiverade** diagnostikentiteten **Pulselive API debug**. Den ger status och tidpunkter i historiken och gör inga extra nätverksanrop.

**Rollback:** HACS-beta `2026.11.0b17`. Radera inte entiteter eller sessionsarkiv.
