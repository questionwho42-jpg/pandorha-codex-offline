# Compendium Scaling Roadmap

## Near Term

- Keep the initial UI paginated and source-aware so the user can see which rule document each result comes from.
- Add category filtering in the Compendium browser now that generated system categories are available.
- Add ranking only after the catalog grows enough for ordering to matter.

## Later

- Extend the static generator only with deterministic metadata, never AI-written rule summaries.
- Add persisted indexes only after SQLite/Worker infrastructure is stable.
- Consider a recurring generator for read-only catalog entities if another static catalog is needed.
