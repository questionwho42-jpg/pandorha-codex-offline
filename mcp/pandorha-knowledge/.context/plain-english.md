# Plain English

This module creates a local MCP server that lets Codex search Pandorha rules and lore without rereading all markdown files every time.

It reads files from `docs` and `lore`, breaks them into smaller searchable pieces, and gives extra priority to section titles and markdown tables because RPG rules are often stored there.

The main tool is `search_rpg_rule`. You give it a search term, and it returns the most relevant file, heading context, and excerpt.

Alternative approaches:

- Use the generic filesystem MCP: simpler, but every search requires more manual reading.
- Use SQLite: good for structured data, but the current rulebooks are markdown, so ingestion would be extra work.
- Use embeddings: better semantic recall, but heavier, slower to set up, and unnecessary for lightweight local lookup.
