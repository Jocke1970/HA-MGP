# HA-MGP 2026.11.0b36 – rätt Results-datum och Sprint-ruta per klass

**HACS beta:** `2026.11.0b36` · **Frontend:** `0.3.0-dev.74`

## Ändrat sedan b35
- Backend filtrerar felaktigt daterade Results API-sessioner utanför aktuellt GP, med ett dygns tolerans för legitima torsdagspass/tidszonsgränser. Portugal 20–22 nov ska inte blandas med Results-rader 13–15 nov.
- Filtreringen används för `sessions_all`, MotoGP `sessions` samt kval-/banrekordurval, utan att ändra historiska resultat eller ID:n för giltiga Results-sessioner.
- Broadcast-schema behålls som separat fallback med korrekt källmärkning och utan Results-ID. Diagnostik innehåller `results_sessions_rejected` samt `broadcast_fallback_count`. Gult schema kan nu ha orsaken `stale_results_sessions_rejected`.
- I historiska resultat visar endast MotoGP en Sprint-ruta. Moto2 och Moto3 visar Pole (Q2) och raceresultat som tidigare.

## Avgränsning
Ingen ändring i API-anropens frekvens, inga extra endpoints, ingen ändring av TV-delay och ingen UI-ombyggnad. Tidigare b35-fixar för timingkortet ingår. Regressionstest körs på ett blandat Portugal-schema med gamla Results-datum och korrekta Broadcast-tider.

## Okulärbesiktning
Installera b36 via HACS beta. Bekräfta datum och källor i `sensor.motogp_next_race`, nästa pass och att Moto2/Moto3 inte får Sprint-rutan. Var särskilt uppmärksam på om Results börjar leverera nya korrekta datum under tävlingshelgen.

**Rollback:** `2026.11.0b35`. Behåll `/config/motogp_data/` och entiteter. **Main orörd.**
