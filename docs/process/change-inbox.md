# Change Inbox

This file tracks requests, implementations, features, improvements, and other modifications that were not already planned in the official project documentation.

The automation owns the marked sections below. Manual edits should stay outside markers unless intentionally correcting a record.

## Open
<!-- pandorha-inbox:open -->
<!-- pandorha-inbox:open:empty -- todos os itens concluídos foram movidos para Promoted em 2026-05-31 -->
<!-- /pandorha-inbox:open -->

## Promoted
<!-- pandorha-inbox:promoted -->
<!-- pandorha-inbox:20260514-112622-t33b-sqlite-wasm-opfs-bootstrap -->
### T33B - SQLite WASM OPFS Bootstrap
- id: 20260514-112622-t33b-sqlite-wasm-opfs-bootstrap
- status: promoted
- created_at: 2026-05-14T11:26:22-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/shared/persistence/ — SqliteOpfsBootstrapService, BrowserOpfsDatabaseStorage, databaseWorkerHandler, pandorhaDatabase.worker.ts. Migrations automáticas no bootstrap via Drizzle.
- promoted_to: docs/changelog.md (Fases 13–16), docs/adr/ADR-004-sqlite-wasm-opfs.md
<!-- /pandorha-inbox:20260514-112622-t33b-sqlite-wasm-opfs-bootstrap -->
<!-- pandorha-inbox:20260514-112014-t33a-worker-rpc-save-contract -->
### T33A - Worker RPC Save Contract
- id: 20260514-112014-t33a-worker-rpc-save-contract
- status: promoted
- created_at: 2026-05-14T11:20:14-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/shared/rpc/ — RPCResponse schema Zod, FakeWorkerService para testes, correlação via Map<messageId, Promise>.
- promoted_to: docs/changelog.md (Fases 13–16), docs/adr/ADR-001-worker-rpc-sem-comlink.md
<!-- /pandorha-inbox:20260514-112014-t33a-worker-rpc-save-contract -->
<!-- pandorha-inbox:20260514-065055-t32-worldstate-key-value -->
### T32 - WorldState Key-Value
- id: 20260514-065055-t32-worldstate-key-value
- status: promoted
- created_at: 2026-05-14T06:50:55-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/entities/world-state/ — WorldStateService, schema Drizzle, InMemoryWorldStateRepository.
- promoted_to: docs/changelog.md (Fases 13–16)
<!-- /pandorha-inbox:20260514-065055-t32-worldstate-key-value -->
<!-- pandorha-inbox:20260513-234107-t28-ui-de-conjuracao-minima -->
### T28 UI De Conjuracao Minima
- id: 20260513-234107-t28-ui-de-conjuracao-minima
- status: promoted
- created_at: 2026-05-13T23:41:07-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/features/spell-cast/ui/ — SpellCastPanel com aba Magia, catálogo, seleção de alvo e SpellCastBuilderService.
- promoted_to: docs/changelog.md (Fases 5–8)
<!-- /pandorha-inbox:20260513-234107-t28-ui-de-conjuracao-minima -->
<!-- pandorha-inbox:20260513-233033-t27-spellcastbuilder-core -->
### T27 SpellCastBuilder Core
- id: 20260513-233033-t27-spellcastbuilder-core
- status: promoted
- created_at: 2026-05-13T23:30:33-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/features/spell-cast/domain/SpellCastBuilderService.ts — padrão Builder com Draft/Weaving/Audit/Commit.
- promoted_to: docs/changelog.md (Fases 5–8), docs/architecture/feature_state_machines.md (Seção 5)
<!-- /pandorha-inbox:20260513-233033-t27-spellcastbuilder-core -->
<!-- pandorha-inbox:20260513-220314-t26-spell-schema-minimo -->
### T26 Spell Schema Minimo
- id: 20260513-220314-t26-spell-schema-minimo
- status: promoted
- created_at: 2026-05-13T22:03:14-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/entities/spell/ — SpellCatalogService, schema Drizzle-Zod read-only, InMemorySpellRepository.
- promoted_to: docs/changelog.md (Fases 5–8)
<!-- /pandorha-inbox:20260513-220314-t26-spell-schema-minimo -->
<!-- pandorha-inbox:20260513-203725-t25-inventory-read-only-ui -->
### T25 Inventory Read Only UI
- id: 20260513-203725-t25-inventory-read-only-ui
- status: promoted
- created_at: 2026-05-13T20:37:25-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/features/inventory-readonly/ — InventoryReadOnlyPanel exibindo itens do catálogo com carga calculada.
- promoted_to: docs/changelog.md (Fases 5–8)
<!-- /pandorha-inbox:20260513-203725-t25-inventory-read-only-ui -->
<!-- pandorha-inbox:20260513-202933-t24-inventorycapacityservice -->
### T24 InventoryCapacityService
- id: 20260513-202933-t24-inventorycapacityservice
- status: promoted
- created_at: 2026-05-13T20:29:33-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/shared/inventory/InventoryCapacityService.ts — cálculo de slots, sobrecarga e imobilização sem persistência de valores derivados.
- promoted_to: docs/changelog.md (Fases 5–8)
<!-- /pandorha-inbox:20260513-202933-t24-inventorycapacityservice -->
<!-- pandorha-inbox:20260513-182431-a06-mcp-and-skill-fixture-gates -->
### A06 MCP And Skill Fixture Gates
- id: 20260513-182431-a06-mcp-and-skill-fixture-gates
- status: promoted
- created_at: 2026-05-13T18:24:31-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: MCPs pandorha-arch-guard, pandorha-db-auditor, pandorha-knowledge, pandorha-memory-bridge implementados em mcp/ com testes e validators Node.js.
- promoted_to: docs/changelog.md (2026-05-22 entry)
<!-- /pandorha-inbox:20260513-182431-a06-mcp-and-skill-fixture-gates -->
<!-- pandorha-inbox:20260513-125718-a05-skill-validators-windows-first -->
### A05 Skill Validators Windows-First
- id: 20260513-125718-a05-skill-validators-windows-first
- status: promoted
- created_at: 2026-05-13T12:57:18-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: scripts/validate_svelte_syntax.mjs e validate_coverage_registration.mjs implementados — bloqueiam padrões Svelte 4 e alucinações de imports.
- promoted_to: docs/conventions/core-conventions.md (v2.0.0)
<!-- /pandorha-inbox:20260513-125718-a05-skill-validators-windows-first -->
<!-- pandorha-inbox:20260513-124327-a04-coverage-and-quality-gate-automation -->
### A04 Coverage And Quality Gate Automation
- id: 20260513-124327-a04-coverage-and-quality-gate-automation
- status: promoted
- created_at: 2026-05-13T12:43:27-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: scripts/run_full_quality_gate.mjs implementado; vitest.config.mjs com thresholds 100% e 55 arquivos registrados; npm run quality:gate disponível.
- promoted_to: docs/process/automation-spec.md
<!-- /pandorha-inbox:20260513-124327-a04-coverage-and-quality-gate-automation -->
<!-- pandorha-inbox:20260513-123938-a03-domain-service-scaffolder -->
### A03 Domain Service Scaffolder
- id: 20260513-123938-a03-domain-service-scaffolder
- status: promoted
- created_at: 2026-05-13T12:39:38-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: scripts/scaffold_domain_service.mjs implementado — npm run scaffold:domain-service gera service, interface, fake e spec.
- promoted_to: docs/conventions/tooling-relevance-map.md
<!-- /pandorha-inbox:20260513-123938-a03-domain-service-scaffolder -->
<!-- pandorha-inbox:20260513-123247-a02-catalog-entity-scaffolder -->
### A02 Catalog Entity Scaffolder
- id: 20260513-123247-a02-catalog-entity-scaffolder
- status: promoted
- created_at: 2026-05-13T12:32:47-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: scripts/scaffold_catalog_entity.mjs implementado — npm run scaffold:catalog-entity gera entidade completa com schema, repository, service e spec.
- promoted_to: docs/conventions/tooling-relevance-map.md
<!-- /pandorha-inbox:20260513-123247-a02-catalog-entity-scaffolder -->
<!-- pandorha-inbox:20260513-122332-a01-process-automation-hardening -->
### A01 Process Automation Hardening
- id: 20260513-122332-a01-process-automation-hardening
- status: promoted
- created_at: 2026-05-13T12:23:32-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: scripts/pandorha_process_automation.py endurecido com validate/doctor, snapshot skip-clean; scripts/install_process_hooks.mjs para hooks Windows-first.
- promoted_to: docs/process/automation-spec.md
<!-- /pandorha-inbox:20260513-122332-a01-process-automation-hardening -->
<!-- pandorha-inbox:20260513-120357-t23-equipment-schema -->
### T23 Equipment Schema
- id: 20260513-120357-t23-equipment-schema
- status: promoted
- created_at: 2026-05-13T12:03:57-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado em src/entities/equipment/ — EquipmentCatalogService, CraftingService, InventoryService, schema Drizzle-Zod com equipamentos únicos e consumíveis empilhados.
- promoted_to: docs/changelog.md (Fases 5–8)
<!-- /pandorha-inbox:20260513-120357-t23-equipment-schema -->
<!-- pandorha-inbox:20260512-183308-t22k-combat-vertical-slice-review -->
### T22K Combat Vertical Slice Review
- id: 20260512-183308-t22k-combat-vertical-slice-review
- status: promoted
- created_at: 2026-05-12T18:33:08-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Review completo em docs/process/t22-combat-vertical-slice-review.md. Checklist funcional, limitações e próximas etapas documentados.
- promoted_to: docs/process/t22-combat-vertical-slice-review.md
<!-- /pandorha-inbox:20260512-183308-t22k-combat-vertical-slice-review -->
<!-- pandorha-inbox:20260512-182841-t22j-combat-user-guide -->
### T22J Combat User Guide
- id: 20260512-182841-t22j-combat-user-guide
- status: promoted
- created_at: 2026-05-12T18:28:41-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Guia criado em docs/user/combat-training.md — cobre teste com Aria, seleção de alvo, leitura da tela e versão de limites.
- promoted_to: docs/user/combat-training.md
<!-- /pandorha-inbox:20260512-182841-t22j-combat-user-guide -->
<!-- pandorha-inbox:20260512-182337-t22i-combat-encounter-outcome -->
### T22I Combat Encounter Outcome
- id: 20260512-182337-t22i-combat-encounter-outcome
- status: promoted
- created_at: 2026-05-12T18:23:37-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Implementado estado final quando alvo chega a 0 HP — bloqueio de ataque, encerramento de turno e botão de reiniciar encontro.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260512-182337-t22i-combat-encounter-outcome -->
<!-- pandorha-inbox:20260512-181508-t22h-combat-training-target-turn -->
### T22H Combat Training Target Turn
- id: 20260512-181508-t22h-combat-training-target-turn
- status: promoted
- created_at: 2026-05-12T18:15:08-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Turno do alvo de treino registrado no log sem IA, ataque ou dano inimigo.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260512-181508-t22h-combat-training-target-turn -->
<!-- pandorha-inbox:20260512-130258-t22g-combat-training-damage-profile -->
### T22G Combat Training Damage Profile
- id: 20260512-130258-t22g-combat-training-damage-profile
- status: promoted
- created_at: 2026-05-12T13:02:58-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Dano de treino usa Matriz Física do personagem selecionado com dado, bônus, ataque e equipamento determinísticos.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260512-130258-t22g-combat-training-damage-profile -->
<!-- pandorha-inbox:20260512-122140-t22f-combat-attacker-derived-stats -->
### T22F Combat Attacker Derived Stats
- id: 20260512-122140-t22f-combat-attacker-derived-stats
- status: promoted
- created_at: 2026-05-12T12:21:40-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: HP máximo, iniciativa e carga derivados do personagem selecionado exibidos no painel de combate via CharacterDerivedStatsService.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260512-122140-t22f-combat-attacker-derived-stats -->
<!-- pandorha-inbox:20260506-233712-t22e-combat-turn-state -->
### T22E Combat Turn State
- id: 20260506-233712-t22e-combat-turn-state
- status: promoted
- created_at: 2026-05-06T23:37:12-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Estado de turno implementado — rodada, turno ativo, 3 ações, consumo e encerramento via CombatTurnService.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260506-233712-t22e-combat-turn-state -->
<!-- pandorha-inbox:20260506-181931-t22d-combat-session-attacker -->
### T22D Combat Session Attacker
- id: 20260506-181931-t22d-combat-session-attacker
- status: promoted
- created_at: 2026-05-06T18:19:31-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Aba Combate conectada a personagens criados na sessão como atacantes; Aria mantida como fallback.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260506-181931-t22d-combat-session-attacker -->
<!-- pandorha-inbox:20260506-175209-t22c-combat-training-targets -->
### T22C Combat Training Targets
- id: 20260506-175209-t22c-combat-training-targets
- status: promoted
- created_at: 2026-05-06T17:52:09-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Catálogo visual de alvos de treino na aba Combate; troca de alvo reseta HP e log.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260506-175209-t22c-combat-training-targets -->
<!-- pandorha-inbox:20260506-123114-t22b-combat-vertical-slice-ui -->
### T22B Combat Vertical Slice UI
- id: 20260506-123114-t22b-combat-vertical-slice-ui
- status: promoted
- created_at: 2026-05-06T12:31:14-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Aba Combate com encontro fixo determinístico via CombatEncounterService; validado no browser.
- promoted_to: docs/changelog.md (Fases 9–12), docs/user/combat-training.md
<!-- /pandorha-inbox:20260506-123114-t22b-combat-vertical-slice-ui -->
<!-- pandorha-inbox:20260506-120924-t22a-combat-encounter-core -->
### T22A Combat Encounter Core
- id: 20260506-120924-t22a-combat-encounter-core
- status: promoted
- created_at: 2026-05-06T12:09:24-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: CombatEncounterService puro com ActionQueue, ResolutionService e DamagePipelineService — TDD 100%.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260506-120924-t22a-combat-encounter-core -->
<!-- pandorha-inbox:20260506-114519-t21-damage-pipeline-minimo -->
### T21 Damage Pipeline minimo
- id: 20260506-114519-t21-damage-pipeline-minimo
- status: promoted
- created_at: 2026-05-06T11:45:19-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: DamagePipelineService em src/shared/damage/ — fases Base/Crítico/Redução/Afinidade determinísticas.
- promoted_to: docs/changelog.md (Fases 9–12)
<!-- /pandorha-inbox:20260506-114519-t21-damage-pipeline-minimo -->
<!-- pandorha-inbox:20260506-000211-t20-actionqueue-minima -->
### T20 ActionQueue minima
- id: 20260506-000211-t20-actionqueue-minima
- status: promoted
- created_at: 2026-05-06T00:02:11-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: ActionQueueService em src/shared/action-queue/ — FIFO para sequenciamento, LIFO para interrupções, Result tipado.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260506-000211-t20-actionqueue-minima -->
<!-- pandorha-inbox:20260505-235005-t19-resolutionservice-core -->
### T19 ResolutionService core
- id: 20260505-235005-t19-resolutionservice-core
- status: promoted
- created_at: 2026-05-05T23:50:05-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: ResolutionService em src/shared/resolution/ — Teste Global com DiceService, graus de sucesso e Result tipado.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-235005-t19-resolutionservice-core -->
<!-- pandorha-inbox:20260505-231828-t18a-dice-service-core -->
### T18A dice service core
- id: 20260505-231828-t18a-dice-service-core
- status: promoted
- created_at: 2026-05-05T23:18:28-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: DiceService em src/shared/dice/ — RNG injetável, resultados tipados, testes determinísticos sem UI nem persistência.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-231828-t18a-dice-service-core -->
<!-- pandorha-inbox:20260505-190555-t17a-compendium-browser-ui -->
### T17A compendium browser UI
- id: 20260505-190555-t17a-compendium-browser-ui
- status: promoted
- created_at: 2026-05-05T19:05:55-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: CompendiumBrowser UI em src/features/compendium-browser/ — busca e exibição read-only do catálogo base.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-190555-t17a-compendium-browser-ui -->
<!-- pandorha-inbox:20260505-185244-t16a-compendium-base-catalog -->
### T16A compendium base catalog
- id: 20260505-185244-t16a-compendium-base-catalog
- status: promoted
- created_at: 2026-05-05T18:52:44-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: CompendiumCatalogService e CompendiumSearchService em src/entities/compendium/ — catálogo validado por Zod, Result pattern.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-185244-t16a-compendium-base-catalog -->
<!-- pandorha-inbox:20260505-180953-t15b-character-catalog-ui-integration -->
### T15B character catalog UI integration
- id: 20260505-180953-t15b-character-catalog-ui-integration
- status: promoted
- created_at: 2026-05-05T18:09:53-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Catálogos de classe e antecedente conectados ao criador/listagem de personagem; ids técnicos em inglês, labels pt-BR.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-180953-t15b-character-catalog-ui-integration -->
<!-- pandorha-inbox:20260505-131417-t15a-character-derived-stats-core -->
### T15A character derived stats core
- id: 20260505-131417-t15a-character-derived-stats-core
- status: promoted
- created_at: 2026-05-05T13:14:17-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: CharacterDerivedStatsService — cálculo de HP máximo, iniciativa base e limite de carga sem persistência de valores finais.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-131417-t15a-character-derived-stats-core -->
<!-- pandorha-inbox:20260505-085702-t14-background-schema -->
### T14 background schema
- id: 20260505-085702-t14-background-schema
- status: promoted
- created_at: 2026-05-05T08:57:02-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: BackgroundCatalogService em src/entities/background/ — catálogo read-only dos antecedentes oficiais com ids técnicos em inglês.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-085702-t14-background-schema -->
<!-- pandorha-inbox:20260505-084102-t13-character-class-schema -->
### T13 character class schema
- id: 20260505-084102-t13-character-class-schema
- status: promoted
- created_at: 2026-05-05T08:41:02-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: CharacterClassCatalogService em src/entities/character-class/ — catálogo das 4 classes oficiais com schema Drizzle-Zod.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-084102-t13-character-class-schema -->
<!-- pandorha-inbox:20260505-081342-t13a-character-ancestry-trait-selection -->
### T13A character ancestry trait selection
- id: 20260505-081342-t13a-character-ancestry-trait-selection
- status: promoted
- created_at: 2026-05-05T08:13:42-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: AncestryTraitSelectionService — integração de ancestralidades e traços ao formulário de criação com escolha de exatamente 3 traços.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260505-081342-t13a-character-ancestry-trait-selection -->
<!-- pandorha-inbox:20260503-221203-t12-ancestry-traits -->
### T12 ancestry traits
- id: 20260503-221203-t12-ancestry-traits
- status: promoted
- created_at: 2026-05-03T22:12:03-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: AncestryCatalogService e AncestryTraitSelectionService em src/entities/ancestry/ — catálogo textual, relação N:N, escolha de 3 traços no nível 1.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260503-221203-t12-ancestry-traits -->
<!-- pandorha-inbox:20260503-173935-t11-ancestry-schema -->
### T11 ancestry schema
- id: 20260503-173935-t11-ancestry-schema
- status: promoted
- created_at: 2026-05-03T17:39:35-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Entidade Ancestry com schema Drizzle-Zod, catálogo oficial, service read-only e fake em memória.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260503-173935-t11-ancestry-schema -->
<!-- pandorha-inbox:20260503-172645-t10-character-user-docs -->
### T10 character user docs
- id: 20260503-172645-t10-character-user-docs
- status: promoted
- created_at: 2026-05-03T17:26:45-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Guia criado em docs/user/character-creation.md — cobre criação 6/6, tabela de valores de exemplo e erros comuns.
- promoted_to: docs/user/character-creation.md
<!-- /pandorha-inbox:20260503-172645-t10-character-user-docs -->
<!-- pandorha-inbox:20260503-171537-t09-character-error-copy -->
### T09 character error copy
- id: 20260503-171537-t09-character-error-copy
- status: promoted
- created_at: 2026-05-03T17:15:37-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Mensagens pt-BR do formulário de criação de personagem refinadas sem alterar regras de domínio.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260503-171537-t09-character-error-copy -->
<!-- pandorha-inbox:20260503-135734-t08-character-create-form -->
### T08 character create form
- id: 20260503-135734-t08-character-create-form
- status: promoted
- created_at: 2026-05-03T13:57:34-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Fluxo de criação de personagem 6/6 em src/features/character-create/ com estado de sessão e listagem atualizada.
- promoted_to: docs/changelog.md (Fases 1–4), docs/user/character-creation.md
<!-- /pandorha-inbox:20260503-135734-t08-character-create-form -->
<!-- pandorha-inbox:20260503-131425-t07-character-list-ui -->
### T07 character list UI
- id: 20260503-131425-t07-character-list-ui
- status: promoted
- created_at: 2026-05-03T13:14:25-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Tela read-only de listagem de personagens em src/features/character-list/ com estado vazio navegável.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260503-131425-t07-character-list-ui -->
<!-- pandorha-inbox:20260503-124608-t06-characters-migration -->
### T06 characters migration
- id: 20260503-124608-t06-characters-migration
- status: promoted
- created_at: 2026-05-03T12:46:08-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Migration inicial da entidade Character configurada e validada via Drizzle — drizzle/0000_*.sql.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260503-124608-t06-characters-migration -->
<!-- pandorha-inbox:20260502-231441-navegacao-state-driven-inicial -->
### Navegacao state-driven inicial
- id: 20260502-231441-navegacao-state-driven-inicial
- status: promoted
- created_at: 2026-05-02T23:14:41-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Navegação local por estado entre Inicio, Personagens e Compendio implementada em App.svelte sem router externo.
- promoted_to: docs/changelog.md (Fases 1–4), docs/adr/ADR-003-vite-sem-sveltekit.md
<!-- /pandorha-inbox:20260502-231441-navegacao-state-driven-inicial -->
<!-- pandorha-inbox:20260502-230859-regra-de-planejamento-obrigatorio -->
### Regra de planejamento obrigatorio
- id: 20260502-230859-regra-de-planejamento-obrigatorio
- status: promoted
- created_at: 2026-05-02T23:08:59-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Regra registrada em AGENTS.md (Mandatory Planning Before Implementation) e llms.txt (MANDATORY PLANNING CONTRACT).
- promoted_to: AGENTS.md, llms.txt
<!-- /pandorha-inbox:20260502-230859-regra-de-planejamento-obrigatorio -->
<!-- pandorha-inbox:20260502-224801-scaffold-minimo-svelte-vite -->
### Scaffold minimo Svelte Vite
- id: 20260502-224801-scaffold-minimo-svelte-vite
- status: promoted
- created_at: 2026-05-02T22:48:01-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: App Svelte 5/Vite mínima com tela inicial — index.html, src/main.ts, src/app/App.svelte, vite.config.mjs.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260502-224801-scaffold-minimo-svelte-vite -->
<!-- pandorha-inbox:20260502-223501-documentar-plano-completo-do-jogo -->
### Documentar plano completo do jogo
- id: 20260502-223501-documentar-plano-completo-do-jogo
- status: promoted
- created_at: 2026-05-02T22:35:01-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Guia criado em docs/process/complete-game-implementation-guide.md e docs/process/microtask-delivery-plan.md.
- promoted_to: docs/process/complete-game-implementation-guide.md, docs/process/microtask-delivery-plan.md
<!-- /pandorha-inbox:20260502-223501-documentar-plano-completo-do-jogo -->
<!-- pandorha-inbox:20260502-202511-implement-unified-quality-gate -->
### Implement unified quality gate
- id: 20260502-202511-implement-unified-quality-gate
- status: promoted
- created_at: 2026-05-02T20:25:11-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: scripts/run_full_quality_gate.mjs implementado; npm run quality:gate disponível; documentação atualizada.
- promoted_to: docs/process/automation-spec.md
<!-- /pandorha-inbox:20260502-202511-implement-unified-quality-gate -->
<!-- pandorha-inbox:20260502-201538-qa-roadmap-for-implemented-systems -->
### QA roadmap for implemented systems
- id: 20260502-201538-qa-roadmap-for-implemented-systems
- status: promoted
- created_at: 2026-05-02T20:15:39-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Roadmap criado em docs/process/testing-and-next-steps-roadmap.md.
- promoted_to: docs/process/testing-and-next-steps-roadmap.md
<!-- /pandorha-inbox:20260502-201538-qa-roadmap-for-implemented-systems -->
<!-- pandorha-inbox:20260502-114935-tracer-bullet-character-domain -->
### Tracer bullet Character domain
- id: 20260502-114935-tracer-bullet-character-domain
- status: promoted
- created_at: 2026-05-02T11:49:35-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: CharacterService com schema Drizzle, service Result-based, InMemoryCharacterRepository e TDD 100% — tracer bullet completo.
- promoted_to: docs/changelog.md (Fases 1–4)
<!-- /pandorha-inbox:20260502-114935-tracer-bullet-character-domain -->
<!-- pandorha-inbox:20260501-013428-implement-zero-token-maintenance-automation -->
### Implement zero-token maintenance automation
- id: 20260501-013428-implement-zero-token-maintenance-automation
- status: promoted
- created_at: 2026-05-01T01:34:28-03:00
- promoted_at: 2026-05-31T12:00:00-03:00
- summary: Workflow completo Opção A — docs/process/automation-spec.md, task-ledger.md, change-inbox.md, changelog.md, scripts/pandorha_process_automation.py, hooks git.
- promoted_to: docs/process/automation-spec.md
<!-- /pandorha-inbox:20260501-013428-implement-zero-token-maintenance-automation -->
<!-- /pandorha-inbox:promoted -->
