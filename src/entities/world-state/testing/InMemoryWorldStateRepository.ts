import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { WorldStateRepository } from "../domain/WorldStateRepository";
import {
	type NewWorldStateEntryRecord,
	type WorldStateEntryRecord,
	type WorldStateKey,
	type WorldStateListPrefix,
	worldStateEntrySelectSchema,
} from "../model/worldStateSchema";
import type { WorldStateRepositoryFailure } from "../model/worldStateTypes";

interface InMemoryWorldStateRepositoryInput {
	readonly records?: readonly WorldStateEntryRecord[];
}

export class InMemoryWorldStateRepository implements WorldStateRepository {
	private readonly recordsByKey = new Map<
		WorldStateKey,
		WorldStateEntryRecord
	>();
	private nextWriteFailure: WorldStateRepositoryFailure | null = null;
	private nextLookupFailure: WorldStateRepositoryFailure | null = null;
	private nextListFailure: WorldStateRepositoryFailure | null = null;
	public writeCount = 0;
	public lookupCount = 0;
	public listCount = 0;

	public constructor(input: InMemoryWorldStateRepositoryInput = {}) {
		for (const record of input.records ?? []) {
			const parsed = worldStateEntrySelectSchema.safeParse(record);
			if (parsed.success) {
				this.recordsByKey.set(parsed.data.key, parsed.data);
			}
		}
	}

	public async setFlag(
		record: NewWorldStateEntryRecord,
	): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>> {
		this.writeCount += 1;

		if (this.nextWriteFailure) {
			const failure = this.nextWriteFailure;
			this.nextWriteFailure = null;
			return fail(failure);
		}

		const stored = { ...record };
		this.recordsByKey.set(stored.key, stored);
		return ok({ ...stored });
	}

	public async getFlag(
		key: WorldStateKey,
	): Promise<Result<WorldStateEntryRecord, WorldStateRepositoryFailure>> {
		this.lookupCount += 1;

		if (this.nextLookupFailure) {
			const failure = this.nextLookupFailure;
			this.nextLookupFailure = null;
			return fail(failure);
		}

		const record = this.recordsByKey.get(key);
		if (!record) {
			return fail({
				code: "WORLD_STATE_FLAG_NOT_FOUND",
				message: "World state flag was not found in memory.",
				details: { key },
			});
		}

		return ok({ ...record });
	}

	public async listFlagsByPrefix(
		prefix: WorldStateListPrefix,
	): Promise<
		Result<readonly WorldStateEntryRecord[], WorldStateRepositoryFailure>
	> {
		this.listCount += 1;

		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		return ok(
			Array.from(this.recordsByKey.values())
				.filter((record) => record.key.startsWith(prefix))
				.map((record) => ({ ...record })),
		);
	}

	public failNextWrite(failure: WorldStateRepositoryFailure): void {
		this.nextWriteFailure = failure;
	}

	public failNextLookup(failure: WorldStateRepositoryFailure): void {
		this.nextLookupFailure = failure;
	}

	public failNextList(failure: WorldStateRepositoryFailure): void {
		this.nextListFailure = failure;
	}
}
