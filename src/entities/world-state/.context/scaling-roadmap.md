# WorldState Scaling Roadmap

- Add the Drizzle migration and Worker/OPFS adapter in T33B, then route save/load through RPC instead of direct repository calls from UI.
- Introduce event sourcing for world changes once clocks, factions, and quests start mutating flags.
- Keep namespaces narrow and documented before adding broad wildcard queries.
- Consider an audit ledger table for flag writes after the first save/load slice is stable.
