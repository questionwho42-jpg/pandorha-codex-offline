import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type InventoryEventRecord,
	inventoryEventLedgerSchema,
} from "../model/inventoryEventSchema";
import type {
	InventoryEntrySnapshot,
	InventoryFailure,
} from "../model/inventoryTypes";

/**
 * @description Reconstructs current carried inventory from a validated append-only event ledger.
 * @rule docs/architecture/feature_state_machines.md - durable state is reconstructed by replaying its event ledger.
 */
export class InventoryLedgerReplayService {
	public replay(
		input: unknown,
	): Result<readonly InventoryEntrySnapshot[], InventoryFailure> {
		const parsed = inventoryEventLedgerSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_INVENTORY_LEDGER",
				message: "Inventory event ledger failed validation.",
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

		const entries = new Map<string, InventoryEntrySnapshot>();
		for (const event of sortedEvents) {
			const applied = applyEvent(entries, event);
			if (!applied.success) {
				return applied;
			}
		}

		return ok(Array.from(entries.values()));
	}
}

function validateSequence(
	events: readonly InventoryEventRecord[],
): InventoryFailure | null {
	const eventIds = new Set<string>();
	const nextSequenceByCharacterId = new Map<string, number>();
	for (const event of events) {
		const expectedSequence =
			nextSequenceByCharacterId.get(event.characterId) ?? 1;
		if (eventIds.has(event.id) || event.sequence !== expectedSequence) {
			return {
				code: "INVENTORY_LEDGER_SEQUENCE_INVALID",
				message:
					"Inventory event ledger has duplicate or non-contiguous sequencing.",
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

function applyEvent(
	entries: Map<string, InventoryEntrySnapshot>,
	event: InventoryEventRecord,
): Result<void, InventoryFailure> {
	const key = createEntryKey(event.characterId, event.entryId);
	const current = entries.get(key);
	if (event.type === "inventory-item-added") {
		if (current) {
			return fail({
				code: "INVENTORY_LEDGER_ENTRY_CONFLICT",
				message: "Inventory entry cannot be added twice.",
				details: { entryId: event.entryId },
			});
		}

		if (!isValidAddedQuantity(event)) {
			return invalidQuantity(event);
		}

		entries.set(key, toEntry(event));
		return ok(undefined);
	}

	if (!current) {
		return fail({
			code: "INVENTORY_LEDGER_ENTRY_NOT_FOUND",
			message: "Inventory ledger event references a missing entry.",
			details: { entryId: event.entryId, type: event.type },
		});
	}

	if (
		current.catalogKind !== event.catalogKind ||
		current.catalogItemId !== event.catalogItemId ||
		current.characterId !== event.characterId
	) {
		return fail({
			code: "INVENTORY_LEDGER_ENTRY_CONFLICT",
			message: "Inventory ledger event changes the identity of an entry.",
			details: { entryId: event.entryId },
		});
	}

	if (event.type === "inventory-item-removed") {
		if (event.quantity !== 0) {
			return invalidQuantity(event);
		}
		entries.delete(key);
		return ok(undefined);
	}

	if (event.catalogKind !== "consumable" || event.quantity < 1) {
		return invalidQuantity(event);
	}

	entries.set(key, toEntry(event));
	return ok(undefined);
}

function createEntryKey(characterId: string, entryId: string): string {
	return `${characterId}:${entryId}`;
}

function isValidAddedQuantity(event: InventoryEventRecord): boolean {
	return event.catalogKind === "equipment"
		? event.quantity === 1
		: event.quantity >= 1;
}

function invalidQuantity(
	event: InventoryEventRecord,
): Result<never, InventoryFailure> {
	return fail({
		code: "INVENTORY_LEDGER_QUANTITY_INVALID",
		message: "Inventory event quantity is incompatible with its event type.",
		details: {
			catalogKind: event.catalogKind,
			entryId: event.entryId,
			quantity: event.quantity,
			type: event.type,
		},
	});
}

function toEntry(event: InventoryEventRecord): InventoryEntrySnapshot {
	return {
		characterId: event.characterId,
		entryId: event.entryId,
		catalogKind: event.catalogKind,
		catalogItemId: event.catalogItemId,
		quantity: event.quantity,
		lastSequence: event.sequence,
	};
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
