# Equipment Plain English

This module is the technical catalog for the first equipment and consumable records in Pandorha.

It answers simple questions such as:

- What basic weapons, armor, and shields exist today?
- What stacked consumables exist today?
- How many slots does a listed item or stack normally occupy?
- Which rule file did the record come from?

The code does not create an inventory, equip items, change armor class, spend consumables, repair durability, or save anything to the database yet. It validates that the minimum official records are well-formed and can be listed or found by id.

In T85.1, the module gained a small service that turns real catalog weapons into a profile combat can understand. For example, `Espada Longa` becomes a profile with `1d8`, deterministic training total `4`, Matriz Fisica, 1 hand, 2 slots, and current durability.

The service still does not equip items by itself. It only guarantees that a valid, unbroken, known weapon can be handed to combat without reading free-text summaries.

## Alternatives

- Read the weapon summary text: faster at first, but fragile because prose can change.
- Put weapon facts directly inside combat: fewer files now, but it mixes item rules with attack rules.
- Use structured catalog weapon profiles: current approach, because it prepares future UI without changing save or database.
