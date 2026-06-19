# Feature Coverage Map

> **Propósito:** Mapa vivo do estado de implementação do Pandorha Engine.
> **Atualizado em:** 2026-06-15
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
| `campaign` | ✅ CampaignEventService | ✅ InMemory + Drizzle | ✅ | ✅ | 📋 ADR-018 | Barramento de efeitos colaterais cross-domain (cerco, clima, emboscada) |
| `downtime` | ✅ DowntimeService | ✅ InMemory + Worker | ✅ | ✅ | 📋 ADR-017 | 8 Atividades de Recesso semanais (Tags A–H) |
| `ancestry` | ✅ AncestryCatalogService | ✅ InMemory | ✅ | ❌ (catalog only) | ✅ | 6 ancestralidades oficiais |
| `background` | ✅ BackgroundCatalogService | ✅ InMemory | ✅ | ❌ (catalog only) | ✅ | Catálogo read-only |
| `bastion` | ✅ BastionService | ✅ InMemory | ✅ | ✅ | ✅ | Módulos e projetos de infraestrutura do Bastião |
| `camp` | ✅ CampService | ✅ InMemory | ✅ | ✅ | ✅ | Atividades de descanso, recoveryDecorators |
| `character` | ✅ CharacterService + DerivedStatsService + IllnessService + StatusEffectDecorator | ✅ InMemory | ✅ | ✅ | ✅ | Entidade core do projeto |
| `character-class` | ✅ CharacterClassCatalogService | ✅ InMemory | ✅ | ❌ (catalog only) | ✅ | 4 classes oficiais |
| `clocks` | ✅ ClockService | ✅ InMemory | ✅ | ✅ | 📋 | Progress Clocks com triggers |
| `companions` | ✅ CompanionService | ✅ InMemory | ✅ | ✅ | ✅ | Companions + Familiares |
| `compendium` | ✅ CompendiumCatalogService + SearchService | ✅ InMemory | ✅ | ❌ (catalog) | ✅ | Catálogo de itens, magias, criaturas |
| `dialogue` | ✅ DialogueService | ✅ InMemory | ✅ | ✅ | 📋 | AST de diálogos com HP Mental |
| `domain-regional` | ✅ RegionalDomainService | ✅ InMemory | ✅ | ✅ | 📋 | Conselho e projetos regionais |
| `dungeon` | 🔧 DungeonService (parcial) | 🔧 | ✅ | ❌ | 📋 | Service parcial; UI de DungeonMap na feature `dungeon-crawler` |
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
| `siege` | ✅ SiegeService | ✅ InMemory | ✅ | ✅ | 📋 ADR-016 | Eventos de cerco ao Bastião |
| `lore` | ✅ LoreService | ✅ InMemory | ✅ | ✅ | 📋 | Encontros narrativos via lore_encounters + campaign_rumors |
| `combat` | 🔧 Infra completa (3 repos + schema); **CombatService ausente** | 🔧 InMemory + Drizzle + Worker | ❌ | ✅ | ✅ ADR-009/010/011 | Infra pronta; domain service ainda não implementado |

**Total entities:** 28 · **Completos:** 25 · **Parciais:** 2 (`dungeon`, `combat`) · **Não iniciados:** 0 · **Sem schema DB:** 6 (catalog-only)

---

## Features (src/features/)

| Feature | Orquestra | UI (Svelte) | Tests Integração | System Doc | Notes |
|:---|:---:|:---:|:---:|:---:|:---|
| `campaign-timeline` | ✅ CampaignTimelinePanel | ✅ CampaignTimelinePanel.svelte | ✅ | 📋 ADR-018 | Linha do Tempo de Eventos de Campanha |
| `downtime` | ✅ DowntimePanel (orquestra DowntimeService) | ✅ DowntimePanel.svelte | ✅ | 📋 ADR-017 | 8 Atividades de Recesso semanais (Tags A–H) |
| `dungeon-crawler` | ❌ sem orquestração | 🔧 DungeonMap.svelte (26KB, sem spec) | ❌ | 📋 | UI parcial; domain service ausente |
| `bastion` | ✅ | ✅ BastionPanel, DowntimeProjectList | ✅ | ✅ | Integrado à sessão |
| `camp` | ✅ | ✅ CampPanel | ✅ | ✅ | Atividades + recoveryDecorators |
| `character-create` | ✅ | ✅ | ✅ | ✅ | Fluxo 6/6 com catálogos |
| `character-list` | ✅ | ✅ | ✅ | ✅ | Read-only com estado vazio |
| `clocks` | ✅ | 🔧 ClockDemo | ✅ | 📋 | UI demo apenas |
| `combat` | ❌ | ❌ | ❌ | ✅ | Vazio (só .agents/); aguardando CombatService |
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
| `social` | ✅ SocialCombatService + SocialStandingService + NegotiationPanel | ✅ NegotiationPanel, FactionPanel, SocialDemo | ✅ | ✅ | Lógica e UI completas |
| `spell-cast` | ✅ SpellCastBuilderService | ✅ SpellCastPanel | ✅ | ✅ | Builder com Weaving + Metamagia |
| `survival` | ❌ | ❌ | ❌ | ✅ | Vazio (só .agents/); 68 system docs prontos |
| `traps` | ✅ | 🔧 | ✅ | ✅ | Lógica completa, UI parcial |
| `chat` | ✅ ChatLog + GM Mode | ✅ ChatLog.svelte, RollModifiersDrawer.svelte | ✅ | 📋 | ChatLog com isGmOnly e filtro de Modo Mestre |
| `sandbox` | ✅ GMSandboxPanel | ✅ GMSandboxPanel.svelte | ✅ | 📋 | GM Sandbox com mutação de estado via RPC |

**Total features:** 30 · **UI Completa:** 14 · **Lógica completa, UI parcial:** 9 · **Em progresso:** 4 · **Não iniciados:** 2 (`combat`, `survival`) · **UI parcial sem spec:** 1 (`dungeon-crawler`)

---

## Gaps Prioritários

### Implementação × System Docs (funcional mas sem UI)
- `features/espionage`, `features/investigation`, `features/mercenary`, `features/quests` — lógica 100% TDD mas sem painéis de UI completos para o jogador
- `features/combat` — combate tático real com IA de inimigos está em progresso (combate de treino funciona)

### System Docs × Implementação (docs existem, código não)
- `features/survival` — 68 system docs cobrem sobrevivência, exploração e economia; **nenhum código implementado**
- `entities/dungeon` — dungeon procedural está parcial

### DB Schema Faltando (catálogos read-only)
- `entities/ancestry`, `entities/background`, `entities/character-class`, `entities/spell` — catálogos serializados em código; migração para SQLite seria útil para busca dinâmica

### Implementação em Progresso (Fases 68–72)
- `entities/combat` (IA tática de inimigos baseada em Papéis Táticos — ADR-010)
- `features/hexcrawl-map` + `features/combat` — integração transição mapa↔combate via `active_sessions` (ADR-009)
- Loots atômicos SQLite ao encerrar encontro (ADR-011)
- Despacho de mercenários por ticks de exploração (ADR-012)
- Climatologia reativa via Progress Clock regional (ADR-013)

---

## Histórico de Atualizações

| Data | Motivo | Entities | Features |
|:---|:---|:---:|:---:|
| 2026-05-31 | Criação inicial do mapa | 23 | 25 |
| 2026-06-08 | Phases 51–67+: siege, lore, chat, sandbox; social UI upgrade | 25 | 27 |
| 2026-06-09 | Adicionado entities/combat (descoberto no filesystem); mapa sincronizado com task em progresso (Fases 68–72) e ADRs 009–013 | 26 | 27 |
| 2026-06-15 | Auditoria completa por grilling: adicionados entities/campaign e entities/downtime; features/campaign-timeline, features/downtime, features/dungeon-crawler; corrigido status de combat (infra pronta, domain service ausente) e survival (vazio); features/combat rebaixado de 🔧 para ❌ | 28 | 30 |
