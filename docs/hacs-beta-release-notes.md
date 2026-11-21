# HA-MGP 2026.11.0b37 – kval, TV-delay och förseningar

**HACS beta:** `2026.11.0b37` · **Frontend:** `0.3.0-dev.75`

## Ändrat sedan b36
- Q1-panelens kvalpositioner märks inte längre som P1/pole. MotoGP: två går vidare till Q2 och övriga visas som preliminära P13+. Moto2/Moto3: fyra vidare och övriga preliminära P19+.
- Under Q1 och Q2 visas förarens snabbaste varv på huvudraden och senaste varv på underraden. Race/Sprint är oförändrade.
- En liten TV-delay-knapp med visat värde expanderar till ett skjutreglage (0–300 s, 5-sekunderssteg), kopplat till befintlig HA-hjälpare `input_number.motogp_tv_delay_seconds`. Om hjälparen saknas visas detta tydligt och ingen HA-skrivning görs.
- Vid passerad schemalagd start utan matchad livefeed visas start ej bekräftad. Efter fem minuter markeras möjlig försening, utan att anta om det officiella schemat hunnit uppdateras. Förstartsvyn kan kvarstå upp till 45 minuter medan matchad livefeed inväntas.

## Oförändrat
- Backendens TV-delaybuffert och API-polling.
- B36:s Results-datumskydd och Broadcast-fallback, historiska resultat och Sprint endast för MotoGP.
- HACS levererar fortfarande EN integrerad JS-resurs och inget extra installationsscript i HA.

## Okulärbesiktning
Kontrollera Q1 för alla tre klasserna, Q2, race/sprint, TV-delay-knappens öppning/stängning och faktisk hjälparuppdatering. Bekräfta att en väntande session efter schemalagd start inte felaktigt markeras LIVE. Installera via HACS beta och gör Ctrl+Shift+R.

**Rollback:** `2026.11.0b36`. Behåll `/config/motogp_data/` och befintliga entiteter. **Main orörd.**
