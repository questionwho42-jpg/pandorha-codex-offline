# Gate De Durabilidade De Equipamento E Save V9

## Objetivo

Este gate aprova a primeira fatia persistida de durabilidade de equipamento:
registrar manualmente a condicao atual de cada equipamento carregado por
personagem, exibir essa condicao no Inventario e impedir o uso de item quebrado
no loadout/Combate.

Este documento nao altera regras soberanas em `docs/system/`. Ele fixa apenas o
contrato tecnico necessario para implementar a entrada do `change-inbox`
`20260615-future-inventory-durability`.

## Fontes Revisadas

- Inventario por ledger: `docs/process/inventory-ownership-save-v6-gate.md`.
- Loadout persistente: `docs/process/equipment-loadout-save-v7-gate.md`.
- Combate com loadout persistido:
  `docs/process/combat-persistent-loadout-gate.md`.
- Equipamento inicial por ledger:
  `docs/process/starting-equipment-ledger-grant-gate.md`.
- Arsenal e economia: `docs/system/survival/04-arsenal-e-economia.md`.
- Reparo e criacao: `docs/system/survival/09-guia-do-artifice-e-criacao.md`.

## Contrato Persistido

```ts
type EquipmentDurabilityCondition = "intact" | "damaged" | "broken";

interface EquipmentDurabilityEventRecord {
  id: string;
  characterId: string;
  sequence: number;
  inventoryEntryId: string;
  type: "equipment-durability-condition-set";
  condition: EquipmentDurabilityCondition;
  createdAt: string;
}
```

O novo ledger pertence ao personagem e referencia uma entrada de inventario ja
carregada. Ele nao duplica `catalogItemId`, rotulo, slots, capacidade, perfil de
combate, HP, valor, custo de reparo ou estado derivado.

## Invariantes

- `sequence` e contigua por personagem, iniciando em 1.
- Eventos duplicados, sequencias com lacuna e eventos malformados falham por
  erro tipado.
- `inventoryEntryId` deve apontar para uma entrada atual de equipamento do mesmo
  personagem.
- Consumiveis nunca aceitam evento de durabilidade.
- Ledger vazio resolve a condicao derivada `intact`.
- O estado atual e o ultimo evento valido por `inventoryEntryId`.
- `damaged` e visivel na UI, mas nao aplica penalidade mecanica nesta fatia.
- `broken` bloqueia equipar e impede uso pelo Combate enquanto o item continuar
  quebrado.
- Reparo manual nesta fatia registra apenas nova condicao `intact`.

## Save V9

`CURRENT_SAVE_VERSION` deve subir para `9`. O save v9 adiciona somente
`equipmentDurabilityEvents`.

Persistencia SQLite:

- criar tabela `equipment_durability_events`;
- salvar `equipmentDurabilityEvents` na mesma transacao do snapshot;
- carregar eventos ordenados por `characterId`, `sequence` e ordem de insercao
  estavel quando necessario;
- expor contagem em `SaveSessionResult` e `SaveSnapshotResult`;
- validar snapshots por Zod e retornar falhas tipadas para corrupcao;
- migrar saves v1-v8 para v9 com `equipmentDurabilityEvents: []`.

Nenhuma outra parte do snapshot deve mudar por causa deste gate.

## UI Aprovada

A aba `Inventario` deve exibir a condicao de cada equipamento carregado:

- `Integro`;
- `Danificado`;
- `Quebrado`.

Equipamentos devem expor acoes manuais em pt-BR:

- `Marcar danificado`;
- `Marcar quebrado`;
- `Reparar`.

Consumiveis nao exibem controles de durabilidade. Item quebrado nao pode ser
equipado e deve mostrar copy clara orientando reparo ou troca no Inventario.

## Combate Aprovado

A aba `Combate` continua uma superficie de treino. Para personagens da sessao,
ela deve ler o loadout persistido por meio da ponte em `app` e recusar o uso de
arma, escudo ou armadura quebrada.

Quando houver item quebrado no loadout necessario para o fluxo, o usuario deve
receber orientacao para ajustar o Inventario. O Combate nao deve importar
`inventory-management` nem persistir durabilidade propria.

## Fora Do Escopo

- desgaste automatico em combate;
- dano por 1 natural, efeito de inimigo ou armadilha que degrade item;
- aplicar o modificador `-1` de item danificado;
- reparo por Acampamento;
- custo em ouro, material, crafting ou teste de reparo;
- durabilidade numerica atual/maxima mutavel;
- HP real, estados oficiais ou dano real;
- save v10 ou novo ledger alem de `equipmentDurabilityEvents`;
- promocao inferida para `docs/system/`.

## Gates Obrigatorios

Antes do fechamento da implementacao:

- testes red/green do replay de durabilidade;
- specs do `InventoryManagementService` para marcar `damaged`, `broken` e
  `intact`, rejeitar consumivel e rejeitar entrada inexistente;
- specs do loadout/Combate para bloquear item `broken`;
- testes de migracao v1-v8 para v9 e roundtrip v9;
- `npm.cmd run qa:vertical-slice`;
- `npm.cmd run qa:ui-reachability`;
- Browser do Codex com criar personagem, receber kit inicial, marcar arma como
  danificada, quebrada e reparada, bloquear equipar quebrada, bloquear Combate
  com item equipado quebrado, salvar, recarregar e restaurar a condicao;
- `npm.cmd run qa:next-phase-readiness` em `main` limpa.
