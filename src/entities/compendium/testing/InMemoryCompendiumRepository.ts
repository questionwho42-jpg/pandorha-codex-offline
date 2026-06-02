import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CompendiumRepository } from "../domain/CompendiumRepository";
import {
	type CompendiumEntry,
	type CompendiumEntryId,
	compendiumEntrySelectSchema,
} from "../model/compendiumSchema";
import type { CompendiumRepositoryFailure } from "../model/compendiumTypes";

export class InMemoryCompendiumRepository implements CompendiumRepository {
	private readonly records = new Map<CompendiumEntryId, CompendiumEntry>();
	private nextListFailure: CompendiumRepositoryFailure | null = null;
	private nextFindFailure: CompendiumRepositoryFailure | null = null;
	public lookupCount = 0;

	public constructor(records: readonly CompendiumEntry[]) {
		for (const record of records) {
			const parsed = compendiumEntrySelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.set(parsed.data.id, parsed.data);
			}
		}
	}

	public async list(): Promise<
		Result<readonly CompendiumEntry[], CompendiumRepositoryFailure>
	> {
		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.records.values()));
	}

	public async findById(
		id: CompendiumEntryId,
	): Promise<Result<CompendiumEntry, CompendiumRepositoryFailure>> {
		this.lookupCount += 1;

		if (this.nextFindFailure) {
			const failure = this.nextFindFailure;
			this.nextFindFailure = null;
			return fail(failure);
		}

		const record = this.records.get(id);
		if (!record) {
			return fail({
				code: "COMPENDIUM_ENTRY_NOT_FOUND",
				message: "Compendium entry was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public failNextList(failure: CompendiumRepositoryFailure): void {
		this.nextListFailure = failure;
	}

	public failNextFind(failure: CompendiumRepositoryFailure): void {
		this.nextFindFailure = failure;
	}
}
