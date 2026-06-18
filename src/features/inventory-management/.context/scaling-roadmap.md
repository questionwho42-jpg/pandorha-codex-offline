# Inventory Management Scaling Roadmap

- Keep character selection session-local until a separate UX contract approves persistence.
- Loadout persistence is approved in save v7 and Combat now reads the persisted loadout through the app boundary.
- Potion-belt quick access consumes `potion-belt-stack` through the existing ledger; keep healing, HP real changes, item effects, durability, crafting, and official action economy behind separate gates.
- Starting-kit items without structured profiles should stay carryable only until a dedicated equipment-profile gate approves equip/combat support.
- Starting equipment grants should remain append-only inventory events; do not add backfill, auto-equip, or save-version changes without a separate gate.
- Add command batching through Worker RPC only when inventory mutations move from session state to direct database commands.
