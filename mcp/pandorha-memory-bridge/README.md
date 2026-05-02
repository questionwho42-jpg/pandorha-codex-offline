# pandorha-memory-bridge

MCP server for maintaining Pandorha's module memory protocol.

## Tool

`commit_module_context`

Input:

```json
{
  "module_name": "combat engine",
  "error_log": "Erro encontrado e solucao aplicada.",
  "technical_summary": "Resumo tecnico do modulo.",
  "plain_english": "Explicacao para leigos.",
  "scaling_notes": "Opcional: proximos passos e riscos."
}
```

The server writes only to:

```text
src/features/[module]/.context/
```

Files managed:

- `tech-memory.md`
- `scaling-roadmap.md`
- `plain-english.md`

Run validation:

```powershell
npm run validate:stdio --prefix mcp/pandorha-memory-bridge
```
