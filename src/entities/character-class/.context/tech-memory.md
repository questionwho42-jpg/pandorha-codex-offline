# Character Class Technical Memory

## 2026-05-05 - T13 Character Class Schema

- Created `entities/character-class` as the read-only catalog foundation for the four official Pandorha classes.
- Technical ids are in English ASCII: `vanguard`, `weaver`, `emissary`, and `hunter`.
- Visible names, rules text, and source references remain in pt-BR and point to `docs/system/survival/05-00` through `05-04`.
- T13 stores base HP, equipment text, passive ability text, resource text, and initial talent options as validated catalog data.
- Talent effects, level progression, derived stats, migrations, persistence adapters, and UI integration are intentionally deferred.
- `CharacterClassCatalogService` validates repository output with Zod and returns `Result` failures instead of throwing.
