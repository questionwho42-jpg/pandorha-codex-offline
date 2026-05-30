# Gate T73 - Save V5 Para Relação Individual Por NPC

## Decisão

A relação individual por NPC só deve sair do contrato interno da T72 depois de existir persistência durável própria. O estado não deve ser guardado em `WorldState` nem derivado de Fama/Infâmia de facção.

## Opções Avaliadas

- Opção A - Persistência completa, wiring social e UI no mesmo lote: entrega a experiência inteira, mas mistura migration, save/load, app state, UI e Browser QA em um lote amplo.
- Opção B - Save v5 mínimo para `npcRelationships`: adiciona schema/migration/save/load e mantém UI/wiring em etapas separadas, reduzindo risco de regressão.
- Opção C - Adiar persistência e manter T72 interno: evita migration agora, mas bloqueia relação individual durável e qualquer UI honesta de save/load.

## Escolha

Seguir a Opção B. T74 pode registrar `npc_relationships`, salvar/carregar `npcRelationships` no snapshot v5 e migrar v1-v4 com array vazio. T75 e T76 ficam responsáveis por wiring social e UI.

## Guardrails

- Não persistir relação individual em flags de `WorldState`.
- Não adicionar bônus mecânicos ou penalidades amplas sem regra oficial em `docs/system/`.
- Não alterar árvores de diálogo nesta etapa.
- Cobertura de serviços e persistência deve permanecer em 100%.
