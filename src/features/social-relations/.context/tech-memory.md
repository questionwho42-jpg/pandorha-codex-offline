# Social Relations Technical Memory

- T38 adds `features/social-relations` as the UI slice for training factions.
- The UI does not calculate social operations directly; it calls `SocialStandingService` through the app session.
- `SocialRelationsPanel.svelte` keeps local hydrated state so save/load updates from the app can refresh the panel.
- Save/load integration uses snapshot v3 `factionStandings`; no extra browser storage or `localStorage` path exists.
- The first UI exposes only Tier 1 favor invocation and Tier 1 debt redemption.
