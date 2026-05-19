# Save Load Scaling Roadmap

- T33D connects this service to the app and real Worker bridge, exposing explicit save/load controls to the user.
- Future work can add autosave, multiple slots, migrations for older snapshots, compression, and event-ledger focused persistence.
- Keep serialization validation here even after richer save formats appear so invalid data never leaks into app state.
- Once multiple slots exist, replace the internal metadata flag with a dedicated save-slot catalog and explicit slot migration flow.
- A later slice can expose loaded WorldState flags to user-facing systems once there is a screen that actually consumes them.
- Save v3 should be introduced only with an explicit migration function and roundtrip tests, following the v1-to-v2 pattern.
- Camp save data is now structured; future autosave should use the same snapshot schema instead of ad hoc UI state.
