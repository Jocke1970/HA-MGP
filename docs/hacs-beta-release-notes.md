# HA-MGP 2026.11.0b21

**Beta:** `2026.11.0b21` · **UI:** `0.3.0-dev.46`

- Från b20: behåller append-only JSONL-loggning under `/config/motogp_data/api_diagnostics/` (oberoende av avstängd debug-sensor).
- Nya logghändelser: `session_started`, `first_lap_started`, `first_position`, `first_gap_reported`, `gap_updated` (sammanfattad högst var 15 s) och `first_lap_completed`. Tidigare `first_lap` behålls för bakåtkompatibilitet och betyder påbörjat varv, inte färdigt varv. Ledarens nollgap räknas inte som rapporterat avstånd.
- Varvräknaren räknar det pågående varvet som återstående. Vid sista varvet visas **Sista varvet**; detta får inte ensamt avsluta loppet.
- Slutresultat: vid Pulselive status `F` eller `C` fortsätter befintlig feed-polling var 15 s i högst fyra minuter för samma session. Den frysta UI-vyn kan då ta emot korrigerade slutvarv och placeringar från samma TV-delay-godkända klass/event.
- Inga extra API-endpoints, ingen datadump, inga sektorer påstås vara verifierade. B20-UI för schema/klassknappar/bästa varv kvar.

**Begränsning:** Händelser tidsstämplas när HA observerar TV-delay-godkänd data. Det visar inte den exakta ban-tidpunkten. Arkivet fylls inte retroaktivt. Även efter fyra minuter kan officiellt resultat ändras senare. Ingen automatisk loggning av alla slutresultatsrevisioner ännu.

**HACS:** Uppdatera b20 → b21; starta om endast mellan pass. Rollback `2026.11.0b20`. Main oförändrad.
