# HA-MGP 2026.11.0b46 – synliga rekordförare och omstartsrubrik

**HACS beta:** `2026.11.0b46` · **Frontend:** `0.3.0-dev.89`

## Ändrat sedan b45
- Rekordrutorna visar förare och årtal på en egen rad **under tiden**; uppgifterna är inte längre gömda enbart i en tooltip.
- Den aktuella pole-tiden visar P1-föraren och kalenderhelgens år när detta kan hämtas säkert.
- Ett snabbare verifierat varv under helgen visas fortfarande som **preliminärt banrekord**, nu med förare och årtal i rutan.
- Omstartad racedelsession `RAC2` får rubriken **Moto2 · Race · Omstart**, inte ”Del 2”. Separata sessions-ID och loppdistans skyddas fortfarande.
- b45:s restartmatchning och b44:s rekordmappning behålls.
- Ingen ändring av `main`; rollback till b45.

## Verifiering
- Kontrollera att `recordLap` och `bestLap` ger synlig förare och årtal när API:t levererar dem.
- Kontrollera startgrid, pole samt preliminära rekord. Om uppgiften saknas ska inget förare/årtal hittas på.
- Installera via HACS beta, starta om Home Assistant och hårduppdatera webbläsaren. Testa gärna under MotoGP-racet.
