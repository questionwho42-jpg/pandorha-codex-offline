# Scaling Roadmap

## Next Improvements

- Add optional severity levels after two or more documentation audits show repeated issue classes.
- Add a stable machine-readable baseline file only if the team wants to distinguish accepted historical findings from new regressions.
- Add anchor validation for local Markdown links after heading normalization is complete.
- Add promotion ownership labels for `change-inbox.md` entries if the project starts assigning review lanes by subsystem.
- Add a formatter bridge to `ai-docs-formatter` only after the schema becomes stricter than the current permissive JSON shape.
- Extend `qa:ui-reachability` only with stable source contracts; keep rendered interactions in the Browser do Codex until the T84 Playwright decision is explicitly reopened.
- Add future inventory controls to `qa:ui-reachability` only after their ownership and persistence contracts are approved.
- Keep PWA install/update checks static until offline network/cache automation proves stable enough to avoid flaky browser gates.

## Boundaries

- Keep the auditor deterministic and local. It should not call models, browsers, network services, or MCP servers.
- Keep reports advisory unless the project explicitly decides which findings should block commits.
- Keep `docs/system/` review separate from mechanical Markdown cleanup to avoid accidental rule drift.
