# HA-MGP — status 8 november 2026

**Senaste bekräftade publicerade beta innan b18-gate:** `2026.11.0b17` · UI `0.3.0-dev.37`.
**b18-releasekandidat:** `2026.11.0b18` · UI `0.3.0-dev.40`.

## Innehåll i kandidat
- Helgschema öppnas i modal från toppkortets knapp i stället för mellan toppkort och separat livetiming.
- Kategorifilter med grafiska textmärken: Moto3, Moto2, MotoGP. Klickbarhet och klassisolerad filtrering omfattas av regressioner. Märkena är inte officiella logotyper.
- Förarens snabbaste giltiga varv rött. Sessionens snabbaste **observerade** varv visas även med fryst avslutat sessionssnapshot.
- Pulselive API debug: separat diagnostiksensor avstängd som standard, använder befintlig TV-delay-godkänd live-feed utan nya anrop. Attribut för status, sessions-ID, första observerade roster och varv, med betydelsefulla ändringstider och utan massdump av JSON.
- B17:s backend, T−30-grid, historik och spoilerskydd bevaras. Inget `/event/.../entry`-anrop på beta.

## Verifierat och kvar
- I GitHub Actions har 2026 års Results/Broadcast, sessions-API, live-lite, race-grid och classification svarat HTTP 200. Deltagar-`entry` gav HTTP 400 och får inte vara en produktionsförutsättning.
- `/riders` och `/teams` returnerar kataloguppgifter, inte bekräftat deltagande i ett pass.
- Nästa steg: b18 CI/release, installation endast via HACS-beta, visuellt test av modal, klassfilter och varvtider vid verklig avflaggning. Main först efter verifiering.
- [PyMotoGP](https://github.com/tejred213/PyMotoGP) beskriver historisk Analysis-PDF via `session_files.analysis.url`. Potentiell separat framtida källa för kontroll av historiskt PB/varv, men ingår **inte** i b18.

## Dev efter b18

På dev finns fortsatt API-inventering, bl.a. `/riders`/`/teams` och en experimentell `/event/.../entry`-väg som svarade HTTP 400. Dessa är uttryckligen **inte med i b18:s produktionsbackend**. Nästa steg är att kartlägga historiska Analysis-PDF:er och förbättra det officiella deltagarunderlaget före en framtida beta.

## UI-fix: dubbelt helgschema (dev.42, inte i beta)

- Rotorsak: äldre UI-`_schedule` lade tillbaka en separat `Helgens schema`-panel precis ovanför den fristående live-timingen när en session var aktiv. Den nya toppkortsmodalen fanns samtidigt.
- Åtgärd: äldre panel och dess extra toggle borttagna. Klassfiltren finns kvar i modalens sessionslista. Det är endast toppkortets Helgschema-knapp som äger modalens öppna/stängda läge.
- Regression: live-fallet ska sakna `data-motogp-schedule-toggle`; paketeringskontrollen kräver `data-mgp-schedule-jump` och `mgp-weekend-dialog` samt förbjuder det gamla attributet.
- UI `0.3.0-dev.42` byggt på dev; behöver full CI och visuell HA-verifiering via kommande beta. Publicerad b19 är orörd.

## UI-fix: röd snabbaste varvtid (dev.43, ej beta)

- Tidigare fick **alla** förares `Snabbaste`-rader röd färg. Orsak: varje giltig `best_lap_time` gav röd CSS-klass.
- Nu blir endast snabbaste observerade varvtiden i det frysta, matchande sessionssnapshotet röd. Övriga förares bästa varv är neutrala; separat PB-chip/färg vid förbättring behålls.
- Regression med flera förare bekräftar exakt en röd sessionstid, neutral tid för övriga samt fortsatt spoilerskydd och klassisolering.
- GitHub Actions: frontend, helhetstest och HACS-bundlebygge gröna för källversionen. Publicerad b19 är oförändrad. Nästa betakandidat får även med fixen mot det återkommande Helgschema-kortet från dev.42.

## Nästa dev-kandidat: varvvisning, målgång och Pulselive-gaplogg (2026-11-08)

- **Varv:** `num_lap` är pågående varv, inte antal kompletta varv. UI dev.46 visar kvarvarande *inklusive* det pågående varvet och `Sista varvet` när `num_lap == num_laps`. Ett lika varvnummer är **inte** ett säkert målflaggskriterium.
- **Slutresultat:** Pulselive `F` och `C` är verifierade avslutskoder; en redan matchad session fortsätter polling var 15:e sekund under högst fyra minuter efter kodväxlingen, i stället för att gå direkt till fem minuters idle. UI håller och uppdaterar samma frysta sessionssnapshot högst fyra minuter. Korsande klass/event/session och TV-delay-otillåten data avvisas; detta garanterar inte att hela klassificeringen är officiellt slutlig.
- **Diagnostik:** tidigare `first_lap` behålls för bakåtkompatibilitet men betyder första positiva `num_lap`. Nytt: `session_started`, `first_lap_started`, `first_position`, `first_gap_reported`, `gap_updated` (max en loggsammanfattning per 15 s och endast vid förändring efter baseline), och `first_lap_completed` (giltig fullständig varvtid). Nollavstånd för ledaren räknas inte som ett tidsavstånd. Data skrivs i befintlig append-only JSONL utan fler API-anrop.
- **Obekräftat:** inga sektortider har verifierats ur Pulselive, och differenserna bevisar inte sektorpunkter. Nuvarande b20 i HA är oförändrad; dev.46 måste beta-testas innan nästa main.

## Weather/backend and verified circuit facts — dev.48 (2026-11-08)

- Results API event/category are distinct from Broadcast API IDs. The weather backend reads category UUIDs from `results/categories` and event IDs from `results/events`; never mixes identifiers. A live session must match exact event, class and `RAC`/`SPR`/`FPn` etc; no older-session fallback.
- The `track_weather` sensor retains its existing entity and core fields. Extra metadata `source_session_id`, `results_event_uuid`, `results_category_uuid`, `report_type=session_report`, `live_weather_verified=false`, `checked_at` and `updated_at` distinguish fetch time from changed report data. The API does not provide an authenticated weather measurement timestamp in our verified payload; no live claim.
- `tests/test_weather_conditions.py` verifies exact session, class/event separation and historical fallback only for finished sessions. Backend change remains on `dev`, not in b21 or main.
- Header dev.48: official 2026 Lusail metadata displayed with existing schematic: 5.38 km, 12 m width, 1,068 m longest straight, 10 right turns and 6 left. Links to MotoGP circuit page and user-provided official `qat-info.svg`. External SVG content was not fetched/verified and is **not embedded** as a replacement. The facts are explicit and only shown for verified Lusail, not fabricated for other circuits.
- Pending: verify actual weather timing in a future live session, QA frontend in HA after a beta build, and assess a safe data-driven source for every circuit's SVG/specs. Follow dev → beta → main.
