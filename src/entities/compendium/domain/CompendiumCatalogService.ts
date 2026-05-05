import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type CompendiumEntry,
	compendiumEntryIdSchema,
	compendiumEntrySelectSchema,
} from "../model/compendiumSchema";
import type { CompendiumFailure } from "../model/compendiumTypes";
import type { CompendiumRepository } from "./CompendiumRepository";

/**
 * @description Exposes the first read-only compendium slice without parsing the full docs corpus at runtime.
 * @rule docs/system/survival/guia-criacao-de-ficha.md - character creation references ancestry, class and background sources
 */
export class CompendiumCatalogService {
	public constructor(private readonly repository: CompendiumRepository) {}

	public async listEntries(): Promise<
		Result<readonly CompendiumEntry[], CompendiumFailure>
	> {
		const listed = await this.repository.list();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: CompendiumEntry[] = [];
		for (const record of listed.data) {
			const parsed = compendiumEntrySelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_COMPENDIUM_ENTRY",
					message: "Compendium entry failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findEntryById(
		id: unknown,
	): Promise<Result<CompendiumEntry, CompendiumFailure>> {
		const parsedId = compendiumEntryIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_COMPENDIUM_ENTRY_ID",
				message: "Compendium entry id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = compendiumEntrySelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_COMPENDIUM_ENTRY",
				message: "Compendium entry failed output validation.",
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
