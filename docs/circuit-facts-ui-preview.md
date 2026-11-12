# Circuit details: UI preview (dev, not beta)

The calendar's **2027** circuit modal now reads a fixed set of 22 provisional technical snapshots transcribed from `circuit_data/<id>/season_2027.json`, bundled into the existing header source for offline read-only display. Information stays **year-scoped**: the 2026 modal retains existing reviewed facts; a 2027 event does not borrow 2026 values or historical race records.

- Data shown: length (metres converted to km, three decimals), width, longest straight, left/right turns **only when the field exists**.
- Provenance label: **Preliminära banmått · Pulselive 2027 (ej oberoende verifierade)**.
- Buenos Aires currently has only length. Other fields stay absent.
- Adelaide technical figures can be displayed while its **layout illustration is still missing**.
- The dedicated small hero display remains on established facts only. No new API calls or inferred records.
- Calendar tile outlines grow from 73px to 106px high; popup large illustration grows to max 400px with viewport-dependent height, without changing dialog width.
- The two JS aliases remain built from the same source. b28 and main are untouched.
- Next step: verify tablet/mobile screenshots and promote only through dev → beta → main.

## 2026 partial coverage
The 2026 registry includes **22 documented lengths**, predominantly from user-supplied Sporting Maps screenshots. These are now exposed in the calendar's **2026** popup with source and explicit partial/non-official verification label. Where the existing official Portimão/Lusail spec table is available it continues to take precedence.

For an active 2026 next-GP header, the UI can display a **preliminary length only** when verified header facts are absent. It never invents width, corners, straight or record data. Do not reuse those lengths as verified 2027 values.
