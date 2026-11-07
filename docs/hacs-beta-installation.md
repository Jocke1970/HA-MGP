# Installera HA-MGP HACS-beta 2026.11.0b14

**Frontend:** `0.3.0-dev.27`. Installation via **beta**, aldrig direkt från `dev`.

1. Ta backup och bevara `/config/motogp_data/` och din HA-konfiguration.
2. Välj betan `2026.11.0b14` i HACS. Starta om Home Assistant när inget pass pågår.
3. Behåll din befintliga Lovelace-resurs `/motogp_sensor/ha-mgp.js` (JavaScript module). För äldre installationer: ersätt den gamla URL:en med denna, **skapa inte ytterligare en**.
4. Gör hård omladdning (`Ctrl+Shift+R`).
5. Kontrollera frontend `0.3.0-dev.27`, klassknappar i schema/VM och nationsflaggor där data finns. Se till att schemat och VM fortfarande stänger varandra.

**Rollback:** välj HACS-beta `2026.11.0b13`. Den gamla `/motogp_sensor/ha-motogp-next.js` finns som kompatibilitetsalias. Radera inte befintlig konfigurationspost, entiteter eller sessionsarkiv.

Domänen är fortsatt `motogp_sensor`; de interna korttyperna är oförändrade.
