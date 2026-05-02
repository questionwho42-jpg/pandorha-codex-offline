# Technical Memory

## 2026-05-01

### Error Log
- Built after the previous MCPs established that Codex spawns STDIO servers more reliably with `C:/nvm4w/nodejs/node.exe` than with generic `node`.
- Kept the implementation in JavaScript ESM to avoid TypeScript build overhead for a regex-only guard.

### Technical Summary
- `validate_implementation` reads one `.svelte` or `.ts` file inside `PANDORHA_PROJECT_ROOT`.
- The guard uses regex scanning only: Svelte runes, import specifiers, and Tailwind default color utilities.
- FSD validation resolves `@/features`, `$lib/features`, `src/features`, absolute `/src/features`, and relative imports.
- Same-feature private imports are allowed; private imports from another feature are violations.

### Patterns And Decisions
- Return machine-readable JSON through MCP text content.
- Treat Tailwind default colors as violations with `warning` severity because the project forbids them but the user requested an alert.
- Keep path resolution inside the project root to prevent accidental filesystem inspection.
