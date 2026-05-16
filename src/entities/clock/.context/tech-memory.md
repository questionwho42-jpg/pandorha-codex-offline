# Clock Technical Memory

- T34A creates the first structured clock entity without UI, migration, Worker RPC, or SQLite adapter.
- `ClockService` is pure and repository-driven. It creates clocks at `0` slices, advances them deterministically, and marks completion only at the exact maximum.
- Overflow is rejected before writes so callers cannot silently exceed a clock limit.
- `clockSelectSchema` enforces `currentSlices <= maxSlices`, keeping corrupted repository data out of the domain boundary.
- All fallible operations return `Result`; the initial fake repository is the only adapter in T34A.
- T34B adds `DrizzleClockRepository` with upsert semantics so the same repository call persists both newly created clocks and later progress updates.
- `clocks` is now part of the versioned SQLite migration chain via `0002_true_cable`.
