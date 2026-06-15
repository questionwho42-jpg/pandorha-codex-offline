import { describe, expect, it } from "vitest";
import { InMemoryCharacterRepository } from "$lib/entities/character/testing/InMemoryCharacterRepository";
import {
	EquipmentCatalogService,
	InMemoryEquipmentCatalogRepository,
	OFFICIAL_CONSUMABLES,
	OFFICIAL_EQUIPMENT,
} from "$lib/entities/equipment";
import {
	InMemoryInventoryEventRepository,
	type InventoryEventRecord,
	InventoryLedgerReplayService,
} from "$lib/entities/inventory";
import {
	type InventoryCapacityFailure,
	type InventoryCapacityResult,
	InventoryCapacityService,
} from "$lib/shared/inventory";
import { fail, type Result } from "$lib/shared/lib/result";
import { InventoryManagementService } from "../domain/InventoryManagementService";
import type {
	InventoryManagementFailure,
	InventoryManagementMutationResult,
} from "../model/inventoryManagementTypes";

const CREATED_AT = "2026-06-06T11:00:00.000Z";

describe("InventoryManagementService", () => {
	it("adds equipment for a character and derives capacity", async () => {
		const harness = await createHarness();

		const result = await harness.service.addEquipment({
			characterId: "session-character-1",
			catalogItemId: "longsword",
		});
		const mutation = expectMutationSuccess(result);

		expect(mutation.appendedEvents).toEqual([
			expect.objectContaining({
				type: "inventory-item-added",
				entryId: "entry-1",
				catalogKind: "equipment",
				catalogItemId: "longsword",
				quantity: 1,
				sequence: 1,
			}),
		]);
		expect(mutation.inventory.entries).toEqual([
			expect.objectContaining({
				entryId: "entry-1",
				label: "Espada Longa",
				quantity: 1,
				slotCost: 2,
			}),
		]);
		expect(mutation.inventory.capacity).toMatchObject({
			slotLimit: 12,
			usedSlots: 2,
			state: "normal",
		});
	});

	it("fills consumable stacks before creating a new stack", async () => {
		const harness = await createHarness();

		const first = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "rope-stack",
				quantity: 4,
			}),
		);
		expect(first.inventory.entries.map((entry) => entry.quantity)).toEqual([
			3, 1,
		]);

		const second = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "rope-stack",
				quantity: 2,
			}),
		);

		expect(second.appendedEvents).toEqual([
			expect.objectContaining({
				type: "inventory-quantity-set",
				entryId: "entry-2",
				quantity: 3,
				sequence: 3,
			}),
		]);
		expect(second.inventory.entries.map((entry) => entry.quantity)).toEqual([
			3, 3,
		]);
		expect(second.inventory.capacity.usedSlots).toBe(2);
	});

	it("stops filling partial stacks after the requested quantity is exhausted", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "rope-stack",
				quantity: 4,
			}),
		);
		const firstEntryId = added.inventory.entries[0]?.entryId ?? "";
		expectMutationSuccess(
			await harness.service.consumeConsumable({
				characterId: "session-character-1",
				entryId: firstEntryId,
				quantity: 1,
			}),
		);

		const filled = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "rope-stack",
				quantity: 1,
			}),
		);

		expect(filled.appendedEvents).toHaveLength(1);
		expect(filled.appendedEvents[0]).toMatchObject({
			entryId: firstEntryId,
			quantity: 3,
		});
	});

	it("consumes a stack and removes it when its quantity reaches zero", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "torch-stack",
				quantity: 3,
			}),
		);
		const entryId = added.inventory.entries[0]?.entryId ?? "";

		const decremented = expectMutationSuccess(
			await harness.service.consumeConsumable({
				characterId: "session-character-1",
				entryId,
				quantity: 2,
			}),
		);
		expect(decremented.inventory.entries[0]?.quantity).toBe(1);

		const removed = expectMutationSuccess(
			await harness.service.consumeConsumable({
				characterId: "session-character-1",
				entryId,
				quantity: 1,
			}),
		);
		expect(removed.appendedEvents[0]).toMatchObject({
			type: "inventory-item-removed",
			quantity: 0,
		});
		expect(removed.inventory.entries).toEqual([]);
	});

	it("removes any carried entry explicitly", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		);

		const removed = expectMutationSuccess(
			await harness.service.removeEntry({
				characterId: "session-character-1",
				entryId: added.inventory.entries[0]?.entryId,
			}),
		);

		expect(removed.inventory.entries).toEqual([]);
	});

	it("rejects invalid input, missing character, and missing catalog items", async () => {
		const harness = await createHarness();

		expect(
			expectFailure(await harness.service.getInventory(undefined)).code,
		).toBe("INVALID_INVENTORY_MANAGEMENT_INPUT");
		expect(
			expectFailure(
				await harness.service.getInventory({
					characterId: "missing-character",
				}),
			).code,
		).toBe("INVENTORY_CHARACTER_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.addEquipment({
					characterId: "session-character-1",
					catalogItemId: "missing-equipment",
				}),
			).code,
		).toBe("INVENTORY_CATALOG_ITEM_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.addConsumable({
					characterId: "session-character-1",
					catalogItemId: "missing-consumable",
					quantity: 1,
				}),
			).code,
		).toBe("INVENTORY_CATALOG_ITEM_NOT_FOUND");

		expect(
			expectFailure(await harness.service.addEquipment(undefined)).code,
		).toBe("INVALID_INVENTORY_MANAGEMENT_INPUT");
		expect(
			expectFailure(await harness.service.addConsumable(undefined)).code,
		).toBe("INVALID_INVENTORY_MANAGEMENT_INPUT");
		expect(
			expectFailure(await harness.service.consumeConsumable(undefined)).code,
		).toBe("INVALID_INVENTORY_MANAGEMENT_INPUT");
		expect(
			expectFailure(await harness.service.removeEntry(undefined)).code,
		).toBe("INVALID_INVENTORY_MANAGEMENT_INPUT");
	});

	it("rejects missing entries, wrong entry kinds, and excessive consumption", async () => {
		const harness = await createHarness();
		const equipment = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		);

		expect(
			expectFailure(
				await harness.service.removeEntry({
					characterId: "session-character-1",
					entryId: "missing-entry",
				}),
			).code,
		).toBe("INVENTORY_ENTRY_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.consumeConsumable({
					characterId: "session-character-1",
					entryId: equipment.inventory.entries[0]?.entryId,
					quantity: 1,
				}),
			).code,
		).toBe("INVENTORY_ENTRY_KIND_INVALID");

		const consumable = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "ration-stack",
				quantity: 1,
			}),
		);
		const consumableEntry = consumable.inventory.entries.find(
			(entry) => entry.catalogKind === "consumable",
		);
		expect(
			expectFailure(
				await harness.service.consumeConsumable({
					characterId: "session-character-1",
					entryId: consumableEntry?.entryId,
					quantity: 2,
				}),
			).code,
		).toBe("INVENTORY_QUANTITY_EXCEEDED");
	});

	it("rejects mutation targets that do not exist", async () => {
		const harness = await createHarness();

		expect(
			expectFailure(
				await harness.service.addEquipment({
					characterId: "missing-character",
					catalogItemId: "dagger",
				}),
			).code,
		).toBe("INVENTORY_CHARACTER_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.addConsumable({
					characterId: "missing-character",
					catalogItemId: "ration-stack",
					quantity: 1,
				}),
			).code,
		).toBe("INVENTORY_CHARACTER_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.consumeConsumable({
					characterId: "missing-character",
					entryId: "missing-entry",
					quantity: 1,
				}),
			).code,
		).toBe("INVENTORY_CHARACTER_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.consumeConsumable({
					characterId: "session-character-1",
					entryId: "missing-entry",
					quantity: 1,
				}),
			).code,
		).toBe("INVENTORY_ENTRY_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.removeEntry({
					characterId: "missing-character",
					entryId: "missing-entry",
				}),
			).code,
		).toBe("INVENTORY_CHARACTER_NOT_FOUND");
	});

	it("maps repository, replay, and capacity failures", async () => {
		const harness = await createHarness();
		harness.inventoryRepository.failNextRead({
			code: "INVENTORY_EVENT_REPOSITORY_READ_FAILED",
			message: "read failed",
		});
		expect(
			expectFailure(
				await harness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_REPOSITORY_FAILED");

		harness.inventoryRepository.failNextWrite({
			code: "INVENTORY_EVENT_REPOSITORY_WRITE_FAILED",
			message: "write failed",
		});
		expect(
			expectFailure(
				await harness.service.addEquipment({
					characterId: "session-character-1",
					catalogItemId: "dagger",
				}),
			).code,
		).toBe("INVENTORY_REPOSITORY_FAILED");

		const corruptHarness = await createHarness([
			buildEvent({ id: "event-2", sequence: 2 }),
		]);
		expect(
			expectFailure(
				await corruptHarness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_LEDGER_INVALID");

		const capacityHarness = await createHarness([], {
			calculateCapacity: () =>
				fail({
					code: "INVALID_INVENTORY_CAPACITY_INPUT",
					message: "capacity failed",
				}),
		});
		expect(
			expectFailure(
				await capacityHarness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_CAPACITY_FAILED");
		expect(
			expectFailure(
				await capacityHarness.service.addEquipment({
					characterId: "session-character-1",
					catalogItemId: "dagger",
				}),
			).code,
		).toBe("INVENTORY_CAPACITY_FAILED");
	});

	it("rejects ledger entries whose catalog definition disappeared", async () => {
		const missingEquipment = await createHarness([
			buildEvent({ catalogItemId: "missing-equipment" }),
		]);
		expect(
			expectFailure(
				await missingEquipment.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_CATALOG_ITEM_NOT_FOUND");

		const missingConsumable = await createHarness([
			buildEvent({
				catalogKind: "consumable",
				catalogItemId: "missing-consumable",
			}),
		]);
		expect(
			expectFailure(
				await missingConsumable.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_CATALOG_ITEM_NOT_FOUND");
	});
});

async function createHarness(
	events: readonly InventoryEventRecord[] = [],
	capacityService: {
		calculateCapacity(
			input: unknown,
		): Result<InventoryCapacityResult, InventoryCapacityFailure>;
	} = new InventoryCapacityService(),
) {
	const characterRepository = new InMemoryCharacterRepository();
	await characterRepository.save({
		id: "session-character-1",
		name: "Lia",
		concept: "Exploradora",
		ancestryId: "human",
		classId: "cacador",
		backgroundId: "guia",
		level: 1,
		physical: 3,
		mental: 2,
		social: 1,
		conflict: 2,
		interaction: 1,
		resistance: 3,
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	});
	const inventoryRepository = new InMemoryInventoryEventRepository(events);
	const eventIds = createIdProvider("event");
	const entryIds = createIdProvider("entry");

	return {
		inventoryRepository,
		service: new InventoryManagementService({
			capacityService,
			characterRepository,
			clock: { now: () => CREATED_AT },
			entryIdProvider: entryIds,
			equipmentCatalogService: new EquipmentCatalogService(
				new InMemoryEquipmentCatalogRepository({
					equipment: OFFICIAL_EQUIPMENT,
					consumables: OFFICIAL_CONSUMABLES,
				}),
			),
			eventIdProvider: eventIds,
			inventoryRepository,
			replayService: new InventoryLedgerReplayService(),
		}),
	};
}

function createIdProvider(prefix: string): { generate(): string } {
	let nextId = 1;
	return {
		generate: () => {
			const id = `${prefix}-${nextId}`;
			nextId += 1;
			return id;
		},
	};
}

function buildEvent(
	patch: Partial<InventoryEventRecord> = {},
): InventoryEventRecord {
	return {
		id: "event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "inventory-item-added",
		entryId: "entry-1",
		catalogKind: "equipment",
		catalogItemId: "dagger",
		quantity: 1,
		createdAt: CREATED_AT,
		...patch,
	};
}

function expectMutationSuccess(
	result: Result<InventoryManagementMutationResult, InventoryManagementFailure>,
): InventoryManagementMutationResult {
	expect(result.success).toBe(true);
	return (result as Extract<typeof result, { readonly success: true }>).data;
}

function expectFailure<Success>(
	result: Result<Success, InventoryManagementFailure>,
): InventoryManagementFailure {
	expect(result.success).toBe(false);
	return (result as Extract<typeof result, { readonly success: false }>).error;
}
