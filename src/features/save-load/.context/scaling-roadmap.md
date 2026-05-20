# SaveLoad Scaling Roadmap

- Future versions can add dialogue trees, social flags, or multiple save slots through explicit snapshot migrations.
- Autosave should wait until manual save/load remains stable across several UI systems.
- If snapshot replacement grows too expensive, split save sections into scoped transactions while preserving the current full-snapshot contract.
