# HA-MGP 2026.11.0b47 – schemastatus från Pulselive

**HACS beta:** `2026.11.0b47` · **Frontend:** `0.3.0-dev.91`

## Ändrat sedan b46
- Weekend-schemat använder en bekräftad, klass- och sessionsmatchad status från Pulselive Timing Gateway när Results-tabellen fortfarande säger `NOT-STARTED`.
- `RAC2` hör till samma schemalagda Race, men ny racedels `session_id` kan återöppna ett lopp efter en tidigare avslutad del. Nytt observerat `F/C` markerar passet som klart.
- Statusminnet är knutet till aktuellt GP och endast TV-delay-godkända statusar används. Ingen gissning från passerad starttid, stillastående varvräknare eller depå.
- Results-sessionsstatus uppdateras med samma befintliga femminutershämtning som används för rekord/startgrid; inga nya API-anrop behövs. Publicerat `FINISHED` ska inte skrivas över av en äldre `NOT-STARTED`.
- Efter loppet används **PRELIMINÄRT RESULTAT · EJ LIVE** för senaste tider tills officiell klassificering kan verifieras.
- Resultatet av en tidigare session kan inte retroaktivt bekräftas av Timing Gateway efter en omstart av Home Assistant om den aldrig observerades; då är Results API fallback.

## Testa
- Kontrollera status för Moto3, Moto2, MotoGP var för sig i helgschemat, särskilt RAC2 och sessioner med försenad Results-status.
- Se att aktivt race aldrig markeras Klart och att okänd status inte gissas.
- `main` orörd. **Rollback b46.**
