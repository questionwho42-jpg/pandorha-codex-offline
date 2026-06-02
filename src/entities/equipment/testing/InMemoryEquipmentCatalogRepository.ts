import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { EquipmentCatalogRepository } from "../domain/EquipmentCatalogRepository";
import type {
	ConsumableId,
	ConsumableRecord,
	EquipmentId,
	EquipmentRecord,
} from "../model/equipmentSchema";
import {
	consumableSelectSchema,
	equipmentSelectSchema,
} from "../model/equipmentSchema";
import type { EquipmentRepositoryFailure } from "../model/equipmentTypes";

interface InMemoryEquipmentCatalogInput {
	readonly equipment: readonly EquipmentRecord[];
	readonly consumables: readonly ConsumableRecord[];
}

export class InMemoryEquipmentCatalogRepository
	implements EquipmentCatalogRepository
{
	private readonly equipmentRecords = new Map<EquipmentId, EquipmentRecord>();
	private readonly consumableRecords = new Map<
		ConsumableId,
		ConsumableRecord
	>();
	private nextEquipmentListFailure: EquipmentRepositoryFailure | null = null;
	private nextEquipmentFindFailure: EquipmentRepositoryFailure | null = null;
	private nextConsumableListFailure: EquipmentRepositoryFailure | null = null;
	private nextConsumableFindFailure: EquipmentRepositoryFailure | null = null;
	public equipmentLookupCount = 0;
	public consumableLookupCount = 0;

	public constructor(input: InMemoryEquipmentCatalogInput) {
		for (const record of input.equipment) {
			const parsed = equipmentSelectSchema.safeParse(record);
			if (parsed.success) {
				this.equipmentRecords.set(parsed.data.id, parsed.data);
			}
		}

		for (const record of input.consumables) {
			const parsed = consumableSelectSchema.safeParse(record);
			if (parsed.success) {
				this.consumableRecords.set(parsed.data.id, parsed.data);
			}
		}
	}

	public async listEquipment(): Promise<
		Result<readonly EquipmentRecord[], EquipmentRepositoryFailure>
	> {
		if (this.nextEquipmentListFailure) {
			const failure = this.nextEquipmentListFailure;
			this.nextEquipmentListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.equipmentRecords.values()));
	}

	public async findEquipmentById(
		id: EquipmentId,
	): Promise<Result<EquipmentRecord, EquipmentRepositoryFailure>> {
		this.equipmentLookupCount += 1;

		if (this.nextEquipmentFindFailure) {
			const failure = this.nextEquipmentFindFailure;
			this.nextEquipmentFindFailure = null;
			return fail(failure);
		}

		const record = this.equipmentRecords.get(id);
		if (!record) {
			return fail({
				code: "EQUIPMENT_NOT_FOUND",
				message: "Equipment record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async listConsumables(): Promise<
		Result<readonly ConsumableRecord[], EquipmentRepositoryFailure>
	> {
		if (this.nextConsumableListFailure) {
			const failure = this.nextConsumableListFailure;
			this.nextConsumableListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.consumableRecords.values()));
	}

	public async findConsumableById(
		id: ConsumableId,
	): Promise<Result<ConsumableRecord, EquipmentRepositoryFailure>> {
		this.consumableLookupCount += 1;

		if (this.nextConsumableFindFailure) {
			const failure = this.nextConsumableFindFailure;
			this.nextConsumableFindFailure = null;
			return fail(failure);
		}

		const record = this.consumableRecords.get(id);
		if (!record) {
			return fail({
				code: "CONSUMABLE_NOT_FOUND",
				message: "Consumable record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public failNextEquipmentList(failure: EquipmentRepositoryFailure): void {
		this.nextEquipmentListFailure = failure;
	}

	public failNextEquipmentFind(failure: EquipmentRepositoryFailure): void {
		this.nextEquipmentFindFailure = failure;
	}

	public failNextConsumableList(failure: EquipmentRepositoryFailure): void {
		this.nextConsumableListFailure = failure;
	}

	public failNextConsumableFind(failure: EquipmentRepositoryFailure): void {
		this.nextConsumableFindFailure = failure;
	}
}
