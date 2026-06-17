# Gate De Cinto De Pocoes Como Acesso Rapido

## Objetivo

Este gate aprova a proxima evolucao minima do inventario no combate de treino:
expor o `potion-belt-stack` como cinto de pocoes acessivel pela aba `Combate`
e permitir consumir uma unidade pelo ledger de inventario existente.

Este documento nao altera regras soberanas em `docs/system/`. Ele fixa apenas o
contrato tecnico necessario para implementar a primeira fatia da entrada do
`change-inbox` `20260615-future-inventory-potion-belt`, sem antecipar cura,
HP real persistido, estados oficiais ou economia de acao.

## Contrato Aprovado

Decisoes obrigatorias:

- `potion-belt-stack` representa as pocoes acessiveis do cinto nesta fatia.
- A capacidade maxima exibida vem de
  `PANDORHA_RULES.LOGISTICS.POTION_BELT_CAPACITY`.
- A quantidade atual e derivada da entrada de inventario
  `catalogKind: "consumable"` e `catalogItemId: "potion-belt-stack"`.
- Usar uma pocao consome exatamente `1` unidade via
  `InventoryManagementService.consumeConsumable`.
- Quando a quantidade chega a `0`, o ledger de inventario usa o evento de
  remocao ja existente.
- A aba `Combate` deve compor a operacao atraves do boundary de `app`; a feature
  `combat-encounter` nao importa `inventory-management`.
- O uso deve registrar feedback visivel em pt-BR informando que e treino e que
  HP real nao foi alterado.

## Fora Do Escopo

- save v8, migration, worker RPC novo ou novo ledger;
- cura real, HP real persistido, Moribundo, Inconsciente ou qualquer estado
  oficial;
- overdose, efeitos de item, venenos, doencas ou regras de alvo;
- durabilidade, quebra de frascos, loot, crafting ou economia;
- economia de acao oficial, talentos de acao livre ou regras de turno oficiais;
- carregar pocoes fora do cinto ou criar catalogo completo de pocoes.

## Interface Minima Esperada

O boundary de `app` deve resolver e consumir o cinto a partir do inventario do
personagem selecionado no combate:

```ts
type CombatPotionBeltResolver = (input: { characterId: string }) =>
	Promise<Result<CombatPotionBeltSnapshot, CombatPotionBeltFailure>>;

type CombatPotionBeltConsumer = (input: {
	characterId: string;
	entryId: string;
}) => Promise<Result<CombatPotionBeltUseResult, CombatPotionBeltFailure>>;
```

Snapshot minimo:

```ts
interface CombatPotionBeltSnapshot {
	readonly entryId: string | null;
	readonly quantity: number;
	readonly capacity: number;
	readonly canUse: boolean;
}
```

Falhas devem ser tipadas e mapeadas para copy pt-BR. O painel de combate deve
permanecer resiliente quando o personagem nao possui cinto, quando o ledger esta
invalido ou quando o catalogo nao resolve a entrada.

## UI Aprovada

A aba `Combate` deve exibir para personagens da sessao:

- `Cinto de pocoes: X/5`;
- botao `Usar pocao do cinto`;
- estado bloqueado quando nao houver cinto ou quando a quantidade for `0`;
- log `Pocao do cinto usada em treino. HP real nao foi alterado.`

A aba `Inventario` continua sendo a fonte para carregar ou remover
`Cinto de Pocoes`. A copy do inventario deve deixar claro que a pilha representa
o cinto carregado, nao uma cura aplicada automaticamente.

## Gates Obrigatorios

Antes do fechamento da implementacao:

- testes red/green para resolver cinto ausente, cinto carregado, uso normal,
  uso da ultima unidade e falhas tipadas;
- testes de UI/modelo confirmando botao bloqueado sem cinto e log sem alterar
  HP real ou HP de treino;
- `npm.cmd run qa:vertical-slice`;
- `npm.cmd run qa:ui-reachability`;
- Browser do Codex com criar personagem, adicionar `Cinto de Pocoes`, abrir
  `Combate`, confirmar `5/5`, usar ate `4/5`, salvar, recarregar, carregar
  save v7, confirmar restauracao, usar ate `0/5`, confirmar bloqueio e console
  sem erros;
- `npm.cmd run qa:next-phase-readiness` em `main` limpa.
