# SpellCastBuilderService Scaling Roadmap

- T28 added the first UI that prepares a command, while still avoiding EE spending, ActionQueue processing, attack rolls, and spell effects.
- A later metamagic task should model metamagic as decorators around the base draft/audit before the command is committed.
- Persisted EE, cooldowns, concentration, and spell execution should stay outside this builder and enter through future services or processors.
- If more command builders appear, evaluate a shared command-validator helper after at least one more concrete duplication.
- A future magic task should replace the fixed training caster/target with session character resources and combat targets only after EE and targeting rules are modeled.
