# Combat Encounter Tech Memory

## T22A - Minimal Combat Encounter Core

- `CombatEncounterService` lives in `src/features/combat-encounter` because it composes shared services into a user action: resolving a simple attack.
- The service uses `ActionQueueService` before resolution so combat commands do not bypass the official queue.
- Attack resolution targets the defender CA by passing `target.armorClass` as the global test DC.
- HP is derived from an in-memory event ledger. The service does not directly mutate HP without a `damageApplied` event.
- Logs are returned in pt-BR because they are intended to become visible to the user in T22B.
- Tests use deterministic dice, clocks, and explicit fake services. No `jest.mock()` is used.
- A scaffold generator for repeated `service + tests + .context + coverage` modules may be useful after the next similar module, but T22A did not create it to avoid adding process scope.

## T22B - Vertical Slice UI

- `CombatEncounterPanel.svelte` is the first user-facing combat surface and stays inside the `combat-encounter` feature.
- The panel receives service access and the deterministic input builder from `src/app/model/combatEncounterSession.ts`; the feature does not import `app`.
- `combatEncounterView.ts` owns labels, empty log copy, HP/CA labels, defeated state, and final result summary so UI copy is testable outside Svelte.
- The encounter is intentionally fixed: Aria attacks a Training Guard with deterministic d20 and fixed damage inputs.
- Combat UI uses the project Tailwind theme classes only; no `<style>` block or Tailwind default colors were added.

## T22C - Training Target Catalog UI

- `combatTrainingTargetCatalog.ts` stores three static training targets with English technical ids and pt-BR labels.
- `CombatEncounterPanel.svelte` lets the user select a target and resets HP, last result, error, and log when the target changes.
- `combatEncounterSession` now builds attack input from the selected target instead of a single hardcoded target.
- This is not a `Monster` entity and does not introduce Drizzle, SQLite, Worker, initiative, grid, or official creature rules.

## Sources

- `docs/architecture/feature_state_machines.md`
- `docs/system/survival/00-mecanicas-fundamentais.md`
- `docs/system/combat/18-tratado-de-dano.md`
