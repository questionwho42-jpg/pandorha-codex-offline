# Npc Scaling Roadmap

- T42 should consume this catalog through a port instead of mutating NPC records directly.
- Save/load v4 can persist social encounter state separately; the base NPC catalog should remain read-only.
- A future migration may create a real `npcs` table only when dynamic or official NPC records are needed.
- Dialogue trees, HP mental damage, patience loss, and attitude shifts belong in features, not in this entity catalog.
- Evaluate a shared catalog-service helper only after another entity repeats the same validation shape.
