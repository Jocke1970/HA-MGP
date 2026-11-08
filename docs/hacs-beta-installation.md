# Installera HA-MGP HACS-beta 2026.11.0b16

**Frontend:** `0.3.0-dev.32`. Uppdatera genom HACS beta.

1. Behåll en säkerhetskopia av Home Assistant-konfigurationen och `/config/motogp_data/`.
2. Välj `2026.11.0b16` i HACS och starta om Home Assistant när inget racepass pågår.
3. Behåll **en** Lovelace JavaScript module-resurs: `/motogp_sensor/ha-mgp.js`. Registrera inte det identiska gamla aliaset `ha-motogp-next.js` samtidigt.
4. Gör en hård omladdning med `Ctrl+Shift+R`.
5. Kontrollera att frontend är `0.3.0-dev.32`. Mellan racehelger ska den nya säsongskalendern visas, med nästa GP, kommande tävlingar och hopfällbara tidigare race. Under en racehelg ska den gamla översikten visas igen.
6. Kontrollera mobilbredd och svenska/engelska; fem språk finns med. Livetimingens egna kort och rekordchips ska inte påverkas.

**Rollback:** välj beta `2026.11.0b15` från HACS. Ingen konfiguration, historik eller entitets-ID behöver tas bort.
