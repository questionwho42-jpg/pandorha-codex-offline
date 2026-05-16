# Persistence Technical Memory

- T33B adds the first SQLite WASM + OPFS bootstrap path behind a Worker-oriented service.
- Drizzle Kit now reads both `characterSchema` and `worldStateSchema`, generating `0001_crazy_wallop.sql` for `world_state_entries`.
- Migrations are embedded as raw SQL strings for the browser Worker and tracked in `_pandorha_migrations`.
- `SqliteOpfsBootstrapService` uses `sql.js`, creates a Drizzle SQL.js database binding, applies pending migrations, exports bytes, and writes through a storage port.
- Unit tests use in-memory storage and `sql.js`; they do not require real OPFS.
