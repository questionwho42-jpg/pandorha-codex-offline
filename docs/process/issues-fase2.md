# Issue Tracker: Expansão de Testes e Validações Avançadas (Fase 2)

Este arquivo contém a lista de fatias verticais (Tracer Bullets) aprovadas e prontas para execução, baseadas no plano de implementação da Fase 2.

---

## Issue 1: Criação e Alinhamento do ADR-015: Estratégia Avançada de Testes (Fase 2)

- **ID:** Issue-1
- **Type:** HITL
- **Parent:** `91ba9cfe-119e-46d8-adfb-ab96edbcffaf`
- **Blocked by:** None - can start immediately

### What to build
Oficialização e revisão técnica da estratégia de testes híbridos sob Happy-DOM para Svelte 5, simulações Monte Carlo com domínio TypeScript real, transacionalidade de persistência concorrente local-first e Explain Plan em runtime contra Table Scans.

### Acceptance criteria
- [x] Arquivo `docs/adr/ADR-015-advanced-testing-fase2.md` criado e revisado.

---

## Issue 2: Testes de UI Reativa do CombatEncounterPanel sob Happy-DOM

- **ID:** Issue-2
- **Type:** AFK
- **Parent:** `91ba9cfe-119e-46d8-adfb-ab96edbcffaf`
- **Blocked by:** Issue-1

### What to build
Criação da suíte de testes de componente `CombatEncounterPanel.spec.ts` que monta o painel de combate no ambiente virtual `happy-dom`. Mock da view model `combatEncounterView.ts` e validação de reatividade ponta a ponta dos runes do Svelte 5.

### Acceptance criteria
- [ ] Arquivo `src/features/combat-encounter/__tests__/CombatEncounterPanel.spec.ts` criado com anotação `// @vitest-environment happy-dom`.
- [ ] Componente montado nativamente via `mount()` do Svelte 5.
- [ ] Teste valida que alterações no HP da view model reativa atualizam a barra de vida e classes CSS de status no DOM.
- [ ] Teste valida que o botão de Atacar dispara a callback correta de resolução.

---

## Issue 3: Simulador Monte Carlo Híbrido de Combates Reais no Vitest

- **ID:** Issue-3
- **Type:** AFK
- **Parent:** `91ba9cfe-119e-46d8-adfb-ab96edbcffaf`
- **Blocked by:** Issue-1

### What to build
Criação de `CombatMonteCarlo.spec.ts` integrando os serviços de domínio `CombatEncounterService`, `CombatTurnService` e `TacticalAiService`. Simular 1.000 batalhas autônomas de Andarilhos vs Monstros nos modos Arena e Masmorra. Exportar relatórios.

### Acceptance criteria
- [ ] Arquivo `src/features/combat-encounter/__tests__/CombatMonteCarlo.spec.ts` criado.
- [ ] Simula combates reais rodando AI tática e aplicando regras oficiais de dano e estabilização de morte.
- [ ] Implementa o Modo Arena (isolar recursos por luta) e Modo Masmorra (sobrevivência com desgaste biológico e durabilidade de armas em 5 combates).
- [ ] Salva métricas brutas em `artifacts/combat_simulation_report.json`.
- [ ] Salva relatório com tabelas legíveis em `artifacts/combat_simulation_report.md`.

---

## Issue 4: Testes de Concorrência, Rollback de RPC e Integridade do SQLite

- **ID:** Issue-4
- **Type:** AFK
- **Parent:** `91ba9cfe-119e-46d8-adfb-ab96edbcffaf`
- **Blocked by:** Issue-1

### What to build
Criação de `SqliteConcurrencyAndIntegrity.spec.ts` rodando SQLite WASM em memória via `sql.js` com Drizzle. Testar estresse de concorrência com 50 escritas paralelas simultâneas, integridade referencial com deleções cascata e crash recovery com rollback automático na barreira RPC.

### Acceptance criteria
- [ ] Arquivo `src/entities/character/__tests__/SqliteConcurrencyAndIntegrity.spec.ts` criado.
- [ ] Simulação de estresse concorrente com 50 `Promise.all` em simultâneo gravando estados de personagem sem travar o SQLite.
- [ ] Deleção de Character resulta em cascateamento correto limpando status effects e itens associados.
- [ ] Simulação de falha no meio de transação RPC garante reversão (rollback) completa dos dados no SQLite.

---

## Issue 5: Auditoria de Performance SQL (Explain Plan & Migrations Linter)

- **ID:** Issue-5
- **Type:** AFK
- **Parent:** `91ba9cfe-119e-46d8-adfb-ab96edbcffaf`
- **Blocked by:** Issue-4

### What to build
Implementar no arquivo `SqliteConcurrencyAndIntegrity.spec.ts` analisadores regex para auditar estaticamente as migrations em `drizzle/` e um logger customizado no Drizzle em runtime para rodar `EXPLAIN QUERY PLAN` interceptando queries do ORM e falhando se contiver `SCAN TABLE`.

### Acceptance criteria
- [ ] Analisador estático de migrations valida existência de chaves e índices no diretório `drizzle/`.
- [ ] Logger customizado do Drizzle intercepta queries em tempo de execução dos testes.
- [ ] Execução de `EXPLAIN QUERY PLAN` no `sql.js` para cada query interceptada.
- [ ] O teste falha se a query retornar `SCAN TABLE` para tabelas principais.
- [ ] Salva os relatórios agregados em `artifacts/sqlite_stress_report.json` e `.md`.

---

## Issue 6: Integração de Auditoria de Performance e Balanço no Quality Gate

- **ID:** Issue-6
- **Type:** AFK
- **Parent:** `91ba9cfe-119e-46d8-adfb-ab96edbcffaf`
- **Blocked by:** Issue-2, Issue-3, Issue-5

### What to build
Modificar o script `scripts/run_full_quality_gate.mjs` para parsear os arquivos de métricas JSON gerados (`combat_simulation_report.json` e `sqlite_stress_report.json`) e quebrar o build do pre-commit caso Table Scans ou latências elevadas ocorram.

### Acceptance criteria
- [ ] `run_full_quality_gate.mjs` modificado.
- [ ] Novo passo `automation:combat-montecarlo-audit` valida ausência de loops de reações e tempos de combate.
- [ ] Novo passo `automation:sqlite-stress-audit` valida ausência de Table Scans (`SCAN TABLE`) e latências concorrentes `< 150ms`.
- [ ] Ambos os passos falham o Quality Gate se os limites forem violados.
