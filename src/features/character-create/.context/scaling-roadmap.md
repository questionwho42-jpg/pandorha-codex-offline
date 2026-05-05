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
- Replace fixed class/background selectors when their read-only entities and catalogs are implemented.
