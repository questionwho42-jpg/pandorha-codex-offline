# Save Load Scaling Roadmap

- T33D connects this service to the app and real Worker bridge, exposing explicit save/load controls to the user.
- Future work can add autosave, multiple slots, migrations for older snapshots, compression, and event-ledger focused persistence.
- Keep serialization validation here even after richer save formats appear so invalid data never leaks into app state.
- Once multiple slots exist, replace the internal metadata flag with a dedicated save-slot catalog and explicit slot migration flow.
- A later slice can expose loaded WorldState flags to user-facing systems once there is a screen that actually consumes them.
- Save v3 is now the current version and follows the explicit migration pattern established by v2.
- Camp save data is now structured; future autosave should use the same snapshot schema instead of ad hoc UI state.
- Future save v4 changes should preserve `factionStandings` and add a direct migration from v3 instead of rewriting older migration behavior.
- When faction catalogs stop being static, add catalog versioning before persisting full faction records.
