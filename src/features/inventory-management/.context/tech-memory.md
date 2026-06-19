# Inventory Management Technical Memory

- `InventoryManagementService` coordinates Character lookup, Equipment catalog lookup, inventory ledger replay, and capacity derivation.
- Id and clock providers are injected so event creation stays deterministic in tests.
- Consumables fill partial stacks before creating new entries.
- `InventoryManagementPanel.svelte` exposes the approved add, increment, consume, remove, equip, and unequip commands without duplicating domain rules.
- The app session owns the in-memory ledger and injects the same character repository used by character creation.
- Save/load transports `inventoryEvents` and `equipmentLoadoutEvents`; the panel refreshes derived entries, equipped slots, and capacity through `InventoryManagementService`.
- 2026-06-16: removing an equipped entry is blocked in the service with `INVENTORY_ENTRY_EQUIPPED`; the UI also disables the remove action with `Desequipe antes de remover`.
- 2026-06-16: loadout mutations append to a separate equipment ledger, so carrying an item and equipping an item stay different events.
- 2026-06-16: Combat consumes the derived loadout through an app-level resolver; inventory remains the owner of `inventoryEvents` and `equipmentLoadoutEvents`.
- 2026-06-17: `potion-belt-stack` is displayed as `Cinto de Poções` in the inventory view and consumed by Combat through the existing `consumeConsumable` command.
- 2026-06-17: the inventory ledger remains the single owner of potion-belt quantity; no save v8, new ledger, healing, HP mutation, or item-effect state was added.
- 2026-06-18: equip actions are gated by `isOfficialLoadoutSupportedEquipmentId`, not by equipment kind alone. Starting-kit records without profiles remain carryable/removable but do not expose equip controls.
- 2026-06-18: starting equipment grants call `addEquipment`/`addConsumable` through app-level orchestration; inventory remains the owner of all resulting `inventoryEvents`.
- 2026-06-18: durability mutations append `equipmentDurabilityEvents` through `setEquipmentCondition`; equipment entries default to `intact`, consumables reject durability, and `broken` entries return `INVENTORY_DURABILITY_BROKEN` when equip is attempted.
