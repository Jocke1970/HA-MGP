# HA-MGP 2026.11.0b42 – enhetlig startgrid och TV-delay

**HACS beta:** `2026.11.0b42` · **Frontend:** `0.3.0-dev.81`

## Ändrat sedan b41
- Den gamla T−15-gridden i översiktskortet är borttagen. Endast den nyare tredelade startgridden i timingkortet visas från T−30, tills verifierad livetiming tar över.
- TV-delay-reglaget läser `min`, `max` och `step` från `input_number.motogp_tv_delay_seconds`. En hjälpare med intervallet 0–180 s får inte längre reglagevärden upp till 300 s.
- Ogiltiga TV-delay-värden stoppas i frontend innan serviceanrop. Panelen ligger under knappen i normal layout i stället för att täcka snabbaste varv.
- VM-ställningens knapp och innehåll fungerar även efter att den gamla grid-sektionen tagits bort.
- Nya regressioner för frånvaro av dubbelgrid och hjälparstyrda TV-delay-gränser.
- b41:s Pulselive-matchning, slutresultat, spoiler-/klass-/TV-delay-skydd och b40:s pole/färg/flagg/grid behålls.

## Verifiering
- Testa ny grid T−30 till start, LIVE-övergång, reglaget med 0–180 s och fortsatt VM-ställning i Home Assistant.
- Kod-/pakettester måste passera på beta före publicering.
- **Rollback:** `2026.11.0b41`. **Main orörd.**
