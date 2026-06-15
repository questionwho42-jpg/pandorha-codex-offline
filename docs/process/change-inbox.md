# Change Inbox

This file tracks requests, implementations, features, improvements, and other modifications that were not already planned in the official project documentation.

The automation owns the marked sections below. Manual edits should stay outside markers unless intentionally correcting a record.

## Open
<!-- pandorha-inbox:open -->
<!-- pandorha-inbox:20260615-051214-save-load-v6-inventory-ledger -->
### Save-load v6 inventory ledger
- id: 20260615-051214-save-load-v6-inventory-ledger
- status: open
- created_at: 2026-06-15T05:12:14-03:00
- source: task-ledger
- summary: Persistir inventoryEvents no save v6, RPC, worker e snapshot SQLite com migracao deterministica v5 para v6.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260615-051214-save-load-v6-inventory-ledger -->
<!-- pandorha-inbox:20260606-inventory-ownership-core -->
### Character-owned inventory ledger core
- id: 20260606-inventory-ownership-core
- status: open
- created_at: 2026-06-06T06:53:19-03:00
- source: task-ledger
- summary: Implementar entidade, repository fake, replay e servico de gerenciamento de inventario por personagem sem UI ou save.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260606-inventory-ownership-core -->
<!-- pandorha-inbox:20260606-inventory-ownership-save-v6-gate -->
### Inventory ownership and save v6 gate
- id: 20260606-inventory-ownership-save-v6-gate
- status: open
- created_at: 2026-06-06T06:45:53-03:00
- source: task-ledger
- summary: Aprovar contrato event-sourced de inventario pertencente ao personagem e limitar save v6 a inventoryEvents antes de qualquer implementacao.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260606-inventory-ownership-save-v6-gate -->
<!-- pandorha-inbox:20260606-future-pwa-update-install-ui -->
### Future PWA update and install UI
- id: 20260606-future-pwa-update-install-ui
- status: open
- created_at: 2026-06-06T02:29:38-03:00
- source: task-ledger
- summary: Planejar manifest com ícones instaláveis e tela segura de atualização de cache após estabilizar o comportamento offline e a automação de rede.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260606-future-pwa-update-install-ui -->
<!-- pandorha-inbox:20260606-future-social-higher-tiers -->
### Future social higher tiers
- id: 20260606-future-social-higher-tiers
- status: open
- created_at: 2026-06-06T02:29:23-03:00
- source: task-ledger
- summary: Planejar favores e quitação de dívida acima de Tier 1 somente após revisão das regras soberanas de fama, influência e facções.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260606-future-social-higher-tiers -->
<!-- pandorha-inbox:20260606-future-camp-multi-hour -->
### Future camp multi-hour orchestration
- id: 20260606-future-camp-multi-hour
- status: open
- created_at: 2026-06-06T02:29:14-03:00
- source: task-ledger
- summary: Planejar orquestração explícita de nova hora e noite de acampamento após estabilizar o fluxo de uma hora, sem sobrecarregar a sessão resolvida atual.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260606-future-camp-multi-hour -->
<!-- pandorha-inbox:20260606-022029-ui-reachability-regressions-and-audit -->
### UI reachability regressions and audit
- id: 20260606-022029-ui-reachability-regressions-and-audit
- status: open
- created_at: 2026-06-06T02:20:29-03:00
- source: task-ledger
- summary: Corrigir regressões confirmadas de acessibilidade da UI, criar gate contratual qa:ui-reachability, validar pelo Browser do Codex e documentar futuras implementações após nova auditoria.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260606-022029-ui-reachability-regressions-and-audit -->
<!-- pandorha-inbox:20260605-201308-t104-combat-real-damage-preview-ui -->
### T104 combat real damage preview UI
- id: 20260605-201308-t104-combat-real-damage-preview-ui
- status: open
- created_at: 2026-06-05T20:13:08-03:00
- source: task-ledger
- summary: Exibir previa local de HP real na aba Combate usando ponte evento+replay e Browser do Codex como gate, sem save, banco ou estados oficiais.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-201308-t104-combat-real-damage-preview-ui -->
<!-- pandorha-inbox:20260605-200939-t103-combat-real-damage-preview-view -->
### T103 combat real damage preview view
- id: 20260605-200939-t103-combat-real-damage-preview-view
- status: open
- created_at: 2026-06-05T20:09:39-03:00
- source: task-ledger
- summary: Criar view model pt-BR para previa local de HP real antes da UI, sem save, banco ou estados oficiais.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-200939-t103-combat-real-damage-preview-view -->
<!-- pandorha-inbox:20260605-200435-t102-combat-real-damage-ledger-update -->
### T102 combat real damage ledger update
- id: 20260605-200435-t102-combat-real-damage-ledger-update
- status: open
- created_at: 2026-06-05T20:04:35-03:00
- source: task-ledger
- summary: Compor append de evento realDamageReceived com replay puro de HP real sem UI, save, Worker ou estados oficiais.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-200435-t102-combat-real-damage-ledger-update -->
<!-- pandorha-inbox:20260605-195904-t101-combat-real-hp-replay -->
### T101 combat real HP replay
- id: 20260605-195904-t101-combat-real-hp-replay
- status: open
- created_at: 2026-06-05T19:59:04-03:00
- source: task-ledger
- summary: Criar replay puro de HP real a partir de eventos realDamageReceived sem UI, save, banco ou estados oficiais.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-195904-t101-combat-real-hp-replay -->
<!-- pandorha-inbox:20260605-183829-t99-combat-real-damage-event-contract -->
### T99 combat real damage event contract
- id: 20260605-183829-t99-combat-real-damage-event-contract
- status: open
- created_at: 2026-06-05T18:38:29-03:00
- source: task-ledger
- summary: Criar contrato puro de evento de dano recebido real sem UI, save v6, banco, HP real persistido ou estados oficiais.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-183829-t99-combat-real-damage-event-contract -->
<!-- pandorha-inbox:20260605-173410-t98-official-incoming-damage-gate -->
### T98 official incoming damage gate
- id: 20260605-173410-t98-official-incoming-damage-gate
- status: open
- created_at: 2026-06-05T17:34:10-03:00
- source: task-ledger
- summary: Criar gate documental A/B/C para decidir dano recebido real, HP real e save v6 antes de qualquer implementacao mecanica.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-173410-t98-official-incoming-damage-gate -->
<!-- pandorha-inbox:20260605-131506-offline-dependency-security-gate -->
### Offline dependency security gate
- id: 20260605-131506-offline-dependency-security-gate
- status: open
- created_at: 2026-06-05T13:15:06-03:00
- source: task-ledger
- summary: Replace npm audit in quality gate with deterministic offline dependency security automation and explicit advisory refresh.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-131506-offline-dependency-security-gate -->
<!-- pandorha-inbox:20260605-122617-t97-training-defender-hp-terminal -->
### T97 training defender HP terminal
- id: 20260605-122617-t97-training-defender-hp-terminal
- status: open
- created_at: 2026-06-05T12:26:17-03:00
- source: task-ledger
- summary: Implementar estado terminal local para HP de treino do defensor, bloqueando novo dano recebido de treino quando chegar a 0 sem HP real, save, Moribundo, Inconsciente, durabilidade ou monstros oficiais.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260605-122617-t97-training-defender-hp-terminal -->
<!-- pandorha-inbox:20260604-211412-t94-t96-training-incoming-damage-core -->
### T94-T96 training incoming damage core
- id: 20260604-211412-t94-t96-training-incoming-damage-core
- status: open
- created_at: 2026-06-04T21:14:12-03:00
- source: task-ledger
- summary: Implementar contrato de dano recebido de treino, HP local nao persistido e suporte documental/automacao sem save, monstros oficiais, durabilidade ou docs/system promotion.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260604-211412-t94-t96-training-incoming-damage-core -->
<!-- pandorha-inbox:20260604-202736-t93-documentation-promotion-draft -->
### T93 documentation promotion draft
- id: 20260604-202736-t93-documentation-promotion-draft
- status: open
- created_at: 2026-06-04T20:27:36-03:00
- source: task-ledger
- summary: Atualizar a auditoria documental e criar um rascunho revisavel cobrindo todas as 82 promocoes abertas sem mover change-inbox para Promoted fora de main.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260604-202736-t93-documentation-promotion-draft -->
<!-- pandorha-inbox:20260602-124529-t92-enemy-training-attack-against-session-charac -->
### T92 enemy training attack against session character
- id: 20260602-124529-t92-enemy-training-attack-against-session-charac
- status: open
- created_at: 2026-06-02T12:45:29-03:00
- source: task-ledger
- summary: Implement a minimal training enemy attack against a session character using equipped armor and shield CA only as a defensive target, without save v6, official monsters, AI, grid, persistence, durability, or damage mutation.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260602-124529-t92-enemy-training-attack-against-session-charac -->
<!-- pandorha-inbox:20260602-073042-t91-equipped-defense-profile -->
### T91 equipped defense profile
- id: 20260602-073042-t91-equipped-defense-profile
- status: open
- created_at: 2026-06-02T07:30:42-03:00
- source: task-ledger
- summary: Add minimal equipped armor and shield defense profile from existing equipment catalog, expose activeDefenseProfile on loadout snapshots, and show equipped defense in the combat UI without save v6, migration, enemy attacks, official monsters, or damage changes.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260602-073042-t91-equipped-defense-profile -->
<!-- pandorha-inbox:20260602-072310-d01-2-strict-quality-gate-recovery -->
### D01.2 strict quality gate recovery
- id: 20260602-072310-d01-2-strict-quality-gate-recovery
- status: open
- created_at: 2026-06-02T07:23:10-03:00
- source: task-ledger
- summary: Resolve remaining npm audit blockers for Vitest coverage and Drizzle Kit/esbuild without npm audit fix --force, preserving db:generate and all existing gates before opening T91.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260602-072310-d01-2-strict-quality-gate-recovery -->
<!-- pandorha-inbox:20260601-232034-t90-documentation-audit-automation -->
### T90 documentation audit automation
- id: 20260601-232034-t90-documentation-audit-automation
- status: open
- created_at: 2026-06-01T23:20:34-03:00
- source: task-ledger
- summary: Create a reusable documentation audit automation, generate a reproducible project documentation audit report, and classify pending documentation promotion items without promoting them outside main.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-232034-t90-documentation-audit-automation -->
<!-- pandorha-inbox:20260601-222318-t89-combat-target-defenses -->
### T89 combat target defenses
- id: 20260601-222318-t89-combat-target-defenses
- status: open
- created_at: 2026-06-01T22:23:18-03:00
- source: task-ledger
- summary: Add a minimal combat target defense contract so training targets can feed fixed damage reduction and supported damage affinities into the existing DamagePipelineService, without vulnerability dice, save v6, migration, durability, proficiency, or broad UI expansion.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-222318-t89-combat-target-defenses -->
<!-- pandorha-inbox:20260601-215735-t88-weapon-dice-roll-contract -->
### T88 weapon dice roll contract
- id: 20260601-215735-t88-weapon-dice-roll-contract
- status: open
- created_at: 2026-06-01T21:57:35-03:00
- source: task-ledger
- summary: Replace deterministic weapon baseDiceTotal in combat training with an auditable DiceService weapon die roll for current official weapon expressions 1d4 and 1d8, keeping DamagePipelineService as consumer of the rolled total and avoiding RD, affinity, durability, save v6, migration, or UI expansion.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-215735-t88-weapon-dice-roll-contract -->
<!-- pandorha-inbox:20260601-123434-t87-combat-equipped-weapon-ui -->
### T87 combat equipped weapon UI
- id: 20260601-123434-t87-combat-equipped-weapon-ui
- status: open
- created_at: 2026-06-01T12:34:34-03:00
- source: task-ledger
- summary: Connect EquipmentLoadoutService to the combat tab with a local session weapon selector, defaulting player characters to Espada Longa while keeping Aria on a fixed training profile; update static QA and validate rendered combat flow with Browser Use.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-123434-t87-combat-equipped-weapon-ui -->
<!-- pandorha-inbox:20260601-121945-t86-equipment-loadout-core -->
### T86 equipment loadout core
- id: 20260601-121945-t86-equipment-loadout-core
- status: open
- created_at: 2026-06-01T12:19:45-03:00
- source: task-ledger
- summary: Create pure equipment loadout service for main-hand weapon, off-hand shield, armor, hand occupancy, durability gate, and active weapon profile without UI, save, migration, or inventory mutation.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-121945-t86-equipment-loadout-core -->
<!-- pandorha-inbox:20260601-120947-d01-1-security-audit-gate-recovery -->
### D01.1 security audit gate recovery
- id: 20260601-120947-d01-1-security-audit-gate-recovery
- status: open
- created_at: 2026-06-01T12:09:47-03:00
- source: task-ledger
- summary: Recover the quality gate by addressing npm audit findings without force upgrades, documenting any remaining breaking dependency risk.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-120947-d01-1-security-audit-gate-recovery -->
<!-- pandorha-inbox:20260601-114326-t85-equipment-driven-combat-attack-profile -->
### T85 equipment-driven combat attack profile
- id: 20260601-114326-t85-equipment-driven-combat-attack-profile
- status: open
- created_at: 2026-06-01T11:43:26-03:00
- source: task-ledger
- summary: Start the T85 mechanics vertical with real equipment feeding combat attack profiles before full damage rules.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-114326-t85-equipment-driven-combat-attack-profile -->
<!-- pandorha-inbox:20260601-070954-t84-social-rendered-browser-automation-evaluatio -->
### T84 Social Rendered Browser Automation Evaluation
- id: 20260601-070954-t84-social-rendered-browser-automation-evaluatio
- status: open
- created_at: 2026-06-01T07:09:54-03:00
- source: task-ledger
- summary: Avaliar se vale criar automacao recorrente renderizada para o fluxo social de Relacoes; manter smoke contratual se Playwright/Browser automatizado tiver custo maior que beneficio no estado atual.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-070954-t84-social-rendered-browser-automation-evaluatio -->
<!-- pandorha-inbox:20260601-065448-t83-social-retaliation-clock-advance-gate -->
### T83 Social Retaliation Clock Advance Gate
- id: 20260601-065448-t83-social-retaliation-clock-advance-gate
- status: open
- created_at: 2026-06-01T06:54:48-03:00
- source: task-ledger
- summary: Definir contrato inicial para quando clocks sociais podem avancar: manter gatilho explicito social-pressure como unico modo automatico atual, bloquear descanso/tempo/cena social ate regra oficial existir, sem UI, save v6 ou schema novo.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-065448-t83-social-retaliation-clock-advance-gate -->
<!-- pandorha-inbox:20260601-063146-t82-social-relations-npc-filters -->
### T82 Social Relations Npc Filters
- id: 20260601-063146-t82-social-relations-npc-filters
- status: open
- created_at: 2026-06-01T06:31:46-03:00
- source: task-ledger
- summary: Adicionar filtro e leitura compacta para Relacoes por NPC agrupadas por faccao, mantendo save v5, schema, clocks, WorldState e regras mecanicas inalterados.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260601-063146-t82-social-relations-npc-filters -->
<!-- pandorha-inbox:20260531-204829-t81-post-t80-handoff-baseline -->
### T81 Post T80 Handoff Baseline
- id: 20260531-204829-t81-post-t80-handoff-baseline
- status: open
- created_at: 2026-05-31T20:48:29-03:00
- source: task-ledger
- summary: Fechar handoff local pos-T80, consolidar baseline social T66-T80, registrar promocao candidata sem alterar save v5, regras RPG ou schema.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260531-204829-t81-post-t80-handoff-baseline -->
<!-- pandorha-inbox:20260531-200121-t80-group-npc-relationships-by-faction -->
### T80 Group NPC Relationships By Faction
- id: 20260531-200121-t80-group-npc-relationships-by-faction
- status: open
- created_at: 2026-05-31T20:01:21-03:00
- source: task-ledger
- summary: Agrupar visualmente Relacoes por NPC por faccao na aba Relacoes, mantendo save v5, schema, RPC e regras mecanicas inalterados.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260531-200121-t80-group-npc-relationships-by-faction -->
<!-- pandorha-inbox:20260531-195801-t79-npc-relationship-history-save-v6-gate -->
### T79 NPC Relationship History Save V6 Gate
- id: 20260531-195801-t79-npc-relationship-history-save-v6-gate
- status: open
- created_at: 2026-05-31T19:58:01-03:00
- source: task-ledger
- summary: Produzir gate A/B/C para decidir se historico append-only de relacao por NPC justifica save v6, sem migration, schema, RPC ou implementacao.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260531-195801-t79-npc-relationship-history-save-v6-gate -->
<!-- pandorha-inbox:20260531-194729-t77-handoff-local-pos-t76 -->
### T77 Handoff Local Pos-T76
- id: 20260531-194729-t77-handoff-local-pos-t76
- status: open
- created_at: 2026-05-31T19:47:29-03:00
- source: task-ledger
- summary: Fechar handoff local da T73-T76, preparar resumo de PR sem publicacao automatica e revalidar gates obrigatorios mantendo output fora do Git.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260531-194729-t77-handoff-local-pos-t76 -->
<!-- pandorha-inbox:20260530-002246-t73-t76-npc-relationship-save-ui -->
### T73-T76 NPC Relationship Save UI
- id: 20260530-002246-t73-t76-npc-relationship-save-ui
- status: open
- created_at: 2026-05-30T00:22:46-03:00
- source: task-ledger
- summary: Implementar save v5 minimo para relacao individual por NPC, wiring explicito de Pressionar com relacao NPC e clock social-pressure, UI em Relacoes e QA recorrente sem reaproveitar WorldState.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260530-002246-t73-t76-npc-relationship-save-ui -->
<!-- pandorha-inbox:20260527-125851-t72-npc-relationship-core -->
### T72 NPC Relationship Core
- id: 20260527-125851-t72-npc-relationship-core
- status: open
- created_at: 2026-05-27T12:58:51-03:00
- source: task-ledger
- summary: Criar nucleo modular de relacao individual por NPC com schema validado, repository contract, fake em memoria e service puro sem UI, save v5, migration ou WorldState.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260527-125851-t72-npc-relationship-core -->
<!-- pandorha-inbox:20260526-205714-t71-social-retaliation-clock-advance -->
### T71 Social Retaliation Clock Advance
- id: 20260526-205714-t71-social-retaliation-clock-advance
- status: open
- created_at: 2026-05-26T20:57:14-03:00
- source: task-ledger
- summary: Automatizar smoke social pos-T70 e criar servico puro para avancar clocks de retaliacao por gatilho explicito sem migration, save v5 ou RPC novo.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260526-205714-t71-social-retaliation-clock-advance -->
<!-- pandorha-inbox:20260526-183035-t66-t70-social-roadmap-implementation -->
### T66-T70 Social Roadmap Implementation
- id: 20260526-183035-t66-t70-social-roadmap-implementation
- status: open
- created_at: 2026-05-26T18:30:35-03:00
- source: task-ledger
- summary: Implementar readiness local, requisitos de dialogo por WorldState/Fama, Infamia por pressao e clocks de retaliacao sem migration, RPC novo ou save v5.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260526-183035-t66-t70-social-roadmap-implementation -->
<!-- pandorha-inbox:20260520-182802-t46-social-appeal-resolution -->
### T46 Social Appeal Resolution
- id: 20260520-182802-t46-social-appeal-resolution
- status: open
- created_at: 2026-05-20T18:28:02-03:00
- source: task-ledger
- summary: Criar serviço puro para transformar teste social auditável em SocialAppealOutcome usando ResolutionService.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260520-182802-t46-social-appeal-resolution -->
<!-- pandorha-inbox:20260520-182331-t45-social-qa-refresh -->
### T45 Social QA Refresh
- id: 20260520-182331-t45-social-qa-refresh
- status: open
- created_at: 2026-05-20T18:23:31-03:00
- source: task-ledger
- summary: Atualizar QA vertical e smoke para refletir NPCs, negociação social, HP mental, save/load v4 e cache runtime pós-T44.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260520-182331-t45-social-qa-refresh -->
<!-- pandorha-inbox:20260520-130747-t44-social-encounter-ui -->
### T44 Social Encounter UI
- id: 20260520-130747-t44-social-encounter-ui
- status: open
- created_at: 2026-05-20T13:07:47-03:00
- source: task-ledger
- summary: Expandir a aba Relações com negociação social de treino, apelo determinístico, save/load v4 e guia de usuário.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260520-130747-t44-social-encounter-ui -->
<!-- pandorha-inbox:20260520-125428-t43-save-load-v4-social-encounter -->
### T43 Save Load V4 Social Encounter
- id: 20260520-125428-t43-save-load-v4-social-encounter
- status: open
- created_at: 2026-05-20T12:54:28-03:00
- source: task-ledger
- summary: Persistir o estado de negociação social em snapshot v4 com tabelas dedicadas, migration SQLite e roundtrip no worker.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260520-125428-t43-save-load-v4-social-encounter -->
<!-- pandorha-inbox:20260520-114359-t42-social-encounter-core -->
### T42 Social Encounter Core
- id: 20260520-114359-t42-social-encounter-core
- status: open
- created_at: 2026-05-20T11:43:59-03:00
- source: task-ledger
- summary: Criar service puro de negociação social mínima com NPC catalog, ActionQueue, estado determinístico e cobertura.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260520-114359-t42-social-encounter-core -->
<!-- pandorha-inbox:20260520-091722-t41-npc-schema -->
### T41 NPC Schema
- id: 20260520-091722-t41-npc-schema
- status: open
- created_at: 2026-05-20T09:17:22-03:00
- source: task-ledger
- summary: Criar entidade catalogo read-only de NPCs de treino com schemas Drizzle-Zod, fake repository, service e cobertura.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260520-091722-t41-npc-schema -->
<!-- pandorha-inbox:20260515-195054-t33c-1-worker-save-load-commands -->
### T33C.1 - Worker Save Load Commands
- id: 20260515-195054-t33c-1-worker-save-load-commands
- status: open
- created_at: 2026-05-15T19:50:54-03:00
- source: task-ledger
- summary: Implementar persistencia real de snapshots primarios no Worker com SQLite WASM, preservando FSD por porta injetada.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260515-195054-t33c-1-worker-save-load-commands -->
<!-- pandorha-inbox:20260515-192238-d01-dependency-security-refresh -->
### D01 dependency security refresh
- id: 20260515-192238-d01-dependency-security-refresh
- status: open
- created_at: 2026-05-15T19:22:38-03:00
- source: task-ledger
- summary: Atualizar patches nao breaking de svelte e devalue para remover o achado high do npm audit
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260515-192238-d01-dependency-security-refresh -->
<!-- pandorha-inbox:20260515-185920-t33c-saveloadservice -->
### T33C - SaveLoadService
- id: 20260515-185920-t33c-saveloadservice
- status: open
- created_at: 2026-05-15T18:59:20-03:00
- source: task-ledger
- summary: Criar service puro para salvar e carregar snapshots versionados de Character + WorldState via WorkerBridge.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260515-185920-t33c-saveloadservice -->
<!-- pandorha-inbox:20260514-112622-t33b-sqlite-wasm-opfs-bootstrap -->
### T33B - SQLite WASM OPFS Bootstrap
- id: 20260514-112622-t33b-sqlite-wasm-opfs-bootstrap
- status: open
- created_at: 2026-05-14T11:26:22-03:00
- source: task-ledger
- summary: Implementar bootstrap Worker/SQLite WASM/OPFS e migration de world_state_entries sem UI.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260514-112622-t33b-sqlite-wasm-opfs-bootstrap -->
<!-- pandorha-inbox:20260514-112014-t33a-worker-rpc-save-contract -->
### T33A - Worker RPC Save Contract
- id: 20260514-112014-t33a-worker-rpc-save-contract
- status: open
- created_at: 2026-05-14T11:20:14-03:00
- source: task-ledger
- summary: Criar contratos RPC serializaveis e FakeWorkerBridge para save/load sem SQLite real.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260514-112014-t33a-worker-rpc-save-contract -->
<!-- pandorha-inbox:20260514-065055-t32-worldstate-key-value -->
### T32 - WorldState Key-Value
- id: 20260514-065055-t32-worldstate-key-value
- status: open
- created_at: 2026-05-14T06:50:55-03:00
- source: task-ledger
- summary: Criar schema, service e fake repository de WorldState sem UI, Worker ou migration.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260514-065055-t32-worldstate-key-value -->
<!-- pandorha-inbox:20260513-234107-t28-ui-de-conjuracao-minima -->
### T28 UI De Conjuracao Minima
- id: 20260513-234107-t28-ui-de-conjuracao-minima
- status: open
- created_at: 2026-05-13T23:41:07-03:00
- source: task-ledger
- summary: Adicionar aba Magia para escolher magia do catalogo, alvo de treino e preparar comando cast-spell sem executar efeito.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-234107-t28-ui-de-conjuracao-minima -->
<!-- pandorha-inbox:20260513-233033-t27-spellcastbuilder-core -->
### T27 SpellCastBuilder Core
- id: 20260513-233033-t27-spellcastbuilder-core
- status: open
- created_at: 2026-05-13T23:30:33-03:00
- source: task-ledger
- summary: Criar service puro para transformar intencao de conjuracao em comando cast-spell sem executar magia.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-233033-t27-spellcastbuilder-core -->
<!-- pandorha-inbox:20260513-220314-t26-spell-schema-minimo -->
### T26 Spell Schema Minimo
- id: 20260513-220314-t26-spell-schema-minimo
- status: open
- created_at: 2026-05-13T22:03:14-03:00
- source: task-ledger
- summary: Criar entidade spell como catalogo read-only validado por Drizzle-Zod/Zod, sem UI, migration, banco real ou conjuracao.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-220314-t26-spell-schema-minimo -->
<!-- pandorha-inbox:20260513-203725-t25-inventory-read-only-ui -->
### T25 Inventory Read Only UI
- id: 20260513-203725-t25-inventory-read-only-ui
- status: open
- created_at: 2026-05-13T20:37:25-03:00
- source: task-ledger
- summary: Criar aba de inventario somente leitura com itens fixos do catalogo T23 e carga calculada pelo InventoryCapacityService.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-203725-t25-inventory-read-only-ui -->
<!-- pandorha-inbox:20260513-202933-t24-inventorycapacityservice -->
### T24 InventoryCapacityService
- id: 20260513-202933-t24-inventorycapacityservice
- status: open
- created_at: 2026-05-13T20:29:33-03:00
- source: task-ledger
- summary: Criar service puro para calcular limite de carga, slots usados e estado de sobrecarga sem persistir valores derivados.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-202933-t24-inventorycapacityservice -->
<!-- pandorha-inbox:20260513-182431-a06-mcp-and-skill-fixture-gates -->
### A06 MCP And Skill Fixture Gates
- id: 20260513-182431-a06-mcp-and-skill-fixture-gates
- status: open
- created_at: 2026-05-13T18:24:31-03:00
- source: task-ledger
- summary: Expandir quality:skills com validadores Node e adicionar fixtures deterministicas para MCPs Pandorha.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-182431-a06-mcp-and-skill-fixture-gates -->
<!-- pandorha-inbox:20260513-125718-a05-skill-validators-windows-first -->
### A05 Skill Validators Windows-First
- id: 20260513-125718-a05-skill-validators-windows-first
- status: open
- created_at: 2026-05-13T12:57:18-03:00
- source: task-ledger
- summary: Substituir validadores Bash frageis das skills por scripts Node portaveis para bloquear padroes proibidos.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-125718-a05-skill-validators-windows-first -->
<!-- pandorha-inbox:20260513-124327-a04-coverage-and-quality-gate-automation -->
### A04 Coverage And Quality Gate Automation
- id: 20260513-124327-a04-coverage-and-quality-gate-automation
- status: open
- created_at: 2026-05-13T12:43:27-03:00
- source: task-ledger
- summary: Adicionar validacao de coverage obrigatorio para services/view models e criar quality:release/quality:automation Windows-first.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-124327-a04-coverage-and-quality-gate-automation -->
<!-- pandorha-inbox:20260513-123938-a03-domain-service-scaffolder -->
### A03 Domain Service Scaffolder
- id: 20260513-123938-a03-domain-service-scaffolder
- status: open
- created_at: 2026-05-13T12:39:38-03:00
- source: task-ledger
- summary: Criar scaffolder Node para services puros em shared, entities ou features com testes, contexto e orientacao de coverage.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-123938-a03-domain-service-scaffolder -->
<!-- pandorha-inbox:20260513-123247-a02-catalog-entity-scaffolder -->
### A02 Catalog Entity Scaffolder
- id: 20260513-123247-a02-catalog-entity-scaffolder
- status: open
- created_at: 2026-05-13T12:32:47-03:00
- source: task-ledger
- summary: Criar scaffolder Node para gerar estrutura padrao de entidades catalogo sem dados oficiais nem regras de RPG.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-123247-a02-catalog-entity-scaffolder -->
<!-- pandorha-inbox:20260513-122332-a01-process-automation-hardening -->
### A01 Process Automation Hardening
- id: 20260513-122332-a01-process-automation-hardening
- status: open
- created_at: 2026-05-13T12:23:32-03:00
- source: task-ledger
- summary: Endurecer automacao de processo com validate/doctor, snapshot skip-clean e instalador Windows-first de hooks.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-122332-a01-process-automation-hardening -->
<!-- pandorha-inbox:20260513-120357-t23-equipment-schema -->
### T23 Equipment Schema
- id: 20260513-120357-t23-equipment-schema
- status: open
- created_at: 2026-05-13T12:03:57-03:00
- source: task-ledger
- summary: Criar entidade Equipment com schemas Drizzle-Zod, catalogo minimo, fake repository e service read-only para equipamentos unicos e consumiveis empilhados.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260513-120357-t23-equipment-schema -->
<!-- pandorha-inbox:20260512-183308-t22k-combat-vertical-slice-review -->
### T22K Combat Vertical Slice Review
- id: 20260512-183308-t22k-combat-vertical-slice-review
- status: open
- created_at: 2026-05-12T18:33:08-03:00
- source: task-ledger
- summary: Revisar coesao final da T22, registrar checklist de funcionamento, limitacoes e validacao antes de avancar para T23.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260512-183308-t22k-combat-vertical-slice-review -->
<!-- pandorha-inbox:20260512-182841-t22j-combat-user-guide -->
### T22J Combat User Guide
- id: 20260512-182841-t22j-combat-user-guide
- status: open
- created_at: 2026-05-12T18:28:41-03:00
- source: task-ledger
- summary: Criar guia em pt-BR para testar a vertical slice de combate de treino no navegador.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260512-182841-t22j-combat-user-guide -->
<!-- pandorha-inbox:20260512-182337-t22i-combat-encounter-outcome -->
### T22I Combat Encounter Outcome
- id: 20260512-182337-t22i-combat-encounter-outcome
- status: open
- created_at: 2026-05-12T18:23:37-03:00
- source: task-ledger
- summary: Mostrar estado final claro quando o alvo chega a 0 HP, bloquear ataque e encerramento de turno, mantendo reiniciar encontro.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260512-182337-t22i-combat-encounter-outcome -->
<!-- pandorha-inbox:20260512-181508-t22h-combat-training-target-turn -->
### T22H Combat Training Target Turn
- id: 20260512-181508-t22h-combat-training-target-turn
- status: open
- created_at: 2026-05-12T18:15:08-03:00
- source: task-ledger
- summary: Registrar no log que o alvo de treino mantem posicao ao encerrar o turno dele, sem IA, ataque ou dano inimigo.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260512-181508-t22h-combat-training-target-turn -->
<!-- pandorha-inbox:20260512-130258-t22g-combat-training-damage-profile -->
### T22G Combat Training Damage Profile
- id: 20260512-130258-t22g-combat-training-damage-profile
- status: open
- created_at: 2026-05-12T13:02:58-03:00
- source: task-ledger
- summary: Fazer o dano de treino usar a Matriz Fisica do personagem selecionado, mantendo dado, bonus, ataque e equipamento deterministicos.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260512-130258-t22g-combat-training-damage-profile -->
<!-- pandorha-inbox:20260512-122140-t22f-combat-attacker-derived-stats -->
### T22F Combat Attacker Derived Stats
- id: 20260512-122140-t22f-combat-attacker-derived-stats
- status: open
- created_at: 2026-05-12T12:21:40-03:00
- source: task-ledger
- summary: Exibir HP maximo, iniciativa e carga derivados do personagem selecionado no painel de combate, sem aplicar esses valores ao ataque ou dano.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260512-122140-t22f-combat-attacker-derived-stats -->
<!-- pandorha-inbox:20260506-233712-t22e-combat-turn-state -->
### T22E Combat Turn State
- id: 20260506-233712-t22e-combat-turn-state
- status: open
- created_at: 2026-05-06T23:37:12-03:00
- source: task-ledger
- summary: Adicionar estado minimo de turno ao combate, com rodada, turno ativo, acoes 3/3, consumo de acao e encerramento de turno no painel.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260506-233712-t22e-combat-turn-state -->
<!-- pandorha-inbox:20260506-181931-t22d-combat-session-attacker -->
### T22D Combat Session Attacker
- id: 20260506-181931-t22d-combat-session-attacker
- status: open
- created_at: 2026-05-06T18:19:31-03:00
- source: task-ledger
- summary: Conectar a aba Combate aos personagens criados na sessao como opcoes de atacante, mantendo Aria como fallback.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260506-181931-t22d-combat-session-attacker -->
<!-- pandorha-inbox:20260506-175209-t22c-combat-training-targets -->
### T22C Combat Training Targets
- id: 20260506-175209-t22c-combat-training-targets
- status: open
- created_at: 2026-05-06T17:52:09-03:00
- source: task-ledger
- summary: Adicionar catalogo visual de alvos de treino na aba Combate, com troca de alvo resetando HP e log.
- expected_promotion: official docs after merge to main
<!-- /pandorha-inbox:20260506-175209-t22c-combat-training-targets -->
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
