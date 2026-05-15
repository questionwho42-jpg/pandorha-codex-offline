# Save Load Technical Memory

- T33C adds a pure `SaveLoadService` in the `features` layer. It does not own Worker transport, OPFS, SQLite, or UI.
- Saves are versioned with `version: 1` and only use the primary save slot for now.
- Character records and hydrated WorldState flags are validated before save and again after load.
- The service treats Worker transport failures, Worker failure responses, corrupted snapshots, and future-version snapshots as separate typed failures.
- T33C.1 keeps snapshot persistence in `features/save-load` because it validates both `Character` and `WorldState` without reversing FSD dependencies.
- The first real save stores metadata in `system:save:primary:metadata` inside `world_state_entries`, avoiding a new table before multiple slots exist.
