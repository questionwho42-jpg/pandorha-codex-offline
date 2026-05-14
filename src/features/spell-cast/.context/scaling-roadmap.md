# SpellCastBuilderService Scaling Roadmap

- T28 should add the first UI that prepares a command, but still must not spend EE, process ActionQueue entries, or apply spell effects.
- A later metamagic task should model metamagic as decorators around the base draft/audit before the command is committed.
- Persisted EE, cooldowns, concentration, and spell execution should stay outside this builder and enter through future services or processors.
- If more command builders appear, evaluate a shared command-validator helper after at least one more concrete duplication.
