# Ancestry Technical Memory

## 2026-05-03

- Created `entities/ancestry` as the read-only catalog foundation for the six official Pandorha ancestries.
- T11 models base ancestry identity, source file, initial bonus text, and primordial ability text only.
- Selectable traits, mechanical bonus application, migrations, and UI integration are intentionally deferred.
- `AncestryCatalogService` validates repository output with Zod and returns `Result` failures instead of throwing.

## 2026-05-03 - T12 Ancestry Traits

- Added `ancestry_traits` and `ancestry_trait_links` schemas as the textual foundation for selectable ancestry traits.
- Added the official 60-trait catalog, with 10 validated traits for each official ancestry.
- Added `AncestryTraitSelectionService` to validate level-one selections of exactly 3 traits using the Result Pattern.
- Trait effects are not mechanized yet; descriptions remain validated rule text from `docs/system/survival/01-01` through `01-06`.
