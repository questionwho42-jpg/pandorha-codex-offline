# Orchestrator Plan — Doc Update Phases 51–67+
## Created: 2026-06-08T09:27

## Gap Analysis Results (pre-read complete)

### Entities discovered in src/entities/ NOT in feature-coverage-map.md:
- `siege` — has SiegeService.ts, InMemorySiegeRepository.ts, DrizzleSiegeRepository.ts, SiegeService.spec.ts, siegeSchema.ts → FULL entity
- `lore` — has LoreService.ts, ILoreRepository.ts, InMemoryLoreRepository.ts, DrizzleLoreRepository.ts, LoreService.spec.ts → FULL entity
- `combat` — listed in features not entities (src/entities/combat exists too, but feature-map has features/combat)

### Features discovered in src/features/ NOT in feature-coverage-map.md:
- `chat` — has ChatLog.svelte, RollModifiersDrawer.svelte, chatState.spec.ts
- `sandbox` — has GMSandboxPanel.svelte, sandbox.css (UI only, no domain tests found)

### Status updates needed:
- `features/research` — was "Em progresso", now has ResearchPanel.svelte → UI exists → 🔧 partial (UI Svelte exists, domain still partial)
- `features/social` — had NegotiationPanel.svelte + CountermagicService → now has BargainWindow, DialogueWindow, FactionPanel, NegotiationPanel, SocialDemo, SocialStandings → rich UI

### RPC Cache:
- `src/shared/rpc/model/rpcCache.ts` EXISTS → confirmed for CONTEXT.md

### ADR status:
- Last ADR is ADR-013 → next would be ADR-014 and/or ADR-015

## Tasks

| Task | Status |
|------|--------|
| R1 — feature-coverage-map.md | pending |
| R2 — CONTEXT.md | pending |
| R3 — changelog.md | pending |
| R4 — llms.txt | pending |
| R5 — ADR evaluation | pending |

## Count Summary (for feature-coverage-map)
### Entities (current 23 → new 25):
- Add: siege, lore → 23 + 2 = 25
- Completos: was 21, siege=✅, lore=✅ → 23
- Parciais: dungeon stays 🔧 → 1
- Não iniciados: 0
- Sem schema DB: catálogos only = 6 (unchanged, siege and lore have schema)

### Features (current 25 → new 27):
- Add: chat, sandbox → 25 + 2 = 27
- UI Completa: was 10 → chat has full UI components (ChatLog.svelte), sandbox has GMSandboxPanel.svelte
- Adjust social to "UI avançada" since it has 6 Svelte files
