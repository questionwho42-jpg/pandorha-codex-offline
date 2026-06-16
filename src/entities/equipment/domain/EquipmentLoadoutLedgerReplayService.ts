import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type EquipmentLoadoutEventRecord,
	equipmentLoadoutEventLedgerSchema,
} from "../model/equipmentLoadoutEventSchema";
import type {
	EquipmentLoadoutLedgerFailure,
	EquipmentLoadoutLedgerSnapshot,
} from "../model/equipmentLoadoutTypes";

/**
 * @description Reconstructs the current equipped slots from an append-only per-character loadout ledger.
 * @rule docs/process/equipment-loadout-save-v7-gate.md - loadout state is derived from events that reference inventory entries.
 */
export class EquipmentLoadoutLedgerReplayService {
	public replay(
		input: unknown,
	): Result<
		readonly EquipmentLoadoutLedgerSnapshot[],
		EquipmentLoadoutLedgerFailure
	> {
		const parsed = equipmentLoadoutEventLedgerSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_EQUIPMENT_LOADOUT_LEDGER",
				message: "Equipment loadout event ledger failed validation.",
				details: { issues: formatIssues(parsed.error.issues) },
			});
		}

		const sortedEvents = [...parsed.data].sort(
			(left, right) =>
				left.characterId.localeCompare(right.characterId) ||
				left.sequence - right.sequence,
		);
		const sequenceFailure = validateSequence(sortedEvents);
		if (sequenceFailure) {
			return fail(sequenceFailure);
		}

		const slots = new Map<string, EquipmentLoadoutLedgerSnapshot>();
		for (const event of sortedEvents) {
			const key = createSlotKey(event);
			if (event.type === "equipment-loadout-slot-cleared") {
				slots.delete(key);
				continue;
			}

			slots.set(key, {
				characterId: event.characterId,
				inventoryEntryId: event.inventoryEntryId as string,
				lastSequence: event.sequence,
				slot: event.slot,
			});
		}

		return ok(Array.from(slots.values()));
	}
}

function validateSequence(
	events: readonly EquipmentLoadoutEventRecord[],
): EquipmentLoadoutLedgerFailure | null {
	const eventIds = new Set<string>();
	const nextSequenceByCharacterId = new Map<string, number>();
	for (const event of events) {
		const expectedSequence =
			nextSequenceByCharacterId.get(event.characterId) ?? 1;
		if (eventIds.has(event.id) || event.sequence !== expectedSequence) {
			return {
				code: "EQUIPMENT_LOADOUT_LEDGER_SEQUENCE_INVALID",
				message:
					"Equipment loadout ledger has duplicate ids or non-contiguous sequencing.",
				details: {
					eventId: event.id,
					expectedSequence,
					receivedSequence: event.sequence,
				},
			};
		}
		eventIds.add(event.id);
		nextSequenceByCharacterId.set(event.characterId, expectedSequence + 1);
	}

	return null;
}

function createSlotKey(event: EquipmentLoadoutEventRecord): string {
	return `${event.characterId}:${event.slot}`;
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
