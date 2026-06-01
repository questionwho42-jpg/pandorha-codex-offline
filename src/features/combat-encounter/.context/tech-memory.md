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

## T22D - Session Attacker Selection

- `combatSessionAttacker.ts` adapts `CharacterRecord` into `CombatEncounterActorRef` for the UI without applying character stats.
- `CombatEncounterPanel.svelte` always includes Aria and adds session characters as selectable attackers.
- Changing attacker resets HP, last result, error, and log while preserving the selected target.
- The selected attacker is passed into `combatEncounterSession.createAttackInput`, so service logs use the chosen name.

## T22E - Minimal Turn State

- `CombatTurnService` adds deterministic in-memory turn state with round, active actor, action points, and a turn event ledger.
- The turn order is fixed as `[attacker, target]`; no initiative roll or enemy AI is introduced.
- The browser panel spends 1 action only after `CombatEncounterService.resolveAttack` returns a technical success.
- Changing attacker, changing target, or resetting the encounter creates a fresh turn state with 3/3 actions.
- `model-api.ts` remains the public non-UI API for app/model imports, while `index.ts` may still export the Svelte panel.

## T22F - Attacker Derived Stats Summary

- `combatAttackerStatsView.ts` maps the selected attacker to display-only derived stats when the attacker is a session character.
- The view model uses `CharacterDerivedStatsService` and official character classes from the app boundary; the feature still does not import `app`.
- The combat panel shows max HP, initiative, and carry slots as information only.
- Attack math, target HP, equipment, initiative order, and damage remain deterministic training values.

## T22G - Training Damage Profile

- `combatTrainingAttackProfile.ts` maps the selected attacker to deterministic training damage inputs.
- Aria and unknown attackers keep the fixed training matrix value 2.
- Session characters use their `physical` value as the damage `matrixValue`, following the rule that standard melee attacks use Matriz Fisica.
- The app session injects the profile into `createAttackInput`; `CombatEncounterService` and `DamagePipelineService` remain unchanged.
- Equipment, weapon dice, attack rolls, fixed bonus, HP, and persistence are still outside this step.

## T22H - Training Target Turn

- `combatTrainingTargetTurn.ts` records a pt-BR log item when the active actor is the selected training target and the user ends its turn.
- The target turn does not call `CombatEncounterService`, roll dice, apply damage, or create AI behavior.
- The panel appends the hold-position log before advancing back through `CombatTurnService.endTurn`.

## T22I - Encounter Outcome

- `combatEncounterView.ts` now exposes `isEncounterComplete`, `encounterOutcomeLabel`, `encounterOutcomeDescription`, and `canReset`.
- A target at 0 HP blocks attack and end-turn while keeping reset available.
- `CombatEncounterPanel.svelte` renders a visible outcome block only when the training target is defeated.
- No XP, loot, reward, persistence, or official monster outcome was introduced.

## T85.1 - Equipment Weapon Attack Profile Hook

- `combatTrainingAttackProfile.ts` now accepts an optional `EquipmentWeaponAttackProfile`.
- Session characters can produce an `equipmentWeapon` attack profile using real weapon dice expression, deterministic training dice total, damage type, and matrix from `entities/equipment`.
- Existing Aria/training behavior stays unchanged when no weapon profile is supplied.
- Extra modifiers remain `0` for weapon profiles until talents, runes, conditions, or full damage rules are introduced.
- The combat UI is not wired to a loadout yet; this is a service/domain contract for the next equipment slice.

## Sources

- `docs/architecture/feature_state_machines.md`
- `docs/system/survival/00-mecanicas-fundamentais.md`
- `docs/system/survival/05-00-regras-de-classe.md`
- `docs/system/combat/18-tratado-de-dano.md`
