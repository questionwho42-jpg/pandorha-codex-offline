import type { CharacterRepository } from "$lib/entities/character";
import type {
	EquipmentCatalogService,
	EquipmentLoadoutEventRecord,
	EquipmentLoadoutEventRepository,
	EquipmentLoadoutEventSlot,
	EquipmentLoadoutLedgerReplayService,
	EquipmentLoadoutLedgerSnapshot,
	EquipmentLoadoutService,
	EquipmentRecord,
} from "$lib/entities/equipment";
import type {
	InventoryCatalogKind,
	InventoryEntrySnapshot,
	InventoryEventRecord,
	InventoryEventRepository,
	InventoryLedgerReplayService,
} from "$lib/entities/inventory";
import type {
	InventoryCapacityFailure,
	InventoryCapacityResult,
} from "$lib/shared/inventory";
import type { Result } from "$lib/shared/lib/result";

export type InventoryManagementFailureCode =
	| "INVALID_INVENTORY_MANAGEMENT_INPUT"
	| "INVENTORY_CHARACTER_NOT_FOUND"
	| "INVENTORY_CATALOG_ITEM_NOT_FOUND"
	| "INVENTORY_LEDGER_INVALID"
	| "INVENTORY_REPOSITORY_FAILED"
	| "INVENTORY_ENTRY_NOT_FOUND"
	| "INVENTORY_ENTRY_KIND_INVALID"
	| "INVENTORY_ENTRY_EQUIPPED"
	| "INVENTORY_QUANTITY_EXCEEDED"
	| "INVENTORY_CAPACITY_FAILED"
	| "INVENTORY_LOADOUT_LEDGER_INVALID"
	| "INVENTORY_LOADOUT_REPOSITORY_FAILED"
	| "INVENTORY_LOADOUT_ENTRY_NOT_FOUND"
	| "INVENTORY_LOADOUT_SLOT_INVALID"
	| "INVENTORY_LOADOUT_SLOT_CONFLICT";

export interface InventoryManagementFailure {
	readonly code: InventoryManagementFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export interface InventoryResolvedEntry extends InventoryEntrySnapshot {
	readonly equipmentKind?: EquipmentRecord["kind"];
	readonly label: string;
	readonly slotCost: number;
}

export interface InventoryEquippedEntry {
	readonly slot: EquipmentLoadoutEventSlot;
	readonly entryId: string;
	readonly catalogItemId: string;
	readonly label: string;
	readonly slotCost: number;
}

export interface InventoryEquippedLoadoutSnapshot {
	readonly mainHand: InventoryEquippedEntry | null;
	readonly offHand: InventoryEquippedEntry | null;
	readonly armor: InventoryEquippedEntry | null;
}

export interface InventoryManagementSnapshot {
	readonly characterId: string;
	readonly entries: readonly InventoryResolvedEntry[];
	readonly capacity: InventoryCapacityResult;
	readonly loadout: InventoryEquippedLoadoutSnapshot;
}

export interface InventoryManagementMutationResult {
	readonly appendedEvents: readonly InventoryEventRecord[];
	readonly inventory: InventoryManagementSnapshot;
}

export interface InventoryManagementLoadoutMutationResult {
	readonly appendedLoadoutEvents: readonly EquipmentLoadoutEventRecord[];
	readonly inventory: InventoryManagementSnapshot;
}

export interface InventoryManagementIdProvider {
	generate(): string;
}

export interface InventoryManagementClock {
	now(): string;
}

export interface InventoryCapacityPort {
	calculateCapacity(
		input: unknown,
	): Result<InventoryCapacityResult, InventoryCapacityFailure>;
}

export interface InventoryManagementServiceInput {
	readonly capacityService: InventoryCapacityPort;
	readonly characterRepository: CharacterRepository;
	readonly clock: InventoryManagementClock;
	readonly entryIdProvider: InventoryManagementIdProvider;
	readonly equipmentCatalogService: EquipmentCatalogService;
	readonly equipmentLoadoutRepository: EquipmentLoadoutEventRepository;
	readonly equipmentLoadoutService: EquipmentLoadoutService;
	readonly eventIdProvider: InventoryManagementIdProvider;
	readonly inventoryRepository: InventoryEventRepository;
	readonly loadoutEventIdProvider: InventoryManagementIdProvider;
	readonly loadoutReplayService: EquipmentLoadoutLedgerReplayService;
	readonly replayService: InventoryLedgerReplayService;
}

export interface InventoryLoadedState {
	readonly character: {
		readonly id: string;
		readonly physical: number;
		readonly resistance: number;
	};
	readonly entries: readonly InventoryEntrySnapshot[];
	readonly events: readonly InventoryEventRecord[];
	readonly loadoutEvents: readonly EquipmentLoadoutEventRecord[];
	readonly loadoutSlots: readonly EquipmentLoadoutLedgerSnapshot[];
}

export type InventoryCatalogIdentity = Readonly<{
	catalogKind: InventoryCatalogKind;
	catalogItemId: string;
}>;
