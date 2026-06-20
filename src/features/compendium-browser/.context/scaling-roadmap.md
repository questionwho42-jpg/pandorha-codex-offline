# Compendium Browser Scaling Roadmap

## Near Term

- Add pagination before the catalog grows beyond the initial curated slice.
- Category filters for `system-survival`, `system-combat`, and `system-magic` are now delivered; next filtering work should focus on ranking and empty-state guidance.
- Preserve selected entry across query changes only after there is a stable detail route or state contract.

## Later

- Replace in-memory entries with Worker-backed queries after SQLite/OPFS is active.
- Add source-line deep links when source documents expose stable anchors.
- Add richer snippets after a validated Markdown import pipeline exists.
