# T81 - Handoff Pos-T80 E Baseline Social

Data: 2026-05-31.

## Decisao

A linha T66-T80 fica consolidada como baseline local da vertical social antes da proxima fase. Esta tarefa nao promove mudancas para `docs/changelog.md`, porque a branch atual ainda nao e `main`; o changelog deve receber resumo oficial apenas depois de merge ou `post-merge`.

## Baseline Aceito

- Save/load permanece em `CURRENT_SAVE_VERSION = 5`.
- `npcRelationships` continua sendo a fonte duravel do estado atual da relacao por NPC.
- `npc_relationship_events` e save v6 continuam adiados pelo gate T79.
- `WorldState` nao deve ser usado como atalho para relacao individual duravel.
- Relacoes por NPC podem ser lidas agrupadas por faccao na aba `Relacoes`.
- Clocks de retaliacao social avancam somente por gatilho explicito `social-pressure`.

## Promocao Candidata Pos-Merge

Quando esta branch chegar a `main`, promover um resumo curto para `docs/changelog.md` cobrindo:

- vertical social T66-T80 estabilizada;
- save/load v5 com negociacao social, eventos sociais, clocks e relacoes por NPC;
- gate T79 mantendo historico append-only e save v6 fora do escopo atual;
- agrupamento visual de relacoes por NPC por faccao.

Se a promocao exigir decisao arquitetural duravel, criar ADR separado em `docs/adr/`. Se exigir regra RPG nova, atualizar `docs/system/`; ate aqui, T81 nao muda regra RPG.

## Proximas Fases

1. F82: melhorar leitura compacta/filtros de `Relacoes por NPC`, sem save v6 e sem nova penalidade.
2. F83: planejar o gate de avanco de clocks sociais antes de qualquer tick automatico.
3. F84: avaliar automacao de browser renderizado para o fluxo social, mantendo `qa:social-browser-smoke` como contrato estatico ate haver custo-beneficio claro.
4. F85: voltar ao gargalo mecanico de equipamento e combate real, com service/domain antes de UI.

## Gates De Fechamento

Rodar antes de considerar a proxima fase pronta para iniciar:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage
npm.cmd run quality:gate
npm.cmd run qa:vertical-slice
npm.cmd run qa:social-browser-smoke
npm.cmd run qa:dialogue-seeds
npm.cmd run qa:next-phase-readiness
```

