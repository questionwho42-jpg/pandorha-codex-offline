# Task Ledger

This file records every new completed feature and every unfinished task.

Each record should include start time, finish time when available, the model/config used, the last modification, and a short explanation of what was done or is being done.

The automation owns the marked sections below. Manual edits should stay outside markers unless intentionally correcting a record.

## In Progress
<!-- pandorha-ledger:in-progress -->

<!-- /pandorha-ledger:in-progress -->

## Completed
<!-- pandorha-ledger:completed -->
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
<!-- /pandorha-ledger:unfinished -->

## Snapshots
<!-- pandorha-ledger:snapshots -->
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
