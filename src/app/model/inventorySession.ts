import type { CharacterRepository } from "$lib/entities/character";
import {
	EquipmentCatalogService,
	type EquipmentLoadoutEventRecord,
	EquipmentLoadoutLedgerReplayService,
	type EquipmentLoadoutRepositoryFailure,
	EquipmentLoadoutService,
	InMemoryEquipmentCatalogRepository,
	InMemoryEquipmentLoadoutEventRepository,
	OFFICIAL_CONSUMABLES,
	OFFICIAL_EQUIPMENT,
} from "$lib/entities/equipment";
import {
	InMemoryInventoryEventRepository,
	type InventoryEventRecord,
	InventoryLedgerReplayService,
	type InventoryRepositoryFailure,
} from "$lib/entities/inventory";
import { InventoryManagementService } from "$lib/features/inventory-management/domain/InventoryManagementService";
import type { InventoryManagementIdProvider } from "$lib/features/inventory-management/model/inventoryManagementTypes";
import { InventoryCapacityService } from "$lib/shared/inventory";
import type { Result } from "$lib/shared/lib/result";

export interface InventorySession {
	readonly consumables: typeof OFFICIAL_CONSUMABLES;
	readonly equipment: typeof OFFICIAL_EQUIPMENT;
	getEvents(): readonly InventoryEventRecord[];
	getLoadoutEvents(): readonly EquipmentLoadoutEventRecord[];
	restoreEvents(
		records: readonly InventoryEventRecord[],
	): Result<readonly InventoryEventRecord[], InventoryRepositoryFailure>;
	restoreLoadoutEvents(
		records: readonly EquipmentLoadoutEventRecord[],
	): Result<
		readonly EquipmentLoadoutEventRecord[],
		EquipmentLoadoutRepositoryFailure
	>;
	readonly service: InventoryManagementService;
}

export function createInventorySession(
	characterRepository: CharacterRepository,
): InventorySession {
	const inventoryRepository = new InMemoryInventoryEventRepository();
	const equipmentLoadoutRepository =
		new InMemoryEquipmentLoadoutEventRepository();
	const equipmentCatalogRepository = new InMemoryEquipmentCatalogRepository({
		consumables: OFFICIAL_CONSUMABLES,
		equipment: OFFICIAL_EQUIPMENT,
	});
	const ids = createInventoryIdState();
	const loadoutIds = createLoadoutIdState();
	const service = new InventoryManagementService({
		capacityService: new InventoryCapacityService(),
		characterRepository,
		clock: { now: () => new Date().toISOString() },
		entryIdProvider: ids.entryIdProvider,
		equipmentCatalogService: new EquipmentCatalogService(
			equipmentCatalogRepository,
		),
		equipmentLoadoutRepository,
		equipmentLoadoutService: new EquipmentLoadoutService(
			equipmentCatalogRepository,
		),
		eventIdProvider: ids.eventIdProvider,
		inventoryRepository,
		loadoutEventIdProvider: loadoutIds.eventIdProvider,
		loadoutReplayService: new EquipmentLoadoutLedgerReplayService(),
		replayService: new InventoryLedgerReplayService(),
	});

	return {
		consumables: OFFICIAL_CONSUMABLES,
		equipment: OFFICIAL_EQUIPMENT,
		getEvents: () => inventoryRepository.all(),
		getLoadoutEvents: () => equipmentLoadoutRepository.all(),
		restoreEvents: (records) => {
			const restored = inventoryRepository.replaceAll(records);
			if (!restored.success) {
				return restored;
			}
			ids.syncFromEvents(restored.data);
			return restored;
		},
		restoreLoadoutEvents: (records) => {
			const restored = equipmentLoadoutRepository.replaceAll(records);
			if (!restored.success) {
				return restored;
			}
			loadoutIds.syncFromEvents(restored.data);
			return restored;
		},
		service,
	};
}

function createInventoryIdState(): {
	readonly entryIdProvider: InventoryManagementIdProvider;
	readonly eventIdProvider: InventoryManagementIdProvider;
	syncFromEvents(events: readonly InventoryEventRecord[]): void;
} {
	let nextEntryId = 1;
	let nextEventId = 1;

	return {
		entryIdProvider: createSequentialIdProvider("inventory-entry", () => {
			const current = nextEntryId;
			nextEntryId += 1;
			return current;
		}),
		eventIdProvider: createSequentialIdProvider("inventory-event", () => {
			const current = nextEventId;
			nextEventId += 1;
			return current;
		}),
		syncFromEvents: (events) => {
			nextEntryId = findNextNumericId(
				events.map((event) => event.entryId),
				"inventory-entry",
			);
			nextEventId = findNextNumericId(
				events.map((event) => event.id),
				"inventory-event",
			);
		},
	};
}

function createLoadoutIdState(): {
	readonly eventIdProvider: InventoryManagementIdProvider;
	syncFromEvents(events: readonly EquipmentLoadoutEventRecord[]): void;
} {
	let nextEventId = 1;

	return {
		eventIdProvider: createSequentialIdProvider(
			"equipment-loadout-event",
			() => {
				const current = nextEventId;
				nextEventId += 1;
				return current;
			},
		),
		syncFromEvents: (events) => {
			nextEventId = findNextNumericId(
				events.map((event) => event.id),
				"equipment-loadout-event",
			);
		},
	};
}

function createSequentialIdProvider(
	prefix: string,
	next: () => number,
): InventoryManagementIdProvider {
	return {
		generate: () => `${prefix}-${next()}`,
	};
}

function findNextNumericId(ids: readonly string[], prefix: string): number {
	const highestId = ids.reduce((currentMax, id) => {
		const match = new RegExp(`^${prefix}-(\\d+)$`).exec(id);
		return match ? Math.max(currentMax, Number(match[1])) : currentMax;
	}, 0);
	return highestId + 1;
}
