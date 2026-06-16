# SaveLoad Scaling Roadmap

- Future versions can add dialogue trees, social flags, or multiple save slots through explicit snapshot migrations.
- Autosave should wait until manual save/load remains stable across several UI systems.
- If snapshot replacement grows too expensive, split save sections into scoped transactions while preserving the current full-snapshot contract.
- Future save versions should keep dedicated durable domains as typed arrays or tables, not generic `WorldState` blobs.
- If relationship history becomes append-only, add a separate save v6 gate for relationship events rather than expanding `npcRelationships` silently.
- Keep v7 limited to inventory ownership plus equipment loadout events; real HP, traits, combat loadout integration, or additional social history require later version gates.
- Keep inventory events inside the same primary snapshot transaction and validate every event before exposing loaded state.
- Keep equipment loadout events in the same transaction as inventory events so equipped entries cannot be restored without the inventory ledger they reference.
