# Camp Activity Technical Memory

- T35A creates a read-only camp activity catalog without executing activity effects.
- The first catalog has four official activities: `watch`, `repair-equipment`, `cook-meal`, and `fortify-perimeter`.
- IDs stay technical and English; labels and summaries stay user-facing in pt-BR.
- `CampActivityCatalogService` validates repository output and returns `Result` for all failures.
