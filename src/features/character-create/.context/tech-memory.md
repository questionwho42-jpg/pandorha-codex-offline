# Character Create Technical Memory

## 2026-05-03

- Created the `character-create` feature as a Svelte form that submits `CharacterCreateInput` to the existing `CharacterService`.
- The UI does not duplicate the 6/6 validation rule; it only collects values and lets the domain service return typed failures.
- `mapCharacterCreateFailure` translates domain failure codes into pt-BR messages for the browser.
- T08 uses session memory only. Characters created in the browser are visible in the current app session and are lost after reload until Worker/SQLite/OPFS persistence is implemented.
- T09 keeps a single global error banner, but the mapper now uses typed failure details such as `received`, `field`, and `cap` to explain the correction without exposing technical failure codes.

## 2026-05-05 - T13A Ancestry Trait Selection

- The character creation draft now carries `ancestryTraitIds`, but `toCharacterCreateInput` intentionally does not persist them into `CharacterRecord` yet.
- `App.svelte` validates the selected trait ids with `AncestryTraitSelectionService` before calling `CharacterService`.
- `CharacterCreateForm.svelte` receives ancestry and trait catalogs from app/session wiring; it does not import static catalogs directly.
- The UI can temporarily hold invalid trait counts so the domain service remains the final validator for exactly 3 selected traits.

## 2026-05-05 - T15B Official Class And Background Catalogs

- `CharacterCreateForm.svelte` now receives official class and background catalogs from app/session wiring.
- Draft defaults use English technical ids: `classId: "vanguard"` and `backgroundId: "acolyte"`.
- The browser shows pt-BR labels from the catalogs, while `CharacterCreateInput` keeps stable English ids.
- Class passives, background benefits, and derived stat display remain outside this feature.
