# Scaling Roadmap

# DialogueTree Scaling Roadmap

- Expandir o catálogo para outros NPCs de treino antes de importar diálogos de lore oficial.
- Adicionar requisitos de flags, HP mental ou fama apenas quando a UI já souber explicar opções bloqueadas ao usuário.
- Avaliar persistência dedicada de árvores somente quando houver autoria/edição de diálogo pelo usuário; por enquanto o catálogo é read-only.

## 2026-05-24T07:38:10.771Z

### Scaling Notes
Use the same optional fields for T59 when adding another training NPC. Add dedicated persistence only if dialogue trees become user-authored or loaded from database content; for static training content, keep requirements in the read-only catalog.

### Follow-Up
- Revisit after the next feature change or failed validation run.
- Convert durable lessons into tests or automation where practical.

## 2026-05-24T07:59:37.766Z

### Scaling Notes
Future NPC trees should reuse the same node/option catalog shape and avoid adding database persistence until dialogue content becomes user-authored or dynamically loaded. T60 should update user docs and vertical smoke to mention the informant blocked option.

### Follow-Up
- Revisit after the next feature change or failed validation run.
- Convert durable lessons into tests or automation where practical.
