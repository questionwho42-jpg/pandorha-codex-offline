# Character Scaling Roadmap

## Next Steps

- Add relations for `ancestries`, `classes`, `backgrounds`, traits, talents, maneuvers, and tactics after their tables exist.
- Extend `CharacterDerivedStatsService` in small steps after each source system exists: class passives, ancestry traits, background talents, equipment, magic resources, and status effects.
- Keep derived resources such as HP, PV, EE, CA, initiative, and load recalculated instead of persisted.
- Extend `pandorha-arch-guard` to recognize `src/entities` and public entity APIs.
- Reuse the migration verification pattern for each new persisted entity before connecting it to UI workflows.
- Add integration tests with the real SQLite WASM/OPFS stack only after migrations and worker boot are formalized.
- Choose the final browser SQLite/OPFS driver in the Worker initialization task, not inside entity migrations.
- Retire or wrap `SessionCharacterRepository` once the Worker-backed repository is available, so browser refreshes preserve created characters.
