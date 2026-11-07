# MotoGP project status — 2026-11-07

- `dev`: 2026.11.0b3, Next `0.3.0-dev.10`, four independent CI workflows passed.
- `beta`: prerelease 2026.11.0b3, pending on-host acceptance.
- `main`: unchanged.

## Added in b3

Rider championship standings for MotoGP, Moto2 and Moto3 now display rider number, team and a verified provider-supplied team-color marker. The Results API provides rider/team data, while Broadcast API teams/colors are resolved by *broadcast* season/category UUID, not Results category UUID. Ambiguous or unavailable colors are neutral rather than guessed. The older MotoGP standings sensor retains its identity and all legacy data.

Added regression tests for category-scoped color matching, correct rider numbers, CSS-safe colors, mobile UI, missing data and exact JS package parity. Staged Next build is dev.10, backend b3.

## Safety / UX

No new frontend resource or URL query version; clean path: `/motogp_sensor/ha-motogp-next.js`. No HA restart or HACS updates during a live sprint. The approved MGP brand icon is prepared separately but remains uncommitted; it does not block timing/standings improvements.

Next: controlled HACS beta installation *after* sprint and manual verification before any promotion to main.
