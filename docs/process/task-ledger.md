# Task Ledger

This file records every new completed feature and every unfinished task.

Each record should include start time, finish time when available, the model/config used, the last modification, and a short explanation of what was done or is being done.

The automation owns the marked sections below. Manual edits should stay outside markers unless intentionally correcting a record.

## In Progress
<!-- pandorha-ledger:in-progress -->
<!-- pandorha-task:20260604-113201-consolidacao-das-uis-de-campanha -->
### Consolidacao das UIs de Campanha
- id: 20260604-113201-consolidacao-das-uis-de-campanha
- status: in-progress
- kind: feature
- planned: yes
- started_at: 2026-06-04T11:32:01-03:00
- finished_at: pending
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: pending
- last_modified_at: 2026-06-04T11:32:01-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- summary: Consolidacao incremental convencional do backlog de UI e integracao de sistemas existentes
- last_change: created task record
#### Files At Start
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/dialogue/domain/DialogueService.ts
- src/entities/dialogue/infrastructure/DrizzleDialogueRepository.ts
- src/entities/dialogue/infrastructure/InMemoryDialogueRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/dialogue/model/dialogueSchema.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- ... 113 more
#### Checkpoints
#### Checkpoint 2026-06-04T11:32:01-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260604-113201-consolidacao-das-uis-de-campanha -->

<!-- /pandorha-ledger:in-progress -->

## Completed
<!-- pandorha-ledger:completed -->
<!-- pandorha-task:20260602-223552-fase-67-logistica-e-a-cascata-de-exaustao -->
### Fase 67: Logistica e a Cascata de Exaustao
- id: 20260602-223552-fase-67-logistica-e-a-cascata-de-exaustao
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-06-02T22:35:52-03:00
- finished_at: 2026-06-02T22:35:56-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-02T22:35:56-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- summary: Implementacao de exaustao reativa e consumo diario de provisoes no fechamento do dia
- last_change: Implementacao de exaustao reativa e consumo diario de provisoes no fechamento do dia
#### Files At Start
- CONTEXT.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/equipment/model/equipmentCatalog.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/entities/world-tile/domain/EncounterService.ts
- src/entities/world-tile/index.ts
- ... 52 more
#### Checkpoints
#### Checkpoint 2026-06-02T22:35:52-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-02T22:35:56-03:00
- Done: Implementacao de exaustao reativa e consumo diario de provisoes no fechamento do dia
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260602-223552-fase-67-logistica-e-a-cascata-de-exaustao -->
<!-- pandorha-task:20260602-214010-fase-65-estado-moribundo-e-primeiros-socorros -->
### Fase 65: Estado Moribundo e Primeiros Socorros
- id: 20260602-214010-fase-65-estado-moribundo-e-primeiros-socorros
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-06-02T21:40:10-03:00
- finished_at: 2026-06-02T21:40:15-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-02T21:40:15-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- summary: Implementacao do Estado Moribundo, rolagens de morte e primeiros socorros em combate
- last_change: Implementação completa da Fase 65: Estado Moribundo, rolagens de morte persistentes no status 'moribund', interceptador de dano a 0 HP e consumo do Kit de Primeiros Socorros em combate, com 100% de cobertura nos testes e estilo de código Biome.
#### Files At Start
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/equipment/model/equipmentCatalog.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- ... 42 more
#### Checkpoints
#### Checkpoint 2026-06-02T21:40:10-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-06-02T21:40:15-03:00
- Done: Implementação completa da Fase 65: Estado Moribundo, rolagens de morte persistentes no status 'moribund', interceptador de dano a 0 HP e consumo do Kit de Primeiros Socorros em combate, com 100% de cobertura nos testes e estilo de código Biome.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260602-214010-fase-65-estado-moribundo-e-primeiros-socorros -->
<!-- pandorha-task:fase-57-lore-dinamica-no-hexcrawl -->
### Fase 57: Lore Dinamica & Encontros Narrativos
- id: fase-57-lore-dinamica-no-hexcrawl
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-02T07:49:28-03:00
- finished_at: 2026-06-02T12:36:37-03:00
- model_started: gemini-3.5-flash
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-06-02T12:36:37-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- summary: Criacao de schemas lore_encounters e campaign_rumors, desenvolvimento de LoreService com Result Pattern e 100% de cobertura, e integracao no HexcrawlMovementService
- last_change: Implementacao da Sandbox do GM (Fase 59) com suporte a mutacao de estado, relogios e spawn de monstros via RPC, cobrindo 100% de testes e estilo Biome.
#### Files At Start
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/saves/infrastructure/WorkerSaveRepository.ts
- src/features/traps/ui/TrapDeploymentPanel.svelte
- src/shared/rpc/index.ts
- vite.config.mjs
- src/shared/rpc/__tests__/rpcCache.spec.ts
- src/shared/rpc/model/rpcCache.ts
#### Checkpoints
#### Checkpoint 2026-06-02T07:49:28-03:00
- Done: task record created
- Next: fase-58-ia-tatica-de-criaturas
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gemini-3.5-flash

#### Checkpoint 2026-06-02T12:36:37-03:00
- Done: Implementacao da Sandbox do GM (Fase 59) com suporte a mutacao de estado, relogios e spawn de monstros via RPC, cobrindo 100% de testes e estilo Biome.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fase-57-lore-dinamica-no-hexcrawl -->
<!-- pandorha-task:fase-56-modulo-cooperativo-local -->
### Fase 56: Modulo Cooperativo Local
- id: fase-56-modulo-cooperativo-local
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-02T07:36:50-03:00
- finished_at: 2026-06-02T07:41:36-03:00
- model_started: gemini-3.5-flash
- model_finished: gemini-3.5-flash
- last_modified_at: 2026-06-02T07:41:36-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- summary: Implementacao de chave global de Modo Mestre no Cockpit, filtros de logs passivos no ChatLog e estilizacao CSS print para exportacao premium
- last_change: Chave global de Modo Mestre no Cockpit, suporte para mensagens exclusivas de GM no ChatLog via isGmOnly, e regras CSS @media print premium com ignores inline do Biome
#### Files At Start
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/saves/infrastructure/WorkerSaveRepository.ts
- src/features/traps/ui/TrapDeploymentPanel.svelte
- src/shared/rpc/index.ts
- vite.config.mjs
- src/shared/rpc/__tests__/rpcCache.spec.ts
- src/shared/rpc/model/rpcCache.ts
#### Checkpoints
#### Checkpoint 2026-06-02T07:36:50-03:00
- Done: task record created
- Next: fase-57-lore-dinamica-no-hexcrawl
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gemini-3.5-flash

#### Checkpoint 2026-06-02T07:41:36-03:00
- Done: Chave global de Modo Mestre no Cockpit, suporte para mensagens exclusivas de GM no ChatLog via isGmOnly, e regras CSS @media print premium com ignores inline do Biome
- Next: fase-57-lore-dinamica-no-hexcrawl
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini-3.5-flash
<!-- /pandorha-task:fase-56-modulo-cooperativo-local -->
<!-- pandorha-task:fase-55-fechamento-e-producao -->
### Fase 55: Fechamento, Empacotamento e Producao
- id: fase-55-fechamento-e-producao
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-02T07:31:51-03:00
- finished_at: 2026-06-02T07:31:55-03:00
- model_started: gemini-3.5-flash
- model_finished: gemini-3.5-flash
- last_modified_at: 2026-06-02T07:31:55-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- summary: Configuracao de headers COOP/COEP para SQLite WASM e OPFS, otimizacao de build Vite para assets do Web Worker e resolucao de erros de compilacao Svelte 5 no ChatLog e TrapDeploymentPanel
- last_change: Configuracao de headers COOP/COEP para SQLite WASM e OPFS, otimizacao de build Vite para assets do Web Worker e resolucao de erros de compilacao Svelte 5 no ChatLog e TrapDeploymentPanel
#### Files At Start
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/saves/infrastructure/WorkerSaveRepository.ts
- src/features/traps/ui/TrapDeploymentPanel.svelte
- src/shared/rpc/index.ts
- vite.config.mjs
- src/shared/rpc/__tests__/rpcCache.spec.ts
- src/shared/rpc/model/rpcCache.ts
#### Checkpoints
#### Checkpoint 2026-06-02T07:31:51-03:00
- Done: task record created
- Next: fase-56-modulo-cooperativo-local
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gemini-3.5-flash

#### Checkpoint 2026-06-02T07:31:55-03:00
- Done: Configuracao de headers COOP/COEP para SQLite WASM e OPFS, otimizacao de build Vite para assets do Web Worker e resolucao de erros de compilacao Svelte 5 no ChatLog e TrapDeploymentPanel
- Next: fase-56-modulo-cooperativo-local
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini-3.5-flash
<!-- /pandorha-task:fase-55-fechamento-e-producao -->
<!-- pandorha-task:fase-54-polimento-performance-pwa-offline -->
### Fase 54: Polimento, Performance e PWA Offline
- id: fase-54-polimento-performance-pwa-offline
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-02T00:21:56-03:00
- finished_at: 2026-06-02T07:18:29-03:00
- model_started: gemini-3.5-flash
- model_finished: gemini-3.5-flash
- last_modified_at: 2026-06-02T07:18:29-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- summary: Otimizacao RPC, latencias abaixo de 16ms, cache-first Service Worker e QA do Quality Gate
- last_change: Implementacao de cache RPC global na thread principal, telemetria de latencia, auditoria de service worker e limpeza de estilo/convencoes em App e ChatLog
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-02T00:21:56-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gemini-3.5-flash

#### Checkpoint 2026-06-02T07:18:29-03:00
- Done: Implementacao de cache RPC global na thread principal, telemetria de latencia, auditoria de service worker e limpeza de estilo/convencoes em App e ChatLog
- Next: fase-55-fechamento-e-producao
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini-3.5-flash
<!-- /pandorha-task:fase-54-polimento-performance-pwa-offline -->
<!-- pandorha-task:fase-53-gerenciador-slots-save -->
### Fase 53: Gerenciador de Slots de Save (JSON)
- id: fase-53-gerenciador-slots-save
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-02T00:16:07-03:00
- finished_at: 2026-06-02T00:21:41-03:00
- model_started: gemini-3.5-flash
- model_finished: gemini-3.5-flash
- last_modified_at: 2026-06-02T00:21:41-03:00
- branch: task/siege-and-cockpit
- commit_at_start: ac8859a feat(cockpit): implement split-screen HUD layout, global modifiers drawer, and quick d20 rolling on attribute click
- summary: Implementacao da interface e persistencia OPFS para multiplos saves locais, alem de backup fisico via importacao/exportacao JSON
- last_change: Implementacao da interface e persistencia OPFS para multiplos saves locais, alem de backup fisico via importacao/exportacao JSON e drag-and-drop
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-02T00:16:07-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gemini-3.5-flash

#### Checkpoint 2026-06-02T00:21:41-03:00
- Done: Implementacao da interface e persistencia OPFS para multiplos saves locais, alem de backup fisico via importacao/exportacao JSON e drag-and-drop
- Next: fase-54-polimento-performance-pwa-offline
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini-3.5-flash
<!-- /pandorha-task:fase-53-gerenciador-slots-save -->
<!-- pandorha-task:fase-52-painel-cockpit-rpg-dividido -->
### Fase 52: Painel Cockpit RPG Dividido e Rolagem Drawer
- id: fase-52-painel-cockpit-rpg-dividido
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-02T00:06:00-03:00
- finished_at: 2026-06-02T00:15:57-03:00
- model_started: gemini-3.5-flash
- model_finished: gemini-3.5-flash
- last_modified_at: 2026-06-02T00:15:57-03:00
- branch: task/siege-and-cockpit
- commit_at_start: f884b58 feat(siege): implement siege resolution logic and camp downtime integration
- summary: Reestruturar o layout para CSS Grid Split-Screen HUD na esquerda e painel dinamico central na direita, adicionando cliques rapidos para rolagens d20 nos cards e Drawer global com modificadores
- last_change: Reestruturado o layout para CSS Grid Split-Screen HUD na esquerda e painel dinamico central na direita, adicionando cliques rapidos para rolagens d20 nos cards e Drawer global com modificadores
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-02T00:06:00-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gemini-3.5-flash

#### Checkpoint 2026-06-02T00:15:57-03:00
- Done: Reestruturado o layout para CSS Grid Split-Screen HUD na esquerda e painel dinamico central na direita, adicionando cliques rapidos para rolagens d20 nos cards e Drawer global com modificadores
- Next: fase-53-gerenciador-slots-save
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini-3.5-flash
<!-- /pandorha-task:fase-52-painel-cockpit-rpg-dividido -->
<!-- pandorha-task:fase-51-eventos-cerco-bastiao -->
### Fase 51: Sistema de Eventos Globais e Cercos ao Bastião
- id: fase-51-eventos-cerco-bastiao
- status: completed
- kind: task
- planned: yes
- started_at: 2026-06-01T23:17:05-03:00
- finished_at: 2026-06-01T23:35:37-03:00
- model_started: gemini
- model_finished: gemini-3.5-flash
- last_modified_at: 2026-06-01T23:35:37-03:00
- branch: task/siege-and-cockpit
- commit_at_start: 4280c13 docs: document architectural decisions and update change-ledger
- summary: Implementação do siegeSchema, SiegeService para resolução de cercos reativos ao acampamento e infâmia de facções
- last_change: Implementacao da logica de cercos, eventos de bastiao, integracao de downtime com descanso no CampService e cobertura de testes 100% verde
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-06-01T23:17:05-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gemini

#### Checkpoint 2026-06-01T23:35:37-03:00
- Done: Implementacao da logica de cercos, eventos de bastiao, integracao de downtime com descanso no CampService e cobertura de testes 100% verde
- Next: fase-52-painel-cockpit-rpg-dividido
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini-3.5-flash
<!-- /pandorha-task:fase-51-eventos-cerco-bastiao -->
<!-- pandorha-task:fases-46-e-47-espionagem-e-pesquisa -->
### Fases 46 & 47: Espionagem/Furtividade e Pesquisa/Criptografia
- id: fases-46-e-47-espionagem-e-pesquisa
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-29T21:48:27-03:00
- finished_at: 2026-05-29T23:46:03-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-29T23:46:03-03:00
- branch: task/tension-limit-break
- commit_at_start: c219ce9 feat(combat-social-rules): implementacao e consolidacao das fases 39 a 45
- summary: Implementacao de Furtividade e Infiltracao em combate (Fase 46) e Sistema de Pesquisa, Criptografia e decifracao de enigmas (Fase 47)
- last_change: Finalizacao das fases 46 a 50 com correcao da cobertura de branches para 100% no RetrainService e fiacao do Quality Gate
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-29T21:48:27-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-29T23:46:03-03:00
- Done: Finalizacao das fases 46 a 50 com correcao da cobertura de branches para 100% no RetrainService e fiacao do Quality Gate
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fases-46-e-47-espionagem-e-pesquisa -->
<!-- pandorha-task:fases-43-e-44-negociacao-e-contramagia -->
### Fases 43 & 44: Negociacao, Economia de Quebra e Contramagia
- id: fases-43-e-44-negociacao-e-contramagia
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-29T18:41:25-03:00
- finished_at: 2026-05-29T18:41:28-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-29T18:41:28-03:00
- branch: task/tension-limit-break
- commit_at_start: 456e064 feat(armor-pwa): reactive armor modifiers and pwa offline support for phases 36 to 38
- summary: Homologacao, implementacao de testes de cobertura e integracao visual do painel de negociacao e contramagia
- last_change: Homologacao e estabilizacao do painel de negociacao e regras de contramagia com 100% de cobertura de branches
#### Files At Start
- docs/process/task-ledger.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/app/model/socialSession.ts
- src/entities/bastion/domain/BastionService.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/CharacterService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/model/characterSchema.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/domain/CompanionService.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- src/entities/equipment/domain/CraftingService.ts
- src/entities/equipment/model/equipmentCatalog.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatTrainingAttackProfile.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/crafting/ui/IllnessWorkshopPanel.svelte
- src/features/dialogue/ui/DialoguePanel.svelte
- src/features/social/domain/SocialManeuvers.ts
- src/features/social/index.ts
- src/features/social/ui/SocialDemo.svelte
- src/features/spell-cast/__tests__/SpellCastBuilderService.spec.ts
- src/features/spell-cast/domain/SpellCastBuilderService.ts
- src/features/spell-cast/ui/SpellCastPanel.svelte
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/model/rpcSchemas.ts
- vitest.config.mjs
- src/entities/character/domain/UltimateStatsDecorators.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/features/social/domain/NegotiationService.ts
- src/features/social/domain/__tests__/NegotiationService.spec.ts
- src/features/social/ui/NegotiationPanel.svelte
- src/features/spell-cast/__tests__/CountermagicService.spec.ts
- src/features/spell-cast/domain/CountermagicService.ts
#### Checkpoints
#### Checkpoint 2026-05-29T18:41:25-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-29T18:41:28-03:00
- Done: Homologacao e estabilizacao do painel de negociacao e regras de contramagia com 100% de cobertura de branches
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fases-43-e-44-negociacao-e-contramagia -->
<!-- pandorha-task:fases-42-e-45-companheiros-e-familiar -->
### Fases 42 & 45: Companheiros Animais e Familiar Mistico
- id: fases-42-e-45-companheiros-e-familiar
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-29T13:17:13-03:00
- finished_at: 2026-05-29T13:17:17-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-29T13:17:17-03:00
- branch: task/tension-limit-break
- commit_at_start: 456e064 feat(armor-pwa): reactive armor modifiers and pwa offline support for phases 36 to 38
- summary: Consolidacao de Companheiros Animais e Familiar Mistico no combate, remocao de Math.random e 100% de cobertura nos testes globais
- last_change: Consolidacao de Companheiros Animais e Familiar Mistico no combate, remocao de Math.random e 100% de cobertura nos testes globais
#### Files At Start
- docs/process/task-ledger.md
- src/app/App.svelte
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/model/characterSchema.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/domain/CompanionService.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatTrainingAttackProfile.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/crafting/ui/IllnessWorkshopPanel.svelte
- src/features/dialogue/ui/DialoguePanel.svelte
- src/features/social/ui/SocialDemo.svelte
- src/features/spell-cast/__tests__/SpellCastBuilderService.spec.ts
- src/features/spell-cast/domain/SpellCastBuilderService.ts
- src/features/spell-cast/ui/SpellCastPanel.svelte
- src/entities/character/domain/UltimateStatsDecorators.ts
#### Checkpoints
#### Checkpoint 2026-05-29T13:17:13-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-29T13:17:17-03:00
- Done: Consolidacao de Companheiros Animais e Familiar Mistico no combate, remocao de Math.random e 100% de cobertura nos testes globais
- Next: Fases 43 & 44 (Negociacao e Contramagia)
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fases-42-e-45-companheiros-e-familiar -->
<!-- pandorha-task:fases-39-41-tension-limit-death-saves -->
### Fases 39 a 41: Medidor de Tensao, 0 HP e Metamagias
- id: fases-39-41-tension-limit-death-saves
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-29T12:00:27-03:00
- finished_at: 2026-05-29T12:58:34-03:00
- model_started: gpt-5.5 high-reasoning final review
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-29T12:58:34-03:00
- branch: task/tension-limit-break
- commit_at_start: 456e064 feat(armor-pwa): reactive armor modifiers and pwa offline support for phases 36 to 38
- summary: Implementacao do medidor de tensao, limit break e ultimates, regras de 0 HP e moribundo, e grimorio de metamagias
- last_change: Implementacao completa de Metamagias com calculo reativo de custos de EE e controles visuais na UI
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-29T12:00:27-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review

#### Checkpoint 2026-05-29T12:58:34-03:00
- Done: Implementacao completa de Metamagias com calculo reativo de custos de EE e controles visuais na UI
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fases-39-41-tension-limit-death-saves -->
<!-- pandorha-task:20260529-094248-fase-36-integracao-de-equipamentos-e-atributos-f -->
### Fase 36: Integracao de Equipamentos e Atributos Fisicos
- id: 20260529-094248-fase-36-integracao-de-equipamentos-e-atributos-f
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-29T09:42:48-03:00
- finished_at: 2026-05-29T09:57:13-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-29T09:57:13-03:00
- branch: task/reactive-armor-integration
- commit_at_start: 76ebbea feat(traps-codex): implementacao do codice de armadilhas taticas, decoradores de status e painel visual de engenharia
- summary: Implementar calculo reativo de CA e Iniciativa sob a cebola de atributos com decoradores de armaduras e escudos
- last_change: Implementacao reativa de equipamentos (armaduras/escudos) na cebola de atributos, suporte offline PWA e exibicao de CA e velocidade na UI de Combate e Listagem.
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-29T09:42:48-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-29T09:57:13-03:00
- Done: Implementacao reativa de equipamentos (armaduras/escudos) na cebola de atributos, suporte offline PWA e exibicao de CA e velocidade na UI de Combate e Listagem.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260529-094248-fase-36-integracao-de-equipamentos-e-atributos-f -->
<!-- pandorha-task:fase-29-companhias-mercenarias -->
### Fase 29: Sistema de Companhias Mercenarias
- id: fase-29-companhias-mercenarias
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-28T18:25:55-03:00
- finished_at: 2026-05-28T18:26:00-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-28T18:26:00-03:00
- branch: task/gameplay-loop-integration
- commit_at_start: d32f8ba feat(db-auditor): detecta dinamicamente as tabelas characters/actors e mapeia colunas em ingles do Drizzle
- summary: Implementacao do modulo de Companhias Mercenarias (Gestao de Peoes) no motor e interface visual
- last_change: Finalizada a Fase 29 (Companhias Mercenarias), com correcao de importacao no WorkerRegionalDomainRepository e extensao de schemas para tipo literal de uniao
#### Files At Start
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- pandorha-sistema-28-04-backup/App.svelte
- src/app/App.svelte
- src/app/model/navigation.ts
- src/app/styles.css
- src/features/camp/domain/CampService.ts
- src/features/camp/domain/__tests__/CampService.spec.ts
- src/features/camp/ui/CampPanel.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/__tests__/RpcContract.spec.ts
- src/shared/rpc/model/rpcSchemas.ts
- vitest.config.mjs
- .agents/skills/rpg-mechanics-validator/
- .agents/skills/svelte-runes-validator/
- drizzle/0014_slippery_proemial_gods.sql
- drizzle/0015_gray_texas_twister.sql
- drizzle/0016_spotty_shiver_man.sql
- drizzle/meta/0014_snapshot.json
- drizzle/meta/0015_snapshot.json
- drizzle/meta/0016_snapshot.json
- pandorha-sistema-28-04-backup/BastionPanel.svelte.bak
- pandorha-sistema-28-04-backup/BastionService.spec.ts
- pandorha-sistema-28-04-backup/BastionStructureCard.svelte.bak
- pandorha-sistema-28-04-backup/CombatEncounterService.ts
- pandorha-sistema-28-04-backup/CompanionService.spec.ts
- pandorha-sistema-28-04-backup/DialoguePanel.svelte.bak
- pandorha-sistema-28-04-backup/DowntimeProjectList.svelte.bak
- pandorha-sistema-28-04-backup/EncounterService.ts
- pandorha-sistema-28-04-backup/FactionService.spec.ts
- pandorha-sistema-28-04-backup/HexcrawlMapPanel.svelte.bak
- pandorha-sistema-28-04-backup/QuestLogPanel.svelte.bak
- pandorha-sistema-28-04-backup/SaveManagerPanel.svelte.bak
- pandorha-sistema-28-04-backup/SynergyService.spec.ts
- pandorha-sistema-28-04-backup/bastion.css.bak
- pandorha-sistema-28-04-backup/llms.txt
- ... 15 more
#### Checkpoints
#### Checkpoint 2026-05-28T18:25:55-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-28T18:26:00-03:00
- Done: Finalizada a Fase 29 (Companhias Mercenarias), com correcao de importacao no WorkerRegionalDomainRepository e extensao de schemas para tipo literal de uniao
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fase-29-companhias-mercenarias -->
<!-- pandorha-task:fase-27-e-28-fiacao-rpc-e-ui -->
### Fase 27 e 28: Fiacao RPC e UI
- id: fase-27-e-28-fiacao-rpc-e-ui
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-27T12:00:31-03:00
- finished_at: 2026-05-27T12:00:36-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-27T12:00:36-03:00
- branch: task/gameplay-loop-integration
- commit_at_start: d32f8ba feat(db-auditor): detecta dinamicamente as tabelas characters/actors e mapeia colunas em ingles do Drizzle
- summary: Conclusao da fiacao RPC e desenvolvimento das UIs reativas Svelte 5 para as Fases 27 e 28 (Dominio Regional e Acampamento)
- last_change: Fiacao RPC concluida criando os repositorios Worker regional domain e camp, adicionado LIST_REGIONAL_DOMAINS e criada a nova UI Svelte 5 DomainCouncilPanel e reformulada a CampPanel com suporte total ao banco SQLite WASM via worker
#### Files At Start
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- pandorha-sistema-28-04-backup/App.svelte
- src/app/App.svelte
- src/app/model/navigation.ts
- src/app/styles.css
- src/features/camp/domain/CampService.ts
- src/features/camp/domain/__tests__/CampService.spec.ts
- src/features/camp/ui/CampPanel.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/__tests__/RpcContract.spec.ts
- src/shared/rpc/model/rpcSchemas.ts
- vitest.config.mjs
- .agents/skills/rpg-mechanics-validator/
- .agents/skills/svelte-runes-validator/
- drizzle/0014_slippery_proemial_gods.sql
- drizzle/0015_gray_texas_twister.sql
- drizzle/meta/0014_snapshot.json
- drizzle/meta/0015_snapshot.json
- pandorha-sistema-28-04-backup/BastionPanel.svelte.bak
- pandorha-sistema-28-04-backup/BastionService.spec.ts
- pandorha-sistema-28-04-backup/BastionStructureCard.svelte.bak
- pandorha-sistema-28-04-backup/CombatEncounterService.ts
- pandorha-sistema-28-04-backup/CompanionService.spec.ts
- pandorha-sistema-28-04-backup/DialoguePanel.svelte.bak
- pandorha-sistema-28-04-backup/DowntimeProjectList.svelte.bak
- pandorha-sistema-28-04-backup/EncounterService.ts
- pandorha-sistema-28-04-backup/FactionService.spec.ts
- pandorha-sistema-28-04-backup/HexcrawlMapPanel.svelte.bak
- pandorha-sistema-28-04-backup/QuestLogPanel.svelte.bak
- pandorha-sistema-28-04-backup/SaveManagerPanel.svelte.bak
- pandorha-sistema-28-04-backup/SynergyService.spec.ts
- pandorha-sistema-28-04-backup/bastion.css.bak
- pandorha-sistema-28-04-backup/llms.txt
- pandorha-sistema-28-04-backup/src/
- pandorha-sistema-28-04-backup/styles.css
- ... 11 more
#### Checkpoints
#### Checkpoint 2026-05-27T12:00:31-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-27T12:00:36-03:00
- Done: Fiacao RPC concluida criando os repositorios Worker regional domain e camp, adicionado LIST_REGIONAL_DOMAINS e criada a nova UI Svelte 5 DomainCouncilPanel e reformulada a CampPanel com suporte total ao banco SQLite WASM via worker
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fase-27-e-28-fiacao-rpc-e-ui -->
<!-- pandorha-task:fase-26-investigacao-e-descoberta -->
### Fase 26: Sistema de Investigacao e Descoberta
- id: fase-26-investigacao-e-descoberta
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-27T09:37:21-03:00
- finished_at: 2026-05-27T09:55:00-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gemini
- last_modified_at: 2026-05-27T09:55:00-03:00
- branch: task/gameplay-loop-integration
- commit_at_start: d32f8ba feat(db-auditor): detecta dinamicamente as tabelas characters/actors e mapeia colunas em ingles do Drizzle
- summary: Implementacao da Fase 26 de Investigacao e Descoberta no motor Pandorha com UI reativa Svelte 5 e persistencia no SQLite local-first
- last_change: Finalizada a Fase 26 (Investigacao e Descoberta) com cobertura estrita de 100% de testes e Quality Gate totalmente aprovado
#### Files At Start
- drizzle.config.mjs
- drizzle/meta/_journal.json
- pandorha-sistema-28-04-backup/App.svelte
- src/app/App.svelte
- src/app/model/navigation.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/model/rpcSchemas.ts
- .agents/skills/rpg-mechanics-validator/
- .agents/skills/svelte-runes-validator/
- drizzle/0014_slippery_proemial_gods.sql
- drizzle/meta/0014_snapshot.json
- pandorha-sistema-28-04-backup/BastionPanel.svelte.bak
- pandorha-sistema-28-04-backup/BastionService.spec.ts
- pandorha-sistema-28-04-backup/BastionStructureCard.svelte.bak
- pandorha-sistema-28-04-backup/CombatEncounterService.ts
- pandorha-sistema-28-04-backup/CompanionService.spec.ts
- pandorha-sistema-28-04-backup/DialoguePanel.svelte.bak
- pandorha-sistema-28-04-backup/DowntimeProjectList.svelte.bak
- pandorha-sistema-28-04-backup/EncounterService.ts
- pandorha-sistema-28-04-backup/FactionService.spec.ts
- pandorha-sistema-28-04-backup/HexcrawlMapPanel.svelte.bak
- pandorha-sistema-28-04-backup/QuestLogPanel.svelte.bak
- pandorha-sistema-28-04-backup/SaveManagerPanel.svelte.bak
- pandorha-sistema-28-04-backup/SynergyService.spec.ts
- pandorha-sistema-28-04-backup/bastion.css.bak
- pandorha-sistema-28-04-backup/llms.txt
- pandorha-sistema-28-04-backup/src/
- pandorha-sistema-28-04-backup/styles.css
- pandorha-sistema-28-04-backup/styles.css.bak
- pandorha-sistema-28-04-backup/vitest.config.mjs
- pandorha-sistema-28-04-backup/vitest.config.mjs.bak
- planejamento_loop_gameplay.md
- scripts/run_portable_command.mjs
- scripts/validate_svelte_syntax.mjs
- src/entities/investigation/
- src/features/investigation/
#### Checkpoints
#### Checkpoint 2026-05-27T09:37:21-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-27T09:55:00-03:00
- Done: Finalizada a Fase 26 (Investigacao e Descoberta) com cobertura estrita de 100% de testes e Quality Gate totalmente aprovado
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini
<!-- /pandorha-task:fase-26-investigacao-e-descoberta -->
<!-- pandorha-task:20260527-063531-alinhamento-de-tabelas-no-db-auditor -->
### Alinhamento de Tabelas no DB Auditor
- id: 20260527-063531-alinhamento-de-tabelas-no-db-auditor
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-27T06:35:31-03:00
- finished_at: 2026-05-27T06:35:34-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-27T06:35:34-03:00
- branch: task/gameplay-loop-integration
- commit_at_start: 1a05075 test: integrate Monte Carlo simulation into CI quality gate
- summary: Fazer o pandorha-db-auditor detectar dinamicamente as tabelas characters e actors no SQLite
- last_change: Mapeamento dinâmico de characters/actors e suporte para colunas em inglês do Drizzle concluídos com 100% de cobertura nos testes do pandorha-db-auditor.
#### Files At Start
- AGENTS.md
- llms.txt
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- pandorha-sistema-28-04-backup/App.svelte
- .agents/skills/rpg-mechanics-validator/
- .agents/skills/svelte-runes-validator/
- pandorha-sistema-28-04-backup/BastionPanel.svelte.bak
- pandorha-sistema-28-04-backup/BastionService.spec.ts
- pandorha-sistema-28-04-backup/BastionStructureCard.svelte.bak
- pandorha-sistema-28-04-backup/CombatEncounterService.ts
- pandorha-sistema-28-04-backup/CompanionService.spec.ts
- pandorha-sistema-28-04-backup/DialoguePanel.svelte.bak
- pandorha-sistema-28-04-backup/DowntimeProjectList.svelte.bak
- pandorha-sistema-28-04-backup/EncounterService.ts
- pandorha-sistema-28-04-backup/FactionService.spec.ts
- pandorha-sistema-28-04-backup/HexcrawlMapPanel.svelte.bak
- pandorha-sistema-28-04-backup/QuestLogPanel.svelte.bak
- pandorha-sistema-28-04-backup/SaveManagerPanel.svelte.bak
- pandorha-sistema-28-04-backup/SynergyService.spec.ts
- pandorha-sistema-28-04-backup/bastion.css.bak
- pandorha-sistema-28-04-backup/llms.txt
- pandorha-sistema-28-04-backup/src/
- pandorha-sistema-28-04-backup/styles.css
- pandorha-sistema-28-04-backup/styles.css.bak
- pandorha-sistema-28-04-backup/vitest.config.mjs
- pandorha-sistema-28-04-backup/vitest.config.mjs.bak
- planejamento_loop_gameplay.md
- scripts/run_portable_command.mjs
- scripts/validate_svelte_syntax.mjs
#### Checkpoints
#### Checkpoint 2026-05-27T06:35:31-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-27T06:35:34-03:00
- Done: Mapeamento dinâmico de characters/actors e suporte para colunas em inglês do Drizzle concluídos com 100% de cobertura nos testes do pandorha-db-auditor.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260527-063531-alinhamento-de-tabelas-no-db-auditor -->
<!-- pandorha-task:fase-24-validacao-matematica-e-skills -->
### Validacao Matematica e de Skills
- id: fase-24-validacao-matematica-e-skills
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-26T19:17:05-03:00
- finished_at: 2026-05-26T19:17:11-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-26T19:17:11-03:00
- branch: task/gameplay-loop-integration
- commit_at_start: 36d4a73 feat: integrate dialogue system with hexcrawl exploration loop
- summary: Execucao de simulacao Monte Carlo de letalidade e integracao do simulador ao Quality Gate
- last_change: Completada a integracao da simulacao Monte Carlo ao script run_full_quality_gate.mjs e o comando npm test:mechanics no package.json
#### Files At Start
- AGENTS.md
- llms.txt
- package.json
- pandorha-sistema-28-04-backup/App.svelte
- scripts/run_full_quality_gate.mjs
- .agents/skills/rpg-mechanics-validator/
- .agents/skills/svelte-runes-validator/
- pandorha-sistema-28-04-backup/BastionPanel.svelte.bak
- pandorha-sistema-28-04-backup/BastionService.spec.ts
- pandorha-sistema-28-04-backup/BastionStructureCard.svelte.bak
- pandorha-sistema-28-04-backup/CombatEncounterService.ts
- pandorha-sistema-28-04-backup/CompanionService.spec.ts
- pandorha-sistema-28-04-backup/DialoguePanel.svelte.bak
- pandorha-sistema-28-04-backup/DowntimeProjectList.svelte.bak
- pandorha-sistema-28-04-backup/EncounterService.ts
- pandorha-sistema-28-04-backup/FactionService.spec.ts
- pandorha-sistema-28-04-backup/HexcrawlMapPanel.svelte.bak
- pandorha-sistema-28-04-backup/QuestLogPanel.svelte.bak
- pandorha-sistema-28-04-backup/SaveManagerPanel.svelte.bak
- pandorha-sistema-28-04-backup/SynergyService.spec.ts
- pandorha-sistema-28-04-backup/bastion.css.bak
- pandorha-sistema-28-04-backup/llms.txt
- pandorha-sistema-28-04-backup/src/
- pandorha-sistema-28-04-backup/styles.css
- pandorha-sistema-28-04-backup/styles.css.bak
- pandorha-sistema-28-04-backup/vitest.config.mjs
- pandorha-sistema-28-04-backup/vitest.config.mjs.bak
- planejamento_loop_gameplay.md
- scripts/run_portable_command.mjs
- scripts/validate_svelte_syntax.mjs
#### Checkpoints
#### Checkpoint 2026-05-26T19:17:05-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T19:17:11-03:00
- Done: Completada a integracao da simulacao Monte Carlo ao script run_full_quality_gate.mjs e o comando npm test:mechanics no package.json
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fase-24-validacao-matematica-e-skills -->
<!-- pandorha-task:fase-23-integracao-final-loop-gameplay -->
### Integracao Final do Loop de Gameplay
- id: fase-23-integracao-final-loop-gameplay
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-26T19:10:16-03:00
- finished_at: 2026-05-26T19:10:23-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-26T19:10:23-03:00
- branch: task/gameplay-loop-integration
- commit_at_start: 6372584 feat: implement and validate factions and companions features (Fases 21 and 22) - 2026-05-24T06:08
- summary: Integracao final do loop de gameplay ligando Hexcrawl e Dialogos no App.svelte
- last_change: Concluida a fiacao reativa do DialoguePanel e a interceptacao de movimento de Hexcrawl no App.svelte
#### Files At Start
- AGENTS.md
- docs/process/task-ledger.md
- drizzle/meta/0007_snapshot.json
- drizzle/meta/0008_snapshot.json
- drizzle/meta/0009_snapshot.json
- drizzle/meta/0010_snapshot.json
- drizzle/meta/0011_snapshot.json
- drizzle/meta/0012_snapshot.json
- drizzle/meta/_journal.json
- llms.txt
- pandorha-sistema-28-04-backup/App.svelte
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/styles.css
- src/entities/bastion/__tests__/BastionService.spec.ts
- src/entities/bastion/infrastructure/DrizzleBastionRepository.ts
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/CharacterService.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/model/characterSchema.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/equipment/__tests__/InventoryService.spec.ts
- src/entities/social/__tests__/FactionService.spec.ts
- src/entities/social/infrastructure/DrizzleFactionRepository.ts
- src/entities/synergy/__tests__/SynergyService.spec.ts
- src/entities/traps/__tests__/TrapService.spec.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/entities/world-tile/domain/EncounterService.ts
- src/features/bastion/ui/BastionPanel.svelte
- src/features/bastion/ui/BastionStructureCard.svelte
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/bastion/ui/bastion.css
- src/features/character-list/__tests__/characterListView.spec.ts
- ... 53 more
#### Checkpoints
#### Checkpoint 2026-05-26T19:10:16-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T19:10:23-03:00
- Done: Concluida a fiacao reativa do DialoguePanel e a interceptacao de movimento de Hexcrawl no App.svelte
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:fase-23-integracao-final-loop-gameplay -->
<!-- pandorha-task:fases-15-e-16-estabilizacao-combate-dialogos -->
### Estabilizacao de Combate e Sistema de Dialogos
- id: fases-15-e-16-estabilizacao-combate-dialogos
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-26T18:58:04-03:00
- finished_at: 2026-05-26T18:58:08-03:00
- model_started: Gemini 1.5 Pro
- model_finished: Gemini 1.5 Pro
- last_modified_at: 2026-05-26T18:58:08-03:00
- branch: task/gameplay-loop-integration
- commit_at_start: 6372584 feat: implement and validate factions and companions features (Fases 21 and 22) - 2026-05-24T06:08
- summary: Conclusao da Fase 15 (Estabilizacao de Combate) com 100% de cobertura nos testes de combate e integracao da Fase 16 (Sistema de Dialogos)
- last_change: Estabilizacao completa de combate com 100% de cobertura nos testes unitarios de combate e linter 100% livre de erros.
#### Files At Start
- AGENTS.md
- docs/process/task-ledger.md
- drizzle/meta/0007_snapshot.json
- drizzle/meta/0008_snapshot.json
- drizzle/meta/0009_snapshot.json
- drizzle/meta/0010_snapshot.json
- drizzle/meta/0011_snapshot.json
- drizzle/meta/0012_snapshot.json
- drizzle/meta/_journal.json
- llms.txt
- pandorha-sistema-28-04-backup/App.svelte
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/styles.css
- src/entities/bastion/__tests__/BastionService.spec.ts
- src/entities/bastion/infrastructure/DrizzleBastionRepository.ts
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/CharacterService.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/model/characterSchema.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/equipment/__tests__/InventoryService.spec.ts
- src/entities/social/__tests__/FactionService.spec.ts
- src/entities/social/infrastructure/DrizzleFactionRepository.ts
- src/entities/synergy/__tests__/SynergyService.spec.ts
- src/entities/traps/__tests__/TrapService.spec.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/entities/world-tile/domain/EncounterService.ts
- src/features/bastion/ui/BastionPanel.svelte
- src/features/bastion/ui/BastionStructureCard.svelte
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/bastion/ui/bastion.css
- src/features/character-list/__tests__/characterListView.spec.ts
- ... 53 more
#### Checkpoints
#### Checkpoint 2026-05-26T18:58:04-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: Gemini 1.5 Pro

#### Checkpoint 2026-05-26T18:58:08-03:00
- Done: Estabilizacao completa de combate com 100% de cobertura nos testes unitarios de combate e linter 100% livre de erros.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: Gemini 1.5 Pro
<!-- /pandorha-task:fases-15-e-16-estabilizacao-combate-dialogos -->
<!-- pandorha-task:20260523-133802-fase-19-sinergia-de-combate-e-forja-tatica -->
### Fase 19: Sinergia de Combate e Forja Tatica
- id: 20260523-133802-fase-19-sinergia-de-combate-e-forja-tatica
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-23T13:38:02-03:00
- finished_at: 2026-05-26T12:18:34-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-26T12:18:34-03:00
- branch: task/combat-synergy
- commit_at_start: 6998459 feat(bastion-quest): conclui integracao do bastiao e diario de missoes
- summary: Implementacao do modulo de Coesao, reserva compartilhada, ciclo de combo de Sinergia e persistencia RPC no SQLite
- last_change: Concluida a integracao do loop de combate real no Hexcrawl, com IA tatica, regra de 0 HP (Moribundo), acoes de primeiros socorros, manobra de fuga e distribuicao de recompensas/loot persistida no banco local
#### Files At Start
- pandorha-sistema-28-04-backup/
- planejamento_etapas.md
#### Checkpoints
#### Checkpoint 2026-05-23T13:38:02-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-26T12:18:34-03:00
- Done: Concluida a integracao do loop de combate real no Hexcrawl, com IA tatica, regra de 0 HP (Moribundo), acoes de primeiros socorros, manobra de fuga e distribuicao de recompensas/loot persistida no banco local
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260523-133802-fase-19-sinergia-de-combate-e-forja-tatica -->
<!-- pandorha-task:20260523-132712-fases-17-e-18-bastiao-diario-de-missoes -->
### Fases 17 e 18: Bastiao & Diario de Missoes
- id: 20260523-132712-fases-17-e-18-bastiao-diario-de-missoes
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-23T13:27:12-03:00
- finished_at: 2026-05-23T13:27:17-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-23T13:27:17-03:00
- branch: task/campaign-dialogue
- commit_at_start: baf93f5 style: aplica formatacao do Biome aos arquivos do app
- summary: Integracao de UI e persistencia RPC local-first do Bastiao e Diario de Quests/Rumores
- last_change: Integracao visual completa do Bastiao, refatoracao do painel para respeitar o limite de 500 linhas e desenvolvimento do Diario de Quests/Rumores com persistencia RPC no SQLite WASM e 520 testes unitarios passando.
#### Files At Start
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/navigation.ts
- src/entities/bastion/__tests__/BastionService.spec.ts
- src/entities/bastion/domain/BastionRepository.ts
- src/entities/bastion/domain/BastionService.ts
- src/entities/bastion/infrastructure/InMemoryBastionRepository.ts
- src/features/bastion/ui/BastionPanel.svelte
- src/features/saves/infrastructure/WorkerSaveRepository.ts
- src/features/saves/ui/SaveManagerPanel.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/model/rpcSchemas.ts
- drizzle/0009_special_sentinels.sql
- drizzle/0010_windy_wither.sql
- drizzle/meta/0009_snapshot.json
- drizzle/meta/0010_snapshot.json
- pandorha-sistema-28-04-backup/
- planejamento_etapas.md
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/dialogue/
- src/entities/quest/
- src/features/bastion/index.ts
- src/features/bastion/ui/BastionStructureCard.svelte
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/bastion/ui/bastion.css
- src/features/bastion/ui/moduleCatalog.ts
- src/features/dialogue/
- src/features/quests/
#### Checkpoints
#### Checkpoint 2026-05-23T13:27:12-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-23T13:27:17-03:00
- Done: Integracao visual completa do Bastiao, refatoracao do painel para respeitar o limite de 500 linhas e desenvolvimento do Diario de Quests/Rumores com persistencia RPC no SQLite WASM e 520 testes unitarios passando.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260523-132712-fases-17-e-18-bastiao-diario-de-missoes -->
<!-- pandorha-task:t51-social-persistence -->
### Fase T51: Integracao e Persistencia do Sistema Social
- id: t51-social-persistence
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-22T22:51:07-03:00
- finished_at: 2026-05-22T22:51:14-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gemini
- last_modified_at: 2026-05-22T22:51:14-03:00
- branch: master
- commit_at_start: 97b167b chore(maintenance): ajuste do script de automacao e consolidacao da etapa 2 [2026-05-22 18:15]
- summary: Integracao e Persistencia fisica do modulo Social via RPC no Web Worker e SQLite local.
- last_change: Registradas as assinaturas RPC de Social, tratados os comandos no Web Worker SQLite físico, estendidos os snapshots de save/load de jogo e atualizada a UI reativa Svelte 5 para conectar ao WorkerSocialRepository persistente.
#### Files At Start
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/navigation.ts
- src/entities/social/index.ts
- src/features/social/ui/FactionPanel.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/model/rpcSchemas.ts
- drizzle/0007_material_silver_surfer.sql
- drizzle/meta/0007_snapshot.json
- pandorha-sistema-28-04-backup/
- planejamento_bastiao.md
- src/entities/bastion/
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/features/bastion/
#### Checkpoints
#### Checkpoint 2026-05-22T22:51:07-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-22T22:51:14-03:00
- Done: Registradas as assinaturas RPC de Social, tratados os comandos no Web Worker SQLite físico, estendidos os snapshots de save/load de jogo e atualizada a UI reativa Svelte 5 para conectar ao WorkerSocialRepository persistente.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gemini
<!-- /pandorha-task:t51-social-persistence -->
<!-- pandorha-task:t44-hexcrawl-encounters -->
### Fase T44: Hexcrawl & Encontros
- id: t44-hexcrawl-encounters
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-22T15:21:15-03:00
- finished_at: 2026-05-22T15:21:21-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-22T15:21:21-03:00
- branch: task/hexcrawl-encounters
- commit_at_start: ab28379 fix(crafting-workshop): estabilizacao e redesign do quality gate (2026-05-22 09:35)
- summary: Integracao do EncounterService com o DiceService, correcao de tipos estritos do TS no world-tile e cobertura de 100% dos testes unitarios
- last_change: Finalizacao da Etapa 2: Integracao do EncounterService com o DiceService, correcao de tipos estritos do TS no world-tile e cobertura de 100% dos testes unitarios
#### Files At Start
- src/features/hexcrawl-map/ui/HexcrawlMapPanel.svelte
- pandorha-sistema-28-04-backup/
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/entities/world-tile/domain/EncounterService.ts
#### Checkpoints
#### Checkpoint 2026-05-22T15:21:15-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-22T15:21:21-03:00
- Done: Finalizacao da Etapa 2: Integracao do EncounterService com o DiceService, correcao de tipos estritos do TS no world-tile e cobertura de 100% dos testes unitarios
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:t44-hexcrawl-encounters -->
<!-- pandorha-task:t43-lint-stabilization -->
### Fase T43: Estabilizacao de Lints e Homologacao de UI
- id: t43-lint-stabilization
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-18T22:28:05-03:00
- finished_at: 2026-05-18T22:28:07-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-18T22:28:07-03:00
- branch: task/crafting-workshop
- commit_at_start: 020bd2e cleanup(crafting): remover pasta de backups temporarios pos-homologacao (2026-05-17 13:58)
- summary: Correcao de 34 lints no Biome, erros de tipo no characterListView.spec.ts e homologacao visual do CampPanel, CombatEncounterPanel e SocialDemo
- last_change: Estabilizacao completa de 34 avisos de linter no Biome, remocao de supressoes desnecessarias, resolucao de erros do compilador TypeScript em characterListView.spec.ts e validacao visual de UI em CampPanel, CombatEncounterPanel, Oficina/Forja (Decorator) e SocialDemo.
#### Files At Start
- docs/process/task-ledger.md
- drizzle/meta/_journal.json
- pandorha-sistema-backup/App.svelte.bak
- pandorha-sistema-backup/navigation.ts.bak
- src/app/App.svelte
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- src/entities/equipment/__tests__/DrizzleCraftingRepository.spec.ts
- src/entities/equipment/__tests__/InMemoryCraftingRepository.ts
- src/entities/equipment/domain/CraftingQualityDecorators.ts
- src/entities/equipment/domain/CraftingRepository.ts
- src/entities/equipment/domain/CraftingService.ts
- src/entities/equipment/infrastructure/DrizzleCraftingRepository.ts
- src/entities/equipment/model/craftingSchema.ts
- src/features/camp/domain/__tests__/CampService.spec.ts
- src/features/camp/ui/CampPanel.svelte
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatTrainingAttackProfile.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/crafting/index.ts
- src/features/crafting/ui/CraftingWorkshopPanel.svelte
- src/features/hexcrawl-map/ui/HexcrawlMapPanel.svelte
- src/features/inventory-readonly/ui/InventoryReadOnlyPanel.svelte
- src/features/social/ui/SocialDemo.svelte
- src/shared/inventory/__tests__/CraftingInventoryCapacity.spec.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- correcao_de_lints_e_persistencia.md
- drizzle/0005_brainy_plazm.sql
- drizzle/meta/0005_snapshot.json
- pandorha-combate-backup/
- pandorha-sistema-backup/CampPanel.svelte.bak
- ... 17 more
#### Checkpoints
#### Checkpoint 2026-05-18T22:28:05-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-18T22:28:07-03:00
- Done: Estabilizacao completa de 34 avisos de linter no Biome, remocao de supressoes desnecessarias, resolucao de erros do compilador TypeScript em characterListView.spec.ts e validacao visual de UI em CampPanel, CombatEncounterPanel, Oficina/Forja (Decorator) e SocialDemo.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:t43-lint-stabilization -->
<!-- pandorha-task:t42-inventory-encumbrance -->
### Fase T42: Inventario Tatico e Decorador de Carga
- id: t42-inventory-encumbrance
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-17T14:28:08-03:00
- finished_at: 2026-05-18T13:24:51-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gemini-2.5-pro
- last_modified_at: 2026-05-18T13:24:51-03:00
- branch: task/crafting-workshop
- commit_at_start: 020bd2e cleanup(crafting): remover pasta de backups temporarios pos-homologacao (2026-05-17 13:58)
- summary: Implementacao do Inventario Tatico, Capacidade de Carga e Decorador de Penalidades de Sobrecarga integrado com SQLite
- last_change: Resolvido ReferenceError nas abas de UI por renomeacao incorreta de variaveis no linter Biome. Adicionados comentarios de ignore nos arquivos App.svelte, CharacterList.svelte, SocialDemo.svelte e InventoryReadOnlyPanel.svelte.
#### Files At Start
- pandorha-inventario-backup/
#### Checkpoints
#### Checkpoint 2026-05-17T14:28:08-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-18T12:25:16-03:00
- Done: Planejamento estruturado da homologacao de UI, execucao de todos os 432 testes de regressao com sucesso, inicializacao e checagem do servidor Vite local e carregamento do Service Worker online
- Next: Homologacao visual assistida com o usuario e execucao de gates de qualidade finais
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-18T13:08:32-03:00
- Done: Correcao completa de lints e validacao de testes. Servidor local Vite inicializado na porta 5173 para homologacao de UI.
- Next: Validacao manual no navegador
- Risks: Nenhum
- Improvements: Nenhum
- Model/config: gemini-2.5-pro

#### Checkpoint 2026-05-18T13:24:51-03:00
- Done: Resolvido ReferenceError nas abas de UI por renomeacao incorreta de variaveis no linter Biome. Adicionados comentarios de ignore nos arquivos App.svelte, CharacterList.svelte, SocialDemo.svelte e InventoryReadOnlyPanel.svelte.
- Next: Validacao de UI no navegador
- Risks: Nenhum
- Improvements: Nenhum
- Model/config: gemini-2.5-pro
<!-- /pandorha-task:t42-inventory-encumbrance -->
<!-- pandorha-task:t42-tactical-inventory -->
### Implementacao do Inventario Tatico e Carga
- id: t42-tactical-inventory
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-17T14:33:25-03:00
- finished_at: 2026-05-17T14:33:29-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-17T14:33:29-03:00
- branch: task/crafting-workshop
- commit_at_start: 020bd2e cleanup(crafting): remover pasta de backups temporarios pos-homologacao (2026-05-17 13:58)
- summary: Refatoracao e implementacao da UI Reativa de Inventario Tatico e Carga com o padrao Decorator no painel da Oficina (CraftingWorkshopPanel.svelte), integrando calculo de sobrecarga tatico de RPG no Svelte 5 com persistencia local.
- last_change: Concluido com exito: persistencia local no SQLite, decorators de logistica de sobrecarga, servico de inventario com testes 100% verdes, painel de UI do Svelte 5 totalmente reativo com mudanca de cor e barra biomecanica premium.
#### Files At Start
- docs/process/task-ledger.md
- drizzle/meta/_journal.json
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- src/entities/equipment/__tests__/DrizzleCraftingRepository.spec.ts
- src/entities/equipment/__tests__/InMemoryCraftingRepository.ts
- src/entities/equipment/domain/CraftingQualityDecorators.ts
- src/entities/equipment/domain/CraftingRepository.ts
- src/entities/equipment/domain/CraftingService.ts
- src/entities/equipment/infrastructure/DrizzleCraftingRepository.ts
- src/entities/equipment/model/craftingSchema.ts
- src/features/crafting/ui/CraftingWorkshopPanel.svelte
- src/shared/inventory/__tests__/CraftingInventoryCapacity.spec.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/model/sqliteMigrations.ts
- drizzle/0005_brainy_plazm.sql
- drizzle/meta/0005_snapshot.json
- pandorha-inventario-backup/
- src/entities/equipment/__tests__/InventoryService.spec.ts
- src/entities/equipment/domain/InventoryService.ts
#### Checkpoints
#### Checkpoint 2026-05-17T14:33:25-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-17T14:33:29-03:00
- Done: Concluido com exito: persistencia local no SQLite, decorators de logistica de sobrecarga, servico de inventario com testes 100% verdes, painel de UI do Svelte 5 totalmente reativo com mudanca de cor e barra biomecanica premium.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:t42-tactical-inventory -->
<!-- pandorha-task:t41-crafting-workshop -->
### Fase T41: Oficina e Forja sob Padrao Decorator
- id: t41-crafting-workshop
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-17T13:57:32-03:00
- finished_at: 2026-05-17T13:57:35-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-17T13:57:35-03:00
- branch: task/crafting-workshop
- commit_at_start: 644a2af feat(vertical-slice): conclui e homologa Fases T34 a T39 com 100% de cobertura
- summary: Implementar Oficina de Forja de equipamentos e composicao dinamica de propriedades com Decorator
- last_change: Oficina e Forja com Decorator, testes e linter 100% integrados
#### Files At Start
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- "pandorha obsidian antigravity/.obsidian/app.json"
- "pandorha obsidian antigravity/.obsidian/appearance.json"
- "pandorha obsidian antigravity/.obsidian/core-plugins.json"
- "pandorha obsidian antigravity/.obsidian/graph.json"
- "pandorha obsidian antigravity/.obsidian/workspace.json"
- src/app/App.svelte
- src/app/model/navigation.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/domain/CharacterRepository.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/InMemoryCharacterRepository.ts
- src/features/camp/ui/CampPanel.svelte
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/model/rpcSchemas.ts
- src/shared/rpc/model/rpcTypes.ts
- drizzle/0003_tricky_lila_cheney.sql
- drizzle/0004_sturdy_omega_sentinel.sql
- drizzle/meta/0003_snapshot.json
- drizzle/meta/0004_snapshot.json
- pandorha-sistema-28-04-backup/App.svelte.bak
- pandorha-sistema-28-04-backup/SqliteOpfsBootstrapService.spec.ts.bak
- pandorha-sistema-28-04-backup/drizzle.config.mjs.bak
- pandorha-sistema-28-04-backup/navigation.ts.bak
- pandorha-sistema-28-04-backup/sqliteMigrations.ts.bak
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/equipment/__tests__/CraftingQualityDecorators.spec.ts
- ... 11 more
#### Checkpoints
#### Checkpoint 2026-05-17T13:57:32-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-17T13:57:35-03:00
- Done: Oficina e Forja com Decorator, testes e linter 100% integrados
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:t41-crafting-workshop -->
<!-- pandorha-task:t40-status-effects -->
### Fase T40: Sistema de Enfermidades e Toxinas
- id: t40-status-effects
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-16T19:20:09-03:00
- finished_at: 2026-05-16T19:29:53-03:00
- model_started: Antigravity
- model_finished: Claude 3.5 Sonnet
- last_modified_at: 2026-05-16T19:29:53-03:00
- branch: task/status-effects-decorations
- commit_at_start: 644a2af feat(vertical-slice): conclui e homologa Fases T34 a T39 com 100% de cobertura
- summary: Modelagem de eixos e penalidades temporarias atraves de Decorators e persistencia local SQLite
- last_change: Implementada a ponte RPC para persistencia local SQLite WASM de personagens e status effects de enfermidades de forma granular
#### Files At Start
- none
#### Checkpoints
#### Checkpoint 2026-05-16T19:20:09-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: Antigravity

#### Checkpoint 2026-05-16T19:29:53-03:00
- Done: Implementada a ponte RPC para persistencia local SQLite WASM de personagens e status effects de enfermidades de forma granular
- Next: Criar o componente de UI de Enfermidades e visualizacao reativa dos eixos recalculados e status ativos
- Risks: none recorded
- Improvements: none recorded
- Model/config: Claude 3.5 Sonnet
<!-- /pandorha-task:t40-status-effects -->
<!-- pandorha-task:t39-qa-validation -->
### Fase T39: QA e Validacao
- id: t39-qa-validation
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-16T18:57:27-03:00
- finished_at: 2026-05-16T19:09:19-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-16T19:09:19-03:00
- branch: task/sqlite-opfs-bootstrap
- commit_at_start: f904516 feat(rpc): adiciona contrato de save load
- summary: Executar build, testes de regressao e auditoria estatica de banco local do Pandorha Engine
- last_change: Remocao de tags <style> locais em componentes Svelte (CampPanel, ClockDemo, FactionPanel, SocialDemo), correcao de todos os avisos de linter do Biome e tsc em SocialStandingService.spec.ts, elevacao da cobertura de testes para 100% no subdominio de Social e atestado do Quality Gate de cobertura e linter.
#### Files At Start
- .agents/skills/ai-docs-formatter/assets/response-schema.json
- .agents/skills/build-test-verify/scripts/check-query-budget.ts
- .agents/skills/build-test-verify/scripts/verify-coverage.ts
- .agents/skills/character-builder/references/rules_manifest.json
- .agents/skills/dialogue-architect/scripts/validate_tree.ts
- .agents/skills/monster-factory/references/master_table.json
- .agents/skills/monster-factory/references/roles.json
- .agents/skills/world-state-manager/assets/expected_correction_payload.json
- .agents/skills/world-state-manager/references/acl_policies.json
- .agents/skills/world-state-manager/references/seed_manifestos/morden_seed.json
- .agents/skills/world-state-manager/scripts/world_state_cli.ts
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/0000_snapshot.json
- drizzle/meta/_journal.json
- mcp/pandorha-arch-guard/package.json
- mcp/pandorha-arch-guard/scripts/validate-stdio.js
- mcp/pandorha-arch-guard/src/server.js
- mcp/pandorha-arch-guard/test/arch-guard.test.js
- mcp/pandorha-db-auditor/package.json
- mcp/pandorha-db-auditor/scripts/validate-stdio.js
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- mcp/pandorha-db-auditor/tsconfig.json
- mcp/pandorha-knowledge/package.json
- mcp/pandorha-knowledge/scripts/validate-stdio.js
- mcp/pandorha-knowledge/src/config.js
- mcp/pandorha-knowledge/src/file-system.js
- mcp/pandorha-knowledge/src/markdown-segments.js
- mcp/pandorha-knowledge/src/search-engine.js
- mcp/pandorha-knowledge/src/server.js
- mcp/pandorha-knowledge/test/search-engine.test.js
- mcp/pandorha-memory-bridge/package.json
- mcp/pandorha-memory-bridge/scripts/validate-stdio.js
- mcp/pandorha-memory-bridge/src/server.js
- mcp/pandorha-memory-bridge/test/memory-bridge.test.js
- mcp_config.json
- src/app/App.svelte
- src/app/model/navigation.ts
- ... 42 more
#### Checkpoints
#### Checkpoint 2026-05-16T18:57:27-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-16T19:09:19-03:00
- Done: Remocao de tags <style> locais em componentes Svelte (CampPanel, ClockDemo, FactionPanel, SocialDemo), correcao de todos os avisos de linter do Biome e tsc em SocialStandingService.spec.ts, elevacao da cobertura de testes para 100% no subdominio de Social e atestado do Quality Gate de cobertura e linter.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:t39-qa-validation -->
<!-- pandorha-task:t38-sqlite-persistence -->
### Fase T38: Persistencia Local-First Real
- id: t38-sqlite-persistence
- status: completed
- kind: task
- planned: yes
- started_at: 2026-05-16T18:52:26-03:00
- finished_at: 2026-05-16T18:54:21-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-16T18:54:21-03:00
- branch: task/sqlite-opfs-bootstrap
- commit_at_start: f904516 feat(rpc): adiciona contrato de save load
- summary: Conexao fisica ao SQLite WASM local e sincronizacao de estado por RPC
- last_change: Conexao fisica ao SQLite WASM local e sincronizacao de snapshots de personagens e estado de mundo implementada e validada com 100 por cento de cobertura em 369 testes.
#### Files At Start
- .agents/skills/ai-docs-formatter/assets/response-schema.json
- .agents/skills/build-test-verify/scripts/check-query-budget.ts
- .agents/skills/build-test-verify/scripts/verify-coverage.ts
- .agents/skills/character-builder/references/rules_manifest.json
- .agents/skills/dialogue-architect/scripts/validate_tree.ts
- .agents/skills/monster-factory/references/master_table.json
- .agents/skills/monster-factory/references/roles.json
- .agents/skills/world-state-manager/assets/expected_correction_payload.json
- .agents/skills/world-state-manager/references/acl_policies.json
- .agents/skills/world-state-manager/references/seed_manifestos/morden_seed.json
- .agents/skills/world-state-manager/scripts/world_state_cli.ts
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/0000_snapshot.json
- drizzle/meta/_journal.json
- mcp/pandorha-arch-guard/package.json
- mcp/pandorha-arch-guard/scripts/validate-stdio.js
- mcp/pandorha-arch-guard/src/server.js
- mcp/pandorha-arch-guard/test/arch-guard.test.js
- mcp/pandorha-db-auditor/package.json
- mcp/pandorha-db-auditor/scripts/validate-stdio.js
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- mcp/pandorha-db-auditor/tsconfig.json
- mcp/pandorha-knowledge/package.json
- mcp/pandorha-knowledge/scripts/validate-stdio.js
- mcp/pandorha-knowledge/src/config.js
- mcp/pandorha-knowledge/src/file-system.js
- mcp/pandorha-knowledge/src/markdown-segments.js
- mcp/pandorha-knowledge/src/search-engine.js
- mcp/pandorha-knowledge/src/server.js
- mcp/pandorha-knowledge/test/search-engine.test.js
- mcp/pandorha-memory-bridge/package.json
- mcp/pandorha-memory-bridge/scripts/validate-stdio.js
- mcp/pandorha-memory-bridge/src/server.js
- mcp/pandorha-memory-bridge/test/memory-bridge.test.js
- mcp_config.json
- src/app/App.svelte
- src/app/model/navigation.ts
- ... 42 more
#### Checkpoints
#### Checkpoint 2026-05-16T18:52:26-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-16T18:54:21-03:00
- Done: Conexao fisica ao SQLite WASM local e sincronizacao de snapshots de personagens e estado de mundo implementada e validada com 100 por cento de cobertura em 369 testes.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:t38-sqlite-persistence -->
<!-- pandorha-task:t37-pwa-offline -->
### Fase T37: PWA Offline Smoke
- id: t37-pwa-offline
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-16T18:43:56-03:00
- finished_at: 2026-05-16T18:46:53-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: Gemini
- last_modified_at: 2026-05-16T18:46:53-03:00
- branch: task/sqlite-opfs-bootstrap
- commit_at_start: f904516 feat(rpc): adiciona contrato de save load
- summary: Implementacao do Service Worker nativo (Vanilla) e indicador de status de rede online/offline na UI
- last_change: Implementacao do Service Worker Vanilla offline com cache de recursos e badge dinamico de rede online/offline no cabecalho.
#### Files At Start
- .agents/skills/ai-docs-formatter/assets/response-schema.json
- .agents/skills/build-test-verify/scripts/check-query-budget.ts
- .agents/skills/build-test-verify/scripts/verify-coverage.ts
- .agents/skills/character-builder/references/rules_manifest.json
- .agents/skills/dialogue-architect/scripts/validate_tree.ts
- .agents/skills/monster-factory/references/master_table.json
- .agents/skills/monster-factory/references/roles.json
- .agents/skills/world-state-manager/assets/expected_correction_payload.json
- .agents/skills/world-state-manager/references/acl_policies.json
- .agents/skills/world-state-manager/references/seed_manifestos/morden_seed.json
- .agents/skills/world-state-manager/scripts/world_state_cli.ts
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/0000_snapshot.json
- drizzle/meta/_journal.json
- mcp/pandorha-arch-guard/package.json
- mcp/pandorha-arch-guard/scripts/validate-stdio.js
- mcp/pandorha-arch-guard/src/server.js
- mcp/pandorha-arch-guard/test/arch-guard.test.js
- mcp/pandorha-db-auditor/package.json
- mcp/pandorha-db-auditor/scripts/validate-stdio.js
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- mcp/pandorha-db-auditor/tsconfig.json
- mcp/pandorha-knowledge/package.json
- mcp/pandorha-knowledge/scripts/validate-stdio.js
- mcp/pandorha-knowledge/src/config.js
- mcp/pandorha-knowledge/src/file-system.js
- mcp/pandorha-knowledge/src/markdown-segments.js
- mcp/pandorha-knowledge/src/search-engine.js
- mcp/pandorha-knowledge/src/server.js
- mcp/pandorha-knowledge/test/search-engine.test.js
- mcp/pandorha-memory-bridge/package.json
- mcp/pandorha-memory-bridge/scripts/validate-stdio.js
- mcp/pandorha-memory-bridge/src/server.js
- mcp/pandorha-memory-bridge/test/memory-bridge.test.js
- mcp_config.json
- src/app/App.svelte
- src/app/model/navigation.ts
- ... 41 more
#### Checkpoints
#### Checkpoint 2026-05-16T18:43:56-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-16T18:46:53-03:00
- Done: Implementacao do Service Worker Vanilla offline com cache de recursos e badge dinamico de rede online/offline no cabecalho.
- Next: Iniciar Fase T38 de Persistencia Local-First com SQLite OPFS + Drizzle e sincronizacao por RPC.
- Risks: none recorded
- Improvements: none recorded
- Model/config: Gemini
<!-- /pandorha-task:t37-pwa-offline -->
<!-- pandorha-task:t35-campservice -->
### T35 CampService - Descanso Ativo
- id: t35-campservice
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-16T17:55:06-03:00
- finished_at: 2026-05-16T18:43:53-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-16T18:43:53-03:00
- branch: task/sqlite-opfs-bootstrap
- commit_at_start: f904516 feat(rpc): adiciona contrato de save load
- summary: Implementação do sistema de acampamento e economia de tempo conforme Capítulo 28 do Códex. Foco em ações de acampamento, contador de perigo e Padrão Decorator para bônus de recuperação.
- last_change: Conclusao do CampService e integracao da UI CampPanel/FactionPanel
#### Files At Start
- .agents/skills/ai-docs-formatter/assets/response-schema.json
- .agents/skills/build-test-verify/scripts/check-query-budget.ts
- .agents/skills/build-test-verify/scripts/verify-coverage.ts
- .agents/skills/character-builder/references/rules_manifest.json
- .agents/skills/dialogue-architect/scripts/validate_tree.ts
- .agents/skills/monster-factory/references/master_table.json
- .agents/skills/monster-factory/references/roles.json
- .agents/skills/world-state-manager/assets/expected_correction_payload.json
- .agents/skills/world-state-manager/references/acl_policies.json
- .agents/skills/world-state-manager/references/seed_manifestos/morden_seed.json
- .agents/skills/world-state-manager/scripts/world_state_cli.ts
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/0000_snapshot.json
- drizzle/meta/_journal.json
- mcp/pandorha-arch-guard/package.json
- mcp/pandorha-arch-guard/scripts/validate-stdio.js
- mcp/pandorha-arch-guard/src/server.js
- mcp/pandorha-arch-guard/test/arch-guard.test.js
- mcp/pandorha-db-auditor/package.json
- mcp/pandorha-db-auditor/scripts/validate-stdio.js
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- mcp/pandorha-db-auditor/tsconfig.json
- mcp/pandorha-knowledge/package.json
- mcp/pandorha-knowledge/scripts/validate-stdio.js
- mcp/pandorha-knowledge/src/config.js
- mcp/pandorha-knowledge/src/file-system.js
- mcp/pandorha-knowledge/src/markdown-segments.js
- mcp/pandorha-knowledge/src/search-engine.js
- mcp/pandorha-knowledge/src/server.js
- mcp/pandorha-knowledge/test/search-engine.test.js
- mcp/pandorha-memory-bridge/package.json
- mcp/pandorha-memory-bridge/scripts/validate-stdio.js
- mcp/pandorha-memory-bridge/src/server.js
- mcp/pandorha-memory-bridge/test/memory-bridge.test.js
- mcp_config.json
- src/app/App.svelte
- src/app/model/navigation.ts
- ... 34 more
#### Checkpoints
#### Checkpoint 2026-05-16T17:55:06-03:00
- Done: task record created
- Next: Escrever teste de unidade inicial para CampService (Reverse TDD)
- Risks: Complexidade na gestão de estado do Contador de Perigo e integração com relógios de grupo.
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-16T17:56:18-03:00
- Done: Implementação do domínio CampService e RecoveryDecorators com 100% de cobertura de testes.
- Next: Implementar a UI CampPanel.svelte e integrar o contador de perigo.
- Risks: A integração da UI com o estado global de personagens pode exigir refatoração nos stores.
- Improvements: O padrão Decorator foi aplicado com sucesso para cálculos de bônus, permitindo fácil extensão.
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-16T18:43:53-03:00
- Done: Conclusao do CampService e integracao da UI CampPanel/FactionPanel
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:t35-campservice -->
<!-- pandorha-task:20260515-092517-t34-clockservice -->
### T34 ClockService
- id: 20260515-092517-t34-clockservice
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-15T09:25:17-03:00
- finished_at: 2026-05-15T12:01:38-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-15T12:01:38-03:00
- branch: task/sqlite-opfs-bootstrap
- commit_at_start: f904516 feat(rpc): adiciona contrato de save load
- summary: Sistema de Clocks In-Memory com Schema Zod, Fake Repository, Service puro com Result Pattern e UI mínima.
- last_change: Integração completa do ClockService com 100% de cobertura e UI Svelte 5 funcional.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- mcp_config.json
- src/app/App.svelte
- src/app/model/navigation.ts
- vitest.config.mjs
- .serena/
- drizzle/0001_crazy_wallop.sql
- drizzle/meta/0001_snapshot.json
- "pandorha obsidian antigravity/"
- src/app/model/socialManeuvers.spec.ts
- src/app/model/socialSession.spec.ts
- src/app/model/socialSession.ts
- src/features/social/__tests__/
- src/features/social/domain/
- src/features/social/index.ts
- src/features/social/model-api.ts
- src/features/social/model/
- src/features/social/ui/
- src/shared/persistence/
#### Checkpoints
#### Checkpoint 2026-05-15T09:25:17-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-15T12:01:38-03:00
- Done: Integração completa do ClockService com 100% de cobertura e UI Svelte 5 funcional.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260515-092517-t34-clockservice -->
<!-- pandorha-task:20260514-221059-ciclo-3-manobras-sociais-in-memory -->
### Ciclo 3: Manobras Sociais In-Memory
- id: 20260514-221059-ciclo-3-manobras-sociais-in-memory
- status: completed
- kind: feature
- planned: yes
- started_at: 2026-05-14T22:10:59-03:00
- finished_at: 2026-05-14T22:11:05-03:00
- model_started: gpt-5.5 high-reasoning final review; local automation zero-token
- model_finished: gpt-5.5 high-reasoning final review; local automation zero-token
- last_modified_at: 2026-05-14T22:11:05-03:00
- branch: task/sqlite-opfs-bootstrap
- commit_at_start: f904516 feat(rpc): adiciona contrato de save load
- summary: Implementação do Padrão Decorator para Senso de Grupo, Lisonja Venenosa e Charme Místico, integração com SocialSession e UI de Facções
- last_change: Decoradores de manobras concluídos com 341 testes passando.
#### Files At Start
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- mcp_config.json
- src/app/App.svelte
- src/app/model/navigation.ts
- vitest.config.mjs
- .serena/
- drizzle/0001_crazy_wallop.sql
- drizzle/meta/0001_snapshot.json
- "pandorha obsidian antigravity/"
- src/app/model/socialManeuvers.spec.ts
- src/app/model/socialSession.spec.ts
- src/app/model/socialSession.ts
- src/features/social/__tests__/
- src/features/social/domain/
- src/features/social/index.ts
- src/features/social/model-api.ts
- src/features/social/model/
- src/features/social/ui/
- src/shared/persistence/
#### Checkpoints
#### Checkpoint 2026-05-14T22:10:59-03:00
- Done: task record created
- Next: implement the requested change
- Risks: unknown until implementation begins
- Improvements: automate repeated manual steps where practical
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token

#### Checkpoint 2026-05-14T22:11:05-03:00
- Done: Decoradores de manobras concluídos com 341 testes passando.
- Next: none
- Risks: none recorded
- Improvements: none recorded
- Model/config: gpt-5.5 high-reasoning final review; local automation zero-token
<!-- /pandorha-task:20260514-221059-ciclo-3-manobras-sociais-in-memory -->
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

<!-- /pandorha-ledger:unfinished -->

## Snapshots
<!-- pandorha-ledger:snapshots -->
### 2026-06-04T11:43:41-03:00 - chore-config
- branch: task/siege-and-cockpit
- commit: 42ee453 docs: update glossary for campaign quests and ADR decisions on time flow and quest system
- changed_files_count: 7
#### Changed Files
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- vite.config.mjs
- vitest.config.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:43:24-03:00 - docs-adr
- branch: task/siege-and-cockpit
- commit: 0986cb9 feat(app): wire Svelte UI panels and session controllers in App.svelte and styles
- changed_files_count: 10
#### Changed Files
- CONTEXT.md
- biome.json
- docs/adr/ADR-007-hexcrawl-driven-time-flow.md
- docs/adr/ADR-008-hybrid-quest-system.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- vite.config.mjs
- vitest.config.mjs
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:43:05-03:00 - feat-app
- branch: task/siege-and-cockpit
- commit: 65f57b0 feat(features-misc): implement character list/creation, spell-casting panel, chat log, and other UI utilities
- changed_files_count: 14
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/shared/game-rules.ts
- vite.config.mjs
- vitest.config.mjs
- docs/adr/ADR-007-hexcrawl-driven-time-flow.md
- docs/adr/ADR-008-hybrid-quest-system.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:42:02-03:00 - feat-features-misc
- branch: task/siege-and-cockpit
- commit: cd8c4b8 feat(combat-encounter): implement combat encounter views, AI service, catalog, and inventory integrations
- changed_files_count: 29
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/__tests__/chatState.spec.ts
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/inventory-readonly/ui/InventoryReadOnlyPanel.svelte
- src/features/sandbox/ui/GMSandboxPanel.svelte
- src/features/sandbox/ui/sandbox.css
- src/features/spell-cast/ui/SpellCastPanel.svelte
- src/shared/game-rules.ts
- vite.config.mjs
- vitest.config.mjs
- docs/adr/ADR-007-hexcrawl-driven-time-flow.md
- docs/adr/ADR-008-hybrid-quest-system.md
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:41:41-03:00 - feat-combat-encounter
- branch: task/siege-and-cockpit
- commit: 860d705 feat(hexcrawl): implement hexcrawl map panel and time flow navigation
- changed_files_count: 49
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/EncounterGeneratorService.spec.ts
- src/features/combat-encounter/__tests__/RepairIntegration.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/EncounterGeneratorService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/domain/UltimatesCatalog.ts
- src/features/combat-encounter/domain/__tests__/UltimatesCatalog.spec.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- ... 9 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:41:15-03:00 - feat-hexcrawl-map
- branch: task/siege-and-cockpit
- commit: afa0a2d feat(feature-traps): implement trap deployment and disarming panel
- changed_files_count: 53
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- src/features/hexcrawl-map/domain/HexcrawlMovementService.ts
- src/features/hexcrawl-map/model/hexcrawlMovementSchemas.ts
- src/features/hexcrawl-map/model/hexcrawlMovementTypes.ts
- src/features/inventory-readonly/ui/InventoryReadOnlyPanel.svelte
- ... 13 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:40:39-03:00 - feat-feature-traps
- branch: task/siege-and-cockpit
- commit: eee7628 feat(feature-social): implement negotiation panel and tactical forge armor features
- changed_files_count: 56
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- src/features/hexcrawl-map/domain/HexcrawlMovementService.ts
- src/features/hexcrawl-map/model/hexcrawlMovementSchemas.ts
- src/features/hexcrawl-map/model/hexcrawlMovementTypes.ts
- src/features/hexcrawl-map/ui/HexcrawlMapPanel.svelte
- ... 16 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:40:19-03:00 - feat-feature-social
- branch: task/siege-and-cockpit
- commit: c3ac83b feat(feature-espionage): implement espionage cell operations and heat management UI
- changed_files_count: 60
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- src/features/hexcrawl-map/domain/HexcrawlMovementService.ts
- src/features/hexcrawl-map/model/hexcrawlMovementSchemas.ts
- src/features/hexcrawl-map/model/hexcrawlMovementTypes.ts
- src/features/hexcrawl-map/ui/HexcrawlMapPanel.svelte
- ... 20 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:39:57-03:00 - feat-feature-espionage
- branch: task/siege-and-cockpit
- commit: 60c1992 feat(feature-mercenary): implement mercenary company and squad recruitment panel
- changed_files_count: 61
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/espionage/ui/EspionageManagementPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- src/features/hexcrawl-map/domain/HexcrawlMovementService.ts
- src/features/hexcrawl-map/model/hexcrawlMovementSchemas.ts
- src/features/hexcrawl-map/model/hexcrawlMovementTypes.ts
- ... 21 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:39:37-03:00 - feat-feature-mercenary
- branch: task/siege-and-cockpit
- commit: efab460 feat(feature-dialogue): implement dialogue history log and clue list components
- changed_files_count: 62
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/espionage/ui/EspionageManagementPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- src/features/hexcrawl-map/domain/HexcrawlMovementService.ts
- src/features/hexcrawl-map/model/hexcrawlMovementSchemas.ts
- src/features/hexcrawl-map/model/hexcrawlMovementTypes.ts
- ... 22 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:39:19-03:00 - feat-feature-dialogue
- branch: task/siege-and-cockpit
- commit: e944eb0 feat(feature-saves): implement save manager panel with JSON import/export
- changed_files_count: 65
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/dialogue/ui/ClueList.svelte
- src/features/dialogue/ui/DialogueHistoryLog.svelte
- src/features/dialogue/ui/DialoguePanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/espionage/ui/EspionageManagementPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- ... 25 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:39:01-03:00 - feat-feature-saves
- branch: task/siege-and-cockpit
- commit: 4b0b512 feat(feature-camp): implement camp rest active downtime panel and recovery decorators
- changed_files_count: 66
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/dialogue/ui/ClueList.svelte
- src/features/dialogue/ui/DialogueHistoryLog.svelte
- src/features/dialogue/ui/DialoguePanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/espionage/ui/EspionageManagementPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- ... 26 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:38:07-03:00 - feat-feature-camp
- branch: task/siege-and-cockpit
- commit: ff7c979 feat(entities): consolidate remaining character, spell, regional domain, and trap logic
- changed_files_count: 67
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/camp/domain/CampService.ts
- src/features/character-create/__tests__/characterCreateView.spec.ts
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/CombatEncounterService.spec.ts
- src/features/combat-encounter/__tests__/CombatInventoryIntegration.spec.ts
- src/features/combat-encounter/__tests__/CombatLootService.spec.ts
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/__tests__/combatEncounterView.spec.ts
- src/features/combat-encounter/__tests__/combatTrainingAttackProfile.spec.ts
- src/features/combat-encounter/domain/CombatEncounterService.ts
- src/features/combat-encounter/domain/CombatLootService.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatEncounterSchemas.ts
- src/features/combat-encounter/model/combatEncounterTypes.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/dialogue/ui/ClueList.svelte
- src/features/dialogue/ui/DialogueHistoryLog.svelte
- src/features/dialogue/ui/DialoguePanel.svelte
- src/features/domain-regional/ui/DomainCouncilPanel.svelte
- src/features/espionage/ui/EspionageManagementPanel.svelte
- ... 27 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:37:42-03:00 - feat-entities-consolidation
- branch: task/siege-and-cockpit
- commit: 91a80a6 feat(siege): implement siege resolution logic and camp integration
- changed_files_count: 101
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/investigation/__tests__/ResearchService.spec.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/lore/__tests__/LoreService.spec.ts
- src/entities/lore/domain/ILoreRepository.ts
- src/entities/lore/domain/LoreService.ts
- src/entities/lore/index.ts
- src/entities/lore/infrastructure/DrizzleLoreRepository.ts
- src/entities/lore/infrastructure/InMemoryLoreRepository.ts
- src/entities/lore/model/loreSchema.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- ... 61 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:37:12-03:00 - feat-siege
- branch: task/siege-and-cockpit
- commit: 41fb9f7 feat(espionage): implement espionage cell establishment and cell operations
- changed_files_count: 98
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/investigation/__tests__/ResearchService.spec.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/__tests__/TrapService.spec.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/bastion/ui/DowntimeProjectList.svelte
- ... 58 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:36:39-03:00 - feat-espionage
- branch: task/siege-and-cockpit
- commit: 79e3b86 feat(mercenary): implement mercenary companies and squad management
- changed_files_count: 100
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/espionage/__tests__/EspionageService.spec.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/__tests__/ResearchService.spec.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/__tests__/TrapService.spec.ts
- ... 60 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:36:23-03:00 - feat-mercenary
- branch: task/siege-and-cockpit
- commit: 8008142 feat(social): implement factions, reputations, and blood debt standing
- changed_files_count: 101
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/espionage/__tests__/EspionageService.spec.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/__tests__/ResearchService.spec.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- ... 61 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:36:07-03:00 - feat-social
- branch: task/siege-and-cockpit
- commit: f3f3073 feat(quests): implement quest and rumor schemas with Result pattern
- changed_files_count: 102
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/espionage/__tests__/EspionageService.spec.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/__tests__/ResearchService.spec.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- ... 62 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:50-03:00 - feat-quests
- branch: task/siege-and-cockpit
- commit: a309852 feat(world-tile): implement axial world tiles, encounters, and travel roles
- changed_files_count: 103
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/espionage/__tests__/EspionageService.spec.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/__tests__/ResearchService.spec.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- ... 63 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:34-03:00 - feat-world-tile
- branch: task/siege-and-cockpit
- commit: 1179f0d feat(equipment): implement equipment catalog and crafting decorators
- changed_files_count: 109
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/espionage/__tests__/EspionageService.spec.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/__tests__/ResearchService.spec.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- ... 69 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:19-03:00 - feat-equipment
- branch: task/siege-and-cockpit
- commit: 2cb6755 feat(dialogue): implement dialogue state schemas and branch evaluation service
- changed_files_count: 122
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- src/entities/equipment/__tests__/DrizzleCraftingRepository.spec.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- src/entities/equipment/__tests__/InMemoryCraftingRepository.ts
- src/entities/equipment/__tests__/InventoryService.spec.ts
- src/entities/equipment/__tests__/RepairService.spec.ts
- src/entities/equipment/domain/CraftingRepository.ts
- src/entities/equipment/domain/CraftingService.ts
- src/entities/equipment/domain/RepairService.ts
- ... 82 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:35:03-03:00 - feat-dialogue
- branch: task/siege-and-cockpit
- commit: 37a5704 feat(companions): implement companion and familiar summoning with sensory share
- changed_files_count: 128
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/dialogue/domain/DialogueService.ts
- src/entities/dialogue/infrastructure/DrizzleDialogueRepository.ts
- src/entities/dialogue/infrastructure/InMemoryDialogueRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/dialogue/model/dialogueSchema.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- src/entities/equipment/__tests__/DrizzleCraftingRepository.spec.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- ... 88 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:34:47-03:00 - feat-companions
- branch: task/siege-and-cockpit
- commit: fcf04d2 feat(character): implement and test derived stats, dying state, and exhaustion modifiers
- changed_files_count: 130
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/dialogue/domain/DialogueService.ts
- src/entities/dialogue/infrastructure/DrizzleDialogueRepository.ts
- src/entities/dialogue/infrastructure/InMemoryDialogueRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/dialogue/model/dialogueSchema.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- ... 90 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:34:30-03:00 - feat-character
- branch: task/siege-and-cockpit
- commit: cb5eda6 db(schema): consolidate database schemas and migrations 0020 to 0025
- changed_files_count: 135
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/ClassTalentService.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/ExhaustionIntegration.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/ClassTalentService.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/LimitBreakService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/LimitBreakService.spec.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/dialogue/domain/DialogueService.ts
- src/entities/dialogue/infrastructure/DrizzleDialogueRepository.ts
- src/entities/dialogue/infrastructure/InMemoryDialogueRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- ... 95 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-04T11:34:12-03:00 - db-schema
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 154
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/0020_abnormal_the_spike.sql
- drizzle/0021_status_effects_duration.sql
- drizzle/0022_status_effects_missing_columns.sql
- drizzle/0023_add_crafted_item_durability_state.sql
- drizzle/0024_add_dialogue_state_social_combat_fields.sql
- drizzle/0025_add_character_tension_meter.sql
- drizzle/meta/0020_snapshot.json
- drizzle/meta/0021_snapshot.json
- drizzle/meta/0022_snapshot.json
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- ... 114 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-03T12:47:24-03:00 - fix-App-svelte-tabs
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 144
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/dialogue/domain/DialogueService.ts
- src/entities/dialogue/infrastructure/DrizzleDialogueRepository.ts
- src/entities/dialogue/infrastructure/InMemoryDialogueRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/dialogue/model/dialogueSchema.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- ... 104 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-03T12:07:15-03:00 - finalizacao-fase-70
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 144
#### Changed Files
- CONTEXT.md
- biome.json
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.spec.ts
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterDerivedStatsService.spec.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/RetrainService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/domain/__tests__/RetrainService.spec.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/CharacterBuilder.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/__tests__/CompanionService.spec.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/__tests__/DialogueService.spec.ts
- src/entities/dialogue/domain/DialogueService.ts
- src/entities/dialogue/infrastructure/DrizzleDialogueRepository.ts
- src/entities/dialogue/infrastructure/InMemoryDialogueRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/dialogue/model/dialogueSchema.ts
- src/entities/domain-regional/__tests__/RegionalDomainService.spec.ts
- src/entities/domain-regional/domain/RegionalDomainService.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- ... 104 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-03T00:05:12-03:00 - manual
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 110
#### Changed Files
- CONTEXT.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/DrizzleDialogueRepository.ts
- src/entities/dialogue/infrastructure/InMemoryDialogueRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/dialogue/model/dialogueSchema.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/DrizzleCraftingRepository.spec.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- src/entities/equipment/__tests__/InMemoryCraftingRepository.ts
- src/entities/equipment/domain/CraftingRepository.ts
- src/entities/equipment/infrastructure/DrizzleCraftingRepository.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/equipment/model/craftingSchema.ts
- src/entities/equipment/model/equipmentCatalog.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- ... 70 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T22:36:08-03:00 - Phase_67_Fix
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 92
#### Changed Files
- CONTEXT.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/equipment/model/equipmentCatalog.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/entities/world-tile/domain/EncounterService.ts
- src/entities/world-tile/index.ts
- ... 52 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T22:21:26-03:00 - manual
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 90
#### Changed Files
- CONTEXT.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/combatEncounterSession.ts
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/__tests__/EquipmentCatalogService.spec.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/equipment/model/equipmentCatalog.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/entities/world-tile/domain/EncounterService.ts
- src/entities/world-tile/index.ts
- ... 50 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T18:06:24-03:00 - Fase 64 completa
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 75
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/spell/__tests__/SpellCatalogService.spec.ts
- src/entities/spell/model/spellCatalog.ts
- src/entities/spell/model/spellSchema.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- ... 35 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T15:06:26-03:00 - manual
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 62
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterRules.ts
- src/entities/character/model/characterSchema.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/chat/ui/RollModifiersDrawer.svelte
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- src/features/hexcrawl-map/domain/HexcrawlMovementService.ts
- src/features/hexcrawl-map/model/hexcrawlMovementSchemas.ts
- src/features/hexcrawl-map/model/hexcrawlMovementTypes.ts
- ... 22 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-06-02T12:36:41-03:00 - complete
- branch: task/siege-and-cockpit
- commit: 9f80e17 feat(saves): implement multi-save slots in OPFS and drag-and-drop JSON backup
- changed_files_count: 48
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/styles.css
- src/entities/bastion/infrastructure/WorkerBastionRepository.ts
- src/entities/camp/infrastructure/WorkerCampRepository.ts
- src/entities/clocks/infrastructure/WorkerClockRepository.ts
- src/entities/companions/infrastructure/WorkerCompanionRepository.ts
- src/entities/dialogue/infrastructure/WorkerDialogueRepository.ts
- src/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository.ts
- src/entities/equipment/infrastructure/WorkerCraftingRepository.ts
- src/entities/espionage/infrastructure/WorkerEspionageRepository.ts
- src/entities/investigation/infrastructure/WorkerInvestigationRepository.ts
- src/entities/mercenary/infrastructure/WorkerMercenaryRepository.ts
- src/entities/quest/infrastructure/WorkerQuestRepository.ts
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/entities/synergy/infrastructure/WorkerSynergyRepository.ts
- src/entities/traps/infrastructure/WorkerTrapRepository.ts
- src/features/chat/model/chatState.svelte.ts
- src/features/chat/ui/ChatLog.svelte
- src/features/combat-encounter/__tests__/TacticalAiService.spec.ts
- src/features/combat-encounter/domain/TacticalAiService.ts
- src/features/combat-encounter/model-api.ts
- src/features/combat-encounter/model/monsterCatalog.ts
- src/features/hexcrawl-map/__tests__/HexcrawlMovementService.spec.ts
- src/features/hexcrawl-map/domain/HexcrawlMovementService.ts
- src/features/hexcrawl-map/model/hexcrawlMovementSchemas.ts
- src/features/hexcrawl-map/model/hexcrawlMovementTypes.ts
- src/features/saves/infrastructure/WorkerSaveRepository.ts
- src/features/traps/ui/TrapDeploymentPanel.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/index.ts
- src/shared/rpc/model/rpcSchemas.ts
- src/shared/rpc/model/rpcTypes.ts
- vite.config.mjs
- vitest.config.mjs
- ... 8 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-31T09:26:21-03:00 - doc-update-complete
- branch: task/tension-limit-break
- commit: c219ce9 feat(combat-social-rules): implementacao e consolidacao das fases 39 a 45
- changed_files_count: 62
#### Changed Files
- CONTEXT.md
- RELATORIO_PROJETO_PANDORHA_2026-05-01.md
- docs/architecture/sdd.md
- docs/architecture/worker_rpc_spec.md
- docs/changelog.md
- docs/conventions/core-conventions.md
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- docs/system/rpg-rules-manifest.json
- drizzle.config.mjs
- drizzle/meta/_journal.json
- factions_companions_progress.md
- llms-full.txt
- llms.txt
- package.json
- planejamento_bastiao.md
- planejamento_campanha_sobrevivencia.md
- planejamento_etapas.md
- planejamento_loop_gameplay.md
- planejamento_offline_persistencia.md
- src/app/App.svelte
- src/app/model/navigation.ts
- src/app/styles.css
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/model/characterSchema.ts
- src/entities/investigation/__tests__/DrizzleInvestigationRepository.spec.ts
- src/entities/investigation/domain/InvestigationService.ts
- src/entities/investigation/infrastructure/DrizzleInvestigationRepository.ts
- src/entities/investigation/model/investigationSchema.ts
- src/entities/world-tile/__tests__/EncounterService.spec.ts
- src/features/bastion/ui/BastionStructureCard.svelte
- src/features/combat-encounter/__tests__/CombatTurnService.spec.ts
- src/features/combat-encounter/domain/CombatTurnService.ts
- src/features/combat-encounter/model/combatTurnSchemas.ts
- src/features/combat-encounter/model/combatTurnTypes.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/espionage/ui/EspionageManagementPanel.svelte
- src/features/inventory-readonly/ui/InventoryReadOnlyPanel.svelte
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- ... 22 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-29T12:12:01-03:00 - planeje-proximas-fases
- branch: task/tension-limit-break
- commit: 456e064 feat(armor-pwa): reactive armor modifiers and pwa offline support for phases 36 to 38
- changed_files_count: 14
#### Changed Files
- docs/process/task-ledger.md
- src/app/App.svelte
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/index.ts
- src/entities/character/model/characterSchema.ts
- src/features/character-list/model/characterListView.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatTrainingAttackProfile.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/crafting/ui/IllnessWorkshopPanel.svelte
- src/features/dialogue/ui/DialoguePanel.svelte
- src/features/social/ui/SocialDemo.svelte
- src/entities/character/domain/UltimateStatsDecorators.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-29T09:37:06-03:00 - complete traps feature
- branch: task/gameplay-loop-integration
- commit: d32f8ba feat(db-auditor): detecta dinamicamente as tabelas characters/actors e mapeia colunas em ingles do Drizzle
- changed_files_count: 90
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- pandorha-sistema-28-04-backup/App.svelte
- src/app/App.svelte
- src/app/model/navigation.ts
- src/app/styles.css
- src/entities/bastion/__tests__/BastionService.spec.ts
- src/entities/bastion/domain/BastionService.ts
- src/entities/character/__tests__/CharacterService.spec.ts
- src/entities/character/__tests__/IllnessIntegration.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/CharacterService.ts
- src/entities/character/domain/IllnessService.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/model/characterTypes.ts
- src/entities/social/domain/FactionRepository.ts
- src/entities/social/infrastructure/DrizzleFactionRepository.ts
- src/entities/social/infrastructure/InMemoryFactionRepository.ts
- src/entities/social/model/socialSchema.ts
- src/entities/traps/__tests__/TrapService.spec.ts
- src/entities/traps/domain/TrapDecorators.ts
- src/entities/traps/domain/TrapService.ts
- src/features/bastion/ui/BastionPanel.svelte
- src/features/bastion/ui/BastionStructureCard.svelte
- src/features/bastion/ui/DowntimeProjectList.svelte
- src/features/camp/domain/CampService.ts
- src/features/camp/domain/__tests__/CampService.spec.ts
- src/features/camp/ui/CampPanel.svelte
- src/features/character-list/model/characterListView.ts
- src/features/combat-encounter/__tests__/CombatTurnService.spec.ts
- src/features/combat-encounter/domain/CombatTurnService.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatTurnSchemas.ts
- src/features/combat-encounter/model/combatTurnTypes.ts
- src/features/crafting/ui/IllnessWorkshopPanel.svelte
- src/features/dialogue/ui/DialoguePanel.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- ... 50 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-23T08:45:09-03:00 - manual
- branch: master
- commit: 97b167b chore(maintenance): ajuste do script de automacao e consolidacao da etapa 2 [2026-05-22 18:15]
- changed_files_count: 27
#### Changed Files
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/_journal.json
- src/app/App.svelte
- src/app/model/navigation.ts
- src/entities/clocks/model-api.ts
- src/entities/clocks/model/clockSchema.ts
- src/entities/social/index.ts
- src/features/clocks/domain/ClockService.ts
- src/features/clocks/ui/ClockDemo.svelte
- src/features/social/ui/FactionPanel.svelte
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/model/sqliteMigrations.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/model/rpcSchemas.ts
- drizzle/0007_material_silver_surfer.sql
- drizzle/0008_clear_magma.sql
- drizzle/meta/0007_snapshot.json
- drizzle/meta/0008_snapshot.json
- pandorha-sistema-28-04-backup/
- planejamento_bastiao.md
- src/entities/bastion/
- src/entities/clocks/infrastructure/
- src/entities/social/infrastructure/WorkerSocialRepository.ts
- src/features/bastion/
- src/features/saves/
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-18T22:50:24-03:00 - manual
- branch: task/crafting-workshop
- commit: 020bd2e cleanup(crafting): remover pasta de backups temporarios pos-homologacao (2026-05-17 13:58)
- changed_files_count: 66
#### Changed Files
- docs/process/task-ledger.md
- drizzle/meta/_journal.json
- pandorha-sistema-backup/App.svelte.bak
- pandorha-sistema-backup/navigation.ts.bak
- src/app/App.svelte
- src/entities/character/__tests__/CharacterService.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/model/characterTypes.ts
- src/entities/equipment/__tests__/CraftingService.spec.ts
- src/entities/equipment/__tests__/DrizzleCraftingRepository.spec.ts
- src/entities/equipment/__tests__/InMemoryCraftingRepository.ts
- src/entities/equipment/domain/CraftingQualityDecorators.ts
- src/entities/equipment/domain/CraftingRepository.ts
- src/entities/equipment/domain/CraftingService.ts
- src/entities/equipment/infrastructure/DrizzleCraftingRepository.ts
- src/entities/equipment/model/craftingSchema.ts
- src/entities/equipment/model/craftingTypes.ts
- src/features/camp/domain/__tests__/CampService.spec.ts
- src/features/camp/ui/CampPanel.svelte
- src/features/character-create/model/characterCreateView.ts
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/features/combat-encounter/__tests__/combatAttackerStatsView.spec.ts
- src/features/combat-encounter/model/combatAttackerStatsView.ts
- src/features/combat-encounter/model/combatTrainingAttackProfile.ts
- src/features/combat-encounter/ui/CombatEncounterPanel.svelte
- src/features/crafting/index.ts
- src/features/crafting/ui/CraftingWorkshopPanel.svelte
- src/features/hexcrawl-map/ui/HexcrawlMapPanel.svelte
- src/features/inventory-readonly/ui/InventoryReadOnlyPanel.svelte
- src/features/social/ui/SocialDemo.svelte
- src/shared/inventory/__tests__/CraftingInventoryCapacity.spec.ts
- src/shared/persistence/__tests__/SqliteOpfsBootstrapService.spec.ts
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- ... 26 more
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-17T12:14:51-03:00 - manual
- branch: task/status-effects-decorations
- commit: 644a2af feat(vertical-slice): conclui e homologa Fases T34 a T39 com 100% de cobertura
- changed_files_count: 29
#### Changed Files
- docs/process/task-ledger.md
- drizzle/meta/_journal.json
- "pandorha obsidian antigravity/.obsidian/app.json"
- "pandorha obsidian antigravity/.obsidian/appearance.json"
- "pandorha obsidian antigravity/.obsidian/core-plugins.json"
- "pandorha obsidian antigravity/.obsidian/graph.json"
- "pandorha obsidian antigravity/.obsidian/workspace.json"
- src/app/App.svelte
- src/entities/character/__tests__/CharacterMigration.spec.ts
- src/entities/character/__tests__/DrizzleCharacterRepository.spec.ts
- src/entities/character/__tests__/SessionCharacterRepository.spec.ts
- src/entities/character/domain/CharacterRepository.ts
- src/entities/character/infrastructure/DrizzleCharacterRepository.ts
- src/entities/character/infrastructure/SessionCharacterRepository.ts
- src/entities/character/model/characterSchema.ts
- src/entities/character/testing/InMemoryCharacterRepository.ts
- src/features/camp/ui/CampPanel.svelte
- src/features/character-list/__tests__/characterListView.spec.ts
- src/features/character-list/model/characterListView.ts
- src/features/character-list/ui/CharacterList.svelte
- src/shared/persistence/domain/SqliteOpfsBootstrapService.ts
- src/shared/persistence/worker/databaseWorkerHandler.ts
- src/shared/rpc/model/rpcSchemas.ts
- src/shared/rpc/model/rpcTypes.ts
- drizzle/0003_tricky_lila_cheney.sql
- drizzle/meta/0003_snapshot.json
- pandorha-backup/
- src/entities/character/__tests__/StatusEffectDecorator.spec.ts
- src/entities/character/domain/StatusEffectDecorator.ts
#### Checkpoint
- Done: captured git state
- Next: review whether changes need task records or documentation promotion
- Risks: snapshot is structural only and does not validate business intent
- Improvements: add explicit task ids with `start` and `checkpoint` commands for complex work
### 2026-05-16T18:31:42-03:00 - Conclusao da integracao de UI de acampamento e standing social na Fase T37
- branch: task/sqlite-opfs-bootstrap
- commit: f904516 feat(rpc): adiciona contrato de save load
- changed_files_count: 80
#### Changed Files
- .agents/skills/ai-docs-formatter/assets/response-schema.json
- .agents/skills/build-test-verify/scripts/check-query-budget.ts
- .agents/skills/build-test-verify/scripts/verify-coverage.ts
- .agents/skills/character-builder/references/rules_manifest.json
- .agents/skills/dialogue-architect/scripts/validate_tree.ts
- .agents/skills/monster-factory/references/master_table.json
- .agents/skills/monster-factory/references/roles.json
- .agents/skills/world-state-manager/assets/expected_correction_payload.json
- .agents/skills/world-state-manager/references/acl_policies.json
- .agents/skills/world-state-manager/references/seed_manifestos/morden_seed.json
- .agents/skills/world-state-manager/scripts/world_state_cli.ts
- docs/process/change-inbox.md
- docs/process/task-ledger.md
- drizzle.config.mjs
- drizzle/meta/0000_snapshot.json
- drizzle/meta/_journal.json
- mcp/pandorha-arch-guard/package.json
- mcp/pandorha-arch-guard/scripts/validate-stdio.js
- mcp/pandorha-arch-guard/src/server.js
- mcp/pandorha-arch-guard/test/arch-guard.test.js
- mcp/pandorha-db-auditor/package.json
- mcp/pandorha-db-auditor/scripts/validate-stdio.js
- mcp/pandorha-db-auditor/src/index.ts
- mcp/pandorha-db-auditor/test/auditor.test.js
- mcp/pandorha-db-auditor/tsconfig.json
- mcp/pandorha-knowledge/package.json
- mcp/pandorha-knowledge/scripts/validate-stdio.js
- mcp/pandorha-knowledge/src/config.js
- mcp/pandorha-knowledge/src/file-system.js
- mcp/pandorha-knowledge/src/markdown-segments.js
- mcp/pandorha-knowledge/src/search-engine.js
- mcp/pandorha-knowledge/src/server.js
- mcp/pandorha-knowledge/test/search-engine.test.js
- mcp/pandorha-memory-bridge/package.json
- mcp/pandorha-memory-bridge/scripts/validate-stdio.js
- mcp/pandorha-memory-bridge/src/server.js
- mcp/pandorha-memory-bridge/test/memory-bridge.test.js
- mcp_config.json
- src/app/App.svelte
- src/app/model/navigation.ts
- ... 40 more
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
