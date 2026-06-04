# Rascunho De Promocao Documental T93

Gerado em: 2026-06-04.
Branch de trabalho: `feat/metadata-tags-codex`.
Fonte de triagem: `docs/process/documentation-audit.md`, `docs/process/change-inbox.md` e `docs/process/task-ledger.md`.

Este arquivo consolida a fila aberta de promocao documental sem mover entradas para `Promoted`. Ele e um rascunho revisavel para a branch atual; a promocao oficial continua bloqueada ate merge/default branch ou aprovacao explicita.

## Resumo

- Escopo aprovado: 82 entradas herdadas do inbox antes da T93.
- Estado atual da auditoria: 83 entradas abertas, porque a propria T93 foi registrada como controle de manutencao.
- Distribuicao atual: 32 processo, 16 arquitetura, 17 usuario, 13 sistema, 1 convencoes e 4 nao promover ainda.
- Regra critica: itens de `sistema` nao devem alterar `docs/system/` por inferencia do codigo. Eles precisam de revisao contra as fontes soberanas em `docs/system/`.

## Pacotes De Promocao

| Pacote | Destino | Acao |
| :--- | :--- | :--- |
| Processo e automacao | `docs/process/*` | Consolidar gates, auditorias, handoffs, quality gate, smokes e registros de entrega. |
| Arquitetura tecnica | `docs/architecture/*` e ADRs | Documentar contratos duradouros de catalogos, services puros, Worker/RPC, save/load, social relationships, equipment e combate de treino. |
| Guias de usuario | `docs/user/*` | Atualizar rotas de teste em pt-BR sem prometer persistencia, IA, monstros oficiais ou regras ainda ausentes. |
| Regras RPG | `docs/system/*` | Promover apenas depois de cruzar cada item com a fonte soberana correspondente. |
| Convencoes de agente | `docs/conventions/*` e `.agents/skills/*` | Registrar comportamento operacional Windows-first e validadores locais. |
| Bloqueados | Este rascunho | Manter no inbox ate existir evidencia humana suficiente. |

## Controle De Entradas

| ID | Titulo | Destino | Evidencia | Alvo documental | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 20260604-202736-t93-documentation-promotion-draft | T93 documentation promotion draft | processo | task-ledger + change-inbox | `docs/process/documentation-promotion-draft.md` | Registro de controle da rodada; promover depois de merge. |
| 20260602-124529-t92-enemy-training-attack-against-session-charac | T92 enemy training attack against session character | arquitetura | task-ledger + change-inbox | `docs/architecture/feature_state_machines.md`; `docs/user/combat-training.md` | Rascunho permitido; ja documentado como ataque de treino sem dano persistente. |
| 20260602-073042-t91-equipped-defense-profile | T91 equipped defense profile | processo | task-ledger + change-inbox | `docs/user/combat-training.md`; `docs/process/vertical-slice-qa.md` | Rascunho permitido; manter como defesa local de treino. |
| 20260602-072310-d01-2-strict-quality-gate-recovery | D01.2 strict quality gate recovery | processo | task-ledger + change-inbox | `docs/process/d01-1-security-audit-gate-recovery.md`; `docs/process/automation-spec.md` | Rascunho permitido; registrar recuperacao sem `audit fix --force`. |
| 20260601-232034-t90-documentation-audit-automation | T90 documentation audit automation | processo | task-ledger + change-inbox | `docs/process/automation-spec.md`; `llms.txt` | Rascunho permitido; auditoria ja e comando oficial. |
| 20260601-222318-t89-combat-target-defenses | T89 combat target defenses | usuario | task-ledger + change-inbox | `docs/user/combat-training.md` | Rascunho permitido; RD e afinidades fixas de alvo de treino. |
| 20260601-215735-t88-weapon-dice-roll-contract | T88 weapon dice roll contract | processo | task-ledger + change-inbox | `docs/process/vertical-slice-qa.md`; `docs/user/combat-training.md` | Rascunho permitido; rolagem auditavel limitada a dados suportados. |
| 20260601-123434-t87-combat-equipped-weapon-ui | T87 combat equipped weapon UI | processo | task-ledger + change-inbox | `docs/user/combat-training.md`; `docs/process/vertical-slice-qa.md` | Rascunho permitido; loadout local sem save. |
| 20260601-121945-t86-equipment-loadout-core | T86 equipment loadout core | processo | task-ledger + change-inbox | `docs/architecture/blueprint.md`; ADR futuro se virar contrato amplo | Rascunho permitido; service puro e sem mutacao de inventario. |
| 20260601-120947-d01-1-security-audit-gate-recovery | D01.1 security audit gate recovery | processo | task-ledger + change-inbox | `docs/process/d01-1-security-audit-gate-recovery.md` | Rascunho permitido; manter historico de risco de dependencias. |
| 20260601-114326-t85-equipment-driven-combat-attack-profile | T85 equipment-driven combat attack profile | sistema | task-ledger + change-inbox | `docs/system/combat/*` somente apos revisao | Bloqueado para regra; nao inferir mecanica oficial do codigo. |
| 20260601-070954-t84-social-rendered-browser-automation-evaluatio | T84 Social Rendered Browser Automation Evaluation | processo | task-ledger + change-inbox | `docs/process/t84-social-rendered-browser-automation-evaluation.md` | Rascunho permitido; manter Browser manual para UI social. |
| 20260601-065448-t83-social-retaliation-clock-advance-gate | T83 Social Retaliation Clock Advance Gate | processo | task-ledger + change-inbox | `docs/process/t83-social-retaliation-clock-advance-gate.md` | Rascunho permitido; gate de avancar clock por gatilho explicito. |
| 20260601-063146-t82-social-relations-npc-filters | T82 Social Relations Npc Filters | arquitetura | task-ledger + change-inbox | `docs/architecture/feature_state_machines.md`; `docs/user/social-relations.md` | Rascunho permitido; leitura agrupada sem schema novo. |
| 20260531-204829-t81-post-t80-handoff-baseline | T81 Post T80 Handoff Baseline | processo | task-ledger + change-inbox | `docs/process/t81-post-t80-handoff-baseline.md`; `docs/process/vertical-slice-qa.md` | Rascunho permitido; baseline social pos-T80. |
| 20260531-200121-t80-group-npc-relationships-by-faction | T80 Group NPC Relationships By Faction | arquitetura | task-ledger + change-inbox | `docs/user/social-relations.md`; `docs/architecture/feature_state_machines.md` | Rascunho permitido; agrupamento visual sem regra nova. |
| 20260531-195801-t79-npc-relationship-history-save-v6-gate | T79 NPC Relationship History Save V6 Gate | processo | task-ledger + change-inbox | `docs/process/t79-npc-relationship-history-save-v6-gate.md` | Rascunho permitido; manter gate sem implementar save v6. |
| 20260531-194729-t77-handoff-local-pos-t76 | T77 Handoff Local Pos-T76 | processo | task-ledger + change-inbox | `docs/process/t81-post-t80-handoff-baseline.md` | Rascunho permitido; consolidar handoff. |
| 20260530-002246-t73-t76-npc-relationship-save-ui | T73-T76 NPC Relationship Save UI | processo | task-ledger + change-inbox | `docs/process/t73-npc-relationship-save-v5-gate.md`; `docs/user/social-relations.md` | Rascunho permitido; save v5 social. |
| 20260527-125851-t72-npc-relationship-core | T72 NPC Relationship Core | usuario | task-ledger + change-inbox | `docs/process/t72-npc-relationship-contract.md`; `docs/user/social-relations.md` | Rascunho permitido; relacao individual por NPC. |
| 20260526-205714-t71-social-retaliation-clock-advance | T71 Social Retaliation Clock Advance | arquitetura | task-ledger + change-inbox | `docs/architecture/feature_state_machines.md`; `docs/user/social-relations.md` | Rascunho permitido; clock social por gatilho explicito. |
| 20260526-183035-t66-t70-social-roadmap-implementation | T66-T70 Social Roadmap Implementation | processo | task-ledger + change-inbox | `docs/process/vertical-slice-qa.md`; `docs/user/social-encounter.md` | Rascunho permitido; baseline social e smokes. |
| 20260520-182802-t46-social-appeal-resolution | T46 Social Appeal Resolution | processo | task-ledger + change-inbox | `docs/process/vertical-slice-qa.md`; `docs/user/social-encounter.md` | Rascunho permitido; apelo social auditavel. |
| 20260520-182331-t45-social-qa-refresh | T45 Social QA Refresh | processo | task-ledger + change-inbox | `docs/process/vertical-slice-qa.md` | Rascunho permitido; atualizar QA social. |
| 20260520-130747-t44-social-encounter-ui | T44 Social Encounter UI | usuario | task-ledger + change-inbox | `docs/user/social-encounter.md` | Rascunho permitido; fluxo visivel de negociacao social. |
| 20260520-125428-t43-save-load-v4-social-encounter | T43 Save Load V4 Social Encounter | processo | task-ledger + change-inbox | `docs/architecture/worker_rpc_spec.md`; `docs/process/vertical-slice-qa.md` | Rascunho permitido; historico de save social v4. |
| 20260520-114359-t42-social-encounter-core | T42 Social Encounter Core | sistema | task-ledger + change-inbox | `docs/system/survival/regras-completas-interacoes-sociais.md` somente apos revisao | Bloqueado para regra; validar HP mental, paciencia e persuasao. |
| 20260520-091722-t41-npc-schema | T41 NPC Schema | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; ADR futuro | Rascunho permitido; catalogo read-only de NPC. |
| 20260515-195054-t33c-1-worker-save-load-commands | T33C.1 - Worker Save Load Commands | processo | task-ledger + change-inbox | `docs/architecture/worker_rpc_spec.md`; `docs/user/offline-smoke.md` | Rascunho permitido; comandos Worker de save/load. |
| 20260515-192238-d01-dependency-security-refresh | D01 dependency security refresh | processo | task-ledger + change-inbox | `docs/process/d01-1-security-audit-gate-recovery.md` | Rascunho permitido; historico de seguranca. |
| 20260515-185920-t33c-saveloadservice | T33C - SaveLoadService | processo | task-ledger + change-inbox | `docs/architecture/worker_rpc_spec.md` | Rascunho permitido; service puro de save/load. |
| 20260514-112622-t33b-sqlite-wasm-opfs-bootstrap | T33B - SQLite WASM OPFS Bootstrap | usuario | task-ledger + change-inbox | `docs/user/offline-smoke.md`; `docs/architecture/worker_rpc_spec.md` | Rascunho permitido; bootstrap local-first. |
| 20260514-112014-t33a-worker-rpc-save-contract | T33A - Worker RPC Save Contract | arquitetura | task-ledger + change-inbox | `docs/architecture/worker_rpc_spec.md`; ADR futuro | Rascunho permitido; contrato serializavel. |
| 20260514-065055-t32-worldstate-key-value | T32 - WorldState Key-Value | usuario | task-ledger + change-inbox | `docs/user/social-encounter.md`; `docs/architecture/blueprint.md` | Rascunho permitido; WorldState exibido como consequencia. |
| 20260513-234107-t28-ui-de-conjuracao-minima | T28 UI De Conjuracao Minima | usuario | task-ledger + change-inbox | `docs/user/*` para magia minima | Rascunho permitido; comando preparado sem executar magia. |
| 20260513-233033-t27-spellcastbuilder-core | T27 SpellCastBuilder Core | sistema | task-ledger + change-inbox | `docs/system/magic/*` somente apos revisao | Bloqueado para regra; validar builder e custo de magia. |
| 20260513-220314-t26-spell-schema-minimo | T26 Spell Schema Minimo | usuario | task-ledger + change-inbox | `docs/user/*`; `docs/architecture/blueprint.md` | Rascunho permitido; catalogo minimo read-only. |
| 20260513-203725-t25-inventory-read-only-ui | T25 Inventory Read Only UI | usuario | task-ledger + change-inbox | `docs/user/*` para inventario/carga | Rascunho permitido; inventario somente leitura. |
| 20260513-202933-t24-inventorycapacityservice | T24 InventoryCapacityService | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; `docs/system/survival/regras-peso-carga.md` apos revisao | Rascunho permitido; promocao de regra exige fonte. |
| 20260513-182431-a06-mcp-and-skill-fixture-gates | A06 MCP And Skill Fixture Gates | processo | task-ledger + change-inbox | `docs/process/automation-spec.md`; `docs/conventions/tooling-relevance-map.md` | Rascunho permitido; gates de fixture. |
| 20260513-125718-a05-skill-validators-windows-first | A05 Skill Validators Windows-First | convencoes | task-ledger + change-inbox | `docs/conventions/tooling-relevance-map.md`; `.agents/skills/*` | Rascunho permitido; confirmar Windows-first. |
| 20260513-124327-a04-coverage-and-quality-gate-automation | A04 Coverage And Quality Gate Automation | processo | task-ledger + change-inbox | `docs/process/automation-spec.md`; `docs/process/testing-and-next-steps-roadmap.md` | Rascunho permitido; coverage e quality gate. |
| 20260513-123938-a03-domain-service-scaffolder | A03 Domain Service Scaffolder | processo | task-ledger + change-inbox | `docs/process/testing-and-next-steps-roadmap.md` | Rascunho permitido; scaffolder de services. |
| 20260513-123247-a02-catalog-entity-scaffolder | A02 Catalog Entity Scaffolder | nao promover ainda | task-ledger + change-inbox | Este rascunho | Bloqueado; requer evidencia humana adicional. |
| 20260513-122332-a01-process-automation-hardening | A01 Process Automation Hardening | processo | task-ledger + change-inbox | `docs/process/automation-spec.md` | Rascunho permitido; endurecimento da automacao. |
| 20260513-120357-t23-equipment-schema | T23 Equipment Schema | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; `docs/user/combat-training.md` | Rascunho permitido; catalogo de equipamento. |
| 20260512-183308-t22k-combat-vertical-slice-review | T22K Combat Vertical Slice Review | usuario | task-ledger + change-inbox | `docs/process/t22-combat-vertical-slice-review.md`; `docs/user/combat-training.md` | Rascunho permitido; checklist de combate. |
| 20260512-182841-t22j-combat-user-guide | T22J Combat User Guide | usuario | task-ledger + change-inbox | `docs/user/combat-training.md` | Rascunho permitido; guia existente. |
| 20260512-182337-t22i-combat-encounter-outcome | T22I Combat Encounter Outcome | sistema | task-ledger + change-inbox | `docs/system/combat/*` somente apos revisao | Bloqueado para regra; validar 0 HP e fim de encontro. |
| 20260512-181508-t22h-combat-training-target-turn | T22H Combat Training Target Turn | sistema | task-ledger + change-inbox | `docs/system/combat/*` somente apos revisao | Bloqueado para regra; alvo passivo e treino. |
| 20260512-130258-t22g-combat-training-damage-profile | T22G Combat Training Damage Profile | sistema | task-ledger + change-inbox | `docs/system/combat/18-tratado-de-dano.md` somente apos revisao | Bloqueado para regra; dano por Matriz Fisica. |
| 20260512-122140-t22f-combat-attacker-derived-stats | T22F Combat Attacker Derived Stats | sistema | task-ledger + change-inbox | `docs/system/survival/05-00-regras-de-classe.md` somente apos revisao | Bloqueado para regra; atributos derivados. |
| 20260506-233712-t22e-combat-turn-state | T22E Combat Turn State | sistema | task-ledger + change-inbox | `docs/system/combat/*` somente apos revisao | Bloqueado para regra; turno e acoes. |
| 20260506-181931-t22d-combat-session-attacker | T22D Combat Session Attacker | sistema | task-ledger + change-inbox | `docs/system/combat/*` somente apos revisao | Bloqueado para regra; atacante de sessao. |
| 20260506-175209-t22c-combat-training-targets | T22C Combat Training Targets | sistema | task-ledger + change-inbox | `docs/system/combat/*` somente apos revisao | Bloqueado para regra; alvos ficticios de treino. |
| 20260506-123114-t22b-combat-vertical-slice-ui | T22B Combat Vertical Slice UI | usuario | task-ledger + change-inbox | `docs/user/combat-training.md` | Rascunho permitido; UI de combate de treino. |
| 20260506-120924-t22a-combat-encounter-core | T22A Combat Encounter Core | sistema | task-ledger + change-inbox | `docs/system/combat/*` somente apos revisao | Bloqueado para regra; service de encontro. |
| 20260506-114519-t21-damage-pipeline-minimo | T21 Damage Pipeline minimo | sistema | task-ledger + change-inbox | `docs/system/combat/18-tratado-de-dano.md` somente apos revisao | Bloqueado para regra; pipeline de dano. |
| 20260506-000211-t20-actionqueue-minima | T20 ActionQueue minima | processo | task-ledger + change-inbox | `docs/architecture/feature_state_machines.md`; ADR futuro | Rascunho permitido; fila de acoes como base tecnica. |
| 20260505-235005-t19-resolutionservice-core | T19 ResolutionService core | processo | task-ledger + change-inbox | `docs/architecture/feature_state_machines.md` | Rascunho permitido; resolucao auditavel. |
| 20260505-231828-t18a-dice-service-core | T18A dice service core | processo | task-ledger + change-inbox | `docs/architecture/sdd.md`; `docs/process/vertical-slice-qa.md` | Rascunho permitido; DiceService centralizado. |
| 20260505-190555-t17a-compendium-browser-ui | T17A compendium browser UI | usuario | task-ledger + change-inbox | `docs/user/*` para compendio | Rascunho permitido; busca read-only. |
| 20260505-185244-t16a-compendium-base-catalog | T16A compendium base catalog | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md` | Rascunho permitido; catalogo base validado. |
| 20260505-180953-t15b-character-catalog-ui-integration | T15B character catalog UI integration | usuario | task-ledger + change-inbox | `docs/user/character-creation.md` | Rascunho permitido; catalogos no criador. |
| 20260505-131417-t15a-character-derived-stats-core | T15A character derived stats core | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; `docs/user/character-creation.md` | Rascunho permitido; stats derivados nao persistidos. |
| 20260505-085702-t14-background-schema | T14 background schema | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; `docs/user/character-creation.md` | Rascunho permitido; catalogo de antecedentes. |
| 20260505-084102-t13-character-class-schema | T13 character class schema | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; `docs/user/character-creation.md` | Rascunho permitido; catalogo de classes. |
| 20260505-081342-t13a-character-ancestry-trait-selection | T13A character ancestry trait selection | arquitetura | task-ledger + change-inbox | `docs/user/character-creation.md`; `docs/architecture/blueprint.md` | Rascunho permitido; selecao de 3 tracos. |
| 20260503-221203-t12-ancestry-traits | T12 ancestry traits | nao promover ainda | task-ledger + change-inbox | Este rascunho | Bloqueado; requer evidencia humana adicional. |
| 20260503-173935-t11-ancestry-schema | T11 ancestry schema | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; `docs/user/character-creation.md` | Rascunho permitido; catalogo de ancestralidades. |
| 20260503-172645-t10-character-user-docs | T10 character user docs | usuario | task-ledger + change-inbox | `docs/user/character-creation.md` | Rascunho permitido; guia de criacao. |
| 20260503-171537-t09-character-error-copy | T09 character error copy | sistema | task-ledger + change-inbox | `docs/system/survival/guia-criacao-de-ficha.md` somente apos revisao | Bloqueado para regra; mensagens nao alteram mecanica. |
| 20260503-135734-t08-character-create-form | T08 character create form | usuario | task-ledger + change-inbox | `docs/user/character-creation.md` | Rascunho permitido; fluxo 6/6. |
| 20260503-131425-t07-character-list-ui | T07 character list UI | usuario | task-ledger + change-inbox | `docs/user/character-creation.md` | Rascunho permitido; listagem local. |
| 20260503-124608-t06-characters-migration | T06 characters migration | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; `docs/architecture/worker_rpc_spec.md` | Rascunho permitido; migration inicial. |
| 20260502-231441-navegacao-state-driven-inicial | Navegacao state-driven inicial | nao promover ainda | task-ledger + change-inbox | Este rascunho | Bloqueado; requer decisao se vira arquitetura oficial. |
| 20260502-230859-regra-de-planejamento-obrigatorio | Regra de planejamento obrigatorio | nao promover ainda | task-ledger + change-inbox | Este rascunho | Bloqueado; regra ja existe em `AGENTS.md`/`llms.txt`, evitar duplicacao. |
| 20260502-224801-scaffold-minimo-svelte-vite | Scaffold minimo Svelte Vite | usuario | task-ledger + change-inbox | `docs/user/offline-smoke.md`; `docs/architecture/sdd.md` | Rascunho permitido; scaffold inicial. |
| 20260502-223501-documentar-plano-completo-do-jogo | Documentar plano completo do jogo | processo | task-ledger + change-inbox | `docs/process/complete-game-implementation-guide.md`; `docs/process/microtask-delivery-plan.md` | Rascunho permitido; roadmap existente. |
| 20260502-202511-implement-unified-quality-gate | Implement unified quality gate | processo | task-ledger + change-inbox | `docs/process/testing-and-next-steps-roadmap.md`; `docs/process/automation-spec.md` | Rascunho permitido; gate unificado. |
| 20260502-201538-qa-roadmap-for-implemented-systems | QA roadmap for implemented systems | processo | task-ledger + change-inbox | `docs/process/testing-and-next-steps-roadmap.md` | Rascunho permitido; roadmap de QA. |
| 20260502-114935-tracer-bullet-character-domain | Tracer bullet Character domain | arquitetura | task-ledger + change-inbox | `docs/architecture/blueprint.md`; ADR futuro | Rascunho permitido; primeiro dominio Character. |
| 20260501-013428-implement-zero-token-maintenance-automation | Implement zero-token maintenance automation | processo | task-ledger + change-inbox | `docs/process/automation-spec.md`; `llms.txt` | Rascunho permitido; automacao de manutencao. |

## Ordem Recomendada Para Promocao Oficial

1. Promover primeiro `processo` e `convencoes`, porque eles nao mudam regra de jogo.
2. Promover `usuario` com linguagem pt-BR e limites explicitos de treino, sem prometer persistencia ou regras futuras.
3. Promover `arquitetura` via ADRs ou docs existentes quando o contrato for duradouro.
4. Revisar `sistema` item a item contra `docs/system/`; se faltar fonte, manter no inbox.
5. Reavaliar os 4 itens `nao promover ainda` depois de evidencia humana ou decisao de governanca.

## Gates Para Fechar A Rodada

```powershell
npm.cmd run docs:audit
npm.cmd test
npm.cmd run lint
npm.cmd run automation:doctor
python scripts/pandorha_process_automation.py snapshot --reason documentation-promotion-draft
```
