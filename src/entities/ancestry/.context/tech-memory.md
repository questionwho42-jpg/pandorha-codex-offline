# Ancestry Technical Memory

## 2026-05-03

- Created `entities/ancestry` as the read-only catalog foundation for the six official Pandorha ancestries.
- T11 models base ancestry identity, source file, initial bonus text, and primordial ability text only.
- Selectable traits, mechanical bonus application, migrations, and UI integration are intentionally deferred.
- `AncestryCatalogService` validates repository output with Zod and returns `Result` failures instead of throwing.
