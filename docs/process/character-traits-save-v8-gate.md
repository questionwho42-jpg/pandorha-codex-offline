# Gate De Tracos Persistidos E Save V8

## Objetivo

Este gate aprova a proxima evolucao minima da ficha: persistir as 3 escolhas
textuais de tracos de ancestralidade feitas na criacao do personagem. O save v8
deve adicionar somente `characterTraitSelections`.

Este documento nao altera regras soberanas em `docs/system/`. Ele fixa apenas o
contrato tecnico necessario para implementar a primeira fatia persistida das
entradas do `change-inbox`
`20260505-081342-t13a-character-ancestry-trait-selection` e
`20260503-221203-t12-ancestry-traits`, sem antecipar efeitos mecanicos,
Decorator, HP real, talentos ou equipamento inicial.

## Contrato Persistido

O novo registro persistido deve ter este formato:

```ts
interface CharacterTraitSelectionRecord {
	id: string;
	characterId: string;
	sequence: 1 | 2 | 3;
	traitId: string;
	createdAt: string;
}
```

Invariantes obrigatorias:

- cada personagem criado pela UI deve possuir exatamente 3 registros;
- `sequence` e contigua por personagem e deve ser `1`, `2` e `3`;
- `traitId` nao pode se repetir no mesmo personagem;
- o pertencimento do traco a ancestralidade selecionada e validado somente no
  momento da criacao;
- depois de criado, o registro preserva a escolha textual mesmo que o catalogo
  futuro mude;
- a listagem pode resolver label e descricao pelo catalogo atual, usando
  `traitId` como fallback quando o catalogo nao possuir mais o item;
- nenhum efeito mecanico de traco e aplicado nesta fase.

## Save V8

`CURRENT_SAVE_VERSION` deve subir para `8`. O snapshot v8 adiciona somente:

```ts
characterTraitSelections: CharacterTraitSelectionRecord[];
```

Regras de migracao:

- saves v1-v7 migram deterministicamente para v8 com
  `characterTraitSelections: []`;
- saves futuros continuam rejeitados;
- snapshots corrompidos continuam rejeitados via Zod e Result Pattern;
- personagens antigos carregados sem tracos permanecem validos, mas a UI deve
  deixar claro quando nao houver selecao persistida;
- a persistencia deve ocorrer na mesma transacao do snapshot, sem duplicar
  dados de catalogo no save.

## UI Aprovada

A tela `Personagens` deve continuar exigindo exatamente 3 tracos da
ancestralidade selecionada antes de criar personagem.

A listagem de personagens deve exibir as 3 escolhas persistidas quando elas
existirem. O texto visivel deve usar pt-BR e diferenciar:

- tracos escolhidos e restaurados do save;
- personagem antigo sem `characterTraitSelections` por migracao v1-v7;
- fallback para `traitId` quando o catalogo atual nao resolver label.

## Fora Do Escopo

- HP real persistido, dano real, estados oficiais ou ficha completa;
- talentos, passivas, bonus, modificadores ou Decorator de tracos;
- equipamento inicial, ouro inicial, kits de classe ou kits de antecedente;
- ficha editavel, troca de tracos apos criacao ou retreino;
- nova regra soberana em `docs/system/`;
- save v9, novo ledger generico de ficha ou novas dependencias.

## Gap Map De Equipamento Inicial

Equipamento inicial permanece bloqueado nesta rodada. Os kits oficiais citam
itens que ainda nao estao todos cobertos pelo catalogo atual, e substituicoes
por itens parecidos nao estao aprovadas.

| Kit oficial | Itens exigidos | Decisao |
| :--- | :--- | :--- |
| Vanguarda | Cota de Malha, Espada Longa, Escudo Redondo, Kit de Aventureiro | Bloqueado ate catalogo cobrir todos os itens ou substituicao explicita ser aprovada. |
| Cacador | Armadura de Couro, Arco Curto, Adaga, Kit de Aventureiro | Bloqueado ate catalogo cobrir todos os itens ou substituicao explicita ser aprovada. |
| Tecelao | Cajado, Grimorio, Adaga x2, Kit de Aventureiro | Bloqueado ate catalogo cobrir todos os itens ou substituicao explicita ser aprovada. |
| Emissario | Rapieira, Armadura Acolchoada de Luxo, Carta de Nobreza | Bloqueado ate catalogo cobrir todos os itens ou substituicao explicita ser aprovada. |

O gate futuro de equipamento inicial deve partir da entrada
`20260615-future-inventory-starting-equipment`, revisar catalogo oficial,
ownership por ledger e regras soberanas aplicaveis antes de qualquer concessao
automatica.

## Gates Obrigatorios

Antes do fechamento da implementacao de codigo:

- testes red/green para criacao com 3 tracos validos, duplicata, traco de outra
  ancestralidade, migracao v7 vazia, roundtrip v8 e rejeicao de versao futura;
- cobertura de dominio/servicos tocados em 100%;
- `npm.cmd run qa:vertical-slice`;
- `npm.cmd run qa:ui-reachability`;
- `npm.cmd run docs:audit`;
- Browser do Codex com criar personagem usando 3 tracos, confirmar listagem,
  salvar, recarregar realmente, carregar save v8 e confirmar os mesmos tracos
  restaurados;
- `npm.cmd run qa:next-phase-readiness` em `main` limpa, permitindo apenas
  `output/`.
