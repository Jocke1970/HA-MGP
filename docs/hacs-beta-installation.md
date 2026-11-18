# HA-MGP b36 – HACS beta / okulärbesiktning

1. Säkerhetskopiera Home Assistant. Behåll `/config/motogp_data/` och registrerade entiteter.
2. Installera **`2026.11.0b36`** från HACS beta efter att prerelease finns. Installera inte dev.
3. Starta om Home Assistant och gör en hård omladdning (`Ctrl+Shift+R`).
4. Bekräfta frontend `0.3.0-dev.74`.
5. I `sensor.motogp_next_race`: kontrollera `sessions_all`. För Portugal 20–22 nov ska gamla Results-rader daterade 13–15 nov vara borta. Giltiga Broadcast-rader 20–22 nov ska finnas kvar (med `source: broadcast_schedule`, tomt `id`, `category_id: null`).
6. Kontrollera `next_weekend_api_status.results_sessions_rejected` och `broadcast_fallback_count`. Gul schemastatus med `stale_results_sessions_rejected` är förväntad om Results fortfarande levererar gamla datum.
7. Jämför helgschemats datum/tider med aktuellt officiellt schema, särskilt söndagen: MotoGP warm-up 10:00, Moto3 race 11:00, Moto2 race 12:15, MotoGP race 14:00 (svensk tid).
8. Öppna historiska resultat för MotoGP/Moto2/Moto3. Endast MotoGP får visa Sprint-rutan. Kvalets verifieringsplupp och övriga resultat ska fungera som innan.
9. Kontrollera nästa-session-chip samt timing-/förstartsläge utan gamla FP2-pass. Live måste fortfarande invänta rätt matchning/TV-fördröjning.
10. Vid problem: rollback till **b35** via HACS beta; radera inga historiska data eller entiteter.

**Main lämnas orörd** tills okulärbesiktningen är godkänd.
