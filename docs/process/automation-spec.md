# Pandorha Maintenance Automation Spec

## Purpose
This protocol keeps project maintenance mostly local and deterministic. The model is used as final reviewer, not as the primary writer for repetitive records.

## Model And Config Policy
- Local automation: no model, no token cost.
- Final review model: GPT-5.5 with high or xhigh reasoning for architecture, rule engine, database, and documentation promotion review.
- Fast review model: GPT-5.4-mini with medium reasoning for narrow formatting or record consistency checks.
- Default for this project: use local scripts first, then request one final high-reasoning review only when records are generated or promoted.

## Records
- `docs/process/change-inbox.md`: requests and modifications not yet represented in official project documentation.
- `docs/process/task-ledger.md`: active, completed, and unfinished work items.
- `docs/changelog.md`: promoted, main-branch visible changes.
- `docs/adr/`: architectural decisions made during implementation.

## Zero-Token Automation
The script `scripts/pandorha_process_automation.py` owns deterministic updates.

Supported operations:
- `start`: create a task record and optionally add it to the change inbox.
- `checkpoint`: append what was done, next step, risks, and possible improvements.
- `complete`: move an item to completed.
- `unfinished`: move an item to unfinished.
- `snapshot`: record current git state after manual runs or commits.
- `post-merge`: when on `main`, append a promotion summary to `docs/changelog.md`.

## Documentation Audit

The documentation audit command is:

```powershell
npm.cmd run docs:audit
```

It runs `scripts/audit_docs.mjs` in read-only mode and reports:

- documentation inventory by area;
- missing H1 headings;
- broken local Markdown links;
- missing path references;
- possible orphan documentation files;
- open [change-inbox.md](./change-inbox.md) promotion entries classified by recommended destination.

Use an explicit output path only when recording a snapshot report:

```powershell
node scripts/audit_docs.mjs --format markdown --scope all --output docs/process/documentation-audit.md
```

The report is advisory. It must not promote inbox items, update `docs/changelog.md`, or rewrite `docs/system/` rules without human approval and source-of-truth review.

## Dependency Security Gate

The recurring quality gate does not call `npm audit` directly. The command:

```powershell
npm.cmd run security:gate
```

runs `scripts/dependency_security_gate.mjs` in offline mode. It reads `package-lock.json` and compares installed direct and transitive packages against the versioned advisory database in `security/npm-advisories.json`.

The gate fails for advisories at `high` or `critical` severity that match installed versions. A stale advisory database is reported as a warning, not as a blocker, because the recurring gate must remain local and deterministic.

Refresh the local advisory database only as an explicit maintenance action with network approval:

```powershell
npm.cmd run security:refresh-advisories
```

The refresh command normalizes `npm audit --json` output into `security/npm-advisories.json`. It is intentionally not called by `quality:gate`; newly published advisories become visible to the offline gate only after an approved refresh updates the versioned database.

## Documentation Promotion Drafts

Broad promotion rounds should create a draft before editing official documentation. Use [documentation-promotion-draft.md](./documentation-promotion-draft.md) to map every open inbox id to a destination, evidence source, target document, and blocking condition.

The draft is allowed on feature branches. It does not move entries from `Open` to `Promoted`, and it does not turn code behavior into RPG rules. After merge to the default branch, run a fresh audit, compare the draft against [change-inbox.md](./change-inbox.md), then promote only the entries whose target document was actually updated and reviewed.

## Required Checkpoint Format
Every complex or long-running task should report:
- Done: concrete work completed.
- Next: immediate next action.
- Risks: known blockers, uncertainty, or likely failure modes.
- Improvements: follow-up automation, tests, or documentation improvements.

## Promotion Rules
When a change is merged into `main`, the automation updates `docs/changelog.md`. The model then reviews whether additional promotion is needed:
- Architecture change: create or update an ADR in `docs/adr/`.
- RPG/system rule change: update the relevant file in `docs/system/`.
- Engineering convention change: update `docs/conventions/` or `.agents/skills/`.
- AI context change: update `llms.txt`.

## Human Review Gate
The model must verify:
- The ledger state matches git state.
- Completed tasks have final timestamps.
- Unplanned changes were either promoted or explicitly left in the inbox.
- Official docs were not updated with speculative claims.
