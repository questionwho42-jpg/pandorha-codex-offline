import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type CharacterClassRecord,
	characterClassIdSchema,
	characterClassSelectSchema,
} from "../model/characterClassSchema";
import type { CharacterClassFailure } from "../model/characterClassTypes";
import type { CharacterClassRepository } from "./CharacterClassRepository";

/**
 * @description Exposes the official character class catalog without applying level, talent, or derived-stat mechanics.
 * @rule docs/system/survival/05-00-regras-de-classe.md - class records define base HP, proficiencies, passive text, and initial talent choice text
 */
export class CharacterClassCatalogService {
	public constructor(private readonly repository: CharacterClassRepository) {}

	public async listCharacterClasses(): Promise<
		Result<readonly CharacterClassRecord[], CharacterClassFailure>
	> {
		const listed = await this.repository.list();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: CharacterClassRecord[] = [];
		for (const record of listed.data) {
			const parsed = characterClassSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CHARACTER_CLASS_RECORD",
					message: "Character class record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findCharacterClassById(
		id: unknown,
	): Promise<Result<CharacterClassRecord, CharacterClassFailure>> {
		const parsedId = characterClassIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_CHARACTER_CLASS_ID",
				message: "Character class id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = characterClassSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_CHARACTER_CLASS_RECORD",
				message: "Character class record failed output validation.",
				details: { issues: formatIssues(parsedRecord.error.issues) },
			});
		}

		return ok(parsedRecord.data);
	}
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
