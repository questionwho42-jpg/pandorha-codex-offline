# Ancestry Scaling Roadmap

## Next Steps

- T12 should model selectable ancestry traits separately and link them to ancestry ids.
- A later persistence task should decide whether `ancestries` remains seeded static content or becomes a real SQLite-backed table.
- Character creation UI should consume this catalog only after ancestry choices and trait selection are ready.
- Mechanical initial bonuses should become explicit structured rules only when the derived-stat and modifier pipeline exists.

## After T12

- Next technical step: expose ancestry trait choices to the character creation flow only after the UI can preserve a temporary selection without real persistence.
- Trait effects should later move from text into explicit decorator/modifier objects when the derived-stat pipeline exists.
- The `ancestry_trait_links` table is intentionally N:N-ready so future variant ancestries, cultural packages, or shared traits can reuse the same catalog shape.
- Persistence work should add migrations and repository adapters after the static contract is stable.
