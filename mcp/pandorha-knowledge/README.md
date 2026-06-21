# pandorha-knowledge

MCP server for fast local lookup across Pandorha `docs` and `lore`.

## Tool

`search_rpg_rule`

Input:

```json
{
  "term": "dano critico",
  "limit": 5
}
```

Output is a JSON text payload with ranked matches, file paths, segment kind, heading context, and a concise markdown snippet.

`map_rule_evidence`

Input:

```json
{
  "query": "staff",
  "include": ["docs/system/magic"],
  "exclude": ["docs/system/survival/pandorha-sistema-compilado.md"],
  "limit": 10
}
```

Output is a JSON text payload with traceable evidence only: file, line, heading, snippet, and evidence kind. It does not interpret or approve RPG rules.

## Runtime

The server uses stdio and keeps a compact in-memory Fuse.js index built from markdown segments. It reads only `.md` files under:

- `docs`
- `lore`

Run directly:

```powershell
npm start --prefix mcp/pandorha-knowledge
```

Validate the MCP handshake and tool call:

```powershell
npm run validate:stdio --prefix mcp/pandorha-knowledge
```
