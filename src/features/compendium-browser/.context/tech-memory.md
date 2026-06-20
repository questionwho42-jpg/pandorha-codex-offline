# Compendium Browser Technical Memory

## 2026-05-05 - T17A Browser UI

- Created `features/compendium-browser` as the UI slice for searching the validated compendium catalog.
- The feature receives a search function from `app` and does not import repositories directly, preserving FSD boundaries.
- Search runs through `CompendiumSearchService` in `entities/compendium`, with Result failures mapped to pt-BR UI copy.
- The UI keeps local query, result and selected-entry state in the Svelte component; no URL routing, Worker, SQLite or persistence was added.

## 2026-06-20 - Generated Category Labels

- `mapCompendiumCategoryLabel` now includes labels for `system-survival`, `system-combat`, and `system-magic`.
- This keeps generated entries readable before the category-filter UI is implemented.
