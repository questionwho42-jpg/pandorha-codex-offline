import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterTraitSelectionRepository } from "../domain/CharacterTraitSelectionRepository";
import {
	type CharacterTraitSelectionRecord,
	characterTraitSelectionSelectSchema,
	type NewCharacterTraitSelectionRecord,
} from "../model/characterTraitSelectionSchema";
import type { CharacterTraitSelectionRepositoryFailure } from "../model/characterTypes";

export class SessionCharacterTraitSelectionRepository
	implements CharacterTraitSelectionRepository
{
	private readonly records: CharacterTraitSelectionRecord[] = [];
	private nextReadFailure: CharacterTraitSelectionRepositoryFailure | null =
		null;
	private nextWriteFailure: CharacterTraitSelectionRepositoryFailure | null =
		null;

	public constructor(records: readonly CharacterTraitSelectionRecord[] = []) {
		for (const record of records) {
			const parsed = characterTraitSelectionSelectSchema.safeParse(record);
			if (parsed.success) {
				this.records.push(parsed.data);
			}
		}
	}

	public async append(
		records: readonly NewCharacterTraitSelectionRecord[],
	): Promise<
		Result<
			readonly CharacterTraitSelectionRecord[],
			CharacterTraitSelectionRepositoryFailure
		>
	> {
		if (this.nextWriteFailure) {
			const failure = this.nextWriteFailure;
			this.nextWriteFailure = null;
			return fail(failure);
		}

		const stored: CharacterTraitSelectionRecord[] = [];
		for (const record of records) {
			const parsed = characterTraitSelectionSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CHARACTER_TRAIT_SELECTION_REPOSITORY_WRITE_FAILED",
					message:
						"Character trait selection repository received invalid records.",
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
			readonly CharacterTraitSelectionRecord[],
			CharacterTraitSelectionRepositoryFailure
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

	public all(): readonly CharacterTraitSelectionRecord[] {
		return this.records.map((record) => ({ ...record }));
	}

	public replaceAll(
		records: readonly CharacterTraitSelectionRecord[],
	): Result<
		readonly CharacterTraitSelectionRecord[],
		CharacterTraitSelectionRepositoryFailure
	> {
		const validatedRecords: CharacterTraitSelectionRecord[] = [];
		for (const record of records) {
			const parsed = characterTraitSelectionSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CHARACTER_TRAIT_SELECTION_REPOSITORY_WRITE_FAILED",
					message:
						"Character trait selection repository received an invalid ledger.",
				});
			}
			validatedRecords.push(parsed.data);
		}

		this.records.length = 0;
		this.records.push(...validatedRecords);
		return ok(this.all());
	}

	public failNextRead(failure: CharacterTraitSelectionRepositoryFailure): void {
		this.nextReadFailure = failure;
	}

	public failNextWrite(
		failure: CharacterTraitSelectionRepositoryFailure,
	): void {
		this.nextWriteFailure = failure;
	}
}
