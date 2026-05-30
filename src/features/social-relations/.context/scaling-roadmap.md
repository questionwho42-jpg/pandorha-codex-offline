# Social Relations Scaling Roadmap

- Add Prestige tests after the UI proves the basic favor/debt loop.
- Introduce NPC and dialogue integration through a separate feature so relation state does not depend on dialogue trees.
- Add richer favor tiers only after Tier 1 is validated in browser and save/load.
- Consider a dedicated faction-history ledger once relation changes become more than a single current standing snapshot.
- Keep faction records static until catalog versioning is designed.
- After T70, support multiple clocks per faction only when the UI has a compact list pattern.
- Keep clock advancement outside this UI until faction-retaliation rules are defined.
- Keep NPC relationship edits outside this UI until there is an official rule for manual relationship repair, gifts, apologies, or alliance progression.
- If many NPC relationships are shown at once, group `npcRows` by faction and add compact filtering before adding per-row actions.
