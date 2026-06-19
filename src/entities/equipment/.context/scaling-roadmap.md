# Equipment Scaling Roadmap

## Near-Term

- Add `InventoryCapacityService` to calculate used slots, slow state, and immobilized state from character stats and carried records.
- Add repository contract tests before introducing real SQLite or OPFS persistence.
- Connect equipment summaries to the compendium before surfacing editable inventory UI.
- Persisted equipment slots now exist through save v7; connect combat to that loadout only after a dedicated combat-inventory integration gate.
- Move from deterministic `baseDiceTotal` to real weapon dice only when the damage pipeline accepts dice rolls or a dice port.
- Feed equipped defense profiles into an official "target attacks character" rule only after that combat contract exists.
- Mechanize `chainmail`, `shortbow`, `staff`, `rapier`, and `luxury-padded-armor` only after a dedicated profile gate approves their combat facts.

## Later

- Split weapon, armor, shield, and adventuring-item effects into decorators or dedicated rule services instead of mutating final character totals.
- Mechanize rune slots, item quality, durability loss, and repair through event-driven services.
- Consider a small entity scaffold script after one more catalog-style slice repeats the same files and tests.
- Extend hand occupancy beyond the current 0-2 snapshot only after official rules require free-hand interactions, dual wield, or versatile two-hand mode.
- Decorate armor and shield effects only after CA, RD, penalties, noise, and speed costs have a shared modifier contract.
- Use the starting-kit catalog records as ownership inputs only until their attack/defense/loadout profiles are explicitly approved.

## Boundaries

- Do not bump save version for catalog-only weapon profile definitions.
- Do not parse free-text mechanical summaries for combat rules.
- Do not let equipment import combat feature code; combat can consume equipment profiles through FSD direction.
- Do not add crafting, runes, or repair workflows until a phase explicitly scopes them.
- Do not add more persisted equipment state beyond `equipmentLoadoutEvents` without a new save-version gate.
- Save v7 persists selected loadout entry ids only; it does not approve durability, combat loadout application, quick slots, or item effects.
- Do not let `activeDefenseProfile` change incoming damage before official character-targeting rules are implemented.
- Do not infer loadout support from `equipment.kind`; use `OFFICIAL_LOADOUT_SUPPORTED_EQUIPMENT_IDS` until profile coverage expands.
- Save v9 persists `equipmentDurabilityEvents`; future automatic wear, repair costs, camp repair, crafting repair, and damaged-item modifiers need separate Decorator/rule gates.
