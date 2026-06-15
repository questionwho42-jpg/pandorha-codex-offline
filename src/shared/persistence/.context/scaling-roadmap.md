# Persistence Scaling Roadmap

- T33C should add save/load commands on top of the initialized database instead of adding UI directly.
- Replace the custom migration ledger with Drizzle's migrator only if it can run cleanly in the browser Worker with embedded migrations.
- Add RPC audit logs, progress events, cancellation, and corruption recovery once the first user-visible save/load path is stable.
- Keep OPFS access isolated to infrastructure adapters so domain tests stay deterministic.
- Preserve inventory event ordering by character and sequence if snapshot persistence is later split into scoped transactions.
