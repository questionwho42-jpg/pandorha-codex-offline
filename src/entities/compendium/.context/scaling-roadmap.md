# Compendium Scaling Roadmap

## Near Term

- Add `CompendiumSearchService` with tokenized search over validated entries before connecting the UI.
- Keep the initial UI paginated and source-aware so the user can see which rule document each result comes from.
- Add entries incrementally by category instead of importing every Markdown file in one task.
- Add ranking only after the catalog grows enough for ordering to matter.

## Later

- Introduce a content-import script that turns curated Markdown front matter or headings into validated compendium entries.
- Add persisted indexes only after SQLite/Worker infrastructure is stable.
- Consider a recurring generator for read-only catalog entities if another static catalog is needed.
