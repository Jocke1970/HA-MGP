# HA-MGP status — 2026-11-08

**Publicerad beta före kandidat:** b20. **b21-kandidat:** `2026.11.0b21`, frontend `0.3.0-dev.46`, main oförändrad.

## Nytt i b21
- Utökad append-only, TV-delay-godkänd och källisolerad loggning av första start, första varv, första förarposition, första riktiga tidsavstånd, begränsade gap-uppdateringar samt första färdig varvtid. Inget sector event utan verifierad sektordata. Äldre `first_lap` bevaras.
- Varvräknare visar aktuellt pågående varv inklusive det kvarvarande antalet; `num_lap == num_laps` betyder `Sista varvet`, inte säkert raceavslut.
- Pulselive `F`/`C` ger fyra minuters avslutsfönster; då pollas samma session var 15 s och senaste frysta resultat får korrigeras med godkänd samma sessions förardata.
- B20:s modul, helgschema-modal, klassfilter och röd sessionens snabbaste varv bibehålls.

## Verifiering och gränser
- Offline regressioner testar gap-före-varvtid, nollgap, inga extra events per poll, avslutsfönster och UI sista varvet. CI och HACS-gate krävs före prerelease.
- Inte i b21: permanenta resultat-diffar med officiell slutlighetsmarkering, verifierade sektortider, officiella klasslogotyper eller förskjuten startgrid.
- HA-omstart endast mellan pass. Kontrollera ny JSONL-journal under nästa livepass. Rollback b20.
