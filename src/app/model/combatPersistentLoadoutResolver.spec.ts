import { describe, expect, it } from "vitest";
import { SessionCharacterRepository } from "$lib/entities/character";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import type {
	EquipmentLoadoutEventRecord,
	EquipmentLoadoutEventSlot,
} from "$lib/entities/equipment";
import type { InventoryEventRecord } from "$lib/entities/inventory";
import { createCombatEncounterSession } from "./combatEncounterSession";
import { createCombatPersistentLoadoutResolver } from "./combatPersistentLoadoutResolver";
import {
	createInventorySession,
	type InventorySession,
} from "./inventorySession";

const CREATED_AT = "2026-06-16T17:50:00.000Z";

describe("createCombatPersistentLoadoutResolver", () => {
	it("derives weapon and defense profiles from the persisted inventory loadout", async () => {
		const { inventorySession, resolver } = await createResolverFixture();
		await addAndEquip(inventorySession, {
			catalogItemId: "longsword",
			slot: "mainHand",
		});
		await addAndEquip(inventorySession, {
			catalogItemId: "round-shield",
			slot: "offHand",
		});
		await addAndEquip(inventorySession, {
			catalogItemId: "leather-armor",
			slot: "armor",
		});

		const result = await resolver({ characterId: "session-character-1" });

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected combat loadout success: ${result.error.code}`);
		}
		expect(result.data.activeWeaponProfile).toMatchObject({
			diceExpression: "1d8",
			id: "longsword",
			label: "Espada Longa",
		});
		expect(result.data.activeDefenseProfile).toEqual({
			armor: {
				armorClassBonus: 2,
				id: "leather-armor",
				kind: "armor",
				label: "Armadura de Couro",
			},
			armorClassBonus: 3,
			shield: {
				armorClassBonus: 1,
				id: "round-shield",
				kind: "shield",
				label: "Escudo Redondo",
			},
			summaryLabel: "CA equipada +3 (Armadura de Couro +2, Escudo Redondo +1)",
		});
	});

	it("allows defensive loadout without a weapon so the UI can block attacks", async () => {
		const { inventorySession, resolver } = await createResolverFixture();
		await addAndEquip(inventorySession, {
			catalogItemId: "leather-armor",
			slot: "armor",
		});

		const result = await resolver({ characterId: "session-character-1" });

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected combat loadout success: ${result.error.code}`);
		}
		expect(result.data.activeWeaponProfile).toBeNull();
		expect(result.data.activeDefenseProfile?.summaryLabel).toBe(
			"CA equipada +2 (Armadura de Couro +2)",
		);
	});

	it("maps missing characters to unavailable inventory loadout failures", async () => {
		const { resolver } = await createResolverFixture();

		const result = await resolver({ characterId: "missing-character" });

		expect(result).toEqual({
			success: false,
			error: {
				code: "COMBAT_LOADOUT_INVENTORY_UNAVAILABLE",
				message: "Combat could not read the character inventory loadout.",
				details: { inventoryCode: "INVENTORY_CHARACTER_NOT_FOUND" },
			},
		});
	});

	it("keeps invalid hand conflicts as typed combat loadout failures", async () => {
		const { inventorySession, resolver } = await createResolverFixture();
		expect(
			inventorySession.restoreEvents([
				buildInventoryEvent({
					catalogItemId: "longbow",
					entryId: "inventory-entry-main",
					id: "inventory-event-1",
					sequence: 1,
				}),
				buildInventoryEvent({
					catalogItemId: "round-shield",
					entryId: "inventory-entry-off",
					id: "inventory-event-2",
					sequence: 2,
				}),
			]).success,
		).toBe(true);
		expect(
			inventorySession.restoreLoadoutEvents([
				buildLoadoutEvent({
					id: "equipment-loadout-event-1",
					inventoryEntryId: "inventory-entry-main",
					sequence: 1,
					slot: "mainHand",
				}),
				buildLoadoutEvent({
					id: "equipment-loadout-event-2",
					inventoryEntryId: "inventory-entry-off",
					sequence: 2,
					slot: "offHand",
				}),
			]).success,
		).toBe(true);

		const result = await resolver({ characterId: "session-character-1" });

		expect(result).toEqual({
			success: false,
			error: {
				code: "COMBAT_LOADOUT_EQUIPMENT_INVALID",
				message: "Combat could not derive a training loadout from inventory.",
				details: { equipmentCode: "EQUIPMENT_LOADOUT_HAND_CONFLICT" },
			},
		});
	});
});

async function createResolverFixture(): Promise<{
	readonly inventorySession: InventorySession;
	readonly resolver: ReturnType<typeof createCombatPersistentLoadoutResolver>;
}> {
	const characters = new SessionCharacterRepository();
	await characters.save({
		...CharacterBuilder.valid().buildCreateInput(),
		id: "session-character-1",
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	});
	const combatSession = createCombatEncounterSession();
	const inventorySession = createInventorySession(characters);
	return {
		inventorySession,
		resolver: createCombatPersistentLoadoutResolver({
			buildEquipmentLoadout: combatSession.buildEquipmentLoadout,
			inventoryService: inventorySession.service,
		}),
	};
}

async function addAndEquip(
	session: InventorySession,
	input: {
		readonly catalogItemId: string;
		readonly slot: EquipmentLoadoutEventSlot;
	},
): Promise<void> {
	const added = await session.service.addEquipment({
		characterId: "session-character-1",
		catalogItemId: input.catalogItemId,
	});
	if (!added.success) {
		expect.fail(`Expected add equipment success: ${added.error.code}`);
	}
	const entry = added.data.inventory.entries.find(
		(candidate) => candidate.catalogItemId === input.catalogItemId,
	);
	if (!entry) {
		expect.fail(`Expected inventory entry for ${input.catalogItemId}.`);
	}
	const equipped = await session.service.equipEntry({
		characterId: "session-character-1",
		entryId: entry.entryId,
		slot: input.slot,
	});
	if (!equipped.success) {
		expect.fail(`Expected equip success: ${equipped.error.code}`);
	}
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
		createdAt: CREATED_AT,
		...patch,
	};
}

function buildLoadoutEvent(
	patch: Partial<EquipmentLoadoutEventRecord> = {},
): EquipmentLoadoutEventRecord {
	return {
		id: "equipment-loadout-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "equipment-loadout-slot-equipped",
		slot: "mainHand",
		inventoryEntryId: "inventory-entry-1",
		createdAt: CREATED_AT,
		...patch,
	};
}
