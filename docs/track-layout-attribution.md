# Third-party circuit layout data — MotoGP Next

The simplified circuit outlines bundled in `frontend/ha-motogp-next-header-track.js`
are adapted from:

**GameDev-Toolkit / global-motorsport-circuits-json**  
https://github.com/GameDev-Toolkit/global-motorsport-circuits-json  
License: **Apache License, Version 2.0**  
https://www.apache.org/licenses/LICENSE-2.0

The original `points` arrays in the files listed below were transformed
by a Douglas–Peucker simplification and proportion-preserving
normalization into compact SVG path strings. Coordinate transforms,
simplification, and selection of aliases constitute modifications.
They are schematic representations, not official track maps or
navigation/safety data. The original source may change independently.

## Source files

- `f1/active/lusail_international_circuit.json`
- `motogp/mandalika_international_street_circuit.json`
- `motogp/autodromo_internacional_ayrton_senna_goiania.json`
- `motogp/brno_circuit.json`
- `motogp/chang_international_circuit.json`
- `motogp/circuit_ricardo_tormo.json`
- `motogp/misano_world_circuit_marco_simoncelli.json`
- `motogp/mobility_resort_motegi.json`
- `motogp/motorland_aragon.json`
- `motogp/phillip_island_grand_prix_circuit.json`
- `motogp/sachsenring.json`
- `motogp/tt_circuit_assen.json`
- `f1/active/circuit_de_barcelona_catalunya.json`
- `f1/active/circuit_of_the_americas.json`
- `f1/active/red_bull_ring.json`
- `f1/active/sepang_international_circuit.json`
- `f1/active/silverstone_circuit.json`
- `f1/historic/algarve_international_circuit.json`
- `f1/historic/autodromo_internazionale_del_mugello.json`
- `f1/historic/circuito_de_jerez_angel_nieto.json`
- `f1/active/hungaroring.json`

The full third-party license text is retained in
`docs/third-party-track-APACHE-2.0.txt`. The repository's own code license
and all other content are separate. No connection to or endorsement by
MotoGP or the original dataset authors is implied.

Only positive, distinctive circuit-name aliases are used for track matching.
When an event does not match an entry, the UI displays **no verified
layout available**, rather than a potentially incorrect diagram.
