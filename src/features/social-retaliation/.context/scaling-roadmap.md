# Scaling Roadmap

- Keep T71 as an internal service until a concrete UI or world-event trigger needs to call it.
- Persist applied trigger ids only after a save-version plan exists; do not hide durable retaliation progress in `WorldState`.
- If multiple retaliation clock sources appear, add a typed source enum or requirement schema before accepting arbitrary source strings.
- If automatic advancement becomes official, define the trigger cadence in `docs/system/` first and add Browser validation after wiring UI feedback.
- T72 must define NPC relationship persistence separately from faction standing and world flags.
