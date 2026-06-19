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

## T87 - Equipped Weapon UI

- `combatEncounterSession` now owns the app-boundary wiring for `EquipmentLoadoutService`, `InMemoryEquipmentCatalogRepository`, and official equipment records.
- `CombatEncounterPanel.svelte` receives `buildEquipmentLoadout`, `defaultWeaponId`, and `equipmentWeapons` as props; the feature UI does not instantiate the repository.
- The local weapon selector defaults to `longsword`/`Espada Longa` and only feeds session-character attackers.
- Aria keeps the fixed training profile even when the selector has a visible weapon value.
- `createCombatTrainingAttackProfile` receives `activeWeaponProfile` only after the loadout resolves, preserving `exactOptionalPropertyTypes`.
- T87 does not persist selected weapon ids, mutate inventory, consume durability, apply proficiency, support dual wield, or change save v5.

## T88 - Weapon Dice Roll Contract

- `CombatEncounterDamageInput` now accepts optional `weaponDice` with the supported official expressions `1d4` and `1d8`.
- `CombatEncounterService` owns the bridge from weapon dice expression to `DiceService.rollDie`; `DamagePipelineService` still receives only the rolled `baseDiceTotal`.
- Weapon damage rolls create a `weaponDamageRolled` event with the dice audit id, natural roll, Matriz value, and modifier total before `damageApplied`.
- `combatEncounterSession` passes the same deterministic `DiceService` into attack resolution and weapon damage so rendered training remains reproducible.
- Unsupported future expressions stay marked as `contrato pendente` instead of being silently rolled.
- T88 does not add RD, affinity behavior, proficiency, durability wear, save v6, persistence, or new UI controls.

## T89 - Combat Target Defenses

- `CombatTrainingTarget` now carries fixed `damageReduction` and supported defensive `affinities` for training targets.
- Target defenses are copied at the app/session boundary in `combatEncounterSession.createAttackInput`; `CombatEncounterService` and `DamagePipelineService` stay unchanged.
- The training guard has no defenses, the duelist has RD 1 plus physical resistance, and the bulwark has RD 2 plus physical immunity for contract coverage.
- T89 intentionally supports only resistance and immunity on training targets. Vulnerability remains out of scope because the official `+1d6` needs an auditable dice contract.
- Defenses remain local training data, not monster rules, armor equipment, save data, or persistence.

## T91 - Equipped Defense Display

- `combatEncounterSession` now provides default armor/shield ids and filtered official armor/shield lists to the combat panel, keeping repository setup at the app boundary.
- `CombatEncounterPanel.svelte` passes `armorId` and `offHandShieldId` into `buildEquipmentLoadout` with the selected weapon id, so the UI reflects the same loadout conflict rules as the equipment entity.
- Session characters default to Couro plus Escudo Redondo and show `CA equipada +3`; Aria continues to show the fixed training behavior.
- Selecting a two-handed weapon while a shield is equipped intentionally clears the active loadout and surfaces the hand-conflict failure until the shield is set to `Sem escudo`.
- The displayed defense profile is informational only. T91 does not alter attacks received, damage, HP, save data, durability, target AI, or official monster behavior.

## T92 - Training Enemy Attack Against Equipped CA

- `combatTrainingEnemyAttack.ts` calculates the transient defender CA as `10 + level + physical + armor bonus + shield bonus` for session characters, following the current CA formula and official catalog bonuses.
- `CombatTrainingEnemyAttackService` resolves a fixed training target attack through `ResolutionService` and returns log entries only; it never calls `DamagePipelineService`, mutates HP, writes save data, consumes durability, or creates monster AI.
- `CombatEncounterPanel.svelte` resolves the target attack only when the active attacker is a session character and the loadout snapshot is available. Aria keeps the passive target-turn log.
- UI actor metadata from attacker options must be sanitized to `{ id, label }` before entering the strict training enemy attack schema.
- The defense axis currently uses the character `physical` value directly because no armor-category cap is implemented in code yet. Add the cap only after an explicit rule slice defines it.

## T94-T96 - Training Incoming Damage And Local Defender HP

- `CombatTrainingEnemyAttackService` now receives a `CombatDamagePort` and calculates fixed incoming training damage only after a hit against equipped CA.
- The incoming damage profile is intentionally local and explicit: physical damage, `baseDiceTotal: 4`, `matrixValue: 2`, no extra modifier, no RD, no affinity, and critical multiplier delegated to `DamagePipelineService`.
- Misses return `incomingDamage: null`; damage pipeline failures return `DAMAGE_PIPELINE_FAILED`.
- `combatTrainingDefenderHitPoints.ts` owns the non-persistent defender HP ledger, deriving max HP through `CharacterDerivedStatsService` and clamping local training HP at 0.
- `CombatEncounterPanel.svelte` displays `HP de treino` only for session characters and appends local HP logs after the target attack.
- Reaching 0 HP de treino does not apply Moribundo, Inconsciente, death tests, save changes, durability, or real character HP mutation.

## T97 - Training Defender HP Terminal State

- `createCombatTrainingDefenderHitPointsView` exposes the local defender HP terminal state as a testable view model instead of embedding the copy only in Svelte.
- `applyCombatTrainingDefenderDamage` now short-circuits when the local ledger is already at 0 HP, preserving the state and logging that no new training damage was calculated.
- `CombatEncounterPanel.svelte` renders `combat-training-defender-terminal` with `Teste recebido encerrado` and uses the view model before resolving another target attack.
- The terminal state remains local to the encounter. It does not introduce real HP mutation, save, Moribundo, Inconsciente, durability, official monsters, or docs/system promotion.

## T99 - Real Damage Event Contract

- `combatRealDamageEvent.ts` creates a pure `realDamageReceived` event contract without mutating character HP.
- The contract requires an explicit event ledger and appends immutably, preserving the input ledger for event-sourcing safety.
- Typed failures cover missing target, missing ledger, absent or zero damage, terminal target state, and schema validation.
- The event deliberately omits `currentHitPoints` and `nextHitPoints`; HP replay remains a future approved phase.
- T99 does not wire UI, save v6, SQLite, Worker persistence, Moribundo, Inconsciente, concentration, DoT, durability, or official monsters.

## T101 - Real Hit Points Replay

- `combatRealHitPointsReplay.ts` derives HP real from `realDamageReceived` events without mutating records, saves, or UI state.
- The replay filters by `targetId`, preserves unrelated events, sums matched damage, and clamps the visible HP at 0.
- Overkill on the event that reaches 0 HP is accepted, but any later matching damage event returns `REAL_HIT_POINTS_EVENT_AFTER_TERMINAL`.
- Typed failures cover invalid input, missing target, missing ledger, and post-terminal event ordering.
- T101 still does not apply Moribundo, Inconsciente, concentration, DoT, durability, persistence, Worker, SQLite, or official monster behavior.

## T102 - Real Damage Ledger Update

- `combatRealDamageLedgerUpdate.ts` composes `replayCombatRealHitPoints` before and after `createCombatRealDamageReceivedEvent`.
- The bridge does not duplicate HP math; it adapts replay state into the T99 event target and returns the replayed next HP.
- Wrapped failures distinguish replay failures (`REAL_DAMAGE_REPLAY_FAILED`) from event append failures (`REAL_DAMAGE_EVENT_FAILED`).
- New damage after replayed terminal HP is blocked by the existing T99 terminal guard, while the event that reaches 0 HP remains allowed.
- T102 still does not add UI, save v6, persistence, Worker, SQLite, Moribundo, Inconsciente, concentration, DoT, durability, or official monsters.

## T103 - Real Damage Preview View

- `combatRealDamagePreviewView.ts` owns the pt-BR user copy for future real HP preview rendering.
- Every view state uses the phrase `Prévia local de HP real` and states that it does not save the sheet or apply Moribundo/Inconsciente.
- The view model separates unavailable, active, terminal, and failure states before Svelte consumes the contract.
- Technical failure messages are intentionally not surfaced in UI copy.
- T103 still does not add Svelte rendering, save v6, persistence, Worker, SQLite, or official terminal-state application.

## T104 - Real Damage Preview UI

- `CombatEncounterPanel.svelte` now owns a local `realDamageReceived` ledger for session-character preview only.
- The preview updates only after the training target hits and produces incoming training damage; misses leave the preview unchanged.
- Resetting the encounter, changing attacker, changing target, or changing equipment through reset clears the preview ledger and event counter.
- The rendered block is separate from `HP de treino`, uses `combatRealDamagePreviewView.ts` copy, and remains hidden for Aria.
- T104 still does not save HP, mutate character records, create save v6, Worker/SQLite persistence, Moribundo, Inconsciente, concentration, DoT, durability, or official monsters.

## 2026-06-16 - Persistent Inventory Loadout In Combat

- `CombatEncounterPanel.svelte` no longer owns local weapon, armor, or shield selectors for session characters.
- The panel receives a `CombatPersistentLoadoutResolver` prop and renders the persisted `mainHand`, `offHand`, and `armor` snapshot with `combat-persistent-loadout` test ids.
- The resolver type lives in `combat-encounter`, but the app boundary implements it so this feature does not import sibling `inventory-management`.
- Missing weapons now block attack and expose `Abrir Inventario`; changing equipment happens in the Inventory tab.
- This step does not add save v8, durability, consumable use, real HP persistence, official monsters, or docs/system promotion.

## 2026-06-17 - Potion Belt Quick Access

- `combatPotionBelt.ts` defines resolver and consumer ports owned by Combat; the app implements them with the inventory ledger.
- `CombatEncounterPanel.svelte` renders `combat-potion-belt`, `combat-potion-belt-summary`, and `combat-use-potion-belt-button` only for session-character attackers.
- Using the potion belt appends the returned log entry and refreshes the snapshot, but it does not change `HP de treino`, real HP preview, conditions, durability, or turn state.
- The UI maps inventory/ledger/entry failures into pt-BR combat copy while keeping technical failures typed.

## 2026-06-18 - Broken Equipment Gate

- Combat still does not import `inventory-management`; the app-level persistent loadout resolver inspects durability on the derived loadout.
- If any equipped slot resolves as `broken`, the resolver returns `COMBAT_LOADOUT_EQUIPMENT_INVALID` before attack or defense profiles are built.
- `damaged` has no combat modifier in this slice, and Combat still does not consume durability automatically.

## Sources

- `docs/architecture/feature_state_machines.md`
- `docs/system/survival/00-mecanicas-fundamentais.md`
- `docs/system/survival/05-00-regras-de-classe.md`
- `docs/system/combat/03-codex-de-combate-e-condicoes.md`
- `docs/system/combat/18-tratado-de-dano.md`
