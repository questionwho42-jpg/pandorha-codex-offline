# Gate De Concessao De Equipamento Inicial Por Ledger

## Objetivo

Este gate aprova a proxima fatia minima de equipamento inicial: ao criar um
personagem novo, o app deve conceder o kit sugerido da classe usando apenas o
ledger de inventario existente.

Esta fase nao cria save v9, migration, novo ledger, ouro inicial, economia,
durabilidade mutavel, crafting, auto-loadout, HP real, efeitos de traco ou
alteracoes em `docs/system/`.

## Fontes Revisadas

- Kits oficiais:
  `docs/system/survival/regras-ouro-equipamento-inicial.md`.
- Repeticao economica dos kits:
  `docs/system/survival/regras-economia-quebra-criacao-itens.md`.
- Gap map aprovado:
  `docs/process/starting-equipment-catalog-gap.md`.
- Ledger de inventario aprovado:
  `docs/process/inventory-ownership-save-v6-gate.md`.

## Contrato De Catalogo Conservador

Os IDs abaixo serao adicionados ao catalogo implementado para permitir ownership
e capacidade derivada. Itens sem perfil mecanico completo nao devem receber
perfil de ataque, defesa ou loadout nesta fatia.

| ID tecnico | Rotulo | Tipo | Slots | Preco | Perfil nesta fatia |
| :--- | :--- | :--- | ---: | ---: | :--- |
| `chainmail` | Cota de Malha | equipment/armor | 2 | 0 | Sem perfil. |
| `shortbow` | Arco Curto | equipment/weapon | 2 | 0 | Sem perfil. |
| `staff` | Cajado | equipment/weapon | 2 | 0 | Sem perfil. |
| `rapier` | Rapieira | equipment/weapon | 1 | 0 | Sem perfil. |
| `luxury-padded-armor` | Armadura Acolchoada de Luxo | equipment/armor | 1 | 0 | Sem perfil. |
| `adventurer-kit-stack` | Kit de Aventureiro | consumable/adventuring-item | 1 | 0 | Pilha unica. |
| `grimoire-stack` | Grimorio | consumable/adventuring-item | 1 | 0 | Pilha unica. |
| `nobility-letter-stack` | Carta de Nobreza | consumable/adventuring-item | 0 | 0 | Pilha unica. |

`priceCopper: 0` significa apenas que o preco individual nao foi implementado
nesta fatia. O valor dos kits oficiais continua pertencendo aos documentos
soberanos e nao deve ser inferido pelo codigo.

## Contrato De Concessao

Somente personagens criados depois desta entrega recebem kit inicial
automaticamente. Saves antigos e personagens ja existentes nao recebem backfill.

Mapeamento de classe:

- `vanguard`: `chainmail`, `longsword`, `round-shield`,
  `adventurer-kit-stack`.
- `hunter`: `leather-armor`, `shortbow`, `dagger`, `adventurer-kit-stack`.
- `weaver`: `staff`, `grimoire-stack`, `dagger`, `dagger`,
  `adventurer-kit-stack`.
- `emissary`: `rapier`, `luxury-padded-armor`, `nobility-letter-stack`.

A concessao deve:

1. Criar eventos `inventory-item-added` pelo `InventoryManagementService`
   existente.
2. Usar uma entrada separada para cada equipamento unico.
3. Registrar `Adaga` duas vezes para `weaver`.
4. Criar consumiveis com quantidade inicial `1`.
5. Preservar sequencia contigua por personagem.
6. Falhar com erro tipado quando classe, catalogo ou personagem forem invalidos.
7. Manter o personagem criado mesmo se a concessao falhar por problema de
   inventario, exibindo aviso ao usuario.

## UI E Loadout

O Inventario deve listar todos os itens concedidos. Itens sem perfil de
loadout suportado nao devem exibir botao de equipar nesta fatia.

Itens com perfil ja existente continuam equipaveis:

- `longsword`;
- `dagger`;
- `leather-armor`;
- `round-shield`;
- `longbow`;
- `plate-armor`.

Nenhum item inicial deve ser equipado automaticamente. O usuario continua
responsavel por equipar itens suportados na aba Inventario.

## Gates Da Implementacao

- Specs de catalogo garantindo os novos IDs e a ausencia de perfil para itens
  sem suporte.
- Specs de view garantindo que itens sem perfil nao exibem acao de equipar.
- Specs de concessao cobrindo as quatro classes, `dagger` duplicada do
  `weaver`, classe desconhecida, catalogo ausente e personagem ausente.
- Browser do Codex criando personagem, conferindo kit no Inventario, salvando,
  recarregando e restaurando os itens.
- `qa:vertical-slice`, `qa:ui-reachability`, `docs:audit`,
  `quality:automation`, `quality:gate` e `qa:next-phase-readiness`.

## Fora Do Escopo

- Conceder ouro inicial;
- equipar automaticamente;
- criar save v9 ou migration;
- aplicar efeitos de traco, talentos, passivas ou HP real;
- criar durabilidade mutavel, reparo ou crafting;
- inferir preco individual de itens sem fonte implementada;
- criar perfil de combate para itens sem contrato especifico.
