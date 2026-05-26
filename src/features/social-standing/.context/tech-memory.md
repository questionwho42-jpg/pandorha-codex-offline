# Social Standing Technical Memory

- T36B keeps faction data in `entities/faction` and social operations in `features/social-standing`.
- The service is pure and repository-backed only for faction existence checks.
- Invoking a favor that reaches or exceeds the current debt limit returns a typed failure; impossible favors are deferred.
- Prestige checks and dialogue social are intentionally excluded.
- T63 exposes the existing `loseFame` operation through `app/model/socialRelationsSession.ts` so app orchestration can apply a pressure consequence without importing social-standing from social-encounter.
- The underlying service behavior did not change: Fame loss still clamps at 0 and moves status to `ultimatum` when current blood debt exceeds the new `fameLevel * 3` limit.
