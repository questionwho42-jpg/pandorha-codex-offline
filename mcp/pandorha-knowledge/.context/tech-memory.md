# Technical Memory

- The module is an isolated Node.js ESM MCP server under `mcp/pandorha-knowledge`.
- It uses `@modelcontextprotocol/sdk` over `StdioServerTransport`; stdout is reserved for JSON-RPC.
- Markdown is indexed from `docs` and `lore` only. `system-backup` is intentionally excluded.
- Search uses compact markdown segments instead of whole-file indexing to reduce memory and improve snippet quality.
- Headings and tables are extracted as dedicated segments and receive a ranking boost after Fuse scoring.
- The server process builds the index once at startup. This favors fast tool calls over live file watching.
- Validation is automated by `scripts/validate-stdio.js`, which performs initialize, tools/list, and a real tool call.

Known constraints:

- The local Bash launcher is blocked by Windows `E_ACCESSDENIED`, so validation commands currently run through PowerShell.
- The module does not mutate RPG rules or database state; it is read-only knowledge retrieval.
