import type { InventoryCapacityState } from "$lib/shared/inventory";
import type {
	InventoryManagementSnapshot,
	InventoryResolvedEntry,
} from "./inventoryManagementTypes";

export interface InventoryManagementEntryView extends InventoryResolvedEntry {
	readonly categoryLabel: string;
	readonly quantityLabel: string;
}

export interface InventoryManagementView {
	readonly entries: readonly InventoryManagementEntryView[];
	readonly itemCountLabel: string;
	readonly movementLabel: string;
	readonly slotUsageLabel: string;
	readonly stateDescription: string;
	readonly stateLabel: string;
}

export function createInventoryManagementView(
	snapshot: InventoryManagementSnapshot,
): InventoryManagementView {
	return {
		entries: snapshot.entries.map((entry) => ({
			...entry,
			categoryLabel:
				entry.catalogKind === "equipment" ? "Equipamento" : "Consumível",
			quantityLabel: `${entry.quantity} ${
				entry.quantity === 1 ? "unidade" : "unidades"
			}`,
		})),
		itemCountLabel: `${snapshot.entries.length} ${
			snapshot.entries.length === 1 ? "item" : "itens"
		}`,
		movementLabel: mapInventoryMovementLabel(
			snapshot.capacity.state,
			snapshot.capacity.movementPenaltyMeters,
		),
		slotUsageLabel: `${snapshot.capacity.usedSlots}/${snapshot.capacity.slotLimit} slots`,
		stateDescription: mapInventoryStateDescription(snapshot.capacity.state),
		stateLabel: mapInventoryStateLabel(snapshot.capacity.state),
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

function mapInventoryMovementLabel(
	state: InventoryCapacityState,
	movementPenaltyMeters: number,
): string {
	if (state === "immobilized") {
		return "Velocidade 0";
	}
	if (state === "slowed") {
		return `${movementPenaltyMeters}m de deslocamento`;
	}
	return "Sem penalidade de movimento";
}
