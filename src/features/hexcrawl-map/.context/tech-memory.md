# HexcrawlMovementService Tech Memory

- T30 created the `hexcrawl-map` feature from `scripts/scaffold_domain_service.mjs` and replaced the placeholder after a failing TDD run.
- `HexcrawlMovementService` depends on a `WorldTileCatalogRepository` port from `entities/world-tile`, preserving FSD direction from feature to entity.
- Movement uses axial adjacency only. It does not roll Navigation, consume resources, persist discovery, create encounters, or generate maps.
- Event messages are returned in pt-BR because they are intended for the future UI log.
