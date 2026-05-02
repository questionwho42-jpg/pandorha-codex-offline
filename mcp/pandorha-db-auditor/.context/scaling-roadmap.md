# Scaling Roadmap

- Add explicit schema profiles once the production `actors` table stabilizes.
- Add read-only views for derived stats to avoid repeating formula mapping in clients.
- Add audit history output when migrations introduce persisted derived columns.
- Add table-specific allowlists for `execute_query` if broader read-only SQL becomes too permissive.
- Add validation for other derived values from `blueprint.md`, especially `CA = 10 + Nv + Eixo + Aplicacao`.
