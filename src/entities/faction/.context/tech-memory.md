# Faction Technical Memory

- T36A models training factions and party standings as validated catalog data.
- `factionId` is the primary key for `faction_standings` because the current game has one party-level standing per faction.
- Mutating social actions are intentionally deferred to `SocialStandingService`; this entity service is read-only.
- A future entity scaffold for catalog + standing slices may be useful, but T36A was implemented manually to keep rule mapping explicit.
