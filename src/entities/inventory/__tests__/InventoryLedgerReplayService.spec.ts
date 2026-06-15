import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { InventoryLedgerReplayService } from "../domain/InventoryLedgerReplayService";
import type {
	InventoryEntrySnapshot,
	InventoryFailure,
} from "../model/inventoryTypes";

const CREATED_AT = "2026-06-06T10:00:00.000Z";

describe("InventoryLedgerReplayService", () => {
	it("returns an empty inventory for an empty ledger", () => {
		expect(expectSuccess(createService().replay([]))).toEqual([]);
	});

	it("sorts events and replays current carried entries", () => {
		const result = createService().replay([
			buildEvent({
				id: "event-3",
				sequence: 3,
				type: "inventory-item-removed",
				entryId: "entry-sword",
				catalogKind: "equipment",
				catalogItemId: "longsword",
				quantity: 0,
			}),
			buildEvent({
				id: "event-2",
				sequence: 2,
				type: "inventory-item-added",
				entryId: "entry-rope",
				catalogKind: "consumable",
				catalogItemId: "rope-stack",
				quantity: 1,
			}),
			buildEvent({
				id: "event-1",
				sequence: 1,
				entryId: "entry-sword",
				catalogKind: "equipment",
				catalogItemId: "longsword",
				quantity: 1,
			}),
			buildEvent({
				id: "event-4",
				sequence: 4,
				type: "inventory-quantity-set",
				entryId: "entry-rope",
				catalogKind: "consumable",
				catalogItemId: "rope-stack",
				quantity: 2,
			}),
		]);

		expect(expectSuccess(result)).toEqual([
			{
				characterId: "session-character-1",
				entryId: "entry-rope",
				catalogKind: "consumable",
				catalogItemId: "rope-stack",
				quantity: 2,
				lastSequence: 4,
			},
		]);
	});

	it("replays independent character ledgers without entry id collisions", () => {
		const result = createService().replay([
			buildEvent({
				id: "event-character-2",
				characterId: "session-character-2",
				entryId: "entry-1",
				catalogItemId: "longsword",
			}),
			buildEvent({
				id: "event-character-1",
				characterId: "session-character-1",
				entryId: "entry-1",
				catalogItemId: "dagger",
			}),
		]);

		expect(expectSuccess(result)).toEqual([
			expect.objectContaining({
				characterId: "session-character-1",
				catalogItemId: "dagger",
			}),
			expect.objectContaining({
				characterId: "session-character-2",
				catalogItemId: "longsword",
			}),
		]);
	});

	it("rejects invalid schemas, duplicate event ids, and invalid sequences", () => {
		expect(expectFailure(createService().replay(undefined)).code).toBe(
			"INVALID_INVENTORY_LEDGER",
		);
		expect(
			expectFailure(
				createService().replay([
					buildEvent({ id: "event-1", sequence: 1 }),
					buildEvent({ id: "event-1", sequence: 2, entryId: "entry-2" }),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_SEQUENCE_INVALID");
		expect(
			expectFailure(
				createService().replay([
					buildEvent({ id: "event-1", sequence: 1 }),
					buildEvent({ id: "event-2", sequence: 1, entryId: "entry-2" }),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_SEQUENCE_INVALID");
		expect(
			expectFailure(
				createService().replay([buildEvent({ id: "event-2", sequence: 2 })]),
			).code,
		).toBe("INVENTORY_LEDGER_SEQUENCE_INVALID");
	});

	it("rejects missing entries and catalog conflicts", () => {
		expect(
			expectFailure(
				createService().replay([
					buildEvent({
						type: "inventory-item-removed",
						quantity: 0,
					}),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_ENTRY_NOT_FOUND");

		expect(
			expectFailure(
				createService().replay([
					buildEvent({ sequence: 1 }),
					buildEvent({
						id: "event-2",
						sequence: 2,
						type: "inventory-item-added",
					}),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_ENTRY_CONFLICT");

		expect(
			expectFailure(
				createService().replay([
					buildEvent({ sequence: 1 }),
					buildEvent({
						id: "event-2",
						sequence: 2,
						type: "inventory-quantity-set",
						catalogItemId: "torch-stack",
						catalogKind: "consumable",
					}),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_ENTRY_CONFLICT");
	});

	it("rejects incompatible equipment and consumable quantities", () => {
		expect(
			expectFailure(createService().replay([buildEvent({ quantity: 2 })])).code,
		).toBe("INVENTORY_LEDGER_QUANTITY_INVALID");

		expect(
			expectFailure(
				createService().replay([
					buildEvent({
						catalogKind: "consumable",
						catalogItemId: "rope-stack",
						quantity: 1,
					}),
					buildEvent({
						id: "event-2",
						sequence: 2,
						type: "inventory-quantity-set",
						catalogKind: "consumable",
						catalogItemId: "rope-stack",
						quantity: 0,
					}),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_QUANTITY_INVALID");

		expect(
			expectFailure(
				createService().replay([
					buildEvent({ sequence: 1 }),
					buildEvent({
						id: "event-2",
						sequence: 2,
						type: "inventory-quantity-set",
						quantity: 1,
					}),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_QUANTITY_INVALID");

		expect(
			expectFailure(
				createService().replay([
					buildEvent({ sequence: 1 }),
					buildEvent({
						id: "event-2",
						sequence: 2,
						type: "inventory-item-removed",
						quantity: 1,
					}),
				]),
			).code,
		).toBe("INVENTORY_LEDGER_QUANTITY_INVALID");
	});
});

function createService(): InventoryLedgerReplayService {
	return new InventoryLedgerReplayService();
}

function buildEvent(
	patch: Readonly<Record<string, unknown>> = {},
): Readonly<Record<string, unknown>> {
	return {
		id: "event-1",
		characterId: "session-character-1",
		sequence: 1,
		type: "inventory-item-added",
		entryId: "entry-1",
		catalogKind: "equipment",
		catalogItemId: "longsword",
		quantity: 1,
		createdAt: CREATED_AT,
		...patch,
	};
}

function expectSuccess(
	result: Result<readonly InventoryEntrySnapshot[], InventoryFailure>,
): readonly InventoryEntrySnapshot[] {
	expect(result.success).toBe(true);
	return (result as Extract<typeof result, { readonly success: true }>).data;
}

function expectFailure(
	result: Result<readonly InventoryEntrySnapshot[], InventoryFailure>,
): InventoryFailure {
	expect(result.success).toBe(false);
	return (result as Extract<typeof result, { readonly success: false }>).error;
}
