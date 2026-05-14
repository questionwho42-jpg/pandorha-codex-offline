# WorldTile Scaling Roadmap

- T30 should consume this catalog through a port and validate adjacent movement without adding persistence.
- T31 can render the seven-tile fixture as the first visual map, but procedural generation remains out of scope.
- Future world-state tasks should store discovered/mapped state separately instead of mutating this static catalog.
- A migration for `world_tiles` should wait until SQLite/OPFS persistence for exploration is intentionally planned.
