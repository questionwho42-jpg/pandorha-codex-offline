# Social Relations Technical Memory

- T38 adds `features/social-relations` as the UI slice for training factions.
- The UI does not calculate social operations directly; it calls `SocialStandingService` through the app session.
- `SocialRelationsPanel.svelte` keeps local hydrated state so save/load updates from the app can refresh the panel.
- Save/load integration uses snapshot v3 `factionStandings`; no extra browser storage or `localStorage` path exists.
- The first UI exposes only Tier 1 favor invocation and Tier 1 debt redemption.
- T70 adds read-only display of active social-pressure retaliation clocks on matching faction rows. The panel still delegates mutations to app/session code and does not create or advance clocks.
- T76 adds read-only `npcRows` sourced from `npcRelationships` and `npcs`; the panel still does not mutate NPC relationships.
- `SocialRelationsPanel.svelte` renders the NPC relationship list only when persisted relationships exist, using `data-testid="npc-relationship-list"` and `data-testid="npc-relationship-row"` for recurring QA.
- Clock advancement and NPC relationship mutation remain in app/session orchestration, not in the social-relations feature.
