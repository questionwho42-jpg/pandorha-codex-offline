import { describe, expect, it } from "vitest";
import { SessionCharacterRepository } from "$lib/entities/character";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import type { InventoryEventRecord } from "$lib/entities/inventory";
import {
	createCombatPotionBeltConsumer,
	createCombatPotionBeltResolver,
} from "./combatPotionBeltBridge";
import {
	createInventorySession,
	type InventorySession,
} from "./inventorySession";

const CHARACTER_ID = "session-character-1";
const CREATED_AT = "2026-06-17T06:02:05.000Z";

describe("combat potion belt bridge", () => {
	it("returns an empty belt snapshot when the character has no potion belt", async () => {
		const { resolvePotionBelt } = await createBridgeFixture();

		const result = await resolvePotionBelt({ characterId: CHARACTER_ID });

		expect(result).toEqual({
			success: true,
			data: {
				entryId: null,
				quantity: 0,
				capacity: 5,
				canUse: false,
			},
		});
	});

	it("resolves the carried potion belt stack from the inventory ledger", async () => {
		const { inventorySession, resolvePotionBelt } = await createBridgeFixture();
		await addPotionBelt(inventorySession, 5);

		const result = await resolvePotionBelt({ characterId: CHARACTER_ID });

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected potion belt success: ${result.error.code}`);
		}
		expect(result.data).toMatchObject({
			quantity: 5,
			capacity: 5,
			canUse: true,
		});
		expect(result.data.entryId).toMatch(/^inventory-entry-/);
	});

	it("consumes one potion belt unit and exposes updated inventory events", async () => {
		const { consumePotionBelt, inventoryEvents, inventorySession, syncEvents } =
			await createBridgeFixture();
		const entryId = await addPotionBelt(inventorySession, 5);
		syncEvents();

		const result = await consumePotionBelt({
			characterId: CHARACTER_ID,
			entryId,
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected potion belt consume success: ${result.error.code}`);
		}
		expect(result.data.snapshot).toEqual({
			entryId,
			quantity: 4,
			capacity: 5,
			canUse: true,
		});
		expect(result.data.logEntry).toBe(
			"Po\u00e7\u00e3o do cinto usada em treino. HP real n\u00e3o foi alterado.",
		);
		expect(inventoryEvents()).toHaveLength(2);
		expect(inventoryEvents()[1]).toMatchObject({
			type: "inventory-quantity-set",
			entryId,
			quantity: 4,
		});
	});

	it("removes the potion belt entry when the last unit is consumed", async () => {
		const { consumePotionBelt, inventorySession, syncEvents } =
			await createBridgeFixture();
		const entryId = await addPotionBelt(inventorySession, 1);
		syncEvents();

		const result = await consumePotionBelt({
			characterId: CHARACTER_ID,
			entryId,
		});

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected potion belt consume success: ${result.error.code}`);
		}
		expect(result.data.snapshot).toEqual({
			entryId: null,
			quantity: 0,
			capacity: 5,
			canUse: false,
		});
	});

	it("maps missing characters to typed potion belt failures", async () => {
		const { resolvePotionBelt } = await createBridgeFixture();

		const result = await resolvePotionBelt({
			characterId: "missing-character",
		});

		expect(result).toEqual({
			success: false,
			error: {
				code: "COMBAT_POTION_BELT_INVENTORY_UNAVAILABLE",
				message: "Combat could not read the character potion belt.",
				details: { inventoryCode: "INVENTORY_CHARACTER_NOT_FOUND" },
			},
		});
	});
});

async function createBridgeFixture(): Promise<{
	readonly consumePotionBelt: ReturnType<typeof createCombatPotionBeltConsumer>;
	readonly inventoryEvents: () => readonly InventoryEventRecord[];
	readonly inventorySession: InventorySession;
	readonly resolvePotionBelt: ReturnType<typeof createCombatPotionBeltResolver>;
	readonly syncEvents: () => void;
}> {
	const characters = new SessionCharacterRepository();
	await characters.save({
		...CharacterBuilder.valid().buildCreateInput(),
		id: CHARACTER_ID,
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	});
	const inventorySession = createInventorySession(characters);
	let records = inventorySession.getEvents();
	const setRecords = (nextRecords: readonly InventoryEventRecord[]) => {
		records = [...nextRecords];
	};
	return {
		consumePotionBelt: createCombatPotionBeltConsumer({
			getInventoryEvents: () => records,
			inventoryService: inventorySession.service,
			onInventoryEventsChange: setRecords,
		}),
		inventoryEvents: () => records,
		inventorySession,
		resolvePotionBelt: createCombatPotionBeltResolver({
			inventoryService: inventorySession.service,
		}),
		syncEvents: () => {
			records = inventorySession.getEvents();
		},
	};
}

async function addPotionBelt(
	session: InventorySession,
	quantity: number,
): Promise<string> {
	const added = await session.service.addConsumable({
		characterId: CHARACTER_ID,
		catalogItemId: "potion-belt-stack",
		quantity,
	});
	if (!added.success) {
		expect.fail(`Expected potion belt add success: ${added.error.code}`);
	}
	return added.data.inventory.entries[0]?.entryId ?? "";
}
