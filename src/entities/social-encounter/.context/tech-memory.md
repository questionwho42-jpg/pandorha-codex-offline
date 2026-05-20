# Social Encounter Persistence Technical Memory

- T43 stores social negotiation state in dedicated SQLite-backed records, separate from `features/social-encounter`.
- `social_encounters` owns the current derived state; `social_encounter_events` stores the ordered ledger used to rebuild user-facing logs.
- This slice intentionally contains persistence schemas only. Negotiation behavior remains in `features/social-encounter`.
