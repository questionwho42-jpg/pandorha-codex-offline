# Camp Session Scaling Roadmap

- Add Drizzle repositories and migration only when save/load v2 starts persisting camp state.
- Keep one-hour fields simple now; night-long sessions can compose multiple resolved hours later.
- Add unique database constraints after the first hourly service proves the correct cardinality rules.
