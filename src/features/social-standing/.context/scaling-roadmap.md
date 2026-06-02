# Social Standing Scaling Roadmap

- Add impossible favor missions after a quest/clock system can represent deadlines.
- Add prestige checks through `ResolutionService` later.
- Add social dialogue wrappers after the `dialogue-architect` flow is available.
- Persist standings in save v3 before exposing UI.
- After T63, keep faction-standing mutations behind app-level orchestration when another feature triggers them. Do not let sibling features import `features/social-standing` directly.
- Future pressure fallout can add Infamy, faction clocks, or NPC relationship damage only after those contracts are planned with world-state and save acceptance.
- After T69, add intimidation bonuses and ambush risk only as separate rules; `gainInfamy` should remain a small pure mutation.
