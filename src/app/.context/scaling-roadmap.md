# App Scaling Roadmap

## Next Steps

- T04 applied the first official visual tokens from `docs/conventions/styleguide.md`.
- Future UI tasks should extract repeated shell pieces only when a second real screen needs the same structure.
- T07/T08 should replace the `Personagens` placeholder with the real Character list/create flows.
- T16/T17 should replace the `Compêndio` placeholder with validated searchable rule content.
- T22B added the first fixed `Combate` panel.
- T22C added selectable static training targets.
- T22D connected session characters as attacker identity.
- T22E added visible deterministic turn state; the next combat UI step should add derived stats or a minimal target action intentionally.
- T22F shows derived session-character stats in combat as display-only context.
- T22G lets session characters influence training damage through Matriz Fisica without adding real equipment.
- T22H logs the target's passive turn explicitly, still without enemy AI.
- T22I shows a clear defeated state and keeps reset as the only available follow-up action.
- T25 adds a read-only inventory tab; future inventory work should introduce editable carried-item state only after a dedicated service/repository exists.
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
