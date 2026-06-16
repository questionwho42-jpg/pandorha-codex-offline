# Inventory Management Technical Memory

- `InventoryManagementService` coordinates Character lookup, Equipment catalog lookup, inventory ledger replay, and capacity derivation.
- Id and clock providers are injected so event creation stays deterministic in tests.
- Consumables fill partial stacks before creating new entries.
- `InventoryManagementPanel.svelte` exposes the approved add, increment, consume, remove, equip, and unequip commands without duplicating domain rules.
- The app session owns the in-memory ledger and injects the same character repository used by character creation.
- Save/load transports `inventoryEvents` and `equipmentLoadoutEvents`; the panel refreshes derived entries, equipped slots, and capacity through `InventoryManagementService`.
- 2026-06-16: removing an equipped entry is blocked in the service with `INVENTORY_ENTRY_EQUIPPED`; the UI also disables the remove action with `Desequipe antes de remover`.
- 2026-06-16: loadout mutations append to a separate equipment ledger, so carrying an item and equipping an item stay different events.
