# Dialogue Choice Tech Memory

- Generated with `scripts/scaffold_catalog_entity.mjs` and then replaced with the T48 read-only social choice catalog.
- `DialogueChoiceCatalogService` is a pure read-only service over a repository port and returns `Result` for every failure path.
- The initial catalog has three training choices: `persuade`, `bargain`, and `threaten`.
- Choices store pt-BR visible copy plus technical `tag` and `appealModifier`; they do not execute dialogue, write WorldState, or mutate social encounter state.
- Rule source: `docs/system/survival/regras-negociacao.md`.
