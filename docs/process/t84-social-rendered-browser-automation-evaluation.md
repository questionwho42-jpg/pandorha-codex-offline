# T84 Social Rendered Browser Automation Evaluation

## Objetivo

Avaliar se o fluxo renderizado de `Relações por NPC` deve virar automação recorrente no repositório agora, ou se o projeto deve manter `qa:social-browser-smoke` como contrato estático e usar Browser Use manual quando a UI social mudar.

## Decisão

Decision: keep qa:social-browser-smoke contractual.

Browser Use remains mandatory for social UI changes.

Do not add Playwright dependency until rendered browser checks are stable, reproducible in CI/local Windows, and cheaper than manual Browser Use for the social slice.

## Evidência

- O projeto não tem Playwright em `package.json`.
- O smoke atual (`scripts/social_browser_smoke.mjs`) é rápido, sem dependência nova, e valida os contratos críticos de save/load v5, `WorldState`, `npcRelationships`, clocks e filtros de `Relações por NPC`.
- A validação renderizada feita na T82 funcionou para DOM/interação, mas a captura de screenshot pelo Browser Use falhou por timeout. Isso torna prematuro transformar a automação renderizada em gate recorrente.
- Criar automação renderizada agora exigiria dependência nova, processo de dev server mais rígido, gerenciamento de porta e política de flake para SQLite WASM/OPFS.

## Critério Para Reabrir

Reavaliar quando pelo menos um destes pontos for verdadeiro:

- houver mais de duas mudanças consecutivas em `.svelte` social exigindo o mesmo roteiro manual;
- o Browser Use renderizado conseguir capturar screenshot e DOM sem timeout por duas fases seguidas;
- o projeto aceitar Playwright ou runner equivalente como dependência local explícita;
- houver CI/local runner capaz de subir Vite, criar personagem, gerar relação por NPC e clicar filtros sem intervenção humana.

## Aceite Atual

- `qa:social-browser-smoke` continua contratual/headless.
- Browser Use manual continua obrigatório para UI social alterada.
- Nenhuma dependência, migration, save v6 ou schema novo é introduzido nesta fase.
