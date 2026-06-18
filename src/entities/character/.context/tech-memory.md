# Character Technical Memory

## 2026-05-02

- Created the first Character domain tracer bullet under `src/entities/character` because Character is a shared base RPG entity consumed by multiple features.
- The domain uses Drizzle as the database schema source, Drizzle-Zod for input/output validation, and Result objects for all service/repository failures.
- Tests use `CharacterBuilder` and `InMemoryCharacterRepository`; no partial mocks or SQLite runtime are required.
- `pandorha-arch-guard` currently validates existing `.ts`/`.svelte` files and recognizes `src/features`, but not `src/entities`; entity support should be added before relying on it as the only architecture gate.
- Added contract tests for `DrizzleCharacterRepository` with a local fake `CharacterDrizzleDatabase`; the test covers save/findById without SQLite WASM.
- `findById` now distinguishes an empty select result (`CHARACTER_NOT_FOUND`) from a malformed selected row (`CORRUPTED_CHARACTER_RECORD`).
- Added the first versioned Drizzle migration for the `characters` table under `drizzle/`.
- `drizzle.config.mjs` is intentionally migration-only: it generates SQL from the Character schema without choosing the final browser OPFS runtime driver.
- Migration validation uses `sql.js` in Vitest as a temporary SQLite WASM database, proving that the SQL applies and exposes the expected table contract.
- Added `SessionCharacterRepository` as a temporary browser-session adapter for T08. It implements `CharacterRepository` and exposes `all()` so the app can refresh the read-only list without adding Worker persistence yet.

## 2026-05-05 - T15A Derived Stats Core

- Added `CharacterDerivedStatsService` to calculate non-persisted base stats from a validated `CharacterRecord` and a resolved class source.
- The service calculates `maxHp`, `initiativeBase`, and `carrySlotLimit` only; it does not apply class passives, ancestry traits, background talents, equipment, magic resources, or status effects.
- To preserve FSD boundaries, `character` does not import the sibling `character-class` slice. Callers must resolve the class source before asking for derived stats.
- Derived values remain outputs, not fields stored in the `characters` table.

## 2026-06-17 - Character Trait Selections Save V8

- Added `characterTraitSelections` as a dedicated relation owned by `entities/character`, not as JSON inside `characters`.
- Each persisted selection stores `characterId`, contiguous `sequence` 1-3, `traitId`, and `createdAt`; ancestry ownership is validated at creation time by the app/session flow.
- `SessionCharacterTraitSelectionRepository` mirrors the existing session repository pattern and exposes `all()` / `replaceAll()` for save-load orchestration.
- Trait selections are persisted as sheet choices only. No trait mechanic, Decorator, HP, passive bonus, starting equipment, or editable sheet behavior was added.
- The UI display phase consumes the persisted relation read-only through `character-list`; the entity layer still owns records only, not presentation labels.
