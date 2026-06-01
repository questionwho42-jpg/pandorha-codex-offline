# Equipment Scaling Roadmap

## Near-Term

- Add `InventoryCapacityService` to calculate used slots, slow state, and immobilized state from character stats and carried records.
- Add repository contract tests before introducing real SQLite or OPFS persistence.
- Connect equipment summaries to the compendium before surfacing editable inventory UI.
- Connect `EquipmentLoadoutService` to the combat UI with a local selector before adding persisted equipment slots.
- Move from deterministic `baseDiceTotal` to real weapon dice only when the damage pipeline accepts dice rolls or a dice port.
- Add defensive armor/shield profiles after loadout snapshots are consumed by combat.

## Later

- Split weapon, armor, shield, and adventuring-item effects into decorators or dedicated rule services instead of mutating final character totals.
- Mechanize rune slots, item quality, durability loss, and repair through event-driven services.
- Consider a small entity scaffold script after one more catalog-style slice repeats the same files and tests.
- Extend hand occupancy beyond the current 0-2 snapshot only after official rules require free-hand interactions, dual wield, or versatile two-hand mode.
- Add armor and shield defensive profiles after weapon attack profiles are stable.

## Boundaries

- Do not bump save version for catalog-only weapon profile definitions.
- Do not parse free-text mechanical summaries for combat rules.
- Do not let equipment import combat feature code; combat can consume equipment profiles through FSD direction.
- Do not add crafting, runes, or repair workflows until a phase explicitly scopes them.
- Do not persist selected loadout ids until a save-version phase explicitly approves the migration.
