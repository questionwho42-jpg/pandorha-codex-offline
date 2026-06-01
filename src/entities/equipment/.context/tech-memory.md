# Equipment Technical Memory

## 2026-05-13 - T23 Equipment Schema

- Created `entities/equipment` as a read-only catalog foundation for unique equipment and stacked consumables.
- Technical ids are English ASCII; player-facing labels and summaries stay in pt-BR.
- `EquipmentCatalogService` validates repository output with Zod and returns typed `Result` failures.
- Equipment records are unique item definitions with durability, rune-slot, price, and slot metadata only; T23 does not apply combat, CA, damage, inventory, rune, or durability mechanics.
- Consumable records model stacked quantities and stack slot cost only; T24 will calculate carried capacity and overload state.
- Scaffold automation was intentionally deferred because the entity pattern is recurring but still evolving across catalog slices.

## T85.1 - Weapon Attack Profiles

- `EquipmentWeaponAttackProfileService` builds combat-safe weapon profiles from catalog records without changing the Drizzle table, save version, or inventory persistence.
- Weapon dice are stored as structured definitions in `OFFICIAL_WEAPON_ATTACK_PROFILE_DEFINITIONS`; the service does not parse `mechanicalSummary`.
- Durability is a gate: weapons with `durabilityCurrent` below 1 return `EQUIPMENT_WEAPON_UNUSABLE` before combat can consume them.
- Non-weapon equipment returns `EQUIPMENT_NOT_A_WEAPON`; weapons without structured profiles return `WEAPON_ATTACK_PROFILE_NOT_FOUND`.
- The first profile keeps damage deterministic with `baseDiceTotal`; actual damage dice rolls and durability wear remain future work.
