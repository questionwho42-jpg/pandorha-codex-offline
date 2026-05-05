# Character List Technical Memory

## 2026-05-03

- Created the `character-list` feature as a read-only UI slice under `src/features` because it coordinates entity data for the app surface without owning Character domain rules.
- `createCharacterListView` maps validated `CharacterRecord` values into pt-BR display copy and keeps formatting logic outside `App.svelte`.
- `CharacterList.svelte` is presentational and receives records as props; it does not query SQLite, create characters, or apply RPG validation.
- The empty state is the only runtime state wired in T07. Real repository/Worker data is deferred until the persistence bridge exists.
- T08 keeps the list read-only but now receives session-created records from `App.svelte`; creation remains owned by the separate `character-create` feature.

## 2026-05-05 - T15B Official Identity Labels

- `createCharacterListView` now accepts ancestry, class, and background catalogs to show readable pt-BR identity labels.
- The list falls back to raw ids if a catalog label is missing, so broken app wiring remains visible instead of hiding data.
- The feature still does not apply derived stats, trait effects, background benefits, or persistence.
