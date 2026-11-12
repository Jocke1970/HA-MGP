# Dialog placement & track zoom (dev.64)

- Both circuit dialogs are offset +12px vertically with max-height 100dvh - 64px, retaining scrollable body and accessible close buttons.
- Current GP popup map height: clamp(255px,43dvh,400px), matching the calendar popup proportions.
- Dialog widths, fact cards, source labels and mobile layout retained. No backend/API changes.
- Beta b29 and main are untouched; visual acceptance in HA remains necessary.
