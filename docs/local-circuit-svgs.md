# Local MotoGP circuit SVGs (optional)

The public HA-MGP bundle contains its existing schematic track drawings. It does **not**
distribute third-party SVGs. Users can optionally install their own SVG files for
corner numbers, sectors and other details. No YAML changes or external network
requests are required.

## Install in Home Assistant

Copy SVG files into `/config/www/ha-mgp/circuits/`, using the stable names below.
In a browser the corresponding URL is
`https://YOUR-HA/local/ha-mgp/circuits/sachsenring.svg`.

The overview card automatically prefers a matching local SVG if it loads. The track thumbnail is clickable: opening it shows an enlarged layout and verified circuit facts (including MotoGP records when available).
If the file is missing or cannot be loaded, the existing schematic track
outline stays visible. Le Mans uses a neutral missing-file message because
there is no existing schematic source for that circuit.

## Supported circuit filenames

| Circuit | Local SVG filename |
|---|---|
| Lusail | `lusail.svg` |
| Buriram | `buriram.svg` |
| Circuit of the Americas | `austin.svg` |
| Mandalika | `mandalika.svg` |
| Red Bull Ring | `redbullring.svg` |
| Motegi | `motegi.svg` |
| Phillip Island | `phillip.svg` |
| Sepang | `sepang.svg` |
| Valencia | `valencia.svg` |
| Portimão | `portimao.svg` |
| Sachsenring | `sachsenring.svg` |
| Assen | `assen.svg` |
| Brno | `brno.svg` |
| Balaton Park / Hungarian GP | `balatonpark.svg` |
| Mugello | `mugello.svg` |
| Barcelona-Catalunya | `barcelona.svg` |
| Le Mans | `lemans.svg` |
| Jerez | `jerez.svg` |
| Goiânia | `goiania.svg` |

The three circuits without local SVGs in this 2026 set are **Silverstone,
MotorLand Aragón and Misano**; they continue using the existing schematic
shapes. A missing local file never blocks the Overview card.

These are internal HA-MGP filename identifiers, not claims about the
original SVG element IDs. A file provided as `ger2-info.svg` was identified
by the user as Sachsenring despite containing an NLD element ID.

Third-party track artwork remains in the user's own Home Assistant directory.
The open-source project includes the optional loading functionality only.

## Season calendar (off-weekend)

The next Grand Prix appears once in the highlighted calendar hero with a track
thumbnail. Remaining upcoming races and completed races show compact track
thumbnails when a matching circuit is known. Completed races use muted,
greyscale cards with a checkmark. The existing circuit registry is shared with
the race header; unknown layouts display a missing-layout label rather than
borrowing another circuit's outline. The built-in shapes are schematic and do
not guarantee variant-specific MotoGP geometry (notably the Red Bull Ring
T2A–T2B chicane); only use verified local SVG variants for such details.

The overview and calendar both use local SVGs from the directory above when
present and loadable, falling back to their existing schematic shape otherwise.

## Clickable season archive and 2027 calendar (dev)

The existing standard GP header remains the highlight for the backend's current season. The remaining upcoming races and the muted completed races open a detail dialog with the known circuit layout and shared circuit facts. For finished events, the dialog requests race classification, Sprint and Q2 pole from the authenticated, read-only `motogp_sensor/event_results` WebSocket command. Requests happen only after a click, are restricted to event UUIDs from the coordinator's active season, respect no-spoiler mode and are held in a short-lived in-memory cache. They do not create a second lap archive or claim Q1 is pole.

A 2026 / 2027 season selector also offers FIM's **provisional 22-round 2027 calendar** (published 25 September 2026) as a clearly identified snapshot, even when Pulselive still has only 2026 as its current season. Published snapshot identifiers are UI-only and must **never** be used as Pulselive event/session identifiers. The provisional calendar includes new Buenos Aires and Adelaide Street Circuit events; there is no asserted track outline for either until the MotoGP layout is verified. Once Pulselive exposes 2027 as the active backend season, the live event list takes precedence. Event dates remain subject to FIM changes, so compare them with the current official calendar before release.

- FIM: https://www.fim-moto.com/en/news/news-detail/article/2027-provisional-fim-motogptm-world-championship-calendar
- MotoGP: https://www.motogp.com/en/calendar/2027

## 2027 circuit reference artwork and attribution

The 2027 preview uses Creative Commons credits **in the visible detail dialog** and does not treat an artist's drawing as proof of the official race configuration:

| Venue | Wikimedia artwork | Artist | License | Validation |
|---|---|---|---|---|
| Adelaide Street Circuit | [Adelaide MotoGP Proposal.svg](https://commons.wikimedia.org/w/index.php?curid=198168198) | Houseofsloth | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Proposed MotoGP route; preview only until official 2027 course is verified |
| Buenos Aires | [Autódromo Oscar y Juan Gálvez reference](https://commons.wikimedia.org/w/index.php?curid=38920822) | Gustavo Girardelli | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Historical map reference; exact 2027 configuration not validated |

The Buenos Aires work contains information derived from OpenStreetMap and carries the ODbL provenance notice. Its share-alike condition applies to adaptations. Both files require visible attribution (artist, source, license, indication of modifications). We currently **link** the Buenos Aires reference, without treating its unknown historical variant as MotoGP 2027. Adelaide's proposed layout is linked as an external preview, explicitly labeled as unverified. No third-party SVG file is bundled or transformed by HA-MGP. Attribution in the UI does not imply that either artist endorses HA-MGP, and the proposed Adelaide profile must not be labeled as an approved 2027 race layout.

## Weekend agenda layout (dev.60)

The weekend agenda now expands as a normal full-width section directly **below** the existing GP header, following the championship-standings interaction pattern instead of covering the hero in a modal. Its Moto3 / Moto2 / MotoGP / ALL filter controls, event order, collapsible days and close button are unchanged. The circuit information dialog remains separate; no changes to MotoGP class buttons. This UI experiment belongs to `dev` only until visually reviewed for a later beta.

## Calendar and circuit popup review (dev.61)

- The year selector begins with 2026/2027 and adds later years as they arrive. It defaults to the current calendar year, while only real API-backed years receive live session/results identifiers. Earlier years remain selectable but are explicitly marked unavailable unless season-specific history exists. Never reuse another season's event identifiers.
- The FIM provisional 2027 future-season calendar shows all 22 rounds as ordinary clickable tiles; it has **no separate Next Grand Prix hero**. The current API season alone owns the regular GP hero.
- The calendar's event detail map is larger, with a viewport-centered modal, a persistent title/close row and scrollable content.
- The circuit facts modal uses a viewport-centered flex dialog with scrollable body and a close row that remains accessible even on shorter displays.
- The weekend schedule remains an inline section; its MotoGP/Moto2/Moto3/ALL controls were **not changed** in this pass.

These changes are for dev review; beta b26 and main remain untouched until visual validation.

## Circuit popup header polish (dev.62)

The current circuit detail dialog has its own `mgp-circuit-dialog-head` with flex-aligned title and styled close button, rather than reusing the deleted weekend-dialog header styles. The body remains scrollable and the close control accessible on short screens. This is isolated frontend polish, **not** a release to beta.

The verified `CIRCUIT_FACTS` registry currently holds only Portimão and Lusail. Other layouts may render via the schematic or local SVG registry while official dimensions/records are unavailable. Do not infer facts from a sketch; add sourced facts and verify the exact track variant separately.
