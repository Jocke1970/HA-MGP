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
