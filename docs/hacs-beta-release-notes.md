# HA-MGP 2026.11.0b48 – finalhelgens kandidat

**HACS beta:** `2026.11.0b48` · **Frontend:** `0.3.0-dev.94`

## Ändringar sedan b47
- **Startgridden** visar förarens egen kvaltid i respektive ruta om den finns i den verifierade startgridposten; inga tider gissas.
- **Rekordraden före start** kompletteras med bästa racevarv vid sidan av aktuell pole och absolut varvrekord.
- **Startstatus**: före schemalagd start `STARTLISTA · INFÖR START`; efter passerad starttid inväntas säker bekräftelse från livetiming innan status ändras. Ingen automatisk LIVE-etikett från klockan.
- **Banväder**: Results API ger sessionsrapporter, inte garanterat realtidsväder. Rapporter märks med sin verkliga källa och gamla, oförändrade värden (över 10 minuter) döljs för att inte skapa en falsk aktuell väderbild.
- **b47:s** Pulselive-schemastatus, omstartade racedelar och preliminära resultat behålls. `main` orörd.

## Nästa steg
Under finalhelgen: kontrollera förstart, liveövergång, kvaltider, banrekord, schemastatus, TV-delay/No Spoiler och slutresultat. Undersök en bättre väderkälla separat, inklusive tidstämpel för faktiska vädermätningar. Denna beta ändrar inte väderleverantör.

**Rollback:** `2026.11.0b47`.
