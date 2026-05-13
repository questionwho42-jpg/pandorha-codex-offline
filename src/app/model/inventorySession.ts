import {
	OFFICIAL_CONSUMABLES,
	OFFICIAL_EQUIPMENT,
} from "$lib/entities/equipment";
import type { InventoryReadOnlyItem } from "$lib/features/inventory-readonly";
import {
	type InventoryCapacityItemInput,
	type InventoryCapacityResult,
	InventoryCapacityService,
} from "$lib/shared/inventory";

export interface InventorySession {
	readonly capacity: InventoryCapacityResult;
	readonly items: readonly InventoryReadOnlyItem[];
}

const DEFAULT_TRAINING_PHYSICAL = 2;
const DEFAULT_TRAINING_RESISTANCE = 2;
const FALLBACK_CAPACITY: InventoryCapacityResult = {
	excessSlots: 0,
	movementPenaltyMeters: 0,
	slotLimit: 0,
	state: "normal",
	usedSlots: 0,
};

export function createInventorySession(): InventorySession {
	const service = new InventoryCapacityService();
	const items = createTrainingInventoryItems();
	const capacityItems = items.map(toCapacityItem);
	const capacity = service.calculateCapacity({
		physical: DEFAULT_TRAINING_PHYSICAL,
		resistance: DEFAULT_TRAINING_RESISTANCE,
		items: capacityItems,
	});

	return {
		capacity: capacity.success ? capacity.data : FALLBACK_CAPACITY,
		items,
	};
}

function createTrainingInventoryItems(): readonly InventoryReadOnlyItem[] {
	return [
		...OFFICIAL_EQUIPMENT.map((item) => ({
			categoryLabel: "Equipamento",
			id: item.id,
			label: item.label,
			slotCost: item.slotCost,
		})),
		...OFFICIAL_CONSUMABLES.map((item) => ({
			categoryLabel: "Consumível",
			id: item.id,
			label: item.label,
			slotCost: item.slotCostPerStack,
		})),
	];
}

function toCapacityItem(
	item: InventoryReadOnlyItem,
): InventoryCapacityItemInput {
	return {
		id: item.id,
		label: item.label,
		slotCost: item.slotCost,
	};
}
