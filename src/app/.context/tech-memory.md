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
