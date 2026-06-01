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

## T86 - Equipment Loadout Core

- `EquipmentLoadoutService` creates a pure `EquipmentLoadoutSnapshot` from optional catalog ids for `mainHandWeaponId`, `offHandShieldId`, and `armorId`.
- The service composes `EquipmentWeaponAttackProfileService` for the main hand so combat receives the same validated `activeWeaponProfile` contract introduced in T85.1.
- Slot validation is explicit: main hand must be a weapon, off hand must be a shield, and armor must be armor.
- Durability remains a gate only: broken weapons use `EQUIPMENT_WEAPON_UNUSABLE`, while broken shield/armor records use `EQUIPMENT_ITEM_UNUSABLE`.
- Two-handed weapons fail with `EQUIPMENT_LOADOUT_HAND_CONFLICT` when an off-hand shield is also selected.
- T86 deliberately does not mutate inventory, consume durability, change save data, add proficiencies, support dual wield, or expose UI.
