# Character List Scaling Roadmap

## Next Steps

- Connect the list to a query service once the Worker/SQLite bridge exposes paginated Character reads.
- Add loading, error, empty, and populated states before using real asynchronous persistence.
- Keep creation in a separate `character-create` feature so T08 can validate form behavior without expanding the read-only list.
- Identity labels now use official ancestry, class, and background catalogs. Next, add derived stats and selected trait summaries only after those values can be represented without persisting final totals.
- Persisted ancestry traits are now visible as saved sheet choices. Future trait mechanics should be rendered as derived effects only after a Decorator-based rule gate exists.
- If sheet sections grow, split trait display into a local presentational component before adding edit controls.
