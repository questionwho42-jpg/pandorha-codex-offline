# Character In Plain English

The Character module stores the basic sheet identity and the six core numbers used by Pandorha: three Eixos and three Aplicacoes.

It checks whether a new character follows the 6/6 creation rule before anything is saved. If something is wrong, it returns a clear failure instead of crashing.

The current version does not calculate final HP, armor, magic energy, or inventory. Those values depend on class, equipment, and future systems, so they should be added as separate rule services.
