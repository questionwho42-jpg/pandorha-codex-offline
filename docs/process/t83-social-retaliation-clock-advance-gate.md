# T83 Social Retaliation Clock Advance Gate

## Objetivo

Definir o contrato inicial de quando clocks de retaliação social podem avançar, sem criar UI, migration, save v6, histórico append-only ou nova penalidade.

## Regra Atual

O único avanço permitido hoje é por gatilho explícito `social-pressure`, já produzido pela consequência social de `Pressionar`.

Avanços por `descanso`, `tempo decorrido`, `cena social` ou `ação manual genérica` ficam bloqueados até existir regra oficial em `docs/system/` descrevendo cadência, consequência e persistência.

## Contrato Técnico

- `SocialRetaliationClockService.decideAdvanceGate` valida a intenção de avanço antes de qualquer chamada ao port de clocks.
- `cause: "social-pressure"` retorna `allowed: true` e `nextAction: "advance-from-trigger"`.
- `cause: "long-rest"`, `"elapsed-time"`, `"social-scene"` e `"manual-player-action"` retornam `allowed: false` e `nextAction: "wait-for-official-rule"`.
- Falhas de entrada continuam retornando `Result` tipado com `INVALID_SOCIAL_RETALIATION_CLOCK_INPUT`.
- `advanceFromTrigger` continua sendo o único caminho que altera clocks, com idempotência por `triggerId`.

## Fontes Consultadas

- `docs/system/survival/21-mecanicas-de-fama-e-influencia.md`: define fama, infâmia e perda por inatividade, mas não define avanço automático de clocks de retaliação social.
- `docs/system/survival/31-codex-teia-infamia-patrocinio.md`: define dívida, ultimato, favor impossível e caçada, mas não define cadência de clock por descanso ou cena social.
- `docs/system/survival/28-codex-acampamento-descanso-ativo.md`: define economia de tempo/acampamento, mas seus clocks são de esforço coletivo e não substituem retaliação social.

## Decisão

Manter a retaliação social como avanço explícito até uma fase futura especificar a cadência oficial. Isso evita transformar descanso, tempo ou troca de cena em punição invisível e preserva save v5.
