# Damage Tech Memory

## T21 - Minimal Damage Pipeline

- `DamagePipelineService` lives in `src/shared/damage` because damage calculation will be reused by combat, magic, monsters, traps, items, and conditions.
- The service is pure and deterministic: it receives already rolled totals and returns a `Result<DamagePipelineResult, DamagePipelineFailure>`.
- The phase order is fixed from the combat docs: base damage, critical multiplier, fixed damage reduction, then affinity resolution.
- Damage affinities are matched by the technical English `damageType` slug.
- Matching affinity kinds are deduplicated before resolution; multiple resistance entries do not become immunity.
- T21 intentionally does not use Decorator composition yet because no modular status/item/effect behavior is being applied. Future effect stacks should use decorators around this base calculation.
- Generic exceptions remain forbidden; validation failures return `INVALID_DAMAGE_INPUT`.

## Sources

- `docs/system/combat/18-tratado-de-dano.md`
- `docs/system/combat/03-01-imunidades-resistencias-e-vulnerabilidades.md`
- `docs/architecture/feature_state_machines.md`
