# Clock Scaling Roadmap

- Add the real Drizzle repository and migration in T34B while keeping `ClockService` unchanged.
- Reuse clocks for camp projects, factions, plots, and other progress trackers after the core contract is stable.
- Add event-sourced clock history only when the first consuming feature needs audit playback.
- Keep activity-specific rules outside this entity; camp orchestration belongs in later feature slices.
