# Inventory Technical Memory

- Inventory ownership is represented by an append-only per-character event ledger.
- Catalog definitions stay in `entities/equipment`; inventory events reference catalog ids.
- `InventoryLedgerReplayService` validates contiguous sequence, stable entry identity, and quantity invariants before exposing current entries.
- Derived capacity and catalog labels are outside this entity.
