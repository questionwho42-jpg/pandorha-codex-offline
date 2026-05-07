# Combat Encounter Scaling Roadmap

## Next Steps

- T22B exposed this service in the browser with a minimal fixed combat panel and log.
- T22C added a static training target catalog for visible combat variation without creating official monsters.
- T22D connects session characters as attacker identity only, without applying full sheet math.
- The next combat step should add initiative/turn state or connect derived character stats deliberately.
- Add initiative and turn state after the single-attack flow is visible and testable.
- Add typed combat commands for attacks, reactions, spell casts, and conditions.
- Persist combat ledgers later through Worker/SQLite after the in-memory model is stable.
- Add Decorator-based modifiers for conditions, talents, weapon properties, and tactical forge effects.

## Boundaries

- This feature should not own dice, damage, or universal-test math. Those stay in `shared`.
- T22B still avoids persistence, Worker, grid, dynamic monsters, inventory, magic, and initiative.
