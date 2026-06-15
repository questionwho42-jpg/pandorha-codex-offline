import type { ZodIssue } from "zod/v4";
import type {
	InventoryEntrySnapshot,
	InventoryEventRecord,
	NewInventoryEventRecord,
} from "$lib/entities/inventory";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	inventoryAddCatalogItemInputSchema,
	inventoryAddConsumableInputSchema,
	inventoryCharacterInputSchema,
	inventoryConsumeInputSchema,
	inventoryEntryMutationInputSchema,
} from "../model/inventoryManagementSchemas";
import type {
	InventoryCatalogIdentity,
	InventoryLoadedState,
	InventoryManagementFailure,
	InventoryManagementMutationResult,
	InventoryManagementServiceInput,
	InventoryManagementSnapshot,
	InventoryResolvedEntry,
} from "../model/inventoryManagementTypes";

/**
 * @description Coordinates per-character inventory events, immutable catalog definitions, and derived capacity without owning UI or persistence transport.
 * @rule docs/process/inventory-ownership-save-v6-gate.md - inventory is reconstructed from per-character events and derived totals are never persisted.
 */
export class InventoryManagementService {
	public constructor(private readonly input: InventoryManagementServiceInput) {}

	public async getInventory(
		input: unknown,
	): Promise<Result<InventoryManagementSnapshot, InventoryManagementFailure>> {
		const parsed = inventoryCharacterInputSchema.safeParse(input);
		if (!parsed.success) {
			return invalidInput(parsed.error.issues);
		}

		const state = await this.loadState(parsed.data.characterId);
		if (!state.success) {
			return state;
		}

		return this.buildSnapshot(state.data);
	}

	public async addEquipment(
		input: unknown,
	): Promise<
		Result<InventoryManagementMutationResult, InventoryManagementFailure>
	> {
		const parsed = inventoryAddCatalogItemInputSchema.safeParse(input);
		if (!parsed.success) {
			return invalidInput(parsed.error.issues);
		}

		const catalogItem =
			await this.input.equipmentCatalogService.findEquipmentById(
				parsed.data.catalogItemId,
			);
		if (!catalogItem.success) {
			return catalogFailure(parsed.data.catalogItemId, "equipment");
		}

		const state = await this.loadState(parsed.data.characterId);
		if (!state.success) {
			return state;
		}

		const event = this.createEvent({
			characterId: parsed.data.characterId,
			sequence: state.data.events.length + 1,
			type: "inventory-item-added",
			entryId: this.input.entryIdProvider.generate(),
			catalogKind: "equipment",
			catalogItemId: catalogItem.data.id,
			quantity: 1,
		});
		return this.appendAndSnapshot(parsed.data.characterId, [event]);
	}

	public async addConsumable(
		input: unknown,
	): Promise<
		Result<InventoryManagementMutationResult, InventoryManagementFailure>
	> {
		const parsed = inventoryAddConsumableInputSchema.safeParse(input);
		if (!parsed.success) {
			return invalidInput(parsed.error.issues);
		}

		const catalogItem =
			await this.input.equipmentCatalogService.findConsumableById(
				parsed.data.catalogItemId,
			);
		if (!catalogItem.success) {
			return catalogFailure(parsed.data.catalogItemId, "consumable");
		}

		const state = await this.loadState(parsed.data.characterId);
		if (!state.success) {
			return state;
		}

		const events = this.createConsumableEvents({
			characterId: parsed.data.characterId,
			entries: state.data.entries,
			firstSequence: state.data.events.length + 1,
			catalogItemId: catalogItem.data.id,
			maxQuantityPerStack: catalogItem.data.maxQuantityPerStack,
			quantity: parsed.data.quantity,
		});
		return this.appendAndSnapshot(parsed.data.characterId, events);
	}

	public async consumeConsumable(
		input: unknown,
	): Promise<
		Result<InventoryManagementMutationResult, InventoryManagementFailure>
	> {
		const parsed = inventoryConsumeInputSchema.safeParse(input);
		if (!parsed.success) {
			return invalidInput(parsed.error.issues);
		}

		const state = await this.loadState(parsed.data.characterId);
		if (!state.success) {
			return state;
		}

		const entry = state.data.entries.find(
			(candidate) => candidate.entryId === parsed.data.entryId,
		);
		if (!entry) {
			return entryNotFound(parsed.data.entryId);
		}
		if (entry.catalogKind !== "consumable") {
			return fail({
				code: "INVENTORY_ENTRY_KIND_INVALID",
				message: "Only consumable inventory entries can be consumed.",
				details: { entryId: entry.entryId, catalogKind: entry.catalogKind },
			});
		}
		if (parsed.data.quantity > entry.quantity) {
			return fail({
				code: "INVENTORY_QUANTITY_EXCEEDED",
				message: "Consumed quantity cannot exceed the carried stack quantity.",
				details: {
					entryId: entry.entryId,
					carriedQuantity: entry.quantity,
					requestedQuantity: parsed.data.quantity,
				},
			});
		}

		const nextQuantity = entry.quantity - parsed.data.quantity;
		const event = this.createEvent({
			characterId: parsed.data.characterId,
			sequence: state.data.events.length + 1,
			type:
				nextQuantity === 0
					? "inventory-item-removed"
					: "inventory-quantity-set",
			entryId: entry.entryId,
			catalogKind: entry.catalogKind,
			catalogItemId: entry.catalogItemId,
			quantity: nextQuantity,
		});
		return this.appendAndSnapshot(parsed.data.characterId, [event]);
	}

	public async removeEntry(
		input: unknown,
	): Promise<
		Result<InventoryManagementMutationResult, InventoryManagementFailure>
	> {
		const parsed = inventoryEntryMutationInputSchema.safeParse(input);
		if (!parsed.success) {
			return invalidInput(parsed.error.issues);
		}

		const state = await this.loadState(parsed.data.characterId);
		if (!state.success) {
			return state;
		}

		const entry = state.data.entries.find(
			(candidate) => candidate.entryId === parsed.data.entryId,
		);
		if (!entry) {
			return entryNotFound(parsed.data.entryId);
		}

		const event = this.createEvent({
			characterId: parsed.data.characterId,
			sequence: state.data.events.length + 1,
			type: "inventory-item-removed",
			entryId: entry.entryId,
			catalogKind: entry.catalogKind,
			catalogItemId: entry.catalogItemId,
			quantity: 0,
		});
		return this.appendAndSnapshot(parsed.data.characterId, [event]);
	}

	private async loadState(
		characterId: string,
	): Promise<Result<InventoryLoadedState, InventoryManagementFailure>> {
		const character =
			await this.input.characterRepository.findById(characterId);
		if (!character.success) {
			return fail({
				code: "INVENTORY_CHARACTER_NOT_FOUND",
				message: "Inventory character was not found.",
				details: { characterId },
			});
		}

		const listed =
			await this.input.inventoryRepository.listByCharacterId(characterId);
		if (!listed.success) {
			return repositoryFailure(listed.error.code);
		}

		const replayed = this.input.replayService.replay(listed.data);
		if (!replayed.success) {
			return fail({
				code: "INVENTORY_LEDGER_INVALID",
				message: "Inventory event ledger could not be replayed.",
				details: {
					characterId,
					ledgerCode: replayed.error.code,
				},
			});
		}

		return ok({
			character: character.data,
			entries: replayed.data,
			events: listed.data,
		});
	}

	private async buildSnapshot(
		state: InventoryLoadedState,
	): Promise<Result<InventoryManagementSnapshot, InventoryManagementFailure>> {
		const entries: InventoryResolvedEntry[] = [];
		for (const entry of state.entries) {
			const resolved = await this.resolveEntry(entry);
			if (!resolved.success) {
				return resolved;
			}
			entries.push(resolved.data);
		}

		const capacity = this.input.capacityService.calculateCapacity({
			physical: state.character.physical,
			resistance: state.character.resistance,
			items: entries.map((entry) => ({
				id: entry.entryId,
				label: entry.label,
				slotCost: entry.slotCost,
			})),
		});
		if (!capacity.success) {
			return fail({
				code: "INVENTORY_CAPACITY_FAILED",
				message: "Inventory capacity could not be derived.",
				details: { capacityCode: capacity.error.code },
			});
		}

		return ok({
			characterId: state.character.id,
			entries,
			capacity: capacity.data,
		});
	}

	private async resolveEntry(
		entry: InventoryEntrySnapshot,
	): Promise<Result<InventoryResolvedEntry, InventoryManagementFailure>> {
		if (entry.catalogKind === "equipment") {
			const found = await this.input.equipmentCatalogService.findEquipmentById(
				entry.catalogItemId,
			);
			if (!found.success) {
				return catalogFailure(entry.catalogItemId, entry.catalogKind);
			}
			return ok({
				...entry,
				label: found.data.label,
				slotCost: found.data.slotCost,
			});
		}

		const found = await this.input.equipmentCatalogService.findConsumableById(
			entry.catalogItemId,
		);
		if (!found.success) {
			return catalogFailure(entry.catalogItemId, entry.catalogKind);
		}
		return ok({
			...entry,
			label: found.data.label,
			slotCost: found.data.slotCostPerStack,
		});
	}

	private async appendAndSnapshot(
		characterId: string,
		events: readonly NewInventoryEventRecord[],
	): Promise<
		Result<InventoryManagementMutationResult, InventoryManagementFailure>
	> {
		const appended = await this.input.inventoryRepository.append(events);
		if (!appended.success) {
			return repositoryFailure(appended.error.code);
		}

		const inventory = await this.getInventory({ characterId });
		if (!inventory.success) {
			return inventory;
		}

		return ok({
			appendedEvents: appended.data,
			inventory: inventory.data,
		});
	}

	private createConsumableEvents(input: {
		readonly characterId: string;
		readonly entries: readonly InventoryEntrySnapshot[];
		readonly firstSequence: number;
		readonly catalogItemId: string;
		readonly maxQuantityPerStack: number;
		readonly quantity: number;
	}): readonly NewInventoryEventRecord[] {
		const events: NewInventoryEventRecord[] = [];
		let remaining = input.quantity;
		let nextSequence = input.firstSequence;
		const partialStacks = input.entries.filter(
			(entry) =>
				entry.catalogKind === "consumable" &&
				entry.catalogItemId === input.catalogItemId &&
				entry.quantity < input.maxQuantityPerStack,
		);

		for (const entry of partialStacks) {
			if (remaining === 0) {
				break;
			}
			const added = Math.min(
				remaining,
				input.maxQuantityPerStack - entry.quantity,
			);
			events.push(
				this.createEvent({
					characterId: input.characterId,
					sequence: nextSequence,
					type: "inventory-quantity-set",
					entryId: entry.entryId,
					catalogKind: "consumable",
					catalogItemId: input.catalogItemId,
					quantity: entry.quantity + added,
				}),
			);
			remaining -= added;
			nextSequence += 1;
		}

		while (remaining > 0) {
			const stackQuantity = Math.min(remaining, input.maxQuantityPerStack);
			events.push(
				this.createEvent({
					characterId: input.characterId,
					sequence: nextSequence,
					type: "inventory-item-added",
					entryId: this.input.entryIdProvider.generate(),
					catalogKind: "consumable",
					catalogItemId: input.catalogItemId,
					quantity: stackQuantity,
				}),
			);
			remaining -= stackQuantity;
			nextSequence += 1;
		}

		return events;
	}

	private createEvent(
		input: InventoryCatalogIdentity & {
			readonly characterId: string;
			readonly sequence: number;
			readonly type: InventoryEventRecord["type"];
			readonly entryId: string;
			readonly quantity: number;
		},
	): NewInventoryEventRecord {
		return {
			id: this.input.eventIdProvider.generate(),
			characterId: input.characterId,
			sequence: input.sequence,
			type: input.type,
			entryId: input.entryId,
			catalogKind: input.catalogKind,
			catalogItemId: input.catalogItemId,
			quantity: input.quantity,
			createdAt: this.input.clock.now(),
		};
	}
}

function invalidInput(
	issues: readonly ZodIssue[],
): Result<never, InventoryManagementFailure> {
	return fail({
		code: "INVALID_INVENTORY_MANAGEMENT_INPUT",
		message: "Inventory management input failed validation.",
		details: {
			issues: issues.map(
				(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
			),
		},
	});
}

function catalogFailure(
	catalogItemId: string,
	catalogKind: InventoryCatalogIdentity["catalogKind"],
): Result<never, InventoryManagementFailure> {
	return fail({
		code: "INVENTORY_CATALOG_ITEM_NOT_FOUND",
		message: "Inventory catalog item was not found.",
		details: { catalogItemId, catalogKind },
	});
}

function entryNotFound(
	entryId: string,
): Result<never, InventoryManagementFailure> {
	return fail({
		code: "INVENTORY_ENTRY_NOT_FOUND",
		message: "Inventory entry was not found.",
		details: { entryId },
	});
}

function repositoryFailure(
	repositoryCode: string,
): Result<never, InventoryManagementFailure> {
	return fail({
		code: "INVENTORY_REPOSITORY_FAILED",
		message: "Inventory event repository operation failed.",
		details: { repositoryCode },
	});
}
