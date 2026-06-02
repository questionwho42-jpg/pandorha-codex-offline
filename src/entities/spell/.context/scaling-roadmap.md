# Spell Scaling Roadmap

- T27 should build `SpellCastBuilder` on top of this read-only catalog using Draft -> Weaving -> Audit -> Commit.
- Future work should add metamagic compatibility checks from tags before creating ActionQueue commands.
- Do not mechanize damage, saving throws, concentration, or EE spending inside the catalog entity.
- Add more spell circles in small batches with fixtures and magic-validator review.
- Evaluate shared catalog helpers only after one more catalog entity repeats the same service/repository structure.
