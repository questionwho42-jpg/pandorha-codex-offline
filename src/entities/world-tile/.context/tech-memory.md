# WorldTile Tech Memory

- T29 created `src/entities/world-tile/` from `scripts/scaffold_catalog_entity.mjs`, then replaced the placeholder with a real Drizzle-Zod/Zod contract.
- `WorldTileCatalogService` is read-only and returns `Result`; it validates repository output before returning records.
- Axial directions follow the hexcrawl drift order documented in `docs/system/survival/c-dex-de-hexcrawl-e-explora-o.md`: north, northeast, southeast, south, southwest, northwest.
- The fixture catalog is intentionally small: one center tile plus six neighbors. It is not procedural generation and does not persist world state.
