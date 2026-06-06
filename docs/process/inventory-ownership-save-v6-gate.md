# Gate De Propriedade Do Inventario E Save V6

Status: aprovado para implementacao modular.

## Decisao

O primeiro inventario persistido pertence exclusivamente a personagens. O
catalogo de equipamentos e consumiveis continua sendo a fonte imutavel das
definicoes; o save registra somente um ledger append-only de eventos que
referenciam os ids do catalogo.

O save v6 adicionara exclusivamente `inventoryEvents`. Nao inclui loadout
persistente, HP real, tracos, historico social adicional, durabilidade, crafting
ou estado derivado.

## Contrato Aprovado

```typescript
interface InventoryEventRecord {
  id: string;
  characterId: string;
  sequence: number;
  type:
    | "inventory-item-added"
    | "inventory-quantity-set"
    | "inventory-item-removed";
  entryId: string;
  catalogKind: "equipment" | "consumable";
  catalogItemId: string;
  quantity: number;
  createdAt: string;
}
```

`entryId` identifica uma entrada carregada. Equipamentos usam uma entrada unica;
consumiveis podem usar varias entradas para representar pilhas completas e
parciais sem duplicar a definicao do catalogo.

## Invariantes

- Equipamento carregado possui quantidade `1`.
- Remocao registra quantidade `0`.
- Consumiveis respeitam `maxQuantityPerStack` do catalogo.
- Uma pilha cheia causa a criacao de uma nova entrada.
- O replay rejeita sequencias duplicadas, remocao inexistente, troca de catalogo
  de uma entrada e quantidades incompativeis.
- O replay e a unica fonte do inventario atual.
- Slots usados, limite, estado de carga e penalidade de movimento sao derivados
  e nunca persistidos.
- Sobrecarga nao bloqueia adicao; ela deriva os estados `slowed` ou
  `immobilized` conforme as regras soberanas existentes.
- Saves v1-v5 migram para v6 com `inventoryEvents: []`.

## Limites De Implementacao

- A entidade de inventario nao importa Character, Equipment, Combate ou UI.
- A feature de gerenciamento coordena personagem, catalogo e capacidade.
- A primeira UI permite carregar, remover e consumir itens.
- Equipar, desequipar, loadout persistente, cinto de pocoes, desgaste,
  durabilidade e equipamento inicial exigem gates separados.
- Nenhuma regra nova sera inferida ou promovida para `docs/system/`.

## Sequencia De Entrega

1. Implementar entidade, repository fake, replay e servico de gerenciamento por
   TDD, sem UI ou save.
2. Implementar save v6 e roundtrip transacional do ledger.
3. Substituir a tela read-only por gerenciamento por personagem.
4. Validar save, recarga real, load e alcance completo no Browser do Codex.

## Gates Obrigatorios

- 100% de cobertura para servicos e logica de dominio.
- Validacao Zod de toda entrada desconhecida.
- Falhas tipadas com `Result`; nenhuma excecao de dominio.
- Testes de migracao v1-v5 para v6 e corrupcao do ledger.
- `qa:ui-reachability` e Browser do Codex para a entrega visual.
- `qa:next-phase-readiness` antes de iniciar loadout persistente.
