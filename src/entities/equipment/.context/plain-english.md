# Equipment Plain English

This module is the technical catalog for the first equipment and consumable records in Pandorha.

It answers simple questions such as:

- What basic weapons, armor, and shields exist today?
- What stacked consumables exist today?
- How many slots does a listed item or stack normally occupy?
- Which rule file did the record come from?

The code does not create an inventory, equip items, change combat damage, change armor class, spend consumables, repair durability, or save anything to the database yet. It only validates that the minimum official records are well-formed and can be listed or found by id.

The next step is to calculate inventory capacity and overload from these validated records.
