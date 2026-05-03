# Character Create Technical Memory

## 2026-05-03

- Created the `character-create` feature as a Svelte form that submits `CharacterCreateInput` to the existing `CharacterService`.
- The UI does not duplicate the 6/6 validation rule; it only collects values and lets the domain service return typed failures.
- `mapCharacterCreateFailure` translates domain failure codes into pt-BR messages for the browser.
- T08 uses session memory only. Characters created in the browser are visible in the current app session and are lost after reload until Worker/SQLite/OPFS persistence is implemented.
