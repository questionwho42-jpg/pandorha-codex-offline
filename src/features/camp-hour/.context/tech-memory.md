# Camp Hour Technical Memory

- T35B resolves exactly one deterministic camp hour without UI, persistence, rolls, kits, encounters, or recovery effects.
- `CampHourService` accepts validated session, assignments, and activity catalog records, then returns a resolved session and deterministic pt-BR event log.
- Fortify perimeter reuses `ClockService` through the `CampClockProgressPort` interface instead of duplicating clock overflow logic.
- Danger increases by `PANDORHA_RULES.CAMP.BASE_DANGER_INCREASE_PER_HOUR`, currently `1`, as a deliberate first-slice placeholder until full camp event rolls are implemented.
