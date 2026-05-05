# Character Class Scaling Roadmap

## Near-Term

- Add a dedicated class talent catalog with stable English ids and class relations before wiring choices into character creation.
- Add migrations and a SQLite/Drizzle adapter after the read-only contract is stable.
- Connect the class catalog to the character creation UI only after service tests cover valid and invalid class selections.

## Later

- Mechanize base HP, Energy, class passives, and level-up benefits through decorators instead of mutating final values.
- Add browser-visible class summaries to the compendium once the catalog is backed by the same service contract.
- Keep derived values calculated from source events and base records rather than persisted as final totals.
