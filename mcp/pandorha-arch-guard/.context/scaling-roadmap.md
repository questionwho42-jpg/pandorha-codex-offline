# Scaling Roadmap

## 2026-05-01

### Scaling Notes
- Add project-specific token discovery from `styleguide.md` only if false positives become common.
- Promote repeated regex patterns into configurable rule definitions if more architecture checks are added.
- Keep AST parsing out of the hot path unless regex checks become too imprecise for Svelte or TypeScript syntax.

### Follow-Up
- Add a batch validation tool only after the single-file tool is stable in real Codex MCP usage.
- Consider SARIF output if this guard becomes part of CI.
