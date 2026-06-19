import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type EquipmentDurabilityCondition,
	type EquipmentDurabilityEventRecord,
	equipmentDurabilityEventLedgerSchema,
} from "../model/equipmentDurabilityEventSchema";
import type {
	EquipmentDurabilityLedgerFailure,
	EquipmentDurabilityLedgerSnapshot,
} from "../model/equipmentDurabilityTypes";

/**
 * @description Reconstructs current equipment durability conditions from an append-only per-character ledger.
 * @rule docs/process/equipment-durability-save-v9-gate.md - durability state is derived from events and missing events resolve as intact.
 */
export class EquipmentDurabilityLedgerReplayService {
	public replay(
		input: unknown,
	): Result<
		readonly EquipmentDurabilityLedgerSnapshot[],
		EquipmentDurabilityLedgerFailure
	> {
		const parsed = equipmentDurabilityEventLedgerSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_EQUIPMENT_DURABILITY_LEDGER",
				message: "Equipment durability event ledger failed validation.",
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

		const conditions = new Map<string, EquipmentDurabilityLedgerSnapshot>();
		for (const event of sortedEvents) {
			const key = createEntryKey(event);
			conditions.set(key, {
				characterId: event.characterId,
				condition: event.condition,
				inventoryEntryId: event.inventoryEntryId,
				lastSequence: event.sequence,
			});
		}

		return ok(Array.from(conditions.values()));
	}

	public resolveCondition(input: {
		readonly characterId: string;
		readonly events: unknown;
		readonly inventoryEntryId: string;
	}): Result<EquipmentDurabilityCondition, EquipmentDurabilityLedgerFailure> {
		const replayed = this.replay(input.events);
		if (!replayed.success) {
			return replayed;
		}

		const snapshot = replayed.data.find(
			(condition) =>
				condition.characterId === input.characterId &&
				condition.inventoryEntryId === input.inventoryEntryId,
		);
		return ok(snapshot?.condition ?? "intact");
	}
}

function validateSequence(
	events: readonly EquipmentDurabilityEventRecord[],
): EquipmentDurabilityLedgerFailure | null {
	const eventIds = new Set<string>();
	const nextSequenceByCharacterId = new Map<string, number>();
	for (const event of events) {
		const expectedSequence =
			nextSequenceByCharacterId.get(event.characterId) ?? 1;
		if (eventIds.has(event.id) || event.sequence !== expectedSequence) {
			return {
				code: "EQUIPMENT_DURABILITY_LEDGER_SEQUENCE_INVALID",
				message:
					"Equipment durability ledger has duplicate ids or non-contiguous sequencing.",
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

function createEntryKey(event: EquipmentDurabilityEventRecord): string {
	return `${event.characterId}:${event.inventoryEntryId}`;
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
