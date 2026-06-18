import type { InventoryEventRecord } from "$lib/entities/inventory";
import {
	resolveStartingEquipmentKit,
	type StartingEquipmentKitFailure,
	type StartingEquipmentKitItem,
} from "$lib/features/character-starting-equipment";
import type {
	InventoryManagementFailure,
	InventoryManagementService,
} from "$lib/features/inventory-management";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export interface StartingEquipmentGrantResult {
	readonly appendedEvents: readonly InventoryEventRecord[];
}

export type StartingEquipmentGrantFailureCode =
	| StartingEquipmentKitFailure["code"]
	| "STARTING_EQUIPMENT_CATALOG_ITEM_MISSING"
	| "STARTING_EQUIPMENT_CHARACTER_NOT_FOUND"
	| "STARTING_EQUIPMENT_GRANT_FAILED";

export interface StartingEquipmentGrantFailure {
	readonly code: StartingEquipmentGrantFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export async function grantStartingEquipment(input: {
	readonly characterId: string;
	readonly classId: string;
	readonly consumableCatalogIds: readonly string[];
	readonly equipmentCatalogIds: readonly string[];
	readonly inventoryService: Pick<
		InventoryManagementService,
		"addEquipment" | "addConsumable"
	>;
}): Promise<
	Result<StartingEquipmentGrantResult, StartingEquipmentGrantFailure>
> {
	const kit = resolveStartingEquipmentKit({ classId: input.classId });
	if (!kit.success) {
		return fail(kit.error);
	}

	const missingCatalogItem = findMissingCatalogItem({
		consumableCatalogIds: input.consumableCatalogIds,
		equipmentCatalogIds: input.equipmentCatalogIds,
		items: kit.data.items,
	});
	if (missingCatalogItem) {
		return fail({
			code: "STARTING_EQUIPMENT_CATALOG_ITEM_MISSING",
			message: "Starting equipment kit references a missing catalog item.",
			details: missingCatalogItem,
		});
	}

	const appendedEvents: InventoryEventRecord[] = [];
	for (const item of kit.data.items) {
		if (item.catalogKind === "equipment") {
			for (let count = 0; count < item.count; count += 1) {
				const added = await input.inventoryService.addEquipment({
					characterId: input.characterId,
					catalogItemId: item.catalogItemId,
				});
				if (!added.success) {
					return mapInventoryFailure(added.error);
				}
				appendedEvents.push(...added.data.appendedEvents);
			}
			continue;
		}

		const added = await input.inventoryService.addConsumable({
			characterId: input.characterId,
			catalogItemId: item.catalogItemId,
			quantity: item.quantity,
		});
		if (!added.success) {
			return mapInventoryFailure(added.error);
		}
		appendedEvents.push(...added.data.appendedEvents);
	}

	return ok({ appendedEvents });
}

function findMissingCatalogItem(input: {
	readonly consumableCatalogIds: readonly string[];
	readonly equipmentCatalogIds: readonly string[];
	readonly items: readonly StartingEquipmentKitItem[];
}): {
	readonly catalogKind: "equipment" | "consumable";
	readonly catalogItemId: string;
} | null {
	for (const item of input.items) {
		const catalogIds =
			item.catalogKind === "equipment"
				? input.equipmentCatalogIds
				: input.consumableCatalogIds;
		if (!catalogIds.includes(item.catalogItemId)) {
			return {
				catalogKind: item.catalogKind,
				catalogItemId: item.catalogItemId,
			};
		}
	}

	return null;
}

function mapInventoryFailure(
	failure: InventoryManagementFailure,
): Result<never, StartingEquipmentGrantFailure> {
	if (failure.code === "INVENTORY_CHARACTER_NOT_FOUND") {
		return fail({
			code: "STARTING_EQUIPMENT_CHARACTER_NOT_FOUND",
			message: "Starting equipment could not find the created character.",
			details: { inventoryCode: failure.code },
		});
	}

	return fail({
		code: "STARTING_EQUIPMENT_GRANT_FAILED",
		message: "Starting equipment could not be granted.",
		details: { inventoryCode: failure.code },
	});
}
