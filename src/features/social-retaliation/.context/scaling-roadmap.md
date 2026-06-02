# Scaling Roadmap

- Keep T71 as an internal service until a concrete UI or world-event trigger needs to call it.
- Persist applied trigger ids only after a save-version plan exists; do not hide durable retaliation progress in `WorldState`.
- If multiple retaliation clock sources appear, add a typed source enum or requirement schema before accepting arbitrary source strings.
- T83 blocks automatic advancement by rest, elapsed time, social scene, or manual generic action until a rule in `docs/system/` defines cadence and consequences.
- If automatic advancement becomes official, define the trigger cadence in `docs/system/` first, add service tests for the new cause, then add Browser validation only after wiring UI feedback.
- T72 must define NPC relationship persistence separately from faction standing and world flags.
