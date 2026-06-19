import { describe, expect, it } from "vitest";
import { EquipmentDurabilityLedgerReplayService } from "../domain/EquipmentDurabilityLedgerReplayService";
import type { EquipmentDurabilityEventRecord } from "../model/equipmentDurabilityEventSchema";
import type {
	EquipmentDurabilityLedgerFailure,
	EquipmentDurabilityLedgerSnapshot,
} from "../model/equipmentDurabilityTypes";

const CREATED_AT = "2026-06-18T21:50:00.000Z";

describe("EquipmentDurabilityLedgerReplayService", () => {
	it("resolves missing durability events as intact", () => {
		const result =
			new EquipmentDurabilityLedgerReplayService().resolveCondition({
				characterId: "session-character-1",
				events: [],
				inventoryEntryId: "inventory-entry-1",
			});

		expect(expectDurabilitySuccess(result)).toBe("intact");
	});

	it("resolves the current condition for a carried equipment entry", () => {
		const result =
			new EquipmentDurabilityLedgerReplayService().resolveCondition({
				characterId: "session-character-1",
				events: [
					buildEvent({
						id: "durability-event-1",
						sequence: 1,
						inventoryEntryId: "inventory-entry-1",
						condition: "damaged",
					}),
				],
				inventoryEntryId: "inventory-entry-1",
			});

		expect(expectDurabilitySuccess(result)).toBe("damaged");
	});

	it("keeps the latest condition for each carried equipment entry", () => {
		const result = new EquipmentDurabilityLedgerReplayService().replay([
			buildEvent({
				id: "durability-event-1",
				sequence: 1,
				inventoryEntryId: "inventory-entry-1",
				condition: "damaged",
			}),
			buildEvent({
				id: "durability-event-2",
				sequence: 2,
				inventoryEntryId: "inventory-entry-2",
				condition: "broken",
			}),
			buildEvent({
				id: "durability-event-3",
				sequence: 3,
				inventoryEntryId: "inventory-entry-1",
				condition: "intact",
			}),
		]);

		expect(expectReplaySuccess(result)).toEqual([
			{
				characterId: "session-character-1",
				condition: "intact",
				inventoryEntryId: "inventory-entry-1",
				lastSequence: 3,
			},
			{
				characterId: "session-character-1",
				condition: "broken",
				inventoryEntryId: "inventory-entry-2",
				lastSequence: 2,
			},
		]);
	});

	it("sorts events by character and sequence before replaying conditions", () => {
		const result = new EquipmentDurabilityLedgerReplayService().replay([
			buildEvent({
				id: "durability-event-3",
				characterId: "session-character-2",
				sequence: 1,
				inventoryEntryId: "inventory-entry-3",
				condition: "broken",
			}),
			buildEvent({
				id: "durability-event-2",
				sequence: 2,
				inventoryEntryId: "inventory-entry-1",
				condition: "intact",
			}),
			buildEvent({
				id: "durability-event-1",
				sequence: 1,
				inventoryEntryId: "inventory-entry-1",
				condition: "damaged",
			}),
		]);

		expect(expectReplaySuccess(result)).toEqual([
			{
				characterId: "session-character-1",
				condition: "intact",
				inventoryEntryId: "inventory-entry-1",
				lastSequence: 2,
			},
			{
				characterId: "session-character-2",
				condition: "broken",
				inventoryEntryId: "inventory-entry-3",
				lastSequence: 1,
			},
		]);
	});

	it("rejects duplicate ids and non-contiguous character sequences", () => {
		const duplicateId = new EquipmentDurabilityLedgerReplayService().replay([
			buildEvent({ id: "durability-event-1", sequence: 1 }),
			buildEvent({
				id: "durability-event-1",
				sequence: 2,
				condition: "broken",
			}),
		]);
		const brokenSequence = new EquipmentDurabilityLedgerReplayService().replay([
			buildEvent({ id: "durability-event-1", sequence: 2 }),
		]);

		expect(expectDurabilityFailure(duplicateId).code).toBe(
			"EQUIPMENT_DURABILITY_LEDGER_SEQUENCE_INVALID",
		);
		expect(expectDurabilityFailure(brokenSequence).code).toBe(
			"EQUIPMENT_DURABILITY_LEDGER_SEQUENCE_INVALID",
		);
	});

	it("rejects malformed durability events", () => {
		const malformed = new EquipmentDurabilityLedgerReplayService().replay([
			{
				...buildEvent({ id: "durability-event-1", sequence: 1 }),
				condition: "rusted",
			},
		]);

		expect(expectDurabilityFailure(malformed).code).toBe(
			"INVALID_EQUIPMENT_DURABILITY_LEDGER",
		);
	});

	it("returns replay failures when resolving a condition from malformed events", () => {
		const result =
			new EquipmentDurabilityLedgerReplayService().resolveCondition({
				characterId: "session-character-1",
				events: "not-a-ledger",
				inventoryEntryId: "inventory-entry-1",
			});

		expect(expectDurabilityFailure(result).code).toBe(
			"INVALID_EQUIPMENT_DURABILITY_LEDGER",
		);
	});
});

function buildEvent(
	patch: Partial<EquipmentDurabilityEventRecord> = {},
): EquipmentDurabilityEventRecord {
	return {
		id: "durability-event-1",
		characterId: "session-character-1",
		sequence: 1,
		inventoryEntryId: "inventory-entry-1",
		type: "equipment-durability-condition-set",
		condition: "damaged",
		createdAt: CREATED_AT,
		...patch,
	};
}

function expectReplaySuccess(result: {
	readonly success: boolean;
	readonly data?: readonly EquipmentDurabilityLedgerSnapshot[];
	readonly error?: EquipmentDurabilityLedgerFailure;
}): readonly EquipmentDurabilityLedgerSnapshot[] {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data ?? [];
	}
	expect.fail(`Expected success, received ${result.error?.code}`);
}

function expectDurabilitySuccess(result: {
	readonly success: boolean;
	readonly data?: string;
	readonly error?: EquipmentDurabilityLedgerFailure;
}): string {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data ?? "";
	}
	expect.fail(`Expected success, received ${result.error?.code}`);
}

function expectDurabilityFailure(result: {
	readonly success: boolean;
	readonly data?: unknown;
	readonly error?: EquipmentDurabilityLedgerFailure;
}): EquipmentDurabilityLedgerFailure {
	expect(result.success).toBe(false);
	if (!result.success && result.error) {
		return result.error;
	}
	expect.fail("Expected failure, received success.");
}
