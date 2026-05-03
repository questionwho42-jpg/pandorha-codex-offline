# Character Technical Memory

## 2026-05-02

- Created the first Character domain tracer bullet under `src/entities/character` because Character is a shared base RPG entity consumed by multiple features.
- The domain uses Drizzle as the database schema source, Drizzle-Zod for input/output validation, and Result objects for all service/repository failures.
- Tests use `CharacterBuilder` and `InMemoryCharacterRepository`; no partial mocks or SQLite runtime are required.
- `pandorha-arch-guard` currently validates existing `.ts`/`.svelte` files and recognizes `src/features`, but not `src/entities`; entity support should be added before relying on it as the only architecture gate.
- Added contract tests for `DrizzleCharacterRepository` with a local fake `CharacterDrizzleDatabase`; the test covers save/findById without SQLite WASM.
- `findById` now distinguishes an empty select result (`CHARACTER_NOT_FOUND`) from a malformed selected row (`CORRUPTED_CHARACTER_RECORD`).
