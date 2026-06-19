import { describe, expect, it } from "vitest";
import { InMemoryCharacterRepository } from "$lib/entities/character/testing/InMemoryCharacterRepository";
import {
	EquipmentCatalogService,
	type EquipmentDurabilityEventRecord,
	EquipmentDurabilityLedgerReplayService,
	type EquipmentLoadoutEventRecord,
	EquipmentLoadoutLedgerReplayService,
	EquipmentLoadoutService,
	type EquipmentRecord,
	type EquipmentRepositoryFailure,
	InMemoryEquipmentCatalogRepository,
	InMemoryEquipmentDurabilityEventRepository,
	InMemoryEquipmentLoadoutEventRepository,
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
	InventoryManagementDurabilityMutationResult,
	InventoryManagementFailure,
	InventoryManagementLoadoutMutationResult,
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

	it("equips carried equipment and exposes the current loadout", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "longsword",
			}),
		);
		const entryId = added.inventory.entries[0]?.entryId ?? "";

		const equipped = expectLoadoutMutationSuccess(
			await harness.service.equipEntry({
				characterId: "session-character-1",
				entryId,
				slot: "mainHand",
			}),
		);

		expect(equipped.appendedLoadoutEvents).toEqual([
			expect.objectContaining({
				type: "equipment-loadout-slot-equipped",
				slot: "mainHand",
				inventoryEntryId: entryId,
				sequence: 1,
			}),
		]);
		expect(equipped.inventory.loadout.mainHand).toMatchObject({
			entryId,
			catalogItemId: "longsword",
			label: "Espada Longa",
		});
	});

	it("marks equipment condition and exposes the derived durability snapshot", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		);
		const entryId = added.inventory.entries[0]?.entryId ?? "";
		expect(added.inventory.entries[0]?.durabilityCondition).toBe("intact");

		const damaged = expectDurabilityMutationSuccess(
			await harness.service.setEquipmentCondition({
				characterId: "session-character-1",
				entryId,
				condition: "damaged",
			}),
		);
		expect(damaged.appendedDurabilityEvents).toEqual([
			expect.objectContaining({
				type: "equipment-durability-condition-set",
				inventoryEntryId: entryId,
				condition: "damaged",
				sequence: 1,
			}),
		]);
		expect(damaged.inventory.entries[0]?.durabilityCondition).toBe("damaged");

		const broken = expectDurabilityMutationSuccess(
			await harness.service.setEquipmentCondition({
				characterId: "session-character-1",
				entryId,
				condition: "broken",
			}),
		);
		expect(broken.appendedDurabilityEvents[0]).toMatchObject({
			condition: "broken",
			sequence: 2,
		});
		expect(broken.inventory.entries[0]?.durabilityCondition).toBe("broken");

		const repaired = expectDurabilityMutationSuccess(
			await harness.service.setEquipmentCondition({
				characterId: "session-character-1",
				entryId,
				condition: "intact",
			}),
		);
		expect(repaired.appendedDurabilityEvents[0]).toMatchObject({
			condition: "intact",
			sequence: 3,
		});
		expect(repaired.inventory.entries[0]?.durabilityCondition).toBe("intact");
	});

	it("rejects durability changes for missing entries and consumables", async () => {
		const harness = await createHarness();
		expect(
			expectFailure(
				await harness.service.setEquipmentCondition({
					characterId: "session-character-1",
					entryId: "entry-1",
					condition: "rusted",
				}),
			).code,
		).toBe("INVALID_INVENTORY_MANAGEMENT_INPUT");

		expect(
			expectFailure(
				await harness.service.setEquipmentCondition({
					characterId: "session-character-1",
					entryId: "missing-entry",
					condition: "broken",
				}),
			).code,
		).toBe("INVENTORY_ENTRY_NOT_FOUND");

		const consumable = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "ration-stack",
				quantity: 1,
			}),
		);
		expect(
			expectFailure(
				await harness.service.setEquipmentCondition({
					characterId: "session-character-1",
					entryId: consumable.inventory.entries[0]?.entryId,
					condition: "damaged",
				}),
			).code,
		).toBe("INVENTORY_ENTRY_KIND_INVALID");
	});

	it("blocks broken equipment from being equipped", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		);
		const entryId = added.inventory.entries[0]?.entryId ?? "";
		expectDurabilityMutationSuccess(
			await harness.service.setEquipmentCondition({
				characterId: "session-character-1",
				entryId,
				condition: "broken",
			}),
		);

		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "session-character-1",
					entryId,
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_DURABILITY_BROKEN");
	});

	it("maps durability repository, replay, and post-append snapshot failures", async () => {
		const harness = await createHarness();
		harness.equipmentDurabilityRepository.failNextRead({
			code: "EQUIPMENT_DURABILITY_EVENT_REPOSITORY_READ_FAILED",
			message: "durability read failed",
		});
		expect(
			expectFailure(
				await harness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_DURABILITY_REPOSITORY_FAILED");

		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		);
		harness.equipmentDurabilityRepository.failNextWrite({
			code: "EQUIPMENT_DURABILITY_EVENT_REPOSITORY_WRITE_FAILED",
			message: "durability write failed",
		});
		expect(
			expectFailure(
				await harness.service.setEquipmentCondition({
					characterId: "session-character-1",
					entryId: added.inventory.entries[0]?.entryId,
					condition: "damaged",
				}),
			).code,
		).toBe("INVENTORY_DURABILITY_REPOSITORY_FAILED");

		const corruptHarness = await createHarness(
			[buildEvent()],
			new InventoryCapacityService(),
			[],
			new InMemoryEquipmentCatalogRepository({
				equipment: OFFICIAL_EQUIPMENT,
				consumables: OFFICIAL_CONSUMABLES,
			}),
			[buildDurabilityEvent({ id: "durability-event-2", sequence: 2 })],
		);
		expect(
			expectFailure(
				await corruptHarness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_DURABILITY_LEDGER_INVALID");

		const failingPostAppendDurabilityRepository =
			new FailsOnDurabilityReadNumberRepository(3);
		const postAppendFailureHarness = await createHarness(
			[],
			new InventoryCapacityService(),
			[],
			new InMemoryEquipmentCatalogRepository({
				equipment: OFFICIAL_EQUIPMENT,
				consumables: OFFICIAL_CONSUMABLES,
			}),
			[],
			failingPostAppendDurabilityRepository,
		);
		const postAppendEntry = expectMutationSuccess(
			await postAppendFailureHarness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		).inventory.entries[0];
		expect(
			expectFailure(
				await postAppendFailureHarness.service.setEquipmentCondition({
					characterId: "session-character-1",
					entryId: postAppendEntry?.entryId,
					condition: "damaged",
				}),
			).code,
		).toBe("INVENTORY_DURABILITY_REPOSITORY_FAILED");

		const failingPostAppendCapacityHarness = await createHarness(
			[],
			new FailsOnCapacityCalculationNumberService(2),
		);
		const postAppendCapacityEntry = expectMutationSuccess(
			await failingPostAppendCapacityHarness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		).inventory.entries[0];
		expect(
			expectFailure(
				await failingPostAppendCapacityHarness.service.setEquipmentCondition({
					characterId: "session-character-1",
					entryId: postAppendCapacityEntry?.entryId,
					condition: "damaged",
				}),
			).code,
		).toBe("INVENTORY_CAPACITY_FAILED");
	});

	it("replaces equipment in the same slot without duplicating inventory ownership", async () => {
		const harness = await createHarness();
		const longsword = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "longsword",
			}),
		).inventory.entries[0];
		const dagger = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		).inventory.entries.find((entry) => entry.catalogItemId === "dagger");
		expectLoadoutMutationSuccess(
			await harness.service.equipEntry({
				characterId: "session-character-1",
				entryId: longsword?.entryId,
				slot: "mainHand",
			}),
		);

		const replaced = expectLoadoutMutationSuccess(
			await harness.service.equipEntry({
				characterId: "session-character-1",
				entryId: dagger?.entryId,
				slot: "mainHand",
			}),
		);

		expect(replaced.appendedLoadoutEvents[0]).toMatchObject({
			sequence: 2,
			inventoryEntryId: dagger?.entryId,
		});
		expect(replaced.inventory.entries).toHaveLength(2);
		expect(replaced.inventory.loadout.mainHand?.entryId).toBe(dagger?.entryId);
	});

	it("rejects hand conflicts without clearing existing slots", async () => {
		const harness = await createHarness();
		const longbow = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "longbow",
			}),
		).inventory.entries[0];
		const shield = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "round-shield",
			}),
		).inventory.entries.find((entry) => entry.catalogItemId === "round-shield");
		expectLoadoutMutationSuccess(
			await harness.service.equipEntry({
				characterId: "session-character-1",
				entryId: longbow?.entryId,
				slot: "mainHand",
			}),
		);

		const failure = expectFailure(
			await harness.service.equipEntry({
				characterId: "session-character-1",
				entryId: shield?.entryId,
				slot: "offHand",
			}),
		);
		const snapshot = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "rope-stack",
				quantity: 1,
			}),
		).inventory;

		expect(failure.code).toBe("INVENTORY_LOADOUT_SLOT_CONFLICT");
		expect(snapshot.loadout.mainHand?.entryId).toBe(longbow?.entryId);
		expect(snapshot.loadout.offHand).toBeNull();
	});

	it("blocks removal of equipped items until the slot is cleared", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		);
		const entryId = added.inventory.entries[0]?.entryId ?? "";
		expectLoadoutMutationSuccess(
			await harness.service.equipEntry({
				characterId: "session-character-1",
				entryId,
				slot: "mainHand",
			}),
		);

		expect(
			expectFailure(
				await harness.service.removeEntry({
					characterId: "session-character-1",
					entryId,
				}),
			).code,
		).toBe("INVENTORY_ENTRY_EQUIPPED");

		expectLoadoutMutationSuccess(
			await harness.service.clearEquipmentSlot({
				characterId: "session-character-1",
				slot: "mainHand",
			}),
		);
		expect(
			expectMutationSuccess(
				await harness.service.removeEntry({
					characterId: "session-character-1",
					entryId,
				}),
			).inventory.entries,
		).toEqual([]);
	});

	it("equips armor and clears the armor slot", async () => {
		const harness = await createHarness();
		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "leather-armor",
			}),
		);
		const entryId = added.inventory.entries[0]?.entryId ?? "";

		const equipped = expectLoadoutMutationSuccess(
			await harness.service.equipEntry({
				characterId: "session-character-1",
				entryId,
				slot: "armor",
			}),
		);
		expect(equipped.inventory.loadout.armor?.entryId).toBe(entryId);

		const cleared = expectLoadoutMutationSuccess(
			await harness.service.clearEquipmentSlot({
				characterId: "session-character-1",
				slot: "armor",
			}),
		);
		expect(cleared.appendedLoadoutEvents[0]).toMatchObject({
			type: "equipment-loadout-slot-cleared",
			slot: "armor",
			inventoryEntryId: null,
			sequence: 2,
		});
		expect(cleared.inventory.loadout.armor).toBeNull();
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
		expect(
			expectFailure(await harness.service.equipEntry(undefined)).code,
		).toBe("INVALID_INVENTORY_MANAGEMENT_INPUT");
		expect(
			expectFailure(await harness.service.clearEquipmentSlot(undefined)).code,
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
		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "missing-character",
					entryId: "missing-entry",
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_CHARACTER_NOT_FOUND");
		expect(
			expectFailure(
				await harness.service.clearEquipmentSlot({
					characterId: "missing-character",
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_CHARACTER_NOT_FOUND");
	});

	it("rejects invalid loadout targets and slot types", async () => {
		const harness = await createHarness();

		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "session-character-1",
					entryId: "missing-entry",
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_ENTRY_NOT_FOUND");

		const consumable = expectMutationSuccess(
			await harness.service.addConsumable({
				characterId: "session-character-1",
				catalogItemId: "ration-stack",
				quantity: 1,
			}),
		);
		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "session-character-1",
					entryId: consumable.inventory.entries[0]?.entryId,
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_ENTRY_KIND_INVALID");

		const shield = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "round-shield",
			}),
		);
		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "session-character-1",
					entryId: shield.inventory.entries.find(
						(entry) => entry.catalogItemId === "round-shield",
					)?.entryId,
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_SLOT_INVALID");
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

	it("maps loadout repository, replay, and post-append snapshot failures", async () => {
		const harness = await createHarness();
		harness.equipmentLoadoutRepository.failNextRead({
			code: "EQUIPMENT_LOADOUT_EVENT_REPOSITORY_READ_FAILED",
			message: "loadout read failed",
		});
		expect(
			expectFailure(
				await harness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_REPOSITORY_FAILED");

		const added = expectMutationSuccess(
			await harness.service.addEquipment({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
		);
		harness.equipmentLoadoutRepository.failNextWrite({
			code: "EQUIPMENT_LOADOUT_EVENT_REPOSITORY_WRITE_FAILED",
			message: "loadout write failed",
		});
		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "session-character-1",
					entryId: added.inventory.entries[0]?.entryId,
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_REPOSITORY_FAILED");

		const corruptHarness = await createHarness(
			[buildEvent()],
			new InventoryCapacityService(),
			[buildLoadoutEvent({ id: "loadout-event-2", sequence: 2 })],
		);
		expect(
			expectFailure(
				await corruptHarness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_LEDGER_INVALID");

		const capacityHarness = await createHarness([buildEvent()], {
			calculateCapacity: () =>
				fail({
					code: "INVALID_INVENTORY_CAPACITY_INPUT",
					message: "capacity failed after loadout append",
				}),
		});
		expect(
			expectFailure(
				await capacityHarness.service.equipEntry({
					characterId: "session-character-1",
					entryId: "entry-1",
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_CAPACITY_FAILED");
	});

	it("rejects loadout ledgers that reference invalid carried entries", async () => {
		const missingEntryHarness = await createHarness(
			[buildEvent()],
			new InventoryCapacityService(),
			[buildLoadoutEvent({ inventoryEntryId: "missing-entry" })],
		);
		expect(
			expectFailure(
				await missingEntryHarness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_ENTRY_NOT_FOUND");

		const consumableHarness = await createHarness(
			[
				buildEvent({
					catalogKind: "consumable",
					catalogItemId: "ration-stack",
				}),
			],
			new InventoryCapacityService(),
			[buildLoadoutEvent()],
		);
		expect(
			expectFailure(
				await consumableHarness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_SLOT_INVALID");

		const wrongSlotHarness = await createHarness(
			[buildEvent({ catalogItemId: "round-shield" })],
			new InventoryCapacityService(),
			[buildLoadoutEvent()],
		);
		expect(
			expectFailure(
				await wrongSlotHarness.service.getInventory({
					characterId: "session-character-1",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_SLOT_INVALID");
	});

	it("rejects proposed loadouts when existing slot references are invalid", async () => {
		const harness = await createHarness(
			[
				buildEvent({ entryId: "entry-1", catalogItemId: "missing-shield" }),
				buildEvent({
					id: "event-2",
					sequence: 2,
					entryId: "entry-2",
					catalogItemId: "dagger",
				}),
			],
			new InventoryCapacityService(),
			[buildLoadoutEvent({ slot: "offHand" })],
		);

		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "session-character-1",
					entryId: "entry-2",
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_SLOT_INVALID");

		const missingEntryHarness = await createHarness(
			[buildEvent()],
			new InventoryCapacityService(),
			[
				buildLoadoutEvent({
					slot: "offHand",
					inventoryEntryId: "missing-entry",
				}),
			],
		);
		expect(
			expectFailure(
				await missingEntryHarness.service.equipEntry({
					characterId: "session-character-1",
					entryId: "entry-1",
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_LOADOUT_ENTRY_NOT_FOUND");
	});

	it("rejects equipping a carried entry whose catalog definition disappeared", async () => {
		const harness = await createHarness([
			buildEvent({ catalogItemId: "missing-equipment" }),
		]);

		expect(
			expectFailure(
				await harness.service.equipEntry({
					characterId: "session-character-1",
					entryId: "entry-1",
					slot: "mainHand",
				}),
			).code,
		).toBe("INVENTORY_CATALOG_ITEM_NOT_FOUND");
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

	it("rejects loadout resolution when the catalog fails after entry resolution", async () => {
		const harness = await createHarness(
			[buildEvent()],
			new InventoryCapacityService(),
			[buildLoadoutEvent()],
			new FailsAfterFirstEquipmentLookupRepository({
				equipment: OFFICIAL_EQUIPMENT,
				consumables: OFFICIAL_CONSUMABLES,
			}),
		);

		expect(
			expectFailure(
				await harness.service.getInventory({
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
	loadoutEvents: readonly EquipmentLoadoutEventRecord[] = [],
	equipmentCatalogRepository = new InMemoryEquipmentCatalogRepository({
		equipment: OFFICIAL_EQUIPMENT,
		consumables: OFFICIAL_CONSUMABLES,
	}),
	durabilityEvents: readonly EquipmentDurabilityEventRecord[] = [],
	equipmentDurabilityRepository = new InMemoryEquipmentDurabilityEventRepository(
		durabilityEvents,
	),
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
	const equipmentLoadoutRepository =
		new InMemoryEquipmentLoadoutEventRepository(loadoutEvents);
	const eventIds = createIdProvider("event");
	const entryIds = createIdProvider("entry");
	const loadoutEventIds = createIdProvider("loadout-event");
	const durabilityEventIds = createIdProvider("durability-event");

	return {
		inventoryRepository,
		equipmentLoadoutRepository,
		equipmentDurabilityRepository,
		service: new InventoryManagementService({
			capacityService,
			characterRepository,
			clock: { now: () => CREATED_AT },
			durabilityEventIdProvider: durabilityEventIds,
			entryIdProvider: entryIds,
			equipmentCatalogService: new EquipmentCatalogService(
				equipmentCatalogRepository,
			),
			equipmentDurabilityRepository,
			equipmentLoadoutRepository,
			equipmentLoadoutService: new EquipmentLoadoutService(
				equipmentCatalogRepository,
			),
			eventIdProvider: eventIds,
			inventoryRepository,
			durabilityReplayService: new EquipmentDurabilityLedgerReplayService(),
			loadoutEventIdProvider: loadoutEventIds,
			loadoutReplayService: new EquipmentLoadoutLedgerReplayService(),
			replayService: new InventoryLedgerReplayService(),
		}),
	};
}

class FailsAfterFirstEquipmentLookupRepository extends InMemoryEquipmentCatalogRepository {
	public override async findEquipmentById(
		id: Parameters<InMemoryEquipmentCatalogRepository["findEquipmentById"]>[0],
	): Promise<Result<EquipmentRecord, EquipmentRepositoryFailure>> {
		const result = await super.findEquipmentById(id);
		if (this.equipmentLookupCount > 1) {
			return fail({
				code: "EQUIPMENT_NOT_FOUND",
				message: "Equipment record disappeared after entry resolution.",
				details: { id },
			});
		}
		return result;
	}
}

class FailsOnDurabilityReadNumberRepository extends InMemoryEquipmentDurabilityEventRepository {
	private readCount = 0;

	public constructor(private readonly failureReadNumber: number) {
		super();
	}

	public override async listByCharacterId(
		characterId: Parameters<
			InMemoryEquipmentDurabilityEventRepository["listByCharacterId"]
		>[0],
	): ReturnType<
		InMemoryEquipmentDurabilityEventRepository["listByCharacterId"]
	> {
		this.readCount += 1;
		if (this.readCount === this.failureReadNumber) {
			return fail({
				code: "EQUIPMENT_DURABILITY_EVENT_REPOSITORY_READ_FAILED",
				message: "durability post-append read failed",
			});
		}
		return super.listByCharacterId(characterId);
	}
}

class FailsOnCapacityCalculationNumberService extends InventoryCapacityService {
	private calculationCount = 0;

	public constructor(private readonly failureCalculationNumber: number) {
		super();
	}

	public override calculateCapacity(
		input: Parameters<InventoryCapacityService["calculateCapacity"]>[0],
	): ReturnType<InventoryCapacityService["calculateCapacity"]> {
		this.calculationCount += 1;
		if (this.calculationCount === this.failureCalculationNumber) {
			return fail({
				code: "INVALID_INVENTORY_CAPACITY_INPUT",
				message: "capacity failed after durability append",
			});
		}
		return super.calculateCapacity(input);
	}
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

function buildLoadoutEvent(
	patch: Partial<EquipmentLoadoutEventRecord> = {},
): EquipmentLoadoutEventRecord {
	return {
		id: "loadout-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "equipment-loadout-slot-equipped",
		slot: "mainHand",
		inventoryEntryId: "entry-1",
		createdAt: CREATED_AT,
		...patch,
	};
}

function buildDurabilityEvent(
	patch: Partial<EquipmentDurabilityEventRecord> = {},
): EquipmentDurabilityEventRecord {
	return {
		id: "durability-event-1",
		characterId: "session-character-1",
		sequence: 1,
		inventoryEntryId: "entry-1",
		type: "equipment-durability-condition-set",
		condition: "damaged",
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

function expectLoadoutMutationSuccess(
	result: Result<
		InventoryManagementLoadoutMutationResult,
		InventoryManagementFailure
	>,
): InventoryManagementLoadoutMutationResult {
	expect(result.success).toBe(true);
	return (result as Extract<typeof result, { readonly success: true }>).data;
}

function expectDurabilityMutationSuccess(
	result: Result<
		InventoryManagementDurabilityMutationResult,
		InventoryManagementFailure
	>,
): InventoryManagementDurabilityMutationResult {
	expect(result.success).toBe(true);
	return (result as Extract<typeof result, { readonly success: true }>).data;
}
