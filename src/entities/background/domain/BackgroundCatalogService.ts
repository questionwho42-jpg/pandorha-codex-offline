import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type BackgroundRecord,
	backgroundIdSchema,
	backgroundSelectSchema,
} from "../model/backgroundSchema";
import type { BackgroundFailure } from "../model/backgroundTypes";
import type { BackgroundRepository } from "./BackgroundRepository";

/**
 * @description Exposes the official background catalog without applying origin abilities or talent mechanics.
 * @rule docs/system/survival/10-antecedentes-e-origens.md - level-one characters choose one background and one talent from that background
 */
export class BackgroundCatalogService {
	public constructor(private readonly repository: BackgroundRepository) {}

	public async listBackgrounds(): Promise<
		Result<readonly BackgroundRecord[], BackgroundFailure>
	> {
		const listed = await this.repository.list();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: BackgroundRecord[] = [];
		for (const record of listed.data) {
			const parsed = backgroundSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_BACKGROUND_RECORD",
					message: "Background record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findBackgroundById(
		id: unknown,
	): Promise<Result<BackgroundRecord, BackgroundFailure>> {
		const parsedId = backgroundIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_BACKGROUND_ID",
				message: "Background id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = backgroundSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_BACKGROUND_RECORD",
				message: "Background record failed output validation.",
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
