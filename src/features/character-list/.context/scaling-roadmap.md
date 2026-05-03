# Character List Scaling Roadmap

## Next Steps

- Connect the list to a query service once the Worker/SQLite bridge exposes paginated Character reads.
- Add loading, error, empty, and populated states before using real asynchronous persistence.
- Keep creation in a separate `character-create` feature so T08 can validate form behavior without expanding the read-only list.
- Replace raw ancestry/class IDs with localized display names after ancestry and class compendium entities exist.
