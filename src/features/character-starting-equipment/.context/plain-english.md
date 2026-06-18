# Starting Equipment In Plain English

This feature answers one question: "which starting kit should a new character receive for this class?"

It does not save anything by itself and it does not equip items. It only returns a short list of catalog ids, such as `longsword`, `chainmail`, or `adventurer-kit-stack`.

The app then asks Inventory to add those items to the new character. This keeps ownership in the existing inventory ledger and avoids creating another save version.

Some kit items can be carried but not equipped yet because they do not have combat profiles. They stay visible in Inventory until a later profile gate approves their mechanics.
