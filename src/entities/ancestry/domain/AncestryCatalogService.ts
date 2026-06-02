import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type AncestryRecord,
	ancestryIdSchema,
	ancestrySelectSchema,
} from "../model/ancestrySchema";
import type { AncestryFailure } from "../model/ancestryTypes";
import type { AncestryRepository } from "./AncestryRepository";

/**
 * @description Exposes the official ancestry catalog without applying trait or bonus mechanics.
 * @rule docs/system/survival/01-00-regras-gerais.md - six ancestries, initial bonuses, primordial ability, traits deferred
 */
export class AncestryCatalogService {
	public constructor(private readonly repository: AncestryRepository) {}

	public async listAncestries(): Promise<
		Result<readonly AncestryRecord[], AncestryFailure>
	> {
		const listed = await this.repository.list();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: AncestryRecord[] = [];
		for (const record of listed.data) {
			const parsed = ancestrySelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_ANCESTRY_RECORD",
					message: "Ancestry record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findAncestryById(
		id: unknown,
	): Promise<Result<AncestryRecord, AncestryFailure>> {
		const parsedId = ancestryIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_ANCESTRY_ID",
				message: "Ancestry id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = ancestrySelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_ANCESTRY_RECORD",
				message: "Ancestry record failed output validation.",
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
