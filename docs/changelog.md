# Changelog

This file receives zero-token promotion summaries after changes reach `main`.

Detailed architectural decisions belong in `docs/adr/`. RPG and business rules remain in `docs/system/`.

<!-- pandorha-changelog:main -->
## 2026-06-02T12:40:22-03:00 - default branch merge promotion candidate
- branch: feat/metadata-tags-codex
- commit: d64f8b6376ee9ff8bcb598706993df22c6638fd3
- source_pr: https://github.com/questionwho42-jpg/pandorha-codex-offline/pull/1
- review_model: gpt-5.5 high-reasoning final review; local automation zero-token
#### Promotion Review
- Done: PR #1 merged the T90 documentation audit automation, D01.2 strict quality gate recovery, and T91 equipped defense profile into the repository default branch.
- Next: review [change-inbox.md](./process/change-inbox.md) promotion entries and decide whether process docs, conventions, `llms.txt`, or user guides need official updates.
- Risks: no speculative RPG rules should be promoted into `docs/system/`; T91 defense remains display-only until an official incoming-attack contract exists.
- Improvements: update `pandorha_process_automation.py post-merge` later to recognize the repository default branch instead of only literal `main`.

<!-- /pandorha-changelog:main -->
