import type {
	InventoryCapacityResult,
	InventoryCapacityState,
} from "$lib/shared/inventory";

export interface InventoryReadOnlyItem {
	readonly categoryLabel: string;
	readonly id: string;
	readonly label: string;
	readonly slotCost: number;
}

export interface InventoryReadOnlyView {
	readonly itemCountLabel: string;
	readonly items: readonly InventoryReadOnlyItem[];
	readonly movementLabel: string;
	readonly slotUsageLabel: string;
	readonly stateDescription: string;
	readonly stateLabel: string;
}

interface InventoryReadOnlyViewInput {
	readonly capacity: InventoryCapacityResult;
	readonly items: readonly InventoryReadOnlyItem[];
}

export function createInventoryReadOnlyView(
	input: InventoryReadOnlyViewInput,
): InventoryReadOnlyView {
	return {
		itemCountLabel: `${input.items.length} ${
			input.items.length === 1 ? "item" : "itens"
		}`,
		items: input.items,
		movementLabel: mapInventoryMovementLabel(input.capacity),
		slotUsageLabel: `${input.capacity.usedSlots}/${input.capacity.slotLimit} slots`,
		stateDescription: mapInventoryStateDescription(input.capacity.state),
		stateLabel: mapInventoryStateLabel(input.capacity.state),
	};
}

export function mapInventoryStateLabel(state: InventoryCapacityState): string {
	switch (state) {
		case "normal":
			return "Normal";
		case "slowed":
			return "Lento";
		case "immobilized":
			return "Imobilizado";
	}
}

export function mapInventoryStateDescription(
	state: InventoryCapacityState,
): string {
	switch (state) {
		case "normal":
			return "A carga está dentro do limite atual.";
		case "slowed":
			return "A carga passou do limite e deixa o personagem Lento.";
		case "immobilized":
			return "A carga passou do limite em mais de 5 slots e deixa o personagem Imobilizado.";
	}
}

function mapInventoryMovementLabel(capacity: InventoryCapacityResult): string {
	if (capacity.state === "immobilized") {
		return "Velocidade 0";
	}

	if (capacity.state === "slowed") {
		return `${capacity.movementPenaltyMeters}m de deslocamento`;
	}

	return "Sem penalidade de movimento";
}
