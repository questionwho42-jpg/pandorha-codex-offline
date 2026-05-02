# Plain English

## 2026-05-01

### What This Module Does
This MCP checks one code file and points out architecture problems before the implementation spreads through the project. It can tell whether the file uses Svelte 5 runes, whether it reaches into another feature's private folders, and whether it uses default Tailwind colors instead of Pandorha style tokens.

### Alternatives
- Manual review: no setup cost, but easy to miss repeated mistakes.
- Full parser or linter plugin: more precise, but heavier and slower.
- Regex MCP guard: fast, cheap, and good enough for early architectural warnings.
