# Changelog

This file receives zero-token promotion summaries after changes reach `main`.

Detailed architectural decisions belong in `docs/adr/`. RPG and business rules remain in `docs/system/`.

<!-- pandorha-changelog:main -->

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
