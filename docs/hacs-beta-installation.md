# Installera MotoGP HACS beta 2026.11.0b7

**Next UI 0.3.0-dev.14.** Uppdateringen tar med banlayout, banväder i toppkortet, förskjuten startgrid för hela Q1/Q2-fältet samt en korrigerad statusrad mellan passen.

1. Bevara `/config/motogp_data/`, dashboarden och MotoGP-integrationens konfigurationspost. Ta en HA-backup.
2. Välj **2026.11.0b7** (prerelease) i HACS/Marketplace. **Starta inte om HA under ett pågående race- eller kvalpass.**
3. Starta om HA efter avslutat pass. Kontrollera att integrationen laddas utan fel och att banväder-sensorn fortfarande finns.
4. Behåll din enda Lovelace-resurs av typen JavaScript module:
   ```text
   /motogp_sensor/ha-motogp-next.js
   ```
   Ändra inte adressen om den redan stämmer. **Inget `?v=` och inga dubbletter.**
5. Ladda om med **Ctrl+Shift+R** och verifiera version **0.3.0-dev.14**. Titta på banlayout och väder i toppen, Q1-utslagna i de sista gridpositionerna, samt **MELLAN PASSEN** under ett framtida Sprint/Race i stället för status för föregående klass.

**Rollback:** via HACS till senaste tidigare publicerade beta **2026.11.0b4**, starta om efter passet, ladda om dashboarden. Låt arkiven vara kvar.

**Begränsning:** banritningar är schematiska och endast tillgängliga när banan matchar en verifierad lokalt paketerad form. Saknade eller tvetydiga Q1-data ska inte visas som officiell startgrid. Tidigare godkänd MGP-integrationsikon följer i en senare version.
