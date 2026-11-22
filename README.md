# HA-MGP – Home Assistant MotoGP

Inofficiell Home Assistant-integration för MotoGP, Moto2 och Moto3.

**HACS beta: `2026.11.0b47` · Frontend `0.3.0-dev.91`.**

## Nytt i b47
- Schemat visar klass- och sessionsmatchad Pulselive-status, även efter en RAC2-omstart, i stället för att lita på passerad starttid eller en eftersläpande Results-status.
- Bekräftad avslutning från timing-gateway sparas för aktuell GP-helg tills nästa pass; Results-sessionsstatus uppdateras dessutom vid redan befintlig femminutershämtning.
- Senaste sparade tider visas som preliminärt resultat tills officiell slutklassificering verifierats.

- Rekordrutorna visar förare och årtal synligt under respektive tid, inklusive aktuell pole och preliminära rekord.
- Omstartade race märks `Moto2 · Race · Omstart` i stället för `Del 2`.
- RAC2-sessionernas säkra isolering och b44:s rekordfixar är kvar.

- Live-API: Moto2/MotoGP/Moto3 `RAC2` / `Race PART 2` mappas till kalenderns Race, med `session_id` som separerar racedelar och den omstartade delens egna varv.
- Vid omstart visar timingkortet "Del 2" i rubriken, utan att använda äldre delens snapshot. Inget antagande om en verklig rödflaggskod; `S` förblir In Progress.
- Alla rekordförbättringar från b44 ingår.

- Recordtyper från verkligt Pulselive-svar stöds: `recordLap` = absolut varvrekord, `bestLap` = bästa racevarv. `poleLap`/`fastestLap` visas inte felaktigt som historiska rekord.
- Pole-tiden kommer från verifierad P1 i aktuellt kval. Förar- och årsuppgifter visas när API:t levererar dem.
- Ett varv som slår känt, publicerat rekord under GP-helgen visas direkt som preliminärt rekord tills den historiska rekordposten uppdateras. Kräver verifierat klass-/sessionsunderlag och tillämpad TV-delay.
- Den tidigare dubbleringen av snabbaste varv är borta. Klockmarkering följer förarens sessionssnabbaste tid, även om den inte är senaste varvet.
- b43:s T−15-fix, API-verktygets placering och enhetliga grid bevaras.

**Beta för okulärbesiktning.** Installera via HACS beta, inte dev. [Release notes](docs/hacs-beta-release-notes.md) och [testguide](docs/hacs-beta-installation.md).

**Dev → beta → main.** b46 är rollback. Main ändras först efter godkännande.
