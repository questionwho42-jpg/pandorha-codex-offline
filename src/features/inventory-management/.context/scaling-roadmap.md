# Inventory Management Scaling Roadmap

- Keep character selection session-local until a separate UX contract approves persistence.
- Keep loadout persistence, equipment effects, durability, crafting, and potion-belt enforcement behind separate gates.
- Add command batching through Worker RPC only when inventory mutations move from session state to direct database commands.
