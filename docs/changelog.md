# Changelog

This file receives zero-token promotion summaries after changes reach `main`.

Detailed architectural decisions belong in `docs/adr/`. RPG and business rules remain in `docs/system/`.

<!-- pandorha-changelog:main -->
## 2026-06-12T23:13:21-03:00 - master merge promotion candidate
- branch: master
- commit: 9ad67a7 chore(ledger): atualiza logs de tarefas da Fase 3 no task ledger
- changed_files_count: 140
- review_model: gpt-5.5 high-reasoning final review; local automation zero-token
#### Changed Files
- "docs/antigravity criador de sdd a partir de projeto completo.code-workspace"
- docs/system/rpg-rules-manifest.json
- drizzle.config.mjs
- drizzle/meta/0007_snapshot.json
- drizzle/meta/0008_snapshot.json
- drizzle/meta/0009_snapshot.json
- drizzle/meta/0010_snapshot.json
- drizzle/meta/0011_snapshot.json
- drizzle/meta/0012_snapshot.json
- drizzle/meta/0013_snapshot.json
- drizzle/meta/0014_snapshot.json
- drizzle/meta/0015_snapshot.json
- drizzle/meta/0016_snapshot.json
- drizzle/meta/0017_snapshot.json
- drizzle/meta/0018_snapshot.json
- drizzle/meta/0019_snapshot.json
- drizzle/meta/0020_snapshot.json
- drizzle/meta/0021_snapshot.json
- drizzle/meta/0022_snapshot.json
- drizzle/meta/0023_snapshot.json
- drizzle/meta/0024_snapshot.json
- drizzle/meta/0025_snapshot.json
- drizzle/meta/0026_snapshot.json
- drizzle/meta/0027_snapshot.json
- drizzle/meta/_journal.json
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- package.json
- src/app/App.svelte
- src/app/model/hexcrawlSession.ts
- src/app/model/navigation.ts
- src/app/styles.css
- src/entities/ancestry/index.ts
- src/entities/ancestry/infrastructure/DrizzleAncestryRepository.ts
- src/entities/ancestry/infrastructure/DrizzleAncestryTraitRepository.ts
- src/entities/ancestry/infrastructure/__tests__/DrizzleAncestryRepository.spec.ts
- src/entities/background/index.ts
- src/entities/background/infrastructure/DrizzleBackgroundRepository.ts
- src/entities/background/infrastructure/__tests__/DrizzleBackgroundRepository.spec.ts
- src/entities/character-class/index.ts
- ... 100 more
#### Promotion Review
- Done: merge detected on main and changelog promotion candidate created
- Next: model final review should decide whether ADR, system docs, conventions, or llms.txt need updates
- Risks: semantic promotion still requires human/model judgment
- Improvements: include task ids in commit messages for tighter traceability
## 2026-06-13T02:10:00-03:00 - Fase 3: Lore, Eventos Narrativos, Bastião, Clocks, SQLite e PWA
- branch: master
- commit: consolidado (Fase 3, Tarefas 10 a 25)
- fases_cobertas: Fase 3 Completa (Lore, Diálogos, Investigação, Companhia Mercenária, Espionagem, Clocks de Facção, Defesa de Cerco, SQLite WASM Drizzle, PWA).
- entidades_criadas: `entities/siege` (SiegeService, InMemorySiegeRepository, WorkerSiegeRepository, DrizzleSiegeRepository), `entities/social` (PatronageService, WorkerFactionRepository), `entities/equipment` (SynergyForgeService), `entities/investigation` (ResearchService)
- features_criadas: `features/quests` (QuestsPanel.svelte, QuestTracker.svelte), `features/investigation` (InvestigationPanel.svelte), `features/mercenary` (MercenaryCompanyPanel.svelte), `features/espionage` (EspionageManagementPanel.svelte), `features/social` (FactionTeiaPanel.svelte)
- db_schemas: `siegeSchema`, `socialSchema` (pactos e standing), `equipmentSchema` (synergy), `investigationSchema`
- migrations: 0025_tan_greymalkin, 0026_colossal_violations, 0027_absurd_blink
- qualidade: Cobertura global de branches mantida em 97.02%, biome check sem erros, validate svelte syntax passado.
#### Promotion Review
- Done: Consolidação de todas as 25 tarefas executadas com testes verdes.
- Next: Iniciar o planejamento da Fase 4 (Downtime expandido e Economia).
- Risks: Nenhum.

---

## 2026-06-10T12:37:00-03:00 - master merge promotion candidate
- branch: master
- commit: ad2ff2a feat(combat-survival): implement tactical combat loop, dynamic encounters and advanced testing suite
- changed_files_count: 0
- review_model: gpt-5.5 high-reasoning final review; local automation zero-token
#### Changed Files
- none
#### Promotion Review
- Done: merge detected on main and changelog promotion candidate created
- Next: model final review should decide whether ADR, system docs, conventions, or llms.txt need updates
- Risks: semantic promotion still requires human/model judgment
- Improvements: include task ids in commit messages for tighter traceability
## 2026-06-09 - Doc Sync: Fases 68–72 em Progresso (Loop Tático e Sobrevivência)
- branch: task/combat-survival
- status: **EM ANDAMENTO** — task `loop-tatico-e-sobrevivencia` (iniciada 2026-06-04)
- commit_at_start: 5ab4129 style: format App entrypoint and update task ledger logs
- escopo: Implementação das Fases 68 a 72 do Pandorha Engine
- fases_planejadas:
  - **Fase 68** — Transição mapa↔combate via `active_sessions` (ADR-009): HexcrawlMovementService dispara encontro → persiste combat_encounter_id → App.svelte reage reativamente
  - **Fase 69** — IA Tática de Criaturas (ADR-010): TacticalAiService com Papéis Táticos (Bruto/Assassino/Suporte) e prioridade de alvo na ActionQueue
  - **Fase 70** — Loots Atômicos SQLite (ADR-011): CombatLootService persiste XP, cobres e itens em transação única ao encerrar encontro
  - **Fase 71** — Mercenários por Ticks de Exploração (ADR-012): MercenaryDispatchService consome Turnos de Exploração reais
  - **Fase 72** — Climatologia Reativa (ADR-013): ProgressClock regional controla penalidades de marcha e abrigo
- adrs_cobertas: ADR-009, ADR-010, ADR-011, ADR-012, ADR-013
#### Promotion Review
- Done: documentação sincronizada; llms.txt atualizado com ADRs 007–013; feature-coverage-map.md inclui entities/combat; task ledger reflete status in-progress
- Next: completar implementação das Fases 68–72 e promover ao changelog após merge para main
- Risks: IA tática (ADR-010) pode introduzir não-determinismo se Math.random() vazar — garantir IRng injetável; GMSandbox com mutação direta de estado pode conflitar com active_sessions durante transição de combate
- Improvements: adicionar testes de integração fim-a-fim para ciclo hexcrawl→combate→loot→return

---

## 2026-06-04T23:59:00-03:00 - Fases 51–67+: Siege, Lore, Chat, GM Sandbox, RPC Cache
- branch: main
- commit: consolidado (Phases 51–67, 2026-06-01 a 2026-06-04)
- fases_cobertas: Fase 51 (SiegeService), Fase 52 (integração Bastião×Cerco), Fase 53 (HexcrawlMovement refactor), Fase 54 (RPC Cache global), Fase 55 (ClockService triggers avançados), Fase 56 (ChatLog + GM Mode + isGmOnly), Fase 57 (LoreService + GMSandbox), Fase 59 (GMSandboxPanel RPC direto), Fase 65 (NegotiationPanel + CountermagicService UI completa), Fase 67 (polish e integração final)
- entidades_criadas: `entities/siege` (SiegeService, InMemorySiegeRepository, DrizzleSiegeRepository, siegeSchema), `entities/lore` (LoreService, InMemoryLoreRepository, DrizzleLoreRepository)
- features_criadas: `features/chat` (ChatLog.svelte, RollModifiersDrawer.svelte, chatState), `features/sandbox` (GMSandboxPanel.svelte)
- features_atualizadas: `features/social` (NegotiationPanel.svelte completo, FactionPanel.svelte, SocialDemo.svelte, SocialStandings.svelte, BargainWindow.svelte — UI agora completa)
- infra_atualizada: `src/shared/rpc/model/rpcCache.ts` (cache global na thread principal, latência < 16ms)
#### Promotion Review
- Done: SiegeService com 100% TDD; LoreService integrado ao HexcrawlMovementService; ChatLog com filtro GM isGmOnly; GMSandboxPanel operacional; RPC Cache reduz latência para < 16ms; NegotiationPanel finalizado com CountermagicService; todas as fases com cobertura de testes
- Next: integrar SiegeService ao ciclo de Downtime do Bastião; expandir GM Sandbox com eventos de clima; features/research e features/survival ainda pendentes
- Risks: GMSandbox com mutação direta de estado via RPC pode gerar inconsistências se Worker estiver em transação longa; rpcCache pode retornar dados stale em janelas de sincronização OPFS
- Improvements: adicionar TTL ao rpcCache para invalidação automática; documentar protocolo de resolução de conflito Siege×ClockService

---

## 2026-05-31T12:00:00-03:00 - Atualização consolidada de documentação
- branch: main
- summary: Atualização completa dos docs de desenvolvimento para refletir o estado real do código (29+ fases concluídas)
- changed_files: sdd.md, core-conventions.md, CONTEXT.md, llms.txt, llms-full.txt, worker_rpc_spec.md, rpg-rules-manifest.json, change-inbox.md, docs/adr/ (6 novos ADRs), feature-coverage-map.md, arquivos planejamento obsoletos
#### Promotion Review
- Done: correção de erros factuais (Comlink, SvelteKit, Husky); promoção do change-inbox; criação de ADRs; expansão de CONTEXT.md
- Next: expandir feature-coverage-map.md à medida que novas features ficam prontas; manter changelog após cada merge
- Risks: docs de sistema (docs/system/) são muito mais ricos que a implementação atual — gap intencional enquanto o código avança
- Improvements: automatizar promoção do changelog via pandorha_process_automation.py post-merge

---

## 2026-05-22T18:13:24-03:00 - Hexcrawl/EncounterService UI Integration
- branch: master
- commit: c69f3b1 feat(hexcrawl): integracao do EncounterService com a UI e correcoes do linter/testes
- changed_files_count: 44
- review_model: gpt-5.5 high-reasoning final review; local automation zero-token
#### Changed Files (amostra)
- drizzle/meta/0000_snapshot.json → 0006_snapshot.json (6 migrations)
- mcp/pandorha-arch-guard/, mcp/pandorha-db-auditor/, mcp/pandorha-knowledge/, mcp/pandorha-memory-bridge/ (MCPs)
- scripts/pandorha_process_automation.py, skills-lock.json
- src/entities/world-tile/__tests__/EncounterService.spec.ts
#### Promotion Review
- Done: merge detectado no main; changelog promotion candidate criado
- Next: model final review sobre ADR, system docs, conventions, llms.txt
- Risks: promoção semântica ainda requer julgamento humano/modelo
- Improvements: incluir task ids em commit messages para rastreabilidade

---

## 2026-05-20T00:00:00-03:00 - Fases 21–26: Sistemas de Mundo Avançados
- branch: main (múltiplos merges)
- fases_cobertas: Fase 21 (Factions/Social), Fase 22 (Companions/Familiars), Fase 23 (Synergy/Tactical Forge), Fase 24 (Dialogues/Social Combat), Fase 25 (Regional Domain/Espionage), Fase 26 (Mercenary Companies)
- entidades_criadas: social (FactionService, PatronageService), companions (CompanionService), synergy (SynergyService), dialogue (DialogueService), domain-regional (RegionalDomainService), espionage (EspionageService), mercenary (MercenaryService)
- features_criadas: features/social (SocialCombatService, SocialStandingService, BargainCalculator, DispositionCalculator), features/dialogue (DialogueWindow.svelte), features/domain-regional (DomainCouncilPanel.svelte), features/espionage, features/mercenary
- db_schemas: socialSchema, companionsSchema, synergySchema, dialogueSchema, domainRegionalSchema, espionageSchema, mercenarySchema
- migrations: 0010 → 0014
#### Promotion Review
- Done: sistemas de mundo e social completamente implementados com testes TDD
- Next: investigação, camp, hexcrawl encontro
- Risks: UI para sistemas de mundo ainda em shell; App.svelte crescendo

---

## 2026-05-18T00:00:00-03:00 - Fases 17–20: Bastião, Clocks, PWA, Saves
- branch: main (múltiplos merges)
- fases_cobertas: Fase 17 (Bastion), Fase 18 (Downtime Projects), Fase 19 (Progress Clocks), Fase 20 (PWA + Service Worker)
- entidades_criadas: bastion (BastionService), clocks (ClockService via features), camp (CampService + recoveryDecorators)
- features_criadas: features/bastion (BastionPanel.svelte, DowntimeProjectList.svelte), features/clocks (ClockDemo.svelte), features/camp (CampPanel)
- db_schemas: bastionSchema, clocksSchema, campSchema
- migrations: 0007 → 0009
- infra: public/sw.js (Service Worker PWA offline-first)
#### Promotion Review
- Done: bastião e downtime funcionais; PWA offline após primeiro carregamento
- Next: fações e sistema social
- Risks: App.svelte como único orquestrador está crescendo em complexidade

---

## 2026-05-15T00:00:00-03:00 - Fases 13–16: SQLite WASM, Persistence, Saves
- branch: main (múltiplos merges)
- fases_cobertas: Fase 13 (SQLite WASM Worker), Fase 14 (OPFS Bootstrap), Fase 15 (Drizzle Migrations), Fase 16 (RPC Bridge + FakeWorker)
- modulos_criados: src/shared/persistence/ (SqliteOpfsBootstrapService, BrowserOpfsDatabaseStorage, databaseWorkerHandler, pandorhaDatabase.worker.ts), src/shared/rpc/ (RPCResponse schema, FakeWorkerService)
- db_migrations: migration automática no bootstrap via Drizzle
- infra: drizzle.config.mjs configurado com 16 schema files
#### Promotion Review
- Done: persistência local-first completamente funcional sem dependência de servidor
- Next: bastião, downtime, clocks
- Risks: SqliteOpfsBootstrapService extremamente complexo (105KB); testar em múltiplos navegadores

---

## 2026-05-12T00:00:00-03:00 - Fases 9–12: Combat Vertical Slice (T22A–T22K)
- branch: main (múltiplos merges — T22A até T22K concluídos)
- commit_final: T22 combat vertical slice review completo
- fases_cobertas: T21 (DamagePipelineService), T22A (CombatEncounterService), T22B (CombatEncounterPanel UI), T22C (Training Targets), T22D (Session Attacker), T22E (Turn State), T22F (Derived Stats), T22G (Damage Profile), T22H (Target Turn), T22I (Encounter Outcome), T22J (User Guide), T22K (Review)
- modulos_criados: src/shared/action-queue/, src/shared/damage/, src/shared/resolution/, src/features/combat-encounter/ (CombatEncounterService, CombatTurnService, CombatLootService, TacticalAiService, CraftingDamageDecorators)
- testes: CombatEncounterService.spec, CombatTurnService.spec, CombatLootService.spec, TacticalAiService.spec, CombatInventoryIntegration.spec
- user_doc: docs/user/combat-training.md criado
#### Promotion Review
- Done: combat vertical slice jogável no browser; sistema de turnos com 3A/1R/F, MAP, resolução de ataque/dano
- Next: inventory, equipment, magic
- Risks: CombatEncounterPanel ainda sem UI de magia ou condições visuais

---

## 2026-05-08T00:00:00-03:00 - Fases 5–8: Inventory, Equipment, Magic, Spells
- branch: main (múltiplos merges)
- fases_cobertas: T23 (Equipment Schema + EquipmentCatalogService), T24 (InventoryCapacityService), T25 (Inventory Read-Only UI), T26 (Spell Schema), T27 (SpellCastBuilder), T28 (Magic UI)
- entidades_criadas: equipment (EquipmentCatalogService, CraftingService, InventoryService), spell (SpellCatalogService), compendium (CompendiumCatalogService, CompendiumSearchService)
- features_criadas: features/inventory-readonly (InventoryReadOnlyPanel), features/spell-cast (SpellCastBuilderService, SpellCastPanel), features/crafting (CraftingWorkshopPanel.svelte)
- modulos_shared: src/shared/inventory/ (InventoryCapacityService)
#### Promotion Review
- Done: catálogo de itens e magias funcional; builder de conjuração com Weaving e Metamagia
- Next: SQLite WASM, saves, persistência real
- Risks: inventory e spell ainda sem persistência real (só sessão em memória)

---

## 2026-05-05T00:00:00-03:00 - Fases 1–4: Character Domain, FSD, Compendium, Dice
- branch: main (múltiplos merges)
- fases_cobertas: T01 (scaffold Svelte/Vite), T06 (characters migration), T07 (character list UI), T08 (character create form), T09–T10 (error copy + user docs), T11–T13A (ancestry, traits, class schemas), T14 (background schema), T15A–T15B (derived stats), T16A–T17A (compendium), T18A (DiceService), T19 (ResolutionService), T20 (ActionQueueService)
- entidades_criadas: character (CharacterService, CharacterDerivedStatsService, IllnessService, StatusEffectDecorator), ancestry, background, character-class (catálogos com InMemoryRepository + FakeRepository TDD)
- features_criadas: features/character-create, features/character-list, features/compendium-browser
- modulos_shared: src/shared/dice/ (DiceService), src/shared/resolution/ (ResolutionService), src/shared/action-queue/, src/shared/lib/ (result.ts, id.ts)
- infra: drizzle migrations 0000–0006, `src/shared/game-rules.ts` (PANDORHA_RULES)
- user_doc: docs/user/character-creation.md criado
#### Promotion Review
- Done: tracer bullet completo; personagem criável no browser com TDD 100% em todos os services
- Next: combat vertical slice
- Risks: App.svelte ainda pequeno, mas vai crescer com a navegação de sessão
<!-- /pandorha-changelog:main -->
