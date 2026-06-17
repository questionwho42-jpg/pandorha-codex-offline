# App Technical Memory

## 2026-05-02

- Added the minimal Svelte 5/Vite browser scaffold as the first navigable app shell.
- Kept T02 intentionally static: no game rules, no custom router, no persistence, and no visual system beyond semantic HTML.
- Used `vite.config.mjs` to preserve the existing `$lib` alias used by root TypeScript and Vitest configuration.
- Added T03 state-driven navigation with a typed `AppNavigationId` contract and local Svelte runes only.
- Kept navigation intentionally local to `src/app`; no external router, database, domain service, or RPG rule was introduced.
- Added T04 Tailwind v4 through the Vite plugin and a CSS-first `@theme` file at `src/app/styles.css`.
- Mapped the official styleguide colors to Tailwind tokens: `void`, `ruin`, `ether`, `bone`, `bronze`, and `blood-shadow`.
- Kept visual shell styling in Tailwind classes inside `App.svelte`; no native `<style>` block was added to the Svelte component.

## 2026-05-05 - T15B Character Catalog Wiring

- `characterSession` now exposes official ancestry, trait, class, and background catalogs to the app surface.
- `App.svelte` passes class and background catalogs into character creation and list features instead of letting those features hardcode options.
- Session persistence remains temporary; catalog wiring is still read-only and does not introduce Worker, SQLite, or OPFS.

## 2026-05-06 - T22B Combat Vertical Slice UI

- Added `combat` to the state-driven navigation contract.
- `combatEncounterSession` wires deterministic combat services for the browser training encounter.
- `App.svelte` renders `CombatEncounterPanel` only in the `Combate` tab and keeps URL-less navigation.
- The combat session is in-memory and fixed; it does not introduce Worker, SQLite, persistence, initiative, grid, or dynamic actors.

## 2026-05-06 - T22C Combat Training Targets

- `combatEncounterSession` exposes the static training target catalog to the app surface.
- `App.svelte` passes `trainingTargets` into `CombatEncounterPanel`; navigation remains state-driven and URL-less.
- The app still avoids official monster entities, persistence, Worker, SQLite, initiative, grid, and dynamic encounter loading.

## 2026-05-06 - T22D Combat Session Attacker

- `App.svelte` passes `characterRecords` into `CombatEncounterPanel`.
- Combat can use session characters as attacker identity while keeping Aria as the training fallback.
- This is a visual/session bridge only; it does not apply derived stats, equipment, class features, persistence, or real combat turns.

## 2026-05-06 - T22E Combat Turn State

- Combat turn state remains owned inside `combat-encounter`; `App.svelte` did not gain new global state.
- The app still passes session characters and deterministic combat services into the panel.
- The turn UI is session-only and resets with attacker/target changes or encounter reset.

## 2026-05-12 - T22F Combat Attacker Derived Stats

- `App.svelte` now passes official character classes into `CombatEncounterPanel` so the feature can show derived stats for session characters.
- Derived stats remain display-only in the combat tab; app state still owns only the session character list.
- No persistence, Worker, equipment, rolled initiative, or real HP integration was added.

## 2026-05-12 - T22G Combat Training Damage Profile

- `combatEncounterSession.createAttackInput` now receives a training attack profile from the combat feature.
- The app still owns deterministic service wiring, while the feature decides whether the selected attacker uses fixed Aria damage or a session character's Matriz Fisica.
- No persistence, Worker, equipment, real weapon dice, or real HP integration was added.

## 2026-05-12 - T22H Combat Training Target Turn

- The combat tab now records a visible log entry when the selected training target turn is ended.
- The app wiring remains unchanged; no enemy AI, enemy attack, Worker, persistence, or official monster data was introduced.

## 2026-05-12 - T22I Combat Encounter Outcome

- The combat tab now renders a defeated-outcome block from the combat view model when the selected target reaches 0 HP.
- Attack and end-turn are blocked by the view model in that state, while reset remains enabled.
- No reward, XP, loot, persistence, Worker, or official monster progression was added.

## 2026-05-13 - T25 Inventory Read-Only UI

- Added `inventory` to the state-driven navigation contract.
- `inventorySession` maps the T23 equipment catalog into read-only slot items and calculates capacity through `InventoryCapacityService`.
- `App.svelte` renders `InventoryReadOnlyPanel` only in the `Inventario` tab.
- No item editing, persistence, Worker, SQLite, equipment effects, hands, runes, or combat integration was added.

## 2026-05-13 - T28 Spell Casting UI

- Added `magic` to the state-driven navigation contract.
- `spellCastSession` wires the T26 spell catalog into `SpellCastBuilderService` with a fixed training caster and target.
- `App.svelte` renders `SpellCastPanel` only in the `Magia` tab and keeps URL-less navigation.
- The UI prepares a command only; it does not spend EE, process ActionQueue entries, execute effects, or integrate with combat.

## 2026-05-14 - T31 Hexcrawl Map UI

- Added `exploration` to the state-driven navigation contract.
- `hexcrawlSession` wires the T29 world-tile catalog into `HexcrawlMovementService` for a fixed seven-hex training map.
- `App.svelte` renders `HexcrawlMapPanel` only in the `Exploracao` tab and keeps URL-less navigation.
- Discovery is stored only in Svelte session state; no Worker, SQLite, world-state persistence, Navigation roll, resource consumption or real encounter table was added.

## 2026-05-15 - T33D Save Load UI

- `saveLoadSession` owns real browser Worker construction and initializes the local SQLite/OPFS database on mount.
- `App.svelte` exposes explicit save/load controls only in the `Personagens` tab, keeping URL-less navigation unchanged.
- Loaded characters are restored into the session repository and resynchronize the next session-character id before new creations.
- Loaded WorldState flags are preserved in app memory for future saves even though there is no dedicated UI for them yet.

## 2026-05-19 - T35D Camp UI

- Added `camp` to the state-driven navigation contract.
- `campSession` wires the camp activity catalog, default camp state, `ClockService`, and `CampHourService` for the browser panel.
- `App.svelte` now owns camp persisted state arrays (`clocks`, `campSessions`, `campAssignments`) and sends them through save/load v2.
- The camp UI remains one-hour only and does not introduce a router, autosave, random event table, recovery engine, or encounter generation.

## 2026-05-19 - T39 PWA Offline Smoke

- Added a minimal app-level PWA status model and service worker registration from `App.svelte`.
- The service worker lives in `public/pandorha-sw.js` and uses runtime same-origin caching plus navigation fallback.
- This is an offline smoke foundation only; it does not add push notifications, background sync, cache UI, manifest icons, or complex update prompts.

## 2026-05-20 - T43 Save Load V4 Social Encounter

- `App.svelte` now carries social encounter records and event records through explicit save/load state.
- No social negotiation UI was added in T43; the arrays are ready for the T44 `Relações` expansion.

## 2026-05-20 - T44 Social Encounter UI

- `App.svelte` renders `SocialEncounterPanel` inside the `Relações` tab.
- The app keeps social encounter records as persisted state and lets the panel convert feature state into v4 save records.
- The first UI uses deterministic training appeals only; no dialogue tree, ResolutionService roll, or world-state flag was added.

## 2026-05-20 - T47 Social Appeal Character UI

- `App.svelte` passes session `characterRecords` into `SocialEncounterPanel` so the UI can select a negotiator.
- `socialEncounterSession` owns the deterministic social appeal resolution service and keeps the panel focused on orchestration.
- Save/load v4 remains unchanged; persisted social encounter records still store derived encounter state and events, not the last transient roll display.

## 2026-05-21 - T49 Social WorldState Consequences

- `App.svelte` passes loaded `worldStateRecords` into `SocialEncounterPanel` and accepts updated records back from terminal social outcomes.
- Social consequences reuse the existing v4 `worldState` snapshot array; no save v5, migration, or new persistence table was introduced.

## 2026-05-21 - T51 Social Choice UI

- `socialEncounterSession` now exposes the read-only dialogue choice catalog to `App.svelte`.
- `App.svelte` passes `dialogueChoices` into `SocialEncounterPanel`; the panel keeps the selected choice as local UI state and does not change save v4.
- The selected choice modifies the audited social appeal through `createSocialDialogueChoiceProfile`; no migration, Worker change, or new persistence table was added.

## 2026-05-30 - T73-T76 NPC Relationship Save UI

- `App.svelte` now owns `npcRelationshipRecords` beside social encounter, faction standing, clock, and WorldState arrays.
- Save/load passes `npcRelationships` through save v5 and restores them directly from the Worker response.
- `applySocialPressurePenaltyIntent` now coordinates faction pressure, NPC relationship pressure, and explicit `social-pressure` retaliation-clock advancement in the app/session layer.
- `SocialRelationsPanel` receives `npcRelationships` and `npcs` from the app and remains read-only for individual NPC relationship state.

## 2026-06-02 - T92 Combat Training Enemy Attack

- `combatEncounterSession` now exposes `trainingEnemyAttackService` with the same deterministic dice stream used by the combat training session.
- `App.svelte` passes `resolveTrainingEnemyAttack` into `CombatEncounterPanel`; the app does not calculate CA or resolve target attacks itself.
- No app-level save state, schema version, Worker RPC, persisted HP, official monster data, or navigation state was added.

## 2026-06-06 - UI Reachability Regression Fix

- Navigation descriptions must describe the current browser surface and must not retain future-task placeholders after a panel becomes reachable.
- The Browser do Codex remains the rendered UI acceptance gate; `qa:ui-reachability` protects deterministic source and documentation contracts.

## 2026-06-15 - Editable Character Inventory

- `App.svelte` creates one inventory session with the same character repository used by character creation.
- The app owns only the `inventoryEventRecords` transport array; current entries and capacity remain derived by `InventoryManagementService`.
- Save sends `inventoryEvents`, load restores the ledger atomically, and an invalid restored ledger becomes a typed user-facing load error.

## 2026-06-16 - Persistent Equipment Loadout

- `App.svelte` now owns `equipmentLoadoutEventRecords` beside `inventoryEventRecords`.
- Save sends `equipmentLoadoutEvents` in v7 and load restores them through `inventorySession.restoreLoadoutEvents` before exposing the loaded state.
- The initial v7 delivery kept combat integration behind a separate gate; the later integration records below supersede the old local-selector behavior.

## 2026-06-16 - Combat Persistent Loadout Integration

- `createCombatPersistentLoadoutResolver` lives in `src/app/model` because it composes `InventoryManagementService` with the combat session `buildEquipmentLoadout` bridge.
- `App.svelte` passes `resolvePersistentLoadout` and `onOpenInventory` into `CombatEncounterPanel`; the combat feature does not import `inventory-management`.
- The resolver maps inventory and equipment failures into combat-specific typed failures so UI copy stays local to the combat panel.
- No save version, Worker RPC, migration, durability, consumable use, or real HP persistence was introduced.

## 2026-06-17 - Combat Potion Belt Quick Access

- `createCombatPotionBeltResolver` and `createCombatPotionBeltConsumer` live in `src/app/model` because the app composes Combat with `InventoryManagementService`.
- `App.svelte` passes `resolvePotionBelt` and `consumePotionBelt` into `CombatEncounterPanel`; Combat still does not import `inventory-management`.
- The consumer appends inventory ledger events through the app-owned `inventoryEventRecords` array and returns a combat log entry.
- No save v8, migration, healing, HP real mutation, HP de treino mutation, conditions, durability, or official action economy was introduced.

## 2026-06-17 - Character Trait Selections Save V8

- `characterSession` owns the session trait-selection repository beside the character repository.
- `App.svelte` creates trait selection records immediately after successful character creation and includes them in the save v8 snapshot.
- Load restores trait selections through `characterSession.restoreTraitSelections()` before exposing loaded records back to app state.
- The app stores trait choices only; no ancestry trait effect, HP real mutation, starting equipment, Decorator, or editable sheet expansion was added.
