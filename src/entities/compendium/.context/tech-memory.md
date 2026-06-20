# Compendium Technical Memory

## 2026-05-05 - T16A Base Catalog

- Created `entities/compendium` as the read-only foundation for the first searchable rules catalog slice.
- Technical ids and tags are English ASCII; player-facing titles and summaries remain in pt-BR.
- T16A indexes only eight curated entries for character creation, ancestry, class, and background sources. It does not parse the full `docs/system/` or `lore/` corpus.
- `CompendiumCatalogService` validates repository output with Zod and returns `Result` failures instead of throwing.
- The repeated read-only catalog pattern is now visible across `ancestry`, `character-class`, `background`, and `compendium`; a future entity-template generator would reduce recurring manual work, but was kept out of T16A to avoid adding unplanned tooling.

## 2026-05-05 - T17A Search Service

- Added `CompendiumSearchService` for read-only queries over the curated catalog.
- Search is case-insensitive and accent-insensitive across title, summary, search text, tags and source file.
- Empty queries return the first entries up to the validated limit; T17A does not import raw Markdown or query SQLite.

## 2026-06-20 - Generated System Index

- `OFFICIAL_COMPENDIUM_ENTRIES` now combines the curated character-creation slice with `GENERATED_COMPENDIUM_ENTRIES`.
- The generated catalog is versioned in `generatedCompendiumCatalog.ts`; runtime code still does not parse Markdown.
- System categories are `system-survival`, `system-combat`, and `system-magic`; labels remain handled by the browser feature.
- Generated entry tags must still pass the existing Zod tag regex, so numeric path parts are emitted as `ref-<number>` tags.

## 2026-06-20 - Search Category Filter

- `CompendiumSearchService` accepts `category: CompendiumCategory | "all"` and filters entries before applying text matching and the result limit.
- The search limit cap is now 200 so the browser can show generated system categories without adding pagination in the first UI slice.
- Category filtering remains read-only and does not introduce runtime Markdown parsing, SQLite, Worker access, save state or rule interpretation.
