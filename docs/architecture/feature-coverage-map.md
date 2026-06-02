# Feature Coverage Map

> **Propósito:** Mapa vivo do estado de implementação do Pandorha Engine.
> **Atualizado em:** 2026-05-31
> **Legenda:** ✅ Implementado · 🔧 Parcial · ❌ Não implementado · 📋 System doc existe

---

## Módulos Transversais (src/shared/)

| Módulo | Service / Util | Tests | DB Schema | System Doc | Notes |
|:---|:---:|:---:|:---:|:---:|:---|
| `shared/dice` | ✅ DiceService | ✅ | — | ✅ | IRng injetável para determinismo |
| `shared/resolution` | ✅ ResolutionService | ✅ | — | ✅ | Graus de sucesso, Teste Global |
| `shared/damage` | ✅ DamagePipelineService | ✅ | — | ✅ | 4 fases determinísticas |
| `shared/action-queue` | ✅ ActionQueueService | ✅ | — | ✅ | FIFO + LIFO para interrupções |
| `shared/rpc` | ✅ RPCResponse schema, FakeWorkerService | ✅ | — | ✅ ADR-001 | Bridge customizado, sem Comlink |
| `shared/persistence` | ✅ SqliteOpfsBootstrapService | ✅ | ✅ | ✅ ADR-004 | Módulo mais complexo do projeto |
| `shared/inventory` | ✅ InventoryCapacityService | ✅ | — | ✅ | Carga: Físico + Resistência + 6 |
| `shared/lib` | ✅ result.ts, id.ts | ✅ | — | ✅ ADR-005 | ok() / fail() helpers |
| `shared/game-rules` | ✅ PANDORHA_RULES | ✅ | — | ✅ | Fonte de verdade matemática |

---

## Entities (src/entities/)

| Entidade | Service | Repository | Tests | DB Schema | System Doc | Notes |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| `ancestry` | ✅ AncestryCatalogService | ✅ InMemory | ✅ | ❌ (catalog only) | ✅ | 6 ancestralidades oficiais |
| `background` | ✅ BackgroundCatalogService | ✅ InMemory | ✅ | ❌ (catalog only) | ✅ | Catálogo read-only |
| `bastion` | ✅ BastionService | ✅ InMemory | ✅ | ✅ | ✅ | Módulos e projetos de downtime |
| `camp` | ✅ CampService | ✅ InMemory | ✅ | ✅ | ✅ | Atividades de descanso, recoveryDecorators |
| `character` | ✅ CharacterService + DerivedStatsService + IllnessService + StatusEffectDecorator | ✅ InMemory | ✅ | ✅ | ✅ | Entidade core do projeto |
| `character-class` | ✅ CharacterClassCatalogService | ✅ InMemory | ✅ | ❌ (catalog only) | ✅ | 4 classes oficiais |
| `clocks` | ✅ ClockService | ✅ InMemory | ✅ | ✅ | 📋 | Progress Clocks com triggers |
| `companions` | ✅ CompanionService | ✅ InMemory | ✅ | ✅ | ✅ | Companions + Familiares |
| `compendium` | ✅ CompendiumCatalogService + SearchService | ✅ InMemory | ✅ | ❌ (catalog) | ✅ | Catálogo de itens, magias, criaturas |
| `dialogue` | ✅ DialogueService | ✅ InMemory | ✅ | ✅ | 📋 | AST de diálogos com HP Mental |
| `domain-regional` | ✅ RegionalDomainService | ✅ InMemory | ✅ | ✅ | 📋 | Conselho e projetos regionais |
| `dungeon` | 🔧 DungeonService (parcial) | 🔧 | ✅ | ❌ | 📋 | Em progresso |
| `equipment` | ✅ EquipmentCatalogService + CraftingService + InventoryService | ✅ InMemory | ✅ | ✅ | ✅ | Itens únicos e consumíveis |
| `espionage` | ✅ EspionageService | ✅ InMemory | ✅ | ✅ | 📋 | Missões de espionagem e infiltração |
| `investigation` | ✅ InvestigationService | ✅ InMemory | ✅ | ✅ | 📋 | Pistas, revelações, resolução |
| `mercenary` | ✅ MercenaryService | ✅ InMemory | ✅ | ✅ | 📋 | Companhias mercenárias |
| `quest` | ✅ QuestService | ✅ InMemory | ✅ | ✅ | 📋 | Missões e objetivos |
| `social` | ✅ FactionService + PatronageService | ✅ InMemory | ✅ | ✅ | ✅ | Fama, Dívida, Patrocínio |
| `spell` | ✅ SpellCatalogService | ✅ InMemory | ✅ | ❌ (catalog) | ✅ | Catálogo read-only de magias |
| `synergy` | ✅ SynergyService | ✅ InMemory | ✅ | ✅ | ✅ | Forja Tática 2/3 passos |
| `traps` | ✅ TrapService | ✅ InMemory | ✅ | ✅ | ✅ | Detecção e resolução de armadilhas |
| `world-state` | ✅ WorldStateService | ✅ InMemory | ✅ | ✅ | 📋 | Key-Value do estado do mundo |
| `world-tile` | ✅ WorldTileService + EncounterService | ✅ InMemory | ✅ | ✅ | ✅ | Grid axial (q,r), encontros por tier |

**Total entities:** 23 · **Completos:** 21 · **Parciais:** 1 · **Não iniciados:** 0 · **Sem schema DB:** 6 (catalog-only)

---

## Features (src/features/)

| Feature | Orquestra | UI (Svelte) | Tests Integração | System Doc | Notes |
|:---|:---:|:---:|:---:|:---:|:---|
| `bastion` | ✅ | ✅ BastionPanel, DowntimeProjectList | ✅ | ✅ | Integrado à sessão |
| `camp` | ✅ | ✅ CampPanel | ✅ | ✅ | Atividades + recoveryDecorators |
| `character-create` | ✅ | ✅ | ✅ | ✅ | Fluxo 6/6 com catálogos |
| `character-list` | ✅ | ✅ | ✅ | ✅ | Read-only com estado vazio |
| `clocks` | ✅ | 🔧 ClockDemo | ✅ | 📋 | UI demo apenas |
| `combat` | 🔧 | 🔧 | 🔧 | ✅ | Combate tático real (AI de inimigos em progresso) |
| `combat-encounter` | ✅ CombatEncounterService + TacticalAiService | ✅ CombatEncounterPanel | ✅ | ✅ | Training mode funcional |
| `compendium-browser` | ✅ | ✅ | ✅ | ✅ | Busca e exibição read-only |
| `crafting` | ✅ CraftingService | ✅ CraftingWorkshopPanel | ✅ | ✅ | Forja de itens |
| `dialogue` | ✅ | ✅ DialogueWindow | ✅ | 📋 | AST de diálogos |
| `domain-regional` | ✅ | ✅ DomainCouncilPanel | ✅ | 📋 | Projetos e facções regionais |
| `espionage` | ✅ | 🔧 | ✅ | 📋 | Lógica pronta, UI parcial |
| `hexcrawl-map` | ✅ HexcrawlMovementService | 🔧 | ✅ | ✅ | Grid + movimento; integração com EncounterService em progresso |
| `inventory` | ✅ InventoryService (leitura/escrita) | 🔧 | ✅ | ✅ | Escrita implementada, UI parcial |
| `inventory-readonly` | ✅ | ✅ InventoryReadOnlyPanel | ✅ | ✅ | Exibição + carga calculada |
| `investigation` | ✅ | 🔧 | ✅ | 📋 | Lógica pronta, UI parcial |
| `magic` | ✅ | 🔧 | ✅ | ✅ | Catálogo e seleção de magia na UI |
| `mercenary` | ✅ | 🔧 | ✅ | 📋 | Lógica pronta, UI parcial |
| `quests` | ✅ | 🔧 | ✅ | 📋 | Lógica pronta, UI parcial |
| `research` | 🔧 | 🔧 | 🔧 | 📋 | Em progresso |
| `saves` | ✅ SaveService | 🔧 SavePanel | ✅ | ✅ | Import/export JSON |
| `social` | ✅ SocialCombatService + SocialStandingService | 🔧 | ✅ | ✅ | Lógica completa, UI parcial |
| `spell-cast` | ✅ SpellCastBuilderService | ✅ SpellCastPanel | ✅ | ✅ | Builder com Weaving + Metamagia |
| `survival` | ❌ | ❌ | ❌ | ✅ | Não iniciado (68 system docs prontos) |
| `traps` | ✅ | 🔧 | ✅ | ✅ | Lógica completa, UI parcial |

**Total features:** 25 · **UI Completa:** 10 · **Lógica completa, UI parcial:** 10 · **Em progresso:** 4 · **Não iniciados:** 1 (survival)

---

## Gaps Prioritários

### Implementação × System Docs (funcional mas sem UI)
- `features/espionage`, `features/investigation`, `features/mercenary`, `features/quests`, `features/social` — lógica 100% TDD mas sem painéis de UI para o jogador
- `features/combat` — combate tático real com IA de inimigos está em progresso (combate de treino funciona)

### System Docs × Implementação (docs existem, código não)
- `features/survival` — 68 system docs cobrem sobrevivência, exploração e economia; **nenhum código implementado**
- `entities/dungeon` — dungeon procedural está parcial

### DB Schema Faltando (catálogos read-only)
- `entities/ancestry`, `entities/background`, `entities/character-class`, `entities/spell` — catálogos serializados em código; migração para SQLite seria útil para busca dinâmica

---

## Histórico de Atualizações

| Data | Motivo | Entities | Features |
|:---|:---|:---:|:---:|
| 2026-05-31 | Criação inicial do mapa | 23 | 25 |
