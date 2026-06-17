import type { InventoryEventRecord } from "$lib/entities/inventory";
import type {
	CombatPotionBeltConsumer,
	CombatPotionBeltFailure,
	CombatPotionBeltResolver,
	CombatPotionBeltSnapshot,
} from "$lib/features/combat-encounter/model-api";
import type {
	InventoryManagementFailure,
	InventoryManagementService,
	InventoryManagementSnapshot,
	InventoryResolvedEntry,
} from "$lib/features/inventory-management";
import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { fail, ok } from "$lib/shared/lib/result";

const POTION_BELT_CATALOG_ITEM_ID = "potion-belt-stack";
const POTION_BELT_CAPACITY = PANDORHA_RULES.LOGISTICS.POTION_BELT_CAPACITY;
const POTION_BELT_LOG_ENTRY =
	"Po\u00e7\u00e3o do cinto usada em treino. HP real n\u00e3o foi alterado.";

export interface CombatPotionBeltResolverInput {
	readonly inventoryService: InventoryManagementService;
}

export interface CombatPotionBeltConsumerInput
	extends CombatPotionBeltResolverInput {
	readonly getInventoryEvents: () => readonly InventoryEventRecord[];
	readonly onInventoryEventsChange: (
		records: readonly InventoryEventRecord[],
	) => void;
}

export function createCombatPotionBeltResolver(
	input: CombatPotionBeltResolverInput,
): CombatPotionBeltResolver {
	return async (request) => {
		const inventory = await input.inventoryService.getInventory({
			characterId: request.characterId,
		});
		if (!inventory.success) {
			return fail(mapInventoryFailure(inventory.error));
		}

		return ok(toPotionBeltSnapshot(inventory.data));
	};
}

export function createCombatPotionBeltConsumer(
	input: CombatPotionBeltConsumerInput,
): CombatPotionBeltConsumer {
	return async (request) => {
		const consumed = await input.inventoryService.consumeConsumable({
			characterId: request.characterId,
			entryId: request.entryId,
			quantity: 1,
		});
		if (!consumed.success) {
			return fail(mapInventoryFailure(consumed.error));
		}

		input.onInventoryEventsChange([
			...input.getInventoryEvents(),
			...consumed.data.appendedEvents,
		]);

		return ok({
			snapshot: toPotionBeltSnapshot(consumed.data.inventory),
			logEntry: POTION_BELT_LOG_ENTRY,
		});
	};
}

function toPotionBeltSnapshot(
	inventory: InventoryManagementSnapshot,
): CombatPotionBeltSnapshot {
	const entry = findPotionBeltEntry(inventory.entries);
	if (!entry) {
		return {
			entryId: null,
			quantity: 0,
			capacity: POTION_BELT_CAPACITY,
			canUse: false,
		};
	}

	return {
		entryId: entry.entryId,
		quantity: entry.quantity,
		capacity: POTION_BELT_CAPACITY,
		canUse: entry.quantity > 0,
	};
}

function findPotionBeltEntry(
	entries: readonly InventoryResolvedEntry[],
): InventoryResolvedEntry | null {
	return (
		entries.find(
			(entry) =>
				entry.catalogKind === "consumable" &&
				entry.catalogItemId === POTION_BELT_CATALOG_ITEM_ID,
		) ?? null
	);
}

function mapInventoryFailure(
	failure: InventoryManagementFailure,
): CombatPotionBeltFailure {
	switch (failure.code) {
		case "INVENTORY_CHARACTER_NOT_FOUND":
		case "INVENTORY_REPOSITORY_FAILED":
		case "INVENTORY_LOADOUT_REPOSITORY_FAILED":
			return {
				code: "COMBAT_POTION_BELT_INVENTORY_UNAVAILABLE",
				message: "Combat could not read the character potion belt.",
				details: { inventoryCode: failure.code },
			};
		case "INVENTORY_LEDGER_INVALID":
		case "INVENTORY_LOADOUT_LEDGER_INVALID":
			return {
				code: "COMBAT_POTION_BELT_LEDGER_INVALID",
				message: "Combat received an invalid potion belt inventory ledger.",
				details: { inventoryCode: failure.code },
			};
		case "INVENTORY_CATALOG_ITEM_NOT_FOUND":
		case "INVENTORY_ENTRY_NOT_FOUND":
		case "INVENTORY_ENTRY_KIND_INVALID":
		case "INVENTORY_QUANTITY_EXCEEDED":
		case "INVENTORY_LOADOUT_ENTRY_NOT_FOUND":
		case "INVENTORY_LOADOUT_SLOT_INVALID":
		case "INVENTORY_LOADOUT_SLOT_CONFLICT":
			return {
				code: "COMBAT_POTION_BELT_ENTRY_INVALID",
				message: "Combat received a potion belt entry it cannot use.",
				details: { inventoryCode: failure.code },
			};
		case "INVALID_INVENTORY_MANAGEMENT_INPUT":
		case "INVENTORY_ENTRY_EQUIPPED":
		case "INVENTORY_CAPACITY_FAILED":
			return {
				code: "COMBAT_POTION_BELT_INVENTORY_UNAVAILABLE",
				message: "Combat potion belt is unavailable.",
				details: { inventoryCode: failure.code },
			};
	}
}
