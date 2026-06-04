# Auditoria De Documentação Do Pandorha Engine

Gerado em: 2026-06-04T23:45:10.899Z
Escopo: `all`

## Resumo

- Arquivos Markdown analisados: 134
- Documentos sem H1: 0
- Links locais quebrados: 0
- Referências de caminho ausentes: 115
- Possíveis órfãos: 121
- Entradas abertas de promoção: 83

## Inventário Por Área

| Área | Arquivos |
| :--- | ---: |
| adr | 1 |
| architecture | 5 |
| conventions | 3 |
| process | 18 |
| root | 2 |
| system | 98 |
| user | 7 |

## Problemas Estruturais

### Documentos sem H1

- Nenhum.

### Links locais quebrados

- Nenhum.

### Referências de caminho ausentes

- `docs/adr/README.md:5 -> 0001-worker-rpc-boundary.md`
- `docs/architecture/worker_rpc_spec.md:130 -> src/shared/rpc-schemas.ts`
- `docs/conventions/core-conventions.md:16 -> CombatService.ts`
- `docs/conventions/core-conventions.md:16 -> HeroView.svelte`
- `docs/conventions/core-conventions.md:17 -> constants.ts`
- `docs/conventions/core-conventions.md:35 -> +layout.ts`
- `docs/conventions/core-conventions.md:35 -> +page.server.ts`
- `docs/conventions/core-conventions.md:43 -> tailwind.config.ts`
- `docs/process/complete-game-implementation-guide.md:68 -> styleguide.md`
- `docs/process/complete-game-implementation-guide.md:154 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:12 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:12 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:12 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:12 -> worker_rpc_spec.md`
- `docs/process/microtask-delivery-plan.md:12 -> core-conventions.md`
- `docs/process/microtask-delivery-plan.md:12 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:69 -> Untitled-1.md`
- `docs/process/microtask-delivery-plan.md:74 -> complete-game-implementation-guide.md`
- `docs/process/microtask-delivery-plan.md:74 -> microtask-delivery-plan.md`
- `docs/process/microtask-delivery-plan.md:75 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:75 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:75 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:75 -> worker_rpc_spec.md`
- `docs/process/microtask-delivery-plan.md:75 -> core-conventions.md`
- `docs/process/microtask-delivery-plan.md:75 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:90 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:90 -> core-conventions.md`
- `docs/process/microtask-delivery-plan.md:90 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:103 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:116 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:131 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:131 -> characterSchema.ts`
- `docs/process/microtask-delivery-plan.md:144 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:144 -> worker_rpc_spec.md`
- `docs/process/microtask-delivery-plan.md:157 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:157 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:170 -> 00-mecanicas-fundamentais.md`
- `docs/process/microtask-delivery-plan.md:170 -> guia-criacao-de-ficha.md`
- `docs/process/microtask-delivery-plan.md:196 -> 00-mecanicas-fundamentais.md`
- `docs/process/microtask-delivery-plan.md:211 -> 01-ancestralidades.md`
- `docs/process/microtask-delivery-plan.md:224 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:224 -> 01-ancestralidades.md`
- `docs/process/microtask-delivery-plan.md:237 -> 05-00-regras-de-classe.md`
- `docs/process/microtask-delivery-plan.md:250 -> 10-antecedentes-e-origens.md`
- `docs/process/microtask-delivery-plan.md:263 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:263 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:291 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:291 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:306 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:306 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:319 -> 00-mecanicas-fundamentais.md`
- `docs/process/microtask-delivery-plan.md:319 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:332 -> feature_state_machines.md`
- `docs/process/microtask-delivery-plan.md:345 -> 18-tratado-de-dano.md`
- `docs/process/microtask-delivery-plan.md:345 -> feature_state_machines.md`
- `docs/process/microtask-delivery-plan.md:358 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:358 -> feature_state_machines.md`
- `docs/process/microtask-delivery-plan.md:358 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:373 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:373 -> 04-arsenal-e-economia.md`
- `docs/process/microtask-delivery-plan.md:386 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:386 -> regras-peso-carga.md`
- `docs/process/microtask-delivery-plan.md:399 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:399 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:414 -> 12-00-codex-de-magia.md`
- `docs/process/microtask-delivery-plan.md:427 -> feature_state_machines.md`
- `docs/process/microtask-delivery-plan.md:427 -> worker_rpc_spec.md`
- `docs/process/microtask-delivery-plan.md:440 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:440 -> feature_state_machines.md`
- `docs/process/microtask-delivery-plan.md:455 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:455 -> c-dex-de-hexcrawl-e-explora-o.md`
- `docs/process/microtask-delivery-plan.md:468 -> c-dex-de-hexcrawl-e-explora-o.md`
- `docs/process/microtask-delivery-plan.md:481 -> styleguide.md`
- `docs/process/microtask-delivery-plan.md:481 -> sdd.md`
- `docs/process/microtask-delivery-plan.md:494 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:507 -> worker_rpc_spec.md`
- `docs/process/microtask-delivery-plan.md:507 -> feature_state_machines.md`
- `docs/process/microtask-delivery-plan.md:522 -> blueprint.md`
- `docs/process/microtask-delivery-plan.md:522 -> gdd.md`
- `docs/process/microtask-delivery-plan.md:535 -> 28-codex-acampamento-descanso-ativo.md`
- `docs/process/microtask-delivery-plan.md:548 -> 21-mecanicas-de-fama-e-influencia.md`
- `docs/process/microtask-delivery-plan.md:548 -> 31-codex-teia-infamia-patrocinio.md`
- `docs/process/microtask-delivery-plan.md:561 -> sdd.md`
- `docs/process/testing-and-next-steps-roadmap.md:190 -> tech-memory.md`
- `docs/process/testing-and-next-steps-roadmap.md:190 -> scaling-roadmap.md`
- `docs/process/testing-and-next-steps-roadmap.md:190 -> plain-english.md`
- `docs/process/testing-and-next-steps-roadmap.md:191 -> src/features/[module]/.context`
- `docs/process/testing-and-next-steps-roadmap.md:236 -> SKILL.md`
- `docs/process/testing-and-next-steps-roadmap.md:245 -> assets/response-schema.json`
- `docs/process/testing-and-next-steps-roadmap.md:246 -> scripts/formatter.ts`
- `docs/process/testing-and-next-steps-roadmap.md:253 -> scripts/extract_ast.py`
- `docs/process/testing-and-next-steps-roadmap.md:261 -> scripts/verify-coverage.ts`
- `docs/process/testing-and-next-steps-roadmap.md:261 -> coverage-summary.json`
- `docs/process/testing-and-next-steps-roadmap.md:263 -> scripts/check-query-budget.ts`
- `docs/process/testing-and-next-steps-roadmap.md:269 -> references/rules_manifest.json`
- `docs/process/testing-and-next-steps-roadmap.md:270 -> scripts/validator.py`
- `docs/process/testing-and-next-steps-roadmap.md:272 -> scripts/sync_db.py`
- `docs/process/testing-and-next-steps-roadmap.md:278 -> scripts/validate.sh`
- `docs/process/testing-and-next-steps-roadmap.md:303 -> pandorha_process_automation.py`
- `docs/process/testing-and-next-steps-roadmap.md:310 -> assets/example_node.json`
- `docs/process/testing-and-next-steps-roadmap.md:311 -> scripts/validate_tree.ts`
- `docs/process/testing-and-next-steps-roadmap.md:320 -> scripts/verify-topography.ts`
- `docs/process/testing-and-next-steps-roadmap.md:336 -> references/master_table.json`
- `docs/process/testing-and-next-steps-roadmap.md:336 -> references/roles.json`
- `docs/process/testing-and-next-steps-roadmap.md:347 -> task-ledger.md`
- `docs/process/testing-and-next-steps-roadmap.md:347 -> change-inbox.md`
- `docs/process/testing-and-next-steps-roadmap.md:367 -> scripts/validator.py`
- `docs/process/testing-and-next-steps-roadmap.md:377 -> references/acl_policies.json`
- `docs/process/testing-and-next-steps-roadmap.md:378 -> references/fsm_schemas.ts`
- `docs/process/testing-and-next-steps-roadmap.md:379 -> scripts/world_state_cli.ts`
- `docs/process/testing-and-next-steps-roadmap.md:494 -> pandorha_process_automation.py`
- `docs/process/testing-and-next-steps-roadmap.md:503 -> src/features/[module`
- `docs/process/vertical-slice-qa.md:49 -> App.svelte`
- `llms.txt:23 -> blueprint.md`
- `llms.txt:23 -> core-conventions.md`

### Possíveis documentos órfãos

- `docs/architecture/worker_rpc_spec.md`
- `docs/conventions/core-conventions.md`
- `docs/conventions/styleguide.md`
- `docs/conventions/tooling-relevance-map.md`
- `docs/ferramentas do usuario/prompt inicial para novas features.md`
- `docs/process/complete-game-implementation-guide.md`
- `docs/process/d01-1-security-audit-gate-recovery.md`
- `docs/process/microtask-delivery-plan.md`
- `docs/process/t22-combat-vertical-slice-review.md`
- `docs/process/t72-npc-relationship-contract.md`
- `docs/process/t73-npc-relationship-save-v5-gate.md`
- `docs/process/t79-npc-relationship-history-save-v6-gate.md`
- `docs/process/t81-post-t80-handoff-baseline.md`
- `docs/process/t83-social-retaliation-clock-advance-gate.md`
- `docs/process/t84-social-rendered-browser-automation-evaluation.md`
- `docs/process/testing-and-next-steps-roadmap.md`
- `docs/process/vertical-slice-qa.md`
- `docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md`
- `docs/system/combat/03-codex-de-combate-e-condicoes.md`
- `docs/system/combat/07-01a-tier1-mundo-natural.md`
- `docs/system/combat/07-01b-tier1-sobrenatural.md`
- `docs/system/combat/07-02a-tier2-feras-e-gigantes.md`
- `docs/system/combat/07-02b-tier2-magia-e-morte.md`
- `docs/system/combat/07-03a-tier3-lendas-vivas.md`
- `docs/system/combat/07-03b-tier3-horrores-etericos.md`
- `docs/system/combat/07-04a-tier4-deuses-e-titans.md`
- `docs/system/combat/13-guia-de-criacao-de-monstros.md`
- `docs/system/combat/14-compendio-de-habilidades-de-monstros.md`
- `docs/system/combat/15-compendio-de-habilidades-de-monstros-tier2.md`
- `docs/system/combat/16-compendio-de-habilidades-de-monstros-tier3.md`
- `docs/system/combat/17-compendio-de-habilidades-de-monstros-tier4.md`
- `docs/system/combat/18-tratado-de-dano.md`
- `docs/system/magic/12-00-codex-de-magia.md`
- `docs/system/magic/12-01-grimorio-arcano.md`
- `docs/system/magic/12-02-grimorio-circulo-0.md`
- `docs/system/magic/12-03-grimorio-circulo-1.md`
- `docs/system/magic/12-04-grimorio-circulo-2.md`
- `docs/system/magic/12-05-grimorio-circulo-3.md`
- `docs/system/magic/12-06-grimorio-circulo-4.md`
- `docs/system/magic/12-07-grimorio-circulo-5.md`
- `docs/system/magic/12-08-grimorio-circulo-6.md`
- `docs/system/magic/12-09-grimorio-circulo-7.md`
- `docs/system/magic/12-10-grimorio-circulo-8.md`
- `docs/system/magic/12-11-grimorio-circulo-9.md`
- `docs/system/magic/12-12-grimorio-circulo-10.md`
- `docs/system/magic/12-13-codex-expandido-magia-hibrida.md`
- `docs/system/magic/12-metamagias-as-40-quebras.md`
- `docs/system/survival/00-mecanicas-fundamentais.md`
- `docs/system/survival/01-00-regras-gerais.md`
- `docs/system/survival/01-01-humanos.md`
- `docs/system/survival/01-02-elfos.md`
- `docs/system/survival/01-03-anoes.md`
- `docs/system/survival/01-04-drakari.md`
- `docs/system/survival/01-05-umbrais.md`
- `docs/system/survival/01-06-feras.md`
- `docs/system/survival/01-ancestralidades.md`
- `docs/system/survival/02a-matriz-fisica.md`
- `docs/system/survival/02b-matriz-mental.md`
- `docs/system/survival/02c-matriz-social.md`
- `docs/system/survival/04-arsenal-e-economia.md`
- `docs/system/survival/05-00-regras-de-classe.md`
- `docs/system/survival/05-01-vanguarda.md`
- `docs/system/survival/05-02-tecelao.md`
- `docs/system/survival/05-03-emissario.md`
- `docs/system/survival/05-04-cacador.md`
- `docs/system/survival/06-npcs-e-aliados.md`
- `docs/system/survival/08-guia-do-mestre.md`
- `docs/system/survival/09-guia-do-artifice-e-criacao.md`
- `docs/system/survival/10-antecedentes-e-origens.md`
- `docs/system/survival/19-codex-de-enfermidades.md`
- `docs/system/survival/20-codex-de-toxinas.md`
- `docs/system/survival/21-mecanicas-de-fama-e-influencia.md`
- `docs/system/survival/22-codex-de-exploracao-e-downtime.md`
- `docs/system/survival/23-codex-de-armadilhas.md`
- `docs/system/survival/23a-codex-armadilhas-tier1.md`
- `docs/system/survival/23b-codex-armadilhas-tier2.md`
- `docs/system/survival/23c-codex-armadilhas-tier3.md`
- `docs/system/survival/23d-codex-armadilhas-tier4.md`
- `docs/system/survival/24-codex-companheiros-animais.md`
- `docs/system/survival/25-codex-familiar-mistico.md`
- `docs/system/survival/26-codex-sinergia-forja-tatica.md`
- `docs/system/survival/27-codex-influencia-dominio-regional.md`
- `docs/system/survival/27-regras-doencas-venenos.md`
- `docs/system/survival/28-codex-acampamento-descanso-ativo.md`
- `docs/system/survival/29-codex-companhia-mercenaria.md`
- `docs/system/survival/30-codex-do-bastiao.md`
- `docs/system/survival/31-codex-teia-infamia-patrocinio.md`
- `docs/system/survival/a-arte-da-tecelagem-aquisi-o-de-metamagias.md`
- `docs/system/survival/c-dex-de-hexcrawl-e-explora-o.md`
- `docs/system/survival/c-dex-de-investiga-o-e-descoberta.md`
- `docs/system/survival/c-dice-de-espionagem.md`
- `docs/system/survival/capitulo-xx-contramagia-e-anulacao.md`
- `docs/system/survival/capitulo-zero.md`
- `docs/system/survival/compendio-de-talentos.md`
- `docs/system/survival/descanso-e-acampamento-completo.md`
- `docs/system/survival/ficha-de-monstro.md`
- `docs/system/survival/ficha-expandida.md`
- `docs/system/survival/glossario-definitivo-de-testes.md`
- `docs/system/survival/guia-criacao-de-ficha.md`
- `docs/system/survival/indice-sistema.md`
- `docs/system/survival/pandorha-sistema-compilado.md`
- `docs/system/survival/regras-0-hp-e-inconsciencia.md`
- `docs/system/survival/regras-bastiao.md`
- `docs/system/survival/regras-completas-interacoes-sociais.md`
- `docs/system/survival/regras-economia-quebra-criacao-itens.md`
- `docs/system/survival/regras-fama-infamia-favor-faccoes.md`
- `docs/system/survival/regras-furtividade-infiltracao.md`
- `docs/system/survival/regras-habilidades-heroicas-ultimates-limit-break.md`
- `docs/system/survival/regras-magia.md`
- `docs/system/survival/regras-negociacao.md`
- `docs/system/survival/regras-ouro-equipamento-inicial.md`
- `docs/system/survival/regras-peso-carga.md`
- `docs/system/survival/regras-pesquisa-lore-criptografia-linguas-antigas.md`
- `docs/system/survival/retreino-e-recondicionamento.md`
- `docs/system/survival/sistema-de-dividas-antes-depois.md`
- `docs/user/camp-training.md`
- `docs/user/character-creation.md`
- `docs/user/combat-training.md`
- `docs/user/offline-smoke.md`
- `docs/user/social-encounter.md`
- `docs/user/social-relations.md`

## Contratos Do Projeto

### Erros

- Nenhum.

### Avisos

- Nenhum.

## Classificação Do Change Inbox

| Destino recomendado | Entradas |
| :--- | ---: |
| arquitetura | 16 |
| convenções | 1 |
| não promover ainda | 4 |
| processo | 32 |
| sistema | 13 |
| usuário | 17 |

### Entradas Abertas

| ID | Título | Destino | Motivo |
| :--- | :--- | :--- | :--- |
| 20260604-202736-t93-documentation-promotion-draft | T93 documentation promotion draft | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260602-124529-t92-enemy-training-attack-against-session-charac | T92 enemy training attack against session character | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260602-073042-t91-equipped-defense-profile | T91 equipped defense profile | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260602-072310-d01-2-strict-quality-gate-recovery | D01.2 strict quality gate recovery | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-232034-t90-documentation-audit-automation | T90 documentation audit automation | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-222318-t89-combat-target-defenses | T89 combat target defenses | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260601-215735-t88-weapon-dice-roll-contract | T88 weapon dice roll contract | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-123434-t87-combat-equipped-weapon-ui | T87 combat equipped weapon UI | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-121945-t86-equipment-loadout-core | T86 equipment loadout core | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-120947-d01-1-security-audit-gate-recovery | D01.1 security audit gate recovery | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-114326-t85-equipment-driven-combat-attack-profile | T85 equipment-driven combat attack profile | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260601-070954-t84-social-rendered-browser-automation-evaluatio | T84 Social Rendered Browser Automation Evaluation | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-065448-t83-social-retaliation-clock-advance-gate | T83 Social Retaliation Clock Advance Gate | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260601-063146-t82-social-relations-npc-filters | T82 Social Relations Npc Filters | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260531-204829-t81-post-t80-handoff-baseline | T81 Post T80 Handoff Baseline | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260531-200121-t80-group-npc-relationships-by-faction | T80 Group NPC Relationships By Faction | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260531-195801-t79-npc-relationship-history-save-v6-gate | T79 NPC Relationship History Save V6 Gate | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260531-194729-t77-handoff-local-pos-t76 | T77 Handoff Local Pos-T76 | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260530-002246-t73-t76-npc-relationship-save-ui | T73-T76 NPC Relationship Save UI | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260527-125851-t72-npc-relationship-core | T72 NPC Relationship Core | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260526-205714-t71-social-retaliation-clock-advance | T71 Social Retaliation Clock Advance | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260526-183035-t66-t70-social-roadmap-implementation | T66-T70 Social Roadmap Implementation | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260520-182802-t46-social-appeal-resolution | T46 Social Appeal Resolution | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260520-182331-t45-social-qa-refresh | T45 Social QA Refresh | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260520-130747-t44-social-encounter-ui | T44 Social Encounter UI | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260520-125428-t43-save-load-v4-social-encounter | T43 Save Load V4 Social Encounter | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260520-114359-t42-social-encounter-core | T42 Social Encounter Core | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260520-091722-t41-npc-schema | T41 NPC Schema | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260515-195054-t33c-1-worker-save-load-commands | T33C.1 - Worker Save Load Commands | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260515-192238-d01-dependency-security-refresh | D01 dependency security refresh | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260515-185920-t33c-saveloadservice | T33C - SaveLoadService | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260514-112622-t33b-sqlite-wasm-opfs-bootstrap | T33B - SQLite WASM OPFS Bootstrap | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260514-112014-t33a-worker-rpc-save-contract | T33A - Worker RPC Save Contract | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260514-065055-t32-worldstate-key-value | T32 - WorldState Key-Value | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260513-234107-t28-ui-de-conjuracao-minima | T28 UI De Conjuracao Minima | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260513-233033-t27-spellcastbuilder-core | T27 SpellCastBuilder Core | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260513-220314-t26-spell-schema-minimo | T26 Spell Schema Minimo | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260513-203725-t25-inventory-read-only-ui | T25 Inventory Read Only UI | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260513-202933-t24-inventorycapacityservice | T24 InventoryCapacityService | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260513-182431-a06-mcp-and-skill-fixture-gates | A06 MCP And Skill Fixture Gates | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260513-125718-a05-skill-validators-windows-first | A05 Skill Validators Windows-First | convenções | A entrada altera regras de trabalho para agentes, skills ou uso de ferramentas. |
| 20260513-124327-a04-coverage-and-quality-gate-automation | A04 Coverage And Quality Gate Automation | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260513-123938-a03-domain-service-scaffolder | A03 Domain Service Scaffolder | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260513-123247-a02-catalog-entity-scaffolder | A02 Catalog Entity Scaffolder | não promover ainda | A entrada precisa de revisão humana ou evidência adicional antes de virar documentação oficial. |
| 20260513-122332-a01-process-automation-hardening | A01 Process Automation Hardening | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260513-120357-t23-equipment-schema | T23 Equipment Schema | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260512-183308-t22k-combat-vertical-slice-review | T22K Combat Vertical Slice Review | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260512-182841-t22j-combat-user-guide | T22J Combat User Guide | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260512-182337-t22i-combat-encounter-outcome | T22I Combat Encounter Outcome | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260512-181508-t22h-combat-training-target-turn | T22H Combat Training Target Turn | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260512-130258-t22g-combat-training-damage-profile | T22G Combat Training Damage Profile | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260512-122140-t22f-combat-attacker-derived-stats | T22F Combat Attacker Derived Stats | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260506-233712-t22e-combat-turn-state | T22E Combat Turn State | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260506-181931-t22d-combat-session-attacker | T22D Combat Session Attacker | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260506-175209-t22c-combat-training-targets | T22C Combat Training Targets | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260506-123114-t22b-combat-vertical-slice-ui | T22B Combat Vertical Slice UI | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260506-120924-t22a-combat-encounter-core | T22A Combat Encounter Core | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260506-114519-t21-damage-pipeline-minimo | T21 Damage Pipeline minimo | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260506-000211-t20-actionqueue-minima | T20 ActionQueue minima | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260505-235005-t19-resolutionservice-core | T19 ResolutionService core | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260505-231828-t18a-dice-service-core | T18A dice service core | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260505-190555-t17a-compendium-browser-ui | T17A compendium browser UI | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260505-185244-t16a-compendium-base-catalog | T16A compendium base catalog | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260505-180953-t15b-character-catalog-ui-integration | T15B character catalog UI integration | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260505-131417-t15a-character-derived-stats-core | T15A character derived stats core | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260505-085702-t14-background-schema | T14 background schema | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260505-084102-t13-character-class-schema | T13 character class schema | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260505-081342-t13a-character-ancestry-trait-selection | T13A character ancestry trait selection | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260503-221203-t12-ancestry-traits | T12 ancestry traits | não promover ainda | A entrada precisa de revisão humana ou evidência adicional antes de virar documentação oficial. |
| 20260503-173935-t11-ancestry-schema | T11 ancestry schema | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260503-172645-t10-character-user-docs | T10 character user docs | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260503-171537-t09-character-error-copy | T09 character error copy | sistema | A entrada toca mecânica de RPG e deve ser cruzada com docs/system antes de promoção. |
| 20260503-135734-t08-character-create-form | T08 character create form | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260503-131425-t07-character-list-ui | T07 character list UI | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260503-124608-t06-characters-migration | T06 characters migration | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260502-231441-navegacao-state-driven-inicial | Navegacao state-driven inicial | não promover ainda | A entrada precisa de revisão humana ou evidência adicional antes de virar documentação oficial. |
| 20260502-230859-regra-de-planejamento-obrigatorio | Regra de planejamento obrigatorio | não promover ainda | A entrada precisa de revisão humana ou evidência adicional antes de virar documentação oficial. |
| 20260502-224801-scaffold-minimo-svelte-vite | Scaffold minimo Svelte Vite | usuário | A entrada afeta fluxo visível, guia de teste ou documentação de uso. |
| 20260502-223501-documentar-plano-completo-do-jogo | Documentar plano completo do jogo | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260502-202511-implement-unified-quality-gate | Implement unified quality gate | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260502-201538-qa-roadmap-for-implemented-systems | QA roadmap for implemented systems | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |
| 20260502-114935-tracer-bullet-character-domain | Tracer bullet Character domain | arquitetura | A entrada afeta contrato técnico, persistência, schema ou ponte RPC. |
| 20260501-013428-implement-zero-token-maintenance-automation | Implement zero-token maintenance automation | processo | A entrada descreve fluxo de entrega, validação, auditoria ou manutenção. |

## Regras De Promoção

- Não mover entradas para `Promoted` fora da branch `main` sem aprovação explícita.
- Não alterar `docs/system/` por inferência do código; regras de RPG continuam soberanas.
- Usar este relatório como triagem. A promoção oficial exige revisão humana ou evidência de merge.
