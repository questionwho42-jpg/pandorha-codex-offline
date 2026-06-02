# Background Technical Memory

## 2026-05-05 - T14 Background Schema

- Created `entities/background` as the read-only catalog foundation for the twenty official Pandorha backgrounds.
- Technical ids are in English ASCII, while player-facing labels and rule text remain in pt-BR.
- T14 stores origin ability text and level-one talent option text only; it does not apply origin abilities, starting resources, fame, infamy, favor, or talent effects mechanically.
- Some talent labels in `docs/system/survival/10-antecedentes-e-origens.md` are truncated in the source export; those entries are preserved as text notes instead of inferred as mechanics.
- `BackgroundCatalogService` validates repository output with Zod and returns `Result` failures instead of throwing.
