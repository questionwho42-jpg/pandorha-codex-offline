# WorldState Technical Memory

- T32 creates a key-value entity slice for narrative world flags without UI, Worker, SQLite adapter, or migration.
- Keys use English technical namespaces with `:` separators. `location:`, `npc:`, and `plot:` are writable narrative namespaces.
- `system:` and `engine:` are valid read namespaces, but `WorldStateService.setNarrativeFlag` blocks writes to them.
- Values are stored as validated JSON text in `world_state_entries.value_json` and hydrated back into JSON-compatible data at service boundaries.
- All fallible operations return `Result`; repository failures and corrupted records are explicit data, not thrown exceptions.
