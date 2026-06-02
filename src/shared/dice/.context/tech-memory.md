# Dice Technical Memory

## 2026-05-05 - T18A DiceService

- Created `shared/dice` as the central dice foundation for resolution, damage, magic, combat, and future game systems.
- `DiceService` receives `DiceRng`, `DiceRollIdProvider`, and `DiceClock` by injection so tests stay deterministic and gameplay code does not call random APIs directly.
- Every roll returns `Result<DiceRollResult, DiceFailure>` and includes an in-memory `auditEntry` with `rollId`, `reason`, `sides`, `naturalRoll`, and `createdAt`.
- Persistent audit logging in SQLite/OPFS is intentionally deferred; T18A only creates the validated core contract.
