import { describe, expect, it } from "vitest";
import { SessionCharacterRepository } from "$lib/entities/character";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import type {
	EquipmentDurabilityEventRecord,
	EquipmentLoadoutEventRecord,
} from "$lib/entities/equipment";
import type { InventoryEventRecord } from "$lib/entities/inventory";
import { createInventorySession } from "./inventorySession";

const CREATED_AT = "2026-06-15T08:00:00.000Z";

describe("createInventorySession", () => {
	it("coordinates the shared character repository and exposes current events", async () => {
		const characters = await createCharacters();
		const session = createInventorySession(characters);

		const added = await session.service.addEquipment({
			characterId: "session-character-1",
			catalogItemId: "dagger",
		});

		expect(added).toMatchObject({
			success: true,
			data: {
				appendedEvents: [
					{
						id: "inventory-event-1",
						entryId: "inventory-entry-1",
						sequence: 1,
					},
				],
			},
		});
		expect(session.getEvents()).toHaveLength(1);
		expect(session.equipment).not.toHaveLength(0);
		expect(session.consumables).not.toHaveLength(0);
	});

	it("coordinates persistent loadout events and advances restored loadout ids", async () => {
		const session = createInventorySession(await createCharacters());
		const added = await session.service.addEquipment({
			characterId: "session-character-1",
			catalogItemId: "dagger",
		});
		if (!added.success) {
			expect.fail(`Expected equipment add success: ${added.error.code}`);
		}
		expect(
			session.restoreLoadoutEvents([
				buildLoadoutEvent({ id: "equipment-loadout-event-4" }),
			]),
		).toMatchObject({ success: true });

		const equipped = await session.service.equipEntry({
			characterId: "session-character-1",
			entryId: added.data.inventory.entries[0]?.entryId,
			slot: "mainHand",
		});

		expect(equipped).toMatchObject({ success: true });
		if (!equipped.success) {
			expect.fail(`Expected equip success: ${equipped.error.code}`);
		}
		expect(equipped.data.appendedLoadoutEvents[0]).toMatchObject({
			id: "equipment-loadout-event-5",
			sequence: 2,
		});
		expect(session.getLoadoutEvents()).toEqual([
			buildLoadoutEvent({ id: "equipment-loadout-event-4" }),
			expect.objectContaining({
				id: "equipment-loadout-event-5",
				sequence: 2,
				inventoryEntryId: "inventory-entry-1",
			}),
		]);
	});

	it("coordinates persistent durability events and advances restored durability ids", async () => {
		const session = createInventorySession(await createCharacters());
		const restoredEvent = buildEvent();
		expect(session.restoreEvents([restoredEvent]).success).toBe(true);
		expect(
			session.restoreDurabilityEvents([
				buildDurabilityEvent({ id: "equipment-durability-event-4" }),
			]),
		).toMatchObject({ success: true });

		const marked = await session.service.setEquipmentCondition({
			characterId: "session-character-1",
			entryId: restoredEvent.entryId,
			condition: "broken",
		});

		expect(marked).toMatchObject({ success: true });
		if (!marked.success) {
			expect.fail(`Expected durability update success: ${marked.error.code}`);
		}
		expect(marked.data.appendedDurabilityEvents[0]).toMatchObject({
			id: "equipment-durability-event-5",
			sequence: 2,
			condition: "broken",
		});
		expect(session.getDurabilityEvents()).toEqual([
			buildDurabilityEvent({ id: "equipment-durability-event-4" }),
			expect.objectContaining({
				id: "equipment-durability-event-5",
				sequence: 2,
				inventoryEntryId: "inventory-entry-1",
				condition: "broken",
			}),
		]);
	});

	it("restores events atomically and advances generated ids", async () => {
		const session = createInventorySession(await createCharacters());
		const restoredEvent = buildEvent({
			id: "inventory-event-7",
			entryId: "inventory-entry-9",
		});

		expect(session.restoreEvents([restoredEvent])).toEqual({
			success: true,
			data: [restoredEvent],
		});
		const added = await session.service.addEquipment({
			characterId: "session-character-1",
			catalogItemId: "dagger",
		});

		expect(added).toMatchObject({
			success: true,
			data: {
				appendedEvents: [
					{
						id: "inventory-event-8",
						entryId: "inventory-entry-10",
						sequence: 2,
					},
				],
			},
		});
	});

	it("rejects an invalid restored ledger without replacing current events", async () => {
		const session = createInventorySession(await createCharacters());
		const validEvent = buildEvent();
		expect(session.restoreEvents([validEvent]).success).toBe(true);

		const restored = session.restoreEvents([
			buildEvent({ id: "invalid-event", quantity: 1000 }),
		]);

		expect(restored).toMatchObject({
			success: false,
			error: { code: "INVENTORY_EVENT_REPOSITORY_WRITE_FAILED" },
		});
		expect(session.getEvents()).toEqual([validEvent]);
	});
});

async function createCharacters(): Promise<SessionCharacterRepository> {
	const repository = new SessionCharacterRepository();
	await repository.save({
		...CharacterBuilder.valid().buildCreateInput(),
		id: "session-character-1",
		createdAt: CREATED_AT,
		updatedAt: CREATED_AT,
	});
	return repository;
}

function buildEvent(
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

function buildDurabilityEvent(
	patch: Partial<EquipmentDurabilityEventRecord> = {},
): EquipmentDurabilityEventRecord {
	return {
		id: "equipment-durability-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "equipment-durability-condition-set",
		inventoryEntryId: "inventory-entry-1",
		condition: "damaged",
		createdAt: CREATED_AT,
		...patch,
	};
}
