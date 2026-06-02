# RPC Technical Memory

- T33A creates the save/load RPC contract only. It does not initialize SQLite, OPFS, Drizzle, migrations, or a real Worker.
- Requests are discriminated by `type`: `INIT_DATABASE`, `SAVE_GAME_SNAPSHOT`, and `LOAD_GAME_SNAPSHOT`.
- Save/load currently targets only the literal `primary` save id to avoid introducing multi-slot behavior early.
- RPC DTOs accept only JSON-serializable values. Classes, functions, Date, Map, Set, and other object instances are rejected at schema boundaries.
- `FakeWorkerBridge` validates requests and queued responses, mirrors message ids, and returns typed `Result` failures.
- `BrowserWorkerBridge` owns real browser transport concerns: pending requests keyed by `messageId`, 30s init timeout, 5s standard timeout, response validation, and typed mismatch failures.
