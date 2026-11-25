# HA-MGP 2026.11.0b49 – Valencia-historik i toppkortet

**HACS beta:** \`2026.11.0b49\` · **Frontend:** \`0.3.0-dev.95\`

## Nytt sedan b48
- **Banhistorik i toppkortet:** sammanhållen, hopfällbar sektion med all-time kvalrekord, snabbaste racevarv, pole 2025 och racevinnare 2025 för MotoGP, Moto2 och Moto3 på Valencia.
- Historiken har källänkar, är låst till rätt bana och evenemangsår och innehåller inga resultat från pågående helg.
- Fullbreddslayout inne i befintligt toppkort, med tabell som kan scrollas horisontellt i smala vyer.
- Samma befintliga liveflöde, väder och kortfunktioner som b48. Inget Open-Meteo ännu.

## Test under finalhelgen
Verifiera Valencia-historiken för alla klasser, mobilbredd, kortets omrendering, TV-delay, No Spoiler, startgrid, omstarter och resultatstatus. Om 2025-data inte visas: kontrollera att GP:s bana verkligen identifieras som Circuit Ricardo Tormo och att eventåret är 2026.

**Rollback:** \`2026.11.0b48\`. \`main\` oförändrad.
