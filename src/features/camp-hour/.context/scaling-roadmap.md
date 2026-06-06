# Camp Hour Scaling Roadmap

- Add activity rolls, kits, healing, exhaustion removal, and encounter checks after the first UI slice is saved and user-tested.
- Replace character ids in logs with character display names at the UI/session boundary.
- Persist resolved camp hours in T35C through dedicated camp tables instead of world-state flags.
- Add multi-hour and night-long orchestration only after the one-hour path is stable.
- Next expansion should add explicit reset/new-hour orchestration instead of overloading the first-hour UI.
- Activity results should move into dedicated services before adding kits, healing, random events, or encounter checks.
- Keep the local-resolution and restored-save log states distinct when multi-hour orchestration is introduced.
