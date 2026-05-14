# RPC Scaling Roadmap

- T33B should attach these contracts to a real Web Worker that initializes SQLite WASM and OPFS.
- T33C should map Character and WorldState records into the generic snapshot contract, then validate loaded data back through entity schemas.
- Later work can add progress events, cancellation, batching, audit logs, and multiple save slots after the first save/load UI proves stable.
