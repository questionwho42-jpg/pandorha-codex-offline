# SocialEncounterService Scaling Roadmap

- T43 should persist social encounter state in save/load v4, not mutate the NPC catalog.
- T44 should add UI in `Relações` with a training NPC selector, start button, appeal button, and log.
- T47 wires `SocialAppealResolutionService` to character social stats before passing outcomes into `SocialEncounterService.resolveAppeal`.
- T48 should replace the single training appeal with authored argument choices and explicit modifiers.
- `dialogue-architect` becomes relevant when appeal choices become authored dialogue nodes.
- `world-state-manager` becomes relevant when social outcomes set narrative flags or unlock locations.
- Future UI iterations should add player argument choices before adding random rolls, so the user can understand what changed.
