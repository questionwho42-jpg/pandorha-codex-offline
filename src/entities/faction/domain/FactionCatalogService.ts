import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type FactionRecord,
	type FactionStandingRecord,
	factionIdSchema,
	factionSelectSchema,
	factionStandingSelectSchema,
} from "../model/factionSchema";
import type { FactionFailure } from "../model/factionTypes";
import type { FactionCatalogRepository } from "./FactionCatalogRepository";

/**
 * @description Exposes training factions and their social standing records without applying social actions or persistence.
 * @rule docs/system/survival/21-mecanicas-de-fama-e-influencia.md - fame measures social recognition and feeds prestige.
 * @rule docs/system/survival/31-codex-teia-infamia-patrocinio.md - blood debt limit is based on faction fame.
 */
export class FactionCatalogService {
	public constructor(private readonly repository: FactionCatalogRepository) {}

	public async listFactions(): Promise<
		Result<readonly FactionRecord[], FactionFailure>
	> {
		const listed = await this.repository.listFactions();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: FactionRecord[] = [];
		for (const record of listed.data) {
			const parsed = factionSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_FACTION_RECORD",
					message: "Faction record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findFactionById(
		id: unknown,
	): Promise<Result<FactionRecord, FactionFailure>> {
		const parsedId = factionIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_FACTION_ID",
				message: "Faction id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findFactionById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = factionSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_FACTION_RECORD",
				message: "Faction record failed output validation.",
				details: { issues: formatIssues(parsedRecord.error.issues) },
			});
		}

		return ok(parsedRecord.data);
	}

	public async listFactionStandings(): Promise<
		Result<readonly FactionStandingRecord[], FactionFailure>
	> {
		const listed = await this.repository.listFactionStandings();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: FactionStandingRecord[] = [];
		for (const record of listed.data) {
			const parsed = factionStandingSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_FACTION_STANDING_RECORD",
					message: "Faction standing failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findFactionStandingByFactionId(
		id: unknown,
	): Promise<Result<FactionStandingRecord, FactionFailure>> {
		const parsedId = factionIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_FACTION_ID",
				message: "Faction id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findFactionStandingByFactionId(
			parsedId.data,
		);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = factionStandingSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_FACTION_STANDING_RECORD",
				message: "Faction standing failed output validation.",
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
