# Character Starting Equipment Technical Memory

## 2026-06-18 - Starting Kit Resolver

- Created `features/character-starting-equipment` as a pure resolver for approved starting kits.
- The feature depends only on `shared/lib/result`; it does not import inventory, save/load, app state, UI, or `docs/system` files.
- Kits use stable class ids (`vanguard`, `hunter`, `weaver`, `emissary`) and catalog ids approved in `docs/process/starting-equipment-ledger-grant-gate.md`.
- `weaver` keeps `dagger` as `count: 2`; the app bridge expands that into two separate equipment ledger entries.
- Unsupported classes return `STARTING_EQUIPMENT_CLASS_NOT_SUPPORTED`; there are no thrown errors or implicit fallback kits.
