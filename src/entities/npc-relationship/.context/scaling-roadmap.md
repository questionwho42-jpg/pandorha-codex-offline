# Scaling Roadmap

- T73 selected save v5 minimum persistence for `npcRelationships`; future persistence changes should follow the same A/B/C gate before changing save versions.
- Relationship state is keyed by NPC id for the durable record and by `social-pressure-${encounterId}` for pressure idempotency.
- Keep individual NPC relationship state out of `WorldState`; WorldState remains for narrative consequence flags only.
- If relationship history becomes important, add an append-only event table instead of overloading `appliedPressureKeysJson`.
- If relationship effects become mechanical bonuses or penalties, define the official rule in `docs/system/` before expanding the service.
- If multiple relationship causes need independent ledgers, replace `appliedPressureKeysJson` with a normalized child table in a later migration.
