# Social Encounter Persistence Scaling Roadmap

- Add Drizzle repositories only when social encounters need direct CRUD outside the snapshot pipeline.
- Future save versions can attach dialogue node ids, world-state triggers, or actor stat references without changing the T43 ledger shape.
- If multiple simultaneous negotiations become playable, add indexes by `npcId`, `actorId`, and `status`.
