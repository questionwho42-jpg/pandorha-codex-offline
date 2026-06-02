# HexcrawlMovementService Scaling Roadmap

- T31 should render the fixed seven-hex map and call this service from a local app session.
- Future tasks can add Navigation checks, travel roles, weather, resource consumption and secret drift, but those should be separate services or decorators.
- Persisted discovered/mapped state should live in a future world-state layer instead of mutating the static `WorldTile` catalog.
- Encounter tables should remain out of this service; T30 only emits an `encounter-check-pending` event.
- After T31, the next safe expansion is either a user guide for exploration or T32 world-state persistence for known/mapped tiles.
