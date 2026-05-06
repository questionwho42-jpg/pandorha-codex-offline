# Change Inbox

This file tracks requests, implementations, features, improvements, and other modifications that were not already planned in the official project documentation.

The automation owns the marked sections below. Manual edits should stay outside markers unless intentionally correcting a record.

## Open
<!-- pandorha-inbox:open -->
<!-- pandorha-inbox:20260506-123114-t22b-combat-vertical-slice-ui -->
### T22B Combat Vertical Slice UI
- id: 20260506-123114-t22b-combat-vertical-slice-ui
- status: open
- created_at: 2026-05-06T12:31:14-03:00
- source: task-ledger
- summary: Criar aba Combate com encontro fixo deterministico usando CombatEncounterService e validacao no navegador.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260506-123114-t22b-combat-vertical-slice-ui -->
<!-- pandorha-inbox:20260506-120924-t22a-combat-encounter-core -->
### T22A Combat Encounter Core
- id: 20260506-120924-t22a-combat-encounter-core
- status: open
- created_at: 2026-05-06T12:09:24-03:00
- source: task-ledger
- summary: Criar CombatEncounterService puro para resolver ataque simples com ActionQueue, ResolutionService e DamagePipelineService.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260506-120924-t22a-combat-encounter-core -->
<!-- pandorha-inbox:20260506-114519-t21-damage-pipeline-minimo -->
### T21 Damage Pipeline minimo
- id: 20260506-114519-t21-damage-pipeline-minimo
- status: open
- created_at: 2026-05-06T11:45:19-03:00
- source: task-ledger
- summary: Criar DamagePipelineService puro em shared/damage para calcular dano em fases deterministicas.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260506-114519-t21-damage-pipeline-minimo -->
<!-- pandorha-inbox:20260506-000211-t20-actionqueue-minima -->
### T20 ActionQueue minima
- id: 20260506-000211-t20-actionqueue-minima
- status: open
- created_at: 2026-05-06T00:02:11-03:00
- source: task-ledger
- summary: Criar ActionQueueService puro em shared/action-queue com FIFO, interrupcoes LIFO, processor fake em testes e Result tipado, sem UI nem persistencia.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260506-000211-t20-actionqueue-minima -->
<!-- pandorha-inbox:20260505-235005-t19-resolutionservice-core -->
### T19 ResolutionService core
- id: 20260505-235005-t19-resolutionservice-core
- status: open
- created_at: 2026-05-05T23:50:05-03:00
- source: task-ledger
- summary: Criar ResolutionService puro para calcular Teste Global com DiceService, graus de sucesso e Result tipado, sem UI nem persistencia.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-235005-t19-resolutionservice-core -->
<!-- pandorha-inbox:20260505-231828-t18a-dice-service-core -->
### T18A dice service core
- id: 20260505-231828-t18a-dice-service-core
- status: open
- created_at: 2026-05-05T23:18:28-03:00
- source: task-ledger
- summary: Criar DiceService auditavel com RNG injetavel, resultados tipados e testes determinísticos, sem UI nem persistencia real.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-231828-t18a-dice-service-core -->
<!-- pandorha-inbox:20260505-190555-t17a-compendium-browser-ui -->
### T17A compendium browser UI
- id: 20260505-190555-t17a-compendium-browser-ui
- status: open
- created_at: 2026-05-05T19:05:55-03:00
- source: task-ledger
- summary: Criar busca e UI read-only do compendio usando o catalogo base validado, com Browser Use para validar pesquisa por Vanguarda.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-190555-t17a-compendium-browser-ui -->
<!-- pandorha-inbox:20260505-185244-t16a-compendium-base-catalog -->
### T16A compendium base catalog
- id: 20260505-185244-t16a-compendium-base-catalog
- status: open
- created_at: 2026-05-05T18:52:44-03:00
- source: task-ledger
- summary: Criar catalogo base do compendio validado por Zod com service read-only, fake repository e Result Pattern.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-185244-t16a-compendium-base-catalog -->
<!-- pandorha-inbox:20260505-180953-t15b-character-catalog-ui-integration -->
### T15B character catalog UI integration
- id: 20260505-180953-t15b-character-catalog-ui-integration
- status: open
- created_at: 2026-05-05T18:09:53-03:00
- source: task-ledger
- summary: Conectar catalogos oficiais de classe e antecedente ao criador/listagem de personagem, mantendo ids tecnicos em ingles e labels pt-BR.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-180953-t15b-character-catalog-ui-integration -->
<!-- pandorha-inbox:20260505-131417-t15a-character-derived-stats-core -->
### T15A character derived stats core
- id: 20260505-131417-t15a-character-derived-stats-core
- status: open
- created_at: 2026-05-05T13:14:17-03:00
- source: task-ledger
- summary: Criar service puro para calcular HP maximo, iniciativa base e limite de carga sem persistir valores finais.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-131417-t15a-character-derived-stats-core -->
<!-- pandorha-inbox:20260505-085702-t14-background-schema -->
### T14 background schema
- id: 20260505-085702-t14-background-schema
- status: open
- created_at: 2026-05-05T08:57:02-03:00
- source: task-ledger
- summary: Modelar catalogo read-only dos antecedentes oficiais com ids tecnicos em ingles, schema Drizzle-Zod, repository fake e service Result.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-085702-t14-background-schema -->
<!-- pandorha-inbox:20260505-084102-t13-character-class-schema -->
### T13 character class schema
- id: 20260505-084102-t13-character-class-schema
- status: open
- created_at: 2026-05-05T08:41:02-03:00
- source: task-ledger
- summary: Modelar catalogo read-only das quatro classes oficiais com ids tecnicos em ingles, schema Drizzle-Zod, repository fake e service Result.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-084102-t13-character-class-schema -->
<!-- pandorha-inbox:20260505-081342-t13a-character-ancestry-trait-selection -->
### T13A character ancestry trait selection
- id: 20260505-081342-t13a-character-ancestry-trait-selection
- status: open
- created_at: 2026-05-05T08:13:42-03:00
- source: task-ledger
- summary: Integrar catalogos de ancestralidade e tracos ao formulario de criacao de personagem com escolha de exatamente 3 tracos, sem persistencia real.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260505-081342-t13a-character-ancestry-trait-selection -->
<!-- pandorha-inbox:20260503-221203-t12-ancestry-traits -->
### T12 ancestry traits
- id: 20260503-221203-t12-ancestry-traits
- status: open
- created_at: 2026-05-03T22:12:03-03:00
- source: task-ledger
- summary: Modelar catalogo textual de tracos de ancestralidade, relacao N:N e service de escolha de 3 tracos no nivel 1.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260503-221203-t12-ancestry-traits -->
<!-- pandorha-inbox:20260503-173935-t11-ancestry-schema -->
### T11 ancestry schema
- id: 20260503-173935-t11-ancestry-schema
- status: open
- created_at: 2026-05-03T17:39:35-03:00
- source: task-ledger
- summary: Criar entidade Ancestry com schema Drizzle-Zod, catalogo oficial, service read-only e fake em memoria.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260503-173935-t11-ancestry-schema -->
<!-- pandorha-inbox:20260503-172645-t10-character-user-docs -->
### T10 character user docs
- id: 20260503-172645-t10-character-user-docs
- status: open
- created_at: 2026-05-03T17:26:45-03:00
- source: task-ledger
- summary: Criar guia de usuario em pt-BR para testar a criacao de personagem 6/6 no navegador.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260503-172645-t10-character-user-docs -->
<!-- pandorha-inbox:20260503-171537-t09-character-error-copy -->
### T09 character error copy
- id: 20260503-171537-t09-character-error-copy
- status: open
- created_at: 2026-05-03T17:15:37-03:00
- source: task-ledger
- summary: Refinar mensagens pt-BR do formulario de criacao de personagem sem alterar regras de dominio.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260503-171537-t09-character-error-copy -->
<!-- pandorha-inbox:20260503-135734-t08-character-create-form -->
### T08 character create form
- id: 20260503-135734-t08-character-create-form
- status: open
- created_at: 2026-05-03T13:57:34-03:00
- source: task-ledger
- summary: Criar fluxo de criação de personagem 6/6 com estado de sessão e listagem atualizada.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260503-135734-t08-character-create-form -->
<!-- pandorha-inbox:20260503-131425-t07-character-list-ui -->
### T07 character list UI
- id: 20260503-131425-t07-character-list-ui
- status: open
- created_at: 2026-05-03T13:14:25-03:00
- source: task-ledger
- summary: Criar tela read-only de listagem de personagens com estado vazio navegavel.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260503-131425-t07-character-list-ui -->
<!-- pandorha-inbox:20260503-124608-t06-characters-migration -->
### T06 characters migration
- id: 20260503-124608-t06-characters-migration
- status: open
- created_at: 2026-05-03T12:46:08-03:00
- source: task-ledger
- summary: Configurar e validar a migration inicial da entidade Character.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260503-124608-t06-characters-migration -->
<!-- pandorha-inbox:20260502-231441-navegacao-state-driven-inicial -->
### Navegacao state-driven inicial
- id: 20260502-231441-navegacao-state-driven-inicial
- status: open
- created_at: 2026-05-02T23:14:41-03:00
- source: task-ledger
- summary: Adicionar navegacao local por estado entre Inicio, Personagens e Compendio, sem router externo, banco ou regras de RPG.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260502-231441-navegacao-state-driven-inicial -->
<!-- pandorha-inbox:20260502-230859-regra-de-planejamento-obrigatorio -->
### Regra de planejamento obrigatorio
- id: 20260502-230859-regra-de-planejamento-obrigatorio
- status: open
- created_at: 2026-05-02T23:08:59-03:00
- source: task-ledger
- summary: Registrar regra que proibe iniciar codigo sem plano detalhado, exige aderencia as especificacoes e pede decisao do usuario para ferramentas ou padroes fora do escopo planejado.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260502-230859-regra-de-planejamento-obrigatorio -->
<!-- pandorha-inbox:20260502-224801-scaffold-minimo-svelte-vite -->
### Scaffold minimo Svelte Vite
- id: 20260502-224801-scaffold-minimo-svelte-vite
- status: open
- created_at: 2026-05-02T22:48:01-03:00
- source: task-ledger
- summary: Adicionar app Svelte 5/Vite minimo sem regra de jogo, com tela inicial testavel no navegador do Codex.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260502-224801-scaffold-minimo-svelte-vite -->
<!-- pandorha-inbox:20260502-223501-documentar-plano-completo-do-jogo -->
### Documentar plano completo do jogo
- id: 20260502-223501-documentar-plano-completo-do-jogo
- status: open
- created_at: 2026-05-02T22:35:01-03:00
- source: task-ledger
- summary: Criar guia de implementacao completa do Pandorha Engine e plano de microtarefas com branch propria, testes, browser validation e gate total por feature.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260502-223501-documentar-plano-completo-do-jogo -->
<!-- pandorha-inbox:20260502-202511-implement-unified-quality-gate -->
### Implement unified quality gate
- id: 20260502-202511-implement-unified-quality-gate
- status: open
- created_at: 2026-05-02T20:25:11-03:00
- source: task-ledger
- summary: Create the zero-token full quality gate script, package commands, documentation update, and process records for future validation runs.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260502-202511-implement-unified-quality-gate -->
<!-- pandorha-inbox:20260502-201538-qa-roadmap-for-implemented-systems -->
### QA roadmap for implemented systems
- id: 20260502-201538-qa-roadmap-for-implemented-systems
- status: open
- created_at: 2026-05-02T20:15:39-03:00
- source: task-ledger
- summary: Create a detailed testing and next-steps guide covering implemented code, MCPs, skills, and future project implementation flow.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260502-201538-qa-roadmap-for-implemented-systems -->
<!-- pandorha-inbox:20260502-114935-tracer-bullet-character-domain -->
### Tracer bullet Character domain
- id: 20260502-114935-tracer-bullet-character-domain
- status: open
- created_at: 2026-05-02T11:49:35-03:00
- source: task-ledger
- summary: Create the first Character domain tracer bullet with Drizzle schema, Result-based service, in-memory fake repository, and TDD coverage.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260502-114935-tracer-bullet-character-domain -->
<!-- pandorha-inbox:20260501-013428-implement-zero-token-maintenance-automation -->
### Implement zero-token maintenance automation
- id: 20260501-013428-implement-zero-token-maintenance-automation
- status: open
- created_at: 2026-05-01T01:34:28-03:00
- source: task-ledger
- summary: Create the full Option A maintenance workflow with process docs, task ledger, change inbox, changelog promotion, local script, hooks, and skill guidance.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260501-013428-implement-zero-token-maintenance-automation -->
<!-- /pandorha-inbox:open -->

## Promoted
<!-- pandorha-inbox:promoted -->
<!-- /pandorha-inbox:promoted -->
