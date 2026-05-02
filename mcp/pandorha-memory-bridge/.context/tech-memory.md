# Technical Memory

- `pandorha-memory-bridge` is a Node.js ESM MCP server that writes controlled module context files.
- It uses `@modelcontextprotocol/sdk` over stdio and `node:fs/promises` for file operations.
- The write scope is constrained to `src/features/[module]/.context/`.
- Module names are normalized to slugs and path-like input is rejected before resolving filesystem paths.
- Existing context files are preserved by appending timestamped entries.
- Writes are performed through a temporary file followed by `rename` to reduce partial-write risk.
