import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRepository } from "../domain/CharacterRepository";
import {
	type CharacterRecord,
	type CharacterStatusEffectRecord,
	characterSelectSchema,
	characterStatusEffectSelectSchema,
	type NewCharacterRecord,
	type NewCharacterStatusEffectRecord,
} from "../model/characterSchema";
import type { CharacterRepositoryFailure } from "../model/characterTypes";

export class InMemoryCharacterRepository implements CharacterRepository {
	private readonly records = new Map<string, CharacterRecord>();
	private readonly statusEffects = new Map<
		string,
		CharacterStatusEffectRecord
	>();
	private nextSaveFailure: CharacterRepositoryFailure | null = null;

	public async save(
		record: NewCharacterRecord,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		if (this.nextSaveFailure) {
			const failure = this.nextSaveFailure;
			this.nextSaveFailure = null;
			return fail(failure);
		}

		const parsed = characterSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_CHARACTER_RECORD",
				message: "Fake repository received an invalid character record.",
			});
		}

		this.records.set(parsed.data.id, parsed.data);
		return ok(parsed.data);
	}

	public async findById(
		id: string,
	): Promise<Result<CharacterRecord, CharacterRepositoryFailure>> {
		const record = this.records.get(id);

		if (!record) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: "Character record was not found in memory.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async saveStatusEffect(
		effect: NewCharacterStatusEffectRecord,
	): Promise<Result<CharacterStatusEffectRecord, CharacterRepositoryFailure>> {
		const parsed = characterStatusEffectSelectSchema.safeParse(effect);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_CHARACTER_RECORD",
				message: "Fake repository received an invalid status effect record.",
			});
		}

		this.statusEffects.set(parsed.data.id, parsed.data);
		return ok(parsed.data);
	}

	public async findStatusEffectsByCharacterId(
		characterId: string,
	): Promise<
		Result<CharacterStatusEffectRecord[], CharacterRepositoryFailure>
	> {
		const list = Array.from(this.statusEffects.values()).filter(
			(effect) => effect.characterId === characterId,
		);
		return ok(list);
	}

	public async deleteStatusEffect(
		id: string,
	): Promise<Result<void, CharacterRepositoryFailure>> {
		this.statusEffects.delete(id);
		return ok(undefined);
	}

	public all(): readonly CharacterRecord[] {
		return Array.from(this.records.values());
	}

	public failNextSave(failure: CharacterRepositoryFailure): void {
		this.nextSaveFailure = failure;
	}
}
