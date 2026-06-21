---
name: pandorha-maintenance
description: Maintain Pandorha Engine project records and documentation promotion with zero-token local automation. Use when Codex starts, checkpoints, completes, pauses, reviews, promotes, or documents implementation tasks, especially long-running tasks, unplanned feature requests, post-commit snapshots, post-merge documentation promotion, and final model review of generated maintenance records.
---

# Pandorha Maintenance

## Operating Rule
Use `scripts/pandorha_process_automation.py` for repetitive records before writing maintenance notes manually.

Model usage policy:
- Local script first for snapshots, task records, checkpoints, and promotion candidates.
- Model final review only after generated files exist.
- Prefer GPT-5.5 high or xhigh reasoning for final review of architecture, RPG rules, database, or documentation promotion.
- Use a smaller model only for narrow formatting checks.

## Commands
Initialize files:

```bash
python scripts/pandorha_process_automation.py init
```

Start unplanned work:

```bash
python scripts/pandorha_process_automation.py start \
  --title "Short title" \
  --summary "What is being requested" \
  --kind feature \
  --unplanned
```

Checkpoint long work:

```bash
python scripts/pandorha_process_automation.py checkpoint \
  --id TASK_ID \
  --done "Concrete work completed" \
  --next "Immediate next step" \
  --risks "Known risks" \
  --improvements "Possible improvements"
```

Complete or pause:

```bash
python scripts/pandorha_process_automation.py complete --id TASK_ID --summary "Final result"
python scripts/pandorha_process_automation.py unfinished --id TASK_ID --summary "Why it stopped"
```

Record git state:

```bash
python scripts/pandorha_process_automation.py snapshot --reason manual
```

## Automation Discovery Commands
Use these local commands before asking the model to inspect repetitive process state:

```powershell
npm.cmd run automation:opportunities
npm.cmd run context:validate
npm.cmd run save:migration-matrix
npm.cmd run qa:browser-runbook:check
```

Use `scaffold:event-ledger` only after a module needs an event-sourced skeleton and an explicit task has approved the target layer, slice, and replay service name:

```powershell
npm.cmd run scaffold:event-ledger -- --layer features --slice example-ledger --service ExampleLedgerReplayService
```

Do not create `pandorha-phase-runner` until `docs/process/pandorha-phase-runner-skill-gate.md` is satisfied.

## Review Workflow
After automation runs, review these files:
- `docs/process/task-ledger.md`
- `docs/process/change-inbox.md`
- `docs/changelog.md`

Verify:
- Task status matches the real work state.
- Finished tasks include finish time and model/config.
- Open inbox items are either still unplanned or have a clear promotion path.
- Main-branch promotion candidates are moved into the right official docs.

## Gate Order By Task Type
- Script automation: focused `node scripts/test_*.mjs`, then `npm.cmd run quality:automation`.
- MCP automation: package `npm.cmd test --prefix mcp/<name>`, `npm.cmd run validate:stdio --prefix mcp/<name>`, then `npm.cmd run quality:mcp`.
- Skill/documentation updates: `npm.cmd run quality:skills` and `npm.cmd run docs:audit`.
- Final branch closeout: `npm.cmd run lint`, `npm.cmd test`, `npm.cmd run build`, `npm.cmd run quality:gate`, process validation, then `qa:next-phase-readiness` only after the tree is clean.

## Promotion Rules
Promote after merge to `main`:
- Architecture decisions go to `docs/adr/`.
- RPG rules go to `docs/system/`.
- Engineering conventions go to `docs/conventions/` or `.agents/skills/`.
- AI context map changes go to `llms.txt`.

Never promote speculative or unverified information into official docs.
