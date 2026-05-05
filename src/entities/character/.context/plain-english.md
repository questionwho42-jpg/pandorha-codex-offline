# Character In Plain English

The Character module stores the basic sheet identity and the six core numbers used by Pandorha: three Eixos and three Aplicacoes.

It checks whether a new character follows the 6/6 creation rule before anything is saved. If something is wrong, it returns a clear failure instead of crashing.

The current version can calculate a few basic derived values without saving them: maximum HP, base initiative, and carry slot limit. These values come from the character's stored attributes and the resolved class base HP.

The current version still does not calculate armor, magic energy, inventory effects, class passives, ancestry trait effects, or background talent effects. Those values depend on future systems, so they should be added as separate rule services.

The Drizzle repository now has its own contract tests. These tests prove that the database adapter saves, finds, and rejects bad database rows without needing a real browser database.

The project now also has the first real database migration for characters. In practice, this means the app has an official SQL recipe for creating the `characters` table, and an automated test checks that this recipe works before any screen depends on it.
