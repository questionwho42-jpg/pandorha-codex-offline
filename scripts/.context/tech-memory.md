# Technical Memory

## Documentation Audit Automation

- `scripts/audit_docs.mjs` is a Windows-first, read-only-by-default documentation auditor for Markdown and text context files.
- The auditor reports local Markdown link failures, missing H1 headings, missing path references, potential orphan docs, project contract warnings, and open `change-inbox.md` promotion entries.
- The script accepts `--format json|markdown`, `--scope all|architecture|process|system|user|conventions`, `--root <path>` for fixtures, and optional `--output <path>` for explicit report generation.
- `scripts/test_audit_docs.mjs` uses `node:test` with temporary fixture repositories and does not depend on network, browser, SQLite, or generated artifacts.
- The automation is intentionally advisory: findings are reported without failing the process unless arguments or filesystem access fail. This keeps `quality:automation` useful even while docs contain known pending promotion items.

## Guardrails Learned

- Do not promote `docs/process/change-inbox.md` entries to `Promoted` while working outside `main` unless the user explicitly approves it.
- Do not update `docs/system/` from code inference. RPG rule documentation remains sovereign and needs source-level review.
- Ignore non-official generated directories such as `output/`, `coverage/`, `dist/`, and `node_modules/` during documentation audits.

## UI Reachability Automation

- `scripts/ui_reachability_smoke.mjs` is a contractual source-and-documentation gate; it does not automate a rendered browser.
- The smoke protects tab mounting, current navigation copy, character save documentation, camp event-preservation order, known limitation classification, and the Browser do Codex acceptance requirement.
- `scripts/test_ui_reachability_smoke.mjs` uses temporary fixtures with one positive case and focused negative regressions.
