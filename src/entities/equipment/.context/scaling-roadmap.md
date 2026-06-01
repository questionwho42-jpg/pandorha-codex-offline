# Equipment Scaling Roadmap

## Near-Term

- Add `InventoryCapacityService` to calculate used slots, slow state, and immobilized state from character stats and carried records.
- Add repository contract tests before introducing real SQLite or OPFS persistence.
- Connect equipment summaries to the compendium before surfacing editable inventory UI.
- Add a loadout/equip-slot service before exposing weapon selection in combat UI.
- Move from deterministic `baseDiceTotal` to real weapon dice only when the damage pipeline accepts dice rolls or a dice port.

## Later

- Split weapon, armor, shield, and adventuring-item effects into decorators or dedicated rule services instead of mutating final character totals.
- Mechanize rune slots, item quality, durability loss, and repair through event-driven services.
- Consider a small entity scaffold script after one more catalog-style slice repeats the same files and tests.
- Represent hand occupancy explicitly: one-handed, two-handed, shield, and free hand interactions.
- Add armor and shield defensive profiles after weapon attack profiles are stable.

## Boundaries

- Do not bump save version for catalog-only weapon profile definitions.
- Do not parse free-text mechanical summaries for combat rules.
- Do not let equipment import combat feature code; combat can consume equipment profiles through FSD direction.
- Do not add crafting, runes, or repair workflows until a phase explicitly scopes them.
