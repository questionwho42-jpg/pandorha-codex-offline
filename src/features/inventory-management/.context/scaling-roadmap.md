# Inventory Management Scaling Roadmap

- Connect the service to save v6 before exposing editable UI.
- Keep loadout persistence, equipment effects, durability, crafting, and potion-belt enforcement behind separate gates.
- Add command batching through Worker RPC only when inventory mutations move from session state to direct database commands.
