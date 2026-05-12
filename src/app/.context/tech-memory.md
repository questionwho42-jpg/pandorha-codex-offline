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
