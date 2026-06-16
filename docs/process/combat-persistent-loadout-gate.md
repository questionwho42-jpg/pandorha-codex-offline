# Gate De Combate Com Loadout Persistido

## Objetivo

Este gate aprova a proxima evolucao da aba `Combate`: personagens criados na
sessao devem usar o loadout persistido pelo `Inventario` como fonte de verdade
para arma, escudo e armadura durante o treino.

Este documento nao altera regras soberanas em `docs/system/`. Ele fixa apenas o
contrato tecnico necessario para implementar a entrada do `change-inbox`
`20260615-future-inventory-combat-integration`.

## Contrato Da Integracao

A aba `Combate` deve continuar sendo uma superficie de treino local. Ela passa a
ler o loadout equipado do personagem, mas nao passa a possuir ou persistir
equipamento.

Decisoes obrigatorias:

- nao criar save v8;
- nao criar migration;
- nao persistir estado de combate;
- nao duplicar `catalogItemId`, `inventoryEntryId`, durabilidade, HP ou estado
  derivado no combate;
- nao manter seletores locais de arma, armadura ou escudo para personagens da
  sessao;
- manter Aria no perfil fixo de treino;
- bloquear ataque de personagem sem arma equipada;
- permitir personagem sem armadura ou escudo equipado;
- manter conflitos de maos no `EquipmentLoadoutService`;
- manter dano real, HP real persistido, estados oficiais, durabilidade,
  proficiencia, loot, monstros oficiais e cinto de pocoes fora do escopo.

## Interface Minima

O boundary de `app` deve resolver o loadout persistido e entregar ao painel de
combate um snapshot compativel com `EquipmentLoadoutSnapshot`.

Formato minimo aprovado para a porta:

```ts
type CombatPersistentLoadoutResolver = (input: {
	readonly characterId: string;
}) => Promise<Result<EquipmentLoadoutSnapshot, CombatPersistentLoadoutFailure>>;
```

Falhas devem ser tipadas e mapeadas para copy pt-BR na UI. O painel de combate
nao deve importar `inventory-management`; a ponte entre inventario e combate
fica em `app`.

## UI Aprovada

Para personagens da sessao, a aba `Combate` deve exibir leitura do loadout
persistido:

- `Arma equipada: <nome>` ou `Nenhuma arma equipada`;
- `Escudo equipado: <nome>` ou `Sem escudo`;
- `Armadura equipada: <nome>` ou `Sem armadura`;
- resumo de defesa equipada ja existente.

Quando faltar arma equipada, o botao `Atacar` deve ficar indisponivel e a UI
deve oferecer a acao `Abrir Inventario`, que navega para a aba `Inventario`.

Trocar atacante, trocar alvo ou reiniciar o encontro deve reler o loadout
persistido do personagem selecionado. A leitura nao deve alterar inventario,
loadout, save ou combate.

## Gates Obrigatorios

Antes do fechamento da implementacao:

- testes red/green para a ponte `app -> inventory -> combat`;
- testes de UI/modelo cobrindo personagem sem arma, com arma e com defesa;
- `npm.cmd run qa:vertical-slice`;
- `npm.cmd run qa:ui-reachability`;
- Browser do Codex com criar personagem, equipar itens no Inventario, abrir
  Combate, atacar com arma persistida, trocar arma no Inventario, voltar ao
  Combate e confirmar a nova arma, salvar, recarregar e carregar save v7;
- `npm.cmd run qa:next-phase-readiness` em `main` limpa.
