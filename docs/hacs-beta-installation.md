# HA-MGP b45 – HACS beta / verifiering

1. Installera **`2026.11.0b45`** via HACS beta, starta om Home Assistant och gör `Ctrl+Shift+R`.
2. Verifiera backend **`2026.11.0b45`** samt frontend **`0.3.0-dev.87`**. Äldre UI (dev.82) innehåller inte de nya fixarna.
3. Vid rödflagg och omstart: `RAC2` ska matchas mot samma schemalagda Race, men visa `Del 2` och livefeedens egna varv (t.ex. 4/7). Loppet är fortsatt pågående vid status `S`.
4. Byte av `session_id` ska rensa föregående delens snapshot. Två olika session-ID i HA-sensorerna får aldrig kombineras.
5. Rekord: b44:s `recordLap`, `bestLap` och preliminära helgrekord ska fortsätta fungera; TV-delay, No Spoiler och klassisolering bevaras.
6. Vid fel: återgå till **b44**. `main` ändras inte.
