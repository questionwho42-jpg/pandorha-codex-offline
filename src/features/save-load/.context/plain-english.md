# SaveLoad In Plain English

This feature saves the current browser session into the local SQLite file and loads it back later.

In version 4, it also saves active social negotiations so a conversation can come back after reload.

In version 5, it also saves individual NPC relationships. This means a pressured NPC can stay strained after saving, reloading, and loading the local save again.

Version 6 saves the event history that reconstructs each character's carried
inventory. Older saves load with an empty inventory.

Version 7 saves a second event history for equipped items. It remembers which
carried inventory entry is in the weapon, shield, or armor slot, while the item
details still come from the official catalog.

Version 8 saves the three ancestry traits picked during character creation.
Older saves still open, but they start with an empty trait-selection list because
that information did not exist in earlier save versions.
