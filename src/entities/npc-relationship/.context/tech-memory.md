# Technical Memory

## T72 NPC Relationship Core

- `NpcRelationshipService` is an entity-level domain service for durable individual NPC relationship state. It stays separate from faction Fame/Infamy, `WorldState`, save/load snapshots, UI, and Worker RPC.
- The persistence contract is expressed through `npcRelationships` plus Drizzle-Zod insert/select schemas, but T72 does not register the table in migrations or `drizzle.config.mjs`.
- Pressure consequences are idempotent by `pressureKey`; repeated keys return a typed success with `applied: false` and do not write through the repository.
- Persisted pressure key corruption is classified as `CORRUPTED_NPC_RELATIONSHIP_RECORD`, while malformed caller input is classified as `INVALID_NPC_RELATIONSHIP_INPUT`.
- The fake repository is in-memory and typed through `NpcRelationshipRepositoryPort`; unit tests do not use `jest.mock()` or partial mocks.

## Validation Notes

- Reverse TDD was used for `NpcRelationshipService` before adding implementation files.
- `vitest.config.mjs` includes `src/entities/npc-relationship/domain/NpcRelationshipService.ts` in the 100% coverage gate.
- The service currently models only conservative relationship effects: attitude degradation, strained status, enemy status after mental break, pressure damage, and pressure key ledger updates.

## T73-T76 Durable Persistence And Social Wiring

- `npc_relationships` is now registered through Drizzle, migration `0006_bent_havok`, and `PANDORHA_SQLITE_MIGRATIONS`.
- `DrizzleNpcRelationshipRepository` keeps the same repository port as the in-memory fake and validates write/read rows with Drizzle-Zod before returning domain records.
- Save/load v5 persists `npcRelationships` as a dedicated snapshot section; individual NPC relationship state must not be hidden inside `WorldState`.
- App-level social pressure uses `social-pressure-${encounterId}` as the idempotent key shared by NPC relationship pressure and explicit retaliation-clock trigger handling.
