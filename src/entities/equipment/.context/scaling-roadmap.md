# Equipment Scaling Roadmap

## Near-Term

- Add `InventoryCapacityService` to calculate used slots, slow state, and immobilized state from character stats and carried records.
- Add repository contract tests before introducing real SQLite or OPFS persistence.
- Connect equipment summaries to the compendium before surfacing editable inventory UI.

## Later

- Split weapon, armor, shield, and adventuring-item effects into decorators or dedicated rule services instead of mutating final character totals.
- Mechanize rune slots, item quality, durability loss, and repair through event-driven services.
- Consider a small entity scaffold script after one more catalog-style slice repeats the same files and tests.
