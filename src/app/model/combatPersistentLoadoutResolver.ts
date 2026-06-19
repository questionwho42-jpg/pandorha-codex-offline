import type {
	EquipmentFailure,
	EquipmentLoadoutInput,
	EquipmentLoadoutSnapshot,
} from "$lib/entities/equipment";
import type {
	CombatPersistentLoadoutFailure,
	CombatPersistentLoadoutResolver,
} from "$lib/features/combat-encounter/model-api";
import type {
	InventoryManagementFailure,
	InventoryManagementService,
	InventoryManagementSnapshot,
} from "$lib/features/inventory-management";
import { fail, type Result } from "$lib/shared/lib/result";

export interface CombatPersistentLoadoutResolverInput {
	readonly buildEquipmentLoadout: (
		input: EquipmentLoadoutInput,
	) => Promise<Result<EquipmentLoadoutSnapshot, EquipmentFailure>>;
	readonly inventoryService: InventoryManagementService;
}

export function createCombatPersistentLoadoutResolver(
	input: CombatPersistentLoadoutResolverInput,
): CombatPersistentLoadoutResolver {
	return async (request) => {
		const inventory = await input.inventoryService.getInventory({
			characterId: request.characterId,
		});
		if (!inventory.success) {
			return fail(mapInventoryFailure(inventory.error));
		}
		const brokenEntry = findBrokenLoadoutEntry(inventory.data);
		if (brokenEntry) {
			return fail({
				code: "COMBAT_LOADOUT_EQUIPMENT_INVALID",
				message: "Combat cannot use broken equipment from inventory.",
				details: brokenEntry,
			});
		}

		const loadout = await input.buildEquipmentLoadout(
			toEquipmentLoadoutInput(inventory.data),
		);
		if (!loadout.success) {
			return fail(mapEquipmentFailure(loadout.error));
		}

		return loadout;
	};
}

function findBrokenLoadoutEntry(inventory: InventoryManagementSnapshot): {
	readonly entryId: string;
	readonly slot: keyof InventoryManagementSnapshot["loadout"];
	readonly durabilityCondition: "broken";
} | null {
	for (const slot of ["mainHand", "offHand", "armor"] as const) {
		const entry = inventory.loadout[slot];
		if (entry?.durabilityCondition === "broken") {
			return {
				entryId: entry.entryId,
				slot,
				durabilityCondition: "broken",
			};
		}
	}
	return null;
}

function toEquipmentLoadoutInput(
	inventory: InventoryManagementSnapshot,
): EquipmentLoadoutInput {
	return {
		mainHandWeaponId: inventory.loadout.mainHand?.catalogItemId,
		offHandShieldId: inventory.loadout.offHand?.catalogItemId,
		armorId: inventory.loadout.armor?.catalogItemId,
	};
}

function mapInventoryFailure(
	failure: InventoryManagementFailure,
): CombatPersistentLoadoutFailure {
	switch (failure.code) {
		case "INVENTORY_CHARACTER_NOT_FOUND":
		case "INVENTORY_REPOSITORY_FAILED":
		case "INVENTORY_LOADOUT_REPOSITORY_FAILED":
		case "INVENTORY_DURABILITY_REPOSITORY_FAILED":
			return {
				code: "COMBAT_LOADOUT_INVENTORY_UNAVAILABLE",
				message: "Combat could not read the character inventory loadout.",
				details: { inventoryCode: failure.code },
			};
		case "INVENTORY_LEDGER_INVALID":
		case "INVENTORY_LOADOUT_LEDGER_INVALID":
		case "INVENTORY_DURABILITY_LEDGER_INVALID":
			return {
				code: "COMBAT_LOADOUT_LEDGER_INVALID",
				message: "Combat received an invalid inventory loadout ledger.",
				details: { inventoryCode: failure.code },
			};
		case "INVENTORY_CATALOG_ITEM_NOT_FOUND":
		case "INVENTORY_LOADOUT_ENTRY_NOT_FOUND":
		case "INVENTORY_LOADOUT_SLOT_INVALID":
		case "INVENTORY_LOADOUT_SLOT_CONFLICT":
		case "INVENTORY_ENTRY_KIND_INVALID":
		case "INVENTORY_DURABILITY_BROKEN":
			return {
				code: "COMBAT_LOADOUT_ENTRY_INVALID",
				message: "Combat received an inventory loadout entry it cannot use.",
				details: { inventoryCode: failure.code },
			};
		case "INVALID_INVENTORY_MANAGEMENT_INPUT":
		case "INVENTORY_ENTRY_NOT_FOUND":
		case "INVENTORY_ENTRY_EQUIPPED":
		case "INVENTORY_QUANTITY_EXCEEDED":
		case "INVENTORY_CAPACITY_FAILED":
			return {
				code: "COMBAT_LOADOUT_INVENTORY_UNAVAILABLE",
				message: "Combat inventory loadout is unavailable.",
				details: { inventoryCode: failure.code },
			};
	}
}

function mapEquipmentFailure(
	failure: EquipmentFailure,
): CombatPersistentLoadoutFailure {
	return {
		code: "COMBAT_LOADOUT_EQUIPMENT_INVALID",
		message: "Combat could not derive a training loadout from inventory.",
		details: { equipmentCode: failure.code },
	};
}
