# Camp Session Technical Memory

- T35A introduces persistible camp session and assignment schemas without orchestration logic.
- `camp_sessions` stores one planning/resolution state plus an optional technical clock id.
- `camp_assignments` stores which character chose which activity in a given hour.
- The slice intentionally does not import sibling entities; later features validate cross-entity relationships.
