# App Scaling Roadmap

## Next Steps

- T04 applied the first official visual tokens from `docs/conventions/styleguide.md`.
- Future UI tasks should extract repeated shell pieces only when a second real screen needs the same structure.
- T07/T08 should replace the `Personagens` placeholder with the real Character list/create flows.
- T16/T17 replaced the `Compêndio` placeholder with searchable rule content; the 2026-06-20 indexed browser added generated system categories, category filters and source provenance. Future work should add pagination or ranking before expanding into semantic search.
- T22B added the first fixed `Combate` panel.
- T22C added selectable static training targets.
- T22D connected session characters as attacker identity.
- T22E added visible deterministic turn state; the next combat UI step should add derived stats or a minimal target action intentionally.
- T22F shows derived session-character stats in combat as display-only context.
- T22G lets session characters influence training damage through Matriz Fisica without adding real equipment.
- T22H logs the target's passive turn explicitly, still without enemy AI.
- T22I shows a clear defeated state and keeps reset as the only available follow-up action.
- Editable inventory now owns carried-item mutations per character and save v7 owns equipped loadout events; combat consumes that persisted loadout through an app-level resolver, while equipment effects, durability, crafting, and real consumable effects remain behind separate contracts.
- Combat potion belt quick access now uses an app-level resolver/consumer over the existing inventory ledger; future healing, HP real changes, item effects, conditions, and official action economy still need their own gate.
- Character creation now records the three selected ancestry traits for save v8. Future visible sheet work should render those persisted choices before adding trait mechanics.
- The visible sheet now renders persisted ancestry trait choices in the character list. Future work can move the display into a fuller sheet view when editing, progression, or trait mechanics exist.
- Trait mechanics should wait for a Decorator-based contract. Starting equipment is now granted through inventory events; future work should add choices, auto-loadout, or price handling only after dedicated gates.
- T28 adds a minimal Magia tab; future magic UI should connect session caster resources and real targets only after EE, targeting, and spell execution services exist.
- T31 adds a minimal Exploracao tab; future exploration work should add world-state persistence before promising saved discovery or mapped routes.
- T33D adds explicit local save/load controls in the `Personagens` tab; future persistence work should add multiple slots, autosave, and user-facing WorldState views only after their dedicated services are defined.
- T35D adds a minimal Acampamento tab; future camp work should add multi-hour orchestration, activity rolls, recovery, and encounter checks only after the one-hour saved flow is stable.
- T39 adds the first offline smoke path through a small service worker; T40 should turn the repeated browser checks into a reusable QA script before expanding cache policy.
- T47 connects `Relacoes` to session-character social stats; T48 should add argument choices before adding deeper dialogue trees.
- T49 lets social outcomes write WorldState flags; future UI can surface a compact "facts of the world" panel before adding branching dialogue.
- T51 shows argument choices in `Relacoes`; T52 should persist clearer log copy for the chosen argument without changing snapshot version.
- T52 keeps save v4 unchanged while making social logs clearer. T53 should update user docs and the vertical smoke script to cover the argument choice flow.
- Future app bootstrapping should introduce typed providers for Worker/RPC, repositories, services, and UI state.
- T73-T76 moves social save state to v5 with `npcRelationships`; future app social orchestration should split large session functions only when another explicit relationship trigger exists.
- Keep retaliation clock advancement explicit at the call site; do not add timer-driven advancement until a rule exists in `docs/system/`.
- T92 wires the combat target's minimal incoming attack service into the combat tab without app-level HP mutation, save v6, monster data, or Worker changes.
- Future combat app wiring should pass persisted HP only after a dedicated character-combat-state contract exists.
- Keep navigation copy synchronized with reachable panels through `qa:ui-reachability`; add new panel contracts to the smoke when a new tab is introduced.
- Durability v9 is wired through app state and save/load. Future auto-wear, repair workflows, and damaged modifiers should stay behind dedicated gates instead of expanding `App.svelte` conditionally.
- The PWA header now supports install prompt and waiting-worker update controls. Future offline work should focus on reliable browser-network automation or a deliberate cache-data strategy, not on broadening cache scope implicitly.
