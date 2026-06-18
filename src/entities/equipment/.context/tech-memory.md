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

## T91 - Equipped Defense Profile

- `EquipmentDefenseProfileService` mirrors the weapon profile service and converts official armor/shield catalog records into structured defense profiles.
- The first defense profile definitions are source-checked against `docs/system/survival/04-arsenal-e-economia.md`: Couro `+2 CA`, Placas `+5 CA`, and Escudo Redondo `+1 CA`.
- `EquipmentLoadoutService` now exposes `activeDefenseProfile` alongside `activeWeaponProfile`; the summary totals armor plus shield but still does not mutate damage, attack, save data, or durability.
- Armor and shield validation remains slot-first, then durability, then structured profile lookup, so invalid slot usage and broken equipment fail before UI can treat them as active defense.
- A two-handed weapon plus shield remains a loadout conflict even if the shield has a valid defense profile.

## 2026-06-06 - Inventory Ownership Gate

- Equipment and consumable tables remain immutable catalog definitions.
- Inventory persistence references catalog ids from a separate per-character event ledger.
- Catalog durability and quantities are not copied into inventory events; active durability and persisted loadout remain separate future gates.

## 2026-06-16 - Persisted Equipment Loadout Ledger

- `equipment_loadout_events` stores only slot events by character and `inventoryEntryId`.
- `EquipmentLoadoutLedgerReplayService` validates contiguous sequence per character, unique event ids, and equipped/cleared payload shape before exposing current slots.
- The ledger does not duplicate catalog ids, labels, durability, HP, capacity, or combat profiles; those remain derived from inventory entries and catalog services.
- UI equip actions and save v7 consume the ledger, but combat still uses its local training loadout until a separate integration gate.

## 2026-06-18 - Starting Equipment Catalog Records

- Added the conservative catalog ids from `docs/process/starting-equipment-ledger-grant-gate.md` without changing save version, migrations, durability, gold, or item effects.
- `chainmail`, `shortbow`, `staff`, `rapier`, and `luxury-padded-armor` are valid equipment ownership records but intentionally have no attack/defense profile yet.
- `adventurer-kit-stack`, `grimoire-stack`, and `nobility-letter-stack` are stackable adventuring-item consumables for initial-kit ownership.
- `OFFICIAL_LOADOUT_SUPPORTED_EQUIPMENT_IDS` is the UI-facing allowlist for equip actions; kind alone is not enough to expose loadout controls.
