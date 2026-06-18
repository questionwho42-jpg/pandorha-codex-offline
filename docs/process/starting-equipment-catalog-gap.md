# Gate De Lacunas Do Catalogo Para Equipamento Inicial

## Objetivo

Este documento separa o planejamento de equipamento inicial do gate de ficha v8.
Ele mapeia os kits oficiais contra o catalogo atual e fixa a decisao de nao
conceder equipamento inicial automaticamente ate que o catalogo cubra todos os
itens exigidos ou substituicoes explicitas sejam aprovadas.

Este gate nao altera `docs/system/`, nao cria save v9, nao cria migration, nao
concede itens, nao cria ouro inicial e nao aplica regras de combate, HP real,
durabilidade ou crafting.

## Fontes Revisadas

- Kits oficiais:
  `docs/system/survival/regras-ouro-equipamento-inicial.md`.
- Repeticao economica dos kits:
  `docs/system/survival/regras-economia-quebra-criacao-itens.md`.
- Catalogo implementado atual:
  `src/entities/equipment/model/equipmentCatalog.ts`.
- Entrada de acompanhamento:
  `20260615-future-inventory-starting-equipment`.

## Catalogo Atual Implementado

Equipamentos presentes:

- Espada Longa;
- Adaga;
- Arco Longo;
- Armadura de Couro;
- Armadura de Placas;
- Escudo Redondo.

Consumiveis presentes:

- Corda;
- Tocha;
- Racao;
- Cinto de Pocoes;
- Moedas de Ouro.

Itens parecidos nao contam como cobertura. `Arco Longo` nao substitui
`Arco Curto`, `Armadura de Placas` nao substitui `Cota de Malha`, e qualquer
concessao de item composto como `Kit de Aventureiro` precisa de contrato
proprio.

## Gap Map Oficial

| Kit oficial | Itens exigidos | Cobertura atual | Decisao |
| :--- | :--- | :--- | :--- |
| Vanguarda | Cota de Malha, Espada Longa, Escudo Redondo, Kit de Aventureiro | Espada Longa e Escudo Redondo existem; Cota de Malha e Kit de Aventureiro ausentes. | Bloqueado ate catalogo cobrir todos os itens ou substituicao explicita ser aprovada. |
| Cacador | Armadura de Couro, Arco Curto, Adaga, Kit de Aventureiro | Armadura de Couro e Adaga existem; Arco Curto e Kit de Aventureiro ausentes. | Bloqueado ate catalogo cobrir todos os itens ou substituicao explicita ser aprovada. |
| Tecelao | Cajado, Grimorio, Adaga x2, Kit de Aventureiro | Adaga existe; Cajado, Grimorio e Kit de Aventureiro ausentes. A concessao de Adaga x2 tambem precisa de regra explicita de duas entradas. | Bloqueado ate catalogo cobrir todos os itens e duplicacao de Adaga ser aprovada. |
| Emissario | Rapieira, Armadura Acolchoada de Luxo, Carta de Nobreza | Nenhum item exigido existe no catalogo atual. | Bloqueado ate catalogo cobrir todos os itens ou substituicao explicita ser aprovada. |

## Decisao Fixa

Equipamento inicial nao deve ser concedido nesta rodada.

A futura implementacao deve usar o ledger de inventario existente, pertencente
ao personagem, criando eventos de adicao para os itens aprovados. Ela nao deve
duplicar definicoes de catalogo no save e nao deve persistir capacidade derivada.

## Pre-Requisitos Para Desbloquear

Antes de qualquer codigo de equipamento inicial:

1. Aprovar expansao do catalogo para todos os itens faltantes ou aprovar
   substituicoes item a item.
2. Definir se `Kit de Aventureiro` sera item composto, consumivel empilhavel,
   equipamento unico ou expansao em itens separados.
3. Definir se `Carta de Nobreza` pertence ao catalogo de equipamento,
   documento social, item narrativo ou outro dominio.
4. Definir como registrar `Adaga x2`: duas entradas do mesmo item, item
   composto, ou loadout inicial especifico.
5. Validar slot cost, tipo de equipamento, perfil de combate quando aplicavel,
   durabilidade inicial e fonte de regra para cada item novo.

## Gates Da Futura Implementacao

Uma fase futura de equipamento inicial deve incluir:

- testes de catalogo para cada item novo;
- testes do servico de concessao por classe;
- falhas tipadas para catalogo incompleto, personagem ausente e kit nao
  aprovado;
- roundtrip de save/load usando somente o ledger de inventario existente;
- Browser do Codex criando personagem, aplicando kit aprovado, salvando,
  recarregando e restaurando os itens;
- `qa:ui-reachability`, `qa:vertical-slice`, `docs:audit`,
  `quality:automation`, `quality:gate` e `qa:next-phase-readiness`.

## Fora Do Escopo

- Implementar equipamento inicial;
- expandir catalogo;
- alterar `docs/system/`;
- criar save v9;
- alterar criacao de personagem;
- conceder ouro inicial;
- criar passivas, talentos, efeitos de traco ou HP real;
- assumir substituicoes por itens parecidos.
