# HA-MGP 2026.11.0b33 – sessionsval, nedräkning och kalenderordning

**HACS beta:** `2026.11.0b33` · **Frontend:** `0.3.0-dev.71`

## Ändrat sedan b32
- Officiell källänk i baninformationen heter `Official MotoGP-page`.
- Hela banbildens rektangulära klickyta fungerar för att stänga popupen; befintlig bakgrund/Esc-hantering bevaras.
- Nästa sessions nedräkning visar dagar, timmar och minuter (`0d 12h 37m till start`) och använder befintlig tidsstämpel.
- Nästa session måste kunna kopplas till det valda GP-evenemanget; sessionsrader utanför relevant datumfönster eller med avvikande event-ID avvisas. Vid otillräcklig data visas `Nästa pass ej verifierat` utan falsk nedräkning.
- Genomförda Grand Prix visas nyaste först, men ursprungliga omgångsnummer behålls.

## Säkerhet och avgränsning
Endast frontend och release-metadata. **Ingen ändring av backend, Pulselive, API-anropsfrekvens eller banfaktaverifiering.**
Den befintliga kontrollen av eventstart har en 12-timmars förtolerans; legitima tidigare pass behöver verifieras med verkliga HA-data.

## Okulärbesiktning
Installera b33 via HACS beta, starta om HA och gör hård omladdning. Kontrollera nästa session mot kalendern, tidszon/nedräkning, genomförda race i fallande datumordning och båda popupvarianterna på mobil/dator.

**Rollback:** `2026.11.0b32`. Behåll `/config/motogp_data/` och entiteter. **Main lämnas orörd.**
