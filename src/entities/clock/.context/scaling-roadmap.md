# Clock Scaling Roadmap

- Keep the Drizzle repository behind the existing interface so save/load v2 can reuse persisted clocks without changing `ClockService`.
- Reuse clocks for camp projects, factions, plots, and other progress trackers after the core contract is stable.
- Add event-sourced clock history only when the first consuming feature needs audit playback.
- Keep activity-specific rules outside this entity; camp orchestration belongs in later feature slices.
- After T70, keep `source: "social-pressure"` for faction retaliation clocks so they do not mix with camp clocks.
- Define explicit advancement triggers before any automatic retaliation progress.
