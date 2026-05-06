# Combat Encounter Tech Memory

## T22A - Minimal Combat Encounter Core

- `CombatEncounterService` lives in `src/features/combat-encounter` because it composes shared services into a user action: resolving a simple attack.
- The service uses `ActionQueueService` before resolution so combat commands do not bypass the official queue.
- Attack resolution targets the defender CA by passing `target.armorClass` as the global test DC.
- HP is derived from an in-memory event ledger. The service does not directly mutate HP without a `damageApplied` event.
- Logs are returned in pt-BR because they are intended to become visible to the user in T22B.
- Tests use deterministic dice, clocks, and explicit fake services. No `jest.mock()` is used.
- A scaffold generator for repeated `service + tests + .context + coverage` modules may be useful after the next similar module, but T22A did not create it to avoid adding process scope.

## Sources

- `docs/architecture/feature_state_machines.md`
- `docs/system/survival/00-mecanicas-fundamentais.md`
- `docs/system/combat/18-tratado-de-dano.md`
