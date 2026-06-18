import { describe, expect, it } from "vitest";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import type { InventoryEventRecord } from "$lib/entities/inventory";
import type { InventoryManagementService } from "$lib/features/inventory-management";
import type { Result } from "$lib/shared/lib/result";
import { createCharacterSession } from "./characterSession";
import { createInventorySession } from "./inventorySession";
import {
	grantStartingEquipment,
	type StartingEquipmentGrantFailure,
	type StartingEquipmentGrantResult,
} from "./startingEquipmentGrant";

describe("grantStartingEquipment", () => {
	it("grants the approved vanguard kit through inventory events", async () => {
		const { characterId, inventorySession } = await createGrantFixture({
			classId: "vanguard",
		});

		const result = expectGrantSuccess(
			await grantStartingEquipment({
				characterId,
				classId: "vanguard",
				consumableCatalogIds: inventorySession.consumables.map(
					(item) => item.id,
				),
				equipmentCatalogIds: inventorySession.equipment.map((item) => item.id),
				inventoryService: inventorySession.service,
			}),
		);

		expect(result.appendedEvents.map((event) => event.catalogItemId)).toEqual([
			"chainmail",
			"longsword",
			"round-shield",
			"adventurer-kit-stack",
		]);
		expect(result.appendedEvents.map((event) => event.sequence)).toEqual([
			1, 2, 3, 4,
		]);
		expect(inventorySession.getEvents()).toHaveLength(4);
	});

	it("grants two separate dagger entries for a weaver", async () => {
		const { characterId, inventorySession } = await createGrantFixture({
			classId: "weaver",
		});

		const result = expectGrantSuccess(
			await grantStartingEquipment({
				characterId,
				classId: "weaver",
				consumableCatalogIds: inventorySession.consumables.map(
					(item) => item.id,
				),
				equipmentCatalogIds: inventorySession.equipment.map((item) => item.id),
				inventoryService: inventorySession.service,
			}),
		);

		expect(result.appendedEvents.map((event) => event.catalogItemId)).toEqual([
			"staff",
			"grimoire-stack",
			"dagger",
			"dagger",
			"adventurer-kit-stack",
		]);
		expect(
			result.appendedEvents.filter((event) => event.catalogItemId === "dagger"),
		).toEqual([
			expect.objectContaining({ entryId: "inventory-entry-3", sequence: 3 }),
			expect.objectContaining({ entryId: "inventory-entry-4", sequence: 4 }),
		]);
	});

	it("fails before mutation when a kit catalog item is missing", async () => {
		const { characterId, inventorySession } = await createGrantFixture({
			classId: "vanguard",
		});

		const result = await grantStartingEquipment({
			characterId,
			classId: "vanguard",
			consumableCatalogIds: inventorySession.consumables.map((item) => item.id),
			equipmentCatalogIds: inventorySession.equipment
				.map((item) => item.id)
				.filter((id) => id !== "chainmail"),
			inventoryService: inventorySession.service,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "STARTING_EQUIPMENT_CATALOG_ITEM_MISSING",
				message: "Starting equipment kit references a missing catalog item.",
				details: {
					catalogKind: "equipment",
					catalogItemId: "chainmail",
				},
			},
		});
		expect(inventorySession.getEvents()).toEqual([]);
	});

	it("fails before mutation when a kit consumable is missing", async () => {
		const { characterId, inventorySession } = await createGrantFixture({
			classId: "weaver",
		});

		const result = await grantStartingEquipment({
			characterId,
			classId: "weaver",
			consumableCatalogIds: inventorySession.consumables
				.map((item) => item.id)
				.filter((id) => id !== "grimoire-stack"),
			equipmentCatalogIds: inventorySession.equipment.map((item) => item.id),
			inventoryService: inventorySession.service,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "STARTING_EQUIPMENT_CATALOG_ITEM_MISSING",
				message: "Starting equipment kit references a missing catalog item.",
				details: {
					catalogKind: "consumable",
					catalogItemId: "grimoire-stack",
				},
			},
		});
		expect(inventorySession.getEvents()).toEqual([]);
	});

	it("returns unsupported class failures before calling inventory", async () => {
		let inventoryCallCount = 0;

		const result = await grantStartingEquipment({
			characterId: "session-character-1",
			classId: "paladin",
			consumableCatalogIds: [],
			equipmentCatalogIds: [],
			inventoryService: {
				addConsumable: async () => {
					inventoryCallCount += 1;
					return {
						success: false,
						error: {
							code: "INVENTORY_REPOSITORY_FAILED",
							message: "Unexpected consumable call.",
						},
					};
				},
				addEquipment: async () => {
					inventoryCallCount += 1;
					return {
						success: false,
						error: {
							code: "INVENTORY_REPOSITORY_FAILED",
							message: "Unexpected equipment call.",
						},
					};
				},
			},
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "STARTING_EQUIPMENT_CLASS_NOT_SUPPORTED",
				message: "Starting equipment kit is not approved for this class.",
				details: { classId: "paladin" },
			},
		});
		expect(inventoryCallCount).toBe(0);
	});

	it("maps missing characters to typed grant failures", async () => {
		const characterSession = createCharacterSession();
		const inventorySession = createInventorySession(
			characterSession.repository,
		);

		const result = await grantStartingEquipment({
			characterId: "missing-character",
			classId: "hunter",
			consumableCatalogIds: inventorySession.consumables.map((item) => item.id),
			equipmentCatalogIds: inventorySession.equipment.map((item) => item.id),
			inventoryService: inventorySession.service,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "STARTING_EQUIPMENT_CHARACTER_NOT_FOUND",
				message: "Starting equipment could not find the created character.",
				details: { inventoryCode: "INVENTORY_CHARACTER_NOT_FOUND" },
			},
		});
	});

	it("maps non-character inventory failures to generic grant failures", async () => {
		const inventoryService: Pick<
			InventoryManagementService,
			"addEquipment" | "addConsumable"
		> = {
			addConsumable: async () => ({
				success: false,
				error: {
					code: "INVENTORY_REPOSITORY_FAILED",
					message: "Injected consumable failure.",
				},
			}),
			addEquipment: async () => ({
				success: false,
				error: {
					code: "INVENTORY_REPOSITORY_FAILED",
					message: "Injected equipment failure.",
				},
			}),
		};

		const result = await grantStartingEquipment({
			characterId: "session-character-1",
			classId: "vanguard",
			consumableCatalogIds: ["adventurer-kit-stack"],
			equipmentCatalogIds: ["chainmail", "longsword", "round-shield"],
			inventoryService,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "STARTING_EQUIPMENT_GRANT_FAILED",
				message: "Starting equipment could not be granted.",
				details: { inventoryCode: "INVENTORY_REPOSITORY_FAILED" },
			},
		});
	});

	it("maps consumable grant failures after equipment grants", async () => {
		let sequence = 0;
		const inventoryService: Pick<
			InventoryManagementService,
			"addEquipment" | "addConsumable"
		> = {
			addConsumable: async () => ({
				success: false,
				error: {
					code: "INVENTORY_REPOSITORY_FAILED",
					message: "Injected consumable failure.",
				},
			}),
			addEquipment: async (input) => {
				const command = input as {
					readonly catalogItemId: string;
					readonly characterId: string;
				};
				sequence += 1;
				return {
					success: true,
					data: {
						appendedEvents: [
							buildInventoryEvent({
								catalogItemId: command.catalogItemId,
								characterId: command.characterId,
								sequence,
							}),
						],
						inventory: {
							capacity: {
								excessSlots: 0,
								movementPenaltyMeters: 0,
								slotLimit: 10,
								state: "normal",
								usedSlots: 0,
							},
							characterId: command.characterId,
							entries: [],
							loadout: {
								armor: null,
								mainHand: null,
								offHand: null,
							},
						},
					},
				};
			},
		};

		const result = await grantStartingEquipment({
			characterId: "session-character-1",
			classId: "vanguard",
			consumableCatalogIds: ["adventurer-kit-stack"],
			equipmentCatalogIds: ["chainmail", "longsword", "round-shield"],
			inventoryService,
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "STARTING_EQUIPMENT_GRANT_FAILED",
				message: "Starting equipment could not be granted.",
				details: { inventoryCode: "INVENTORY_REPOSITORY_FAILED" },
			},
		});
		expect(sequence).toBe(3);
	});
});

async function createGrantFixture(input: {
	readonly classId: string;
}): Promise<{
	readonly characterId: string;
	readonly inventorySession: ReturnType<typeof createInventorySession>;
}> {
	const characterSession = createCharacterSession();
	const created = await characterSession.service.createCharacter({
		...CharacterBuilder.valid().buildCreateInput(),
		classId: input.classId,
	});
	expect(created.success).toBe(true);
	if (!created.success) {
		expect.fail(`Expected character success, received ${created.error.code}`);
	}

	return {
		characterId: created.data.id,
		inventorySession: createInventorySession(characterSession.repository),
	};
}

function expectGrantSuccess(
	result: Result<StartingEquipmentGrantResult, StartingEquipmentGrantFailure>,
): StartingEquipmentGrantResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(
		`Expected starting equipment grant, received ${result.error.code}`,
	);
}

function buildInventoryEvent(
	patch: Partial<InventoryEventRecord> = {},
): InventoryEventRecord {
	return {
		id: "inventory-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "inventory-item-added",
		entryId: "inventory-entry-1",
		catalogKind: "equipment",
		catalogItemId: "longsword",
		quantity: 1,
		createdAt: "2026-06-18T13:16:05.000Z",
		...patch,
	};
}
