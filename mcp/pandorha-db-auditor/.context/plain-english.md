# Plain English

This MCP server lets Codex inspect the local Pandorha SQLite database without allowing database writes.

It can find one actor, show the actor's 3x3 attributes, and check whether the saved HP and EE match the formulas from the project blueprint.

It also has a generic SQL tool, but that tool only accepts read-only queries. Attempts to insert, update, delete, or change schema are blocked.

Alternative approaches:

- Use the generic SQLite MCP: faster to set up, but it does not know Pandorha formulas.
- Put formulas in SQL views: good long-term, but requires stable database schema.
- Keep validation in app code only: simpler for the game runtime, but worse for external auditing.
