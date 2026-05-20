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
