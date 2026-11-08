# Local MotoGP circuit SVGs (optional)

The public HA-MGP bundle contains its existing schematic track drawings. It does **not**
distribute third-party SVGs. Users can optionally install their own SVG files for
corner numbers, sectors and other details. No YAML changes or external network
requests are required.

## Install in Home Assistant

Copy SVG files into `/config/www/ha-mgp/circuits/`, using the stable names below.
In a browser the corresponding URL is
`https://YOUR-HA/local/ha-mgp/circuits/sachsenring.svg`.

The overview card automatically prefers a matching local SVG if it loads.
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

These are internal HA-MGP filename identifiers, not claims about the
original SVG element IDs. A file provided as `ger2-info.svg` was identified
by the user as Sachsenring despite containing an NLD element ID.

Third-party track artwork remains in the user's own Home Assistant directory.
The open-source project includes the optional loading functionality only.
