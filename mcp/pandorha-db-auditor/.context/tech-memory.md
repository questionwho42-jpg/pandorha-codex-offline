# Technical Memory

- `pandorha-db-auditor` is an isolated TypeScript MCP server compiled to `dist/index.js`.
- Runtime transport is stdio through `@modelcontextprotocol/sdk`.
- The active Codex config should call `C:/nvm4w/nodejs/node.exe` directly, not a PATH-dependent `node` shim.
- SQLite access uses `better-sqlite3`; generic query execution is read-only and additionally checks `prepared.reader`.
- The actor schema adapter is tolerant of common aliases and normalizes accents before matching columns.
- `verify_math` follows `docs/architecture/blueprint.md`: `HP = (Base + Fis + Res) * Nv` and `EE = Nv + Mental`.
- The real `dev.db` is currently empty, so STDIO validation uses `execute_query` with `SELECT 1 AS ok`.
