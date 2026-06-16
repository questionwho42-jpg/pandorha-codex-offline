# SaveLoad Technical Memory

- T43 moves the current save schema to version 4 and adds structured social encounter records.
- Save/load persists social encounters as records from `entities/social-encounter`, not as feature state or WorldState flags.
- `SqliteSaveSnapshotService` still replaces the primary snapshot transactionally and validates all rows before exposing loaded data.
- T73-T74 moves the current save schema to version 5 and adds `npcRelationships` from `entities/npc-relationship`.
- Legacy v1-v4 saves migrate to v5 with `npcRelationships: []`; v4 remains the social encounter snapshot shape and v5 adds only the NPC relationship section.
- `SqliteSaveSnapshotService` reads/writes `npc_relationships` inside the same primary snapshot transaction and rejects corrupted relationship rows as `CORRUPTED_SAVE_SNAPSHOT`.
- The RPC `SAVE_GAME_SNAPSHOT` contract now requires version 5 and includes `npcRelationships` so Worker and app snapshots stay aligned.
- The approved v6 gate adds only per-character `inventoryEvents`.
- Legacy v1-v5 snapshots must migrate to v6 with an empty inventory ledger; no other deferred feature may enter that migration.
- Save v6 is implemented with `inventoryEvents` as its only new section; metadata, RPC, Worker mapping, and SQLite snapshots share the same literal version.
- `SqliteSaveSnapshotService` orders restored inventory events by character and sequence and rejects malformed event rows before exposing the snapshot.
- The approved v7 gate adds only `equipmentLoadoutEvents`.
- Legacy v1-v6 snapshots migrate to v7; v6 keeps its inventory ledger and receives an empty equipment loadout ledger.
- Save v7 writes `equipment_loadout_events` in the same SQLite snapshot transaction and rejects malformed loadout rows before exposing loaded state.
