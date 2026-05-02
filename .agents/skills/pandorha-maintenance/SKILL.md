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

## Promotion Rules
Promote after merge to `main`:
- Architecture decisions go to `docs/adr/`.
- RPG rules go to `docs/system/`.
- Engineering conventions go to `docs/conventions/` or `.agents/skills/`.
- AI context map changes go to `llms.txt`.

Never promote speculative or unverified information into official docs.
