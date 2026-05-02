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
