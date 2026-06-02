# Pandorha Engine Testing And Next Steps Roadmap

## Purpose

This document tells the next agent exactly how to expand tests for everything already implemented, how to validate every local MCP and skill, and how to use those results to guide the next implementation steps.

It is a QA roadmap, not a replacement for the source-of-truth rules in `llms.txt`, `AGENTS.md`, `docs/architecture/blueprint.md`, `docs/architecture/gdd.md`, and `docs/conventions/core-conventions.md`.

## Current Baseline

Implemented project code:

- Root Node/TypeScript/Vitest/Biome scaffold.
- `src/shared/game-rules.ts` with Pandorha constants.
- `src/shared/lib/result.ts` with the shared `Result` helpers.
- `src/entities/character` tracer bullet:
  - Drizzle `characters` schema.
  - Drizzle-Zod input/output schemas.
  - Character creation rule validation for Eixos, Aplicacoes, level, and Tier caps.
  - `CharacterService` with Result Pattern.
  - Repository contract, Drizzle adapter, in-memory fake, builder, and tests.
  - Module `.context` memory files.

Baseline commands that must stay green:

```powershell
npm.cmd run lint
npm.cmd test
npm.cmd run test:coverage
npm.cmd audit --audit-level=high
```

Expected baseline result:

- Biome check passes.
- `tsc --noEmit` passes.
- Character unit tests pass.
- Coverage summary reports 100% for executable Character service/model files.
- Audit reports zero high vulnerabilities.

## Global Test Policy

Every service or domain rule must follow this loop:

1. Read the relevant source-of-truth rule in `docs/system`, `docs/architecture/gdd.md`, and `docs/architecture/blueprint.md`.
2. Write the failing test first.
3. Use builders and fakes, never partial mocks.
4. Return typed `Result` failures for business errors.
5. Validate with Biome, TypeScript, unit tests, coverage, and relevant MCP checks.
6. Update the module `.context` files when a new pattern, failure, or scaling decision is learned.
7. Record the work with `scripts/pandorha_process_automation.py`.

Coverage rule:

- Services and domain logic require 100% line, statement, branch, and function coverage.
- Pure type-only files should not be included in coverage thresholds.
- Infrastructure adapters should be tested with contract tests or fake drivers before they are included in global coverage gates.

No forbidden test shortcuts:

- No `jest.mock`.
- No partial `vi.mock`.
- No SQLite WASM in unit tests.
- No `throw new Error()` for domain/business failures.
- No raw object casts such as `as Character` where a builder can express the fixture.

## Root Project Test Expansion

### Character Entity

Already covered:

- Valid level 1 creation.
- Invalid Eixo total.
- Invalid Aplicacao total.
- Tier I cap violation for Eixos and Aplicacoes.
- Blank name and root-level Zod input failures.
- Invalid generated ID before persistence.
- Corrupted repository output.
- Repository write failure with and without details.
- Tier boundary mapping for levels 1, 5, 6, 10, 11, 15, 16, and 20.
- Out-of-range level failures.

Add next:

- `DrizzleCharacterRepository` contract tests using a fake Drizzle query builder.
- A real SQLite adapter integration test only after the project chooses the final SQLite WASM driver and migration flow.
- Tests for duplicate character IDs once uniqueness behavior is defined.
- Tests for ancestry/class/background foreign keys after those tables exist.
- Tests for derived values in a separate Character Derived Stats service:
  - HP = `(HP Base da Classe + Fisico + Resistencia) * Nivel`.
  - PV = `(Fisico + Interacao) + Nivel + bonus de classe`.
  - EE = `(Mental + Resistencia) + Nivel + bonus de classe`, or the final class-specific rule.
  - CA and Iniciativa after armor/class rules are implemented.

### Shared Rules

Add next:

- Snapshot tests for `PANDORHA_RULES` shape so accidental renames break tests.
- Rule-reference tests that assert every numeric constant has a source comment or metadata entry.
- A generated documentation table that maps constants back to rule files.

### Result Helper

Add next:

- Minimal unit tests for `ok` and `fail` only if the helper grows beyond its current trivial shape.
- Prefer testing `Result` behavior through services rather than over-testing the helper.

## MCP Test Matrix

Run all MCP tests from the repository root:

```powershell
npm.cmd test --prefix mcp/pandorha-arch-guard
npm.cmd run validate:stdio --prefix mcp/pandorha-arch-guard

npm.cmd test --prefix mcp/pandorha-knowledge
npm.cmd run validate:stdio --prefix mcp/pandorha-knowledge

npm.cmd test --prefix mcp/pandorha-memory-bridge
npm.cmd run validate:stdio --prefix mcp/pandorha-memory-bridge

npm.cmd test --prefix mcp/pandorha-db-auditor
npm.cmd run validate:stdio --prefix mcp/pandorha-db-auditor
```

### `pandorha-arch-guard`

Current tool:

- `validate_implementation`

Already expected:

- Detects Svelte rune usage.
- Blocks direct private imports across `src/features`.
- Warns on default Tailwind colors.

Add next tests:

- Validate `src/entities` layer awareness.
- Ensure public imports from `src/entities/<entity>/index.ts` are allowed.
- Ensure private imports from another entity model/domain are blocked if the project adopts that rule.
- Add fixtures for:
  - valid same-feature private import.
  - invalid cross-feature private import.
  - valid shared import.
  - Tailwind token usage.
  - forbidden Tailwind default color.
  - `.ts` entity service with no Svelte runes.

Implementation next step:

- Extend the guard to detect both `src/features` and `src/entities` and report the layer explicitly instead of returning `feature: null` for entities.

### `pandorha-knowledge`

Current tool:

- `search_rpg_rule`

Already expected:

- Indexes markdown under `docs` and `lore`.
- Returns ranked matches with file path, heading context, and snippets.

Add next tests:

- Query `personagem jogador criação de ficha` returns `docs/system/survival/guia-criacao-de-ficha.md`.
- Query `Matriz Física Mental Social` returns `docs/system/survival/00-mecanicas-fundamentais.md` or the matrix files.
- Query `HP Base Classe Físico Resistência` returns the current HP rule and does not prefer deprecated formulas.
- Query with no match returns a structured empty result, not an exception.
- Limit parameter is respected from 1 to 10.
- Index ignores non-markdown media files.

Implementation next step:

- Add a golden-results fixture for core RPG terms: Character, HP, EE, CA, Dano, Magia, Ancestralidade, Classe, Condicao, Hexcrawl.

### `pandorha-memory-bridge`

Current tool:

- `commit_module_context`

Already expected:

- Writes `tech-memory.md`, `scaling-roadmap.md`, and `plain-english.md`.
- Current README says it writes under `src/features/[module]/.context`.

Add next tests:

- Valid module name creates exactly the three context files.
- Existing context files are updated without deleting unrelated content.
- Invalid path traversal such as `../outside` is rejected.
- Empty required fields fail validation.
- Entity modules are supported if the project keeps `.context` under `src/entities`.

Implementation next step:

- Decide whether memory bridge should support both `src/features` and `src/entities`; Character already uses `src/entities/character/.context`.

### `pandorha-db-auditor`

Current tools:

- `get_actor_stats`
- `verify_math`
- `execute_query`

Already expected:

- Reads actor stats.
- Validates HP and EE when matching columns exist.
- Allows only read-only SQL.

Add next tests:

- In-memory SQLite fixture with one valid actor.
- HP mismatch returns a clear failure payload.
- EE mismatch returns a clear failure payload.
- `SELECT` and safe `PRAGMA` succeed.
- `INSERT`, `UPDATE`, `DELETE`, `DROP`, and multi-statement SQL are rejected.
- Unknown actor returns a typed not-found result.

Implementation next step:

- Align auditor table expectations with the new `characters` schema or introduce a compatibility view once actor/character naming is finalized.

## Skill Test Matrix

Skills are not all runtime tools. Test each skill at the highest level it supports:

- Metadata test: `SKILL.md` exists, has `name`, `description`, trigger boundaries, inputs, outputs, and guardrails.
- Asset test: required assets and references exist and parse.
- Script test: scripts run against valid and invalid fixtures.
- Behavior test: the skill refuses out-of-scope inputs when it has a strict trigger policy.

### `ai-docs-formatter`

Add tests:

- Validate `assets/response-schema.json`.
- Run `scripts/formatter.ts` against a minimal markdown fixture.
- Verify output preserves required headings and strips unsupported fields.

### `api-contract-tester`

Add tests:

- Run `scripts/extract_ast.py` against a small TypeScript fixture.
- Compare extracted endpoints/schemas to a minimal OpenAPI fixture.
- Fail when descriptions are missing or schema names drift.

### `build-test-verify`

Add tests:

- Run `scripts/verify-coverage.ts` against a passing `coverage-summary.json`.
- Run it against a failing summary and assert non-zero exit.
- Run `scripts/check-query-budget.ts` against a small RPC/query fixture.

### `character-builder`

Add tests:

- Validate `references/rules_manifest.json`.
- Run `scripts/validator.py` with a valid ficha fixture.
- Run it with invalid 6/6 distribution and expect failure.
- Run `scripts/sync_db.py` only against a temporary SQLite file.

### `core-conventions`

Current gap:

- `scripts/validate.sh` exists but is empty.

Add tests:

- First implement a non-empty validator or replace it with a PowerShell/Node-compatible validator.
- Validate named exports for `.ts` files.
- Fail on `throw new Error`.
- Fail on `export default` in `.ts`.
- Fail on default Tailwind colors in `.svelte`.
- Pass on current Character domain files.

### `crafting-engine`

Add tests:

- Valid recipe consumes materials, gold, and time.
- Invalid material tag fails without mutation.
- Insufficient gold fails without mutation.
- Collection of completed item succeeds once and fails on duplicate collection.

### `create-pull-request`

Add tests:

- Validate PR description includes Done, Next, Risks, Improvements.
- Validate the description declares whether `pandorha_process_automation.py` was used.
- Fail when Human Review Gate content is missing.

### `dialogue-architect`

Add tests:

- Validate `assets/example_node.json`.
- Run `scripts/validate_tree.ts` with a valid tree.
- Fail on missing HP Mental requirement, invalid global flag, or unreachable node.
- Verify audiovisual trigger fields follow the documented AST.

### `hexcrawl-generator`

Add tests:

- Validate `references/hex-schema.sql`.
- Run `scripts/verify-topography.ts` against a tiny known-valid axial grid.
- Fail on disconnected region, invalid tier, or impossible neighbor relation.

### `magic-validator`

Add tests:

- Valid spell fixture passes with correct EE cost.
- Invalid upcast cost fails.
- Unknown universal tag fails.
- Hybrid magic fixture is checked against the expanded magic codex.

### `monster-factory`

Add tests:

- Parse `references/master_table.json` and `references/roles.json`.
- Generate the same monster twice with the same seed and assert deterministic output.
- Fail when role/tier combination is unsupported.
- Validate generated stat math against the combat/GDD expectations.

### `pandorha-maintenance`

Add tests:

- Run `scripts/pandorha_process_automation.py init` in a temporary copy.
- Run `start`, `checkpoint`, `complete`, `unfinished`, and `snapshot`.
- Assert markers in `task-ledger.md` and `change-inbox.md` remain balanced.
- Assert completed tasks have timestamps and model/config fields.
- Assert snapshot records do not claim semantic validation.

### `self-review-checklist`

Current risk:

- Scripts are Bash-based; Bash/WSL is not available in the current Windows environment.

Add tests:

- Provide PowerShell or Node equivalents for `hard_stop.sh` and `run_json_tests.sh`.
- Add fixtures for pass/fail review checklists.
- Fail when forbidden patterns are present.

### `skill-git-commit`

Add tests:

- Run `scripts/validator.py` against staged diff fixtures.
- Fail on mixed commit scopes.
- Fail on secret-like content.
- Fail on invalid branch names.
- Pass on a conventional feature commit fixture.

### `world-state-manager`

Add tests:

- Validate `references/acl_policies.json`.
- Validate `references/fsm_schemas.ts` compilation.
- Run `scripts/world_state_cli.ts` against a temporary world-state fixture.
- Fail on unauthorized state mutation.
- Fail when a narrative claim is made without querying state first.

## Unified Test Harness To Build

The zero-token local command is:

```powershell
npm.cmd run quality:gate
```

The command should run, in order:

1. Root `npm.cmd run lint`.
2. Root `npm.cmd test`.
3. Root `npm.cmd run test:coverage`.
4. Root `npm.cmd audit --audit-level=high`.
5. Every MCP `npm.cmd test --prefix`.
6. Every MCP `npm.cmd run validate:stdio --prefix`.
7. Every skill script test that has a deterministic fixture.
8. `python scripts/pandorha_process_automation.py snapshot --reason quality-gate`.

Required output:

- One JSON summary in `artifacts/quality-gate/summary.json`.
- One markdown report in `artifacts/quality-gate/report.md`.
- Exit code `0` only when every required gate passes.

Do not include generated `artifacts/` in Git unless the project explicitly decides to preserve evidence files.

Partial gates are also available:

```powershell
npm.cmd run quality:root
npm.cmd run quality:mcp
npm.cmd run quality:skills
```

First full run evidence:

- Command: `npm.cmd run quality:gate`
- Result: passed
- Root gates: lint, unit tests, coverage, and audit passed.
- MCP gates: tests and `validate:stdio` passed for `pandorha-arch-guard`, `pandorha-knowledge`, `pandorha-memory-bridge`, and `pandorha-db-auditor`.
- Skill gates: metadata smoke tests passed for all 15 local skills.
- Generated report path: `artifacts/quality-gate/report.md` (ignored by Git).
- Generated summary path: `artifacts/quality-gate/summary.json` (ignored by Git).

## Next Implementation Order

### Phase 1: Make The Current Gates Complete

1. Keep `scripts/run_full_quality_gate.mjs` green.
2. Expand the skill gate from metadata smoke tests into deterministic fixture tests.
3. Fix or document every failing MCP/skill gate before implementing new domain systems.

### Phase 2: Harden Character Persistence

1. Add Drizzle repository contract tests.
2. Decide the SQLite WASM driver and migration command.
3. Add `npm run db:generate` only after Drizzle config exists.
4. Introduce `characters` migration.
5. Add DB auditor compatibility for Character or formalize Actor vs Character naming.

### Phase 3: Extend Architecture Guard

1. Add `src/entities` awareness.
2. Add public API boundary checks.
3. Add FSD layer violation tests for `app`, `pages`, `widgets`, `features`, `entities`, and `shared` after those folders exist.
4. Add a root command that validates all changed `.ts` and `.svelte` files.

### Phase 4: Implement Character Derived Stats

1. Create a `CharacterDerivedStatsService`.
2. Test HP, PV, EE, CA, Iniciativa, Carga, and movement as separate rules.
3. Use class/equipment fakes until their real entities exist.
4. Never persist final derived values unless the blueprint changes.

### Phase 5: Add Core Reference Entities

Implement in this order:

1. `ancestry`
2. `character-class`
3. `background`
4. `trait`
5. `talent`
6. `maneuver`
7. `equipment`

Each entity must include:

- Drizzle schema.
- Drizzle-Zod schemas.
- Repository contract.
- Service with Result Pattern.
- In-memory fake.
- Builder.
- 100% service/domain coverage.
- `.context` memory files.
- MCP/arch guard validation.

## Acceptance Checklist For Future Agents

Before marking a future task complete, verify:

- The relevant rule source was read.
- Tests were written before implementation.
- `npm.cmd run lint` passed.
- `npm.cmd test` passed.
- `npm.cmd run test:coverage` passed.
- Relevant MCP tests passed.
- Relevant skill fixture tests passed or the missing test harness is recorded as a blocker.
- `npm.cmd audit --audit-level=high` passed.
- `pandorha_process_automation.py` recorded start/checkpoint/complete or unfinished.
- Module `.context` files were updated for every new feature/module.
- No unrelated local files were staged.
- No generated cache/build artifacts were committed.

## Known Gaps

- Bash/WSL is not available in the current Windows environment; Bash-only skill scripts need Windows-compatible wrappers.
- `pandorha-arch-guard` currently reports `feature: null` for `src/entities`.
- `pandorha-memory-bridge` currently documents `src/features/[module]`, while Character uses `src/entities/character`.
- The root project has no Svelte app shell yet.
- Drizzle migrations are not configured yet.
- `db-auditor` still references actor-style tables; the Character/Actor naming boundary must be decided before persistence validation is final.
