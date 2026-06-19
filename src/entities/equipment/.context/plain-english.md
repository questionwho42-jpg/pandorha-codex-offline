# Equipment Plain English

This module is the technical catalog for the first equipment and consumable records in Pandorha.

Persisted inventory does not alter these definitions. It stores events saying
which catalog items each character carries. A separate save v7 history stores
which carried entry is equipped in weapon, shield, and armor slots. Spending
durability remains a separate delivery.

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

This service alone is still not a full inventory screen. It validates loadout
rules, while inventory and save/load decide which carried entries are equipped.
No item is repaired or damaged, no proficiency is checked, and combat still
does not automatically consume the persisted loadout.

In T91, the module learned how to read simple defensive equipment. Leather armor gives `+2 CA`, plate armor gives `+5 CA`, and a round shield gives `+1 CA`.

The loadout can now say, for example: "this character has leather armor and a round shield, so the equipped defense summary is `CA equipada +3`." This is only a visible and auditable profile. It does not make enemies attack the character yet, does not reduce damage, and does not spend durability.

In the starting-equipment catalog slice, the module added the remaining kit items that were missing from the app catalog: `Cota de Malha`, `Arco Curto`, `Cajado`, `Rapieira`, `Armadura Acolchoada de Luxo`, `Kit de Aventureiro`, `Grimorio`, and `Carta de Nobreza`.

Those records let inventory say "this character carries this item" and count slots. They do not automatically make the item usable in combat. Items without a structured profile stay visible in inventory but do not show an equip button.

## Alternatives

- Read the weapon summary text: faster at first, but fragile because prose can change.
- Put weapon facts directly inside combat: fewer files now, but it mixes item rules with attack rules.
- Use structured catalog weapon profiles: current approach, because it prepares future UI without changing save or database.
- Save selected equipment in a separate ledger: current approach, because it avoids copying catalog facts into the save.
- Apply defense directly inside combat now: tempting for a visible result, but too early because no official enemy-attack flow exists yet.
- Let every weapon or armor be equipped as soon as it exists in the catalog: tempting, but rejected because some starting-kit items still lack approved combat profiles.
## 2026-06-18 - Durabilidade Persistida

O modulo de equipamento agora tambem sabe ler um historico de durabilidade:
integro, danificado ou quebrado. Se nao existir historico, o item e tratado
como integro.

Isso ainda nao gasta durabilidade sozinho. O usuario marca a condicao pela tela
de Inventario, e o sistema guarda esse historico para o save. Itens quebrados
nao podem ser usados como equipamento ate serem reparados manualmente.
