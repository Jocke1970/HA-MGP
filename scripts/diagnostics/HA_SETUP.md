# FP1-insamling direkt i Home Assistant

Denna lösning använder Home Assistants egen automation och shell_command (inte Raspberry Pi). Inga HACS-filer behöver ersättas. Den är read-only.

## Installera före fredag 20 november

1. Kopiera scripts/diagnostics/capture_fp1.py från dev till /config/ha_mgp/capture_fp1.py via File Editor, Studio Code Server eller SSH/Terminal.
2. Skapa en HA Long-Lived Access Token under din profil. Spara endast tokensträngen (en rad) i /config/ha_mgp/.token. Använd om möjligt chmod 600 på filen. Dela aldrig token eller lägg den i Git/YAML.
3. Kopiera scripts/diagnostics/ha_mgp_fp1_capture_package.yaml till /config/packages/ha_mgp_fp1_capture.yaml.
4. Aktivera packages under den befintliga homeassistant-sektionen i configuration.yaml: packages: !include_dir_named packages. Skapa inte en dubbel homeassistant-sektion. Alternativt kan shell_command läggas separat i configuration.yaml och automationen i automations.yaml.
5. Kontrollera HA-konfigurationen, starta om och verifiera att automationen finns och är aktiverad.
6. Testa via Utvecklarverktyg -> Åtgärder -> shell_command.ha_mgp_fp1_snapshot. Scriptets --once fungerar även före insamlingsfönstret. Bekräfta att /config/motogp_data/fp1_2026-11-20.jsonl får en JSONL-rad. Om det inte går, kontrollera shell_command-loggen och att HA Core kan nå http://127.0.0.1:8123.
7. Låt automationen gå automatiskt fredag 20 november 09:45–12:45 CET. Var 15:e sekund körs en one-shot. mode: single undviker överlappande anrop.
8. Efteråt kan du kopiera JSONL-filen till chatten för analys. Skicka inte .token.

Insamlingen läser fem HA-entiteter: next_race, rider_positions, current_session, session_status och den valfria api_debug. Den sparar datumkällor, sessionsstatus, polling, TV-fördröjning och förare/varvdata. 404 från inaktiverad api_debug registreras men stoppar inte insamlingen. Den loggar HA-snapshots, inte rå HTTP-statistik från Pulselive.

GitHub-merge installerar inte något hemma hos dig: filerna måste kopieras och automationen aktiveras i Home Assistant. Ingen ny beta krävs.