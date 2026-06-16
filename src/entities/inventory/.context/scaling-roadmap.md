# Inventory Scaling Roadmap

- The approved inventory ledger is persisted in save v6 and consumed by editable UI.
- Add SQLite repository adapters only when direct inventory commands require Worker-side persistence.
- Loadout persistence now lives in a separate save v7 equipment ledger; keep durability, crafting, potion-belt enforcement, and initial equipment behind separate gates.
