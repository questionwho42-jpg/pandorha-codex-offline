# Gate Da Skill Pandorha Phase Runner

## Decisao Atual

`pandorha-phase-runner` esta bloqueada por enquanto.

## Criterios Para Reabrir

- Pelo menos 3 ciclos completos usando os novos scripts de automacao.
- Evidencia de repeticao em `docs/process/task-ledger.md`.
- Ganho claro sobre `.agents/skills/pandorha-maintenance/SKILL.md`.
- Nenhuma duplicacao com `.agents/skills/build-test-verify/SKILL.md`.

## Como Medir

Em cada ciclo, registre no task ledger quais comandos reduziram trabalho manual:

- `npm.cmd run automation:opportunities`
- `npm.cmd run context:validate`
- `npm.cmd run save:migration-matrix`
- `npm.cmd run qa:browser-runbook:check`
- gates `quality:automation`, `quality:mcp` e `quality:skills`

## Resultado Esperado

A skill so deve ser criada se ela orquestrar uma sequencia recorrente que os scripts e skills atuais nao resolvem bem. Caso contrario, mantenha o fluxo em scripts locais e atualize apenas a documentacao operacional.
