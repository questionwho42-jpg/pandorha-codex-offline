import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { AncestryRepository } from "../domain/AncestryRepository";
import type { AncestryId, AncestryRecord } from "../model/ancestrySchema";
import { ancestrySelectSchema } from "../model/ancestrySchema";
import type { AncestryRepositoryFailure } from "../model/ancestryTypes";

export class InMemoryAncestryRepository implements AncestryRepository {
	private readonly records = new Map<AncestryId, AncestryRecord>();
	private nextListFailure: AncestryRepositoryFailure | null = null;
	private nextFindFailure: AncestryRepositoryFailure | null = null;
	public lookupCount = 0;

	public constructor(records: readonly AncestryRecord[]) {
		for (const record of records) {
			const parsed = ancestrySelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.set(parsed.data.id, parsed.data);
			}
		}
	}

	public async list(): Promise<
		Result<readonly AncestryRecord[], AncestryRepositoryFailure>
	> {
		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.records.values()));
	}

	public async findById(
		id: AncestryId,
	): Promise<Result<AncestryRecord, AncestryRepositoryFailure>> {
		this.lookupCount += 1;

		if (this.nextFindFailure) {
			const failure = this.nextFindFailure;
			this.nextFindFailure = null;
			return fail(failure);
		}

		const record = this.records.get(id);
		if (!record) {
			return fail({
				code: "ANCESTRY_NOT_FOUND",
				message: "Ancestry record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public failNextList(failure: AncestryRepositoryFailure): void {
		this.nextListFailure = failure;
	}

	public failNextFind(failure: AncestryRepositoryFailure): void {
		this.nextFindFailure = failure;
	}
}
