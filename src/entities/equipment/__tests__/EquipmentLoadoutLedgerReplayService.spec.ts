import { describe, expect, it } from "vitest";
import { EquipmentLoadoutLedgerReplayService } from "../domain/EquipmentLoadoutLedgerReplayService";
import type { EquipmentLoadoutEventRecord } from "../model/equipmentLoadoutEventSchema";
import type {
	EquipmentLoadoutLedgerFailure,
	EquipmentLoadoutLedgerSnapshot,
} from "../model/equipmentLoadoutTypes";

const CREATED_AT = "2026-06-15T20:30:00.000Z";

describe("EquipmentLoadoutLedgerReplayService", () => {
	it("replays an empty loadout ledger", () => {
		const result = new EquipmentLoadoutLedgerReplayService().replay([]);

		expect(expectLoadoutSuccess(result)).toEqual([]);
	});

	it("keeps the latest event for each character slot", () => {
		const result = new EquipmentLoadoutLedgerReplayService().replay([
			buildEvent({
				id: "loadout-event-1",
				sequence: 1,
				slot: "mainHand",
				inventoryEntryId: "inventory-entry-1",
			}),
			buildEvent({
				id: "loadout-event-2",
				sequence: 2,
				slot: "offHand",
				inventoryEntryId: "inventory-entry-2",
			}),
			buildEvent({
				id: "loadout-event-3",
				sequence: 3,
				slot: "mainHand",
				inventoryEntryId: "inventory-entry-3",
			}),
		]);

		expect(expectLoadoutSuccess(result)).toEqual([
			{
				characterId: "session-character-1",
				inventoryEntryId: "inventory-entry-3",
				lastSequence: 3,
				slot: "mainHand",
			},
			{
				characterId: "session-character-1",
				inventoryEntryId: "inventory-entry-2",
				lastSequence: 2,
				slot: "offHand",
			},
		]);
	});

	it("clears a slot without affecting other equipped slots", () => {
		const result = new EquipmentLoadoutLedgerReplayService().replay([
			buildEvent({
				id: "loadout-event-1",
				sequence: 1,
				slot: "mainHand",
				inventoryEntryId: "inventory-entry-1",
			}),
			buildEvent({
				id: "loadout-event-2",
				sequence: 2,
				slot: "armor",
				inventoryEntryId: "inventory-entry-2",
			}),
			buildEvent({
				id: "loadout-event-3",
				sequence: 3,
				type: "equipment-loadout-slot-cleared",
				slot: "mainHand",
				inventoryEntryId: null,
			}),
		]);

		expect(expectLoadoutSuccess(result)).toEqual([
			{
				characterId: "session-character-1",
				inventoryEntryId: "inventory-entry-2",
				lastSequence: 2,
				slot: "armor",
			},
		]);
	});

	it("rejects duplicate ids and non-contiguous character sequences", () => {
		const duplicateId = new EquipmentLoadoutLedgerReplayService().replay([
			buildEvent({ id: "loadout-event-1", sequence: 1 }),
			buildEvent({
				id: "loadout-event-1",
				sequence: 2,
				inventoryEntryId: "inventory-entry-2",
			}),
		]);
		const brokenSequence = new EquipmentLoadoutLedgerReplayService().replay([
			buildEvent({ id: "loadout-event-1", sequence: 2 }),
		]);

		expect(expectLoadoutFailure(duplicateId).code).toBe(
			"EQUIPMENT_LOADOUT_LEDGER_SEQUENCE_INVALID",
		);
		expect(expectLoadoutFailure(brokenSequence).code).toBe(
			"EQUIPMENT_LOADOUT_LEDGER_SEQUENCE_INVALID",
		);
	});

	it("rejects malformed equip and clear events", () => {
		const missingEntry = new EquipmentLoadoutLedgerReplayService().replay([
			{
				...buildEvent({ id: "loadout-event-1", sequence: 1 }),
				inventoryEntryId: null,
			},
		]);
		const clearWithEntry = new EquipmentLoadoutLedgerReplayService().replay([
			buildEvent({
				id: "loadout-event-1",
				sequence: 1,
				type: "equipment-loadout-slot-cleared",
			}),
		]);

		expect(expectLoadoutFailure(missingEntry).code).toBe(
			"INVALID_EQUIPMENT_LOADOUT_LEDGER",
		);
		expect(expectLoadoutFailure(clearWithEntry).code).toBe(
			"INVALID_EQUIPMENT_LOADOUT_LEDGER",
		);
	});

	it("reports root-level validation failures for non-ledger input", () => {
		const failure = expectLoadoutFailure(
			new EquipmentLoadoutLedgerReplayService().replay(undefined),
		);

		expect(failure.code).toBe("INVALID_EQUIPMENT_LOADOUT_LEDGER");
		expect(failure.details?.issues).toEqual([expect.stringContaining("root:")]);
	});
});

function buildEvent(
	patch: Partial<EquipmentLoadoutEventRecord> = {},
): EquipmentLoadoutEventRecord {
	return {
		id: "loadout-event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "equipment-loadout-slot-equipped",
		slot: "mainHand",
		inventoryEntryId: "inventory-entry-1",
		createdAt: CREATED_AT,
		...patch,
	};
}

function expectLoadoutSuccess(result: {
	readonly success: boolean;
	readonly data?: readonly EquipmentLoadoutLedgerSnapshot[];
	readonly error?: EquipmentLoadoutLedgerFailure;
}): readonly EquipmentLoadoutLedgerSnapshot[] {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data ?? [];
	}
	expect.fail(`Expected success, received ${result.error?.code}`);
}

function expectLoadoutFailure(result: {
	readonly success: boolean;
	readonly data?: readonly EquipmentLoadoutLedgerSnapshot[];
	readonly error?: EquipmentLoadoutLedgerFailure;
}): EquipmentLoadoutLedgerFailure {
	expect(result.success).toBe(false);
	if (!result.success && result.error) {
		return result.error;
	}
	expect.fail("Expected failure, received success.");
}
