import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { InventoryEventRepository } from "../domain/InventoryEventRepository";
import {
	type InventoryEventRecord,
	inventoryEventSelectSchema,
	type NewInventoryEventRecord,
} from "../model/inventoryEventSchema";
import type { InventoryRepositoryFailure } from "../model/inventoryTypes";

export class InMemoryInventoryEventRepository
	implements InventoryEventRepository
{
	private readonly records: InventoryEventRecord[] = [];
	private nextReadFailure: InventoryRepositoryFailure | null = null;
	private nextWriteFailure: InventoryRepositoryFailure | null = null;

	public constructor(records: readonly InventoryEventRecord[] = []) {
		for (const record of records) {
			const parsed = inventoryEventSelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.push(parsed.data);
			}
		}
	}

	public async append(
		records: readonly NewInventoryEventRecord[],
	): Promise<
		Result<readonly InventoryEventRecord[], InventoryRepositoryFailure>
	> {
		if (this.nextWriteFailure) {
			const failure = this.nextWriteFailure;
			this.nextWriteFailure = null;
			return fail(failure);
		}

		const stored = records.map((record) => ({ ...record }));
		this.records.push(...stored);
		return ok(stored);
	}

	public async listByCharacterId(
		characterId: string,
	): Promise<
		Result<readonly InventoryEventRecord[], InventoryRepositoryFailure>
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

	public all(): readonly InventoryEventRecord[] {
		return this.records.map((record) => ({ ...record }));
	}

	public failNextRead(failure: InventoryRepositoryFailure): void {
		this.nextReadFailure = failure;
	}

	public failNextWrite(failure: InventoryRepositoryFailure): void {
		this.nextWriteFailure = failure;
	}
}
