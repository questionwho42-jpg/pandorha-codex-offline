import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { EquipmentLoadoutEventRepository } from "../domain/EquipmentLoadoutEventRepository";
import {
	type EquipmentLoadoutEventRecord,
	equipmentLoadoutEventSelectSchema,
	type NewEquipmentLoadoutEventRecord,
} from "../model/equipmentLoadoutEventSchema";
import type { EquipmentLoadoutRepositoryFailure } from "../model/equipmentLoadoutTypes";

export class InMemoryEquipmentLoadoutEventRepository
	implements EquipmentLoadoutEventRepository
{
	private readonly records: EquipmentLoadoutEventRecord[] = [];
	private nextReadFailure: EquipmentLoadoutRepositoryFailure | null = null;
	private nextWriteFailure: EquipmentLoadoutRepositoryFailure | null = null;

	public constructor(records: readonly EquipmentLoadoutEventRecord[] = []) {
		for (const record of records) {
			const parsed = equipmentLoadoutEventSelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.push(parsed.data);
			}
		}
	}

	public async append(
		records: readonly NewEquipmentLoadoutEventRecord[],
	): Promise<
		Result<
			readonly EquipmentLoadoutEventRecord[],
			EquipmentLoadoutRepositoryFailure
		>
	> {
		if (this.nextWriteFailure) {
			const failure = this.nextWriteFailure;
			this.nextWriteFailure = null;
			return fail(failure);
		}

		const stored: EquipmentLoadoutEventRecord[] = [];
		for (const record of records) {
			const parsed = equipmentLoadoutEventSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "EQUIPMENT_LOADOUT_EVENT_REPOSITORY_WRITE_FAILED",
					message: "Equipment loadout repository received invalid events.",
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
			readonly EquipmentLoadoutEventRecord[],
			EquipmentLoadoutRepositoryFailure
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

	public all(): readonly EquipmentLoadoutEventRecord[] {
		return this.records.map((record) => ({ ...record }));
	}

	public replaceAll(
		records: readonly EquipmentLoadoutEventRecord[],
	): Result<
		readonly EquipmentLoadoutEventRecord[],
		EquipmentLoadoutRepositoryFailure
	> {
		const validatedRecords: EquipmentLoadoutEventRecord[] = [];
		for (const record of records) {
			const parsed = equipmentLoadoutEventSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "EQUIPMENT_LOADOUT_EVENT_REPOSITORY_WRITE_FAILED",
					message: "Equipment loadout repository received an invalid ledger.",
				});
			}
			validatedRecords.push(parsed.data);
		}

		this.records.length = 0;
		this.records.push(...validatedRecords);
		return ok(this.all());
	}

	public failNextRead(failure: EquipmentLoadoutRepositoryFailure): void {
		this.nextReadFailure = failure;
	}

	public failNextWrite(failure: EquipmentLoadoutRepositoryFailure): void {
		this.nextWriteFailure = failure;
	}
}
