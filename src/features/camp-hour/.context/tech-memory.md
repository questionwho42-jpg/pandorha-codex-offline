# Camp Hour Technical Memory

- T35B resolves exactly one deterministic camp hour without UI, persistence, rolls, kits, encounters, or recovery effects.
- `CampHourService` accepts validated session, assignments, and activity catalog records, then returns a resolved session and deterministic pt-BR event log.
- Fortify perimeter reuses `ClockService` through the `CampClockProgressPort` interface instead of duplicating clock overflow logic.
- Danger increases by `PANDORHA_RULES.CAMP.BASE_DANGER_INCREASE_PER_HOUR`, currently `1`, as a deliberate first-slice placeholder until full camp event rolls are implemented.
- T35D adds `CampHourPanel` as the browser UI for one planned hour. The panel owns local Svelte state, emits persisted clocks/sessions/assignments to `App.svelte`, and keeps `CampHourService` pure.
- The first UI persists resolved camp state through save/load v2; it does not start a second hour or apply advanced activity effects.
- The bounded next-hour slice adds `CampHourTransitionService`, which accepts only resolved sessions, increments `currentHour`, preserves danger/clock linkage, and keeps the save v9 shape unchanged.
- `CampHourPanel` distinguishes initial planning, local resolution, restored resolution, and next-hour-ready state so parent state echo cannot erase the immediate resolution log.
- Preparing another hour clears prior assignments/events and reapplies deterministic default activities; automatic night, visible reset, and advanced effects remain outside this contract.
- A locally resolved hour must update `hydratedKey` before emitting `onStateChange`; otherwise the parent-state echo rehydrates the panel, clears fresh events, and incorrectly renders the save-restoration fallback.
