import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	TrapRepository,
	TrapRepositoryFailure,
} from "../domain/TrapRepository";
import {
	type NewTrapRecord,
	type TrapRecord,
	trapSelectSchema,
} from "../model/trapSchema";

export class SessionTrapRepository implements TrapRepository {
	private readonly records = new Map<string, TrapRecord>();

	public async save(
		record: NewTrapRecord,
	): Promise<Result<TrapRecord, TrapRepositoryFailure>> {
		const selectRecord: TrapRecord = {
			id: record.id,
			tileId: record.tileId,
			name: record.name,
			type: record.type,
			severity: record.severity,
			dc: record.dc,
			damage: record.damage,
			isDetected: record.isDetected ?? false,
			isDisarmed: record.isDisarmed ?? false,
			isTriggered: record.isTriggered ?? false,
			effects: record.effects ?? "[]",
			createdAt: record.createdAt ?? new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const parsed = trapSelectSchema.safeParse(selectRecord);

		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_TRAP_RECORD",
				message: "Session trap repository received an invalid trap record.",
				details: parsed.error,
			});
		}

		this.records.set(parsed.data.id, parsed.data);
		return ok(parsed.data);
	}

	public async findById(
		id: string,
	): Promise<Result<TrapRecord, TrapRepositoryFailure>> {
		const record = this.records.get(id);

		if (!record) {
			return fail({
				code: "TRAP_NOT_FOUND",
				message: "Trap record was not found in session memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async findByTileId(
		tileId: string,
	): Promise<Result<TrapRecord[], TrapRepositoryFailure>> {
		const list = Array.from(this.records.values()).filter(
			(trap) => trap.tileId === tileId,
		);
		return ok(list);
	}

	public async delete(
		id: string,
	): Promise<Result<void, TrapRepositoryFailure>> {
		this.records.delete(id);
		return ok(undefined);
	}

	public all(): readonly TrapRecord[] {
		return Array.from(this.records.values());
	}
}
