# Scaling Roadmap

# SocialEncounterService Scaling Roadmap

- T43 should persist social encounter state in save/load v4, not mutate the NPC catalog.
- T44 should add UI in `Relações` with a training NPC selector, start button, appeal button, and log.
- T47 wires `SocialAppealResolutionService` to character social stats before passing outcomes into `SocialEncounterService.resolveAppeal`.
- T48 should replace the single training appeal with authored argument choices and explicit modifiers.
- `dialogue-architect` becomes relevant when appeal choices become authored dialogue nodes.
- `world-state-manager` becomes relevant when social outcomes set narrative flags or unlock locations.
- After T49, future dialogue branches can read `npc:<npc-id>:convinced` or `npc:<npc-id>:walked-away` flags before unlocking follow-up scenes.
- After T50, the social UI can select a dialogue choice and pass its modifier into audited social resolution without changing persistence.
- After T51, `Persuadir`, `Barganhar`, and `Pressionar` are visible in the UI; T52 should make persisted logs mention the chosen argument while keeping old commands compatible.
- After T52, persisted logs can mention the chosen argument. Future dialogue-tree work can add richer authored text without changing the current event schema.
- After T55, the UI should derive the current dialogue node by replaying `dialogue-option-selected` events instead of persisting a duplicate current-node field.
- After T56, add more nodes only after the first tree is documented and covered by QA; avoid lore-heavy branches until blocked options and requirements have clear UI copy.
- Future UI iterations should add player argument choices before adding random rolls, so the user can understand what changed.

## 2026-05-24T07:37:58.933Z

### Scaling Notes
T59 can add another NPC with gated options using the same fields. Future work can add flag/fame requirements by extending the same availability view shape, but should avoid save v5 until requirements need persistence beyond the read-only catalog.

### Follow-Up
- Revisit after the next feature change or failed validation run.
- Convert durable lessons into tests or automation where practical.

## 2026-05-26T04:08:00.000Z

### Scaling Notes
T62 now covers the recurring Barganhar -> WorldState -> save/load walkthrough with a headless contract smoke. Future work can promote this to a real browser runner once the project accepts a Playwright dependency or stable local browser CLI; until then, Browser Use remains the visual gate for `.svelte` changes.

### Follow-Up
- Keep `social_browser_smoke.mjs` focused on user-visible social contracts.
- Add a slower rendered browser smoke only when the dependency and artifact policy are settled.

## 2026-05-24T07:59:50.343Z

### Scaling Notes
T60 should document and smoke-test the visible blocked option. Later social trees can add flag/fame requirements by extending availability data, but the current runtime already supports multiple NPC trees through selectedNpcId.

### Follow-Up
- Revisit after the next feature change or failed validation run.
- Convert durable lessons into tests or automation where practical.

## 2026-05-25T23:08:57.238Z

### Scaling Notes
Keep extending vertical_slice_smoke.mjs whenever a new social encounter contract becomes user-visible. Future browser automation should cover the same Informante de Treino path dynamically once Browser Use or an equivalent stable UI runner can select NPCs, click disabled options, and validate save/load state reliably.

### Follow-Up
- Revisit after the next feature change or failed validation run.
- Convert durable lessons into tests or automation where practical.

## 2026-05-25T23:41:44.155Z

### Scaling Notes
T62 should automate the browser walkthrough that validates Barganhar through save/load. Future faction or relationship penalties should read this consequence metadata instead of inferring from log text, but should remain in a separate task because it crosses social-relations, world-state, and likely save acceptance criteria.

### Follow-Up
- Revisit after the next feature change or failed validation run.
- Convert durable lessons into tests or automation where practical.
