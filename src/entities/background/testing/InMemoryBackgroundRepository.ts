import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { BackgroundRepository } from "../domain/BackgroundRepository";
import type { BackgroundId, BackgroundRecord } from "../model/backgroundSchema";
import { backgroundSelectSchema } from "../model/backgroundSchema";
import type { BackgroundRepositoryFailure } from "../model/backgroundTypes";

export class InMemoryBackgroundRepository implements BackgroundRepository {
	private readonly records = new Map<BackgroundId, BackgroundRecord>();
	private nextListFailure: BackgroundRepositoryFailure | null = null;
	private nextFindFailure: BackgroundRepositoryFailure | null = null;
	public lookupCount = 0;

	public constructor(records: readonly BackgroundRecord[]) {
		for (const record of records) {
			const parsed = backgroundSelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.set(parsed.data.id, parsed.data);
			}
		}
	}

	public async list(): Promise<
		Result<readonly BackgroundRecord[], BackgroundRepositoryFailure>
	> {
		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.records.values()));
	}

	public async findById(
		id: BackgroundId,
	): Promise<Result<BackgroundRecord, BackgroundRepositoryFailure>> {
		this.lookupCount += 1;

		if (this.nextFindFailure) {
			const failure = this.nextFindFailure;
			this.nextFindFailure = null;
			return fail(failure);
		}

		const record = this.records.get(id);
		if (!record) {
			return fail({
				code: "BACKGROUND_NOT_FOUND",
				message: "Background record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public failNextList(failure: BackgroundRepositoryFailure): void {
		this.nextListFailure = failure;
	}

	public failNextFind(failure: BackgroundRepositoryFailure): void {
		this.nextFindFailure = failure;
	}
}
