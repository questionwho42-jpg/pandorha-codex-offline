# RPC Scaling Roadmap

- T33B attached these contracts to a real Web Worker that initializes SQLite WASM and OPFS.
- T33C.2 added the real browser transport bridge. A later task can add cancellation, worker restart handling, and telemetry after the first save/load UI proves stable.
- T33C should map Character and WorldState records into the generic snapshot contract, then validate loaded data back through entity schemas.
- Later work can add progress events, cancellation, batching, audit logs, and multiple save slots after the first save/load UI proves stable.
- Keep future snapshot additions version-gated so RPC never accepts a partially upgraded save shape.
