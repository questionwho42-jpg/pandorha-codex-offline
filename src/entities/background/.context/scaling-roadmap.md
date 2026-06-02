# Background Scaling Roadmap

## Near-Term

- Add a dedicated background talent catalog before wiring talent choices into character creation.
- Decide whether truncated talent labels from the source export should be repaired in official docs before presenting them as clean UI options.
- Connect the background catalog to the character creation UI after service tests cover valid and invalid background selection.

## Later

- Mechanize origin abilities and starting benefits through decorators, events, or dedicated services instead of mutating final character totals.
- Add migrations and a SQLite/Drizzle adapter after the read-only contract is stable.
- Surface background summaries in the compendium with source-file references.
