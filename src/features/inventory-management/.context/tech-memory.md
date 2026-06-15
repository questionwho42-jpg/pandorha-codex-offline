# Inventory Management Technical Memory

- `InventoryManagementService` coordinates Character lookup, Equipment catalog lookup, inventory ledger replay, and capacity derivation.
- Id and clock providers are injected so event creation stays deterministic in tests.
- Consumables fill partial stacks before creating new entries.
- `InventoryManagementPanel.svelte` exposes the approved add, increment, consume, and remove commands without duplicating domain rules.
- The app session owns the in-memory ledger and injects the same character repository used by character creation.
- Save/load transports only `inventoryEvents`; the panel refreshes derived entries and capacity through `InventoryManagementService`.
