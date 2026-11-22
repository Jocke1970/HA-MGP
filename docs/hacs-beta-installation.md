# HA-MGP b44 – HACS beta / verifiering

1. Installera **`2026.11.0b44`** via HACS beta, starta om Home Assistant och gör `Ctrl+Shift+R`.
2. Kontrollera backend **`2026.11.0b44`** och frontend **`0.3.0-dev.86`**.
3. Kontrollera att `recordLap` och `bestLap` visas i rätt klass som absolut varvrekord respektive bästa racevarv. Aktuell pole kommer från P1-kvaltiden.
4. När ett verifierat varv slår ett känt rekord under helgen ska den snabbare tiden visas som **preliminärt banrekord** utan att invänta uppdaterad officiell rekordpost.
5. Under loppet: bara en sessionssnabbaste sammanfattning (förare, tid, varvnummer); röd klocka i rätt förares snabbastevarv, inte nödvändigtvis senaste varvet.
6. TV-delay, No Spoiler, klassisolering och befintlig grid ska fungera oförändrat. Röd flagg detekteras inte via stillastående data.
7. Vid fel: rollback till **b43**. Ingen ny YAML eller separat Lovelace-resurs.

**Main lämnas orörd** tills b44 verifierats i Home Assistant.
