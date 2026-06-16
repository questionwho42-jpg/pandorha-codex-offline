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
- T92 lets the training target resolve a minimal incoming attack against a session character's equipped CA, without applying damage, HP mutation, official monsters, AI, save, or durability.
- T94-T96 calculate incoming training damage through the existing damage pipeline and reduce only a local, non-persistent `HP de treino` ledger for session characters.
- T97 adds a terminal state for local defender `HP de treino`: after 0, the same encounter requires reset before calculating another received training damage.
- T99 adds a pure `realDamageReceived` event contract for future HP replay, still without UI, save v6, persistence, or real HP mutation.
- T101 adds a pure HP real replay from `realDamageReceived` events, still without UI, save v6, persistence, or official terminal-state application.
- T102 adds the event+replay bridge for local ledger updates, still without UI, save v6, persistence, or official terminal-state application.
- T103 adds safe preview copy for local real HP rendering before any Svelte UI consumes the bridge.
- T104 adds the Svelte preview panel as local, non-persistent UI for session characters only.
- The 2026-06-16 integration removes local combat equipment selectors and derives session-character weapon/defense from the persisted inventory loadout through an app-level resolver.
- Add save v6, Worker/SQLite persistence, and official terminal-state application only after a separate persistence gate.
- Add vulnerability `+1d6`, proficiency, consumable use in combat, and durability wear only after the persisted loadout integration remains stable in Browser validation.
- Expose real incoming damage in UI only after T100/T103 approve copy, replay boundaries, and Playwright validation scope.
- Add armor-category caps for the limited axis only after the exact cap table is represented in `docs/system/` and covered by tests.
- Add real initiative only after equipment selection and fixed turn order remain stable in browser tests.
- Add typed combat commands for attacks, reactions, spell casts, and conditions.
- Persist combat ledgers later through Worker/SQLite after the in-memory model is stable.
- Add Decorator-based modifiers for conditions, talents, weapon properties, and tactical forge effects.

## Boundaries

- This feature should not own dice, damage, or universal-test math. Those stay in `shared`.
- T88 still avoids persistence, Worker, grid, dynamic monsters, inventory mutation, magic, full equipment math, durability wear, and rolled initiative.
- Combat may consume equipment snapshots/profiles through props or lower-layer contracts, but equipment rules should remain in `entities/equipment`.
- Combat may depend on a loadout resolver contract, but the app boundary must compose inventory and combat services to avoid sibling feature imports.
- Equipped defense and `HP de treino` can be used as transient incoming-attack targets, but must remain non-persistent until a save-version phase and official character-damage contract are approved.
- Real damage events may exist as append-only contracts before HP mutation exists, but UI must not imply persisted HP until replay and save-version policy are approved.
