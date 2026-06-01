# Combat Encounter Scaling Roadmap

## Next Steps

- T22B exposed this service in the browser with a minimal fixed combat panel and log.
- T22C added a static training target catalog for visible combat variation without creating official monsters.
- T22D connects session characters as attacker identity only, without applying full sheet math.
- T22E adds deterministic turn state and action-point spending without rolling initiative.
- T22F shows derived character stats in combat as display-only context.
- T22G connects the training damage matrix to the selected character's Matriz Fisica while keeping weapon and dice values fixed.
- T22H makes the target turn explicit by logging that the target holds position, without adding enemy AI.
- T22I adds a clear defeated outcome state and keeps reset available.
- T85.1 adds a domain hook for real weapon attack profiles without wiring UI, loadout persistence, or durability wear.
- The next combat step should document the user flow before the final vertical-slice review.
- Add loadout/equipped weapon selection before replacing the browser's fixed training weapon profile.
- Add real initiative only after equipment selection and fixed turn order remain stable in browser tests.
- Add typed combat commands for attacks, reactions, spell casts, and conditions.
- Persist combat ledgers later through Worker/SQLite after the in-memory model is stable.
- Add Decorator-based modifiers for conditions, talents, weapon properties, and tactical forge effects.

## Boundaries

- This feature should not own dice, damage, or universal-test math. Those stay in `shared`.
- T85.1 still avoids persistence, Worker, grid, dynamic monsters, inventory mutation, magic, full equipment math, durability wear, and rolled initiative.
