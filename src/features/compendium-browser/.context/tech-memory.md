# Compendium Browser Technical Memory

## 2026-05-05 - T17A Browser UI

- Created `features/compendium-browser` as the UI slice for searching the validated compendium catalog.
- The feature receives a search function from `app` and does not import repositories directly, preserving FSD boundaries.
- Search runs through `CompendiumSearchService` in `entities/compendium`, with Result failures mapped to pt-BR UI copy.
- The UI keeps local query, result and selected-entry state in the Svelte component; no URL routing, Worker, SQLite or persistence was added.

## 2026-06-20 - Generated Category Labels

- `mapCompendiumCategoryLabel` now includes labels for `system-survival`, `system-combat`, and `system-magic`.
- This keeps generated entries readable before the category-filter UI is implemented.

## 2026-06-20 - Indexed Browser Filters

- The browser now keeps `selectedCategory` as local Svelte state and sends it to `CompendiumSearchService`.
- Category filters are rendered as reachable buttons with `data-testid="compendium-category-filter"` and `data-testid="compendium-category-option"`.
- Result and detail views show `sourceLabel` in `sourceFile:sourceLine` form so generated entries keep visible provenance.
- The UI raises the search limit to 200 for category browsing; pagination and ranking were still future work at this checkpoint.

## 2026-06-21 - Deterministic Ranking And Pagination

- `CompendiumSearchService` now keeps empty-query catalog order but ranks text searches by title exact match, title prefix, title containment, tag/category hit, then broader indexed text.
- Equal relevance uses deterministic `pt-BR` title, source file, and id tie-breakers so results do not depend on repository insertion order.
- `createCompendiumBrowserView` paginates the already-searched result set with a default page size of 20 and only exposes entry detail when the selected item is visible on the current page.
- Empty states now distinguish query, category, and combined filter misses and expose `canClearFilters` for the Svelte UI.
- The slice still does not parse Markdown at runtime, persist state, run semantic search, or alter `docs/system/`.
