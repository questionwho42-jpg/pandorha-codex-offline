# Task Ledger

This file records every new completed feature and every unfinished task.

Each record should include start time, finish time when available, the model/config used, the last modification, and a short explanation of what was done or is being done.

The automation owns the marked sections below. Manual edits should stay outside markers unless intentionally correcting a record.

## In Progress
<!-- pandorha-ledger:in-progress -->

<!-- /pandorha-ledger:in-progress -->

## Completed
<!-- pandorha-ledger:completed -->
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
<!-- /pandorha-ledger:unfinished -->

## Snapshots
<!-- pandorha-ledger:snapshots -->
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
