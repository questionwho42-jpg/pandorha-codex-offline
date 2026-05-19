# Social Standing Technical Memory

- T36B keeps faction data in `entities/faction` and social operations in `features/social-standing`.
- The service is pure and repository-backed only for faction existence checks.
- Invoking a favor that reaches or exceeds the current debt limit returns a typed failure; impossible favors are deferred.
- Prestige checks and dialogue social are intentionally excluded.
