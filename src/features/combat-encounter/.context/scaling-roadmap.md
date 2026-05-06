# Combat Encounter Scaling Roadmap

## Next Steps

- T22B should expose this service in the browser with a minimal combat panel and log.
- Add initiative and turn state after the single-attack flow is visible and testable.
- Add typed combat commands for attacks, reactions, spell casts, and conditions.
- Persist combat ledgers later through Worker/SQLite after the in-memory model is stable.
- Add Decorator-based modifiers for conditions, talents, weapon properties, and tactical forge effects.

## Boundaries

- This feature should not own dice, damage, or universal-test math. Those stay in `shared`.
- UI and Browser Use validation begin in T22B, not T22A.
