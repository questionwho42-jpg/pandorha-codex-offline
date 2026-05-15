# Save Load Scaling Roadmap

- T33D should connect this service to the app and real Worker bridge, then expose explicit save/load controls to the user.
- Future work can add autosave, multiple slots, migrations for older snapshots, compression, and event-ledger focused persistence.
- Keep serialization validation here even after richer save formats appear so invalid data never leaks into app state.
- Once multiple slots exist, replace the internal metadata flag with a dedicated save-slot catalog and explicit slot migration flow.
