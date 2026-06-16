# Inventory Management Scaling Roadmap

- Keep character selection session-local until a separate UX contract approves persistence.
- Loadout persistence is approved in save v7 and Combat now reads the persisted loadout through the app boundary; keep equipment effects, durability, crafting, consumable use in combat, and potion-belt enforcement behind separate gates.
- Add command batching through Worker RPC only when inventory mutations move from session state to direct database commands.
