import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type NpcRecord,
	npcFactionIdSchema,
	npcIdSchema,
	npcSelectSchema,
} from "../model/npcSchema";
import type { NpcFailure } from "../model/npcTypes";
import type { NpcCatalogRepository } from "./NpcCatalogRepository";

export class NpcCatalogService {
	public constructor(private readonly repository: NpcCatalogRepository) {}

	/**
	 * @description Exposes training NPCs without applying dialogue, recruitment, or social encounter state.
	 * @rule docs/system/survival/06-npcs-e-aliados.md - NPCs have will, morale, and social leadership constraints.
	 * @rule docs/system/survival/regras-negociacao.md - negotiation scenes use persuasion track and patience reserve.
	 */
	public async listNpcs(): Promise<Result<readonly NpcRecord[], NpcFailure>> {
		const listed = await this.repository.listNpcs();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: NpcRecord[] = [];
		for (const record of listed.data) {
			const parsed = npcSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_NPC_RECORD",
					message: "Npc record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findNpcById(
		id: unknown,
	): Promise<Result<NpcRecord, NpcFailure>> {
		const parsedId = npcIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_NPC_ID",
				message: "Npc id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findNpcById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = npcSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_NPC_RECORD",
				message: "Npc record failed output validation.",
				details: { issues: formatIssues(parsedRecord.error.issues) },
			});
		}

		return ok(parsedRecord.data);
	}

	public async listNpcsByFactionId(
		factionId: unknown,
	): Promise<Result<readonly NpcRecord[], NpcFailure>> {
		const parsedFactionId = npcFactionIdSchema.safeParse(factionId);
		if (!parsedFactionId.success) {
			return fail({
				code: "INVALID_FACTION_ID",
				message: "Faction id does not match the catalog id format.",
				details: { issues: formatIssues(parsedFactionId.error.issues) },
			});
		}

		const listed = await this.repository.listNpcsByFactionId(
			parsedFactionId.data,
		);
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: NpcRecord[] = [];
		for (const record of listed.data) {
			const parsed = npcSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_NPC_RECORD",
					message: "Npc record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
