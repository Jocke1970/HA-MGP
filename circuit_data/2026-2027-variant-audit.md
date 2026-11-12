# HA-MGP — 2026/2027 banvariantkontroll

2026: Sporting Maps-skärmbilder, avrundade banlängder. 2027: användarens Pulselive-event JSON (22 GP + 6 TEST, tester exkluderade). **Detta är inte en direkt jämförelse mellan två Pulselive-år.**

**20 gemensamma banor:** 7 med samma angivna längd, 13 med olika. Ingen ändrad banlayout är bevisad. Små differenser kan bero på avrundning.

| Bana | 2026 (m) | 2027 (m) | Diff (m) |
|---|---:|---:|---:|
| goiania | 3820 | 3835 | +15 |
| lemans | 4190 | 4185 | -5 |
| valencia | 4010 | 4005 | -5 |
| misano | 4230 | 4226 | -4 |
| austin | 5510 | 5513 | +3 |
| jerez | 4420 | 4423 | +3 |
| barcelona | 4660 | 4657 | -3 |
| brno | 5400 | 5403 | +3 |
| sepang | 5540 | 5543 | +3 |
| redbullring | 4350 | 4348 | -2 |
| portimao | 4590 | 4592 | +2 |
| motegi | 4800 | 4801 | +1 |
| mandalika | 4300 | 4301 | +1 |

2027-API:ets eventvalda `circuit.track.id` matchar ett element i `circuit.tracks[]` för **alla 22 GP**. Källans `tracks[]` har flera varianter bl.a. Le Mans (5), Barcelona (5), Assen (6), Red Bull Ring (4), Silverstone (3), Buenos Aires (2). Den valda layoutens `is_active` är false för **Goiânia, Buenos Aires och Adelaide**; detta är en granskningssignal, inte ett konstaterat fel.

**Kontrollprioritet:** Goiânia (+15 m; **2027 tekniska mått bekräftade** mot MotoGP.com:s officiella baninformation: 3,84 km avrundat, 12 m bredd, 994 m raka, 9 höger, 5 vänster; **variantens historiska identitet fortfarande okänd**); Buenos Aires (nya och ofullständiga mått); Adelaide (**2027 tekniska data matchar MotoGP.com:s officiella baninformation, kontrollerad 2026-11-12**: 3,22 km avrundat mot Pulselive 3219 m, bredd 10 m, raksträcka 640 m, 9 höger och 7 vänster; officiell bankontur tillgänglig som referens men variantkoppling och lokalt SVG-underlag behöver fortfarande granskas); Red Bull Ring (MotoGP-chikanen); Valencia (9 vänster + 5 höger = 14 bekräftat av användaren mot MotoGP:s webbplats, trots äldre beskrivningstexter).

**För att avgöra om banvarianterna ändrats mellan åren:** granska *en* äldre 2026-eventsnapshot från samma Pulselive-endpoint och jämför valt `circuit.track.id`, bredd, raksträcka, kurvor och `modification_date`. Olika UUID är en signal att kontrollera – inte ensamt bevis för en fysisk ändring. Utgå inte från första elementet i `tracks[]`.

Detta är ett **read-only granskningunderlag**. Ingen frontend, backend, beta eller main har ändrats.
