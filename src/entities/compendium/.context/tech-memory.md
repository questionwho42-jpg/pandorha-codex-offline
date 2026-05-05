# Compendium Technical Memory

## 2026-05-05 - T16A Base Catalog

- Created `entities/compendium` as the read-only foundation for the first searchable rules catalog slice.
- Technical ids and tags are English ASCII; player-facing titles and summaries remain in pt-BR.
- T16A indexes only eight curated entries for character creation, ancestry, class, and background sources. It does not parse the full `docs/system/` or `lore/` corpus.
- `CompendiumCatalogService` validates repository output with Zod and returns `Result` failures instead of throwing.
- The repeated read-only catalog pattern is now visible across `ancestry`, `character-class`, `background`, and `compendium`; a future entity-template generator would reduce recurring manual work, but was kept out of T16A to avoid adding unplanned tooling.
