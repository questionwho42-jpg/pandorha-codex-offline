# Inventory Management Scaling Roadmap

- Keep character selection session-local until a separate UX contract approves persistence.
- Loadout persistence is now approved in save v7; keep combat integration, equipment effects, durability, crafting, and potion-belt enforcement behind separate gates.
- Add command batching through Worker RPC only when inventory mutations move from session state to direct database commands.
