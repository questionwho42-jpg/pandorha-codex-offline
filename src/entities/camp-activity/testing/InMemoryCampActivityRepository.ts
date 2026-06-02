import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CampActivityRepository } from "../domain/CampActivityRepository";
import type {
	CampActivityId,
	CampActivityRecord,
} from "../model/campActivitySchema";
import { campActivitySelectSchema } from "../model/campActivitySchema";
import type { CampActivityRepositoryFailure } from "../model/campActivityTypes";

export class InMemoryCampActivityRepository implements CampActivityRepository {
	private readonly records = new Map<CampActivityId, CampActivityRecord>();
	private nextListFailure: CampActivityRepositoryFailure | null = null;
	public lookupCount = 0;

	public constructor(records: readonly CampActivityRecord[]) {
		for (const record of records) {
			const parsed = campActivitySelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.set(parsed.data.id, parsed.data);
			}
		}
	}

	public async list(): Promise<
		Result<readonly CampActivityRecord[], CampActivityRepositoryFailure>
	> {
		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.records.values()));
	}

	public async findById(
		id: CampActivityId,
	): Promise<Result<CampActivityRecord, CampActivityRepositoryFailure>> {
		this.lookupCount += 1;
		const record = this.records.get(id);
		if (!record) {
			return fail({
				code: "CAMP_ACTIVITY_NOT_FOUND",
				message: "Camp activity was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public failNextList(failure: CampActivityRepositoryFailure): void {
		this.nextListFailure = failure;
	}
}
