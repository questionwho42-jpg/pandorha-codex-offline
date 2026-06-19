import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { EquipmentDurabilityEventRepository } from "../domain/EquipmentDurabilityEventRepository";
import {
	type EquipmentDurabilityEventRecord,
	equipmentDurabilityEventSelectSchema,
	type NewEquipmentDurabilityEventRecord,
} from "../model/equipmentDurabilityEventSchema";
import type { EquipmentDurabilityRepositoryFailure } from "../model/equipmentDurabilityTypes";

export class InMemoryEquipmentDurabilityEventRepository
	implements EquipmentDurabilityEventRepository
{
	private readonly records: EquipmentDurabilityEventRecord[] = [];
	private nextReadFailure: EquipmentDurabilityRepositoryFailure | null = null;
	private nextWriteFailure: EquipmentDurabilityRepositoryFailure | null = null;

	public constructor(records: readonly EquipmentDurabilityEventRecord[] = []) {
		for (const record of records) {
			const parsed = equipmentDurabilityEventSelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.push(parsed.data);
			}
		}
	}

	public async append(
		records: readonly NewEquipmentDurabilityEventRecord[],
	): Promise<
		Result<
			readonly EquipmentDurabilityEventRecord[],
			EquipmentDurabilityRepositoryFailure
		>
	> {
		if (this.nextWriteFailure) {
			const failure = this.nextWriteFailure;
			this.nextWriteFailure = null;
			return fail(failure);
		}

		const stored: EquipmentDurabilityEventRecord[] = [];
		for (const record of records) {
			const parsed = equipmentDurabilityEventSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "EQUIPMENT_DURABILITY_EVENT_REPOSITORY_WRITE_FAILED",
					message: "Equipment durability repository received invalid events.",
				});
			}
			stored.push(parsed.data);
		}

		this.records.push(...stored);
		return ok(stored.map((record) => ({ ...record })));
	}

	public async listByCharacterId(
		characterId: string,
	): Promise<
		Result<
			readonly EquipmentDurabilityEventRecord[],
			EquipmentDurabilityRepositoryFailure
		>
	> {
		if (this.nextReadFailure) {
			const failure = this.nextReadFailure;
			this.nextReadFailure = null;
			return fail(failure);
		}

		return ok(
			this.records
				.filter((record) => record.characterId === characterId)
				.map((record) => ({ ...record })),
		);
	}

	public all(): readonly EquipmentDurabilityEventRecord[] {
		return this.records.map((record) => ({ ...record }));
	}

	public replaceAll(
		records: readonly EquipmentDurabilityEventRecord[],
	): Result<
		readonly EquipmentDurabilityEventRecord[],
		EquipmentDurabilityRepositoryFailure
	> {
		const validatedRecords: EquipmentDurabilityEventRecord[] = [];
		for (const record of records) {
			const parsed = equipmentDurabilityEventSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "EQUIPMENT_DURABILITY_EVENT_REPOSITORY_WRITE_FAILED",
					message:
						"Equipment durability repository received an invalid ledger.",
				});
			}
			validatedRecords.push(parsed.data);
		}

		this.records.length = 0;
		this.records.push(...validatedRecords);
		return ok(this.all());
	}

	public failNextRead(failure: EquipmentDurabilityRepositoryFailure): void {
		this.nextReadFailure = failure;
	}

	public failNextWrite(failure: EquipmentDurabilityRepositoryFailure): void {
		this.nextWriteFailure = failure;
	}
}
