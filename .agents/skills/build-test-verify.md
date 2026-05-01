---
title: "Pandorha Engine - QA & Build Automation Protocol"
description: "Strict Agentic TDD Workflow, Self-Healing Rules, and QA Standards"
version: "1.0.0"
enforcement: "Strict / Blocking"
target_agent: "OpenAI Codex / GPT-5.5 / Autonomous Coding Agents"
---

# 🛡️ PANDORHA ENGINE: BUILD, TEST, AND VERIFY PROTOCOL
> **PRIME DIRECTIVE FOR AI AGENTS:** You are the primary QA engine for the Pandorha RPG System. You operate under a strict **Reverse Strict TDD (Test-First)** mandate. You are forbidden to write production code in the Services Layer without first writing a failing boundary test. Precision is absolute. Do not guess math; consult the GDD.

## 1. The Development Loop (TDD & Boundaries)
Every feature implementation MUST follow this exact sequence:

1. **GDD Grounding:** Read the relevant section in `gdd.md`. 
2. **Test-First (Red):** Write the `.spec.ts` file first.
    * **Naming Convention:** Tests MUST use GDD-Linked Semantics. Example: `describe("[GDD 4.1] Cálculo de Carga Máxima")`.
    * **Boundary Driven:** Focus test cases on strict mathematical borders (e.g., Tier 1 vs Tier 4 limits).
3. **Data Mocking:** You MUST use **Type-Safe Builders** (e.g., `HeroBuilder`, `EnemyBuilder`) to generate test entities. NEVER use raw `vi.mock` or inline hardcoded objects (`as Hero`).
4. **Environment Isolation:** Use **Pure DI Fakes** (`FakeRepository`, `FakeEventBus`, `FakeDiceService`, `FakeTimeProvider`). NEVER instantiate SQLite WASM or use global `vi.useFakeTimers` in unit tests.
5. **Implementation (Green):** Write the production code to make the test pass.
6. **Error Handling:** Business rule violations MUST return the **Result Pattern** (e.g., `{ success: false, reason: "OUT_OF_VIGOR" }`). NEVER throw exceptions for RPG domain errors.
7. **Side Effects:** Assert domain events by reading the `fakeEventBus.emittedEvents` array. Do not use `vi.spyOn`.

## 2. Static Analysis & Performance Bar
Before running the Vitest suite, you MUST clear the **Strict Shift-Left Validation Bar**:
1. Run `npx tsc --noEmit`. Fix any TypeScript errors.
2. Run `npm run lint`. Fix any formatting smells.
3. **Big-O Thinking Gate:** Analyze your algorithm statically. Any function in the Service Layer exceeding $O(N)$ time complexity (e.g., nested loops) MUST be refactored using Hash Maps/Dictionaries before committing.

## 3. Self-Healing & Execution (The Circuit Breaker)
If a test fails, you must follow the self-healing protocol:

- **GDD Cross-Validation:** Read the error log, then immediately cross-reference the rule in `gdd.md`. Ask yourself: *"Is the production code wrong, or did I mistranslate the formula in the test?"*
- **Circuit Breaker (Max 3 Tries):** You have a hard cap of **3 attempts** to fix a failing test. If it fails a 4th time, STOP. Commit your work with `chore: [WIP] travamento no teste X`, open a Draft PR, and tag the Human Architect. Do not hallucinate or delete working code.
- **Flaky Tests:** If a test passes sporadically, it is a **State Leak**. Do NOT use `it.retry()`. Inspect the `afterEach` block and ensure `fakeEventBus.clear()` and Builder states are being reset correctly.
- **Strict Scope Revert:** If your new code breaks an existing test in another domain (e.g., Combat breaks Economy), you are PROHIBITED from altering the other domain's code. You violated an Event Contract. Revert your code and fix your implementation.

## 4. Coverage & Refactoring
- **Coverage Proof:** You MUST run `vitest run --coverage.reporter=json-summary`. You are only allowed to proceed if you programmatically parse `coverage-summary.json` and verify `{"lines": {"pct": 100}}`. 
- **Refactoring:** After tests are green, run static complexity linters (Sonar/ESLint rules). Refactor ONLY if the linter flags a code smell. Do not over-engineer working code.

## 5. Delivery & Handoff (Git Protocol)
- **Commits:** Use **GDD-Driven Conventional Commits**. Example: `feat(combat): implementa limite de Eixo Físico [GDD 2.1]`.
- **Pull Request Body:** Generate a **Structured Evidence Template** containing:
    1. Link to the GDD sections affected.
    2. Snippet of the `coverage-summary.json` proving 100% coverage.
    3. Bulleted list of the boundary/edge-case tests implemented.
- **Continuous Learning (ADR):** If you had to make a micro-architectural decision not explicitly detailed in the GDD, create a dated Markdown file in `docs/adr/` (e.g., `004-resolucao-escudos.md`) documenting the context and decision. NEVER edit `gdd.md` or `sdd.md` autonomously.

## 6. Human Code Review
- **Test-Driven Patching:** If the Human Architect leaves a comment requesting a fix or pointing out a missed rule, treat it as a new GDD requirement. You MUST write a new failing test (`it()`) capturing the human's scenario BEFORE altering the production code.