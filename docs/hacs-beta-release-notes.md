# HA-MGP 2026.11.0b14 — nationsflaggor och grafiska klassval

**HACS beta:** `2026.11.0b14` · **Frontend:** `0.3.0-dev.27`.

## Sedan b13

- **VM-ställning:** Förarnas verifierade nationalitetskod följer med från API till backendens klassvisa poängtabeller.
- **Livetiming:** Nationalsflagga bredvid förarnamnet, baserat på befintlig `nation` i sessionens data.
- **Klassknappar:** Grafiska MotoGP/Moto2/Moto3-etiketter i både schema och VM, och 🏁 ALL i helgschemat. Grafiken är lokal, stiliserad SVG; de äldre originalbilderna har ännu inte återfunnits i repot.
- **Säkerhet:** Saknad/okänd nationalitetsuppgift ger ingen påhittad flagga. Spoilerläget och klassisoleringen bevaras.
- **Kompatibilitet:** `ha-mgp.js` samt det byte-identiska gamla resursaliaset. Backendens integrationsdomän och `main` oförändrade.

## Installera

Välj HACS-beta `2026.11.0b14`, starta om HA efter tävlingspass och gör `Ctrl+Shift+R`. Använd **endast en** Lovelace JavaScript module-resurs: `/motogp_sensor/ha-mgp.js` (äldre `ha-motogp-next.js` fungerar också och ska inte läggas till parallellt). Kontrollera både live-/VM-flaggor och filterknappar. Flaggor kräver att den aktuella API-posten faktiskt innehåller nationalitet.

**Rollback:** HACS-beta `2026.11.0b13`. Behåll dashboard, entiteter och `/config/motogp_data/`.
