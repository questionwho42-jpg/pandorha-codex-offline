import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type SpellRecord,
	spellCircleSchema,
	spellIdSchema,
	spellSelectSchema,
} from "../model/spellSchema";
import type { SpellFailure } from "../model/spellTypes";
import type { SpellCatalogRepository } from "./SpellCatalogRepository";

/**
 * @description Exposes a minimal read-only spell catalog without casting, EE spending, metamagic, ActionQueue commands, or damage execution.
 * @rule docs/system/magic/12-00-codex-de-magia.md - spells define circle, EE cost, components, attack tests, saving throws, and concentration metadata
 * @rule docs/architecture/feature_state_machines.md - no spell may enter the ActionQueue before a future SpellCastBuilder validates Draft -> Weaving -> Audit -> Commit
 */
export class SpellCatalogService {
	public constructor(private readonly repository: SpellCatalogRepository) {}

	public async listSpells(): Promise<
		Result<readonly SpellRecord[], SpellFailure>
	> {
		const listed = await this.repository.listSpells();
		if (!listed.success) {
			return fail(listed.error);
		}

		return validateSpellRecords(listed.data);
	}

	public async findSpellById(
		id: unknown,
	): Promise<Result<SpellRecord, SpellFailure>> {
		const parsedId = spellIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_SPELL_ID",
				message: "Spell id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findSpellById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		return validateSpellRecord(found.data);
	}

	public async listSpellsByCircle(
		circle: unknown,
	): Promise<Result<readonly SpellRecord[], SpellFailure>> {
		const parsedCircle = spellCircleSchema.safeParse(circle);
		if (!parsedCircle.success) {
			return fail({
				code: "INVALID_SPELL_CIRCLE",
				message: "Spell circle must be an integer from 0 to 10.",
				details: { issues: formatIssues(parsedCircle.error.issues) },
			});
		}

		const listed = await this.repository.listSpellsByCircle(parsedCircle.data);
		if (!listed.success) {
			return fail(listed.error);
		}

		return validateSpellRecords(listed.data);
	}
}

function validateSpellRecords(
	records: readonly SpellRecord[],
): Result<readonly SpellRecord[], SpellFailure> {
	const validated: SpellRecord[] = [];
	for (const record of records) {
		const parsed = spellSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_SPELL_RECORD",
				message: "Spell record failed output validation.",
				details: { issues: formatIssues(parsed.error.issues) },
			});
		}

		validated.push(parsed.data);
	}

	return ok(validated);
}

function validateSpellRecord(
	record: SpellRecord,
): Result<SpellRecord, SpellFailure> {
	const parsed = spellSelectSchema.safeParse(record);
	if (!parsed.success) {
		return fail({
			code: "CORRUPTED_SPELL_RECORD",
			message: "Spell record failed output validation.",
			details: { issues: formatIssues(parsed.error.issues) },
		});
	}

	return ok(parsed.data);
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
