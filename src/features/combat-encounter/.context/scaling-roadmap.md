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
- T87 wires a local equipped-weapon selector into the combat tab for session characters, defaulting to Espada Longa while Aria remains fixed.
- T88 rolls supported weapon damage dice through `DiceService` and records an auditable weapon-damage event before the damage pipeline.
- T89 feeds fixed training-target defenses into the damage pipeline, covering RD, physical resistance, and physical immunity without monster data or vulnerability dice.
- T91 displays equipped armor/shield defense for session characters without applying it to incoming attacks.
- Add vulnerability `+1d6`, proficiency, and durability wear only after the audited weapon roll and target-defense contracts remain stable.
- Add enemy attacks against session characters before allowing equipped defense to affect CA or damage outcomes.
- Add real initiative only after equipment selection and fixed turn order remain stable in browser tests.
- Add typed combat commands for attacks, reactions, spell casts, and conditions.
- Persist combat ledgers later through Worker/SQLite after the in-memory model is stable.
- Add Decorator-based modifiers for conditions, talents, weapon properties, and tactical forge effects.

## Boundaries

- This feature should not own dice, damage, or universal-test math. Those stay in `shared`.
- T88 still avoids persistence, Worker, grid, dynamic monsters, inventory mutation, magic, full equipment math, durability wear, and rolled initiative.
- Combat may consume equipment snapshots/profiles through props or lower-layer contracts, but equipment rules should remain in `entities/equipment`.
- Equipped defense display must remain read-only until a save-version phase and official incoming-attack contract are approved.
