# Task Ledger

This file records every new completed feature and every unfinished task.

Each record should include start time, finish time when available, the model/config used, the last modification, and a short explanation of what was done or is being done.

The automation owns the marked sections below. Manual edits should stay outside markers unless intentionally correcting a record.

## In Progress
<!-- pandorha-ledger:in-progress -->

<!-- /pandorha-ledger:in-progress -->

## Completed
<!-- pandorha-ledger:completed -->
<!-- pandorha-task:20260618-064748-starting-equipment-promotion-sweep -->
### Starting equipment promotion sweep
- id: 20260618-064748-starting-equipment-promotion-sweep
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-18T06:47:48-03:00
- finished_at: 2026-06-18T06:48:35-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-18T06:48:35-03:00
- branch: codex/docs/starting-equipment-promotion-sweep
- commit_at_start: ae919d0 docs(process): record starting equipment gap merge
- summary: Promote the delivered starting equipment catalog gap record after main merge without changing docs/system or implementing starting equipment.
- last_change: Promoted the delivered starting equipment catalog gap record to the process gate documentation after main merge, kept future starting equipment implementation open, and did not change docs/system.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-18T06:47:48-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-18T06:48:35-03:00
- Done: Promoted the delivered starting equipment catalog gap record to the process gate documentation after main merge, kept future starting equipment implementation open, and did not change docs/system.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260618-064748-starting-equipment-promotion-sweep -->
<!-- pandorha-task:20260618-061502-starting-equipment-catalog-gap -->
### Starting equipment catalog gap
- id: 20260618-061502-starting-equipment-catalog-gap
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-18T06:15:02-03:00
- finished_at: 2026-06-18T06:18:00-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-18T06:18:00-03:00
- branch: codex/docs/starting-equipment-catalog-gap
- commit_at_start: 7729fb0 docs(process): record character traits UI merge
- summary: Create a process gate mapping official starting equipment kits against the current catalog and keep starting equipment blocked until catalog coverage or explicit substitutions are approved.
- last_change: Documented starting equipment catalog gaps against the current equipment and consumable catalog, kept automatic grants blocked until full catalog coverage or explicit substitutions are approved, and did not change docs/system or code.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-18T06:15:02-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-18T06:18:00-03:00
- Done: Documented starting equipment catalog gaps against the current equipment and consumable catalog, kept automatic grants blocked until full catalog coverage or explicit substitutions are approved, and did not change docs/system or code.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260618-061502-starting-equipment-catalog-gap -->
<!-- pandorha-task:20260617-204900-character-traits-visible-ui -->
### Character traits visible UI
- id: 20260617-204900-character-traits-visible-ui
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-17T20:49:00-03:00
- finished_at: 2026-06-18T06:10:41-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-18T06:10:41-03:00
- branch: codex/feat/character-traits-visible-ui
- commit_at_start: 3e5a315 docs(process): record character trait selection merge
- summary: Show persisted ancestry trait selections in the character list, keep creation validation at exactly three traits, update QA contracts, user docs, and module memories without trait mechanics or starting equipment.
- last_change: Character list now renders the persisted ancestry trait selections saved in v8. Browser do Codex validated creating a character with three traits, saving, real reload, loading, restoring the same traits, opening all nine tabs without severe console logs, and the narrow trait layout regression was corrected without adding trait mechanics, HP, or starting equipment.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-17T20:49:00-03:00
- Done: task record created
- Next: Add focused failing tests for character-list trait display, then wire CharacterList and App props to persisted characterTraitSelections.
- Risks: UI must display persisted sheet choices only; no trait effects, HP real, editable sheet, or starting equipment should be introduced.
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T21:13:05-03:00
- Done: UI de traços persistidos implementada; Browser do Codex validou criação, save, reload, load, restauração dos três traços e nove abas sem logs severos; layout estreito dos traços foi corrigido e revalidado por métricas DOM.
- Next: Reexecutar npm.cmd run quality:gate fora do sandbox quando o limite de uso permitir; se passar, completar tarefa, commitar, fazer merge em main, push e qa:next-phase-readiness.
- Risks: quality:gate completo não foi aprovado nesta sessão porque a execução escalada foi bloqueada por limite de uso; não há commit até esse gate passar.
- Improvements: Considerar manter evidência de Browser em roteiro textual quando CDP screenshot timeout ocorrer.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-18T06:10:41-03:00
- Done: Character list now renders the persisted ancestry trait selections saved in v8. Browser do Codex validated creating a character with three traits, saving, real reload, loading, restoring the same traits, opening all nine tabs without severe console logs, and the narrow trait layout regression was corrected without adding trait mechanics, HP, or starting equipment.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260617-204900-character-traits-visible-ui -->
<!-- pandorha-task:20260617-121308-character-trait-selections-save-v8 -->
### Character trait selections save v8
- id: 20260617-121308-character-trait-selections-save-v8
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-17T12:13:08-03:00
- finished_at: 2026-06-17T20:45:30-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-17T20:45:30-03:00
- branch: codex/feat/character-trait-selections-save-v8
- commit_at_start: 151addc docs(process): record trait gate merge
- summary: Persist ancestry trait selections in save v8 with character-owned records, migrations, app session state, and focused tests without trait mechanics or starting equipment.
- last_change: Persisted ancestry trait selections in save v8 with a character-owned relation, SQLite migration, v1-v7 migrations, RPC/worker snapshot wiring, app session restore/save state, focused tests, QA smoke contract updates, and module memories. Verified lint, tests, 100 percent coverage, build, quality automation, quality gate, docs audit, QA smokes, core conventions, self-review hard stop, process validation, and diff check.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-17T12:13:08-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T12:34:30-03:00
- Done: Implemented save v8 characterTraitSelections persistence, SQLite migration/table wiring, app session restore/save wiring, RPC/worker contracts, focused tests, v8 QA smoke contracts, and module memories. Passed focused tests, npm test, lint, docs:audit, process validate, core-conventions, self-review hard stop, qa:vertical-slice, qa:ui-reachability, qa:social-browser-smoke, qa:dialogue-seeds, quality:automation, and git diff --check.
- Next: Resume by running npm.cmd run test:coverage and npm.cmd run build outside the sandbox, then complete the automation task, commit feat(character): persist ancestry trait selections in v8, merge to main, push, and run qa:next-phase-readiness.
- Risks: test:coverage and build fail inside sandbox with esbuild Access is denied for vitest.config.mjs/vite.config.mjs. Escalated execution was requested but rejected by account usage limit, so this phase must remain uncommitted until those gates can run.
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T20:45:30-03:00
- Done: Persisted ancestry trait selections in save v8 with a character-owned relation, SQLite migration, v1-v7 migrations, RPC/worker snapshot wiring, app session restore/save state, focused tests, QA smoke contract updates, and module memories. Verified lint, tests, 100 percent coverage, build, quality automation, quality gate, docs audit, QA smokes, core conventions, self-review hard stop, process validation, and diff check.
- Next: Create the UI branch for visible persisted ancestry traits from clean main after this commit is merged and readiness passes.
- Risks: No trait mechanics, HP real, starting equipment, Decorator, talents, passives, or editable sheet behavior were added; those remain gated future work.
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260617-121308-character-trait-selections-save-v8 -->
<!-- pandorha-task:20260617-120814-character-traits-save-v8-gate -->
### Character traits save v8 gate
- id: 20260617-120814-character-traits-save-v8-gate
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-17T12:08:14-03:00
- finished_at: 2026-06-17T12:10:21-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-17T12:10:21-03:00
- branch: codex/docs/character-traits-save-v8-gate
- commit_at_start: 3bd118c docs(process): record potion belt promotion merge
- summary: Approve save v8 contract for persisted ancestry trait selections and starting equipment catalog gap map.
- last_change: Approved the save v8 contract for persisted ancestry trait selections, including invariants, migration boundaries, UI expectations, and a starting equipment catalog gap map without changing docs/system.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-17T12:08:14-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T12:10:21-03:00
- Done: Approved the save v8 contract for persisted ancestry trait selections, including invariants, migration boundaries, UI expectations, and a starting equipment catalog gap map without changing docs/system.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260617-120814-character-traits-save-v8-gate -->
<!-- pandorha-task:20260617-120327-potion-belt-promotion-sweep -->
### Potion belt promotion sweep
- id: 20260617-120327-potion-belt-promotion-sweep
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-17T12:03:27-03:00
- finished_at: 2026-06-17T12:04:16-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-17T12:04:16-03:00
- branch: codex/docs/potion-belt-promotion-sweep
- commit_at_start: b0dda33 docs(process): record potion belt quick access merge
- summary: Promote the delivered potion belt quick access gate and implementation records after main merge without changing docs/system or opening new mechanics.
- last_change: Promoted only the delivered potion belt quick access gate and implementation records after main merge, keeping future healing, HP real, item effects, durability, and official action economy open.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-17T12:03:27-03:00
- Done: task record created
- Next: Move only the two potion belt records from open to promoted and validate docs/process records.
- Risks: Do not promote healing, HP real, item effects, durability, or official action economy by inference.
- Improvements: Keep future potion effects behind their own gate.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T12:04:16-03:00
- Done: Promoted only the delivered potion belt quick access gate and implementation records after main merge, keeping future healing, HP real, item effects, durability, and official action economy open.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260617-120327-potion-belt-promotion-sweep -->
<!-- pandorha-task:20260617-060205-combat-potion-belt-quick-access -->
### Combat potion belt quick access
- id: 20260617-060205-combat-potion-belt-quick-access
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-17T06:02:05-03:00
- finished_at: 2026-06-17T11:45:49-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-17T11:45:49-03:00
- branch: codex/feat/combat-potion-belt-quick-access
- commit_at_start: d9cfbbf chore(process): record potion belt gate merge
- summary: Implement the Combat tab potion belt quick access using the existing inventory ledger, without save v8, real healing, HP real persistence, conditions, overdose, durability, item effects, or official action economy.
- last_change: Delivered Combat potion belt quick access using the existing inventory ledger: app bridge, Combat UI, inventory copy, docs, smoke contracts, user guides, and triple memories. Browser validation passed on http://127.0.0.1:5184/: nine tabs, unique character, potion belt 5/5, consume to 4/5, save/reload/load restored 4/5, consume to 0/5, button disabled, no console errors, no HP real or HP de treino mutation. Gates passed: lint, test, coverage 100%, build, quality:automation, quality:gate, qa:vertical-slice, qa:ui-reachability, social smoke, dialogue seeds, docs:audit, core-conventions, self-review, process validate, git diff --check.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-17T06:02:05-03:00
- Done: task record created
- Next: Add failing app/combat tests for potion belt resolve and consume behavior.
- Risks: Keep combat composed through app boundary and do not import inventory-management from combat-encounter.
- Improvements: Consider rendered automation only if this flow repeats across future consumable effects.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T06:32:45-03:00
- Done: Implemented potion belt quick-access bridge, Combat UI, inventory copy, smoke contracts, user/process docs, and triple memories. Focused tests, lint/type-check, npm test, coverage 100%, build, qa:vertical-slice, qa:ui-reachability, docs:audit, quality:automation, social smoke, dialogue seeds, process validate, and git diff --check passed.
- Next: Resume rendered Browser validation when escalation is available: use the real browser at http://127.0.0.1:5174/ or restart dev server, validate nine tabs, create character, load five potion-belt units, use one in Combat, save, reload, load save, verify restored quantity and no HP mutation; then clean generated .playwright-cli artifact, run final gates, complete task, commit and merge.
- Risks: Playwright CLI escalation was rejected by the environment usage limit before the rendered flow could be completed; .playwright-cli generated by the partial browser attempt remains untracked because cleanup was also blocked.
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T11:45:49-03:00
- Done: Delivered Combat potion belt quick access using the existing inventory ledger: app bridge, Combat UI, inventory copy, docs, smoke contracts, user guides, and triple memories. Browser validation passed on http://127.0.0.1:5184/: nine tabs, unique character, potion belt 5/5, consume to 4/5, save/reload/load restored 4/5, consume to 0/5, button disabled, no console errors, no HP real or HP de treino mutation. Gates passed: lint, test, coverage 100%, build, quality:automation, quality:gate, qa:vertical-slice, qa:ui-reachability, social smoke, dialogue seeds, docs:audit, core-conventions, self-review, process validate, git diff --check.
- Next: After merge to main, run qa:next-phase-readiness and keep healing, HP real, item effects, durability, and official action economy behind future gates.
- Risks: Build and coverage require escalation in this environment because esbuild cannot read config under sandbox; build also keeps the existing large chunk warning.
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260617-060205-combat-potion-belt-quick-access -->
<!-- pandorha-task:20260617-055721-potion-belt-quick-access-gate -->
### Potion belt quick access gate
- id: 20260617-055721-potion-belt-quick-access-gate
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-17T05:57:21-03:00
- finished_at: 2026-06-17T05:58:37-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-17T05:58:37-03:00
- branch: codex/docs/potion-belt-quick-access-gate
- commit_at_start: 3609176 chore(process): record promotion sweep merge
- summary: Approve the minimal potion belt quick access contract using the existing inventory ledger without save v8, HP real, healing effects, conditions, overdose, durability, or official action economy.
- last_change: Approved the minimal potion belt quick access gate using the existing inventory ledger, explicitly excluding save v8, healing, HP real, conditions, overdose, durability, item effects, and official action economy.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-17T05:57:21-03:00
- Done: task record created
- Next: Create the process gate and update roadmap/change inbox links.
- Risks: Do not infer healing, HP persistence, action economy, or docs/system changes from this technical gate.
- Improvements: Keep future real consumable effects behind explicit HP and item-effect gates.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-17T05:58:37-03:00
- Done: Approved the minimal potion belt quick access gate using the existing inventory ledger, explicitly excluding save v8, healing, HP real, conditions, overdose, durability, item effects, and official action economy.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260617-055721-potion-belt-quick-access-gate -->
<!-- pandorha-task:20260616-195116-post-combat-promotion-sweep -->
### Post combat promotion sweep
- id: 20260616-195116-post-combat-promotion-sweep
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-16T19:51:16-03:00
- finished_at: 2026-06-16T19:54:24-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-16T19:54:24-03:00
- branch: codex/docs/post-combat-promotion-sweep
- commit_at_start: 43514ba chore(process): record combat loadout promotion
- summary: Promote delivered inventory, loadout, and combat integration records after main merge while keeping future limitations open.
- last_change: Promoted delivered inventory v6, editable inventory, loadout v7, and Combat inventory integration records while keeping potion belt, durability, real HP, starting equipment, PWA, and other future limitations open.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-16T19:51:16-03:00
- Done: task record created
- Next: Review change inbox and promote only delivered records.
- Risks: Do not promote future potion belt, durability, HP real, or RPG rules by inference.
- Improvements: Keep future feature entries linked to explicit gates.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-16T19:54:24-03:00
- Done: Promoted delivered inventory v6, editable inventory, loadout v7, and Combat inventory integration records while keeping potion belt, durability, real HP, starting equipment, PWA, and other future limitations open.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260616-195116-post-combat-promotion-sweep -->
<!-- pandorha-task:20260616-175040-combat-persistent-loadout-integration -->
### Combat persistent loadout integration
- id: 20260616-175040-combat-persistent-loadout-integration
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-16T17:50:40-03:00
- finished_at: 2026-06-16T19:33:09-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 xhigh
- last_modified_at: 2026-06-16T19:33:09-03:00
- branch: codex/feat/combat-persistent-loadout
- commit_at_start: d3d2e40 chore(process): record combat loadout gate merge
- summary: Implement the Combat tab consuming persisted inventory loadout, with app boundary resolver, UI update, smokes, rendered validation, and readiness.
- last_change: Combat now consumes the persisted inventory loadout through an app-boundary resolver; local weapon/armor/shield selectors were removed, reachability/vertical smokes were updated, docs and triple memories were refreshed, full gates passed, and Browser/Playwright validation restored the loadout after save/reload without console errors.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-16T17:50:40-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-16T19:33:01-03:00
- Done: Implemented app-level combat persistent loadout resolver, removed local Combat equipment selectors, updated UI/docs/smokes/context memories, and validated rendered flow with Playwright on 127.0.0.1:5174.
- Next: Complete task, commit atomically, merge to main, run readiness.
- Risks: Vite/Vitest build and coverage require escalated execution outside sandbox because esbuild cannot read config files in the managed sandbox.
- Improvements: Future combat phases should keep durability, potion belt, consumable use, and real HP persistence behind separate gates.
- Model/config: gpt-5.5 xhigh

#### Checkpoint 2026-06-16T19:33:09-03:00
- Done: Combat now consumes the persisted inventory loadout through an app-boundary resolver; local weapon/armor/shield selectors were removed, reachability/vertical smokes were updated, docs and triple memories were refreshed, full gates passed, and Browser/Playwright validation restored the loadout after save/reload without console errors.
- Next: Commit this branch, merge into main, run post-merge automation and qa:next-phase-readiness.
- Risks: No new save version or RPG rule was introduced; durability, potion belt, consumable use in combat, and real HP persistence remain separate future gates.
- Improvements: Consider a reusable rendered browser script only if this exact inventory-to-combat roundtrip repeats across several future combat phases.
- Model/config: gpt-5.5 xhigh
<!-- /pandorha-task:20260616-175040-combat-persistent-loadout-integration -->
<!-- pandorha-task:20260616-172607-combat-persistent-loadout-gate -->
### Combat persistent loadout gate
- id: 20260616-172607-combat-persistent-loadout-gate
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-16T17:26:07-03:00
- finished_at: 2026-06-16T17:48:33-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-16T17:48:33-03:00
- branch: codex/docs/combat-persistent-loadout-gate
- commit_at_start: de5e317 chore(process): record loadout promotion merge
- summary: Approve the contract for the Combat tab to consume character inventory loadout without save v8, migrations, durability, or real HP persistence.
- last_change: Approved the technical gate for Combat to consume persisted inventory loadout without save v8, migrations, durability, or real HP persistence.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-16T17:26:07-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-16T17:48:33-03:00
- Done: Approved the technical gate for Combat to consume persisted inventory loadout without save v8, migrations, durability, or real HP persistence.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260616-172607-combat-persistent-loadout-gate -->
<!-- pandorha-task:20260616-172054-loadout-v7-promotion-review -->
### Loadout v7 promotion review
- id: 20260616-172054-loadout-v7-promotion-review
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-16T17:20:54-03:00
- finished_at: 2026-06-16T17:23:38-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-16T17:23:38-03:00
- branch: codex/docs/loadout-v7-promotion-review
- commit_at_start: 7da551c chore(process): record loadout merge promotion
- summary: Promote completed loadout v7 inbox records after main merge while keeping future combat integration open.
- last_change: Promoted the completed loadout v7, persistent loadout, and equip action inbox records while keeping future combat integration open.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-16T17:20:54-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-16T17:23:38-03:00
- Done: Promoted the completed loadout v7, persistent loadout, and equip action inbox records while keeping future combat integration open.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260616-172054-loadout-v7-promotion-review -->
<!-- pandorha-task:20260615-201706-persistent-equipment-loadout-save-v7 -->
### Persistent equipment loadout save v7
- id: 20260615-201706-persistent-equipment-loadout-save-v7
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-15T20:17:06-03:00
- finished_at: 2026-06-16T13:14:39-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-16T13:14:39-03:00
- branch: codex/docs/equipment-loadout-save-v7-gate
- commit_at_start: b763c4a chore(process): record main inventory merge
- summary: Approve and implement character-owned persistent equipment loadout with save v7, inventory equip UI, rendered validation, and readiness.
- last_change: Loadout persistente entregue no save v7: ledger de equipmentLoadoutEvents, replay e fake em memória, UI de equipar/desequipar no inventário, bloqueio de remoção equipada, roundtrip SQLite/OPFS, smokes atualizados, Browser do Codex/Playwright validado sem erros de console e futuras integrações documentadas.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T20:17:06-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-16T13:14:32-03:00
- Done: Implemented equipment loadout ledger, save v7 persistence, inventory equip/unequip UI, contractual smokes, documentation, and rendered Browser validation.
- Next: Complete maintenance task and prepare atomic commit.
- Risks: Combat still intentionally uses local training loadout; future integration remains documented outside docs/system.
- Improvements: Consider dedicated rendered smoke only after this flow repeats enough to justify a stable browser automation dependency.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-16T13:14:39-03:00
- Done: Loadout persistente entregue no save v7: ledger de equipmentLoadoutEvents, replay e fake em memória, UI de equipar/desequipar no inventário, bloqueio de remoção equipada, roundtrip SQLite/OPFS, smokes atualizados, Browser do Codex/Playwright validado sem erros de console e futuras integrações documentadas.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-201706-persistent-equipment-loadout-save-v7 -->
<!-- pandorha-task:20260615-114907-inventory-post-delivery-audit -->
### Inventory post-delivery audit
- id: 20260615-114907-inventory-post-delivery-audit
- status: completed
- kind: review
- planned: no
- started_at: 2026-06-15T11:49:07-03:00
- finished_at: 2026-06-15T12:32:55-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-15T12:32:55-03:00
- branch: docs/inventory-post-delivery-audit
- commit_at_start: 413099a chore(process): record editable inventory commit
- summary: Audit editable inventory delivery for regressions, inaccessible controls, known limitations, and readiness while preserving Browser do Codex rendered acceptance as mandatory.
- last_change: Auditoria pós-entrega concluída; favicon 404 corrigido, ausências futuras documentadas e gates aprovados.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T11:49:07-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T11:54:39-03:00
- Done: Auditoria estática pós-entrega concluída; nove abas e ações editáveis alcançáveis; 726 testes, cobertura 100%, build, quality gate, smokes, docs e validadores aprovados; seis fases futuras registradas separadamente.
- Next: Executar o fluxo completo no Browser do Codex quando a aba expuser handle de página e console, então concluir as tarefas de UI e auditoria antes do merge.
- Risks: Aceite renderizado, erros de console e roundtrip visual de inventário permanecem não observáveis nesta sessão.
- Improvements: Expor Browser Plugin conectado à aba in-app.
- Model/config: GPT-5.5 xhigh

#### Checkpoint 2026-06-15T11:54:39-03:00
- Done: Auditoria estática e gates executáveis aprovados; auditoria renderizada permanece bloqueada pela ausência do Browser Plugin.
- Next: Validar inventário e nove abas no Browser do Codex antes de concluir e fazer merge.
- Risks: Não promover a auditoria como concluída sem console e fluxo renderizado.
- Improvements: Disponibilizar handle do Browser do Codex.
- Model/config: GPT-5.5 xhigh

#### Checkpoint 2026-06-15T12:32:55-03:00
- Done: Auditoria renderizada concluída; único 404 de favicon corrigido com SVG embutido e teste negativo; console final com zero erros e zero warnings; quality gate aprovado.
- Next: Concluir tarefa e registrar entrega atômica.
- Risks: Ausências deliberadas permanecem no roadmap futuro.
- Improvements: Executar nova auditoria após cada futura superfície visível.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T12:32:55-03:00
- Done: Auditoria pós-entrega concluída; favicon 404 corrigido, ausências futuras documentadas e gates aprovados.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-114907-inventory-post-delivery-audit -->
<!-- pandorha-task:20260615-052210-editable-character-inventory-ui -->
### Editable character inventory UI
- id: 20260615-052210-editable-character-inventory-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-15T05:22:10-03:00
- finished_at: 2026-06-15T12:32:55-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-15T12:32:55-03:00
- branch: feat/inventory-editable-ui
- commit_at_start: b59489b merge: persist inventory ledger in save v6
- summary: Substituir inventory-readonly pela UI editavel, integrar ledger a sessao e save/load e atualizar QA contratual.
- last_change: Inventário editável por personagem entregue e validado de ponta a ponta com persistência v6 e console limpo.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T05:22:10-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T05:39:29-03:00
- Done: Editable character inventory, save v6 wiring, reachability contracts, documentation, 726 tests, 100% coverage, build and full quality gate completed.
- Next: Validate the complete inventory flow and nine-tab audit in the Browser do Codex, then complete and merge the phase.
- Risks: Browser do Codex tab is open but no Browser Plugin handle, page snapshot, click, or console tool is exposed to this agent session; rendered acceptance remains pending.
- Improvements: Add a stable Browser Plugin connection to Codex sessions without adding Playwright to the repository.
- Model/config: GPT-5.5 xhigh

#### Checkpoint 2026-06-15T05:39:29-03:00
- Done: Editable inventory implementation and all executable gates are complete; rendered Browser do Codex acceptance is blocked by missing browser-control tooling.
- Next: Run the documented Browser do Codex flow, repeat qa:ui-reachability, then complete the maintenance task.
- Risks: Do not treat static smokes as rendered acceptance.
- Improvements: Expose the existing in-app browser tab through the Browser Plugin.
- Model/config: GPT-5.5 xhigh

#### Checkpoint 2026-06-15T12:32:55-03:00
- Done: Aceite renderizado concluído com Playwright solicitado: nove abas, personagem, inventário editável, múltiplas pilhas, consumo, remoção, sobrecarga, save v6, reload real e restauração aprovados; console final limpo.
- Next: Concluir tarefa e integrar após gates finais.
- Risks: Nenhuma regressão pendente; loadout persistente permanece fora do escopo.
- Improvements: Manter o contrato de favicon e o roteiro renderizado em qa:ui-reachability.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T12:32:55-03:00
- Done: Inventário editável por personagem entregue e validado de ponta a ponta com persistência v6 e console limpo.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-052210-editable-character-inventory-ui -->
<!-- pandorha-task:20260615-051214-save-load-v6-inventory-ledger -->
### Save-load v6 inventory ledger
- id: 20260615-051214-save-load-v6-inventory-ledger
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-15T05:12:14-03:00
- finished_at: 2026-06-15T05:20:29-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-15T05:20:29-03:00
- branch: feat/save-load-v6-inventory
- commit_at_start: b0e4b5f merge: add character-owned inventory ledger
- summary: Persistir inventoryEvents no save v6, RPC, worker e snapshot SQLite com migracao deterministica v5 para v6.
- last_change: Save v6 persiste inventoryEvents com migracao v1-v5, RPC e transacao SQLite validados.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T05:12:14-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T05:20:28-03:00
- Done: Save v6, RPC, Worker, Drizzle migration e snapshot SQLite implementados; 725 testes, cobertura integral, lint e build aprovados.
- Next: Commitar e integrar a Fase 4; validar o fluxo renderizado junto da UI editavel quando o Browser do Codex estiver exposto.
- Risks: Browser do Codex nao foi exposto como ferramenta controlavel nesta sessao; nenhum Playwright foi usado.
- Improvements: Adicionar a validacao renderizada ao fechamento da Fase 5.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T05:20:29-03:00
- Done: Save v6 persiste inventoryEvents com migracao v1-v5, RPC e transacao SQLite validados.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-051214-save-load-v6-inventory-ledger -->
<!-- pandorha-task:20260606-inventory-ownership-core -->
### Character-owned inventory ledger core
- id: 20260606-inventory-ownership-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-06T06:53:19-03:00
- finished_at: 2026-06-15T05:09:33-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-15T05:09:33-03:00
- branch: feat/inventory-ownership-core
- commit_at_start: 6056566 merge: approve inventory ownership and save v6 gate
- summary: Implementar entidade, repository fake, replay e servico de gerenciamento de inventario por personagem sem UI ou save.
- last_change: Nucleo event-sourced de inventario por personagem implementado com replay, repository fake, gerenciamento tipado e cobertura integral.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-06T06:53:19-03:00
- Done: task record created
- Next: Escrever testes RED para replay e gerenciamento.
- Risks: Acoplamento FSD, sequencias invalidas e pilhas inconsistentes.
- Improvements: Manter catalogos imutaveis e capacidade derivada.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T07:04:45-03:00
- Done: Implementados ledger por personagem, replay multi-personagem, fake repository e servico de gerenciamento com pilhas e capacidade; lint, TypeScript, testes focados e validadores passaram.
- Next: Fechar Fase 3 e iniciar persistencia save v6.
- Risks: test:coverage e build estao intermitentemente bloqueados pelo sandbox/esbuild ao resolver configs na raiz.
- Improvements: Reexecutar cobertura e build no gate final quando a politica permitir.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T07:05:28-03:00
- Done: Implementados entidade event-sourced por personagem, replay multi-personagem, fake repository e servico de gerenciamento com pilhas, consumo, remocao e capacidade derivada.
- Next: Implementar save v6 limitado a inventoryEvents.
- Risks: Cobertura e build devem ser repetidos quando o sandbox/esbuild permitir resolver configs na raiz.
- Improvements: Manter loadout e durabilidade fora do proximo snapshot.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T07:06:15-03:00
- Done: Nucleo de inventario implementado e validado, mas fechamento bloqueado porque o ambiente recusou escrita em .git para stage/commit e a camada elevada atingiu limite externo de uso.
- Next: Quando escrita Git estiver disponivel, executar coverage/build, stage explicito, commit feat(inventory): add character-owned inventory ledger, merge e iniciar save v6 em nova branch.
- Risks: Mudancas da Fase 3 permanecem locais e nao commitadas; nao iniciar save v6 na mesma branch.
- Improvements: Reexecutar gates bloqueados e retomar exatamente do stage explicito.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T05:09:33-03:00
- Done: Nucleo event-sourced de inventario por personagem implementado com replay, repository fake, gerenciamento tipado e cobertura integral.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260606-inventory-ownership-core -->
<!-- pandorha-task:20260606-inventory-ownership-save-v6-gate -->
### Inventory ownership and save v6 gate
- id: 20260606-inventory-ownership-save-v6-gate
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-06T06:45:53-03:00
- finished_at: 2026-06-06T06:49:18-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-06T06:49:18-03:00
- branch: main
- commit_at_start: 8e48cfa fix(ui): protect reachability regressions
- summary: Aprovar contrato event-sourced de inventario pertencente ao personagem e limitar save v6 a inventoryEvents antes de qualquer implementacao.
- last_change: Aprovado contrato append-only de inventario por personagem, limites do save v6, invariantes de replay e sequencia modular de entrega.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-06T06:45:53-03:00
- Done: task record created
- Next: Documentar contrato, invariantes e limites do gate v6.
- Risks: Acoplamento indevido com equipamento, combate ou estado derivado.
- Improvements: Reutilizar o contrato aprovado em dominio, persistencia e UI.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T06:49:18-03:00
- Done: Aprovado contrato append-only de inventario por personagem, limites do save v6, invariantes de replay e sequencia modular de entrega.
- Next: Implementar nucleo event-sourced em branch propria por Reverse TDD.
- Risks: Loadout, durabilidade, HP real e outros dominios continuam fora do save v6.
- Improvements: Reutilizar o ledger aprovado em persistencia e UI sem persistir derivados.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260606-inventory-ownership-save-v6-gate -->
<!-- pandorha-task:20260606-022029-ui-reachability-regressions-and-audit -->
### UI reachability regressions and audit
- id: 20260606-022029-ui-reachability-regressions-and-audit
- status: completed
- kind: fix
- planned: no
- started_at: 2026-06-06T02:20:29-03:00
- finished_at: 2026-06-06T06:22:57-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-06T06:22:57-03:00
- branch: fix/ui-reachability-regressions
- commit_at_start: 8cbfdb9 chore(process): record combat preview merge
- summary: Corrigir regressões confirmadas de acessibilidade da UI, criar gate contratual qa:ui-reachability, validar pelo Browser do Codex e documentar futuras implementações após nova auditoria.
- last_change: Correcoes de alcance da UI, gate contratual, auditoria pos-correcao e roadmap concluidos; Browser do Codex, cobertura 100%, build e quality gate aprovados.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-06T02:20:29-03:00
- Done: task record created
- Next: Criar teste RED do smoke ui-reachability
- Risks: Regressões renderizadas podem não ser detectadas apenas pelo smoke contratual; Browser do Codex permanece obrigatório.
- Improvements: Transformar auditoria recorrente de alcance da UI em gate local determinístico.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T02:26:31-03:00
- Done: Gate qa:ui-reachability criado com sete fixtures; regressões de Acampamento, navegação e guia de personagens corrigidas; integração com quality:automation e readiness implementada.
- Next: Executar gates completos e validar fluxos renderizados no Browser do Codex.
- Risks: A validação renderizada ainda pode revelar regressões não cobertas pelo smoke contratual.
- Improvements: Manter novos contratos estáveis de alcance da UI no smoke sem substituir o Browser do Codex.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T02:35:13-03:00
- Done: Correcoes de alcance da UI, gate qa:ui-reachability, integracoes, auditoria estatica pos-correcao e roadmap de ausencias concluidos; npm test passou com 707 testes; lint, quality:automation, smokes, MCPs, skills, docs:audit e maintenance validate passaram.
- Next: Repetir somente a auditoria renderizada no Browser do Codex quando localhost:5173 voltar a ser permitido e reexecutar build/cobertura fora do bloqueio de acesso do esbuild.
- Risks: Browser do Codex recusou localhost:5173 por politica ativa; build, cobertura e os subprocessos Vitest do quality:gate foram bloqueados pelo sandbox ao ler configs, embora npm test direto tenha passado.
- Improvements: Manter qa:ui-reachability como gate contratual e usar o roadmap pos-auditoria para iniciar futuras implementacoes apenas apos seus contratos e gates.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T02:35:26-03:00
- Done: Implementacao, automacao, correcoes, auditoria estatica e roadmap concluidos. Fechamento renderizado permanece pendente porque o Browser do Codex recusou localhost:5173 por politica ativa; build e cobertura permanecem bloqueados pelo sandbox do esbuild.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T06:22:48-03:00
- Done: Browser do Codex validou nove abas sem erros de console, criacao de personagem, log imediato correto do Acampamento e restauracao apos save/reload/load de personagem, negociacao e Acampamento; cobertura 100%, build e quality:gate passaram.
- Next: Concluir manutencao, repetir gates documentais, criar commit atomico e executar qa:next-phase-readiness.
- Risks: Somente aviso conhecido de chunk principal acima de 500 kB; sem regressao funcional encontrada.
- Improvements: Avaliar code splitting em tarefa futura separada, sem ampliar este fechamento.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T06:22:57-03:00
- Done: Correcoes de alcance da UI, gate contratual, auditoria pos-correcao e roadmap concluidos; Browser do Codex, cobertura 100%, build e quality gate aprovados.
- Next: Criar commit atomico e validar readiness da proxima fase.
- Risks: Aviso conhecido de chunk principal acima de 500 kB permanece como otimizacao futura.
- Improvements: Manter qa:ui-reachability e Browser do Codex como gates complementares.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260606-022029-ui-reachability-regressions-and-audit -->
<!-- pandorha-task:20260605-201308-t104-combat-real-damage-preview-ui -->
### T104 combat real damage preview UI
- id: 20260605-201308-t104-combat-real-damage-preview-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-05T20:13:08-03:00
- finished_at: 2026-06-06T00:19:27-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-06T00:19:27-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: 08150a3 feat(combat): add real hit points replay
- summary: Exibir previa local de HP real na aba Combate usando ponte evento+replay e Browser do Codex como gate, sem save, banco ou estados oficiais.
- last_change: Local real HP preview UI implemented and documented. Coverage reached 100% with 707 tests; build, full quality gate, self-review, and Codex In-app Browser validation passed, including active preview, reset, Aria hiding, narrow viewport containment, and clean console.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/t100-combat-real-damage-ui-gate.md
- docs/process/task-ledger.md
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/combatRealDamageLedgerUpdate.spec.ts
- src/features/combat-encounter/__tests__/combatRealDamagePreviewView.spec.ts
- src/features/combat-encounter/model/combatRealDamageLedgerUpdate.ts
- src/features/combat-encounter/model/combatRealDamagePreviewView.ts
#### Checkpoints
#### Checkpoint 2026-06-05T20:13:08-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:19:33-03:00
- Done: Implemented local real HP preview UI in CombatEncounterPanel, documented user flow, updated module context, and validated non-elevated gates: core-conventions, npm test, lint, qa:vertical-slice, docs:audit, maintenance validate and doctor.
- Next: Run elevated coverage, build, quality gate, commit T102-T104, and Codex Browser UI validation after the elevation usage limit and iab bootstrap issues are resolved.
- Risks: Coverage, build, quality gate, commit, and Codex Browser validation remain blocked by elevation usage limit and unusable iab/browser bootstrap.
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:19:40-03:00
- Done: Local real HP preview UI implemented and documented. Non-elevated gates passed. Final elevated gates and Codex Browser validation are blocked by environment limits.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T00:19:27-03:00
- Done: Local real HP preview UI implemented and documented. Coverage reached 100% with 707 tests; build, full quality gate, self-review, and Codex In-app Browser validation passed, including active preview, reset, Aria hiding, narrow viewport containment, and clean console.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-201308-t104-combat-real-damage-preview-ui -->
<!-- pandorha-task:20260605-200939-t103-combat-real-damage-preview-view -->
### T103 combat real damage preview view
- id: 20260605-200939-t103-combat-real-damage-preview-view
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-05T20:09:39-03:00
- finished_at: 2026-06-05T20:12:54-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-05T20:12:54-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: 08150a3 feat(combat): add real hit points replay
- summary: Criar view model pt-BR para previa local de HP real antes da UI, sem save, banco ou estados oficiais.
- last_change: T103 concluida: view model pt-BR para previa local de HP real criado com estados unavailable/active/terminal/failure, copy segura, exports publicos, coverage registrado e T100/contextos atualizados.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/combatRealDamageLedgerUpdate.spec.ts
- src/features/combat-encounter/model/combatRealDamageLedgerUpdate.ts
#### Checkpoints
#### Checkpoint 2026-06-05T20:09:39-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:12:10-03:00
- Done: T103 view model de previa local de HP real implementado com spec focada verde e copy segura pt-BR.
- Next: Completar T103 e integrar UI minima T104.
- Risks: Coverage elevado segue bloqueado pelo limite do ambiente; repetir no fechamento se permitido.
- Improvements: T104 deve consumir o view model sem duplicar copy no Svelte.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:12:54-03:00
- Done: T103 concluida: view model pt-BR para previa local de HP real criado com estados unavailable/active/terminal/failure, copy segura, exports publicos, coverage registrado e T100/contextos atualizados.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-200939-t103-combat-real-damage-preview-view -->
<!-- pandorha-task:20260605-200435-t102-combat-real-damage-ledger-update -->
### T102 combat real damage ledger update
- id: 20260605-200435-t102-combat-real-damage-ledger-update
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-05T20:04:35-03:00
- finished_at: 2026-06-05T20:09:01-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-05T20:09:01-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: 08150a3 feat(combat): add real hit points replay
- summary: Compor append de evento realDamageReceived com replay puro de HP real sem UI, save, Worker ou estados oficiais.
- last_change: T102 concluida: ponte pura entre realDamageReceived e replay de HP real criada com Result tipado, bloqueios terminal/replay, exports publicos, coverage registrado e memoria tripla atualizada.
#### Files At Start
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-05T20:04:35-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:09:00-03:00
- Done: T102 ponte evento+replay implementada com specs focadas e lint verdes.
- Next: Completar T102, commitar e abrir T103 copy/view model.
- Risks: Coverage elevado bloqueado pelo limite de uso do ambiente; repetir no fechamento se a elevação voltar.
- Improvements: T103 deve manter copy pt-BR segura e testavel antes de Svelte.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:09:01-03:00
- Done: T102 concluida: ponte pura entre realDamageReceived e replay de HP real criada com Result tipado, bloqueios terminal/replay, exports publicos, coverage registrado e memoria tripla atualizada.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-200435-t102-combat-real-damage-ledger-update -->
<!-- pandorha-task:20260605-195904-t101-combat-real-hp-replay -->
### T101 combat real HP replay
- id: 20260605-195904-t101-combat-real-hp-replay
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-05T19:59:04-03:00
- finished_at: 2026-06-05T20:04:04-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-05T20:04:04-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: b982682 feat(combat): add real damage event contract
- summary: Criar replay puro de HP real a partir de eventos realDamageReceived sem UI, save, banco ou estados oficiais.
- last_change: T101 concluida: replay puro de HP real por eventos realDamageReceived criado com Result tipado, bloqueio post-terminal, exports publicos, coverage registrado e memoria tripla atualizada.
#### Files At Start
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-05T19:59:04-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:02:01-03:00
- Done: T101 replay puro de HP real implementado com spec focada verde, exports publicos, coverage registrado e memoria tripla atualizada.
- Next: Rodar gates completos, completar T101 e abrir T102 ponte evento+replay.
- Risks: Sem UI/save; terminal oficial permanece bloqueado.
- Improvements: T102 deve compor evento append-only e replay sem duplicar regras.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T20:04:04-03:00
- Done: T101 concluida: replay puro de HP real por eventos realDamageReceived criado com Result tipado, bloqueio post-terminal, exports publicos, coverage registrado e memoria tripla atualizada.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-195904-t101-combat-real-hp-replay -->
<!-- pandorha-task:20260605-183829-t99-combat-real-damage-event-contract -->
### T99 combat real damage event contract
- id: 20260605-183829-t99-combat-real-damage-event-contract
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-05T18:38:29-03:00
- finished_at: 2026-06-05T19:15:58-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-05T19:15:58-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: 97087f5 chore(process): record T98 post-commit snapshot
- summary: Criar contrato puro de evento de dano recebido real sem UI, save v6, banco, HP real persistido ou estados oficiais.
- last_change: T99 concluida: contrato puro realDamageReceived criado com Result tipado, ledger explicito append-only, falhas para alvo, ledger, dano e terminal, coverage registrado, memoria tripla e gate T100 sem UI/Playwright obrigatorio para futura mudanca visual.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-05T18:38:29-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T18:44:55-03:00
- Done: T99 implementada com contrato puro realDamageReceived, spec TDD verde, exports publicos, memoria tripla e gate T100 sem UI.
- Next: Rodar core-conventions, lint, testes, coverage, quality gate, docs audit e automation doctor.
- Risks: UI permanece fora do escopo; Playwright sera obrigatorio somente quando houver mudanca visual aprovada.
- Improvements: Proxima tarefa recomendada: replay puro de HP real a partir de eventos antes de qualquer UI.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T19:15:58-03:00
- Done: T99 concluida: contrato puro realDamageReceived criado com Result tipado, ledger explicito append-only, falhas para alvo, ledger, dano e terminal, coverage registrado, memoria tripla e gate T100 sem UI/Playwright obrigatorio para futura mudanca visual.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-183829-t99-combat-real-damage-event-contract -->
<!-- pandorha-task:20260605-173410-t98-official-incoming-damage-gate -->
### T98 official incoming damage gate
- id: 20260605-173410-t98-official-incoming-damage-gate
- status: completed
- kind: maintenance
- planned: no
- started_at: 2026-06-05T17:34:10-03:00
- finished_at: 2026-06-05T17:43:52-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-05T17:43:52-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: bf1996d chore(process): record post-commit snapshots
- summary: Criar gate documental A/B/C para decidir dano recebido real, HP real e save v6 antes de qualquer implementacao mecanica.
- last_change: T98 concluida: criado gate documental A/B/C para dano recebido real, recomendando proxima microtarefa economica sem HP real, save v6, UI, banco, durabilidade, monstros oficiais ou promocao para docs/system; gates docs:audit, lint, test, test:coverage, quality:gate e automation:doctor validados.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-05T17:34:10-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T17:43:52-03:00
- Done: T98 concluida: criado gate documental A/B/C para dano recebido real, recomendando proxima microtarefa economica sem HP real, save v6, UI, banco, durabilidade, monstros oficiais ou promocao para docs/system; gates docs:audit, lint, test, test:coverage, quality:gate e automation:doctor validados.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-173410-t98-official-incoming-damage-gate -->
<!-- pandorha-task:20260605-131506-offline-dependency-security-gate -->
### Offline dependency security gate
- id: 20260605-131506-offline-dependency-security-gate
- status: completed
- kind: chore
- planned: no
- started_at: 2026-06-05T13:15:06-03:00
- finished_at: 2026-06-05T13:27:48-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-05T13:27:48-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: fd9a314 chore(process): record t94 post-commit snapshot
- summary: Replace npm audit in quality gate with deterministic offline dependency security automation and explicit advisory refresh.
- last_change: Implemented an offline dependency security gate that replaces npm audit inside quality:gate, added a versioned advisory database, manual advisory refresh automation, focused tests, package scripts, quality automation integration, and process documentation.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatTrainingDefenderHitPoints.spec.ts
- src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- output/
#### Checkpoints
#### Checkpoint 2026-06-05T13:15:06-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T13:27:48-03:00
- Done: Implemented an offline dependency security gate that replaces npm audit inside quality:gate, added a versioned advisory database, manual advisory refresh automation, focused tests, package scripts, quality automation integration, and process documentation.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-131506-offline-dependency-security-gate -->
<!-- pandorha-task:20260605-122617-t97-training-defender-hp-terminal -->
### T97 training defender HP terminal
- id: 20260605-122617-t97-training-defender-hp-terminal
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-05T12:26:17-03:00
- finished_at: 2026-06-05T12:36:58-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-05T12:36:58-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: fd9a314 chore(process): record t94 post-commit snapshot
- summary: Implementar estado terminal local para HP de treino do defensor, bloqueando novo dano recebido de treino quando chegar a 0 sem HP real, save, Moribundo, Inconsciente, durabilidade ou monstros oficiais.
- last_change: T97 concluida: HP de treino do defensor agora possui estado terminal local com view model testavel, UI explicita Teste recebido encerrado, bloqueio de novo dano recebido apos 0, smoke vertical/docs/memoria atualizados e gates locais validados; quality:gate completo ficou bloqueado por politica externa do npm audit.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-05T12:26:17-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T12:36:50-03:00
- Done: T97 implementada: helper terminal de HP de treino, bloqueio de novo dano recebido local apos 0, UI com Teste recebido encerrado, docs, memoria tripla e smoke vertical atualizados.
- Next: Fechar registro, registrar snapshot e deixar quality:gate completo pendente apenas se houver aprovacao explicita para npm audit externo.
- Risks: quality:gate completo nao pode ser repetido elevado sem aprovacao explicita porque inclui npm audit e envio de metadados ao registry; subgates locais passaram individualmente.
- Improvements: Separar futuramente audit externo de quality:gate local para ambientes com politica restritiva.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-05T12:36:58-03:00
- Done: T97 concluida: HP de treino do defensor agora possui estado terminal local com view model testavel, UI explicita Teste recebido encerrado, bloqueio de novo dano recebido apos 0, smoke vertical/docs/memoria atualizados e gates locais validados; quality:gate completo ficou bloqueado por politica externa do npm audit.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260605-122617-t97-training-defender-hp-terminal -->
<!-- pandorha-task:20260604-211412-t94-t96-training-incoming-damage-core -->
### T94-T96 training incoming damage core
- id: 20260604-211412-t94-t96-training-incoming-damage-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-04T21:14:12-03:00
- finished_at: 2026-06-05T10:43:06-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5 high-reasoning
- last_modified_at: 2026-06-05T10:43:06-03:00
- branch: task/t94-training-incoming-damage-contract
- commit_at_start: 85a24e9 chore(process): record t93 post-commit snapshot
- summary: Implementar contrato de dano recebido de treino, HP local nao persistido e suporte documental/automacao sem save, monstros oficiais, durabilidade ou docs/system promotion.
- last_change: T94-T96 implementadas: contrato de dano recebido de treino, HP de treino local nao persistido, UI/docs/smoke/memoria atualizados e gates funcionais verdes.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-04T21:14:12-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-06-04T21:25:51-03:00
- Done: T94 implementado e validado com Vitest focado antes do bloqueio; T95/T96 implementados com HP de treino local, smoke, docs e memoria tripla.
- Next: Rodar validadores locais sem elevacao, revisar diff e registrar bloqueio dos gates Vitest completos ate execucao elevada voltar.
- Risks: Execucao elevada foi recusada por limite de uso depois do T94; T95/T96 ainda precisam de Vitest/lint/coverage/quality gate quando o ambiente permitir.
- Improvements: Considerar manter HP de treino como contrato local ate save-version e regras oficiais de dano real serem aprovadas.
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-06-04T21:28:19-03:00
- Done: Implementacao T94-T96 aplicada: dano recebido de treino, HP de treino local nao persistido, smoke/docs/memoria atualizados. Fechamento completo bloqueado porque Vitest/build/coverage/quality gate exigem execucao elevada e o ambiente recusou por limite de uso; lint, TypeScript, core-conventions, smoke vertical, docs:audit, automation:doctor, coverage registration, hard_stop e diff checks passaram.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-06-05T10:43:06-03:00
- Done: T94-T96 implementadas: contrato de dano recebido de treino, HP de treino local nao persistido, UI/docs/smoke/memoria atualizados e gates funcionais verdes.
- Next: Commitar a implementacao antes de rodar qa:next-phase-readiness, que exige git status limpo exceto output/.
- Risks: HP real, save, monstros oficiais, durabilidade e estados Moribundo/Inconsciente permanecem fora do escopo.
- Improvements: Readiness gate documentado como pos-commit; smoke vertical cobre HP de treino local.
- Model/config: gpt-5 high-reasoning
<!-- /pandorha-task:20260604-211412-t94-t96-training-incoming-damage-core -->
<!-- pandorha-task:20260604-202736-t93-documentation-promotion-draft -->
### T93 documentation promotion draft
- id: 20260604-202736-t93-documentation-promotion-draft
- status: completed
- kind: maintenance
- planned: no
- started_at: 2026-06-04T20:27:36-03:00
- finished_at: 2026-06-04T20:35:52-03:00
- model_started: GPT-5 high reasoning; local automation zero-token
- model_finished: GPT-5 high reasoning; local automation zero-token
- last_modified_at: 2026-06-04T20:35:52-03:00
- branch: feat/metadata-tags-codex
- commit_at_start: 4c8863a chore(process): record t92 post-commit snapshot
- summary: Atualizar a auditoria documental e criar um rascunho revisavel cobrindo todas as 82 promocoes abertas sem mover change-inbox para Promoted fora de main.
- last_change: T93 concluiu a rodada documental: auditoria regenerada para 134 Markdown e 83 entradas abertas, rascunho de promocao criado cobrindo todos os IDs exatamente uma vez, fluxo de promocao documentado, recorte arquitetural de treino registrado, QA vertical atualizado e gates docs:audit, lint, test e automation:doctor validados.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-04T20:27:36-03:00
- Done: task record created
- Next: Regenerar documentation-audit e criar rascunho de promocao documental.
- Risks: Nao promover docs/system por inferencia do codigo; manter change-inbox aberto ate main.
- Improvements: Usar docs:audit como fonte repetivel para futuras promocoes.
- Model/config: GPT-5 high reasoning; local automation zero-token

#### Checkpoint 2026-06-04T20:35:52-03:00
- Done: T93 concluiu a rodada documental: auditoria regenerada para 134 Markdown e 83 entradas abertas, rascunho de promocao criado cobrindo todos os IDs exatamente uma vez, fluxo de promocao documentado, recorte arquitetural de treino registrado, QA vertical atualizado e gates docs:audit, lint, test e automation:doctor validados.
- Next: Depois de merge/default branch, revisar documentation-promotion-draft.md e promover apenas itens com docs-alvo revisados; nao mover change-inbox para Promoted nesta branch.
- Risks: Os 13 itens de sistema permanecem bloqueados para revisao contra docs/system; 4 itens continuam como nao promover ainda; 115 referencias textuais historicas seguem como aviso de auditoria, sem links quebrados.
- Improvements: Automatizar futuramente a geracao inicial da tabela de promocao a partir de audit_docs para reduzir edicao manual em lotes grandes.
- Model/config: GPT-5 high reasoning; local automation zero-token
<!-- /pandorha-task:20260604-202736-t93-documentation-promotion-draft -->
<!-- pandorha-task:20260602-124529-t92-enemy-training-attack-against-session-charac -->
### T92 enemy training attack against session character
- id: 20260602-124529-t92-enemy-training-attack-against-session-charac
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-02T12:45:29-03:00
- finished_at: 2026-06-02T13:16:53-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: GPT-5 high reasoning
- last_modified_at: 2026-06-02T13:16:53-03:00
- branch: feat/metadata-tags-codex
- commit_at_start: 88e4479 chore(process): record post-merge snapshot
- summary: Implement a minimal training enemy attack against a session character using equipped armor and shield CA only as a defensive target, without save v6, official monsters, AI, grid, persistence, durability, or damage mutation.
- last_change: T92 implemented a minimal training enemy attack against the selected session character, using equipped armor and shield CA as a transient defensive target without HP mutation, damage persistence, save v6, official monsters, AI, grid, durability, or schema changes.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-02T12:45:29-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-02T13:16:53-03:00
- Done: T92 implemented a minimal training enemy attack against the selected session character, using equipped armor and shield CA as a transient defensive target without HP mutation, damage persistence, save v6, official monsters, AI, grid, durability, or schema changes.
- Next: After merge, plan the next combat slice only after confirming official incoming damage and character HP rules.
- Risks: Browser validation confirmed character creation, combat selection, and CA contra treino display, but the in-app Browser blocked the final click sequence on 127.0.0.1:4173 by security policy before resolving the target attack visually.
- Improvements: Added coverage registration for the new combat domain service and extended vertical slice smoke contracts for training enemy attack UI wiring.
- Model/config: GPT-5 high reasoning
<!-- /pandorha-task:20260602-124529-t92-enemy-training-attack-against-session-charac -->
<!-- pandorha-task:20260602-073042-t91-equipped-defense-profile -->
### T91 equipped defense profile
- id: 20260602-073042-t91-equipped-defense-profile
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-02T07:30:42-03:00
- finished_at: 2026-06-02T07:56:36-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-02T07:56:36-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 85de1e2 chore(process): record d01.2 post-commit snapshot
- summary: Add minimal equipped armor and shield defense profile from existing equipment catalog, expose activeDefenseProfile on loadout snapshots, and show equipped defense in the combat UI without save v6, migration, enemy attacks, official monsters, or damage changes.
- last_change: T91 implemented minimal equipped defense: structured armor/shield defense profiles, activeDefenseProfile in loadout snapshots, combat UI display, tests, documentation, and Browser validation.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-02T07:30:42-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-02T07:56:25-03:00
- Done: Implemented equipped armor and shield defense profiles, UI display, tests, docs, context memory, and Browser validation.
- Next: Commit T91 and run next-phase readiness.
- Risks: Equipped defense remains display-only until official incoming attack rules exist.
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-02T07:56:36-03:00
- Done: T91 implemented minimal equipped defense: structured armor/shield defense profiles, activeDefenseProfile in loadout snapshots, combat UI display, tests, documentation, and Browser validation.
- Next: Keep defense display read-only until an official incoming attack contract is planned.
- Risks: No save migration, durability spending, enemy attack, damage change, or official monster behavior was introduced.
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260602-073042-t91-equipped-defense-profile -->
<!-- pandorha-task:20260602-072310-d01-2-strict-quality-gate-recovery -->
### D01.2 strict quality gate recovery
- id: 20260602-072310-d01-2-strict-quality-gate-recovery
- status: completed
- kind: maintenance
- planned: no
- started_at: 2026-06-02T07:23:10-03:00
- finished_at: 2026-06-02T07:29:33-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-02T07:29:33-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: fa55bac chore(process): close t90 snapshot ledger
- summary: Resolve remaining npm audit blockers for Vitest coverage and Drizzle Kit/esbuild without npm audit fix --force, preserving db:generate and all existing gates before opening T91.
- last_change: D01.2 completed: Vitest and @vitest/coverage-v8 upgraded to 4.1.8, vulnerable @esbuild-kit/core-utils esbuild dependency overridden to a safe 0.25.x line, npm audit reports zero vulnerabilities, db:generate remains stable, coverage restored to 100% with an extra BrowserWorkerBridge branch test, and the full quality:gate plus QA smokes pass.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-02T07:23:10-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-02T07:25:24-03:00
- Done: Applied explicit Vitest 4.1.8 and @vitest/coverage-v8 4.1.8 upgrade plus an @esbuild-kit/core-utils esbuild override; npm install completed; npm audit --audit-level=high reports zero vulnerabilities; db:generate still reports no schema changes.
- Next: Run lint, tests, coverage, build, quality gate, QA smokes, then complete and commit D01.2.
- Risks: Vitest major upgrade may expose behavior changes in tests or coverage thresholds; no RPG, UI, save, schema or RPC changes should be made in this phase.
- Improvements: If Drizzle removes @esbuild-kit/esm-loader in a future release, remove the temporary override after audit remains clean.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-02T07:29:33-03:00
- Done: D01.2 completed: Vitest and @vitest/coverage-v8 upgraded to 4.1.8, vulnerable @esbuild-kit/core-utils esbuild dependency overridden to a safe 0.25.x line, npm audit reports zero vulnerabilities, db:generate remains stable, coverage restored to 100% with an extra BrowserWorkerBridge branch test, and the full quality:gate plus QA smokes pass.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260602-072310-d01-2-strict-quality-gate-recovery -->
<!-- pandorha-task:20260601-232034-t90-documentation-audit-automation -->
### T90 documentation audit automation
- id: 20260601-232034-t90-documentation-audit-automation
- status: completed
- kind: maintenance
- planned: no
- started_at: 2026-06-01T23:20:34-03:00
- finished_at: 2026-06-01T23:30:52-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-01T23:30:52-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: fd20c0d chore(process): record t89 final snapshot
- summary: Create a reusable documentation audit automation, generate a reproducible project documentation audit report, and classify pending documentation promotion items without promoting them outside main.
- last_change: T90 completed: reusable docs audit automation added with tests and docs:audit command; quality:automation now runs the audit; documentation-audit.md records inventory, structural findings, and 79 open promotion entries without promoting them outside main; docs/system rules were not changed.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T23:20:34-03:00
- Done: task record created
- Next: Implement audit_docs script and tests, then generate documentation-audit report and update process docs.
- Risks: Broad documentation surface; avoid speculative docs/system changes and do not promote change-inbox items while branch is not main.
- Improvements: Make documentation audits reproducible with a Windows-first Node command.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T23:30:44-03:00
- Done: Implemented read-only documentation audit automation, tests, package command, quality:automation integration, documentation-audit report, H1 structural fixes, process docs, tooling map, llms link, and scripts memory triple.
- Next: Complete T90, record documentation-audit snapshot, and run final status review.
- Risks: Audit report is advisory and still lists historical missing path references and possible orphan docs; no docs/system rule promotion was performed.
- Improvements: Future audit pass can tune accepted historical findings or add anchor validation after heading normalization.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T23:30:52-03:00
- Done: T90 completed: reusable docs audit automation added with tests and docs:audit command; quality:automation now runs the audit; documentation-audit.md records inventory, structural findings, and 79 open promotion entries without promoting them outside main; docs/system rules were not changed.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260601-232034-t90-documentation-audit-automation -->
<!-- pandorha-task:20260601-222318-t89-combat-target-defenses -->
### T89 combat target defenses
- id: 20260601-222318-t89-combat-target-defenses
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-01T22:23:18-03:00
- finished_at: 2026-06-01T23:08:31-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-01T23:08:31-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 10808df chore(process): record t88 final snapshot
- summary: Add a minimal combat target defense contract so training targets can feed fixed damage reduction and supported damage affinities into the existing DamagePipelineService, without vulnerability dice, save v6, migration, durability, proficiency, or broad UI expansion.
- last_change: T89 concluida: alvos de treino agora carregam RD e afinidades defensivas fixas, a sessao de combate envia essas defesas para o DamagePipelineService, o fluxo renderizado Aria contra Duelista validou dano final reduzido para 4, sem vulnerabilidade +1d6, monstros oficiais, save v6, migration, durabilidade ou proficiencia.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T22:23:18-03:00
- Done: task record created
- Next: Write failing tests for training target defenses flowing into combat damage input, then implement the smallest catalog/session change.
- Risks: quality:gate root:audit remains blocked by D01.1 dependency audit; T89 must not add vulnerability +1d6, monster rules, persistence, save v6, migration, or full equipment durability.
- Improvements: If target defenses are reused by official monsters later, extract a shared defender-defense contract after the second consumer.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T22:28:20-03:00
- Done: Implemented minimal T89 contract: training targets now expose fixed damageReduction and resistance/immunity affinities, combat session feeds those defenses into DamagePipelineService inputs, focused red-first tests pass, and combat docs/memory were updated.
- Next: Run lint, full tests, coverage, build, quality gate, QA smokes, rendered Browser validation for the visible Duelista damage flow, then complete and commit.
- Risks: quality:gate root:audit remains blocked by D01.1 dependency audit; T89 intentionally excludes vulnerability +1d6, monster rules, save v6, persistence, durability, proficiency, and broad UI controls.
- Improvements: Future official monsters should reuse a lower-layer defender defense contract after a second consumer exists.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T22:29:37-03:00
- Done: Implemented T89 code/docs through focused validation: target defense catalog, session damage wiring, red-first focused tests, core-conventions validation, and lint/TypeScript passed.
- Next: When elevated execution is available again, run full test suite, coverage, build, quality gate, QA smokes, Browser validation, then complete, commit, snapshot, and qa:next-phase-readiness.
- Risks: Full Vitest suite could not be rerun because elevated command execution was rejected by the Codex usage limit after sandbox blocked vitest.config.mjs; changes remain uncommitted.
- Improvements: Resume with npm.cmd test under elevated execution before making further code changes.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T23:08:31-03:00
- Done: T89 concluida: alvos de treino agora carregam RD e afinidades defensivas fixas, a sessao de combate envia essas defesas para o DamagePipelineService, o fluxo renderizado Aria contra Duelista validou dano final reduzido para 4, sem vulnerabilidade +1d6, monstros oficiais, save v6, migration, durabilidade ou proficiencia.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260601-222318-t89-combat-target-defenses -->
<!-- pandorha-task:20260601-215735-t88-weapon-dice-roll-contract -->
### T88 weapon dice roll contract
- id: 20260601-215735-t88-weapon-dice-roll-contract
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-01T21:57:35-03:00
- finished_at: 2026-06-01T22:16:53-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-01T22:16:53-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 8019a63 chore(process): record t87 final snapshot
- summary: Replace deterministic weapon baseDiceTotal in combat training with an auditable DiceService weapon die roll for current official weapon expressions 1d4 and 1d8, keeping DamagePipelineService as consumer of the rolled total and avoiding RD, affinity, durability, save v6, migration, or UI expansion.
- last_change: T88 concluida: o contrato de dano de arma agora rola 1d4/1d8 via DiceService antes do DamagePipelineService, registra evento auditavel weaponDamageRolled, conecta o loadout local da sessao ao combate e documenta o limite sem RD, afinidade, desgaste, persistencia ou save v6.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T21:57:35-03:00
- Done: task record created
- Next: Write failing tests for audited weapon die rolls, then implement the smallest service/domain change.
- Risks: quality:gate root:audit remains blocked by D01.1 dependency audit; T88 must not introduce full damage, durability, persistence, or broad UI changes.
- Improvements: If dice expression parsing repeats later, extract a small shared parser only after the second concrete consumer.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T22:07:05-03:00
- Done: Implemented T88 contract: combat damage input accepts optional supported weapon dice, CombatEncounterService rolls 1d4/1d8 through DiceService before DamagePipelineService, records weaponDamageRolled audit event, app session passes weaponDice from equipped profiles, and combat docs/memory were updated.
- Next: Run full test suite, coverage, build, QA smokes, Browser Use if rendered combat copy changed, then complete and commit.
- Risks: quality:gate root:audit remains blocked by D01.1 dependency audit; UI visible copy changed in combat profile/log, so a small Browser validation may be needed.
- Improvements: Future dice expressions should add tests before expanding the supported union beyond 1d4 and 1d8.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T22:16:53-03:00
- Done: T88 concluida: o contrato de dano de arma agora rola 1d4/1d8 via DiceService antes do DamagePipelineService, registra evento auditavel weaponDamageRolled, conecta o loadout local da sessao ao combate e documenta o limite sem RD, afinidade, desgaste, persistencia ou save v6.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260601-215735-t88-weapon-dice-roll-contract -->
<!-- pandorha-task:20260601-123434-t87-combat-equipped-weapon-ui -->
### T87 combat equipped weapon UI
- id: 20260601-123434-t87-combat-equipped-weapon-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-01T12:34:34-03:00
- finished_at: 2026-06-01T18:18:07-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-01T18:18:07-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 2ebdf77 chore(process): record t86 final snapshot
- summary: Connect EquipmentLoadoutService to the combat tab with a local session weapon selector, defaulting player characters to Espada Longa while keeping Aria on a fixed training profile; update static QA and validate rendered combat flow with Browser Use.
- last_change: T87 concluida: a aba Combate agora usa EquipmentLoadoutService via app boundary, mostra seletor local de Arma equipada para personagens da sessao com Espada Longa padrao, mantem Aria em perfil fixo, troca para Adaga/armas oficiais, alimenta activeWeaponProfile no ataque e possui Browser Use renderizado validado em http://127.0.0.1:5173/.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T12:34:34-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T12:45:03-03:00
- Done: Implemented T87 code path: combat session exposes official weapon options/default loadout builder, combat UI renders local equipped weapon selector, activeWeaponProfile feeds session-character attacks, static vertical-slice smoke and combat guide were updated.
- Next: Run full technical gates, then complete Browser Use rendered validation if the in-app browser target is allowed.
- Risks: Browser Use rejected http://127.0.0.1:5173/ by policy, so rendered UI validation is pending and must not be worked around via alternate browser surfaces.
- Improvements: If browser policy remains blocked, add a short process note before handoff rather than pretending rendered validation passed.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T18:04:43-03:00
- Done: T87 technical validation completed: lint, focused tests, full test suite, coverage, build, qa:vertical-slice, qa:social-browser-smoke, qa:dialogue-seeds and self-review hard stop passed; quality:gate remains blocked only by the documented D01.1 npm audit issue.
- Next: Obtain explicit permission to use Browser Use on http://127.0.0.1:5173/ for the rendered combat weapon selector flow, then complete task, commit, snapshot and run qa:next-phase-readiness.
- Risks: Rendered Browser validation for the UI change is still pending because Browser Use previously rejected http://127.0.0.1:5173/ by policy; quality:gate still fails at root:audit due Vitest/drizzle-kit/esbuild breaking audit blockers documented in D01.1.
- Improvements: Keep the static vertical-slice contract as fallback evidence, but do not claim rendered UI acceptance until Browser Use is explicitly allowed and completed.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T18:06:27-03:00
- Done: Applied final UI state refinement so loadout errors are only shown for session-character attackers; reran lint, focused combatEncounterSession tests, qa:vertical-slice, and process validate successfully.
- Next: Await explicit Browser Use permission for http://127.0.0.1:5173/ rendered validation, then complete the task, commit, snapshot, and run qa:next-phase-readiness.
- Risks: Browser Use rendered validation remains pending by policy; quality:gate remains blocked only by the documented D01.1 npm audit issue requiring breaking dependency decisions.
- Improvements: Keep Browser acceptance separate from static QA in the final handoff so future agents do not mistake contract validation for rendered validation.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T18:13:44-03:00
- Done: Browser Use rendered validation completed on http://127.0.0.1:5173/: Aria keeps the fixed training profile with disabled weapon selector; a session character Nara can be created, selected in combat, defaults to Espada Longa (1d8), switches to Adaga (1d4), and attacks with the selected weapon profile in the rendered UI.
- Next: Run final gates, complete task, commit, snapshot, and run qa:next-phase-readiness.
- Risks: Browser screenshot capture timed out twice, so the rendered evidence is DOM/interaction validation rather than a saved image; quality:gate is still expected to fail only at the documented D01.1 npm audit blocker.
- Improvements: Consider adding an automated rendered Browser/Playwright contract later if screenshot capture remains unreliable in the in-app browser.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-01T18:18:07-03:00
- Done: T87 concluida: a aba Combate agora usa EquipmentLoadoutService via app boundary, mostra seletor local de Arma equipada para personagens da sessao com Espada Longa padrao, mantem Aria em perfil fixo, troca para Adaga/armas oficiais, alimenta activeWeaponProfile no ataque e possui Browser Use renderizado validado em http://127.0.0.1:5173/.
- Next: Commit T87, record snapshot, run qa:next-phase-readiness, then plan T88 weapon dice roll contract.
- Risks: quality:gate still fails only at root:audit because D01.1 documented breaking dependency blockers for vitest and drizzle-kit/esbuild; Browser screenshot capture timed out, but DOM and interaction validation completed successfully.
- Improvements: Automate the rendered combat weapon flow later when Browser screenshot/capture reliability is resolved.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260601-123434-t87-combat-equipped-weapon-ui -->
<!-- pandorha-task:20260601-121945-t86-equipment-loadout-core -->
### T86 equipment loadout core
- id: 20260601-121945-t86-equipment-loadout-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-01T12:19:45-03:00
- finished_at: 2026-06-01T12:32:05-03:00
- model_started: GPT-5 high reasoning; local automation
- model_finished: GPT-5 high reasoning; local automation
- last_modified_at: 2026-06-01T12:32:05-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 373ef58 chore(process): record d01.1 final snapshot
- summary: Create pure equipment loadout service for main-hand weapon, off-hand shield, armor, hand occupancy, durability gate, and active weapon profile without UI, save, migration, or inventory mutation.
- last_change: T86 concluida: EquipmentLoadoutService puro criado com snapshot de main hand, off hand e armor; validacao de tipo por slot, durabilidade, conflito de arma de duas maos com escudo, activeWeaponProfile herdado do catalogo de armas, testes TDD e memoria tripla atualizada. Sem UI, save v6, migration, inventario editavel, proficiencia ou dual wield.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T12:19:45-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5 high reasoning; local automation

#### Checkpoint 2026-06-01T12:27:21-03:00
- Done: Added red-first EquipmentLoadoutService tests, implemented pure loadout snapshot service, registered coverage, and updated equipment memory triple.
- Next: Run full validation gates, complete the task, commit T86, snapshot, and confirm next-phase readiness.
- Risks: quality:gate is still expected to fail at root:audit because D01.1 documented breaking dependency blockers instead of forcing major updates.
- Improvements: T87 can consume the activeWeaponProfile from the loadout snapshot in the combat UI without save v6.
- Model/config: GPT-5 high reasoning; local automation

#### Checkpoint 2026-06-01T12:32:05-03:00
- Done: T86 concluida: EquipmentLoadoutService puro criado com snapshot de main hand, off hand e armor; validacao de tipo por slot, durabilidade, conflito de arma de duas maos com escudo, activeWeaponProfile herdado do catalogo de armas, testes TDD e memoria tripla atualizada. Sem UI, save v6, migration, inventario editavel, proficiencia ou dual wield.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: GPT-5 high reasoning; local automation
<!-- /pandorha-task:20260601-121945-t86-equipment-loadout-core -->
<!-- pandorha-task:20260601-120947-d01-1-security-audit-gate-recovery -->
### D01.1 security audit gate recovery
- id: 20260601-120947-d01-1-security-audit-gate-recovery
- status: completed
- kind: maintenance
- planned: no
- started_at: 2026-06-01T12:09:47-03:00
- finished_at: 2026-06-01T12:16:16-03:00
- model_started: GPT-5 high reasoning; local automation
- model_finished: GPT-5 high reasoning; local automation
- last_modified_at: 2026-06-01T12:16:16-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: f0afba2 chore(process): record t85 final snapshot
- summary: Recover the quality gate by addressing npm audit findings without force upgrades, documenting any remaining breaking dependency risk.
- last_change: D01.1 aplicada: npm audit fix sem --force removeu o achado nao breaking de brace-expansion e atualizou a linha Vitest 3.x para 3.2.6 no lockfile; bloqueios restantes de Vitest 4.x e Drizzle Kit/esbuild foram documentados por exigirem caminho breaking.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T12:09:47-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5 high reasoning; local automation

#### Checkpoint 2026-06-01T12:11:44-03:00
- Done: Applied npm audit fix without --force; brace-expansion moved to 5.0.6 and Vitest 3.x lockfile packages moved to 3.2.6. Remaining audit blockers require breaking upgrades according to npm audit and are documented in docs/process/d01-1-security-audit-gate-recovery.md.
- Next: Run lint, test, coverage, build, quality gate, complete task and commit D01.1.
- Risks: quality:gate is expected to keep failing at root:audit until a separate approved major dependency upgrade handles Vitest 4.x and the Drizzle Kit/esbuild chain.
- Improvements: Create a dedicated D01.2 upgrade spike for Vitest major and Drizzle Kit audit path before continuing mechanics if strict quality gate pass is required.
- Model/config: GPT-5 high reasoning; local automation

#### Checkpoint 2026-06-01T12:16:16-03:00
- Done: D01.1 aplicada: npm audit fix sem --force removeu o achado nao breaking de brace-expansion e atualizou a linha Vitest 3.x para 3.2.6 no lockfile; bloqueios restantes de Vitest 4.x e Drizzle Kit/esbuild foram documentados por exigirem caminho breaking.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: GPT-5 high reasoning; local automation
<!-- /pandorha-task:20260601-120947-d01-1-security-audit-gate-recovery -->
<!-- pandorha-task:20260601-114326-t85-equipment-driven-combat-attack-profile -->
### T85 equipment-driven combat attack profile
- id: 20260601-114326-t85-equipment-driven-combat-attack-profile
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-01T11:43:26-03:00
- finished_at: 2026-06-01T11:57:48-03:00
- model_started: GPT-5 high reasoning; local automation
- model_finished: GPT-5 high reasoning; local automation
- last_modified_at: 2026-06-01T11:57:48-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: e5bbe57 chore(process): record t84 final snapshot
- summary: Start the T85 mechanics vertical with real equipment feeding combat attack profiles before full damage rules.
- last_change: T85.1 concluida: equipamento real agora produz perfil de ataque estruturado para armas do catalogo, com slots, durabilidade, matriz e dado de arma deterministico; combate aceita esse perfil opcional sem UI, save v6, migration ou dano completo.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T11:43:26-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5 high reasoning; local automation

#### Checkpoint 2026-06-01T11:50:05-03:00
- Done: TDD verde para EquipmentWeaponAttackProfileService e perfil de ataque de combate aceitando arma real opcional; sem save v6, migration, UI Svelte ou dano completo.
- Next: Rodar validadores locais, atualizar memoria tripla e fechar gates.
- Risks: A arma real ainda nao esta ligada na UI nem em loadout persistido; o dado de arma entra como total deterministico de treino ate a fase de dano completo.
- Improvements: Na proxima fatia, adicionar loadout/equip slot explicito antes de expor selecao visual ou desgaste por ataque.
- Model/config: GPT-5 high reasoning; local automation

#### Checkpoint 2026-06-01T11:57:48-03:00
- Done: T85.1 concluida: equipamento real agora produz perfil de ataque estruturado para armas do catalogo, com slots, durabilidade, matriz e dado de arma deterministico; combate aceita esse perfil opcional sem UI, save v6, migration ou dano completo.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: GPT-5 high reasoning; local automation
<!-- /pandorha-task:20260601-114326-t85-equipment-driven-combat-attack-profile -->
<!-- pandorha-task:20260601-070954-t84-social-rendered-browser-automation-evaluatio -->
### T84 Social Rendered Browser Automation Evaluation
- id: 20260601-070954-t84-social-rendered-browser-automation-evaluatio
- status: completed
- kind: docs
- planned: no
- started_at: 2026-06-01T07:09:54-03:00
- finished_at: 2026-06-01T07:14:15-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: GPT-5 high reasoning
- last_modified_at: 2026-06-01T07:14:15-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 078d96f chore(process): record t83 final snapshot
- summary: Avaliar se vale criar automacao recorrente renderizada para o fluxo social de Relacoes; manter smoke contratual se Playwright/Browser automatizado tiver custo maior que beneficio no estado atual.
- last_change: T84 avaliou automacao renderizada social e decidiu nao adicionar Playwright/dependencia agora; qa:social-browser-smoke segue contratual e passa a verificar a politica de Browser Use manual para UI social.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T07:09:54-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-06-01T07:11:33-03:00
- Done: Decisao T84 documentada: manter qa:social-browser-smoke contratual, Browser Use manual obrigatorio para UI social e sem dependencia Playwright agora; smoke social passa a verificar a politica.
- Next: Rodar lint, suite, cobertura, quality gate, smokes finais, completar tarefa e commit.
- Risks: Automacao renderizada continua manual; reabrir se Browser Use ficar estavel com screenshot/DOM por fases consecutivas ou se Playwright entrar como dependencia aprovada.
- Improvements: Usar o doc T84 como criterio antes de adicionar runner renderizado ao repositorio.
- Model/config: GPT-5 high reasoning

#### Checkpoint 2026-06-01T07:14:15-03:00
- Done: T84 avaliou automacao renderizada social e decidiu nao adicionar Playwright/dependencia agora; qa:social-browser-smoke segue contratual e passa a verificar a politica de Browser Use manual para UI social.
- Next: Repetir readiness apos commit limpo e seguir para F85/equipamento real se o roadmap social permanecer estavel.
- Risks: Fluxo renderizado segue manual quando UI social muda; reabrir decisao se Browser Use ficar estavel com screenshot/DOM ou se Playwright for aprovado como dependencia local.
- Improvements: Usar o doc T84 como gate de decisao antes de qualquer runner renderizado recorrente.
- Model/config: GPT-5 high reasoning
<!-- /pandorha-task:20260601-070954-t84-social-rendered-browser-automation-evaluatio -->
<!-- pandorha-task:20260601-065448-t83-social-retaliation-clock-advance-gate -->
### T83 Social Retaliation Clock Advance Gate
- id: 20260601-065448-t83-social-retaliation-clock-advance-gate
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-01T06:54:48-03:00
- finished_at: 2026-06-01T07:02:41-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: GPT-5 high reasoning
- last_modified_at: 2026-06-01T07:02:41-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: cd0e7e0 chore(process): record t82 final snapshot
- summary: Definir contrato inicial para quando clocks sociais podem avancar: manter gatilho explicito social-pressure como unico modo automatico atual, bloquear descanso/tempo/cena social ate regra oficial existir, sem UI, save v6 ou schema novo.
- last_change: T83 definiu gate de avanco para clocks de retaliação social: apenas social-pressure explicito pode seguir para advanceFromTrigger; descanso, tempo, cena social e acao manual generica aguardam regra oficial.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T06:54:48-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-06-01T06:58:19-03:00
- Done: Contrato TDD verde para gate de avanco de clocks sociais: social-pressure permitido, descanso/tempo/cena/acao manual bloqueados sem regra oficial.
- Next: Rodar validadores, lint, suite, cobertura, quality gate e readiness apos commit.
- Risks: Sem UI nem schema; risco principal e a futura cadencia oficial precisar de nova causa testada antes de chamar advanceFromTrigger.
- Improvements: Promover a decisao T83 para docs oficiais quando a branch entrar em main.
- Model/config: GPT-5 high reasoning

#### Checkpoint 2026-06-01T07:02:41-03:00
- Done: T83 definiu gate de avanco para clocks de retaliação social: apenas social-pressure explicito pode seguir para advanceFromTrigger; descanso, tempo, cena social e acao manual generica aguardam regra oficial.
- Next: Repetir readiness apos commit limpo e iniciar F84 apenas se a automacao Browser renderizada tiver custo-beneficio claro.
- Risks: Nao ha UI nem schema; futuras causas devem ser adicionadas por TDD e regra em docs/system antes de qualquer avanco automatico.
- Improvements: Promover docs/process/t83-social-retaliation-clock-advance-gate.md para documentacao oficial apos merge.
- Model/config: GPT-5 high reasoning
<!-- /pandorha-task:20260601-065448-t83-social-retaliation-clock-advance-gate -->
<!-- pandorha-task:20260601-063146-t82-social-relations-npc-filters -->
### T82 Social Relations Npc Filters
- id: 20260601-063146-t82-social-relations-npc-filters
- status: completed
- kind: feature
- planned: no
- started_at: 2026-06-01T06:31:46-03:00
- finished_at: 2026-06-01T06:48:47-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: GPT-5 high reasoning
- last_modified_at: 2026-06-01T06:48:47-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: c3cf75f chore(process): record final t81 snapshot
- summary: Adicionar filtro e leitura compacta para Relacoes por NPC agrupadas por faccao, mantendo save v5, schema, clocks, WorldState e regras mecanicas inalterados.
- last_change: T82 adicionou filtros compactos de leitura para Relacoes por NPC agrupadas por faccao: Todos, Atencao, Estaveis, Aliados e Inimigos. A entrega preserva save v5, schema, clocks, WorldState e regras de pressao social.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-06-01T06:31:46-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-06-01T06:40:20-03:00
- Done: Contrato TDD verde para filtros de Relacoes por NPC; UI Svelte ligada; smoke social atualizado; memoria tripla e guia de usuario atualizados.
- Next: Rodar lint, cobertura, quality gates, Browser Use renderizado e snapshot final.
- Risks: Mudanca e apenas leitura, mas precisa de validacao renderizada para garantir ergonomia do filtro no painel Resumo.
- Improvements: Manter filtros como estado local ate existir regra oficial para acoes por NPC.
- Model/config: GPT-5 high reasoning

#### Checkpoint 2026-06-01T06:48:47-03:00
- Done: T82 adicionou filtros compactos de leitura para Relacoes por NPC agrupadas por faccao: Todos, Atencao, Estaveis, Aliados e Inimigos. A entrega preserva save v5, schema, clocks, WorldState e regras de pressao social.
- Next: Repetir readiness apos commit limpo e entao iniciar F83 com contrato de avanco de clocks sociais.
- Risks: Screenshot do Browser Use falhou por timeout de captura, mas a validacao DOM confirmou filtros Atenção, Estáveis e Todos no navegador integrado.
- Improvements: Se filtros crescerem alem do catalogo de treino, adicionar busca textual antes de historico ou acoes por NPC.
- Model/config: GPT-5 high reasoning
<!-- /pandorha-task:20260601-063146-t82-social-relations-npc-filters -->
<!-- pandorha-task:20260531-204829-t81-post-t80-handoff-baseline -->
### T81 Post T80 Handoff Baseline
- id: 20260531-204829-t81-post-t80-handoff-baseline
- status: completed
- kind: docs
- planned: no
- started_at: 2026-05-31T20:48:29-03:00
- finished_at: 2026-06-01T05:10:12-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5.5 high-reasoning final review; local automation
- last_modified_at: 2026-06-01T05:10:12-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 3592c46 feat(social-relations): group npc relationships by faction
- summary: Fechar handoff local pos-T80, consolidar baseline social T66-T80, registrar promocao candidata sem alterar save v5, regras RPG ou schema.
- last_change: T81 concluida: baseline social pos-T80 documentado, QA vertical atualizado para T80, promocao candidata pos-merge registrada, build e quality gate completos validados fora do sandbox quando necessario.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-31T20:48:29-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-31T20:49:57-03:00
- Done: Handoff T81 criado com baseline social pos-T80, promocao candidata pos-merge e QA vertical atualizado para refletir T80.
- Next: Executar gates obrigatorios da Fase 81 e completar registro.
- Risks: Sem alteracao de save, schema, UI ou regra RPG; changelog oficial permanece intocado ate merge em main.
- Improvements: Fases futuras podem automatizar promocao pos-merge via pandorha_process_automation.py post-merge.
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-31T20:53:47-03:00
- Done: Implementacao documental T81 concluida, mas fechamento bloqueado por limite de uso da sessao ao tentar repetir build Vite e npm audit fora do sandbox; quality:gate completo e qa:next-phase-readiness dependem desses gates/commit limpo.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-06-01T05:10:12-03:00
- Done: T81 concluida: baseline social pos-T80 documentado, QA vertical atualizado para T80, promocao candidata pos-merge registrada, build e quality gate completos validados fora do sandbox quando necessario.
- Next: Commitar a T81 localmente e entao rodar qa:next-phase-readiness; depois iniciar F82 em microtarefa separada.
- Risks: npm audit ainda reporta vulnerabilidades moderadas em brace-expansion e esbuild via drizzle-kit, sem falha em audit-level high; build mantem aviso antigo de chunk acima de 500 kB.
- Improvements: Automatizar promocao pos-merge com pandorha_process_automation.py post-merge quando a branch chegar a main.
- Model/config: gpt-5.5 high-reasoning final review; local automation
<!-- /pandorha-task:20260531-204829-t81-post-t80-handoff-baseline -->
<!-- pandorha-task:20260531-200121-t80-group-npc-relationships-by-faction -->
### T80 Group NPC Relationships By Faction
- id: 20260531-200121-t80-group-npc-relationships-by-faction
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-31T20:01:21-03:00
- finished_at: 2026-05-31T20:16:58-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-31T20:16:58-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: fe6bed6 docs(process): add t79 relationship history gate
- summary: Agrupar visualmente Relacoes por NPC por faccao na aba Relacoes, mantendo save v5, schema, RPC e regras mecanicas inalterados.
- last_change: Agrupado Relacoes por NPC por faccao na aba Relacoes, com view-model npcGroups, UI agrupada, smoke social atualizado, memoria tripla e validacao Browser do grupo Liga Mercante de Treino.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-31T20:01:21-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-31T20:16:58-03:00
- Done: Agrupado Relacoes por NPC por faccao na aba Relacoes, com view-model npcGroups, UI agrupada, smoke social atualizado, memoria tripla e validacao Browser do grupo Liga Mercante de Treino.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260531-200121-t80-group-npc-relationships-by-faction -->
<!-- pandorha-task:20260531-195801-t79-npc-relationship-history-save-v6-gate -->
### T79 NPC Relationship History Save V6 Gate
- id: 20260531-195801-t79-npc-relationship-history-save-v6-gate
- status: completed
- kind: architecture
- planned: no
- started_at: 2026-05-31T19:58:01-03:00
- finished_at: 2026-05-31T19:58:27-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-31T19:58:27-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: c66e012 chore(process): record t77 handoff validation
- summary: Produzir gate A/B/C para decidir se historico append-only de relacao por NPC justifica save v6, sem migration, schema, RPC ou implementacao.
- last_change: Gate T79 concluido: historico append-only de relacao por NPC foi adiado; save v5 permanece como contrato atual e save v6 fica condicionado a multiplas causas oficiais ou necessidade real de auditoria.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-31T19:58:01-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-31T19:58:27-03:00
- Done: Gate T79 concluido: historico append-only de relacao por NPC foi adiado; save v5 permanece como contrato atual e save v6 fica condicionado a multiplas causas oficiais ou necessidade real de auditoria.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260531-195801-t79-npc-relationship-history-save-v6-gate -->
<!-- pandorha-task:20260531-194729-t77-handoff-local-pos-t76 -->
### T77 Handoff Local Pos-T76
- id: 20260531-194729-t77-handoff-local-pos-t76
- status: completed
- kind: qa
- planned: no
- started_at: 2026-05-31T19:47:29-03:00
- finished_at: 2026-05-31T19:51:53-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-31T19:51:53-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: aa5fb49 feat(npc-relationship): persist and surface social pressure
- summary: Fechar handoff local da T73-T76, preparar resumo de PR sem publicacao automatica e revalidar gates obrigatorios mantendo output fora do Git.
- last_change: Handoff local pos-T76 concluido: readiness inicial valido, PR draft preparado em output, gates obrigatorios reexecutados, smokes sociais validados e nenhuma publicacao feita.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-31T19:47:29-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-31T19:51:53-03:00
- Done: Handoff local pos-T76 concluido: readiness inicial valido, PR draft preparado em output, gates obrigatorios reexecutados, smokes sociais validados e nenhuma publicacao feita.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260531-194729-t77-handoff-local-pos-t76 -->
<!-- pandorha-task:20260530-002246-t73-t76-npc-relationship-save-ui -->
### T73-T76 NPC Relationship Save UI
- id: 20260530-002246-t73-t76-npc-relationship-save-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-30T00:22:46-03:00
- finished_at: 2026-05-30T01:02:04-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-30T01:02:04-03:00
- branch: task/t73-t76-npc-relationship-save-ui
- commit_at_start: 7809a17 feat(npc-relationship): add individual NPC relationship core
- summary: Implementar save v5 minimo para relacao individual por NPC, wiring explicito de Pressionar com relacao NPC e clock social-pressure, UI em Relacoes e QA recorrente sem reaproveitar WorldState.
- last_change: Implementado save v5 minimo para npcRelationships, migracao SQLite npc_relationships, repositorio Drizzle, wiring explicito de Pressionar para relacao NPC e clock social-pressure, UI de Relacoes por NPC, smokes sociais e validacao Browser save/load.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-30T00:22:46-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-30T01:02:04-03:00
- Done: Implementado save v5 minimo para npcRelationships, migracao SQLite npc_relationships, repositorio Drizzle, wiring explicito de Pressionar para relacao NPC e clock social-pressure, UI de Relacoes por NPC, smokes sociais e validacao Browser save/load.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260530-002246-t73-t76-npc-relationship-save-ui -->
<!-- pandorha-task:20260527-125851-t72-npc-relationship-core -->
### T72 NPC Relationship Core
- id: 20260527-125851-t72-npc-relationship-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-27T12:58:51-03:00
- finished_at: 2026-05-27T13:16:17-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-27T13:16:17-03:00
- branch: task/t72-npc-relationship-core
- commit_at_start: 4f57630 chore(process): record t71 post-commit snapshot
- summary: Criar nucleo modular de relacao individual por NPC com schema validado, repository contract, fake em memoria e service puro sem UI, save v5, migration ou WorldState.
- last_change: T72 entregou o nucleo modular de relacao individual por NPC com schema Drizzle-Zod nao migrado, contrato de repositorio, fake em memoria, servico Result Pattern idempotente e cobertura 100%, sem save v5, UI, RPC publica ou WorldState.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-27T12:58:51-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-27T13:16:17-03:00
- Done: T72 entregou o nucleo modular de relacao individual por NPC com schema Drizzle-Zod nao migrado, contrato de repositorio, fake em memoria, servico Result Pattern idempotente e cobertura 100%, sem save v5, UI, RPC publica ou WorldState.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260527-125851-t72-npc-relationship-core -->
<!-- pandorha-task:20260526-205714-t71-social-retaliation-clock-advance -->
### T71 Social Retaliation Clock Advance
- id: 20260526-205714-t71-social-retaliation-clock-advance
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-26T20:57:14-03:00
- finished_at: 2026-05-26T21:09:32-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-26T21:09:32-03:00
- branch: task/t71-social-retaliation-clock-advance
- commit_at_start: bcb06e4 chore(process): record T66-T70 post-commit snapshot
- summary: Automatizar smoke social pos-T70 e criar servico puro para avancar clocks de retaliacao por gatilho explicito sem migration, save v5 ou RPC novo.
- last_change: T71 concluida: smoke social pos-T70 reforcado, SocialRetaliationClockService criado com gatilhos explicitos idempotentes para clocks source social-pressure, memoria tripla adicionada e contrato T72 documentado sem migration, save v5, RPC novo ou UI.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-26T20:57:14-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T21:03:38-03:00
- Done: Servico T71, smoke social reforcado, memoria tripla e contrato T72 adicionados; lint e core-conventions passaram.
- Next: Executar testes, cobertura, build, quality gate, smokes sociais e readiness final.
- Risks: Vitest e Vite exigem execucao fora do sandbox por Access is denied no esbuild; T71 ainda nao esta ligada a UI ou save persistido.
- Improvements: Futuro wiring de UI deve definir persistencia de trigger ids antes de avancar clocks automaticamente.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T21:09:32-03:00
- Done: T71 concluida: smoke social pos-T70 reforcado, SocialRetaliationClockService criado com gatilhos explicitos idempotentes para clocks source social-pressure, memoria tripla adicionada e contrato T72 documentado sem migration, save v5, RPC novo ou UI.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260526-205714-t71-social-retaliation-clock-advance -->
<!-- pandorha-task:20260526-183035-t66-t70-social-roadmap-implementation -->
### T66-T70 Social Roadmap Implementation
- id: 20260526-183035-t66-t70-social-roadmap-implementation
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-26T18:30:35-03:00
- finished_at: 2026-05-26T20:32:55-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-26T20:32:55-03:00
- branch: task/t66-t70-social-roadmap
- commit_at_start: 4e60a42 chore(process): record t65 post-commit snapshot
- summary: Implementar readiness local, requisitos de dialogo por WorldState/Fama, Infamia por pressao e clocks de retaliacao sem migration, RPC novo ou save v5.
- last_change: T66-T70 implementadas e validadas: readiness gate, requisitos de dialogo por WorldState/Fama, Infamia por pressao, clocks de retaliacao, encounterId unico, docs, memoria tripla, smokes e Browser save/load.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-26T18:30:35-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T19:01:34-03:00
- Done: Implementados T66-T70 no working tree: qa:next-phase-readiness, requisitos de dialogo por WorldState/Fama, Infamia por pressao, clocks de retaliacao, docs, memoria tripla e smokes estaticos.
- Next: Fechar validacao pesada fora do bloqueio de sandbox, executar Browser do Codex se ambiente permitir, revisar diff e commitar quando solicitado.
- Risks: npm.cmd test, test:coverage, build, arch guard MCP e Browser real ficaram bloqueados por acesso do sandbox/limite de aprovacao; output permanece nao rastreado.
- Improvements: Executar gates pesados e qa:next-phase-readiness apos commit limpo; considerar separar T66-T70 em commits atomicos se a revisao pedir.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T20:32:55-03:00
- Done: T66-T70 implementadas e validadas: readiness gate, requisitos de dialogo por WorldState/Fama, Infamia por pressao, clocks de retaliacao, encounterId unico, docs, memoria tripla, smokes e Browser save/load.
- Next: Revisar diff e commitar quando solicitado; apos commit limpo rodar npm.cmd run qa:next-phase-readiness.
- Risks: output permanece evidencia local fora do Git; build mantem aviso antigo de chunk acima de 500 kB.
- Improvements: Considerar teste browser automatizado real para o fluxo Pressionar -> Infamia -> Retaliacao -> save/load.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260526-183035-t66-t70-social-roadmap-implementation -->
<!-- pandorha-task:T65 -->
### Social Dialogue Seed Pipeline V1
- id: T65
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-26T15:24:02-03:00
- finished_at: 2026-05-26T15:33:13-03:00
- model_started: gpt-5.5 high reasoning
- model_finished: gpt-5.5 high reasoning
- last_modified_at: 2026-05-26T15:33:13-03:00
- branch: task/social-dialogue-seed-pipeline
- commit_at_start: 74dc9ba chore(process): record t64 post-commit snapshot
- summary: Criar smoke estatico recorrente para validar o contrato de arvores sociais curtas dos NPCs de treino existentes, sem novo NPC, schema, migration, save v5, RPC ou consequencia social nova.
- last_change: Social Dialogue Seed Pipeline V1 concluida: qa:dialogue-seeds valida arvores curtas dos NPCs de treino com 4 nodes, 3 options, escolhas em ordem, ponteiros, sourceFile e blockedReason para HP mental.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-26T15:24:02-03:00
- Done: task record created
- Next: Escrever testes TDD do dialogue_seed_smoke com fixtures positivas e negativas.
- Risks: Manter a validacao como contrato estatico; nao transformar isto em pipeline AST/i18n completa nesta tarefa.
- Improvements: Integrar qa:dialogue-seeds ao quality gate e documentar como pre-requisito para seeds futuros.
- Model/config: gpt-5.5 high reasoning

#### Checkpoint 2026-05-26T15:33:06-03:00
- Done: Smoke qa:dialogue-seeds implementado com parser AST TypeScript, fixtures negativas, comando npm, integracao no quality gate, docs e memorias atualizadas; gates finais passaram.
- Next: Commitar T65 localmente sem incluir output/; nao fazer push/PR sem pedido explicito.
- Risks: Smoke e estatico e nao substitui Browser Use quando houver mudanca visual; nao cobre pipeline AST/i18n completa.
- Improvements: Adicionar validacao de flags/fama somente quando o runtime suportar esses requisitos no catalogo.
- Model/config: gpt-5.5 high reasoning

#### Checkpoint 2026-05-26T15:33:13-03:00
- Done: Social Dialogue Seed Pipeline V1 concluida: qa:dialogue-seeds valida arvores curtas dos NPCs de treino com 4 nodes, 3 options, escolhas em ordem, ponteiros, sourceFile e blockedReason para HP mental.
- Next: Preparar PR somente sob pedido explicito; depois do merge, promover notas de processo para changelog/docs oficiais.
- Risks: output/ permanece local e nao rastreado; Browser nao foi necessario porque nao houve mudanca visual.
- Improvements: Considerar pipeline AST/i18n apenas quando houver autoria dinamica de dialogos.
- Model/config: gpt-5.5 high reasoning
<!-- /pandorha-task:T65 -->
<!-- pandorha-task:T64 -->
### Social Dialogue Official Seed V1
- id: T64
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-26T09:15:19-03:00
- finished_at: 2026-05-26T09:31:33-03:00
- model_started: gpt-5.5 high reasoning
- model_finished: gpt-5.5 high reasoning
- last_modified_at: 2026-05-26T09:31:33-03:00
- branch: task/social-dialogue-official-seed
- commit_at_start: 8e40350 chore(process): record final t63 snapshot
- summary: Adicionar arvore curta para o Capitao de Treino usando regras oficiais de NPCs/aliados e negociacao, sem schema novo, migration, save v5 ou consequencia social real nova.
- last_change: Social Dialogue Official Seed V1 concluida: training-captain agora possui arvore curta oficial-adjacente com abertura, respostas para Persuadir/Barganhar/Pressionar, bloqueio de Pressionar por HP mental 8, docs, memoria tripla, smoke contratual e validacao no Browser do Codex.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-26T09:15:19-03:00
- Done: task record created
- Next: Escrever testes TDD para catalogo e view da arvore do Capitao de Treino.
- Risks: Nao cruzar para faccoes, Infamia, relacao individual, clocks ou save v5 nesta tarefa.
- Improvements: Promover Browser/Playwright real somente se a politica de dependencia e artifacts for definida.
- Model/config: gpt-5.5 high reasoning

#### Checkpoint 2026-05-26T09:31:25-03:00
- Done: Catalogo read-only do Capitao de Treino adicionado com 4 nodes, 3 options e Pressionar bloqueavel por HP mental 8; docs, memoria tripla, smoke contratual e Browser do Codex validados.
- Next: Commitar a T64 localmente sem incluir output/; nao iniciar T65 antes da entrega.
- Risks: Browser validado no in-app sem exportar screenshot; nao houve schema, migration, save v5, RPC ou consequencia social real nova.
- Improvements: Promover Browser/Playwright real apenas quando a politica de dependencia e artifacts for definida.
- Model/config: gpt-5.5 high reasoning

#### Checkpoint 2026-05-26T09:31:33-03:00
- Done: Social Dialogue Official Seed V1 concluida: training-captain agora possui arvore curta oficial-adjacente com abertura, respostas para Persuadir/Barganhar/Pressionar, bloqueio de Pressionar por HP mental 8, docs, memoria tripla, smoke contratual e validacao no Browser do Codex.
- Next: Preparar entrega local da T64; depois planejar T65 sem misturar Infamia, relacao individual, clocks ou save v5.
- Risks: Sem push/PR; output/ permanece nao rastreado; Browser in-app foi usado sem screenshot/export.
- Improvements: Considerar smoke de navegador real quando dependencias e artifacts estiverem definidos.
- Model/config: gpt-5.5 high reasoning
<!-- /pandorha-task:T64 -->
<!-- pandorha-task:T63 -->
### Social Pressure Consequences V1
- id: T63
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-26T04:45:24-03:00
- finished_at: 2026-05-26T08:42:57-03:00
- model_started: gpt-5.5 high reasoning
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-26T08:42:57-03:00
- branch: task-dialogue-option-availability
- commit_at_start: b454de2 chore(process): record t62 post-commit snapshot
- summary: Aplicar perda idempotente de Fama quando a negociacao terminal usar Pressionar, sem migration nem save v5.
- last_change: Social Pressure Consequences V1 implementada: Pressionar em negociacao terminal emite intencao desacoplada, App aplica perda idempotente de 1 Fama na faccao do NPC, WorldState preserva flag, UI pt-BR mostra consequencia e save/load restaura o estado.
#### Files At Start
- output/
#### Checkpoints
#### Checkpoint 2026-05-26T04:45:24-03:00
- Done: task record created
- Next: Escrever testes TDD para intencao de penalidade, idempotencia, UI e smokes.
- Risks: Acoplamento ilegal entre social-encounter e social-standing; reaplicacao apos save/load se a flag WorldState nao for suficiente.
- Improvements: Automatizar smoke real de navegador se o fluxo social completo continuar repetitivo.
- Model/config: gpt-5.5 high reasoning

#### Checkpoint 2026-05-26T05:01:47-03:00
- Done: Implementados intent de penalidade por Pressionar, orquestracao app-level de loseFame, WorldState idempotente, testes focados e smokes contratuais atualizados.
- Next: Executar gates finais completos, Browser Use e fechamento da tarefa.
- Risks: Browser Use ainda precisa validar o fluxo renderizado; smokes continuam contratuais/headless.
- Improvements: Promover para Playwright real se a validacao social continuar repetitiva.
- Model/config: gpt-5.5 high reasoning

#### Checkpoint 2026-05-26T05:07:37-03:00
- Done: Lint/TypeScript passou, validações core-conventions e pandorha-arch-guard passaram, testes focados T63 passaram, qa:vertical-slice, qa:social-browser-smoke, quality:automation e validate passaram.
- Next: Reexecutar npm.cmd test, test:coverage, build, quality:gate e Browser Use quando a aprovacao fora do sandbox estiver disponivel.
- Risks: Sandbox bloqueia Vitest/build com Access is denied e a aprovacao escalada foi rejeitada por limite de uso ate 08:26; Browser Use nao esta exposto nesta sessao.
- Improvements: Adicionar runner de navegador real aprovado ou Playwright quando a politica de dependencia/artifacts estiver definida.
- Model/config: gpt-5.5 high reasoning

#### Checkpoint 2026-05-26T08:42:49-03:00
- Done: Browser do Codex validou Pressionar -> WorldState -> Fama 0 -> save/load; gates locais e smokes ja passaram.
- Next: Fechar diff/status local sem commitar output/.
- Risks: output/ permanece nao rastreado; Browser in-app nao suportou screenshot/export, entao a evidencia visual ficou em DOM snapshot validado.
- Improvements: Manter qa:social-browser-smoke como contrato e avaliar Playwright real caso screenshots voltem a ser obrigatorios.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T08:42:57-03:00
- Done: Social Pressure Consequences V1 implementada: Pressionar em negociacao terminal emite intencao desacoplada, App aplica perda idempotente de 1 Fama na faccao do NPC, WorldState preserva flag, UI pt-BR mostra consequencia e save/load restaura o estado.
- Next: Preparar entrega/PR apenas se solicitado explicitamente.
- Risks: output/ continua local e nao rastreado; nao houve migration, save v5, RPC ou push/PR.
- Improvements: Proxima fase pode promover Playwright real para smoke visual completo e revisar roadmaps pos-T63.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:T63 -->
<!-- pandorha-task:20260526-040147-t62-social-browser-smoke-automation -->
### T62 Social Browser Smoke Automation
- id: 20260526-040147-t62-social-browser-smoke-automation
- status: completed
- kind: qa
- planned: yes
- started_at: 2026-05-26T04:01:47-03:00
- finished_at: 2026-05-26T04:08:45-03:00
- model_started: gpt-5.5 high-reasoning
- model_finished: gpt-5.5 high-reasoning
- last_modified_at: 2026-05-26T04:08:45-03:00
- branch: task-dialogue-option-availability
- commit_at_start: e83ed47 feat(social): record dialogue consequence metadata
- summary: Automatizar a validacao recorrente do fluxo social Barganhar -> consequencia -> save/load sem alterar schema, save version ou regras sociais.
- last_change: T62 adicionou smoke social headless para o roteiro Barganhar -> WorldState -> save/load, com teste Node, comando npm, integracao ao quality gate, docs de QA e memoria tripla atualizada sem nova dependencia de browser.
#### Files At Start
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-05-26T04:01:47-03:00
- Done: task record created
- Next: Criar smoke automatizado reutilizando scripts Node e validar contratos do fluxo social completo.
- Risks: Sem dependencia Playwright no projeto; evitar adicionar pacote novo sem necessidade explicita.
- Improvements: Se browser real for adotado no futuro, promover esta base para um runner Playwright dedicado.
- Model/config: gpt-5.5 high-reasoning

#### Checkpoint 2026-05-26T04:08:45-03:00
- Done: T62 adicionou smoke social headless para o roteiro Barganhar -> WorldState -> save/load, com teste Node, comando npm, integracao ao quality gate, docs de QA e memoria tripla atualizada sem nova dependencia de browser.
- Next: T63 pode tratar consequencias sociais reais para Pressionar em tarefa separada.
- Risks: O smoke T62 e contratual/headless; mudancas visuais ainda precisam de Browser Use ou Playwright CLI.
- Improvements: Promover para runner de navegador real quando o projeto aceitar dependencia Playwright ou CLI local estavel.
- Model/config: gpt-5.5 high-reasoning
<!-- /pandorha-task:20260526-040147-t62-social-browser-smoke-automation -->
<!-- pandorha-task:20260525-203610-t61-social-consequences-v1 -->
### T61 Social Consequences V1
- id: 20260525-203610-t61-social-consequences-v1
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-25T20:36:10-03:00
- finished_at: 2026-05-26T03:28:15-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-26T03:28:15-03:00
- branch: task-dialogue-option-availability
- commit_at_start: 5593b32 feat(dialogue): cobre informante e opcoes bloqueadas
- summary: Tornar consequencias sociais mais explicitas usando a ultima escolha de dialogo sem migration ou save v5.
- last_change: T61 concluiu consequencias sociais explicitas com metadados de ultima opcao de dialogo, resumos por Persuadir/Barganhar/Pressionar, UI, smoke contratual, guia/QA e memoria tripla, sem migration ou save v5.
#### Files At Start
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-05-25T20:36:10-03:00
- Done: task record created
- Next: Escrever testes TDD para metadados de escolha social nas consequencias.
- Risks: Escopo deve preservar save v4 e nao alterar FactionStanding.
- Improvements: Automatizar smoke de navegador social completo em T62 se o fluxo continuar repetitivo.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-25T20:47:16-03:00
- Done: T61 implementou consequencias sociais explicitas com metadados de ultima opcao de dialogo, testes TDD, UI, smoke contratual, guia/QA e memoria tripla.
- Next: Reexecutar npm.cmd run test:coverage e npm.cmd run quality:gate quando a execucao escalada estiver disponivel novamente; depois completar a T61.
- Risks: test:coverage ficou pendente porque a aprovacao escalada foi bloqueada pelo limite de uso do ambiente; output/ permanece nao rastreado e nao deve entrar no commit.
- Improvements: T62 deve automatizar o fluxo de navegador Barganhar -> consequencia -> save/load se a validacao visual continuar recorrente.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T03:28:15-03:00
- Done: T61 concluiu consequencias sociais explicitas com metadados de ultima opcao de dialogo, resumos por Persuadir/Barganhar/Pressionar, UI, smoke contratual, guia/QA e memoria tripla, sem migration ou save v5.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260525-203610-t61-social-consequences-v1 -->
<!-- pandorha-task:20260525-200647-t60-social-dialogue-qa-refresh -->
### T60 Social Dialogue QA Refresh
- id: 20260525-200647-t60-social-dialogue-qa-refresh
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-25T20:06:47-03:00
- finished_at: 2026-05-25T20:14:16-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-25T20:14:16-03:00
- branch: task-dialogue-option-availability
- commit_at_start: 4a80ecd docs(dialogue): atualiza qa da arvore social
- summary: Atualizar guia, QA vertical e smoke para cobrir Informante de Treino, opção Pressionar bloqueada por HP mental, apelo e save/load.
- last_change: T60 atualizou guia de usuário, QA vertical, smoke contratual, teste do smoke e memória social para cobrir Informante de Treino, Pressionar bloqueado por HP mental 7, Barganhar liberado, apelo e save/load.
#### Files At Start
- docs/process/task-ledger.md
- src/entities/dialogue-tree/.context/plain-english.md
- src/entities/dialogue-tree/.context/scaling-roadmap.md
- src/entities/dialogue-tree/.context/tech-memory.md
- src/entities/dialogue-tree/__tests__/DialogueTreeCatalogService.spec.ts
- src/entities/dialogue-tree/model/dialogueTreeCatalog.ts
- src/entities/dialogue-tree/model/dialogueTreeSchema.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/DialogueTraversalService.spec.ts
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/domain/DialogueTraversalService.ts
- src/features/social-encounter/model/dialogueTraversalSchemas.ts
- src/features/social-encounter/model/dialogueTraversalTypes.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- output/
#### Checkpoints
#### Checkpoint 2026-05-25T20:06:47-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-25T20:09:04-03:00
- Done: Atualizados guia de usuário, QA vertical, smoke contratual e memória tripla social para cobrir Informante de Treino, Pressionar bloqueado por HP mental 7, Barganhar liberado, apelo e save/load.
- Next: Rodar gates completos do projeto e concluir T60.
- Risks: output/ permanece não rastreado como evidência local e não deve entrar no commit sem decisão explícita.
- Improvements: Automação de navegador futura deve validar dinamicamente o mesmo fluxo quando o runner estiver estável.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-25T20:14:16-03:00
- Done: T60 atualizou guia de usuário, QA vertical, smoke contratual, teste do smoke e memória social para cobrir Informante de Treino, Pressionar bloqueado por HP mental 7, Barganhar liberado, apelo e save/load.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260525-200647-t60-social-dialogue-qa-refresh -->
<!-- pandorha-task:20260524-045613-t59-training-informant-dialogue-tree -->
### T59 Training Informant Dialogue Tree
- id: 20260524-045613-t59-training-informant-dialogue-tree
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-24T04:56:13-03:00
- finished_at: 2026-05-25T19:50:56-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-25T19:50:56-03:00
- branch: task-dialogue-option-availability
- commit_at_start: 4a80ecd docs(dialogue): atualiza qa da arvore social
- summary: Adicionar segunda arvore curta de dialogo para o Informante de Treino reutilizando opcoes bloqueaveis por HP mental.
- last_change: T59 adicionou o NPC Informante de Treino com arvore curta read-only e opcao Pressionar bloqueada por HP mental minimo 7, coberta por testes de catalogo, travessia e view, sem migration e sem save version novo.
#### Files At Start
- docs/process/task-ledger.md
- src/entities/dialogue-tree/.context/plain-english.md
- src/entities/dialogue-tree/.context/scaling-roadmap.md
- src/entities/dialogue-tree/.context/tech-memory.md
- src/entities/dialogue-tree/__tests__/DialogueTreeCatalogService.spec.ts
- src/entities/dialogue-tree/model/dialogueTreeCatalog.ts
- src/entities/dialogue-tree/model/dialogueTreeSchema.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/DialogueTraversalService.spec.ts
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/domain/DialogueTraversalService.ts
- src/features/social-encounter/model/dialogueTraversalSchemas.ts
- src/features/social-encounter/model/dialogueTraversalTypes.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
#### Checkpoints
#### Checkpoint 2026-05-24T04:56:13-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-25T19:50:51-03:00
- Done: T59 implementou a arvore curta training-informant, testes de catalogo/servico/view, memorias .context e validacao UI em Relacoes com Pressionar bloqueado por HP mental 7.
- Next: Concluir ledger, snapshot e revisao final da branch task-dialogue-option-availability.
- Risks: Sem migration e sem save v5 por escopo; validacao de navegador usou Chrome headless via CDP porque o plugin browser nao foi exposto como ferramenta callable nesta sessao.
- Improvements: T60 deve cobrir guia de usuario, QA vertical e smoke para opcao bloqueada/liberada, apelo e save/load.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-25T19:50:56-03:00
- Done: T59 adicionou o NPC Informante de Treino com arvore curta read-only e opcao Pressionar bloqueada por HP mental minimo 7, coberta por testes de catalogo, travessia e view, sem migration e sem save version novo.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260524-045613-t59-training-informant-dialogue-tree -->
<!-- pandorha-task:20260524-043142-t58-dialogue-option-availability -->
### T58 Dialogue Option Availability
- id: 20260524-043142-t58-dialogue-option-availability
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-24T04:31:42-03:00
- finished_at: 2026-05-24T04:51:13-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-24T04:51:13-03:00
- branch: task-dialogue-option-availability
- commit_at_start: 4a80ecd docs(dialogue): atualiza qa da arvore social
- summary: Adicionar disponibilidade de opcoes de dialogo por HP mental sem migration ou save v5.
- last_change: T58 concluiu opcoes de dialogo bloqueaveis por HP mental sem migration ou save v5, com testes, memoria tripla, arch guard, quality gate e validacao Playwright.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-24T04:31:42-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-24T04:51:06-03:00
- Done: T58 implementou disponibilidade de opcoes de dialogo por HP mental, com Result DIALOGUE_OPTION_BLOCKED, UI desabilitada e memoria tripla atualizada.
- Next: T59 pode adicionar segundo NPC de treino reutilizando minimumMentalHp e blockedReason.
- Risks: A branch com barra falhou por permissao de lock em .git; foi usado fallback task-dialogue-option-availability. Opcao bloqueada foi coberta por testes; no browser a vertical atual inicia com HP mental suficiente.
- Improvements: T60 deve atualizar guia e smoke para cobrir visualmente uma opcao bloqueada quando houver cenario navegavel com HP mental abaixo do requisito.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-24T04:51:13-03:00
- Done: T58 concluiu opcoes de dialogo bloqueaveis por HP mental sem migration ou save v5, com testes, memoria tripla, arch guard, quality gate e validacao Playwright.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260524-043142-t58-dialogue-option-availability -->
<!-- pandorha-task:20260524-000001-t57-dialogue-tree-qa-docs -->
### T57 - Guia E QA De Dialogo
- id: 20260524-000001-t57-dialogue-tree-qa-docs
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-24T04:07:56-03:00
- finished_at: 2026-05-24T04:13:54-03:00
- model_started: GPT-5.5 medium-high
- model_finished: GPT-5.5 medium-high
- last_modified_at: 2026-05-24T04:13:54-03:00
- branch: task/dialogue-tree-qa-docs
- commit_at_start: e7223d8 feat(dialogue): mostra arvore na ui social
- summary: Atualizar guia de usuario, QA vertical e smoke script para refletir a arvore de dialogo social V1.
- last_change: T57 atualizou guia de usuario, QA vertical e smoke script para cobrir a arvore curta de dialogo social.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-24T04:07:56-03:00
- Done: task record created
- Next: Editar docs/user/social-encounter.md, docs/process/vertical-slice-qa.md e scripts/vertical_slice_smoke.mjs.
- Risks: T57 nao deve alterar UI ou gameplay; mudancas ficam restritas a documentacao e automacao de QA.
- Improvements: Smoke vertical deve exigir fala do NPC, opcoes de dialogo e evento persistido.
- Model/config: GPT-5.5 medium-high

#### Checkpoint 2026-05-24T04:13:54-03:00
- Done: T57 atualizou guia de usuario, QA vertical e smoke script para cobrir a arvore curta de dialogo social.
- Next: Planejar a proxima fase apos T54-T57, mantendo a vertical social como base validada.
- Risks: A arvore segue curta e cobre apenas a Corretora de Treino; dialogo literario completo permanece fora do escopo.
- Improvements: Futuras fases podem expandir multiplos NPCs, consequencias mais profundas e escolhas com efeitos sociais persistentes.
- Model/config: GPT-5.5 medium-high
<!-- /pandorha-task:20260524-000001-t57-dialogue-tree-qa-docs -->
<!-- pandorha-task:20260521-000008-t56-dialogue-tree-ui -->
### T56 Dialogue Tree UI
- id: 20260521-000008-t56-dialogue-tree-ui
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-21T15:53:46-03:00
- finished_at: 2026-05-24T04:06:40-03:00
- model_started: GPT-5.5 medium-high
- model_finished: GPT-5.5 medium-high
- last_modified_at: 2026-05-24T04:06:40-03:00
- branch: task/dialogue-tree-ui
- commit_at_start: f795942 feat(dialogue): adiciona navegacao da arvore social
- summary: Expor a arvore de dialogo de training-broker na aba Relacoes e validar no navegador.
- last_change: T56 expos a arvore de dialogo da Corretora de Treino na aba Relacoes, com escolha persistida no ledger social.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-21T15:53:46-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5 medium-high

#### Checkpoint 2026-05-24T04:06:40-03:00
- Done: T56 expos a arvore de dialogo da Corretora de Treino na aba Relacoes, com escolha persistida no ledger social.
- Next: Iniciar T57 para atualizar guia de usuario, QA vertical e smoke script com a arvore de dialogo.
- Risks: Browser Use pode continuar sem digitacao estavel; validacao deve usar save existente quando possivel.
- Improvements: T57 deve documentar o fluxo de fala do NPC, escolha Barganhar, apelo e save/load.
- Model/config: GPT-5.5 medium-high
<!-- /pandorha-task:20260521-000008-t56-dialogue-tree-ui -->
<!-- pandorha-task:20260521-000007-t55-dialogue-traversal-core -->
### T55 Dialogue Traversal Core
- id: 20260521-000007-t55-dialogue-traversal-core
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-21T12:10:48-03:00
- finished_at: 2026-05-21T15:53:09-03:00
- model_started: GPT-5.5 high
- model_finished: GPT-5.5 high
- last_modified_at: 2026-05-21T15:53:09-03:00
- branch: task/dialogue-traversal-core
- commit_at_start: 915bdfa feat(dialogue): adiciona catalogo de arvore social
- summary: Criar service puro para selecionar opcoes de dialogo e registrar evento no ledger social.
- last_change: T55 criou DialogueTraversalService, evento dialogue-option-selected e replay de no atual usando o ledger social existente.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-21T12:10:48-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5 high

#### Checkpoint 2026-05-21T15:53:09-03:00
- Done: T55 criou DialogueTraversalService, evento dialogue-option-selected e replay de no atual usando o ledger social existente.
- Next: Iniciar T56 para expor a arvore de dialogo na aba Relacoes e validar no Browser Use.
- Risks: Sem UI nesta etapa; save v4 depende do evento novo continuar dentro do schema de social_encounter_events.
- Improvements: T56 deve validar no navegador que Barganhar seleciona o argumento e restaura o log apos save/load.
- Model/config: GPT-5.5 high
<!-- /pandorha-task:20260521-000007-t55-dialogue-traversal-core -->
<!-- pandorha-task:20260521-000006-t54-dialogue-tree-schema -->
### T54 Dialogue Tree Schema
- id: 20260521-000006-t54-dialogue-tree-schema
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-21T12:03:43-03:00
- finished_at: 2026-05-21T12:10:08-03:00
- model_started: GPT-5.5 high
- model_finished: GPT-5.5 high
- last_modified_at: 2026-05-21T12:10:08-03:00
- branch: task/dialogue-tree-schema
- commit_at_start: 424d0ea docs(social): atualiza qa de escolhas sociais
- summary: Criar catalogo read-only de arvore de dialogo para a Corretora de Treino.
- last_change: T54 criou catalogo read-only de arvore de dialogo para training-broker com nodes, options, service, fake repository e testes.
#### Files At Start
- src/entities/dialogue-tree/
#### Checkpoints
#### Checkpoint 2026-05-21T12:03:43-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5 high

#### Checkpoint 2026-05-21T12:10:08-03:00
- Done: T54 criou catalogo read-only de arvore de dialogo para training-broker com nodes, options, service, fake repository e testes.
- Next: Iniciar T55 para selecionar opcoes da arvore e registrar evento dialogue-option-selected no ledger social.
- Risks: Catalogo ainda e de treino e nao possui persistence/migration propria; save continua pelo ledger social v4.
- Improvements: Expandir a arvore para outros NPCs depois da primeira validacao de UI.
- Model/config: GPT-5.5 high
<!-- /pandorha-task:20260521-000006-t54-dialogue-tree-schema -->
<!-- pandorha-task:20260521-000005-t53-social-dialogue-qa-docs -->
### T53 Social Dialogue QA Docs
- id: 20260521-000005-t53-social-dialogue-qa-docs
- status: completed
- kind: docs
- planned: yes
- started_at: 2026-05-21T09:32:55-03:00
- finished_at: 2026-05-21T09:40:51-03:00
- model_started: GPT-5.5 medium-high
- model_finished: GPT-5.5 medium-high
- last_modified_at: 2026-05-21T09:40:51-03:00
- branch: task/social-dialogue-qa-docs
- commit_at_start: 6e63531 feat(social): registra argumento nos logs
- summary: Atualizar guia de usuario, QA vertical e smoke script para cobrir escolhas de argumento social.
- last_change: T53 atualizou o guia de usuario, o roteiro de QA vertical e o smoke script para cobrir escolhas de argumento social, log persistido e consequencias em WorldState.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-21T09:32:55-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5 medium-high

#### Checkpoint 2026-05-21T09:40:51-03:00
- Done: T53 atualizou o guia de usuario, o roteiro de QA vertical e o smoke script para cobrir escolhas de argumento social, log persistido e consequencias em WorldState.
- Next: Planejar a proxima fase apos escolhas sociais, mantendo uma subtarefa por branch e Browser Use quando houver UI.
- Risks: Browser Use segue com digitacao instavel por clipboard virtual; validacoes recentes de UI usaram save existente quando necessario.
- Improvements: Automatizar smoke browser real quando a digitacao do Browser Use estiver estavel.
- Model/config: GPT-5.5 medium-high
<!-- /pandorha-task:20260521-000005-t53-social-dialogue-qa-docs -->
<!-- pandorha-task:20260521-000004-t52-social-choice-log-worldstate -->
### T52 Social Choice Log WorldState
- id: 20260521-000004-t52-social-choice-log-worldstate
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-21T09:24:02-03:00
- finished_at: 2026-05-21T09:32:12-03:00
- model_started: GPT-5.5 high
- model_finished: GPT-5.5 high
- last_modified_at: 2026-05-21T09:32:12-03:00
- branch: task/social-choice-log-worldstate
- commit_at_start: 513c0af feat(social): adiciona escolhas de argumento na ui
- summary: Melhorar logs persistidos de apelo social com o argumento escolhido e manter consequencias em WorldState sem save v5.
- last_change: T52 fez o log persistido de apelo social mencionar o argumento escolhido e manteve fallback para comandos antigos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-21T09:24:02-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5 high

#### Checkpoint 2026-05-21T09:32:12-03:00
- Done: T52 fez o log persistido de apelo social mencionar o argumento escolhido e manteve fallback para comandos antigos.
- Next: Iniciar T53 para atualizar guia, QA vertical e smoke script com escolhas de argumento.
- Risks: Browser Use continua sem digitação por clipboard virtual; validação usou personagem existente do save local.
- Improvements: T53 deve documentar o fluxo de Barganhar, log persistido e consequência quando a negociação termina.
- Model/config: GPT-5.5 high
<!-- /pandorha-task:20260521-000004-t52-social-choice-log-worldstate -->
<!-- pandorha-task:20260521-000003-t51-social-choice-ui -->
### T51 Social Choice UI
- id: 20260521-000003-t51-social-choice-ui
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-21T03:59:49-03:00
- finished_at: 2026-05-21T09:23:09-03:00
- model_started: GPT-5.5 medium-high
- model_finished: GPT-5.5 medium-high
- last_modified_at: 2026-05-21T09:23:09-03:00
- branch: task/social-choice-ui
- commit_at_start: 697cc08 feat(social): adiciona perfil de escolha de dialogo
- summary: Expor escolhas de argumento na UI de Relacoes e aplicar o modificador selecionado no apelo social.
- last_change: T51 expôs escolhas de argumento na aba Relações e aplicou o modificador selecionado no apelo social.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-21T03:59:49-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5 medium-high

#### Checkpoint 2026-05-21T09:23:09-03:00
- Done: T51 expôs escolhas de argumento na aba Relações e aplicou o modificador selecionado no apelo social.
- Next: Iniciar T52 para melhorar logs persistidos com o nome do argumento e manter fallback para comandos antigos.
- Risks: A digitação no Browser Use continua bloqueada pelo clipboard virtual; a validação usou personagem existente carregado do save local.
- Improvements: T52 deve validar save/load do log com escolha social e manter compatibilidade com comandos sem payload de escolha.
- Model/config: GPT-5.5 medium-high
<!-- /pandorha-task:20260521-000003-t51-social-choice-ui -->
<!-- pandorha-task:20260521-000002-t50-social-choice-appeal-core -->
### T50 Social Choice Appeal Core
- id: 20260521-000002-t50-social-choice-appeal-core
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-21T03:52:00-03:00
- finished_at: 2026-05-21T03:59:14-03:00
- model_started: GPT-5.5 high
- model_finished: GPT-5.5 high
- last_modified_at: 2026-05-21T03:59:14-03:00
- branch: task/social-choice-appeal-core
- commit_at_start: 259ba58 feat(social): registra consequencias no worldstate
- summary: Criar perfil testavel de argumento social para aplicar modificador de DialogueChoice na resolucao de apelo.
- last_change: T50 criou perfil testavel para aplicar escolhas de argumento social na resolucao de apelo.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-21T03:52:00-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5 high

#### Checkpoint 2026-05-21T03:59:14-03:00
- Done: T50 criou perfil testavel para aplicar escolhas de argumento social na resolucao de apelo.
- Next: Iniciar T51 para expor escolhas na UI de Relacoes.
- Risks: Sem UI nesta etapa; integracao visual fica para T51.
- Improvements: T51 deve validar Barganhar no navegador mostrando Bonus 1.
- Model/config: GPT-5.5 high
<!-- /pandorha-task:20260521-000002-t50-social-choice-appeal-core -->
<!-- pandorha-task:20260521-000001-t49-social-worldstate-consequences -->
### T49 Social WorldState consequences
- id: 20260521-000001-t49-social-worldstate-consequences
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-21T02:28:04-03:00
- finished_at: 2026-05-21T02:39:07-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: GPT-5.5 high
- last_modified_at: 2026-05-21T02:39:07-03:00
- branch: task/social-worldstate-consequences
- commit_at_start: 1be7433 feat(social): adiciona catalogo de escolhas de dialogo
- summary: Registrar flags narrativas em WorldState ao concluir negociacao social e exibir consequencia restaurada na aba Relacoes.
- last_change: T49 registrou consequencias sociais terminais em WorldState e validou restauracao por save/load no navegador.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-21T02:28:04-03:00
- Done: task record created
- Next: Implementar helper de consequencias, integrar App/SocialEncounterPanel e validar Browser Use save-load.
- Risks: Evitar novo schema/save v5; usar apenas namespace npc existente em WorldState.
- Improvements: Dialogos futuros podem usar catalogo T48 e flags para liberar caminhos narrativos.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-21T02:39:07-03:00
- Done: T49 registrou consequencias sociais terminais em WorldState e validou restauracao por save/load no navegador.
- Next: Planejar a proxima fase apos T45-T49 com base no estado estabilizado.
- Risks: Sem riscos conhecidos; consequencias usam flags npc: existentes, sem snapshot v5.
- Improvements: Futuras tarefas podem exibir um painel de fatos do mundo e ligar escolhas de dialogo a flags narrativas.
- Model/config: GPT-5.5 high
<!-- /pandorha-task:20260521-000001-t49-social-worldstate-consequences -->
<!-- pandorha-task:20260520-185000-t48-dialogue-choice-catalog -->
### T48 Dialogue choice catalog
- id: 20260520-185000-t48-dialogue-choice-catalog
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-20T18:49:38-03:00
- finished_at: 2026-05-20T18:56:25-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T18:56:25-03:00
- branch: task/dialogue-choice-catalog
- commit_at_start: d9d11fa feat(social): conecta apelo social ao personagem
- summary: Criar catalogo read-only de escolhas sociais persuade, bargain e threaten com modificadores simples para apelos futuros.
- last_change: Catalogo read-only de escolhas sociais persuade, bargain e threaten criado com Drizzle-Zod, fake repository e cobertura 100%.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T18:49:38-03:00
- Done: task record created
- Next: Implementar entidade catalogo, testes TDD, contextos e gates.
- Risks: Manter escolhas como catalogo de treino sem arvore de dialogo completa.
- Improvements: T49 usara consequencias em WorldState.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T18:56:25-03:00
- Done: Catalogo read-only de escolhas sociais persuade, bargain e threaten criado com Drizzle-Zod, fake repository e cobertura 100%.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-185000-t48-dialogue-choice-catalog -->
<!-- pandorha-task:20260520-183600-t47-social-appeal-character-ui -->
### T47 Social appeal character UI
- id: 20260520-183600-t47-social-appeal-character-ui
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-20T18:36:40-03:00
- finished_at: 2026-05-20T18:48:53-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T18:48:53-03:00
- branch: task/social-appeal-character-ui
- commit_at_start: 3a04a2c feat(social): adiciona resolucao de apelo social
- summary: Expandir a UI de Relacoes para escolher personagem da sessao como negociador e resolver apelo social via SocialAppealResolutionService.
- last_change: UI de Relacoes agora escolhe personagem da sessao como negociador e resolve apelo social via SocialAppealResolutionService, com browser save/load validado.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T18:36:40-03:00
- Done: task record created
- Next: Implementar view model/sessao/UI e validar com Browser Use.
- Risks: Integração Svelte com save/load v4 e estado social existente.
- Improvements: T48 adicionara escolhas de dialogo.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T18:48:53-03:00
- Done: UI de Relacoes agora escolhe personagem da sessao como negociador e resolve apelo social via SocialAppealResolutionService, com browser save/load validado.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-183600-t47-social-appeal-character-ui -->
<!-- pandorha-task:20260520-182802-t46-social-appeal-resolution -->
### T46 Social Appeal Resolution
- id: 20260520-182802-t46-social-appeal-resolution
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-20T18:28:02-03:00
- finished_at: 2026-05-20T18:35:33-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T18:35:33-03:00
- branch: task/social-qa-refresh
- commit_at_start: ff87a17 chore(qa): atualiza smoke social pos negociacao
- summary: Criar serviço puro para transformar teste social auditável em SocialAppealOutcome usando ResolutionService.
- last_change: SocialAppealResolutionService criado para transformar teste social auditavel em SocialAppealOutcome com cobertura e validacao de arquitetura.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T18:28:02-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T18:35:33-03:00
- Done: SocialAppealResolutionService criado para transformar teste social auditavel em SocialAppealOutcome com cobertura e validacao de arquitetura.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-182802-t46-social-appeal-resolution -->
<!-- pandorha-task:20260520-182331-t45-social-qa-refresh -->
### T45 Social QA Refresh
- id: 20260520-182331-t45-social-qa-refresh
- status: completed
- kind: maintenance
- planned: no
- started_at: 2026-05-20T18:23:31-03:00
- finished_at: 2026-05-20T18:27:24-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T18:27:24-03:00
- branch: task/social-qa-refresh
- commit_at_start: 487ba69 feat(social): adiciona ui de negociacao social
- summary: Atualizar QA vertical e smoke para refletir NPCs, negociação social, HP mental, save/load v4 e cache runtime pós-T44.
- last_change: QA vertical e smoke atualizados para cobrir negociação social, NPCs, HP mental, save/load v4 e service worker pós-T44.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T18:23:31-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T18:27:24-03:00
- Done: QA vertical e smoke atualizados para cobrir negociação social, NPCs, HP mental, save/load v4 e service worker pós-T44.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-182331-t45-social-qa-refresh -->
<!-- pandorha-task:20260520-130747-t44-social-encounter-ui -->
### T44 Social Encounter UI
- id: 20260520-130747-t44-social-encounter-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-20T13:07:47-03:00
- finished_at: 2026-05-20T18:18:33-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T18:18:33-03:00
- branch: task/social-encounter-ui
- commit_at_start: f70edb3 feat(save-load): persiste negociacao social no snapshot v4
- summary: Expandir a aba Relações com negociação social de treino, apelo determinístico, save/load v4 e guia de usuário.
- last_change: UI de negociação social com save/load v4 validada no navegador.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T13:07:47-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T18:18:33-03:00
- Done: UI de negociação social com save/load v4 validada no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-130747-t44-social-encounter-ui -->
<!-- pandorha-task:20260520-125428-t43-save-load-v4-social-encounter -->
### T43 Save Load V4 Social Encounter
- id: 20260520-125428-t43-save-load-v4-social-encounter
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-20T12:54:28-03:00
- finished_at: 2026-05-20T13:06:59-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T13:06:59-03:00
- branch: task/save-load-v4-social-encounter
- commit_at_start: feb3c1b feat(social): adiciona nucleo de encontro social
- summary: Persistir o estado de negociação social em snapshot v4 com tabelas dedicadas, migration SQLite e roundtrip no worker.
- last_change: T43 evoluiu o save para v4 com tabelas social_encounters/social_encounter_events, migration SQLite, worker/RPC, App state e roundtrip validado.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T12:54:28-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T13:06:59-03:00
- Done: T43 evoluiu o save para v4 com tabelas social_encounters/social_encounter_events, migration SQLite, worker/RPC, App state e roundtrip validado.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-125428-t43-save-load-v4-social-encounter -->
<!-- pandorha-task:20260520-114359-t42-social-encounter-core -->
### T42 Social Encounter Core
- id: 20260520-114359-t42-social-encounter-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-20T11:43:59-03:00
- finished_at: 2026-05-20T11:59:18-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T11:59:18-03:00
- branch: task/social-encounter-core
- commit_at_start: 0ec9ed8 feat(npc): adiciona catalogo base
- summary: Criar service puro de negociação social mínima com NPC catalog, ActionQueue, estado determinístico e cobertura.
- last_change: T42 criou SocialEncounterService deterministico com NPC catalog, ActionQueue, eventos/log em pt-BR, memoria tripla, cobertura 100% e gates completos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T11:43:59-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T11:59:18-03:00
- Done: T42 criou SocialEncounterService deterministico com NPC catalog, ActionQueue, eventos/log em pt-BR, memoria tripla, cobertura 100% e gates completos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-114359-t42-social-encounter-core -->
<!-- pandorha-task:20260520-091722-t41-npc-schema -->
### T41 NPC Schema
- id: 20260520-091722-t41-npc-schema
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-20T09:17:22-03:00
- finished_at: 2026-05-20T09:25:22-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T09:25:22-03:00
- branch: task/npc-schema
- commit_at_start: c180ec4 chore(qa): adiciona smoke da vertical slice
- summary: Criar entidade catalogo read-only de NPCs de treino com schemas Drizzle-Zod, fake repository, service e cobertura.
- last_change: T41 criou a entidade catalogo read-only de NPCs de treino com schemas Drizzle-Zod, fake repository, service Result, memoria tripla, cobertura 100% e gates completos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T09:17:22-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T09:25:22-03:00
- Done: T41 criou a entidade catalogo read-only de NPCs de treino com schemas Drizzle-Zod, fake repository, service Result, memoria tripla, cobertura 100% e gates completos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-091722-t41-npc-schema -->
<!-- pandorha-task:20260520-070803-t40-qa-vertical-slice -->
### T40 QA Vertical Slice
- id: 20260520-070803-t40-qa-vertical-slice
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-20T07:08:03-03:00
- finished_at: 2026-05-20T07:16:21-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-20T07:16:21-03:00
- branch: task/vertical-slice-qa
- commit_at_start: fe69ecc feat(pwa): adiciona smoke offline
- summary: Criar roteiro oficial de QA do MVP atual, automacao smoke reutilizavel e validar fluxo visual principal no navegador.
- last_change: Adicionado roteiro oficial de QA vertical, smoke browser automatizado e integração ao quality gate.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-20T07:08:03-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-20T07:16:21-03:00
- Done: Adicionado roteiro oficial de QA vertical, smoke browser automatizado e integração ao quality gate.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260520-070803-t40-qa-vertical-slice -->
<!-- pandorha-task:20260519-221612-t39-pwa-offline-smoke -->
### T39 PWA Offline Smoke
- id: 20260519-221612-t39-pwa-offline-smoke
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-19T22:16:12-03:00
- finished_at: 2026-05-19T22:26:01-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T22:26:01-03:00
- branch: task/pwa-offline-smoke
- commit_at_start: 008bf37 feat(social): adiciona ui de relacoes
- summary: Implementar service worker minimo, status offline em pt-BR e validacao de carregamento offline do app.
- last_change: T39 adicionou service worker minimo, status offline em pt-BR, teste unitario do PwaStatusView, guia de usuario e validacao Browser Use do status offline disponivel.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T22:16:12-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T22:26:01-03:00
- Done: T39 adicionou service worker minimo, status offline em pt-BR, teste unitario do PwaStatusView, guia de usuario e validacao Browser Use do status offline disponivel.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-221612-t39-pwa-offline-smoke -->
<!-- pandorha-task:20260519-212508-t38-social-relations-ui -->
### T38 UI Relações
- id: 20260519-212508-t38-social-relations-ui
- status: completed
- kind: implementation
- planned: yes
- started_at: 2026-05-19T21:28:28-03:00
- finished_at: 2026-05-19T21:46:29-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T21:46:29-03:00
- branch: task/social-relations-ui
- commit_at_start: 663dcfa feat(save-load): evolui snapshot social para v3
- summary: Adicionar aba Relações com facções de treino, operações sociais Tier 1 e integração com save/load v3.
- last_change: T38 implementou a aba Relações com standings sociais de treino, ações de favor e redenção, integração com save/load v3, guia de usuário, validação Browser Use e gates completos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T21:28:28-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T21:46:29-03:00
- Done: T38 implementou a aba Relações com standings sociais de treino, ações de favor e redenção, integração com save/load v3, guia de usuário, validação Browser Use e gates completos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-212508-t38-social-relations-ui -->
<!-- pandorha-task:20260519-191724-t37-save-load-v3-social -->
### T37 Save Load V3 Social
- id: 20260519-191724-t37-save-load-v3-social
- status: completed
- kind: implementation
- planned: yes
- started_at: 2026-05-19T19:18:07-03:00
- finished_at: 2026-05-19T21:26:33-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T21:26:33-03:00
- branch: task/save-load-v3-social
- commit_at_start: bf8c263 feat(social): adiciona service de standing
- summary: Evoluir snapshot para version 3 com factionStandings, migracao v2->v3 e roundtrip no Worker/SaveLoadService sem UI.
- last_change: T37 evoluiu o save local para version 3 com factionStandings, migration Drizzle social, migracoes v1/v2 para v3 e roundtrip SQLite/Worker validado.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T19:18:07-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T21:26:33-03:00
- Done: T37 evoluiu o save local para version 3 com factionStandings, migration Drizzle social, migracoes v1/v2 para v3 e roundtrip SQLite/Worker validado.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-191724-t37-save-load-v3-social -->
<!-- pandorha-task:20260519-190740-t36b-socialstandingservice -->
### T36B SocialStandingService
- id: 20260519-190740-t36b-socialstandingservice
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-19T19:07:40-03:00
- finished_at: 2026-05-19T19:17:24-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T19:17:24-03:00
- branch: task/social-standing-service
- commit_at_start: f6c2518 feat(faction): adiciona catalogo social base
- summary: Criar service puro para limite de divida, favor de faccao, intriga, ganho/perda de fama e redencao de divida usando Result Pattern.
- last_change: T36B implementou SocialStandingService puro para limite de divida, favor, intriga, redenção e fama com Result Pattern e cobertura 100%.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T19:07:40-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T19:17:24-03:00
- Done: T36B implementou SocialStandingService puro para limite de divida, favor, intriga, redenção e fama com Result Pattern e cobertura 100%.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-190740-t36b-socialstandingservice -->
<!-- pandorha-task:20260519-190052-t36a-faction-standing-schema -->
### T36A Faction Standing Schema
- id: 20260519-190052-t36a-faction-standing-schema
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-19T19:00:52-03:00
- finished_at: 2026-05-19T19:06:24-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T19:06:24-03:00
- branch: task/faction-standing-schema
- commit_at_start: 436ef4d feat(camp): adiciona ui de acampamento
- summary: Criar entidade faction com catalogo minimo de faccoes de treino, standings sociais validados, fake repository e service read-only sem migration ou UI.
- last_change: T36A concluida: entidade faction criada com catalogo de treino, standings sociais validados, fake repository, service read-only, contextos, arch-guard e gates completos verdes.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T19:00:52-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T19:06:24-03:00
- Done: T36A concluida: entidade faction criada com catalogo de treino, standings sociais validados, fake repository, service read-only, contextos, arch-guard e gates completos verdes.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-190052-t36a-faction-standing-schema -->
<!-- pandorha-task:20260519-123008-t35d-camp-ui -->
### T35D Camp UI
- id: 20260519-123008-t35d-camp-ui
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-19T12:30:08-03:00
- finished_at: 2026-05-19T18:43:22-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T18:43:22-03:00
- branch: task/camp-ui
- commit_at_start: 7029214 feat(save-load): adiciona snapshot v2 de acampamento
- summary: Adicionar aba Acampamento com planejamento de uma hora, contador de perigo, relogio Fortificar perimetro, log em pt-BR e save/load v2.
- last_change: T35D concluida: aba Acampamento adicionada com planejamento de 1 hora, Contador de Perigo, relogio Fortificar perimetro, save/load v2 restaurando estado, guia de usuario, Browser Use validado e gates completos verdes.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T12:30:08-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T12:40:09-03:00
- Done: T35D parcialmente implementada: aba Acampamento, view model, testes e docs criados; lint, testes e coverage passaram, mas build/quality gate/browser validation foram pausados porque a execução escalada foi rejeitada por limite de uso do Codex.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T18:43:22-03:00
- Done: T35D concluida: aba Acampamento adicionada com planejamento de 1 hora, Contador de Perigo, relogio Fortificar perimetro, save/load v2 restaurando estado, guia de usuario, Browser Use validado e gates completos verdes.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-123008-t35d-camp-ui -->
<!-- pandorha-task:20260519-121519-t35c-save-load-v2-camp -->
### T35C Save Load V2 Camp
- id: 20260519-121519-t35c-save-load-v2-camp
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-19T12:15:19-03:00
- finished_at: 2026-05-19T12:29:15-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T12:29:15-03:00
- branch: task/save-load-v2-camp
- commit_at_start: feab80f feat(camp): adiciona resolucao de hora
- summary: Evoluir snapshot para version 2 com clocks e estado estruturado de acampamento, incluindo migracao v1 para v2 e persistencia transacional.
- last_change: T35C concluida: snapshot v2 salva e carrega personagens, world state, clocks e acampamento com migracao explicita de v1 para v2.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T12:15:19-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T12:29:15-03:00
- Done: T35C concluida: snapshot v2 salva e carrega personagens, world state, clocks e acampamento com migracao explicita de v1 para v2.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-121519-t35c-save-load-v2-camp -->
<!-- pandorha-task:20260519-120236-t35b-camphourservice -->
### T35B CampHourService
- id: 20260519-120236-t35b-camphourservice
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-19T12:02:36-03:00
- finished_at: 2026-05-19T12:14:10-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-19T12:14:10-03:00
- branch: task/camp-hour-service
- commit_at_start: 151e295 feat(camp): adiciona modelos iniciais de acampamento
- summary: Implementar service puro para resolver uma hora de acampamento com atribuicoes, perigo, log e avanço de relogio.
- last_change: T35B concluida: CampHourService resolve uma hora deterministica de acampamento com perigo, logs e avanco de relogio.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-19T12:02:36-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-19T12:14:10-03:00
- Done: T35B concluida: CampHourService resolve uma hora deterministica de acampamento com perigo, logs e avanco de relogio.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260519-120236-t35b-camphourservice -->
<!-- pandorha-task:20260515-211720-t35a-camp-activity-catalog -->
### T35A Camp Activity Catalog
- id: 20260515-211720-t35a-camp-activity-catalog
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-15T21:17:20-03:00
- finished_at: 2026-05-15T21:23:25-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T21:23:25-03:00
- branch: task/camp-activity-catalog
- commit_at_start: 3e4885c feat(clock): adiciona persistencia sqlite
- summary: Criar catalogo minimo de atividades e modelos persistiveis de sessao e atribuicao de acampamento.
- last_change: T35A concluida: catalogo inicial de atividades e schemas persistiveis de sessao/atribuicoes de acampamento.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T21:17:20-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T21:23:25-03:00
- Done: T35A concluida: catalogo inicial de atividades e schemas persistiveis de sessao/atribuicoes de acampamento.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-211720-t35a-camp-activity-catalog -->
<!-- pandorha-task:20260515-211229-t34b-clock-persistence -->
### T34B Clock Persistence
- id: 20260515-211229-t34b-clock-persistence
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-15T21:12:29-03:00
- finished_at: 2026-05-15T21:16:39-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T21:16:39-03:00
- branch: task/clock-persistence
- commit_at_start: fc362b9 feat(clock): adiciona nucleo de relogios
- summary: Adicionar migration de clocks e repository Drizzle minimo com testes de contrato.
- last_change: T34B concluida: migration de clocks, DrizzleClockRepository com upsert e bootstrap SQLite atualizado.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T21:12:29-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T21:16:39-03:00
- Done: T34B concluida: migration de clocks, DrizzleClockRepository com upsert e bootstrap SQLite atualizado.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-211229-t34b-clock-persistence -->
<!-- pandorha-task:20260515-205733-t34a-clock-schema-core -->
### T34A Clock Schema Core
- id: 20260515-205733-t34a-clock-schema-core
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-15T20:57:33-03:00
- finished_at: 2026-05-15T21:07:00-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T21:07:00-03:00
- branch: task/clock-schema-core
- commit_at_start: 39b88cd feat(save-load): adiciona ui de save local
- summary: Criar schema, fake repository e ClockService puro para relogios sem UI ou persistencia real.
- last_change: T34A concluida: entidade Clock com schema Drizzle-Zod, ClockService puro, fake em memoria, testes TDD, memoria tripla e validacao completa.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T20:57:33-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T21:07:00-03:00
- Done: T34A concluida: entidade Clock com schema Drizzle-Zod, ClockService puro, fake em memoria, testes TDD, memoria tripla e validacao completa.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-205733-t34a-clock-schema-core -->
<!-- pandorha-task:20260515-202200-t33d-save-load-ui -->
### T33D Save Load UI
- id: 20260515-202200-t33d-save-load-ui
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-15T20:22:00-03:00
- finished_at: 2026-05-15T20:36:50-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T20:36:50-03:00
- branch: task/browser-worker-bridge
- commit_at_start: 1e29e8a feat(rpc): adiciona browser worker bridge real
- summary: Adicionar composicao real de Worker e controles visiveis de salvar/carregar na aba Personagens.
- last_change: Save/load UI ligada ao Worker real; fluxo navegador -> salvar -> recarregar -> carregar validado com restauração de personagens e avanço do próximo ID.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T20:22:00-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T20:36:50-03:00
- Done: Save/load UI ligada ao Worker real; fluxo navegador -> salvar -> recarregar -> carregar validado com restauração de personagens e avanço do próximo ID.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-202200-t33d-save-load-ui -->
<!-- pandorha-task:20260515-201426-t33c-2-browserworkerbridge-real -->
### T33C.2 BrowserWorkerBridge real
- id: 20260515-201426-t33c-2-browserworkerbridge-real
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-15T20:14:26-03:00
- finished_at: 2026-05-15T20:21:24-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T20:21:24-03:00
- branch: task/save-load-worker-commands
- commit_at_start: e4f49b3 feat(save-load): adiciona comandos de snapshot no worker
- summary: Implementar WorkerBridge real do navegador com correlacao por messageId, timeouts tipados e validacao RPC.
- last_change: BrowserWorkerBridge real implementado com correlacao por messageId, timeouts tipados e validacao de respostas RPC.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T20:14:26-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T20:21:24-03:00
- Done: BrowserWorkerBridge real implementado com correlacao por messageId, timeouts tipados e validacao de respostas RPC.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-201426-t33c-2-browserworkerbridge-real -->
<!-- pandorha-task:20260515-195054-t33c-1-worker-save-load-commands -->
### T33C.1 - Worker Save Load Commands
- id: 20260515-195054-t33c-1-worker-save-load-commands
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-15T19:50:54-03:00
- finished_at: 2026-05-15T20:13:18-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T20:13:18-03:00
- branch: task/save-load-worker-commands
- commit_at_start: da3fa41 feat(save-load): adiciona service de snapshot
- summary: Implementar persistencia real de snapshots primarios no Worker com SQLite WASM, preservando FSD por porta injetada.
- last_change: Persistencia transacional de snapshots primary e comandos RPC de save/load implementados no Worker, com validacao tipada e cobertura total.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T19:50:54-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T20:13:18-03:00
- Done: Persistencia transacional de snapshots primary e comandos RPC de save/load implementados no Worker, com validacao tipada e cobertura total.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-195054-t33c-1-worker-save-load-commands -->
<!-- pandorha-task:20260515-185920-t33c-saveloadservice -->
### T33C - SaveLoadService
- id: 20260515-185920-t33c-saveloadservice
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-15T18:59:20-03:00
- finished_at: 2026-05-15T19:34:29-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T19:34:29-03:00
- branch: task/save-load-service
- commit_at_start: 6c6297d feat(persistence): adiciona bootstrap sqlite opfs
- summary: Criar service puro para salvar e carregar snapshots versionados de Character + WorldState via WorkerBridge.
- last_change: T33C concluida: SaveLoadService versionado para snapshot de Character + WorldState via WorkerBridge, com validacao de registros carregados e falhas tipadas.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T18:59:20-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T19:34:29-03:00
- Done: T33C concluida: SaveLoadService versionado para snapshot de Character + WorldState via WorkerBridge, com validacao de registros carregados e falhas tipadas.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-185920-t33c-saveloadservice -->
<!-- pandorha-task:20260515-192238-d01-dependency-security-refresh -->
### D01 dependency security refresh
- id: 20260515-192238-d01-dependency-security-refresh
- status: completed
- kind: maintenance
- planned: no
- started_at: 2026-05-15T19:22:38-03:00
- finished_at: 2026-05-15T19:26:43-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T19:26:43-03:00
- branch: task/dependency-security-refresh
- commit_at_start: 6c6297d feat(persistence): adiciona bootstrap sqlite opfs
- summary: Atualizar patches nao breaking de svelte e devalue para remover o achado high do npm audit
- last_change: Atualiza lockfile para svelte 5.55.7 e devalue 5.8.1, removendo o achado high do npm audit e preservando o alerta moderate de drizzle-kit para follow-up separado.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-15T19:22:38-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T19:26:43-03:00
- Done: Atualiza lockfile para svelte 5.55.7 e devalue 5.8.1, removendo o achado high do npm audit e preservando o alerta moderate de drizzle-kit para follow-up separado.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-192238-d01-dependency-security-refresh -->
<!-- pandorha-task:20260514-112622-t33b-sqlite-wasm-opfs-bootstrap -->
### T33B - SQLite WASM OPFS Bootstrap
- id: 20260514-112622-t33b-sqlite-wasm-opfs-bootstrap
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-14T11:26:22-03:00
- finished_at: 2026-05-14T11:39:51-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-14T11:39:51-03:00
- branch: task/sqlite-opfs-bootstrap
- commit_at_start: f904516 feat(rpc): adiciona contrato de save load
- summary: Implementar bootstrap Worker/SQLite WASM/OPFS e migration de world_state_entries sem UI.
- last_change: T33B concluida: Drizzle config multi-schema, migration world_state_entries, bootstrap SQLite WASM/OPFS com Worker handler, storage OPFS e testes em sql.js.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-14T11:26:22-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-14T11:39:51-03:00
- Done: T33B concluida: Drizzle config multi-schema, migration world_state_entries, bootstrap SQLite WASM/OPFS com Worker handler, storage OPFS e testes em sql.js.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260514-112622-t33b-sqlite-wasm-opfs-bootstrap -->
<!-- pandorha-task:20260514-112014-t33a-worker-rpc-save-contract -->
### T33A - Worker RPC Save Contract
- id: 20260514-112014-t33a-worker-rpc-save-contract
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-14T11:20:14-03:00
- finished_at: 2026-05-14T11:25:21-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-14T11:25:21-03:00
- branch: task/save-rpc-contract
- commit_at_start: b1a0606 feat(world-state): adiciona key-value core
- summary: Criar contratos RPC serializaveis e FakeWorkerBridge para save/load sem SQLite real.
- last_change: T33A concluida: contratos RPC de save/load, schemas serializaveis e FakeWorkerBridge testavel sem SQLite real.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-14T11:20:14-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-14T11:25:21-03:00
- Done: T33A concluida: contratos RPC de save/load, schemas serializaveis e FakeWorkerBridge testavel sem SQLite real.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260514-112014-t33a-worker-rpc-save-contract -->
<!-- pandorha-task:20260514-065055-t32-worldstate-key-value -->
### T32 - WorldState Key-Value
- id: 20260514-065055-t32-worldstate-key-value
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-14T06:50:55-03:00
- finished_at: 2026-05-14T06:58:55-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-14T06:58:55-03:00
- branch: task/world-state-kv
- commit_at_start: 2338a1b fix(app): corrige texto da aba exploracao
- summary: Criar schema, service e fake repository de WorldState sem UI, Worker ou migration.
- last_change: T32 concluida: WorldState Key-Value com schema Drizzle-Zod, WorldStateService, fake repository, testes e contextos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-14T06:50:55-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-14T06:58:55-03:00
- Done: T32 concluida: WorldState Key-Value com schema Drizzle-Zod, WorldStateService, fake repository, testes e contextos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260514-065055-t32-worldstate-key-value -->
<!-- pandorha-task:T31 -->
### UI De Mapa Hexcrawl Minima
- id: T31
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-14T06:18:03-03:00
- finished_at: 2026-05-14T06:34:46-03:00
- model_started: GPT-5.5
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-14T06:34:46-03:00
- branch: task/hexcrawl-map-ui
- commit_at_start: 335c1b7 feat(hexcrawl): adiciona movimento axial minimo
- summary: Adicionar aba Exploracao com mapa fixo de sete hexes, movimento adjacente e log em pt-BR.
- last_change: Aba Exploracao criada com mapa fixo de sete hexes, movimento adjacente, estado visual, log em pt-BR e validacao no navegador.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-14T06:18:03-03:00
- Done: task record created
- Next: Criar view model, sessao app e painel Svelte para mapa hexcrawl minimo.
- Risks: UI deve permanecer pequena, sem geracao procedural, persistencia, navegacao por DC ou encounter real.
- Improvements: Validar fluxo no Browser Use e documentar limites no contexto da feature.
- Model/config: GPT-5.5

#### Checkpoint 2026-05-14T06:34:46-03:00
- Done: Aba Exploracao criada com mapa fixo de sete hexes, movimento adjacente, estado visual, log em pt-BR e validacao no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:T31 -->
<!-- pandorha-task:T30 -->
### Hexcrawl MovementService
- id: T30
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-14T00:19:39-03:00
- finished_at: 2026-05-14T06:17:17-03:00
- model_started: GPT-5.5
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-14T06:17:17-03:00
- branch: task/hexcrawl-movement
- commit_at_start: 41e67da feat(world): adiciona catalogo base de hexcrawl
- summary: Criar service puro para mover grupo entre hexes axiais adjacentes, com falhas tipadas e eventos em memoria.
- last_change: HexcrawlMovementService criado com movimento axial adjacente, bloqueio, descoberta, evento de encontro pendente e testes TDD.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-14T00:19:39-03:00
- Done: task record created
- Next: Escrever testes TDD do movimento axial e implementar HexcrawlMovementService.
- Risks: Nao misturar teste de Navegacao, encontro real, persistencia ou geracao procedural.
- Improvements: Reaproveitar WorldTileCatalog via porta para a UI T31.
- Model/config: GPT-5.5

#### Checkpoint 2026-05-14T06:17:17-03:00
- Done: HexcrawlMovementService criado com movimento axial adjacente, bloqueio, descoberta, evento de encontro pendente e testes TDD.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:T30 -->
<!-- pandorha-task:T29 -->
### WorldTile Schema
- id: T29
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-14T00:09:23-03:00
- finished_at: 2026-05-14T00:18:34-03:00
- model_started: GPT-5.5
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-14T00:18:34-03:00
- branch: task/world-tile-schema
- commit_at_start: 27bca5d feat(spell): adiciona tela de conjuracao minima
- summary: Criar entidade world-tile com coordenadas axiais, catalogo minimo e service read-only validado.
- last_change: Entidade WorldTile criada com schema Drizzle-Zod, catalogo axial minimo, service read-only, fake em memoria e testes TDD.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-14T00:09:23-03:00
- Done: task record created
- Next: Implementar catalogo e testes TDD da entidade WorldTile.
- Risks: Escopo deve permanecer sem UI, migration ou mundo procedural.
- Improvements: Validar coordenadas axiais com fixture pequena de hexcrawl.
- Model/config: GPT-5.5

#### Checkpoint 2026-05-14T00:18:34-03:00
- Done: Entidade WorldTile criada com schema Drizzle-Zod, catalogo axial minimo, service read-only, fake em memoria e testes TDD.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:T29 -->
<!-- pandorha-task:20260513-234107-t28-ui-de-conjuracao-minima -->
### T28 UI De Conjuracao Minima
- id: 20260513-234107-t28-ui-de-conjuracao-minima
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-13T23:41:07-03:00
- finished_at: 2026-05-13T23:54:32-03:00
- model_started: GPT-5.5
- model_finished: GPT-5.5
- last_modified_at: 2026-05-13T23:54:32-03:00
- branch: task/spell-casting-ui
- commit_at_start: f1da92f feat(spell): adiciona builder de conjuracao
- summary: Adicionar aba Magia para escolher magia do catalogo, alvo de treino e preparar comando cast-spell sem executar efeito.
- last_change: T28 adicionou aba Magia com painel de conjuracao minima, view model testado, sessao local e validacao Browser Use para preparar Luz como comando cast-spell.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T23:41:07-03:00
- Done: task record created
- Next: Validar fluxo no Browser Use e commitar a UI minima.
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5

#### Checkpoint 2026-05-13T23:54:32-03:00
- Done: T28 adicionou aba Magia com painel de conjuracao minima, view model testado, sessao local e validacao Browser Use para preparar Luz como comando cast-spell.
- Next: Planejar proxima etapa de magia: Spell execution ou EE/session caster conforme prioridade.
- Risks: A UI prepara comandos apenas; nao executa efeito, nao gasta EE e nao integra com combate.
- Improvements: Criar guia de usuario ou T29 para execucao controlada de magia quando as regras de alvo/EE estiverem definidas.
- Model/config: GPT-5.5
<!-- /pandorha-task:20260513-234107-t28-ui-de-conjuracao-minima -->
<!-- pandorha-task:20260513-233033-t27-spellcastbuilder-core -->
### T27 SpellCastBuilder Core
- id: 20260513-233033-t27-spellcastbuilder-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-13T23:30:33-03:00
- finished_at: 2026-05-13T23:39:51-03:00
- model_started: GPT-5.5
- model_finished: GPT-5.5
- last_modified_at: 2026-05-13T23:39:51-03:00
- branch: task/spell-cast-builder
- commit_at_start: 81e568e feat(spell): adiciona catalogo base
- summary: Criar service puro para transformar intencao de conjuracao em comando cast-spell sem executar magia.
- last_change: T27 concluiu SpellCastBuilderService puro com fluxo Draft-Weaving-Audit-Commit, comando cast-spell validado, testes TDD e memoria tripla.
#### Files At Start
- src/features/spell-cast/
#### Checkpoints
#### Checkpoint 2026-05-13T23:30:33-03:00
- Done: task record created
- Next: Implementar T28 UI de conjuracao minima depois dos gates.
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: GPT-5.5

#### Checkpoint 2026-05-13T23:39:51-03:00
- Done: T27 concluiu SpellCastBuilderService puro com fluxo Draft-Weaving-Audit-Commit, comando cast-spell validado, testes TDD e memoria tripla.
- Next: Iniciar T28 UI de conjuracao minima na branch task/spell-casting-ui.
- Risks: Nenhum bloqueio atual; metamagia e execucao real continuam fora do escopo.
- Improvements: Validar T28 no Browser Use e documentar limite de comando preparado sem gasto de EE.
- Model/config: GPT-5.5
<!-- /pandorha-task:20260513-233033-t27-spellcastbuilder-core -->
<!-- pandorha-task:20260513-220314-t26-spell-schema-minimo -->
### T26 Spell Schema Minimo
- id: 20260513-220314-t26-spell-schema-minimo
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-13T22:03:14-03:00
- finished_at: 2026-05-13T23:18:11-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T23:18:11-03:00
- branch: task/spell-schema
- commit_at_start: 47490c3 feat(inventory): adiciona tela somente leitura
- summary: Criar entidade spell como catalogo read-only validado por Drizzle-Zod/Zod, sem UI, migration, banco real ou conjuracao.
- last_change: T26 concluida: entidade spell criada com schema Drizzle-Zod/Zod, catalogo minimo de 6 truques, fake repository, SpellCatalogService read-only, testes TDD, cobertura, build e quality gate.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T22:03:14-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T22:09:52-03:00
- Done: T26 implementada em codigo, mas pausada sem commit porque Vitest, build e pandorha-arch-guard exigiram execucao elevada e a aprovacao foi bloqueada pelo limite de uso ate a janela indicada pelo Codex.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T23:18:11-03:00
- Done: T26 concluida: entidade spell criada com schema Drizzle-Zod/Zod, catalogo minimo de 6 truques, fake repository, SpellCatalogService read-only, testes TDD, cobertura, build e quality gate.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-220314-t26-spell-schema-minimo -->
<!-- pandorha-task:20260513-203725-t25-inventory-read-only-ui -->
### T25 Inventory Read Only UI
- id: 20260513-203725-t25-inventory-read-only-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-13T20:37:25-03:00
- finished_at: 2026-05-13T20:47:41-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T20:47:41-03:00
- branch: task/inventory-ui
- commit_at_start: 817f09f feat(inventory): adiciona calculo de capacidade
- summary: Criar aba de inventario somente leitura com itens fixos do catalogo T23 e carga calculada pelo InventoryCapacityService.
- last_change: T25 concluida com aba Inventario somente leitura, itens do catalogo T23, calculo de carga pelo InventoryCapacityService, validacao no navegador, gates completos e quality release.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T20:37:25-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T20:47:41-03:00
- Done: T25 concluida com aba Inventario somente leitura, itens do catalogo T23, calculo de carga pelo InventoryCapacityService, validacao no navegador, gates completos e quality release.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-203725-t25-inventory-read-only-ui -->
<!-- pandorha-task:20260513-202933-t24-inventorycapacityservice -->
### T24 InventoryCapacityService
- id: 20260513-202933-t24-inventorycapacityservice
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-13T20:29:33-03:00
- finished_at: 2026-05-13T20:36:24-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T20:36:24-03:00
- branch: task/inventory-capacity
- commit_at_start: 426a725 chore(quality): adiciona gates de fixtures para mcp e skills
- summary: Criar service puro para calcular limite de carga, slots usados e estado de sobrecarga sem persistir valores derivados.
- last_change: InventoryCapacityService criado em shared/inventory com calculo de limite, slots usados e estados normal/lento/imobilizado, coberto por TDD e quality gate.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T20:29:33-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T20:36:24-03:00
- Done: InventoryCapacityService criado em shared/inventory com calculo de limite, slots usados e estados normal/lento/imobilizado, coberto por TDD e quality gate.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-202933-t24-inventorycapacityservice -->
<!-- pandorha-task:20260513-182431-a06-mcp-and-skill-fixture-gates -->
### A06 MCP And Skill Fixture Gates
- id: 20260513-182431-a06-mcp-and-skill-fixture-gates
- status: completed
- kind: automation
- planned: no
- started_at: 2026-05-13T18:24:31-03:00
- finished_at: 2026-05-13T18:29:37-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T18:29:37-03:00
- branch: task/mcp-skill-fixture-gates
- commit_at_start: 9c9c614 chore(skills): adiciona validadores node windows-first
- summary: Expandir quality:skills com validadores Node e adicionar fixtures deterministicas para MCPs Pandorha.
- last_change: Quality skills expandido com validadores Node, fixtures MCP deterministicas adicionadas e JSONs de skills normalizados para gate confiavel.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T18:24:31-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T18:29:37-03:00
- Done: Quality skills expandido com validadores Node, fixtures MCP deterministicas adicionadas e JSONs de skills normalizados para gate confiavel.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-182431-a06-mcp-and-skill-fixture-gates -->
<!-- pandorha-task:20260513-125718-a05-skill-validators-windows-first -->
### A05 Skill Validators Windows-First
- id: 20260513-125718-a05-skill-validators-windows-first
- status: completed
- kind: automation
- planned: no
- started_at: 2026-05-13T12:57:18-03:00
- finished_at: 2026-05-13T18:23:33-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T18:23:33-03:00
- branch: task/skill-validator-windows
- commit_at_start: 48e4161 chore(quality): fortalece gates de cobertura
- summary: Substituir validadores Bash frageis das skills por scripts Node portaveis para bloquear padroes proibidos.
- last_change: Validadores oficiais das skills migrados para Node Windows-first, wrappers legados mantidos e gates locais aprovados.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T12:57:18-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T18:23:33-03:00
- Done: Validadores oficiais das skills migrados para Node Windows-first, wrappers legados mantidos e gates locais aprovados.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-125718-a05-skill-validators-windows-first -->
<!-- pandorha-task:20260513-124327-a04-coverage-and-quality-gate-automation -->
### A04 Coverage And Quality Gate Automation
- id: 20260513-124327-a04-coverage-and-quality-gate-automation
- status: completed
- kind: automation
- planned: no
- started_at: 2026-05-13T12:43:27-03:00
- finished_at: 2026-05-13T12:56:02-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T12:56:02-03:00
- branch: task/quality-gate-hardening
- commit_at_start: 64282f6 chore(scaffold): adiciona gerador de service de dominio
- summary: Adicionar validacao de coverage obrigatorio para services/view models e criar quality:release/quality:automation Windows-first.
- last_change: A04 concluida: coverage obrigatorio validavel para services/view models, quality:automation e quality:release adicionados, e lacunas existentes de coverage fechadas.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T12:43:27-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T12:56:02-03:00
- Done: A04 concluida: coverage obrigatorio validavel para services/view models, quality:automation e quality:release adicionados, e lacunas existentes de coverage fechadas.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-124327-a04-coverage-and-quality-gate-automation -->
<!-- pandorha-task:20260513-123938-a03-domain-service-scaffolder -->
### A03 Domain Service Scaffolder
- id: 20260513-123938-a03-domain-service-scaffolder
- status: completed
- kind: automation
- planned: no
- started_at: 2026-05-13T12:39:38-03:00
- finished_at: 2026-05-13T12:42:39-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T12:42:39-03:00
- branch: task/domain-service-scaffold
- commit_at_start: 1173511 chore(scaffold): adiciona gerador de entidade catalogo
- summary: Criar scaffolder Node para services puros em shared, entities ou features com testes, contexto e orientacao de coverage.
- last_change: A03 concluida: scaffolder Node de service de dominio criado para shared, entities e features com teste, contexto e orientacao de coverage.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T12:39:38-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T12:42:39-03:00
- Done: A03 concluida: scaffolder Node de service de dominio criado para shared, entities e features com teste, contexto e orientacao de coverage.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-123938-a03-domain-service-scaffolder -->
<!-- pandorha-task:20260513-123247-a02-catalog-entity-scaffolder -->
### A02 Catalog Entity Scaffolder
- id: 20260513-123247-a02-catalog-entity-scaffolder
- status: completed
- kind: automation
- planned: no
- started_at: 2026-05-13T12:32:47-03:00
- finished_at: 2026-05-13T12:38:38-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T12:38:38-03:00
- branch: task/catalog-entity-scaffold
- commit_at_start: 847ebb2 chore(process): endurece automacao local
- summary: Criar scaffolder Node para gerar estrutura padrao de entidades catalogo sem dados oficiais nem regras de RPG.
- last_change: A02 concluida: scaffolder Node de entidade catalogo criado com testes de estrutura, path traversal, overwrite e comando npm.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T12:32:47-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T12:38:38-03:00
- Done: A02 concluida: scaffolder Node de entidade catalogo criado com testes de estrutura, path traversal, overwrite e comando npm.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-123247-a02-catalog-entity-scaffolder -->
<!-- pandorha-task:20260513-122332-a01-process-automation-hardening -->
### A01 Process Automation Hardening
- id: 20260513-122332-a01-process-automation-hardening
- status: completed
- kind: automation
- planned: no
- started_at: 2026-05-13T12:23:32-03:00
- finished_at: 2026-05-13T12:28:44-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T12:28:44-03:00
- branch: task/process-automation-hardening
- commit_at_start: f1018d8 feat(equipment): adiciona catalogo base
- summary: Endurecer automacao de processo com validate/doctor, snapshot skip-clean e instalador Windows-first de hooks.
- last_change: A01 concluida: automacao de processo validavel, snapshot skip-clean, hooks Node-first e instalador Windows-first adicionados.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T12:23:32-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T12:28:44-03:00
- Done: A01 concluida: automacao de processo validavel, snapshot skip-clean, hooks Node-first e instalador Windows-first adicionados.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-122332-a01-process-automation-hardening -->
<!-- pandorha-task:20260513-120357-t23-equipment-schema -->
### T23 Equipment Schema
- id: 20260513-120357-t23-equipment-schema
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-13T12:03:57-03:00
- finished_at: 2026-05-13T12:12:57-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T12:12:57-03:00
- branch: task-equipment-schema
- commit_at_start: f6b14c7 docs(combat): revisa vertical slice de treino
- summary: Criar entidade Equipment com schemas Drizzle-Zod, catalogo minimo, fake repository e service read-only para equipamentos unicos e consumiveis empilhados.
- last_change: T23 concluida: entidade Equipment criada com schemas Drizzle-Zod, catalogo minimo, fake repository, service read-only, testes e contexto.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-13T12:03:57-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T12:12:57-03:00
- Done: T23 concluida: entidade Equipment criada com schemas Drizzle-Zod, catalogo minimo, fake repository, service read-only, testes e contexto.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260513-120357-t23-equipment-schema -->
<!-- pandorha-task:20260512-183308-t22k-combat-vertical-slice-review -->
### T22K Combat Vertical Slice Review
- id: 20260512-183308-t22k-combat-vertical-slice-review
- status: completed
- kind: review
- planned: no
- started_at: 2026-05-12T18:33:08-03:00
- finished_at: 2026-05-13T07:17:43-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-13T07:17:43-03:00
- branch: task-combat-vertical-slice-review
- commit_at_start: 7c1a398 docs(combat): adiciona guia de treino
- summary: Revisar coesao final da T22, registrar checklist de funcionamento, limitacoes e validacao antes de avancar para T23.
- last_change: T22K concluida: revisao final da vertical slice T22 criada, fluxo completo validado no navegador e limites registrados.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-12T18:33:08-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-13T07:17:43-03:00
- Done: T22K concluida: revisao final da vertical slice T22 criada, fluxo completo validado no navegador e limites registrados.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260512-183308-t22k-combat-vertical-slice-review -->
<!-- pandorha-task:20260512-182841-t22j-combat-user-guide -->
### T22J Combat User Guide
- id: 20260512-182841-t22j-combat-user-guide
- status: completed
- kind: documentation
- planned: no
- started_at: 2026-05-12T18:28:41-03:00
- finished_at: 2026-05-12T18:31:42-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-12T18:31:42-03:00
- branch: task-combat-user-guide
- commit_at_start: c1eefee feat(combat): mostra encerramento do encontro
- summary: Criar guia em pt-BR para testar a vertical slice de combate de treino no navegador.
- last_change: T22J concluida: guia de usuario do combate de treino criado e validado contra o fluxo real no navegador.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-12T18:28:41-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-12T18:31:42-03:00
- Done: T22J concluida: guia de usuario do combate de treino criado e validado contra o fluxo real no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260512-182841-t22j-combat-user-guide -->
<!-- pandorha-task:20260512-182337-t22i-combat-encounter-outcome -->
### T22I Combat Encounter Outcome
- id: 20260512-182337-t22i-combat-encounter-outcome
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-12T18:23:37-03:00
- finished_at: 2026-05-12T18:27:39-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-12T18:27:39-03:00
- branch: task-combat-encounter-outcome
- commit_at_start: b6a7879 feat(combat): registra turno passivo do alvo
- summary: Mostrar estado final claro quando o alvo chega a 0 HP, bloquear ataque e encerramento de turno, mantendo reiniciar encontro.
- last_change: T22I concluida: encontro mostra estado de alvo derrotado, bloqueia ataque/turno e mantem reiniciar encontro disponivel.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-12T18:23:37-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-12T18:27:39-03:00
- Done: T22I concluida: encontro mostra estado de alvo derrotado, bloqueia ataque/turno e mantem reiniciar encontro disponivel.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260512-182337-t22i-combat-encounter-outcome -->
<!-- pandorha-task:20260512-181508-t22h-combat-training-target-turn -->
### T22H Combat Training Target Turn
- id: 20260512-181508-t22h-combat-training-target-turn
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-12T18:15:08-03:00
- finished_at: 2026-05-12T18:22:35-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-12T18:22:35-03:00
- branch: task-combat-training-target-turn
- commit_at_start: 639556f feat(combat): usa matriz fisica no dano de treino
- summary: Registrar no log que o alvo de treino mantem posicao ao encerrar o turno dele, sem IA, ataque ou dano inimigo.
- last_change: T22H concluida: turno do alvo de treino registra log de manter posicao sem IA, ataque ou dano inimigo.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-12T18:15:08-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-12T18:22:35-03:00
- Done: T22H concluida: turno do alvo de treino registra log de manter posicao sem IA, ataque ou dano inimigo.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260512-181508-t22h-combat-training-target-turn -->
<!-- pandorha-task:20260512-130258-t22g-combat-training-damage-profile -->
### T22G Combat Training Damage Profile
- id: 20260512-130258-t22g-combat-training-damage-profile
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-12T13:02:58-03:00
- finished_at: 2026-05-12T18:13:35-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-12T18:13:35-03:00
- branch: task-combat-training-damage-profile
- commit_at_start: 5275d54 feat(combat): exibe atributos derivados do atacante
- summary: Fazer o dano de treino usar a Matriz Fisica do personagem selecionado, mantendo dado, bonus, ataque e equipamento deterministicos.
- last_change: T22G concluida: dano de treino usa Matriz Fisica do personagem da sessao, Aria preserva perfil fixo e UI mostra o perfil aplicado.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-12T13:02:58-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-12T18:13:35-03:00
- Done: T22G concluida: dano de treino usa Matriz Fisica do personagem da sessao, Aria preserva perfil fixo e UI mostra o perfil aplicado.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260512-130258-t22g-combat-training-damage-profile -->
<!-- pandorha-task:20260512-122140-t22f-combat-attacker-derived-stats -->
### T22F Combat Attacker Derived Stats
- id: 20260512-122140-t22f-combat-attacker-derived-stats
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-12T12:21:40-03:00
- finished_at: 2026-05-12T12:42:45-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-12T12:42:45-03:00
- branch: task-combat-attacker-derived-stats
- commit_at_start: 0e6060a feat(combat): adiciona estado de turno
- summary: Exibir HP maximo, iniciativa e carga derivados do personagem selecionado no painel de combate, sem aplicar esses valores ao ataque ou dano.
- last_change: T22F exibiu HP maximo, iniciativa e carga derivados do personagem selecionado na aba Combate, mantendo ataque, dano, HP real e iniciativa como treino deterministico.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-12T12:21:40-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-12T12:42:45-03:00
- Done: T22F exibiu HP maximo, iniciativa e carga derivados do personagem selecionado na aba Combate, mantendo ataque, dano, HP real e iniciativa como treino deterministico.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260512-122140-t22f-combat-attacker-derived-stats -->
<!-- pandorha-task:20260506-233712-t22e-combat-turn-state -->
### T22E Combat Turn State
- id: 20260506-233712-t22e-combat-turn-state
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-06T23:37:12-03:00
- finished_at: 2026-05-12T12:06:26-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-12T12:06:26-03:00
- branch: task-combat-turn-state
- commit_at_start: f4606a7 feat(combat): conecta atacante da sessao
- summary: Adicionar estado minimo de turno ao combate, com rodada, turno ativo, acoes 3/3, consumo de acao e encerramento de turno no painel.
- last_change: T22E adicionou estado de turno deterministico no combate, com rodada, turno ativo, acoes 3/3, consumo de acao, encerramento de turno e validacao no navegador.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-06T23:37:12-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-12T12:06:26-03:00
- Done: T22E adicionou estado de turno deterministico no combate, com rodada, turno ativo, acoes 3/3, consumo de acao, encerramento de turno e validacao no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260506-233712-t22e-combat-turn-state -->
<!-- pandorha-task:20260506-181931-t22d-combat-session-attacker -->
### T22D Combat Session Attacker
- id: 20260506-181931-t22d-combat-session-attacker
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-06T18:19:31-03:00
- finished_at: 2026-05-06T23:08:41-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-06T23:08:41-03:00
- branch: task-combat-session-attacker
- commit_at_start: c8bdf49 feat(combat): adiciona alvos de treino
- summary: Conectar a aba Combate aos personagens criados na sessao como opcoes de atacante, mantendo Aria como fallback.
- last_change: T22D conectou personagens da sessao como atacantes no combate, mantendo Aria como fallback, com Browser Use e gates completos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-06T18:19:31-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-06T23:08:41-03:00
- Done: T22D conectou personagens da sessao como atacantes no combate, mantendo Aria como fallback, com Browser Use e gates completos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260506-181931-t22d-combat-session-attacker -->
<!-- pandorha-task:20260506-175209-t22c-combat-training-targets -->
### T22C Combat Training Targets
- id: 20260506-175209-t22c-combat-training-targets
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-06T17:52:09-03:00
- finished_at: 2026-05-06T18:09:25-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-06T18:09:25-03:00
- branch: task-combat-training-targets
- commit_at_start: 312f86f feat(combat): adiciona tela de encontro
- summary: Adicionar catalogo visual de alvos de treino na aba Combate, com troca de alvo resetando HP e log.
- last_change: T22C adicionou catalogo visual de tres alvos de treino na aba Combate, com troca de alvo resetando HP/log, Browser Use e gates completos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-06T17:52:09-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-06T18:09:25-03:00
- Done: T22C adicionou catalogo visual de tres alvos de treino na aba Combate, com troca de alvo resetando HP/log, Browser Use e gates completos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260506-175209-t22c-combat-training-targets -->
<!-- pandorha-task:20260506-123114-t22b-combat-vertical-slice-ui -->
### T22B Combat Vertical Slice UI
- id: 20260506-123114-t22b-combat-vertical-slice-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-06T12:31:14-03:00
- finished_at: 2026-05-06T12:41:30-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5.5 high-reasoning final review; local automation
- last_modified_at: 2026-05-06T12:41:30-03:00
- branch: task-combat-vertical-slice-ui
- commit_at_start: 5f973e9 feat(combat): adiciona nucleo de encontro
- summary: Criar aba Combate com encontro fixo deterministico usando CombatEncounterService e validacao no navegador.
- last_change: T22B concluiu a aba Combate com encontro fixo, painel Svelte, view model testavel, sessao deterministica, Browser Use e gates completos.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-06T12:31:14-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-06T12:41:30-03:00
- Done: T22B concluiu a aba Combate com encontro fixo, painel Svelte, view model testavel, sessao deterministica, Browser Use e gates completos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation
<!-- /pandorha-task:20260506-123114-t22b-combat-vertical-slice-ui -->
<!-- pandorha-task:20260506-120924-t22a-combat-encounter-core -->
### T22A Combat Encounter Core
- id: 20260506-120924-t22a-combat-encounter-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-06T12:09:24-03:00
- finished_at: 2026-05-06T12:18:45-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5.5 high-reasoning final review; local automation
- last_modified_at: 2026-05-06T12:18:45-03:00
- branch: task-combat-encounter-core
- commit_at_start: 3959923 feat(damage): adiciona pipeline minimo
- summary: Criar CombatEncounterService puro para resolver ataque simples com ActionQueue, ResolutionService e DamagePipelineService.
- last_change: T22A concluiu CombatEncounterService puro com ActionQueue, ResolutionService, DamagePipelineService, ledger em memoria, log pt-BR, testes e memoria tripla.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-06T12:09:24-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-06T12:18:45-03:00
- Done: T22A concluiu CombatEncounterService puro com ActionQueue, ResolutionService, DamagePipelineService, ledger em memoria, log pt-BR, testes e memoria tripla.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation
<!-- /pandorha-task:20260506-120924-t22a-combat-encounter-core -->
<!-- pandorha-task:20260506-114519-t21-damage-pipeline-minimo -->
### T21 Damage Pipeline minimo
- id: 20260506-114519-t21-damage-pipeline-minimo
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-06T11:45:19-03:00
- finished_at: 2026-05-06T11:51:35-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5.5 high-reasoning final review; local automation
- last_modified_at: 2026-05-06T11:51:35-03:00
- branch: task-damage-pipeline
- commit_at_start: 983415c feat(action-queue): adiciona fila deterministica
- summary: Criar DamagePipelineService puro em shared/damage para calcular dano em fases deterministicas.
- last_change: T21 concluiu DamagePipelineService puro em shared/damage com testes, coverage, constantes de regra e memoria tripla.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-06T11:45:19-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-06T11:51:35-03:00
- Done: T21 concluiu DamagePipelineService puro em shared/damage com testes, coverage, constantes de regra e memoria tripla.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation
<!-- /pandorha-task:20260506-114519-t21-damage-pipeline-minimo -->
<!-- pandorha-task:20260506-000211-t20-actionqueue-minima -->
### T20 ActionQueue minima
- id: 20260506-000211-t20-actionqueue-minima
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-06T00:02:11-03:00
- finished_at: 2026-05-06T06:53:26-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5.5 high-reasoning final review; local automation
- last_modified_at: 2026-05-06T06:53:26-03:00
- branch: task-action-queue
- commit_at_start: e88954b feat(resolution): adiciona teste global
- summary: Criar ActionQueueService puro em shared/action-queue com FIFO, interrupcoes LIFO, processor fake em testes e Result tipado, sem UI nem persistencia.
- last_change: ActionQueueService criado em shared/action-queue com FIFO, interrupcoes LIFO, processor fake em testes, falhas tipadas e 100% de cobertura.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-06T00:02:11-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-06T00:09:40-03:00
- Done: ActionQueueService implementado com testes TDD, lint e arch-guard; execucao escalada de coverage/gates bloqueada pelo ambiente.
- Next: Executar npm.cmd test, test:coverage, build, quality:gate e commitar quando o bloqueio de execucao escalada for liberado.
- Risks: Testes apos os ultimos cenarios nao puderam rodar por spawn EPERM no sandbox e bloqueio externo de escalonamento.
- Improvements: Reexecutar gates completos antes do commit.
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-06T06:53:26-03:00
- Done: ActionQueueService criado em shared/action-queue com FIFO, interrupcoes LIFO, processor fake em testes, falhas tipadas e 100% de cobertura.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation
<!-- /pandorha-task:20260506-000211-t20-actionqueue-minima -->
<!-- pandorha-task:20260505-235005-t19-resolutionservice-core -->
### T19 ResolutionService core
- id: 20260505-235005-t19-resolutionservice-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T23:50:05-03:00
- finished_at: 2026-05-05T23:55:30-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5.5 high-reasoning final review; local automation
- last_modified_at: 2026-05-05T23:55:30-03:00
- branch: task-resolution-service
- commit_at_start: c6a0275 feat(dice): adiciona servico auditavel
- summary: Criar ResolutionService puro para calcular Teste Global com DiceService, graus de sucesso e Result tipado, sem UI nem persistencia.
- last_change: ResolutionService criado em shared/resolution com Teste Global, graus de sucesso, decisao de 20 natural e 100% de cobertura.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T23:50:05-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-05T23:55:30-03:00
- Done: ResolutionService criado em shared/resolution com Teste Global, graus de sucesso, decisao de 20 natural e 100% de cobertura.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation
<!-- /pandorha-task:20260505-235005-t19-resolutionservice-core -->
<!-- pandorha-task:20260505-231828-t18a-dice-service-core -->
### T18A dice service core
- id: 20260505-231828-t18a-dice-service-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T23:18:28-03:00
- finished_at: 2026-05-05T23:27:29-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation
- model_finished: gpt-5.5 high-reasoning final review; local automation
- last_modified_at: 2026-05-05T23:32:25-03:00
- branch: task-dice-service
- commit_at_start: bd7a8b1 feat(compendium): adiciona busca navegavel
- summary: Criar DiceService auditavel com RNG injetavel, resultados tipados e testes determinísticos, sem UI nem persistencia real.
- last_change: DiceService, testes e gate de cobertura com 100% finalizados.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T23:18:28-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-05T23:27:29-03:00
- Done: DiceService auditavel criado em shared/dice com RNG injetavel, audit entry em memoria e testes deterministicos.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation

#### Checkpoint 2026-05-05T23:32:25-03:00
- Done: DiceService, testes e gate de cobertura com 100% finalizados.
- Next: T19 ResolutionService
- Risks: Auditoria ainda e apenas em memoria; persistencia fica para tarefa futura.
- Improvements: Criar adaptador isolado de RNG real quando houver boundary aprovado de runtime.
- Model/config: gpt-5.5 high-reasoning final review; local automation
<!-- /pandorha-task:20260505-231828-t18a-dice-service-core -->
<!-- pandorha-task:20260505-190555-t17a-compendium-browser-ui -->
### T17A compendium browser UI
- id: 20260505-190555-t17a-compendium-browser-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T19:05:55-03:00
- finished_at: 2026-05-05T19:17:44-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-05T19:17:44-03:00
- branch: task-compendium-browser-ui
- commit_at_start: 1ce69c8 feat(compendium): adiciona catalogo base
- summary: Criar busca e UI read-only do compendio usando o catalogo base validado, com Browser Use para validar pesquisa por Vanguarda.
- last_change: UI do compendio consultavel criada com busca read-only, detalhe de entrada, estados de erro/vazio e validacao no Browser Use.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T19:05:55-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-05T19:17:44-03:00
- Done: UI do compendio consultavel criada com busca read-only, detalhe de entrada, estados de erro/vazio e validacao no Browser Use.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260505-190555-t17a-compendium-browser-ui -->
<!-- pandorha-task:20260505-185244-t16a-compendium-base-catalog -->
### T16A compendium base catalog
- id: 20260505-185244-t16a-compendium-base-catalog
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T18:52:44-03:00
- finished_at: 2026-05-05T19:00:03-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-05T19:00:03-03:00
- branch: task-compendium-base-catalog
- commit_at_start: 3dfcde6 feat(character): conecta catalogos na criacao
- summary: Criar catalogo base do compendio validado por Zod com service read-only, fake repository e Result Pattern.
- last_change: Catalogo base do compendio criado com 8 entradas oficiais, schemas Drizzle-Zod, repository fake, service Result e testes de contrato.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T18:52:44-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-05T19:00:03-03:00
- Done: Catalogo base do compendio criado com 8 entradas oficiais, schemas Drizzle-Zod, repository fake, service Result e testes de contrato.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260505-185244-t16a-compendium-base-catalog -->
<!-- pandorha-task:20260505-180953-t15b-character-catalog-ui-integration -->
### T15B character catalog UI integration
- id: 20260505-180953-t15b-character-catalog-ui-integration
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T18:09:53-03:00
- finished_at: 2026-05-05T18:20:47-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-05T18:20:47-03:00
- branch: task-character-catalog-ui-integration
- commit_at_start: 99977fe feat(character): calcula stats derivados base
- summary: Conectar catalogos oficiais de classe e antecedente ao criador/listagem de personagem, mantendo ids tecnicos em ingles e labels pt-BR.
- last_change: Criador e listagem de personagens agora usam catalogos oficiais de classe e antecedente com ids tecnicos em ingles e labels pt-BR, validados no Browser Use.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T18:09:53-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-05T18:20:47-03:00
- Done: Criador e listagem de personagens agora usam catalogos oficiais de classe e antecedente com ids tecnicos em ingles e labels pt-BR, validados no Browser Use.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260505-180953-t15b-character-catalog-ui-integration -->
<!-- pandorha-task:20260505-131417-t15a-character-derived-stats-core -->
### T15A character derived stats core
- id: 20260505-131417-t15a-character-derived-stats-core
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T13:14:17-03:00
- finished_at: 2026-05-05T13:23:01-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-05T13:23:01-03:00
- branch: task-character-derived-stats-core
- commit_at_start: f8874a0 feat(background): adiciona catalogo base
- summary: Criar service puro para calcular HP maximo, iniciativa base e limite de carga sem persistir valores finais.
- last_change: CharacterDerivedStatsService calcula HP maximo, iniciativa base e limite de carga sem persistir valores finais, com TDD e cobertura 100 por cento.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T13:14:17-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-05T13:23:01-03:00
- Done: CharacterDerivedStatsService calcula HP maximo, iniciativa base e limite de carga sem persistir valores finais, com TDD e cobertura 100 por cento.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260505-131417-t15a-character-derived-stats-core -->
<!-- pandorha-task:20260505-085702-t14-background-schema -->
### T14 background schema
- id: 20260505-085702-t14-background-schema
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T08:57:02-03:00
- finished_at: 2026-05-05T09:05:10-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-05T09:05:10-03:00
- branch: task-background-schema
- commit_at_start: b39362b feat(character-class): adiciona catalogo base
- summary: Modelar catalogo read-only dos antecedentes oficiais com ids tecnicos em ingles, schema Drizzle-Zod, repository fake e service Result.
- last_change: Schema e catalogo read-only dos 20 antecedentes oficiais adicionados com ids tecnicos em ingles, repository fake, service Result e testes de contrato.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T08:57:02-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-05T09:05:10-03:00
- Done: Schema e catalogo read-only dos 20 antecedentes oficiais adicionados com ids tecnicos em ingles, repository fake, service Result e testes de contrato.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260505-085702-t14-background-schema -->
<!-- pandorha-task:20260505-084102-t13-character-class-schema -->
### T13 character class schema
- id: 20260505-084102-t13-character-class-schema
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T08:41:02-03:00
- finished_at: 2026-05-05T08:49:26-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-05T08:49:26-03:00
- branch: task-character-class-schema
- commit_at_start: d3c8374 feat(character): integra tracos de ancestralidade
- summary: Modelar catalogo read-only das quatro classes oficiais com ids tecnicos em ingles, schema Drizzle-Zod, repository fake e service Result.
- last_change: Schema e catalogo read-only das quatro classes oficiais adicionados com ids tecnicos em ingles, repository fake, service Result e testes de contrato.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T08:41:02-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-05T08:49:26-03:00
- Done: Schema e catalogo read-only das quatro classes oficiais adicionados com ids tecnicos em ingles, repository fake, service Result e testes de contrato.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260505-084102-t13-character-class-schema -->
<!-- pandorha-task:20260505-081342-t13a-character-ancestry-trait-selection -->
### T13A character ancestry trait selection
- id: 20260505-081342-t13a-character-ancestry-trait-selection
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-05T08:13:42-03:00
- finished_at: 2026-05-05T08:24:22-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: GPT-5.5 high
- last_modified_at: 2026-05-05T08:24:22-03:00
- branch: task-character-ancestry-trait-selection
- commit_at_start: b303882 feat(ancestry): adiciona tracos base
- summary: Integrar catalogos de ancestralidade e tracos ao formulario de criacao de personagem com escolha de exatamente 3 tracos, sem persistencia real.
- last_change: T13A integrou ancestralidades e escolha de exatamente 3 tracos ao formulario de criacao, validando via AncestryTraitSelectionService antes de criar personagem.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-05T08:13:42-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-05T08:24:22-03:00
- Done: T13A integrou ancestralidades e escolha de exatamente 3 tracos ao formulario de criacao, validando via AncestryTraitSelectionService antes de criar personagem.
- Next: Planejar T13 oficial de schema de classes ou uma tarefa curta para exibir escolhas de tracos na ficha/listagem.
- Risks: Os tracos escolhidos ainda nao sao persistidos em CharacterRecord e seus efeitos mecanicos ainda nao sao aplicados.
- Improvements: Criar persistencia propria para escolhas nao derivadas de personagem antes de exibir ficha completa.
- Model/config: GPT-5.5 high
<!-- /pandorha-task:20260505-081342-t13a-character-ancestry-trait-selection -->
<!-- pandorha-task:20260503-221203-t12-ancestry-traits -->
### T12 ancestry traits
- id: 20260503-221203-t12-ancestry-traits
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-03T22:12:03-03:00
- finished_at: 2026-05-03T22:24:17-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: GPT-5.5 high
- last_modified_at: 2026-05-03T22:28:51-03:00
- branch: task-ancestry-traits
- commit_at_start: 7b077b8 feat(ancestry): adiciona catalogo base
- summary: Modelar catalogo textual de tracos de ancestralidade, relacao N:N e service de escolha de 3 tracos no nivel 1.
- last_change: Coverage config passou a incluir services de ancestry e os testes foram ampliados para manter 100 por cento em branches, linhas, funcoes e statements.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-03T22:12:03-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-03T22:24:17-03:00
- Done: T12 adicionou catalogo textual de 60 tracos de ancestralidade, relacao N:N e service Result para escolha de exatamente 3 tracos no nivel 1.
- Next: Planejar T13 para integrar ancestralidade e tracos ao fluxo de criacao de personagem sem persistencia real.
- Risks: Efeitos mecanicos dos tracos ainda sao texto validado e nao aplicam modificadores.
- Improvements: Adicionar migrations e adapters reais apenas em tarefa propria de persistencia.
- Model/config: GPT-5.5 high

#### Checkpoint 2026-05-03T22:28:51-03:00
- Done: Coverage config passou a incluir services de ancestry e os testes foram ampliados para manter 100 por cento em branches, linhas, funcoes e statements.
- Next: Planejar T13 com integracao incremental dos catalogos de ancestralidade ao criador de personagem.
- Risks: Nenhuma UI mudou; efeitos dos tracos continuam textuais e sem aplicacao mecanica.
- Improvements: Manter vitest.config.mjs atualizado sempre que novo service/domain logic entrar no projeto.
- Model/config: GPT-5.5 high
<!-- /pandorha-task:20260503-221203-t12-ancestry-traits -->
<!-- pandorha-task:20260503-173935-t11-ancestry-schema -->
### T11 ancestry schema
- id: 20260503-173935-t11-ancestry-schema
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-03T17:39:35-03:00
- finished_at: 2026-05-03T17:45:55-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-03T17:45:55-03:00
- branch: task-ancestry-schema
- commit_at_start: d3ed625 docs(character): adiciona guia de criacao
- summary: Criar entidade Ancestry com schema Drizzle-Zod, catalogo oficial, service read-only e fake em memoria.
- last_change: Entidade Ancestry criada com schema Drizzle-Zod, catalogo oficial validado, service read-only, fake em memoria e testes.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-03T17:39:35-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-03T17:45:55-03:00
- Done: Entidade Ancestry criada com schema Drizzle-Zod, catalogo oficial validado, service read-only, fake em memoria e testes.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260503-173935-t11-ancestry-schema -->
<!-- pandorha-task:20260503-172645-t10-character-user-docs -->
### T10 character user docs
- id: 20260503-172645-t10-character-user-docs
- status: completed
- kind: docs
- planned: no
- started_at: 2026-05-03T17:26:45-03:00
- finished_at: 2026-05-03T17:31:48-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-03T17:31:48-03:00
- branch: task-character-user-docs
- commit_at_start: cd568f1 feat(character): melhora mensagens de erro
- summary: Criar guia de usuario em pt-BR para testar a criacao de personagem 6/6 no navegador.
- last_change: Guia de usuario para criacao de personagem 6/6 criado e validado contra o fluxo real no navegador.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-03T17:26:45-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-03T17:31:48-03:00
- Done: Guia de usuario para criacao de personagem 6/6 criado e validado contra o fluxo real no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260503-172645-t10-character-user-docs -->
<!-- pandorha-task:20260503-171537-t09-character-error-copy -->
### T09 character error copy
- id: 20260503-171537-t09-character-error-copy
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-03T17:15:37-03:00
- finished_at: 2026-05-03T17:20:00-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-03T17:20:00-03:00
- branch: task-character-error-copy
- commit_at_start: c6ce5df feat(character): adiciona criacao em sessao
- summary: Refinar mensagens pt-BR do formulario de criacao de personagem sem alterar regras de dominio.
- last_change: Mensagens pt-BR do formulario de personagem refinadas e validadas no navegador.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-03T17:15:37-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-03T17:20:00-03:00
- Done: Mensagens pt-BR do formulario de personagem refinadas e validadas no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260503-171537-t09-character-error-copy -->
<!-- pandorha-task:20260503-135734-t08-character-create-form -->
### T08 character create form
- id: 20260503-135734-t08-character-create-form
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-03T13:57:34-03:00
- finished_at: 2026-05-03T17:11:02-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-03T17:11:02-03:00
- branch: task-character-create-form
- commit_at_start: 3fa5f3b feat(character): adiciona listagem inicial
- summary: Criar fluxo de criação de personagem 6/6 com estado de sessão e listagem atualizada.
- last_change: Criacao de personagem 6/6 implementada com estado de sessao, lista atualizada e validacao no navegador.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-03T13:57:34-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-03T17:11:02-03:00
- Done: Criacao de personagem 6/6 implementada com estado de sessao, lista atualizada e validacao no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260503-135734-t08-character-create-form -->
<!-- pandorha-task:20260503-131425-t07-character-list-ui -->
### T07 character list UI
- id: 20260503-131425-t07-character-list-ui
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-03T13:14:25-03:00
- finished_at: 2026-05-03T13:20:36-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-03T13:20:36-03:00
- branch: task-character-list-ui
- commit_at_start: baf6701 feat(character): adiciona migration inicial
- summary: Criar tela read-only de listagem de personagens com estado vazio navegavel.
- last_change: Listagem read-only de personagens criada com estado vazio validado no navegador.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-03T13:14:25-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-03T13:20:36-03:00
- Done: Listagem read-only de personagens criada com estado vazio validado no navegador.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260503-131425-t07-character-list-ui -->
<!-- pandorha-task:20260503-124608-t06-characters-migration -->
### T06 characters migration
- id: 20260503-124608-t06-characters-migration
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-03T12:46:08-03:00
- finished_at: 2026-05-03T12:54:13-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-03T12:54:13-03:00
- branch: task-characters-migration
- commit_at_start: 72cc635 test(character): cobre contrato do repository drizzle
- summary: Configurar e validar a migration inicial da entidade Character.
- last_change: Migration inicial de Character criada e validada em SQLite WASM temporario.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-03T12:46:08-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-03T12:54:13-03:00
- Done: Migration inicial de Character criada e validada em SQLite WASM temporario.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260503-124608-t06-characters-migration -->
<!-- pandorha-task:20260502-231441-navegacao-state-driven-inicial -->
### Navegacao state-driven inicial
- id: 20260502-231441-navegacao-state-driven-inicial
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-02T23:14:41-03:00
- finished_at: 2026-05-02T23:28:26-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-02T23:28:26-03:00
- branch: task-state-driven-navigation
- commit_at_start: a791e73 chore(process): registra snapshot pos-commit da regra de plano
- summary: Adicionar navegacao local por estado entre Inicio, Personagens e Compendio, sem router externo, banco ou regras de RPG.
- last_change: T03 concluida: navegacao state-driven entre Inicio, Personagens e Compendio, contrato tipado de navegação, validacao tecnica completa e validacao em Chrome headless local apos Browser Use falhar por runtime Node antigo.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-02T23:14:41-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T23:18:28-03:00
- Done: Implementacao T03 concluida e validacoes tecnicas passaram: lint, test, build, quality gate e pandorha-arch-guard.
- Next: Decidir como proceder com a validacao de navegador apos Browser Use falhar por runtime Node antigo.
- Risks: Browser Use nao iniciou: node_repl resolveu Node v22.20.0, mas o plugin exige >= v22.22.0. Usar fallback sem aprovacao violaria o plano aprovado.
- Improvements: Configurar Browser Use/node_repl com Node mais novo ou aprovar fallback controlado com Chrome headless local.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T23:28:26-03:00
- Done: T03 concluida: navegacao state-driven entre Inicio, Personagens e Compendio, contrato tipado de navegação, validacao tecnica completa e validacao em Chrome headless local apos Browser Use falhar por runtime Node antigo.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260502-231441-navegacao-state-driven-inicial -->
<!-- pandorha-task:20260502-230859-regra-de-planejamento-obrigatorio -->
### Regra de planejamento obrigatorio
- id: 20260502-230859-regra-de-planejamento-obrigatorio
- status: completed
- kind: docs
- planned: no
- started_at: 2026-05-02T23:08:59-03:00
- finished_at: 2026-05-02T23:10:00-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-02T23:10:00-03:00
- branch: task-planning-protocol-rule
- commit_at_start: 425ff71 chore(process): registra snapshot pos-commit do app shell
- summary: Registrar regra que proibe iniciar codigo sem plano detalhado, exige aderencia as especificacoes e pede decisao do usuario para ferramentas ou padroes fora do escopo planejado.
- last_change: Regra de planejamento obrigatorio registrada em AGENTS.md e llms.txt, exigindo plano detalhado antes de codigo e decisao do usuario para ferramentas/padroes fora do escopo planejado.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-02T23:08:59-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T23:10:00-03:00
- Done: Regra de planejamento obrigatorio registrada em AGENTS.md e llms.txt, exigindo plano detalhado antes de codigo e decisao do usuario para ferramentas/padroes fora do escopo planejado.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260502-230859-regra-de-planejamento-obrigatorio -->
<!-- pandorha-task:20260502-224801-scaffold-minimo-svelte-vite -->
### Scaffold minimo Svelte Vite
- id: 20260502-224801-scaffold-minimo-svelte-vite
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-02T22:48:01-03:00
- finished_at: 2026-05-02T22:55:28-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-02T22:55:28-03:00
- branch: task-svelte-app-shell
- commit_at_start: 2f0fbbf chore(process): registra snapshot final do roadmap
- summary: Adicionar app Svelte 5/Vite minimo sem regra de jogo, com tela inicial testavel no navegador do Codex.
- last_change: T02 concluida: scaffold Svelte 5/Vite minimo, tela inicial navegavel, scripts dev/build/preview, validacao no navegador local, lint/test/coverage/build/quality gate e arch guard.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-02T22:48:01-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T22:55:28-03:00
- Done: T02 concluida: scaffold Svelte 5/Vite minimo, tela inicial navegavel, scripts dev/build/preview, validacao no navegador local, lint/test/coverage/build/quality gate e arch guard.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260502-224801-scaffold-minimo-svelte-vite -->
<!-- pandorha-task:20260502-223501-documentar-plano-completo-do-jogo -->
### Documentar plano completo do jogo
- id: 20260502-223501-documentar-plano-completo-do-jogo
- status: completed
- kind: docs
- planned: no
- started_at: 2026-05-02T22:35:01-03:00
- finished_at: 2026-05-02T22:40:23-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-02T22:40:23-03:00
- branch: task-game-roadmap-docs
- commit_at_start: dd38600 docs(governance): define protocolos de idioma e intake
- summary: Criar guia de implementacao completa do Pandorha Engine e plano de microtarefas com branch propria, testes, browser validation e gate total por feature.
- last_change: Criados os documentos complete-game-implementation-guide.md e microtask-delivery-plan.md, com orientacao para implementacao completa do jogo, microtarefas, browser tests, branch por feature e gate total.
#### Files At Start
- docs/process/task-ledger.md
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-02T22:35:01-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T22:40:23-03:00
- Done: Criados os documentos complete-game-implementation-guide.md e microtask-delivery-plan.md, com orientacao para implementacao completa do jogo, microtarefas, browser tests, branch por feature e gate total.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260502-223501-documentar-plano-completo-do-jogo -->
<!-- pandorha-task:20260502-202511-implement-unified-quality-gate -->
### Implement unified quality gate
- id: 20260502-202511-implement-unified-quality-gate
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-02T20:25:11-03:00
- finished_at: 2026-05-02T20:31:53-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-02T20:31:53-03:00
- branch: feat/metadata-tags-codex
- commit_at_start: e5b2284 chore(process): registra snapshot pos-commit da tracer bullet
- summary: Create the zero-token full quality gate script, package commands, documentation update, and process records for future validation runs.
- last_change: Implemented scripts/run_full_quality_gate.mjs, added root quality scripts, ignored generated artifacts, normalized missing skill metadata, documented first successful full gate run, and verified root/MCP/skill gates pass.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- Untitled-1.md
- docs/process/testing-and-next-steps-roadmap.md
#### Checkpoints
#### Checkpoint 2026-05-02T20:25:11-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T20:31:53-03:00
- Done: Implemented scripts/run_full_quality_gate.mjs, added root quality scripts, ignored generated artifacts, normalized missing skill metadata, documented first successful full gate run, and verified root/MCP/skill gates pass.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260502-202511-implement-unified-quality-gate -->
<!-- pandorha-task:20260502-201538-qa-roadmap-for-implemented-systems -->
### QA roadmap for implemented systems
- id: 20260502-201538-qa-roadmap-for-implemented-systems
- status: completed
- kind: docs
- planned: no
- started_at: 2026-05-02T20:15:39-03:00
- finished_at: 2026-05-02T20:17:25-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-02T20:17:25-03:00
- branch: feat/metadata-tags-codex
- commit_at_start: e5b2284 chore(process): registra snapshot pos-commit da tracer bullet
- summary: Create a detailed testing and next-steps guide covering implemented code, MCPs, skills, and future project implementation flow.
- last_change: Created docs/process/testing-and-next-steps-roadmap.md with a full QA roadmap for implemented code, MCPs, skills, unified quality gate automation, and next implementation phases.
#### Files At Start
- Untitled-1.md
#### Checkpoints
#### Checkpoint 2026-05-02T20:15:39-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T20:17:25-03:00
- Done: Created docs/process/testing-and-next-steps-roadmap.md with a full QA roadmap for implemented code, MCPs, skills, unified quality gate automation, and next implementation phases.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260502-201538-qa-roadmap-for-implemented-systems -->
<!-- pandorha-task:20260502-114935-tracer-bullet-character-domain -->
### Tracer bullet Character domain
- id: 20260502-114935-tracer-bullet-character-domain
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-02T11:49:35-03:00
- finished_at: 2026-05-02T12:03:35-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-02T12:03:35-03:00
- branch: feat/metadata-tags-codex
- commit_at_start: 4ee50c8 chore: snapshot pandorha workspace updates
- summary: Create the first Character domain tracer bullet with Drizzle schema, Result-based service, in-memory fake repository, and TDD coverage.
- last_change: Implemented Character domain tracer bullet with Drizzle schema, Drizzle-Zod validation, Result-based service, in-memory fake repository, Biome/TypeScript scaffold, 21 unit tests, and 100% coverage for executable service/model files.
#### Files At Start
- docs/process/task-ledger.md
- .codex/
- .lla-embeddings.json
- .lla-index.json
- .lla-profile.json
- dev.db
- scratch/
- system-backup/
#### Checkpoints
#### Checkpoint 2026-05-02T11:49:35-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-02T12:03:35-03:00
- Done: Implemented Character domain tracer bullet with Drizzle schema, Drizzle-Zod validation, Result-based service, in-memory fake repository, Biome/TypeScript scaffold, 21 unit tests, and 100% coverage for executable service/model files.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260502-114935-tracer-bullet-character-domain -->
<!-- pandorha-task:20260501-013428-implement-zero-token-maintenance-automation -->
### Implement zero-token maintenance automation
- id: 20260501-013428-implement-zero-token-maintenance-automation
- status: completed
- kind: feature
- planned: no
- started_at: 2026-05-01T01:34:28-03:00
- finished_at: 2026-05-01T01:34:40-03:00
- model_started: gpt-5.5 xhigh final review; local automation zero-token
- model_finished: gpt-5.5 xhigh final review; local automation zero-token
- last_modified_at: 2026-05-01T01:34:40-03:00
- branch: feat/metadata-tags-codex
- commit_at_start: aa80d68 chore: inicializacao para processamento de tags
- summary: Create the full Option A maintenance workflow with process docs, task ledger, change inbox, changelog promotion, local script, hooks, and skill guidance.
- last_change: Option A maintenance automation implemented and validated.
#### Files At Start
- docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md
- docs/system/combat/03-codex-de-combate-e-condicoes.md
- docs/system/combat/07-01a-tier1-mundo-natural.md
- docs/system/combat/07-01b-tier1-sobrenatural.md
- docs/system/combat/07-02a-tier2-feras-e-gigantes.md
- docs/system/combat/07-02b-tier2-magia-e-morte.md
- docs/system/combat/07-03a-tier3-lendas-vivas.md
- docs/system/combat/07-03b-tier3-horrores-etericos.md
- docs/system/combat/07-04a-tier4-deuses-e-titans.md
- docs/system/combat/13-guia-de-criacao-de-monstros.md
- docs/system/combat/14-compendio-de-habilidades-de-monstros.md
- docs/system/combat/15-compendio-de-habilidades-de-monstros-tier2.md
- docs/system/combat/16-compendio-de-habilidades-de-monstros-tier3.md
- docs/system/combat/17-compendio-de-habilidades-de-monstros-tier4.md
- docs/system/combat/18-tratado-de-dano.md
- docs/system/magic/12-00-codex-de-magia.md
- docs/system/magic/12-01-grimorio-arcano.md
- docs/system/magic/12-02-grimorio-circulo-0.md
- docs/system/magic/12-03-grimorio-circulo-1.md
- docs/system/magic/12-04-grimorio-circulo-2.md
- docs/system/magic/12-05-grimorio-circulo-3.md
- docs/system/magic/12-06-grimorio-circulo-4.md
- docs/system/magic/12-07-grimorio-circulo-5.md
- docs/system/magic/12-08-grimorio-circulo-6.md
- docs/system/magic/12-09-grimorio-circulo-7.md
- docs/system/magic/12-10-grimorio-circulo-8.md
- docs/system/magic/12-11-grimorio-circulo-9.md
- docs/system/magic/12-12-grimorio-circulo-10.md
- docs/system/magic/12-13-codex-expandido-magia-hibrida.md
- docs/system/magic/12-metamagias-as-40-quebras.md
- docs/system/survival/00-mecanicas-fundamentais.md
- docs/system/survival/01-00-regras-gerais.md
- docs/system/survival/01-01-humanos.md
- docs/system/survival/01-02-elfos.md
- docs/system/survival/01-03-anoes.md
- docs/system/survival/01-04-drakari.md
- docs/system/survival/01-05-umbrais.md
- docs/system/survival/01-06-feras.md
- docs/system/survival/01-ancestralidades.md
- docs/system/survival/02a-matriz-fisica.md
- ... 78 more
#### Checkpoints
#### Checkpoint 2026-05-01T01:34:28-03:00
- Done: task record created
- Next: validate generated records and review git diff
- Risks: repository already has unrelated dirty changes; promotion to official docs still needs final model review after main merge
- Improvements: add stricter task-id references in commit messages later
- Model/config: gpt-5.5 xhigh final review; local automation zero-token

#### Checkpoint 2026-05-01T01:34:40-03:00
- Done: Process docs, skill, automation script, hook templates, hook installation, and llms.txt index were created.
- Next: run final validation and inspect generated records
- Risks: post-commit hooks intentionally create follow-up documentation changes after commits
- Improvements: add a pre-commit mode later if the team wants maintenance records inside the same commit
- Model/config: gpt-5.5 xhigh final review; local automation zero-token

#### Checkpoint 2026-05-01T01:34:40-03:00
- Done: Option A maintenance automation implemented and validated.
- Next: use the task ledger for future complex tasks and review promotion candidates after main merges
- Risks: semantic promotion still requires model or human review
- Improvements: consider adding a scheduled Windows Task Scheduler wrapper later
- Model/config: gpt-5.5 xhigh final review; local automation zero-token
<!-- /pandorha-task:20260501-013428-implement-zero-token-maintenance-automation -->
<!-- /pandorha-ledger:completed -->

## Unfinished
<!-- pandorha-ledger:unfinished -->
<!-- pandorha-task:20260615-future-inventory-combat-integration -->
### Future inventory combat integration
- id: 20260615-future-inventory-combat-integration
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-15T11:51:24-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-15T11:51:24-03:00
- branch: docs/inventory-post-delivery-audit
- commit_at_start: 413099a chore(process): record editable inventory commit
- summary: Conectar loadout persistente do inventário aos perfis ativos de combate sem duplicar estado.
- last_change: Fase futura bloqueada por loadout persistente e ações de equipar.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T11:51:24-03:00
- Done: task record created
- Next: Planejar após loadout persistente e equipar/desequipar.
- Risks: Pode criar duas fontes de verdade entre sessão de combate e inventário.
- Improvements: Derivar perfis ativos do loadout persistido.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T11:51:24-03:00
- Done: Fase futura bloqueada por loadout persistente e ações de equipar.
- Next: Integrar somente após uma fonte de verdade de loadout.
- Risks: Não manter seleção local de combate em paralelo ao loadout persistido.
- Improvements: Migrar a sessão de combate para leitura derivada.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-future-inventory-combat-integration -->
<!-- pandorha-task:20260615-future-inventory-starting-equipment -->
### Future starting equipment
- id: 20260615-future-inventory-starting-equipment
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-15T11:51:17-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-15T11:51:17-03:00
- branch: docs/inventory-post-delivery-audit
- commit_at_start: 413099a chore(process): record editable inventory commit
- summary: Conceder equipamento inicial por personagem somente após contrato de criação, catálogo e ownership.
- last_change: Fase futura dependente do contrato completo de ficha e equipamento inicial.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T11:51:17-03:00
- Done: task record created
- Next: Planejar junto ao contrato completo de ficha.
- Risks: Pode duplicar itens ou inventar escolhas de classe e antecedente.
- Improvements: Emitir eventos iniciais pelo mesmo ledger.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T11:51:17-03:00
- Done: Fase futura dependente do contrato completo de ficha e equipamento inicial.
- Next: Planejar após ficha, classe e antecedente aprovados.
- Risks: Não inferir kits iniciais das telas atuais.
- Improvements: Usar eventos determinísticos de concessão.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-future-inventory-starting-equipment -->
<!-- pandorha-task:20260615-future-inventory-potion-belt -->
### Future inventory potion belt
- id: 20260615-future-inventory-potion-belt
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-15T11:51:10-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-15T11:51:10-03:00
- branch: docs/inventory-post-delivery-audit
- commit_at_start: 413099a chore(process): record editable inventory commit
- summary: Criar cinto de poções após contrato de slots rápidos, consumíveis e execução em combate.
- last_change: Fase futura aguardando contrato de slots rápidos e combate.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T11:51:10-03:00
- Done: task record created
- Next: Planejar após integração persistente de inventário e combate.
- Risks: Pode inventar limites e economia sem regra aprovada.
- Improvements: Reutilizar pilhas de consumíveis do ledger.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T11:51:10-03:00
- Done: Fase futura aguardando contrato de slots rápidos e combate.
- Next: Revisar regras antes de planejar.
- Risks: Não tratar item carregado como item pronto para uso.
- Improvements: Separar acesso rápido de ownership.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-future-inventory-potion-belt -->
<!-- pandorha-task:20260615-future-inventory-durability -->
### Future inventory durability
- id: 20260615-future-inventory-durability
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-15T11:51:02-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-15T11:51:02-03:00
- branch: docs/inventory-post-delivery-audit
- commit_at_start: 413099a chore(process): record editable inventory commit
- summary: Integrar desgaste e durabilidade somente após loadout persistente e regras soberanas revisadas.
- last_change: Fase futura bloqueada por loadout persistente e revisão de regras.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T11:51:02-03:00
- Done: task record created
- Next: Revisar regras e planejar após equipar/desequipar.
- Risks: Desgaste afeta inventário, combate, crafting e save.
- Improvements: Usar eventos próprios e Decorator para efeitos.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T11:51:02-03:00
- Done: Fase futura bloqueada por loadout persistente e revisão de regras.
- Next: Planejar após equipar/desequipar estável.
- Risks: Não inferir desgaste a partir do código atual.
- Improvements: Definir ledger específico de durabilidade.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-future-inventory-durability -->
<!-- pandorha-task:20260615-future-inventory-equip-actions -->
### Future inventory equip actions
- id: 20260615-future-inventory-equip-actions
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-15T11:50:55-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-15T11:50:55-03:00
- branch: docs/inventory-post-delivery-audit
- commit_at_start: 413099a chore(process): record editable inventory commit
- summary: Expor equipar e desequipar na UI somente após contrato persistente de loadout.
- last_change: Fase futura dependente do loadout persistente.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T11:50:55-03:00
- Done: task record created
- Next: Planejar depois do loadout persistente.
- Risks: Ações precoces podem divergir do estado de combate.
- Improvements: Usar comandos tipados e Result.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T11:50:55-03:00
- Done: Fase futura dependente do loadout persistente.
- Next: Implementar depois do contrato de loadout por personagem.
- Risks: Não misturar carregar item com equipar item.
- Improvements: Manter comandos separados no ledger.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-future-inventory-equip-actions -->
<!-- pandorha-task:20260615-future-inventory-persistent-loadout -->
### Future persistent inventory loadout
- id: 20260615-future-inventory-persistent-loadout
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-15T11:50:48-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-15T11:50:48-03:00
- branch: docs/inventory-post-delivery-audit
- commit_at_start: 413099a chore(process): record editable inventory commit
- summary: Persistir loadout por personagem sem duplicar itens do ledger e sem antecipar efeitos de combate.
- last_change: Fase futura aguardando contrato próprio de persistência de loadout.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- output/
#### Checkpoints
#### Checkpoint 2026-06-15T11:50:48-03:00
- Done: task record created
- Next: Planejar contrato de loadout persistente após estabilidade do inventário editável.
- Risks: Pode acoplar inventário, equipamento e save.
- Improvements: Reutilizar EquipmentLoadoutService T86.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-15T11:50:48-03:00
- Done: Fase futura aguardando contrato próprio de persistência de loadout.
- Next: Planejar após aceite renderizado e estabilidade do inventário editável.
- Risks: Não persistir estado derivado nem duplicar catálogo.
- Improvements: Reutilizar o ledger e o serviço T86.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260615-future-inventory-persistent-loadout -->
<!-- pandorha-task:20260606-future-pwa-update-install-ui -->
### Future PWA update and install UI
- id: 20260606-future-pwa-update-install-ui
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-06T02:29:38-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-06T02:29:46-03:00
- branch: fix/ui-reachability-regressions
- commit_at_start: 8cbfdb9 chore(process): record combat preview merge
- summary: Planejar manifest com ícones instaláveis e tela segura de atualização de cache após estabilizar o comportamento offline e a automação de rede.
- last_change: Implementação futura bloqueada até existir automação offline confiável e política de atualização do service worker.
#### Files At Start
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/character-creation.md
- package.json
- scripts/.context/plain-english.md
- scripts/.context/scaling-roadmap.md
- scripts/.context/tech-memory.md
- scripts/next_phase_readiness.mjs
- scripts/run_full_quality_gate.mjs
- scripts/test_next_phase_readiness.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/model/navigation.ts
- src/features/camp-hour/.context/plain-english.md
- src/features/camp-hour/.context/scaling-roadmap.md
- src/features/camp-hour/.context/tech-memory.md
- src/features/camp-hour/ui/CampHourPanel.svelte
- output/
- scripts/test_ui_reachability_smoke.mjs
- scripts/ui_reachability_smoke.mjs
#### Checkpoints
#### Checkpoint 2026-06-06T02:29:38-03:00
- Done: task record created
- Next: Aguardar smoke offline confiável e política de atualização do service worker.
- Risks: Uma UI prematura pode promover cache obsoleto ou fluxo de atualização instável.
- Improvements: Automatizar cenários offline e atualização antes da UI.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T02:29:46-03:00
- Done: Implementação futura bloqueada até existir automação offline confiável e política de atualização do service worker.
- Next: Retomar após smoke de rede/offline estável.
- Risks: Cache e instalação podem ficar inconsistentes sem gate renderizado confiável.
- Improvements: Criar cenários automatizados de atualização e fallback offline.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260606-future-pwa-update-install-ui -->
<!-- pandorha-task:20260606-future-social-higher-tiers -->
### Future social higher tiers
- id: 20260606-future-social-higher-tiers
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-06T02:29:23-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-06T02:29:31-03:00
- branch: fix/ui-reachability-regressions
- commit_at_start: 8cbfdb9 chore(process): record combat preview merge
- summary: Planejar favores e quitação de dívida acima de Tier 1 somente após revisão das regras soberanas de fama, influência e facções.
- last_change: Implementação futura bloqueada até revisão das regras soberanas para favores e dívidas acima de Tier 1.
#### Files At Start
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/character-creation.md
- package.json
- scripts/.context/plain-english.md
- scripts/.context/scaling-roadmap.md
- scripts/.context/tech-memory.md
- scripts/next_phase_readiness.mjs
- scripts/run_full_quality_gate.mjs
- scripts/test_next_phase_readiness.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/model/navigation.ts
- src/features/camp-hour/.context/plain-english.md
- src/features/camp-hour/.context/scaling-roadmap.md
- src/features/camp-hour/.context/tech-memory.md
- src/features/camp-hour/ui/CampHourPanel.svelte
- output/
- scripts/test_ui_reachability_smoke.mjs
- scripts/ui_reachability_smoke.mjs
#### Checkpoints
#### Checkpoint 2026-06-06T02:29:23-03:00
- Done: task record created
- Next: Aguardar revisão de docs/system e contratos de Tier superiores.
- Risks: Implementar pela UI atual pode inventar custos e limites não aprovados.
- Improvements: Criar testes de fronteira por Tier antes da UI.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T02:29:31-03:00
- Done: Implementação futura bloqueada até revisão das regras soberanas para favores e dívidas acima de Tier 1.
- Next: Retomar após revisão das regras de fama, influência e facções.
- Risks: Custos e limites ainda não estão aprovados para implementação.
- Improvements: Cobrir fronteiras de Tier com serviços puros antes da UI.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260606-future-social-higher-tiers -->
<!-- pandorha-task:20260606-future-camp-multi-hour -->
### Future camp multi-hour orchestration
- id: 20260606-future-camp-multi-hour
- status: unfinished
- kind: feature
- planned: no
- started_at: 2026-06-06T02:29:14-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-06T02:29:15-03:00
- branch: fix/ui-reachability-regressions
- commit_at_start: 8cbfdb9 chore(process): record combat preview merge
- summary: Planejar orquestração explícita de nova hora e noite de acampamento após estabilizar o fluxo de uma hora, sem sobrecarregar a sessão resolvida atual.
- last_change: Implementação futura bloqueada até existir orquestração explícita de nova hora e revisão das atividades avançadas.
#### Files At Start
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/character-creation.md
- package.json
- scripts/.context/plain-english.md
- scripts/.context/scaling-roadmap.md
- scripts/.context/tech-memory.md
- scripts/next_phase_readiness.mjs
- scripts/run_full_quality_gate.mjs
- scripts/test_next_phase_readiness.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/model/navigation.ts
- src/features/camp-hour/.context/plain-english.md
- src/features/camp-hour/.context/scaling-roadmap.md
- src/features/camp-hour/.context/tech-memory.md
- src/features/camp-hour/ui/CampHourPanel.svelte
- output/
- scripts/test_ui_reachability_smoke.mjs
- scripts/ui_reachability_smoke.mjs
#### Checkpoints
#### Checkpoint 2026-06-06T02:29:14-03:00
- Done: task record created
- Next: Aguardar contrato aprovado de nova hora e atividades avançadas.
- Risks: Mudança prematura pode quebrar save, clocks e separação entre resolução local e restauração.
- Improvements: Reusar o gate qa:ui-reachability no futuro fluxo multi-hora.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-06T02:29:15-03:00
- Done: Implementação futura bloqueada até existir orquestração explícita de nova hora e revisão das atividades avançadas.
- Next: Retomar após aprovação do contrato multi-hora.
- Risks: Exige decisão de estado, save e regras de atividades.
- Improvements: Adicionar testes de transição entre horas antes da UI.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260606-future-camp-multi-hour -->
<!-- /pandorha-ledger:unfinished -->

## Snapshots
<!-- pandorha-ledger:snapshots -->
### 2026-06-15T20:20:25-03:00 - post-commit
- branch: codex/feat/equipment-loadout-save-v7
- commit: 7546693 chore(process): record loadout gate commit
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-15T20:19:35-03:00 - post-commit
- branch: codex/docs/equipment-loadout-save-v7-gate
- commit: 193042d docs(equipment): approve loadout save v7 gate
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-15T12:40:07-03:00 - post-commit
- branch: main
- commit: 34a6351 chore(process): record inventory merge
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-15T12:37:26-03:00 - post-commit
- branch: chore/inventory-rendered-acceptance
- commit: 265cebd fix(ui): complete rendered inventory acceptance
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-15T11:55:18-03:00 - post-commit
- branch: docs/inventory-post-delivery-audit
- commit: e70a723 docs(inventory): record post-delivery audit
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-15T05:40:35-03:00 - post-commit
- branch: feat/inventory-editable-ui
- commit: ef8cc83 feat(inventory): add editable character inventory
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-15T05:21:09-03:00 - post-commit
- branch: feat/save-load-v6-inventory
- commit: 17377e4 feat(save-load): persist inventory ledger in v6
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-15T05:10:35-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: cdde356 feat(inventory): add character-owned inventory ledger
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:13:36-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:10:36-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:10:18-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:09:51-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:09:37-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:09:29-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:09:21-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:09:13-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:09:05-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-12T23:08:57-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-11T14:59:16-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-10T12:37:24-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-10T12:36:40-03:00 - post-commit
- branch: feat/inventory-ownership-core
- commit: 6056566 merge: approve inventory ownership and save v6 gate
- changed_files_count: 6
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- output/
- src/entities/inventory/
- src/features/inventory-management/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-06T06:50:08-03:00 - post-commit
- branch: task/inventory-ownership-save-v6-gate
- commit: 8ed8772 docs(inventory): approve ownership and save v6 gate
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-06T00:31:46-03:00 - post-merge
- branch: feat/metadata-tags-codex
- commit: 1048d3d merge: integrate combat real HP preview
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T20:04:17-03:00 - post-commit
- branch: task/t94-training-incoming-damage-contract
- commit: 08150a3 feat(combat): add real hit points replay
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T19:58:54-03:00 - post-commit
- branch: task/t94-training-incoming-damage-contract
- commit: b982682 feat(combat): add real damage event contract
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T19:58:41-03:00 - post-commit
- branch: task/t94-training-incoming-damage-contract
- commit: e113cb0 fix(app): keep active navigation label legible
- changed_files_count: 11
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- vitest.config.mjs
- docs/process/t100-combat-real-damage-ui-gate.md
- output/
- src/features/combat-encounter/__tests__/combatRealDamageEvent.spec.ts
- src/features/combat-encounter/model/combatRealDamageEvent.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T18:24:51-03:00 - post-commit
- branch: task/t94-training-incoming-damage-contract
- commit: 60b5955 docs(process): add T98 incoming damage gate
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T17:44:00-03:00 - t98-official-incoming-damage-gate
- branch: task/t94-training-incoming-damage-contract
- commit: bf1996d chore(process): record post-commit snapshots
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/t98-official-incoming-damage-gate.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T15:48:53-03:00 - post-commit
- branch: task/t94-training-incoming-damage-contract
- commit: e94a731 chore(security): replace npm audit with offline gate
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T15:48:22-03:00 - post-commit
- branch: task/t94-training-incoming-damage-contract
- commit: e48e55c feat(combat): add training hp terminal state
- changed_files_count: 10
#### Changed Files
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package.json
- scripts/run_full_quality_gate.mjs
- output/
- scripts/dependency_security_gate.mjs
- scripts/refresh_dependency_advisories.mjs
- scripts/test_dependency_security_gate.mjs
- security/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T15:43:33-03:00 - dependency-advisory-refresh
- branch: task/t94-training-incoming-damage-contract
- commit: fd9a314 chore(process): record t94 post-commit snapshot
- changed_files_count: 20
#### Changed Files
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/combat-training.md
- package.json
- scripts/run_full_quality_gate.mjs
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatTrainingDefenderHitPoints.spec.ts
- src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- output/
- scripts/dependency_security_gate.mjs
- scripts/refresh_dependency_advisories.mjs
- scripts/test_dependency_security_gate.mjs
- security/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T13:28:04-03:00 - offline-dependency-security-gate
- branch: task/t94-training-incoming-damage-contract
- commit: fd9a314 chore(process): record t94 post-commit snapshot
- changed_files_count: 20
#### Changed Files
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/combat-training.md
- package.json
- scripts/run_full_quality_gate.mjs
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatTrainingDefenderHitPoints.spec.ts
- src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- output/
- scripts/dependency_security_gate.mjs
- scripts/refresh_dependency_advisories.mjs
- scripts/test_dependency_security_gate.mjs
- security/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T12:37:08-03:00 - t97-training-defender-hp-terminal
- branch: task/t94-training-incoming-damage-contract
- commit: fd9a314 chore(process): record t94 post-commit snapshot
- changed_files_count: 13
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatTrainingDefenderHitPoints.spec.ts
- src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T11:49:50-03:00 - post-commit
- branch: task/t94-training-incoming-damage-contract
- commit: 12b7e3c feat(combat): add training incoming damage core
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-05T10:43:13-03:00 - t94-t96-training-incoming-damage-core-final
- branch: task/t94-training-incoming-damage-contract
- commit: 85a24e9 chore(process): record t93 post-commit snapshot
- changed_files_count: 20
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/combatTrainingDefenderHitPoints.spec.ts
- src/features/combat-encounter/model/combatTrainingDefenderHitPoints.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T20:47:38-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 1d93e2c chore(process): record t93 post-commit snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T20:47:03-03:00 - t93-post-commit
- branch: feat/metadata-tags-codex
- commit: bc48b03 docs(process): add documentation promotion draft
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T20:46:50-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: bc48b03 docs(process): add documentation promotion draft
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T20:35:58-03:00 - documentation-promotion-draft
- branch: feat/metadata-tags-codex
- commit: 4c8863a chore(process): record t92 post-commit snapshot
- changed_files_count: 9
#### Changed Files
- docs/architecture/feature_state_machines.md
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/documentation-audit.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- llms.txt
- docs/process/documentation-promotion-draft.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T20:06:45-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: d634ec7 feat(combat): resolve training enemy attack
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T12:23:56-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:43:59-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:43:46-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:43:28-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:43:10-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:42:07-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:41:46-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:41:20-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:40:44-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:40:24-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:40:01-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:39:41-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:39:23-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:39:05-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:38:12-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:37:47-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:37:16-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:36:43-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:36:26-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:36:10-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:54-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:38-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:22-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:07-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:34:51-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:34:33-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:34:16-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 88e4479 chore(process): record post-merge snapshot
- changed_files_count: 23
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- output/
- src/features/combat-encounter/__tests__/CombatTrainingEnemyAttackService.spec.ts
- src/features/combat-encounter/domain/CombatTrainingEnemyAttackService.ts
- src/features/combat-encounter/model/combatTrainingEnemyAttack.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T12:41:24-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: d32554b chore(process): record default branch merge promotion
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T07:57:12-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 4d36e0d feat(combat): show equipped defense profile
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T07:29:57-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: ecf5573 chore(deps): restore strict quality gate
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T07:22:21-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 7f04861 chore(process): record t90 post-commit snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T07:21:39-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: c0b35bb chore(process): record t90 final snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T07:21:17-03:00 - t90-documentation-audit-final
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 54a16a3 chore(process): add documentation audit automation
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T07:21:11-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 54a16a3 chore(process): add documentation audit automation
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T00:21:51-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: fd20c0d chore(process): record t89 final snapshot
- changed_files_count: 14
#### Changed Files
- docs/architecture/feature_state_machines.md
- docs/conventions/tooling-relevance-map.md
- "docs/ferramentas do usuario/prompt inicial para novas features.md"
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- llms.txt
- package.json
- scripts/run_full_quality_gate.mjs
- docs/process/documentation-audit.md
- output/
- scripts/.context/
- scripts/audit_docs.mjs
- scripts/test_audit_docs.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T00:16:04-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: fd20c0d chore(process): record t89 final snapshot
- changed_files_count: 14
#### Changed Files
- docs/architecture/feature_state_machines.md
- docs/conventions/tooling-relevance-map.md
- "docs/ferramentas do usuario/prompt inicial para novas features.md"
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- llms.txt
- package.json
- scripts/run_full_quality_gate.mjs
- docs/process/documentation-audit.md
- output/
- scripts/.context/
- scripts/audit_docs.mjs
- scripts/test_audit_docs.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:35:43-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: fd20c0d chore(process): record t89 final snapshot
- changed_files_count: 14
#### Changed Files
- docs/architecture/feature_state_machines.md
- docs/conventions/tooling-relevance-map.md
- "docs/ferramentas do usuario/prompt inicial para novas features.md"
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- llms.txt
- package.json
- scripts/run_full_quality_gate.mjs
- docs/process/documentation-audit.md
- output/
- scripts/.context/
- scripts/audit_docs.mjs
- scripts/test_audit_docs.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:32:35-03:00 - documentation-audit-final
- branch: task/t73-t76-npc-relationship-save-ui
- commit: fd20c0d chore(process): record t89 final snapshot
- changed_files_count: 14
#### Changed Files
- docs/architecture/feature_state_machines.md
- docs/conventions/tooling-relevance-map.md
- "docs/ferramentas do usuario/prompt inicial para novas features.md"
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- llms.txt
- package.json
- scripts/run_full_quality_gate.mjs
- docs/process/documentation-audit.md
- output/
- scripts/.context/
- scripts/audit_docs.mjs
- scripts/test_audit_docs.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:31:03-03:00 - documentation-audit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: fd20c0d chore(process): record t89 final snapshot
- changed_files_count: 14
#### Changed Files
- docs/architecture/feature_state_machines.md
- docs/conventions/tooling-relevance-map.md
- "docs/ferramentas do usuario/prompt inicial para novas features.md"
- docs/process/automation-spec.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- llms.txt
- package.json
- scripts/run_full_quality_gate.mjs
- docs/process/documentation-audit.md
- output/
- scripts/.context/
- scripts/audit_docs.mjs
- scripts/test_audit_docs.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:10:00-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 2eea6d8 chore(process): record t89 final snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:09:38-03:00 - t89-combat-target-defenses
- branch: task/t73-t76-npc-relationship-save-ui
- commit: e3ad436 feat(combat): apply training target defenses
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:09:24-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: e3ad436 feat(combat): apply training target defenses
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:08:03-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 10808df chore(process): record t88 final snapshot
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
- output/
- src/features/combat-encounter/__tests__/combatTrainingTargetCatalog.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:07:53-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 10808df chore(process): record t88 final snapshot
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
- output/
- src/features/combat-encounter/__tests__/combatTrainingTargetCatalog.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:07:45-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 10808df chore(process): record t88 final snapshot
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
- output/
- src/features/combat-encounter/__tests__/combatTrainingTargetCatalog.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:07:32-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 10808df chore(process): record t88 final snapshot
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
- output/
- src/features/combat-encounter/__tests__/combatTrainingTargetCatalog.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:07:25-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 10808df chore(process): record t88 final snapshot
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
- output/
- src/features/combat-encounter/__tests__/combatTrainingTargetCatalog.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:07:18-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 10808df chore(process): record t88 final snapshot
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
- output/
- src/features/combat-encounter/__tests__/combatTrainingTargetCatalog.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T23:07:10-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 10808df chore(process): record t88 final snapshot
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
- output/
- src/features/combat-encounter/__tests__/combatTrainingTargetCatalog.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T22:18:08-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 129c341 chore(process): record t88 final snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T22:17:49-03:00 - t88-weapon-dice-roll-contract
- branch: task/t73-t76-npc-relationship-save-ui
- commit: d50aa6c feat(combat): roll equipped weapon damage dice
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T22:17:44-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: d50aa6c feat(combat): roll equipped weapon damage dice
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T18:20:45-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 6591749 chore(process): record t87 final snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T18:19:19-03:00 - t87-combat-equipped-weapon-ui
- branch: task/t73-t76-npc-relationship-save-ui
- commit: c5d457f feat(combat): add equipped weapon selector
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T18:19:13-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: c5d457f feat(combat): add equipped weapon selector
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T12:33:32-03:00 - t86-equipment-loadout-core
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 35de61f feat(equipment): add loadout core
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T12:33:15-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 35de61f feat(equipment): add loadout core
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T12:17:20-03:00 - d01-1-security-audit-gate-recovery
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 0a08df3 chore(deps): apply safe audit fixes
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T12:17:12-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 0a08df3 chore(deps): apply safe audit fixes
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T11:59:10-03:00 - t85-equipment-weapon-attack-profile
- branch: task/t73-t76-npc-relationship-save-ui
- commit: b5b7b2c feat(equipment): add weapon attack profiles
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T11:59:01-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: b5b7b2c feat(equipment): add weapon attack profiles
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T11:38:17-03:00 - t84-social-rendered-browser-automation-evaluation
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 0d78586 docs(process): record social browser automation decision
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T11:38:09-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 0d78586 docs(process): record social browser automation decision
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T07:03:43-03:00 - t83-social-retaliation-clock-advance-gate
- branch: task/t73-t76-npc-relationship-save-ui
- commit: ac33fa9 feat(social-retaliation): gate clock advancement causes
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T07:03:29-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: ac33fa9 feat(social-retaliation): gate clock advancement causes
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T06:50:32-03:00 - t82-social-relations-npc-filters
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 0dcf427 feat(social-relations): add npc relationship filters
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T06:49:55-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 0dcf427 feat(social-relations): add npc relationship filters
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T05:13:49-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 28a67e7 chore(process): record t81 post-commit snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T05:12:52-03:00 - t81-post-t80-handoff-baseline
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 3619643 docs(process): record post-t80 baseline handoff
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-01T05:12:41-03:00 - post-commit
- branch: task/t73-t76-npc-relationship-save-ui
- commit: 3619643 docs(process): record post-t80 baseline handoff
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T21:10:45-03:00 - post-commit
- branch: task/t71-social-retaliation-clock-advance
- commit: 0759766 feat(social): add retaliation clock advance service
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T20:42:07-03:00 - post-commit
- branch: task/t66-t70-social-roadmap
- commit: 0038419 feat(social): implement T66-T70 social roadmap
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T20:41:41-03:00 - post-commit
- branch: task/t66-t70-social-roadmap
- commit: 6f927a1 ï»¿feat(social): implement T66-T70 social roadmap
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T19:12:14-03:00 - post-commit
- branch: task/t66-t70-social-roadmap
- commit: 4e60a42 chore(process): record t65 post-commit snapshot
- changed_files_count: 55
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/social-encounter.md
- docs/user/social-relations.md
- package.json
- scripts/dialogue_seed_smoke.mjs
- scripts/run_full_quality_gate.mjs
- scripts/social_browser_smoke.mjs
- scripts/test_dialogue_seed_smoke.mjs
- scripts/test_social_browser_smoke.mjs
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/app/App.svelte
- src/app/model/socialPressurePenaltySession.spec.ts
- src/app/model/socialPressurePenaltySession.ts
- src/app/model/socialRelationsSession.spec.ts
- src/app/model/socialRelationsSession.ts
- src/entities/clock/.context/plain-english.md
- src/entities/clock/.context/scaling-roadmap.md
- src/entities/clock/.context/tech-memory.md
- src/entities/dialogue-tree/.context/plain-english.md
- src/entities/dialogue-tree/.context/scaling-roadmap.md
- src/entities/dialogue-tree/.context/tech-memory.md
- src/entities/dialogue-tree/__tests__/DialogueTreeCatalogService.spec.ts
- src/entities/dialogue-tree/model/dialogueTreeCatalog.ts
- src/entities/dialogue-tree/model/dialogueTreeSchema.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/DialogueTraversalService.spec.ts
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/__tests__/socialEncounterConsequences.spec.ts
- src/features/social-encounter/domain/DialogueTraversalService.ts
- src/features/social-encounter/model/dialogueTraversalSchemas.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
- src/features/social-encounter/model/socialEncounterConsequences.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- src/features/social-relations/.context/plain-english.md
- src/features/social-relations/.context/scaling-roadmap.md
- ... 15 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T15:34:28-03:00 - post-commit
- branch: task/social-dialogue-seed-pipeline
- commit: a8a2a4d test(dialogue): add seed contract smoke
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T15:17:13-03:00 - post-commit
- branch: task/social-dialogue-official-seed
- commit: 87a1f5c feat(dialogue): add captain social tree
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T09:13:55-03:00 - post-commit
- branch: task-dialogue-option-availability
- commit: af76c96 chore(process): record t63 post-commit snapshot
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T09:13:19-03:00 - post-commit
- branch: task-dialogue-option-availability
- commit: a7c6443 feat(social): apply pressure fame consequences
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T04:09:24-03:00 - post-commit
- branch: task-dialogue-option-availability
- commit: 5d1b3ef test(social): add social browser smoke
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T04:01:22-03:00 - post-t61-commit
- branch: task-dialogue-option-availability
- commit: e83ed47 feat(social): record dialogue consequence metadata
- changed_files_count: 2
#### Changed Files
- docs/process/task-ledger.md
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T04:01:12-03:00 - post-commit
- branch: task-dialogue-option-availability
- commit: e83ed47 feat(social): record dialogue consequence metadata
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-26T03:28:31-03:00 - t61-social-consequences-v1
- branch: task-dialogue-option-availability
- commit: 5593b32 feat(dialogue): cobre informante e opcoes bloqueadas
- changed_files_count: 12
#### Changed Files
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/social-encounter.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/socialEncounterConsequences.spec.ts
- src/features/social-encounter/model/socialEncounterConsequences.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-25T20:15:11-03:00 - post-commit
- branch: task-dialogue-option-availability
- commit: 5593b32 feat(dialogue): cobre informante e opcoes bloqueadas
- changed_files_count: 1
#### Changed Files
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-25T20:14:21-03:00 - t60-social-dialogue-qa-refresh
- branch: task-dialogue-option-availability
- commit: 4a80ecd docs(dialogue): atualiza qa da arvore social
- changed_files_count: 22
#### Changed Files
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/social-encounter.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
- src/entities/dialogue-tree/.context/plain-english.md
- src/entities/dialogue-tree/.context/scaling-roadmap.md
- src/entities/dialogue-tree/.context/tech-memory.md
- src/entities/dialogue-tree/__tests__/DialogueTreeCatalogService.spec.ts
- src/entities/dialogue-tree/model/dialogueTreeCatalog.ts
- src/entities/dialogue-tree/model/dialogueTreeSchema.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/DialogueTraversalService.spec.ts
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/domain/DialogueTraversalService.ts
- src/features/social-encounter/model/dialogueTraversalSchemas.ts
- src/features/social-encounter/model/dialogueTraversalTypes.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- output/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-25T19:50:59-03:00 - t59-training-informant-dialogue-tree
- branch: task-dialogue-option-availability
- commit: 4a80ecd docs(dialogue): atualiza qa da arvore social
- changed_files_count: 17
#### Changed Files
- docs/process/task-ledger.md
- src/entities/dialogue-tree/.context/plain-english.md
- src/entities/dialogue-tree/.context/scaling-roadmap.md
- src/entities/dialogue-tree/.context/tech-memory.md
- src/entities/dialogue-tree/__tests__/DialogueTreeCatalogService.spec.ts
- src/entities/dialogue-tree/model/dialogueTreeCatalog.ts
- src/entities/dialogue-tree/model/dialogueTreeSchema.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/DialogueTraversalService.spec.ts
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/domain/DialogueTraversalService.ts
- src/features/social-encounter/model/dialogueTraversalSchemas.ts
- src/features/social-encounter/model/dialogueTraversalTypes.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-24T04:51:17-03:00 - dialogue-option-availability
- branch: task-dialogue-option-availability
- commit: 4a80ecd docs(dialogue): atualiza qa da arvore social
- changed_files_count: 17
#### Changed Files
- docs/process/task-ledger.md
- src/entities/dialogue-tree/.context/plain-english.md
- src/entities/dialogue-tree/.context/scaling-roadmap.md
- src/entities/dialogue-tree/.context/tech-memory.md
- src/entities/dialogue-tree/__tests__/DialogueTreeCatalogService.spec.ts
- src/entities/dialogue-tree/model/dialogueTreeCatalog.ts
- src/entities/dialogue-tree/model/dialogueTreeSchema.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/DialogueTraversalService.spec.ts
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/domain/DialogueTraversalService.ts
- src/features/social-encounter/model/dialogueTraversalSchemas.ts
- src/features/social-encounter/model/dialogueTraversalTypes.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-24T04:13:48-03:00 - dialogue-tree-qa-docs
- branch: task/dialogue-tree-qa-docs
- commit: e7223d8 feat(dialogue): mostra arvore na ui social
- changed_files_count: 5
#### Changed Files
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/social-encounter.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-24T04:06:33-03:00 - dialogue-tree-ui
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-24T03:07:44-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T14:24:35-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T13:37:18-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T08:53:41-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T08:53:21-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T08:53:11-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T08:53:05-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T08:52:59-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-22T18:14:01-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-22T16:58:09-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-22T12:24:27-03:00 - post-commit
- branch: task/dialogue-tree-ui
- commit: f795942 feat(dialogue): adiciona navegacao da arvore social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueTreeView.spec.ts
- src/features/social-encounter/model/socialDialogueTreeView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-21T15:53:09-03:00 - dialogue-traversal-core
- branch: task/dialogue-traversal-core
- commit: 915bdfa feat(dialogue): adiciona catalogo de arvore social
- changed_files_count: 14
#### Changed Files
- docs/process/task-ledger.md
- src/entities/social-encounter/.context/tech-memory.md
- src/entities/social-encounter/model/socialEncounterPersistenceSchema.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/model/socialEncounterSchemas.ts
- vitest.config.mjs
- src/features/social-encounter/__tests__/DialogueTraversalService.spec.ts
- src/features/social-encounter/domain/DialogueTraversalService.ts
- src/features/social-encounter/model/dialogueTraversalSchemas.ts
- src/features/social-encounter/model/dialogueTraversalTypes.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-21T12:10:08-03:00 - dialogue-tree-schema
- branch: task/dialogue-tree-schema
- commit: 424d0ea docs(social): atualiza qa de escolhas sociais
- changed_files_count: 3
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/dialogue-tree/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-21T09:40:43-03:00 - social-dialogue-qa-docs
- branch: task/social-dialogue-qa-docs
- commit: 6e63531 feat(social): registra argumento nos logs
- changed_files_count: 5
#### Changed Files
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- docs/user/social-encounter.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-21T09:31:53-03:00 - social-choice-log-worldstate
- branch: task/social-choice-log-worldstate
- commit: 513c0af feat(social): adiciona escolhas de argumento na ui
- changed_files_count: 8
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/scaling-roadmap.md
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/SocialEncounterService.spec.ts
- src/features/social-encounter/__tests__/socialEncounterPersistence.spec.ts
- src/features/social-encounter/domain/SocialEncounterService.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-21T09:23:01-03:00 - social-choice-ui
- branch: task/social-choice-ui
- commit: 697cc08 feat(social): adiciona perfil de escolha de dialogo
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/socialEncounterView.spec.ts
- src/features/social-encounter/model/socialEncounterView.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-21T03:59:08-03:00 - social-choice-appeal-core
- branch: task/social-choice-appeal-core
- commit: 259ba58 feat(social): registra consequencias no worldstate
- changed_files_count: 9
#### Changed Files
- docs/process/task-ledger.md
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialDialogueChoiceProfile.spec.ts
- src/features/social-encounter/model/socialDialogueChoiceProfile.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-21T02:38:57-03:00 - social-worldstate-consequences
- branch: task/social-worldstate-consequences
- commit: 1be7433 feat(social): adiciona catalogo de escolhas de dialogo
- changed_files_count: 14
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
- vitest.config.mjs
- src/features/social-encounter/__tests__/socialEncounterConsequences.spec.ts
- src/features/social-encounter/model/socialEncounterConsequences.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T18:56:20-03:00 - dialogue-choice-catalog
- branch: task/dialogue-choice-catalog
- commit: d9d11fa feat(social): conecta apelo social ao personagem
- changed_files_count: 3
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/dialogue-choice/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T18:48:49-03:00 - social-appeal-character-ui
- branch: task/social-appeal-character-ui
- commit: 3a04a2c feat(social): adiciona resolucao de apelo social
- changed_files_count: 13
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/socialEncounterView.spec.ts
- src/features/social-encounter/model/socialEncounterView.ts
- src/features/social-encounter/ui/SocialEncounterPanel.svelte
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T18:35:29-03:00 - social-appeal-resolution
- branch: task/social-appeal-resolution
- commit: ff87a17 chore(qa): atualiza smoke social pos negociacao
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/index.ts
- src/features/social-encounter/model-api.ts
- vitest.config.mjs
- src/features/social-encounter/__tests__/SocialAppealResolutionService.spec.ts
- src/features/social-encounter/domain/SocialAppealResolutionService.ts
- src/features/social-encounter/model/socialAppealResolutionSchemas.ts
- src/features/social-encounter/model/socialAppealResolutionTypes.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T18:27:19-03:00 - social-qa-refresh
- branch: task/social-qa-refresh
- commit: 487ba69 feat(social): adiciona ui de negociacao social
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/vertical-slice-qa.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T18:18:26-03:00 - social-encounter-ui
- branch: task/social-encounter-ui
- commit: f70edb3 feat(save-load): persiste negociacao social no snapshot v4
- changed_files_count: 20
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- public/pandorha-sw.js
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/SocialEncounterService.spec.ts
- src/features/social-encounter/index.ts
- vitest.config.mjs
- docs/user/social-encounter.md
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/__tests__/socialEncounterPersistence.spec.ts
- src/features/social-encounter/__tests__/socialEncounterView.spec.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/model/socialEncounterPersistence.ts
- src/features/social-encounter/model/socialEncounterView.ts
- src/features/social-encounter/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T13:28:18-03:00 - social-encounter-ui-browser-validated-gate-pending
- branch: task/social-encounter-ui
- commit: f70edb3 feat(save-load): persiste negociacao social no snapshot v4
- changed_files_count: 20
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- public/pandorha-sw.js
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/features/social-encounter/.context/plain-english.md
- src/features/social-encounter/.context/scaling-roadmap.md
- src/features/social-encounter/.context/tech-memory.md
- src/features/social-encounter/__tests__/SocialEncounterService.spec.ts
- src/features/social-encounter/index.ts
- vitest.config.mjs
- docs/user/social-encounter.md
- src/app/model/socialEncounterSession.spec.ts
- src/app/model/socialEncounterSession.ts
- src/features/social-encounter/__tests__/socialEncounterPersistence.spec.ts
- src/features/social-encounter/__tests__/socialEncounterView.spec.ts
- src/features/social-encounter/model-api.ts
- src/features/social-encounter/model/socialEncounterPersistence.ts
- src/features/social-encounter/model/socialEncounterView.ts
- src/features/social-encounter/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T13:06:54-03:00 - save-load-v4-social-encounter
- branch: task/save-load-v4-social-encounter
- commit: feb3c1b feat(social): adiciona nucleo de encontro social
- changed_files_count: 27
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/workers/pandorhaDatabase.worker.ts
- src/features/save-load/.context/plain-english.md
- src/features/save-load/.context/scaling-roadmap.md
- src/features/save-load/.context/tech-memory.md
- src/features/save-load/__tests__/SaveLoadService.spec.ts
- src/features/save-load/__tests__/SqliteSaveSnapshotService.spec.ts
- src/features/save-load/domain/SaveLoadService.ts
- src/features/save-load/domain/SqliteSaveSnapshotService.ts
- src/features/save-load/index.ts
- src/features/save-load/model/saveLoadSchemas.ts
- src/features/save-load/model/saveLoadTypes.ts
- src/features/save-load/model/saveSnapshotTypes.ts
- src/shared/persistence/.context/tech-memory.md
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/rpc/__tests__/BrowserWorkerBridge.spec.ts
- src/shared/rpc/__tests__/RpcContract.spec.ts
- src/shared/rpc/model/rpcSchemas.ts
- drizzle/0005_perfect_sinister_six.sql
- drizzle/meta/0005_snapshot.json
- src/entities/social-encounter/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T11:59:13-03:00 - social-encounter-core
- branch: task/social-encounter-core
- commit: 0ec9ed8 feat(npc): adiciona catalogo base
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/features/social-encounter/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T09:25:17-03:00 - npc-schema
- branch: task/npc-schema
- commit: c180ec4 chore(qa): adiciona smoke da vertical slice
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/npc/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-20T07:16:17-03:00 - vertical-slice-qa
- branch: task/vertical-slice-qa
- commit: fe69ecc feat(pwa): adiciona smoke offline
- changed_files_count: 6
#### Changed Files
- docs/process/task-ledger.md
- package.json
- scripts/run_full_quality_gate.mjs
- docs/process/vertical-slice-qa.md
- scripts/test_vertical_slice_smoke.mjs
- scripts/vertical_slice_smoke.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T22:25:55-03:00 - pwa-offline-smoke
- branch: task/pwa-offline-smoke
- commit: 008bf37 feat(social): adiciona ui de relacoes
- changed_files_count: 11
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- vitest.config.mjs
- docs/user/offline-smoke.md
- public/
- src/app/model/pwaOfflineRegistration.ts
- src/app/model/pwaStatusView.spec.ts
- src/app/model/pwaStatusView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T21:46:25-03:00 - social-relations-ui
- branch: task/social-relations-ui
- commit: 663dcfa feat(save-load): evolui snapshot social para v3
- changed_files_count: 8
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/app/workers/pandorhaDatabase.worker.ts
- vitest.config.mjs
- docs/user/social-relations.md
- src/app/model/socialRelationsSession.ts
- src/features/social-relations/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T21:26:26-03:00 - save-load-v3-social
- branch: task/save-load-v3-social
- commit: bf8c263 feat(social): adiciona service de standing
- changed_files_count: 21
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/features/save-load/.context/plain-english.md
- src/features/save-load/.context/scaling-roadmap.md
- src/features/save-load/.context/tech-memory.md
- src/features/save-load/__tests__/SaveLoadService.spec.ts
- src/features/save-load/__tests__/SqliteSaveSnapshotService.spec.ts
- src/features/save-load/domain/SaveLoadService.ts
- src/features/save-load/domain/SqliteSaveSnapshotService.ts
- src/features/save-load/model/saveLoadSchemas.ts
- src/features/save-load/model/saveLoadTypes.ts
- src/features/save-load/model/saveSnapshotTypes.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/rpc/__tests__/BrowserWorkerBridge.spec.ts
- src/shared/rpc/__tests__/RpcContract.spec.ts
- src/shared/rpc/model/rpcSchemas.ts
- drizzle/0004_abnormal_luke_cage.sql
- drizzle/meta/0004_snapshot.json
- src/entities/faction/__tests__/FactionMigration.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T19:17:20-03:00 - social-standing-service
- branch: task/social-standing-service
- commit: f6c2518 feat(faction): adiciona catalogo social base
- changed_files_count: 3
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/features/social-standing/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T19:06:19-03:00 - faction-standing-schema
- branch: task/faction-standing-schema
- commit: 436ef4d feat(camp): adiciona ui de acampamento
- changed_files_count: 3
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/faction/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T18:43:17-03:00 - camp-ui
- branch: task/camp-ui
- commit: 7029214 feat(save-load): adiciona snapshot v2 de acampamento
- changed_files_count: 19
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/features/camp-hour/.context/plain-english.md
- src/features/camp-hour/.context/scaling-roadmap.md
- src/features/camp-hour/.context/tech-memory.md
- src/features/camp-hour/index.ts
- src/features/save-load/.context/plain-english.md
- src/features/save-load/.context/scaling-roadmap.md
- src/features/save-load/.context/tech-memory.md
- vitest.config.mjs
- docs/user/camp-training.md
- src/app/model/campSession.ts
- src/features/camp-hour/__tests__/campHourView.spec.ts
- src/features/camp-hour/model/campHourView.ts
- src/features/camp-hour/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T18:30:00-03:00 - camp-ui-resume
- branch: task/camp-ui
- commit: 7029214 feat(save-load): adiciona snapshot v2 de acampamento
- changed_files_count: 19
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/features/camp-hour/.context/plain-english.md
- src/features/camp-hour/.context/scaling-roadmap.md
- src/features/camp-hour/.context/tech-memory.md
- src/features/camp-hour/index.ts
- src/features/save-load/.context/plain-english.md
- src/features/save-load/.context/scaling-roadmap.md
- src/features/save-load/.context/tech-memory.md
- vitest.config.mjs
- docs/user/camp-training.md
- src/app/model/campSession.ts
- src/features/camp-hour/__tests__/campHourView.spec.ts
- src/features/camp-hour/model/campHourView.ts
- src/features/camp-hour/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T12:40:02-03:00 - camp-ui-paused-build-approval-limit
- branch: task/camp-ui
- commit: 7029214 feat(save-load): adiciona snapshot v2 de acampamento
- changed_files_count: 19
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/features/camp-hour/.context/plain-english.md
- src/features/camp-hour/.context/scaling-roadmap.md
- src/features/camp-hour/.context/tech-memory.md
- src/features/camp-hour/index.ts
- src/features/save-load/.context/plain-english.md
- src/features/save-load/.context/scaling-roadmap.md
- src/features/save-load/.context/tech-memory.md
- vitest.config.mjs
- docs/user/camp-training.md
- src/app/model/campSession.ts
- src/features/camp-hour/__tests__/campHourView.spec.ts
- src/features/camp-hour/model/campHourView.ts
- src/features/camp-hour/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T12:29:07-03:00 - save-load-v2-camp
- branch: task/save-load-v2-camp
- commit: feab80f feat(camp): adiciona resolucao de hora
- changed_files_count: 20
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/workers/pandorhaDatabase.worker.ts
- src/features/save-load/__tests__/SaveLoadService.spec.ts
- src/features/save-load/__tests__/SqliteSaveSnapshotService.spec.ts
- src/features/save-load/domain/SaveLoadService.ts
- src/features/save-load/domain/SqliteSaveSnapshotService.ts
- src/features/save-load/index.ts
- src/features/save-load/model/saveLoadSchemas.ts
- src/features/save-load/model/saveLoadTypes.ts
- src/features/save-load/model/saveSnapshotTypes.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/rpc/__tests__/BrowserWorkerBridge.spec.ts
- src/shared/rpc/__tests__/RpcContract.spec.ts
- src/shared/rpc/model/rpcSchemas.ts
- drizzle/0003_public_tyger_tiger.sql
- drizzle/meta/0003_snapshot.json
- src/entities/camp-session/__tests__/CampSessionMigration.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-19T12:14:01-03:00 - camp-hour-service
- branch: task/camp-hour-service
- commit: 151e295 feat(camp): adiciona modelos iniciais de acampamento
- changed_files_count: 4
#### Changed Files
- docs/process/task-ledger.md
- src/shared/game-rules.ts
- vitest.config.mjs
- src/features/camp-hour/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T21:23:25-03:00 - camp-activity-catalog
- branch: task/camp-activity-catalog
- commit: 3e4885c feat(clock): adiciona persistencia sqlite
- changed_files_count: 4
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/camp-activity/
- src/entities/camp-session/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T21:16:39-03:00 - clock-persistence
- branch: task/clock-persistence
- commit: fc362b9 feat(clock): adiciona nucleo de relogios
- changed_files_count: 15
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/entities/clock/.context/plain-english.md
- src/entities/clock/.context/scaling-roadmap.md
- src/entities/clock/.context/tech-memory.md
- src/entities/clock/index.ts
- src/entities/clock/model/clockTypes.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/model/sqliteMigrations.ts
- drizzle/0002_true_cable.sql
- drizzle/meta/0002_snapshot.json
- src/entities/clock/__tests__/ClockMigration.spec.ts
- src/entities/clock/__tests__/DrizzleClockRepository.spec.ts
- src/entities/clock/infrastructure/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T21:06:53-03:00 - clock-schema-core
- branch: task/clock-schema-core
- commit: 39b88cd feat(save-load): adiciona ui de save local
- changed_files_count: 3
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/clock/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T20:36:08-03:00 - save-load-ui
- branch: task/save-load-ui
- commit: 1e29e8a feat(rpc): adiciona browser worker bridge real
- changed_files_count: 20
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/characterSession.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/features/save-load/.context/plain-english.md
- src/features/save-load/.context/scaling-roadmap.md
- src/features/save-load/.context/tech-memory.md
- src/features/save-load/index.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- vitest.config.mjs
- src/app/model/characterSession.spec.ts
- src/app/model/saveLoadSession.ts
- src/app/workers/
- src/features/save-load/__tests__/saveLoadView.spec.ts
- src/features/save-load/model/saveLoadView.ts
- src/features/save-load/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T20:21:24-03:00 - browser-worker-bridge
- branch: task/browser-worker-bridge
- commit: e4f49b3 feat(save-load): adiciona comandos de snapshot no worker
- changed_files_count: 11
#### Changed Files
- docs/process/task-ledger.md
- src/shared/rpc/.context/plain-english.md
- src/shared/rpc/.context/scaling-roadmap.md
- src/shared/rpc/.context/tech-memory.md
- src/shared/rpc/index.ts
- src/shared/rpc/model/rpcTypes.ts
- src/shared/rpc/testing/FakeWorkerBridge.ts
- vitest.config.mjs
- src/shared/rpc/__tests__/BrowserWorkerBridge.spec.ts
- src/shared/rpc/infrastructure/
- src/shared/rpc/model/workerBridge.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T20:13:18-03:00 - save-load-worker-commands
- branch: task/save-load-worker-commands
- commit: da3fa41 feat(save-load): adiciona service de snapshot
- changed_files_count: 13
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/features/save-load/.context/plain-english.md
- src/features/save-load/.context/scaling-roadmap.md
- src/features/save-load/.context/tech-memory.md
- src/features/save-load/index.ts
- src/features/save-load/model/saveLoadSchemas.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- vitest.config.mjs
- src/features/save-load/__tests__/SqliteSaveSnapshotService.spec.ts
- src/features/save-load/domain/SqliteSaveSnapshotService.ts
- src/features/save-load/model/saveSnapshotTypes.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T19:34:25-03:00 - save-load-service
- branch: task/save-load-service
- commit: 09af2d8 chore(deps): atualiza svelte e devalue
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/features/save-load/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-15T19:26:43-03:00 - dependency-security-refresh
- branch: task/dependency-security-refresh
- commit: 6c6297d feat(persistence): adiciona bootstrap sqlite opfs
- changed_files_count: 3
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package-lock.json
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-14T11:39:45-03:00 - sqlite-opfs-bootstrap
- branch: task/sqlite-opfs-bootstrap
- commit: f904516 feat(rpc): adiciona contrato de save load
- changed_files_count: 8
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- vitest.config.mjs
- drizzle/0001_crazy_wallop.sql
- drizzle/meta/0001_snapshot.json
- src/shared/persistence/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-14T11:25:16-03:00 - save-rpc-contract
- branch: task/save-rpc-contract
- commit: b1a0606 feat(world-state): adiciona key-value core
- changed_files_count: 3
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/shared/rpc/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-14T06:58:50-03:00 - world-state-kv
- branch: task/world-state-kv
- commit: 2338a1b fix(app): corrige texto da aba exploracao
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/world-state/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-14T06:39:27-03:00 - fix-exploration-label-encoding
- branch: task/hexcrawl-map-ui
- commit: e79e6dd feat(hexcrawl): adiciona mapa minimo de exploracao
- changed_files_count: 1
#### Changed Files
- src/app/model/navigation.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-14T06:34:40-03:00 - hexcrawl-map-ui
- branch: task/hexcrawl-map-ui
- commit: 335c1b7 feat(hexcrawl): adiciona movimento axial minimo
- changed_files_count: 15
#### Changed Files
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/features/hexcrawl-map/.context/plain-english.md
- src/features/hexcrawl-map/.context/scaling-roadmap.md
- src/features/hexcrawl-map/.context/tech-memory.md
- src/features/hexcrawl-map/index.ts
- vitest.config.mjs
- src/app/model/hexcrawlSession.ts
- src/features/hexcrawl-map/__tests__/hexcrawlMapView.spec.ts
- src/features/hexcrawl-map/model/hexcrawlMapView.ts
- src/features/hexcrawl-map/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-14T06:17:12-03:00 - hexcrawl-movement
- branch: task/hexcrawl-movement
- commit: 41e67da feat(world): adiciona catalogo base de hexcrawl
- changed_files_count: 3
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/features/hexcrawl-map/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-14T00:18:29-03:00 - world-tile-schema
- branch: task/world-tile-schema
- commit: 27bca5d feat(spell): adiciona tela de conjuracao minima
- changed_files_count: 3
#### Changed Files
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/world-tile/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T23:54:32-03:00 - spell-casting-ui
- branch: task/spell-casting-ui
- commit: f1da92f feat(spell): adiciona builder de conjuracao
- changed_files_count: 16
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/features/spell-cast/.context/plain-english.md
- src/features/spell-cast/.context/scaling-roadmap.md
- src/features/spell-cast/.context/tech-memory.md
- src/features/spell-cast/index.ts
- vitest.config.mjs
- src/app/model/spellCastSession.ts
- src/features/spell-cast/__tests__/spellCastView.spec.ts
- src/features/spell-cast/model/spellCastView.ts
- src/features/spell-cast/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T23:39:41-03:00 - spell-cast-builder
- branch: task/spell-cast-builder
- commit: 81e568e feat(spell): adiciona catalogo base
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/features/spell-cast/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T23:18:05-03:00 - spell-schema
- branch: task/spell-schema
- commit: 47490c3 feat(inventory): adiciona tela somente leitura
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/spell/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T20:47:36-03:00 - inventory-ui
- branch: task/inventory-ui
- commit: 817f09f feat(inventory): adiciona calculo de capacidade
- changed_files_count: 10
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/navigation.ts
- vitest.config.mjs
- src/app/model/inventorySession.ts
- src/features/inventory-readonly/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T20:36:15-03:00 - inventory-capacity
- branch: task/inventory-capacity
- commit: 426a725 chore(quality): adiciona gates de fixtures para mcp e skills
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/shared/inventory/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T18:29:27-03:00 - mcp-skill-fixture-gates
- branch: task/mcp-skill-fixture-gates
- commit: 9c9c614 chore(skills): adiciona validadores node windows-first
- changed_files_count: 16
#### Changed Files
- .agents/skills/ai-docs-formatter/assets/response-schema.json
- .agents/skills/character-builder/references/rules_manifest.json
- .agents/skills/crafting-engine/references/items.json
- .agents/skills/monster-factory/references/master_table.json
- .agents/skills/monster-factory/references/roles.json
- .agents/skills/world-state-manager/assets/expected_correction_payload.json
- .agents/skills/world-state-manager/references/acl_policies.json
- .agents/skills/world-state-manager/references/seed_manifestos/morden_seed.json
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- mcp/pandorha-arch-guard/test/arch-guard.test.js
- mcp/pandorha-db-auditor/test/auditor.test.js
- mcp/pandorha-knowledge/test/search-engine.test.js
- mcp/pandorha-memory-bridge/src/server.js
- mcp/pandorha-memory-bridge/test/memory-bridge.test.js
- scripts/run_full_quality_gate.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T18:23:22-03:00 - skill-validator-windows
- branch: task/skill-validator-windows
- commit: 48e4161 chore(quality): fortalece gates de cobertura
- changed_files_count: 12
#### Changed Files
- .agents/skills/core-conventions/SKILL.md
- .agents/skills/core-conventions/scripts/validate.sh
- .agents/skills/self-review-checklist/SKILL.md
- .agents/skills/self-review-checklist/scripts/hard_stop.sh
- .agents/skills/self-review-checklist/scripts/run_json_tests.sh
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package.json
- .agents/skills/core-conventions/scripts/validate.mjs
- .agents/skills/self-review-checklist/scripts/hard_stop.mjs
- .agents/skills/self-review-checklist/scripts/run_json_tests.mjs
- scripts/test_skill_validators.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T12:55:48-03:00 - quality-gate-hardening
- branch: task/quality-gate-hardening
- commit: 64282f6 chore(scaffold): adiciona gerador de service de dominio
- changed_files_count: 16
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package.json
- scripts/install_process_hooks.mjs
- scripts/run_full_quality_gate.mjs
- scripts/scaffold_catalog_entity.mjs
- scripts/scaffold_domain_service.mjs
- scripts/test_scaffold_catalog_entity.mjs
- scripts/test_scaffold_domain_service.mjs
- src/entities/compendium/__tests__/CompendiumSearchService.spec.ts
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/compendium-browser/__tests__/compendiumBrowserView.spec.ts
- vitest.config.mjs
- scripts/test_validate_coverage_registration.mjs
- scripts/validate_coverage_registration.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T12:42:34-03:00 - domain-service-scaffold
- branch: task/domain-service-scaffold
- commit: 1173511 chore(scaffold): adiciona gerador de entidade catalogo
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package.json
- scripts/scaffold_domain_service.mjs
- scripts/test_scaffold_domain_service.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T12:38:32-03:00 - catalog-entity-scaffold
- branch: task/catalog-entity-scaffold
- commit: 847ebb2 chore(process): endurece automacao local
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package.json
- scripts/scaffold_catalog_entity.mjs
- scripts/test_scaffold_catalog_entity.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T12:28:37-03:00 - process-automation-hardening
- branch: task/process-automation-hardening
- commit: f1018d8 feat(equipment): adiciona catalogo base
- changed_files_count: 9
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package.json
- scripts/hooks/post-commit
- scripts/hooks/post-merge
- scripts/pandorha_process_automation.py
- scripts/install_process_hooks.mjs
- scripts/process_hook_runner.mjs
- scripts/test_pandorha_process_automation.py
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T12:12:52-03:00 - equipment-schema
- branch: task-equipment-schema
- commit: f6b14c7 docs(combat): revisa vertical slice de treino
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/equipment/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-13T07:17:38-03:00 - combat-vertical-slice-review
- branch: task-combat-vertical-slice-review
- commit: 7c1a398 docs(combat): adiciona guia de treino
- changed_files_count: 3
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/process/t22-combat-vertical-slice-review.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-12T18:31:37-03:00 - combat-user-guide
- branch: task-combat-user-guide
- commit: c1eefee feat(combat): mostra encerramento do encontro
- changed_files_count: 3
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/combat-training.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-12T18:27:34-03:00 - combat-encounter-outcome
- branch: task-combat-encounter-outcome
- commit: b6a7879 feat(combat): registra turno passivo do alvo
- changed_files_count: 11
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-12T18:22:30-03:00 - combat-training-target-turn
- branch: task-combat-training-target-turn
- commit: 639556f feat(combat): usa matriz fisica no dano de treino
- changed_files_count: 13
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- src/features/combat-encounter/__tests__/combatTrainingTargetTurn.spec.ts
- src/features/combat-encounter/model/combatTrainingTargetTurn.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-12T18:13:31-03:00 - combat-training-damage-profile
- branch: task-combat-training-damage-profile
- commit: 5275d54 feat(combat): exibe atributos derivados do atacante
- changed_files_count: 15
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/model/combatTrainingAttackProfile.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-12T12:42:37-03:00 - combat-attacker-derived-stats
- branch: task-combat-attacker-derived-stats
- commit: 0e6060a feat(combat): adiciona estado de turno
- changed_files_count: 14
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-12T12:06:19-03:00 - combat-turn-state
- branch: task-combat-turn-state
- commit: f4606a7 feat(combat): conecta atacante da sessao
- changed_files_count: 17
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- vitest.config.mjs
- src/features/combat-encounter/__tests__/CombatTurnService.spec.ts
- src/features/combat-encounter/domain/CombatTurnService.ts
- src/features/combat-encounter/model/combatTurnSchemas.ts
- src/features/combat-encounter/model/combatTurnTypes.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T23:11:41-03:00 - combat-session-attacker-final
- branch: task-combat-session-attacker
- commit: c8bdf49 feat(combat): adiciona alvos de treino
- changed_files_count: 20
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/index.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- .codex-dev-server.err.log
- .codex-dev-server.out.log
- .codex-dev-server.pid
- src/app/model/combatEncounterSession.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatSessionAttacker.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T23:08:41-03:00 - combat-session-attacker
- branch: task-combat-session-attacker
- commit: c8bdf49 feat(combat): adiciona alvos de treino
- changed_files_count: 19
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/index.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- .codex-dev-server.err.log
- .codex-dev-server.out.log
- .codex-dev-server.pid
- src/app/model/combatEncounterSession.spec.ts
- src/features/combat-encounter/model/combatSessionAttacker.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T18:09:17-03:00 - combat-training-targets
- branch: task-combat-training-targets
- commit: 312f86f feat(combat): adiciona tela de encontro
- changed_files_count: 15
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/index.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/combat-encounter/model/combatTrainingTargetCatalog.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T12:41:20-03:00 - combat-vertical-slice-ui
- branch: task-combat-vertical-slice-ui
- commit: 5f973e9 feat(combat): adiciona nucleo de encontro
- changed_files_count: 15
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/features/combat-encounter/.context/plain-english.md
- src/features/combat-encounter/.context/scaling-roadmap.md
- src/features/combat-encounter/.context/tech-memory.md
- src/features/combat-encounter/index.ts
- src/app/model/combatEncounterSession.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/model/combatEncounterView.ts
- src/features/combat-encounter/ui/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T12:18:35-03:00 - combat-encounter-core
- branch: task-combat-encounter-core
- commit: 3959923 feat(damage): adiciona pipeline minimo
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/features/combat-encounter/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T11:51:31-03:00 - damage-pipeline
- branch: task-damage-pipeline
- commit: 983415c feat(action-queue): adiciona fila deterministica
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/shared/game-rules.ts
- vitest.config.mjs
- src/shared/damage/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T06:53:35-03:00 - action-queue-final
- branch: task-action-queue
- commit: e88954b feat(resolution): adiciona teste global
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/shared/action-queue/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-06T06:53:17-03:00 - action-queue-final
- branch: task-action-queue
- commit: e88954b feat(resolution): adiciona teste global
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/shared/action-queue/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T23:55:36-03:00 - resolution-service-final
- branch: task-resolution-service
- commit: c6a0275 feat(dice): adiciona servico auditavel
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/shared/resolution/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T23:55:26-03:00 - resolution-service
- branch: task-resolution-service
- commit: c6a0275 feat(dice): adiciona servico auditavel
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/shared/resolution/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T23:35:56-03:00 - dice-service-final
- branch: task-dice-service
- commit: bd7a8b1 feat(compendium): adiciona busca navegavel
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/shared/game-rules.ts
- vitest.config.mjs
- src/shared/dice/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T23:32:32-03:00 - dice-service-final
- branch: task-dice-service
- commit: bd7a8b1 feat(compendium): adiciona busca navegavel
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/shared/game-rules.ts
- vitest.config.mjs
- src/shared/dice/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T23:32:13-03:00 - dice-service
- branch: task-dice-service
- commit: bd7a8b1 feat(compendium): adiciona busca navegavel
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/shared/game-rules.ts
- vitest.config.mjs
- src/shared/dice/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T23:27:22-03:00 - dice-service
- branch: task-dice-service
- commit: bd7a8b1 feat(compendium): adiciona busca navegavel
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/shared/game-rules.ts
- src/shared/dice/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T19:17:38-03:00 - compendium-browser-ui
- branch: task-compendium-browser-ui
- commit: 1ce69c8 feat(compendium): adiciona catalogo base
- changed_files_count: 12
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/App.svelte
- src/entities/compendium/.context/plain-english.md
- src/entities/compendium/.context/scaling-roadmap.md
- src/entities/compendium/.context/tech-memory.md
- src/entities/compendium/index.ts
- src/entities/compendium/model/compendiumTypes.ts
- src/app/model/compendiumSession.ts
- src/entities/compendium/__tests__/CompendiumSearchService.spec.ts
- src/entities/compendium/domain/CompendiumSearchService.ts
- src/features/compendium-browser/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T18:59:06-03:00 - compendium-base-catalog
- branch: task-compendium-base-catalog
- commit: 3dfcde6 feat(character): conecta catalogos na criacao
- changed_files_count: 3
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/entities/compendium/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T18:20:42-03:00 - character-catalog-ui-integration
- branch: task-character-catalog-ui-integration
- commit: 99977fe feat(character): calcula stats derivados base
- changed_files_count: 17
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/app/model/characterSession.ts
- src/features/character-create/.context/plain-english.md
- src/features/character-create/.context/scaling-roadmap.md
- src/features/character-create/.context/tech-memory.md
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-create/ui/CharacterCreateForm.svelte
- src/features/character-list/.context/plain-english.md
- src/features/character-list/.context/scaling-roadmap.md
- src/features/character-list/.context/tech-memory.md
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T13:22:54-03:00 - character-derived-stats-core
- branch: task-character-derived-stats-core
- commit: f8874a0 feat(background): adiciona catalogo base
- changed_files_count: 10
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/entities/character/.context/plain-english.md
- src/entities/character/.context/scaling-roadmap.md
- src/entities/character/.context/tech-memory.md
- src/entities/character/index.ts
- vitest.config.mjs
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/domain/CharacterDerivedStatsService.ts
- src/entities/character/model/characterDerivedStatsTypes.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T09:05:02-03:00 - background-schema
- branch: task-background-schema
- commit: b39362b feat(character-class): adiciona catalogo base
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/background/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T08:48:58-03:00 - character-class-schema
- branch: task-character-class-schema
- commit: d3c8374 feat(character): integra tracos de ancestralidade
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- vitest.config.mjs
- src/entities/character-class/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-05T08:24:15-03:00 - character-ancestry-trait-selection
- branch: task-character-ancestry-trait-selection
- commit: b303882 feat(ancestry): adiciona tracos base
- changed_files_count: 11
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/user/character-creation.md
- src/app/App.svelte
- src/app/model/characterSession.ts
- src/features/character-create/.context/plain-english.md
- src/features/character-create/.context/scaling-roadmap.md
- src/features/character-create/.context/tech-memory.md
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-create/ui/CharacterCreateForm.svelte
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T22:28:55-03:00 - ancestry-traits-final
- branch: task-ancestry-traits
- commit: 7b077b8 feat(ancestry): adiciona catalogo base
- changed_files_count: 15
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/entities/ancestry/.context/plain-english.md
- src/entities/ancestry/.context/scaling-roadmap.md
- src/entities/ancestry/.context/tech-memory.md
- src/entities/ancestry/__tests__/AncestryCatalogService.spec.ts
- src/entities/ancestry/index.ts
- src/entities/ancestry/model/ancestrySchema.ts
- src/entities/ancestry/model/ancestryTypes.ts
- vitest.config.mjs
- src/entities/ancestry/__tests__/AncestryTraitSelectionService.spec.ts
- src/entities/ancestry/domain/AncestryTraitRepository.ts
- src/entities/ancestry/domain/AncestryTraitSelectionService.ts
- src/entities/ancestry/model/ancestryTraitCatalog.ts
- src/entities/ancestry/testing/InMemoryAncestryTraitRepository.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T22:23:33-03:00 - ancestry-traits
- branch: task-ancestry-traits
- commit: 7b077b8 feat(ancestry): adiciona catalogo base
- changed_files_count: 13
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/entities/ancestry/.context/plain-english.md
- src/entities/ancestry/.context/scaling-roadmap.md
- src/entities/ancestry/.context/tech-memory.md
- src/entities/ancestry/index.ts
- src/entities/ancestry/model/ancestrySchema.ts
- src/entities/ancestry/model/ancestryTypes.ts
- src/entities/ancestry/__tests__/AncestryTraitSelectionService.spec.ts
- src/entities/ancestry/domain/AncestryTraitRepository.ts
- src/entities/ancestry/domain/AncestryTraitSelectionService.ts
- src/entities/ancestry/model/ancestryTraitCatalog.ts
- src/entities/ancestry/testing/InMemoryAncestryTraitRepository.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T17:45:42-03:00 - ancestry-schema
- branch: task-ancestry-schema
- commit: d3ed625 docs(character): adiciona guia de criacao
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- Untitled-1.md
- src/entities/ancestry/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T17:31:29-03:00 - character-user-docs
- branch: task-character-user-docs
- commit: cd568f1 feat(character): melhora mensagens de erro
- changed_files_count: 4
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- Untitled-1.md
- docs/user/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T17:20:05-03:00 - character-error-copy-complete
- branch: task-character-error-copy
- commit: c6ce5df feat(character): adiciona criacao em sessao
- changed_files_count: 8
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/features/character-create/.context/plain-english.md
- src/features/character-create/.context/scaling-roadmap.md
- src/features/character-create/.context/tech-memory.md
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T17:20:00-03:00 - character-error-copy
- branch: task-character-error-copy
- commit: c6ce5df feat(character): adiciona criacao em sessao
- changed_files_count: 8
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/features/character-create/.context/plain-english.md
- src/features/character-create/.context/scaling-roadmap.md
- src/features/character-create/.context/tech-memory.md
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T17:11:07-03:00 - character-create-form-complete
- branch: task-character-create-form
- commit: 3fa5f3b feat(character): adiciona listagem inicial
- changed_files_count: 15
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/App.svelte
- src/entities/character/.context/scaling-roadmap.md
- src/entities/character/.context/tech-memory.md
- src/entities/character/index.ts
- src/features/character-list/.context/plain-english.md
- src/features/character-list/.context/tech-memory.md
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- Untitled-1.md
- src/app/model/characterSession.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/features/character-create/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T17:11:02-03:00 - character-create-form
- branch: task-character-create-form
- commit: 3fa5f3b feat(character): adiciona listagem inicial
- changed_files_count: 15
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/App.svelte
- src/entities/character/.context/scaling-roadmap.md
- src/entities/character/.context/tech-memory.md
- src/entities/character/index.ts
- src/features/character-list/.context/plain-english.md
- src/features/character-list/.context/tech-memory.md
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- Untitled-1.md
- src/app/model/characterSession.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/features/character-create/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T13:20:39-03:00 - character-list-ui-complete
- branch: task-character-list-ui
- commit: baf6701 feat(character): adiciona migration inicial
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/App.svelte
- Untitled-1.md
- src/features/character-list/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T13:20:30-03:00 - character-list-ui
- branch: task-character-list-ui
- commit: baf6701 feat(character): adiciona migration inicial
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/App.svelte
- Untitled-1.md
- src/features/character-list/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T12:54:25-03:00 - characters-migration-complete
- branch: task-characters-migration
- commit: 72cc635 test(character): cobre contrato do repository drizzle
- changed_files_count: 11
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package-lock.json
- package.json
- src/entities/character/.context/plain-english.md
- src/entities/character/.context/scaling-roadmap.md
- src/entities/character/.context/tech-memory.md
- Untitled-1.md
- drizzle.config.mjs
- drizzle/
- src/entities/character/__tests__/CharacterMigration.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T12:54:09-03:00 - characters-migration
- branch: task-characters-migration
- commit: 72cc635 test(character): cobre contrato do repository drizzle
- changed_files_count: 11
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package-lock.json
- package.json
- src/entities/character/.context/plain-english.md
- src/entities/character/.context/scaling-roadmap.md
- src/entities/character/.context/tech-memory.md
- Untitled-1.md
- drizzle.config.mjs
- drizzle/
- src/entities/character/__tests__/CharacterMigration.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T12:22:47-03:00 - character-repository-contract
- branch: task-character-repository-contract
- commit: 9dc3fdb docs(process): adiciona protocolo de ferramentas uteis
- changed_files_count: 5
#### Changed Files
- src/entities/character/.context/plain-english.md
- src/entities/character/.context/scaling-roadmap.md
- src/entities/character/.context/tech-memory.md
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T11:55:32-03:00 - tooling-relevance-protocol
- branch: task-tooling-relevance-protocol
- commit: 1beed5b feat(app): aplica shell visual com tokens Tailwind
- changed_files_count: 3
#### Changed Files
- AGENTS.md
- llms.txt
- docs/conventions/tooling-relevance-map.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-03T00:20:20-03:00 - visual-shell-styleguide
- branch: task-visual-shell-styleguide
- commit: 8d0f18e chore(process): registra snapshot pos-commit da navegacao
- changed_files_count: 12
#### Changed Files
- AGENTS.md
- llms.txt
- package-lock.json
- package.json
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- src/main.ts
- vite.config.mjs
- biome.json
- src/app/styles.css
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T23:29:03-03:00 - post-commit
- branch: task-state-driven-navigation
- commit: 6f10886 feat(app): adiciona navegacao state-driven inicial
- changed_files_count: 1
#### Changed Files
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T23:28:19-03:00 - state-driven-navigation
- branch: task-state-driven-navigation
- commit: a791e73 chore(process): registra snapshot pos-commit da regra de plano
- changed_files_count: 8
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/app/.context/plain-english.md
- src/app/.context/scaling-roadmap.md
- src/app/.context/tech-memory.md
- src/app/App.svelte
- Untitled-1.md
- src/app/model/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T23:10:41-03:00 - post-commit
- branch: task-planning-protocol-rule
- commit: a730d52 docs(governance): exige plano detalhado antes de codigo
- changed_files_count: 1
#### Changed Files
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T23:09:55-03:00 - mandatory-planning-rule
- branch: task-planning-protocol-rule
- commit: 425ff71 chore(process): registra snapshot pos-commit do app shell
- changed_files_count: 5
#### Changed Files
- AGENTS.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- llms.txt
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T22:56:16-03:00 - post-commit
- branch: task-svelte-app-shell
- commit: ff4d80d feat(app): adiciona scaffold minimo svelte
- changed_files_count: 1
#### Changed Files
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T22:55:21-03:00 - svelte-app-shell
- branch: task-svelte-app-shell
- commit: 2f0fbbf chore(process): registra snapshot final do roadmap
- changed_files_count: 10
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- package-lock.json
- package.json
- Untitled-1.md
- index.html
- src/app/
- src/main.ts
- src/vite-env.d.ts
- vite.config.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T22:41:34-03:00 - post-commit
- branch: task-game-roadmap-docs
- commit: 485fa0d chore(process): registra snapshot pos-commit do roadmap
- changed_files_count: 1
#### Changed Files
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T22:41:04-03:00 - post-commit
- branch: task-game-roadmap-docs
- commit: d04dd29 docs(process): planeja implementacao completa do jogo
- changed_files_count: 1
#### Changed Files
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T22:40:16-03:00 - game-roadmap-docs
- branch: task-game-roadmap-docs
- commit: dd38600 docs(governance): define protocolos de idioma e intake
- changed_files_count: 5
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- Untitled-1.md
- docs/process/complete-game-implementation-guide.md
- docs/process/microtask-delivery-plan.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T22:34:51-03:00 - post-commit
- branch: task-game-roadmap-docs
- commit: dd38600 docs(governance): define protocolos de idioma e intake
- changed_files_count: 1
#### Changed Files
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T21:59:26-03:00 - task-intake-execution-profile-rule
- branch: feat/metadata-tags-codex
- commit: bdd3707 chore(process): registra snapshot pos-commit do quality gate
- changed_files_count: 4
#### Changed Files
- AGENTS.md
- docs/process/task-ledger.md
- llms.txt
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T21:53:42-03:00 - language-contract-rule
- branch: feat/metadata-tags-codex
- commit: bdd3707 chore(process): registra snapshot pos-commit do quality gate
- changed_files_count: 3
#### Changed Files
- AGENTS.md
- llms.txt
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T20:32:34-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 651c994 feat(quality): adiciona gate unificado de validacao
- changed_files_count: 1
#### Changed Files
- Untitled-1.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T18:05:34-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: db9a74b feat(character): implementa tracer bullet de dominio [GDD 00]
- changed_files_count: 0
#### Changed Files
- none
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T12:03:35-03:00 - manual
- branch: feat/metadata-tags-codex
- commit: 4ee50c8 chore: snapshot pandorha workspace updates
- changed_files_count: 17
#### Changed Files
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- src/shared/game-rules.ts
- .codex/
- .gitignore
- .lla-embeddings.json
- .lla-index.json
- .lla-profile.json
- dev.db
- package-lock.json
- package.json
- scratch/
- src/entities/
- src/shared/lib/
- system-backup/
- tsconfig.json
- vitest.config.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-02T10:33:51-03:00 - post-commit
- branch: feat/metadata-tags-codex
- commit: 4ee50c8 chore: snapshot pandorha workspace updates
- changed_files_count: 7
#### Changed Files
- .codex/
- .lla-embeddings.json
- .lla-index.json
- .lla-profile.json
- dev.db
- scratch/
- system-backup/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-01T19:25:10-03:00 - Infraestrutura Codex configurada: setup.bat e UI toolbar docs.
- branch: feat/metadata-tags-codex
- commit: aa80d68 chore: inicializacao para processamento de tags
- changed_files_count: 124
#### Changed Files
- docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md
- docs/system/combat/03-codex-de-combate-e-condicoes.md
- docs/system/combat/07-01a-tier1-mundo-natural.md
- docs/system/combat/07-01b-tier1-sobrenatural.md
- docs/system/combat/07-02a-tier2-feras-e-gigantes.md
- docs/system/combat/07-02b-tier2-magia-e-morte.md
- docs/system/combat/07-03a-tier3-lendas-vivas.md
- docs/system/combat/07-03b-tier3-horrores-etericos.md
- docs/system/combat/07-04a-tier4-deuses-e-titans.md
- docs/system/combat/13-guia-de-criacao-de-monstros.md
- docs/system/combat/14-compendio-de-habilidades-de-monstros.md
- docs/system/combat/15-compendio-de-habilidades-de-monstros-tier2.md
- docs/system/combat/16-compendio-de-habilidades-de-monstros-tier3.md
- docs/system/combat/17-compendio-de-habilidades-de-monstros-tier4.md
- docs/system/combat/18-tratado-de-dano.md
- docs/system/magic/12-00-codex-de-magia.md
- docs/system/magic/12-01-grimorio-arcano.md
- docs/system/magic/12-02-grimorio-circulo-0.md
- docs/system/magic/12-03-grimorio-circulo-1.md
- docs/system/magic/12-04-grimorio-circulo-2.md
- docs/system/magic/12-05-grimorio-circulo-3.md
- docs/system/magic/12-06-grimorio-circulo-4.md
- docs/system/magic/12-07-grimorio-circulo-5.md
- docs/system/magic/12-08-grimorio-circulo-6.md
- docs/system/magic/12-09-grimorio-circulo-7.md
- docs/system/magic/12-10-grimorio-circulo-8.md
- docs/system/magic/12-11-grimorio-circulo-9.md
- docs/system/magic/12-12-grimorio-circulo-10.md
- docs/system/magic/12-13-codex-expandido-magia-hibrida.md
- docs/system/magic/12-metamagias-as-40-quebras.md
- docs/system/survival/00-mecanicas-fundamentais.md
- docs/system/survival/01-00-regras-gerais.md
- docs/system/survival/01-01-humanos.md
- docs/system/survival/01-02-elfos.md
- docs/system/survival/01-03-anoes.md
- docs/system/survival/01-04-drakari.md
- docs/system/survival/01-05-umbrais.md
- docs/system/survival/01-06-feras.md
- docs/system/survival/01-ancestralidades.md
- docs/system/survival/02a-matriz-fisica.md
- ... 84 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-01T19:23:48-03:00 - Criação do arquivo AGENTS.md concluída.
- branch: feat/metadata-tags-codex
- commit: aa80d68 chore: inicializacao para processamento de tags
- changed_files_count: 123
#### Changed Files
- docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md
- docs/system/combat/03-codex-de-combate-e-condicoes.md
- docs/system/combat/07-01a-tier1-mundo-natural.md
- docs/system/combat/07-01b-tier1-sobrenatural.md
- docs/system/combat/07-02a-tier2-feras-e-gigantes.md
- docs/system/combat/07-02b-tier2-magia-e-morte.md
- docs/system/combat/07-03a-tier3-lendas-vivas.md
- docs/system/combat/07-03b-tier3-horrores-etericos.md
- docs/system/combat/07-04a-tier4-deuses-e-titans.md
- docs/system/combat/13-guia-de-criacao-de-monstros.md
- docs/system/combat/14-compendio-de-habilidades-de-monstros.md
- docs/system/combat/15-compendio-de-habilidades-de-monstros-tier2.md
- docs/system/combat/16-compendio-de-habilidades-de-monstros-tier3.md
- docs/system/combat/17-compendio-de-habilidades-de-monstros-tier4.md
- docs/system/combat/18-tratado-de-dano.md
- docs/system/magic/12-00-codex-de-magia.md
- docs/system/magic/12-01-grimorio-arcano.md
- docs/system/magic/12-02-grimorio-circulo-0.md
- docs/system/magic/12-03-grimorio-circulo-1.md
- docs/system/magic/12-04-grimorio-circulo-2.md
- docs/system/magic/12-05-grimorio-circulo-3.md
- docs/system/magic/12-06-grimorio-circulo-4.md
- docs/system/magic/12-07-grimorio-circulo-5.md
- docs/system/magic/12-08-grimorio-circulo-6.md
- docs/system/magic/12-09-grimorio-circulo-7.md
- docs/system/magic/12-10-grimorio-circulo-8.md
- docs/system/magic/12-11-grimorio-circulo-9.md
- docs/system/magic/12-12-grimorio-circulo-10.md
- docs/system/magic/12-13-codex-expandido-magia-hibrida.md
- docs/system/magic/12-metamagias-as-40-quebras.md
- docs/system/survival/00-mecanicas-fundamentais.md
- docs/system/survival/01-00-regras-gerais.md
- docs/system/survival/01-01-humanos.md
- docs/system/survival/01-02-elfos.md
- docs/system/survival/01-03-anoes.md
- docs/system/survival/01-04-drakari.md
- docs/system/survival/01-05-umbrais.md
- docs/system/survival/01-06-feras.md
- docs/system/survival/01-ancestralidades.md
- docs/system/survival/02a-matriz-fisica.md
- ... 83 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-01T01:36:35-03:00 - parser-validation
- branch: feat/metadata-tags-codex
- commit: aa80d68 chore: inicializacao para processamento de tags
- changed_files_count: 118
#### Changed Files
- docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md
- docs/system/combat/03-codex-de-combate-e-condicoes.md
- docs/system/combat/07-01a-tier1-mundo-natural.md
- docs/system/combat/07-01b-tier1-sobrenatural.md
- docs/system/combat/07-02a-tier2-feras-e-gigantes.md
- docs/system/combat/07-02b-tier2-magia-e-morte.md
- docs/system/combat/07-03a-tier3-lendas-vivas.md
- docs/system/combat/07-03b-tier3-horrores-etericos.md
- docs/system/combat/07-04a-tier4-deuses-e-titans.md
- docs/system/combat/13-guia-de-criacao-de-monstros.md
- docs/system/combat/14-compendio-de-habilidades-de-monstros.md
- docs/system/combat/15-compendio-de-habilidades-de-monstros-tier2.md
- docs/system/combat/16-compendio-de-habilidades-de-monstros-tier3.md
- docs/system/combat/17-compendio-de-habilidades-de-monstros-tier4.md
- docs/system/combat/18-tratado-de-dano.md
- docs/system/magic/12-00-codex-de-magia.md
- docs/system/magic/12-01-grimorio-arcano.md
- docs/system/magic/12-02-grimorio-circulo-0.md
- docs/system/magic/12-03-grimorio-circulo-1.md
- docs/system/magic/12-04-grimorio-circulo-2.md
- docs/system/magic/12-05-grimorio-circulo-3.md
- docs/system/magic/12-06-grimorio-circulo-4.md
- docs/system/magic/12-07-grimorio-circulo-5.md
- docs/system/magic/12-08-grimorio-circulo-6.md
- docs/system/magic/12-09-grimorio-circulo-7.md
- docs/system/magic/12-10-grimorio-circulo-8.md
- docs/system/magic/12-11-grimorio-circulo-9.md
- docs/system/magic/12-12-grimorio-circulo-10.md
- docs/system/magic/12-13-codex-expandido-magia-hibrida.md
- docs/system/magic/12-metamagias-as-40-quebras.md
- docs/system/survival/00-mecanicas-fundamentais.md
- docs/system/survival/01-00-regras-gerais.md
- docs/system/survival/01-01-humanos.md
- docs/system/survival/01-02-elfos.md
- docs/system/survival/01-03-anoes.md
- docs/system/survival/01-04-drakari.md
- docs/system/survival/01-05-umbrais.md
- docs/system/survival/01-06-feras.md
- docs/system/survival/01-ancestralidades.md
- docs/system/survival/02a-matriz-fisica.md
- ... 78 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-01T01:34:52-03:00 - implementation-validation
- branch: feat/metadata-tags-codex
- commit: aa80d68 chore: inicializacao para processamento de tags
- changed_files_count: 118
#### Changed Files
- docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md
- docs/system/combat/03-codex-de-combate-e-condicoes.md
- docs/system/combat/07-01a-tier1-mundo-natural.md
- docs/system/combat/07-01b-tier1-sobrenatural.md
- docs/system/combat/07-02a-tier2-feras-e-gigantes.md
- docs/system/combat/07-02b-tier2-magia-e-morte.md
- docs/system/combat/07-03a-tier3-lendas-vivas.md
- docs/system/combat/07-03b-tier3-horrores-etericos.md
- docs/system/combat/07-04a-tier4-deuses-e-titans.md
- docs/system/combat/13-guia-de-criacao-de-monstros.md
- docs/system/combat/14-compendio-de-habilidades-de-monstros.md
- docs/system/combat/15-compendio-de-habilidades-de-monstros-tier2.md
- docs/system/combat/16-compendio-de-habilidades-de-monstros-tier3.md
- docs/system/combat/17-compendio-de-habilidades-de-monstros-tier4.md
- docs/system/combat/18-tratado-de-dano.md
- docs/system/magic/12-00-codex-de-magia.md
- docs/system/magic/12-01-grimorio-arcano.md
- docs/system/magic/12-02-grimorio-circulo-0.md
- docs/system/magic/12-03-grimorio-circulo-1.md
- docs/system/magic/12-04-grimorio-circulo-2.md
- docs/system/magic/12-05-grimorio-circulo-3.md
- docs/system/magic/12-06-grimorio-circulo-4.md
- docs/system/magic/12-07-grimorio-circulo-5.md
- docs/system/magic/12-08-grimorio-circulo-6.md
- docs/system/magic/12-09-grimorio-circulo-7.md
- docs/system/magic/12-10-grimorio-circulo-8.md
- docs/system/magic/12-11-grimorio-circulo-9.md
- docs/system/magic/12-12-grimorio-circulo-10.md
- docs/system/magic/12-13-codex-expandido-magia-hibrida.md
- docs/system/magic/12-metamagias-as-40-quebras.md
- docs/system/survival/00-mecanicas-fundamentais.md
- docs/system/survival/01-00-regras-gerais.md
- docs/system/survival/01-01-humanos.md
- docs/system/survival/01-02-elfos.md
- docs/system/survival/01-03-anoes.md
- docs/system/survival/01-04-drakari.md
- docs/system/survival/01-05-umbrais.md
- docs/system/survival/01-06-feras.md
- docs/system/survival/01-ancestralidades.md
- docs/system/survival/02a-matriz-fisica.md
- ... 78 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
<!-- /pandorha-ledger:snapshots -->
