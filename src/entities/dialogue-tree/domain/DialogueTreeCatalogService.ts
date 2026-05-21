import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type DialogueNodeRecord,
	type DialogueOptionRecord,
	dialogueNodeIdSchema,
	dialogueNodeSelectSchema,
	dialogueNpcIdSchema,
	dialogueOptionSelectSchema,
} from "../model/dialogueTreeSchema";
import type { DialogueTreeFailure } from "../model/dialogueTreeTypes";
import type { DialogueTreeCatalogRepository } from "./DialogueTreeCatalogRepository";

/**
 * @description Exposes the first training dialogue tree without persistence, save migration, or narrative AI.
 * @rule docs/architecture/blueprint.md - social dialogue uses dialogue nodes and dialogue options.
 * @rule docs/system/survival/regras-negociacao.md - long negotiations use social arguments, persuasion progress, and patience.
 */
export class DialogueTreeCatalogService {
	public constructor(
		private readonly repository: DialogueTreeCatalogRepository,
	) {}

	public async listNodesByNpcId(
		npcId: unknown,
	): Promise<Result<readonly DialogueNodeRecord[], DialogueTreeFailure>> {
		const parsedNpcId = dialogueNpcIdSchema.safeParse(npcId);
		if (!parsedNpcId.success) {
			return fail({
				code: "INVALID_NPC_ID",
				message: "NPC id does not match the dialogue catalog id format.",
			});
		}

		const listed = await this.repository.listNodesByNpcId(parsedNpcId.data);
		if (!listed.success) {
			return fail(listed.error);
		}

		return validateNodes(listed.data);
	}

	public async findNodeById(
		id: unknown,
	): Promise<Result<DialogueNodeRecord, DialogueTreeFailure>> {
		const parsedId = dialogueNodeIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_DIALOGUE_NODE_ID",
				message: "Dialogue node id does not match the catalog id format.",
			});
		}

		const found = await this.repository.findNodeById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = dialogueNodeSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_DIALOGUE_NODE_RECORD",
				message: "Dialogue node record failed output validation.",
			});
		}

		return ok(parsedRecord.data);
	}

	public async listOptionsByNodeId(
		nodeId: unknown,
	): Promise<Result<readonly DialogueOptionRecord[], DialogueTreeFailure>> {
		const parsedNodeId = dialogueNodeIdSchema.safeParse(nodeId);
		if (!parsedNodeId.success) {
			return fail({
				code: "INVALID_DIALOGUE_NODE_ID",
				message: "Dialogue node id does not match the catalog id format.",
			});
		}

		const listed = await this.repository.listOptionsByNodeId(parsedNodeId.data);
		if (!listed.success) {
			return fail(listed.error);
		}

		return validateOptions(listed.data);
	}
}

function validateNodes(
	records: readonly DialogueNodeRecord[],
): Result<readonly DialogueNodeRecord[], DialogueTreeFailure> {
	const validated: DialogueNodeRecord[] = [];
	for (const record of records) {
		const parsed = dialogueNodeSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_DIALOGUE_NODE_RECORD",
				message: "Dialogue node record failed output validation.",
			});
		}

		validated.push(parsed.data);
	}

	return ok(validated);
}

function validateOptions(
	records: readonly DialogueOptionRecord[],
): Result<readonly DialogueOptionRecord[], DialogueTreeFailure> {
	const validated: DialogueOptionRecord[] = [];
	for (const record of records) {
		const parsed = dialogueOptionSelectSchema.safeParse(record);
		if (!parsed.success) {
			return fail({
				code: "CORRUPTED_DIALOGUE_OPTION_RECORD",
				message: "Dialogue option record failed output validation.",
			});
		}

		validated.push(parsed.data);
	}

	return ok(validated);
}
