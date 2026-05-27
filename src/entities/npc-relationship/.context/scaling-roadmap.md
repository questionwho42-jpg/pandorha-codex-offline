# Scaling Roadmap

- Keep T72 as an internal entity contract until a dedicated save-version plan exists; do not hide individual NPC relationship state in `WorldState`.
- Before wiring UI or social encounter consequences, define whether relationship state is loaded by NPC id, encounter id, or party scope.
- If T72 requires durable save snapshots, pause for a separate save v5 proposal covering schema migration, Drizzle-Zod validation, backward compatibility, and Browser smoke coverage.
- If relationship history becomes important, add an append-only event table instead of overloading `appliedPressureKeysJson`.
- If relationship effects become mechanical bonuses or penalties, define the official rule in `docs/system/` before expanding the service.
