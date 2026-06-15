# Gate De Loadout Persistente E Save V7

## Objetivo

Este gate aprova a proxima evolucao do inventario editavel: persistir o
loadout equipado por personagem sem duplicar a posse dos itens. O save v7 deve
adicionar somente o ledger de eventos de loadout; inventario carregado,
capacidade, perfis de ataque, defesa, HP, durabilidade e efeitos de combate
continuam derivados ou fora do escopo.

Este documento nao altera regras soberanas em `docs/system/`. Ele fixa apenas o
contrato tecnico necessario para implementar as entradas do `change-inbox`
`20260615-future-inventory-persistent-loadout` e
`20260615-future-inventory-equip-actions`.

## Contrato Persistido

O novo registro persistido deve ter este formato:

```ts
interface EquipmentLoadoutEventRecord {
  id: string;
  characterId: string;
  sequence: number;
  type: "equipment-loadout-slot-equipped" | "equipment-loadout-slot-cleared";
  slot: "mainHand" | "offHand" | "armor";
  inventoryEntryId: string | null;
  createdAt: string;
}
```

Invariantes obrigatorias:

- `equipment-loadout-slot-equipped` exige `inventoryEntryId`.
- `equipment-loadout-slot-cleared` exige `inventoryEntryId: null`.
- `sequence` e contigua por personagem, iniciando em 1.
- O estado atual e o ultimo evento valido de cada slot por personagem.
- O ledger referencia `inventoryEntryId`; ele nao duplica `catalogItemId`,
  rotulo, capacidade, perfis de combate, HP ou durabilidade.
- `mainHand` aceita somente equipamento de catalogo `weapon`.
- `offHand` aceita somente equipamento de catalogo `shield`.
- `armor` aceita somente equipamento de catalogo `armor`.
- Conflitos de maos, como arma de duas maos com escudo, falham sem limpar
  slots automaticamente.

## Save V7

`CURRENT_SAVE_VERSION` deve subir para `7`. A migracao v6 -> v7 deve ser
deterministica e adicionar `equipmentLoadoutEvents: []`. As migracoes v1-v5
devem continuar encadeando ate a versao atual.

Persistencia SQLite:

- criar tabela `equipment_loadout_events`;
- salvar `equipmentLoadoutEvents` na mesma transacao do snapshot;
- carregar eventos ordenados por `characterId` e `sequence`;
- expor contagem em `SaveSessionResult` e `SaveSnapshotResult`;
- rejeitar snapshots corrompidos via Zod, sem `throw`.

## UI Aprovada

A aba `Inventario` deve exibir uma secao `Equipado` com:

- `Arma`;
- `Escudo`;
- `Armadura`.

Itens de equipamento carregados devem expor a acao aplicavel:

- arma: `Equipar arma`;
- escudo: `Equipar escudo`;
- armadura: `Vestir armadura`;
- item equipado: `Desequipar`.

Remover item equipado deve ser bloqueado com feedback visivel
`Desequipe antes de remover`. O bloqueio tambem deve existir no servico, para
impedir bypass da UI.

## Fora Do Escopo

- integrar loadout persistente ao combate;
- quick slots, cinto de pocoes ou consumiveis equipados;
- durabilidade mutavel ou desgaste;
- loadout inicial por classe, antecedente ou kit;
- HP real persistido, dano real ou estados oficiais;
- qualquer promocao inferida para `docs/system/`.

## Gates Obrigatorios

Antes do fechamento:

- testes red/green do replay e do servico de coordenacao;
- cobertura de dominio/servicos em 100%;
- `npm.cmd run qa:ui-reachability`;
- `npm.cmd run docs:audit`;
- Browser do Codex com criar personagem, carregar equipamentos, equipar,
  substituir slot, bloquear remocao equipada, desequipar, salvar, recarregar e
  carregar save v7;
- `npm.cmd run qa:next-phase-readiness` em `main` limpa, permitindo apenas
  `output/`.
