import type { CharacterRepository } from "$lib/entities/character";
import type { EquipmentCatalogService } from "$lib/entities/equipment";
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
	| "INVENTORY_QUANTITY_EXCEEDED"
	| "INVENTORY_CAPACITY_FAILED";

export interface InventoryManagementFailure {
	readonly code: InventoryManagementFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export interface InventoryResolvedEntry extends InventoryEntrySnapshot {
	readonly label: string;
	readonly slotCost: number;
}

export interface InventoryManagementSnapshot {
	readonly characterId: string;
	readonly entries: readonly InventoryResolvedEntry[];
	readonly capacity: InventoryCapacityResult;
}

export interface InventoryManagementMutationResult {
	readonly appendedEvents: readonly InventoryEventRecord[];
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
	readonly eventIdProvider: InventoryManagementIdProvider;
	readonly inventoryRepository: InventoryEventRepository;
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
}

export type InventoryCatalogIdentity = Readonly<{
	catalogKind: InventoryCatalogKind;
	catalogItemId: string;
}>;
