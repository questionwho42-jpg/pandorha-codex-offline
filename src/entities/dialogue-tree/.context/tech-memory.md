# Technical Memory

# DialogueTree Tech Memory

- T54 criou a primeira árvore de diálogo read-only para `training-broker`.
- A entidade mantém `dialogue_nodes` e `dialogue_options` como contratos Drizzle-Zod, mas sem migration real nesta fase.
- As opções apontam para `DialogueChoice` por `choiceId` técnico; a validação cruzada fica em testes para evitar importação obrigatória entre entidades irmãs no runtime.
- A árvore prepara o argumento social; ela ainda não executa resolução, consequência ou save próprio.

## 2026-05-24T07:38:10.771Z

### Error Log
Focused catalog tests initially failed because the new optional fields were missing from the schema/catalog. After adding the optional schema fields and catalog values, the remaining test expectation was adjusted to treat unrestricted option fields as absent rather than explicitly undefined.

### Technical Summary
T58 extends DialogueOptionRecord with optional minimumMentalHp and blockedReason fields. The read-only training-broker catalog gates the Pressionar option at minimumMentalHp 6 while Persuadir and Barganhar remain unrestricted and omit the optional keys. No Drizzle migration or save version change was generated for this catalog-only phase.

### Patterns And Decisions
- Keep implementation details tied to local module boundaries.
- Preserve previous entries and append new findings instead of overwriting memory.

## 2026-05-24T07:59:37.766Z

### Error Log
T59 tests were written first and failed with missing training-informant nodes/options. Adding the read-only catalog entries made DialogueTreeCatalogService, DialogueTraversalService, and SocialDialogueTreeView focused tests pass.

### Technical Summary
T59 expands the read-only dialogue catalog with a second training tree for training-informant. The new tree has start/response nodes for Persuadir, Barganhar, and Pressionar. The Pressionar option uses minimumMentalHp 7 and a pt-BR blockedReason, demonstrating option availability on an NPC whose starting mental HP is 6. No migration, save v5, or authored-lore import was introduced.

### Patterns And Decisions
- Keep implementation details tied to local module boundaries.
- Preserve previous entries and append new findings instead of overwriting memory.

## 2026-05-26T09:21:25.000Z

### Error Log
The first T64 focused run failed after the catalog was added because the opening copy said `a moral` instead of the contracted phrase `moral da tropa`. The fix was to make the catalog text explicit rather than weakening the view test.

### Technical Summary
T64 expands the read-only dialogue catalog with `training-captain`. The tree has four nodes and three options, reuses the existing `persuade`, `bargain`, and `threaten` choice ids, and points to `docs/system/survival/06-npcs-e-aliados.md` as the official source. `Pressionar` is gated by `minimumMentalHp: 8` with pt-BR blocked copy; no schema, migration, save v5, faction, Infamy, or NPC relationship contract changed.

### Patterns And Decisions
- Keep official seed trees as catalog data until dialogue becomes user-authored or dynamically loaded.
- Keep user-visible copy used by smokes literal in UTF-8 so static contracts remain readable.

## 2026-05-26T15:45:00.000Z

### Error Log
T65 started with a red script fixture run because `scripts/dialogue_seed_smoke.mjs` did not exist yet. After adding the AST-based static smoke, fixture tests and the real catalog smoke passed.

### Technical Summary
T65 adds `qa:dialogue-seeds` as a recurring static contract for short training dialogue trees. The script parses `NPC_CATALOG`, `rawDialogueNodeCatalog`, and `rawDialogueOptionCatalog` with the TypeScript compiler API, resolves simple string constants, and validates 4 nodes, 3 opening options, stable `persuade/bargain/threaten` ordering, valid `nextNodeId`, matching `sourceFile`, and `blockedReason` on HP-gated options.

### Patterns And Decisions
- Validate seed structure through automation before adding more catalog content.
- Keep the smoke static and dependency-free beyond existing TypeScript; do not execute app code or add runtime APIs.
