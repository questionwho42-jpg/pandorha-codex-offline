# Inventory Readonly Technical Memory

- T25 renders a read-only inventory panel from fixed T23 catalog data.
- The feature consumes `InventoryCapacityResult` from `shared/inventory` and does not recalculate capacity rules.
- Visible text is pt-BR; technical ids and files stay in English.
- The first UI is session-only and does not add persistence, item editing, equipment effects, runes, or combat integration.
- The ownership and save v6 gate is approved. This feature remains read-only until the ledger core and persistence phases are complete.
