# Technical Memory

## T71 Social Retaliation Clock Advance

- `SocialRetaliationClockService` is a feature-level orchestrator over a clock progress port. It does not import repositories, SQLite, Worker RPC, save/load, or social-standing internals.
- Retaliation advancement is explicit and caller-owned through `triggerId`; repeated trigger ids return a typed success without calling the clock port.
- Only active clocks with `source: "social-pressure"` are eligible. Camp clocks and completed retaliation clocks are ignored.
- Overflow is prevalidated before writes so an impossible trigger does not partially advance known target clocks.
- Failures use typed `Result` payloads; no domain failure throws.

## Validation Notes

- Unit tests use a fake clock port and cover success, idempotency, no-target triggers, completion, overflow, wrapped port failure, and malformed input.
- `vitest.config.mjs` includes the service in 100% coverage gates.
