# Damage Scaling Roadmap

## Next Steps

- Add typed damage categories once weapon, spell, and monster catalogs are available.
- Add a dice adapter that uses `DiceService` to roll weapon dice and vulnerability bonus dice before calling `DamagePipelineService`.
- Add Decorator-based damage modifiers for talents, runes, conditions, armor properties, and temporary effects.
- Integrate the final damage result into the future combat state machine through `ActionQueueService`.
- Persist combat audit entries later through the Worker/SQLite layer instead of storing final derived values directly.

## Boundaries

- This module should stay free of UI, HP mutation, database adapters, and turn execution.
- If damage needs to change HP, that belongs in combat/application flow, not inside this pure pipeline.
