import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type DialogueChoiceRecord,
	dialogueChoiceIdSchema,
	dialogueChoiceSelectSchema,
	dialogueChoiceTagSchema,
} from "../model/dialogueChoiceSchema";
import type { DialogueChoiceFailure } from "../model/dialogueChoiceTypes";
import type { DialogueChoiceCatalogRepository } from "./DialogueChoiceCatalogRepository";

export class DialogueChoiceCatalogService {
	public constructor(
		private readonly repository: DialogueChoiceCatalogRepository,
	) {}

	/**
	 * @description Exposes training social argument choices without dialogue trees, WorldState consequences, or UI side effects.
	 * @rule docs/system/survival/regras-negociacao.md - negotiations can use persuasion, bargaining, and intimidation-like social pressure.
	 */
	public async listDialogueChoices(): Promise<
		Result<readonly DialogueChoiceRecord[], DialogueChoiceFailure>
	> {
		const listed = await this.repository.listDialogueChoices();
		if (!listed.success) {
			return fail(listed.error);
		}

		return validateRecords(listed.data);
	}

	public async findDialogueChoiceById(
		id: unknown,
	): Promise<Result<DialogueChoiceRecord, DialogueChoiceFailure>> {
		const parsedId = dialogueChoiceIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_DIALOGUE_CHOICE_ID",
				message: "Dialogue choice id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findDialogueChoiceById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = dialogueChoiceSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail(corruptedRecord(parsedRecord.error.issues));
		}

		return ok(parsedRecord.data);
	}

	public async listDialogueChoicesByTag(
		tag: unknown,
	): Promise<Result<readonly DialogueChoiceRecord[], DialogueChoiceFailure>> {
		const parsedTag = dialogueChoiceTagSchema.safeParse(tag);
		if (!parsedTag.success) {
			return fail({
				code: "INVALID_DIALOGUE_CHOICE_TAG",
				message: "Dialogue choice tag does not match the catalog format.",
				details: { issues: formatIssues(parsedTag.error.issues) },
			});
		}

		const listed = await this.repository.listDialogueChoicesByTag(
			parsedTag.data,
		);
		if (!listed.success) {
			return fail(listed.error);
		}

		return validateRecords(listed.data);
	}
}

function validateRecords(
	records: readonly DialogueChoiceRecord[],
): Result<readonly DialogueChoiceRecord[], DialogueChoiceFailure> {
	const validated: DialogueChoiceRecord[] = [];
	for (const record of records) {
		const parsed = dialogueChoiceSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail(corruptedRecord(parsed.error.issues));
		}

		validated.push(parsed.data);
	}

	return ok(validated);
}

function corruptedRecord(issues: readonly ZodIssue[]): DialogueChoiceFailure {
	return {
		code: "CORRUPTED_DIALOGUE_CHOICE_RECORD",
		message: "Dialogue choice record failed output validation.",
		details: { issues: formatIssues(issues) },
	};
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
