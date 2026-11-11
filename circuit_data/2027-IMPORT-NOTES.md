# 2027 Pulselive snapshot — 2026-11-11

- The uploaded event payload has **28 events**, comprising **22 GP** and **6 TEST**. Only GP circuit technical fields were imported.
- Values are recorded in each `season_2027.json`, not copied over permanent `facts.json` or the earlier `season_2026.json`. The source spells `lenght`; registry spells `length_m`.
- The shared source event additionally contains circuit and track UUIDs, 2027 event dates and artwork links. These have deliberately not been imported in this first normalized snapshot; reconcile them with the event API before connecting the UI.
- Valencia: the structured track contains **9 left + 5 right = 14 turns**. English/French text descriptions mention 8 left + 5 right, 13 turns. The numeric record is retained with review note, not presented as indisputable.
- Buenos Aires has null width, longest straight and corners; Goiânia, Buenos Aires and Adelaide require track-variant review (inactive flags in source).
- `season_2027.json` represents a supplied provisional snapshot, not a guaranteed final 2027 circuit selection. Track drawings are not copied or bundled.
- Keep dev → beta → main. No frontend change or automatic scraper in this commit.
