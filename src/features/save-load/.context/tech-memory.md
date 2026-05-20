# SaveLoad Technical Memory

- T43 moves the current save schema to version 4 and adds structured social encounter records.
- Save/load persists social encounters as records from `entities/social-encounter`, not as feature state or WorldState flags.
- `SqliteSaveSnapshotService` still replaces the primary snapshot transactionally and validates all rows before exposing loaded data.
