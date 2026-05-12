# Combat Encounter Scaling Roadmap

## Next Steps

- T22B exposed this service in the browser with a minimal fixed combat panel and log.
- T22C added a static training target catalog for visible combat variation without creating official monsters.
- T22D connects session characters as attacker identity only, without applying full sheet math.
- T22E adds deterministic turn state and action-point spending without rolling initiative.
- T22F shows derived character stats in combat as display-only context.
- The next combat step should connect the training damage profile or add a simple enemy action deliberately.
- Add real initiative only after the fixed turn order remains stable in browser tests.
- Add typed combat commands for attacks, reactions, spell casts, and conditions.
- Persist combat ledgers later through Worker/SQLite after the in-memory model is stable.
- Add Decorator-based modifiers for conditions, talents, weapon properties, and tactical forge effects.

## Boundaries

- This feature should not own dice, damage, or universal-test math. Those stay in `shared`.
- T22F still avoids persistence, Worker, grid, dynamic monsters, inventory, magic, equipment math, and rolled initiative.
