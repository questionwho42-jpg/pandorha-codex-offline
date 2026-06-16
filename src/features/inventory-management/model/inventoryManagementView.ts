import type { EquipmentLoadoutEventSlot } from "$lib/entities/equipment";
import type { InventoryCapacityState } from "$lib/shared/inventory";
import type {
	InventoryEquippedEntry,
	InventoryManagementSnapshot,
	InventoryResolvedEntry,
} from "./inventoryManagementTypes";

export interface InventoryManagementEntryView extends InventoryResolvedEntry {
	readonly categoryLabel: string;
	readonly equipActionLabel: string | null;
	readonly equipSlot: EquipmentLoadoutEventSlot | null;
	readonly equippedSlot: EquipmentLoadoutEventSlot | null;
	readonly isEquipped: boolean;
	readonly quantityLabel: string;
}

export interface InventoryManagementLoadoutSlotView {
	readonly emptyLabel: string;
	readonly entry: InventoryEquippedEntry | null;
	readonly label: string;
	readonly slot: EquipmentLoadoutEventSlot;
}

export interface InventoryManagementView {
	readonly entries: readonly InventoryManagementEntryView[];
	readonly itemCountLabel: string;
	readonly loadoutSlots: readonly InventoryManagementLoadoutSlotView[];
	readonly movementLabel: string;
	readonly slotUsageLabel: string;
	readonly stateDescription: string;
	readonly stateLabel: string;
}

export function createInventoryManagementView(
	snapshot: InventoryManagementSnapshot,
): InventoryManagementView {
	const loadoutSlots = createLoadoutSlotViews(snapshot);
	const equippedSlotByEntryId = new Map(
		loadoutSlots.flatMap((slot) =>
			slot.entry ? [[slot.entry.entryId, slot.slot] as const] : [],
		),
	);

	return {
		entries: snapshot.entries.map((entry) => ({
			...entry,
			categoryLabel:
				entry.catalogKind === "equipment" ? "Equipamento" : "Consumivel",
			equipActionLabel: mapEquipActionLabel(entry.equipmentKind),
			equipSlot: mapEquipSlot(entry.equipmentKind),
			equippedSlot: equippedSlotByEntryId.get(entry.entryId) ?? null,
			isEquipped: equippedSlotByEntryId.has(entry.entryId),
			quantityLabel: `${entry.quantity} ${
				entry.quantity === 1 ? "unidade" : "unidades"
			}`,
		})),
		itemCountLabel: `${snapshot.entries.length} ${
			snapshot.entries.length === 1 ? "item" : "itens"
		}`,
		loadoutSlots,
		movementLabel: mapInventoryMovementLabel(
			snapshot.capacity.state,
			snapshot.capacity.movementPenaltyMeters,
		),
		slotUsageLabel: `${snapshot.capacity.usedSlots}/${snapshot.capacity.slotLimit} slots`,
		stateDescription: mapInventoryStateDescription(snapshot.capacity.state),
		stateLabel: mapInventoryStateLabel(snapshot.capacity.state),
	};
}

function createLoadoutSlotViews(
	snapshot: InventoryManagementSnapshot,
): readonly InventoryManagementLoadoutSlotView[] {
	return [
		{
			emptyLabel: "Nenhuma arma equipada",
			entry: snapshot.loadout.mainHand,
			label: "Arma",
			slot: "mainHand",
		},
		{
			emptyLabel: "Nenhum escudo equipado",
			entry: snapshot.loadout.offHand,
			label: "Escudo",
			slot: "offHand",
		},
		{
			emptyLabel: "Nenhuma armadura vestida",
			entry: snapshot.loadout.armor,
			label: "Armadura",
			slot: "armor",
		},
	];
}

function mapEquipActionLabel(
	kind: InventoryResolvedEntry["equipmentKind"],
): string | null {
	switch (kind) {
		case "weapon":
			return "Equipar arma";
		case "shield":
			return "Equipar escudo";
		case "armor":
			return "Vestir armadura";
		default:
			return null;
	}
}

function mapEquipSlot(
	kind: InventoryResolvedEntry["equipmentKind"],
): EquipmentLoadoutEventSlot | null {
	switch (kind) {
		case "weapon":
			return "mainHand";
		case "shield":
			return "offHand";
		case "armor":
			return "armor";
		default:
			return null;
	}
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
			return "A carga esta dentro do limite atual.";
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
