# Changelog

This file receives zero-token promotion summaries after changes reach `main`.

Detailed architectural decisions belong in `docs/adr/`. RPG and business rules remain in `docs/system/`.

<!-- pandorha-changelog:main -->
## 2026-05-22T18:13:24-03:00 - master merge promotion candidate
- branch: master
- commit: c69f3b1 feat(hexcrawl): integracao do EncounterService com a UI e correcoes do linter/testes
- changed_files_count: 44
- review_model: gpt-5.5 high-reasoning final review; local automation zero-token
#### Changed Files
- drizzle/meta/0000_snapshot.json
- drizzle/meta/0001_snapshot.json
- drizzle/meta/0002_snapshot.json
- drizzle/meta/0003_snapshot.json
- drizzle/meta/0004_snapshot.json
- drizzle/meta/0005_snapshot.json
- drizzle/meta/0006_snapshot.json
- drizzle/meta/_journal.json
- mcp/pandorha-arch-guard/package.json
- mcp/pandorha-arch-guard/scripts/validate-stdio.js
- mcp/pandorha-arch-guard/src/server.js
- mcp/pandorha-arch-guard/test/arch-guard.test.js
- mcp/pandorha-db-auditor/package.json
- mcp/pandorha-db-auditor/scripts/validate-stdio.js
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- mcp/pandorha-db-auditor/tsconfig.json
- mcp/pandorha-knowledge/package.json
- mcp/pandorha-knowledge/scripts/validate-stdio.js
- mcp/pandorha-knowledge/src/config.js
- mcp/pandorha-knowledge/src/file-system.js
- mcp/pandorha-knowledge/src/markdown-segments.js
- mcp/pandorha-knowledge/src/search-engine.js
- mcp/pandorha-knowledge/src/server.js
- mcp/pandorha-knowledge/test/search-engine.test.js
- mcp/pandorha-memory-bridge/package.json
- mcp/pandorha-memory-bridge/scripts/validate-stdio.js
- mcp/pandorha-memory-bridge/src/server.js
- mcp/pandorha-memory-bridge/test/memory-bridge.test.js
- mcp_config.json
- "pandorha obsidian antigravity/.obsidian/app.json"
- "pandorha obsidian antigravity/.obsidian/appearance.json"
- "pandorha obsidian antigravity/.obsidian/core-plugins.json"
- "pandorha obsidian antigravity/.obsidian/graph.json"
- "pandorha obsidian antigravity/.obsidian/webviewer.json"
- "pandorha obsidian antigravity/.obsidian/workspace.json"
- public/sw.js
- scripts/pandorha_process_automation.py
- skills-lock.json
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- ... 4 more
#### Promotion Review
- Done: merge detected on main and changelog promotion candidate created
- Next: model final review should decide whether ADR, system docs, conventions, or llms.txt need updates
- Risks: semantic promotion still requires human/model judgment
- Improvements: include task ids in commit messages for tighter traceability

<!-- /pandorha-changelog:main -->
