# Inventory Management Technical Memory

- `InventoryManagementService` coordinates Character lookup, Equipment catalog lookup, inventory ledger replay, and capacity derivation.
- Id and clock providers are injected so event creation stays deterministic in tests.
- Consumables fill partial stacks before creating new entries.
- UI and save transport remain outside the core phase.
