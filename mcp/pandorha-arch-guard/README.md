# pandorha-arch-guard

Lightweight MCP server for static architecture checks in Pandorha Engine files.

## Tool

`validate_implementation`

Input:

```json
{
  "file_path": "src/features/combat/ui/Panel.svelte"
}
```

The path must resolve inside `PANDORHA_PROJECT_ROOT` and must point to a `.svelte` or `.ts` file.

Checks:

- Reports Svelte 5 rune usage: `$state`, `$derived`, `$effect`.
- Blocks direct imports from private folders of other features.
- Warns when default Tailwind color utilities are used instead of project tokens.

The server communicates through STDIO and is intended for low-memory validation flows.
