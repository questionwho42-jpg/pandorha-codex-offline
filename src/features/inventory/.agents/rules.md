# 🎒 LOCAL RULES: INVENTORY MODULE

## 1. Nomenclatura e Estrutura
- **Serviços:** `InventoryService.ts`, `ItemFactory.ts` (Builder).
- **Lógica:** `WeightCalculator.ts`, `DurabilityManager.ts`.
- **Componentes (Svelte):** `InventoryGrid.svelte`, `EquipmentSlot.svelte`, `ItemTooltip.svelte`.

## 2. Pub/Sub & Eventos
- **Escuta (Listeners):**
  - `ITEM_PICKUP`: Valida espaço e adiciona ao banco.
  - `EQUIP_ITEM`: Atualiza modificadores do ator.
- **Emite (Emitters):**
  - `WEIGHT_CHANGED`: Dispara atualização de condições (Lento/Imobilizado).
  - `ITEM_BROKEN`: Quando a durabilidade atinge 0.
  - `INVENTORY_FULL`: Notificação visual para o usuário.

## 3. Referências Obrigatórias ao GDD
- **Arsenal:** [04-arsenal-e-economia.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/survival/04-arsenal-e-economia.md)
- **Logística:** [regras-peso-carga.md](file:///c:/Users/Pichau/Desktop/pandorha%20sistema%2028-04/docs/system/survival/regras-peso-carga.md)

## 4. Restrições Técnicas
- **Atomicidade:** Movimentação de itens entre slots deve ser atômica no SQLite para evitar duplicação.
- **Peso:** O cálculo de carga deve ser atualizado instantaneamente via Svelte Runes (`$derived`).
- **Lógica de Poções:** Implementar check: Se `item.type === 'potion'` e não estiver em um container `item.parent === 'potion_belt'`, disparar evento `ITEM_BROKEN`.
