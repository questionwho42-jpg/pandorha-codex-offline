# Gate De Perfis De Loadout Para Equipamento Inicial

## Objetivo

Este gate bloqueia perfis de loadout e combate para itens de kit inicial que
existem apenas para ownership/carga. Ele evita que o catalogo conservador de
equipamento inicial vire bonus mecanico por inferencia.

Este documento nao altera `docs/system/`, nao cria save v10, nao muda
inventario, nao concede itens novos e nao torna item equipavel.

## Fontes Revisadas

- Kits oficiais:
  `docs/system/survival/regras-ouro-equipamento-inicial.md`.
- Arsenal implementado com estatisticas:
  `docs/system/survival/04-arsenal-e-economia.md`.
- Gate de lacunas de catalogo:
  `docs/process/starting-equipment-catalog-gap.md`.
- Gate de concessao por ledger:
  `docs/process/starting-equipment-ledger-grant-gate.md`.
- Gate de evidencia pos-Compendio:
  `docs/process/starting-equipment-profile-evidence-gate.md`.
- Catalogo atual:
  `src/entities/equipment/model/equipmentCatalog.ts`.

## Decisao Fixa

Os itens abaixo continuam somente como carga/ownership ate existir contrato
proprio com estatisticas soberanas ou substituicoes explicitas:

- `chainmail`;
- `shortbow`;
- `staff`;
- `rapier`;
- `luxury-padded-armor`.

Eles nao devem aparecer em `OFFICIAL_LOADOUT_SUPPORTED_EQUIPMENT_IDS`, nao devem
receber `OFFICIAL_WEAPON_ATTACK_PROFILE_DEFINITIONS` ou
`OFFICIAL_DEFENSE_PROFILE_DEFINITIONS`, e nao devem exibir acoes de equipar na
UI.

## Perfis Atualmente Permitidos

Somente os itens com estatisticas ja implementadas no contrato atual continuam
equipaveis:

- `longsword`;
- `dagger`;
- `longbow`;
- `leather-armor`;
- `plate-armor`;
- `round-shield`.

Qualquer expansao deve ser uma nova fase com TDD, Browser do Codex e revisao das
fontes soberanas. Itens parecidos nao contam como substitutos automaticos.

A auditoria de evidencia em
`docs/process/starting-equipment-profile-evidence-gate.md` confirmou que nenhum
dos cinco itens bloqueados possui fonte soberana especifica suficiente para
desbloquear codigo nesta rodada.

## Pre-Requisitos Para Desbloquear

Antes de tornar qualquer item de kit inicial equipavel:

1. Registrar fonte soberana ou contrato aprovado para dado, CA, maos, tags,
   slots, penalidades e durabilidade inicial.
2. Definir se o item usa perfil de arma, armadura, escudo ou outro tipo.
3. Atualizar o catalogo e os servicos de perfil por TDD.
4. Atualizar Inventario, Combate, smokes e guias de usuario.
5. Validar no Browser do Codex que o item equipa, salva, recarrega e alimenta o
   combate sem erros de console.

## Fora Do Escopo

- Criar estatisticas novas para os itens;
- inferir bonus a partir do nome ou do kit;
- alterar `docs/system/`;
- auto-loadout;
- ouro inicial;
- HP real;
- crafting, reparo ou desgaste automatico;
- save v10 ou migration.
