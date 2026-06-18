# Character Create Scaling Roadmap

## Next Steps

- Replace the session repository with Worker-backed persistence after the SQLite/OPFS bridge is ready.
- Split ancestry, class, and background selectors into real compendium-backed choices after those entities exist.
- Add field-level guidance later if the form becomes difficult to correct with a global banner.
- Add browser tests for reload persistence only after save/load is implemented.

## After T13A

- Persist selected ancestry traits only after a dedicated Character trait relation or draft persistence model exists.
- Show selected traits in the character list or detail sheet after the sheet can represent non-derived character choices.
- Apply trait effects through a future decorator/modifier pipeline rather than embedding mechanical effects in the form.
- Class and background selectors now use official read-only catalogs. Next, add user-facing summaries and later validate class/background references through a dedicated orchestration service before persistence.
- The v8 flow now persists and displays selected ancestry traits after creation. Future work should add trait mechanics through a Decorator-based domain service, not through form-side calculations.
- Starting equipment remains blocked until the catalog gap map is approved; do not grant kit items during creation as an implicit side effect.
