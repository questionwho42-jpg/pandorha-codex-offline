import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterClassRepository } from "../domain/CharacterClassRepository";
import type {
	CharacterClassId,
	CharacterClassRecord,
} from "../model/characterClassSchema";
import { characterClassSelectSchema } from "../model/characterClassSchema";
import type { CharacterClassRepositoryFailure } from "../model/characterClassTypes";

export class InMemoryCharacterClassRepository
	implements CharacterClassRepository
{
	private readonly records = new Map<CharacterClassId, CharacterClassRecord>();
	private nextListFailure: CharacterClassRepositoryFailure | null = null;
	private nextFindFailure: CharacterClassRepositoryFailure | null = null;
	public lookupCount = 0;

	public constructor(records: readonly CharacterClassRecord[]) {
		for (const record of records) {
			const parsed = characterClassSelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.set(parsed.data.id, parsed.data);
			}
		}
	}

	public async list(): Promise<
		Result<readonly CharacterClassRecord[], CharacterClassRepositoryFailure>
	> {
		if (this.nextListFailure) {
			const failure = this.nextListFailure;
			this.nextListFailure = null;
			return fail(failure);
		}

		return ok(Array.from(this.records.values()));
	}

	public async findById(
		id: CharacterClassId,
	): Promise<Result<CharacterClassRecord, CharacterClassRepositoryFailure>> {
		this.lookupCount += 1;

		if (this.nextFindFailure) {
			const failure = this.nextFindFailure;
			this.nextFindFailure = null;
			return fail(failure);
		}

		const record = this.records.get(id);
		if (!record) {
			return fail({
				code: "CHARACTER_CLASS_NOT_FOUND",
				message: "Character class record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public failNextList(failure: CharacterClassRepositoryFailure): void {
		this.nextListFailure = failure;
	}

	public failNextFind(failure: CharacterClassRepositoryFailure): void {
		this.nextFindFailure = failure;
	}
}
