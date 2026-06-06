# InventoryCapacityService Scaling Roadmap

- Keep this service pure until a real integration requires adapters.
- Add fakes in a testing folder only when dependencies appear.
- Promote repeated patterns to shared helpers only after duplication is proven.
- T25 should map the T23 equipment catalog into generic slot items for a read-only UI.
- Future trait, talent, companion, and vehicle bonuses should be resolved before this service as `slotBonusTotal`, preferably through decorators.
- Persisted inventory and event sourcing should store item events, not derived totals such as `usedSlots` or `state`.
- The approved v6 sequence is ownership ledger, save roundtrip, editable UI, and only then a separate persisted-loadout gate.
