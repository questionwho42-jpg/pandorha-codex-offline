# Compendium Scaling Roadmap

## Near Term

- Keep the initial UI paginated and source-aware so the user can see which rule document each result comes from.
- Category filtering is delivered in the browser; next search work should focus on ranking and pagination when result volume starts to hurt scanning.
- Add ranking only after the catalog grows enough for ordering to matter.

## Later

- Extend the static generator only with deterministic metadata, never AI-written rule summaries.
- Add persisted indexes only after SQLite/Worker infrastructure is stable.
- Consider a recurring generator for read-only catalog entities if another static catalog is needed.
