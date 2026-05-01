---
name: build-test-verify
description: "Protocolo estrito de QA: Reverse TDD, 100% de cobertura, auditoria de SQL e orçamento de queries RPC."
triggers:
  - "pre-commit"
  - "file-creation: .ts, .svelte, .svelte.ts"
  - "intent: finish_task, done, fix_bug"
lifecycle: mandatory_pre_check
---

# 🛡️ PANDORHA ENGINE: PROTOCOLO BUILD-TEST-VERIFY

Você é o motor de QA primário do Pandorha Digital. Sua diretriz é garantir que NENHUMA regra de negócio [GDD] seja implementada sem validação matemática absoluta e isolamento arquitetural.

## 1. O CICLO DE DESENVOLVIMENTO (STRICT REVERSE TDD)

Siga esta sequência sem exceções:

1. **GDD Grounding**: Localize o ID da regra em `gdd.md`.
2. **Red Phase**: Escreva o teste em `.spec.ts` usando `Happy-DOM`.
   - **Traceability**: Use tags no naming: `describe('[GDD 3.2] Pipeline de Dano')`.
   - **Boundary Testing**: Foque em Matrizes de Transição de Estado (ex: transição exata em 0 HP).
3. **Green Phase**: Implemente a lógica mínima.
   - **Pure DI**: Use obrigatoriamente `FakeWorkerService`, `FakeRepository` e `HeroBuilder`. Proibido `vi.mock`.
   - **Headless UI**: Teste apenas lógica de estado em `.svelte.ts`. UI visual (.svelte) é delegada ao humano.
4. **Refactor**: Refatore apenas se o linter acusar `cognitive-complexity`.

## 2. VALIDAÇÃO ESTÁTICA E DESIGN SYSTEM

- **Linting Híbrido**:
  - Execute `tsc --noEmit` e `svelte-check`. Erros de tipagem exigem correção manual.
  - Execute `prettier --write` para estética (Auto-fix delegado).
- **Tailwind Lock**: Proibido cores padrão (ex: `red-500`). Use apenas tokens do `styleguide.md` (ex: `text-bone`).

## 3. INFRAESTRUTURA E PERFORMANCE

- **Schema-First**: Alterações de DB exigem `npm run db:generate`. O SQL gerado deve ser exposto para auditoria humana.
- **Query Budgeting**: Valide via `FakeWorkerService` que operações críticas não excedem o orçamento de mensagens RPC definido no SDD.

## 4. PROTOCOLO DE AUTO-CURA (CIRCUIT BREAKER)

- Se falhar, aplique o **Protocolo 3-Strikes**:
  - **Tentativa 1-2**: Analise o erro, ajuste sintaxe/imports e re-execute.
  - **Tentativa 3**: Aborte, execute `git checkout -- .`, e gere o relatório de falha técnica citando a ambiguidade no GDD.

## 5. ENTREGA E EVIDÊNCIA ESTRUTURADA

Gere o output final usando o `docs/templates/evidence-template.md`:

- Link para seções do GDD.
- Snippet de `coverage-summary.json` provando 100%.
- Lista de casos de borda testados.
- Registro de ADR em `docs/adr/` para qualquer decisão micro-arquitetural.
