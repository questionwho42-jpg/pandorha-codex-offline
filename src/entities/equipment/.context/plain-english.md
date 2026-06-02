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

In T86, the module gained the first loadout service. It answers: "what is currently in the main hand, off hand, and armor slot?" It allows an empty loadout, a one-handed weapon with a shield, armor by itself, or a two-handed weapon with the off hand empty.

It refuses combinations that should not happen, such as putting a dagger in the shield slot, putting a shield in the armor slot, using a broken item, or equipping an `Arco Longo` together with an off-hand shield.

This is still not a full inventory screen. Nothing is saved, no item is repaired or damaged, no proficiency is checked, and no armor class is recalculated yet.

In T91, the module learned how to read simple defensive equipment. Leather armor gives `+2 CA`, plate armor gives `+5 CA`, and a round shield gives `+1 CA`.

The loadout can now say, for example: "this character has leather armor and a round shield, so the equipped defense summary is `CA equipada +3`." This is only a visible and auditable profile. It does not make enemies attack the character yet, does not reduce damage, does not save the chosen equipment, and does not spend durability.

## Alternatives

- Read the weapon summary text: faster at first, but fragile because prose can change.
- Put weapon facts directly inside combat: fewer files now, but it mixes item rules with attack rules.
- Use structured catalog weapon profiles: current approach, because it prepares future UI without changing save or database.
- Save selected equipment immediately: convenient for players sooner, but it would require a save-version decision before the loadout contract is proven in UI.
- Apply defense directly inside combat now: tempting for a visible result, but too early because no official enemy-attack flow exists yet.
