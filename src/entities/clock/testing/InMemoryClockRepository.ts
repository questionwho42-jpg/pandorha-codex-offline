import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { ClockRepository } from "../domain/ClockRepository";
import {
	type ClockId,
	type ClockRecord,
	clockSelectSchema,
	type NewClockRecord,
} from "../model/clockSchema";
import type { ClockRepositoryFailure } from "../model/clockTypes";

interface InMemoryClockRepositoryInput {
	readonly records?: readonly ClockRecord[];
}

export class InMemoryClockRepository implements ClockRepository {
	private readonly recordsById = new Map<ClockId, ClockRecord>();
	private nextWriteFailure: ClockRepositoryFailure | null = null;
	private nextLookupFailure: ClockRepositoryFailure | null = null;
	public writeCount = 0;
	public lookupCount = 0;

	public constructor(input: InMemoryClockRepositoryInput = {}) {
		for (const record of input.records ?? []) {
			const parsedRecord = clockSelectSchema.safeParse(record);
			if (parsedRecord.success) {
				this.recordsById.set(parsedRecord.data.id, parsedRecord.data);
			}
		}
	}

	public async save(
		record: NewClockRecord,
	): Promise<Result<ClockRecord, ClockRepositoryFailure>> {
		this.writeCount += 1;

		if (this.nextWriteFailure) {
			const failure = this.nextWriteFailure;
			this.nextWriteFailure = null;
			return fail(failure);
		}

		const stored = { ...record };
		this.recordsById.set(stored.id, stored);
		return ok({ ...stored });
	}

	public async findById(
		id: ClockId,
	): Promise<Result<ClockRecord, ClockRepositoryFailure>> {
		this.lookupCount += 1;

		if (this.nextLookupFailure) {
			const failure = this.nextLookupFailure;
			this.nextLookupFailure = null;
			return fail(failure);
		}

		const record = this.recordsById.get(id);
		if (!record) {
			return fail({
				code: "CLOCK_NOT_FOUND",
				message: "Clock was not found in memory.",
				details: { id },
			});
		}

		return ok({ ...record });
	}

	public failNextWrite(failure: ClockRepositoryFailure): void {
		this.nextWriteFailure = failure;
	}

	public failNextLookup(failure: ClockRepositoryFailure): void {
		this.nextLookupFailure = failure;
	}
}
