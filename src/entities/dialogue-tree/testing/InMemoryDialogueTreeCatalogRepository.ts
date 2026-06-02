import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { DialogueTreeCatalogRepository } from "../domain/DialogueTreeCatalogRepository";
import {
	DIALOGUE_NODE_CATALOG,
	DIALOGUE_OPTION_CATALOG,
} from "../model/dialogueTreeCatalog";
import type {
	DialogueNodeId,
	DialogueNodeRecord,
	DialogueNpcId,
	DialogueOptionRecord,
} from "../model/dialogueTreeSchema";
import type { DialogueTreeFailure } from "../model/dialogueTreeTypes";

export class InMemoryDialogueTreeCatalogRepository
	implements DialogueTreeCatalogRepository
{
	private readonly nodes: readonly DialogueNodeRecord[];
	private readonly options: readonly DialogueOptionRecord[];
	private shouldFail = false;

	public constructor(
		nodes: readonly DialogueNodeRecord[] = DIALOGUE_NODE_CATALOG,
		options: readonly DialogueOptionRecord[] = DIALOGUE_OPTION_CATALOG,
	) {
		this.nodes = [...nodes];
		this.options = [...options];
	}

	public failNextCall(): void {
		this.shouldFail = true;
	}

	public async listNodesByNpcId(
		npcId: DialogueNpcId,
	): Promise<Result<readonly DialogueNodeRecord[], DialogueTreeFailure>> {
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		return ok(this.nodes.filter((node) => node.npcId === npcId));
	}

	public async findNodeById(
		id: DialogueNodeId,
	): Promise<Result<DialogueNodeRecord, DialogueTreeFailure>> {
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		const record = this.nodes.find((candidate) => candidate.id === id);
		if (!record) {
			return fail({
				code: "MISSING_DIALOGUE_NODE",
				message: "Dialogue node was not found.",
				details: { id },
			});
		}

		return ok(record);
	}

	public async listOptionsByNodeId(
		nodeId: DialogueNodeId,
	): Promise<Result<readonly DialogueOptionRecord[], DialogueTreeFailure>> {
		if (this.consumeFailure()) {
			return repositoryFailure();
		}

		return ok(
			[...this.options]
				.filter((option) => option.nodeId === nodeId)
				.sort((left, right) => left.sortOrder - right.sortOrder),
		);
	}

	private consumeFailure(): boolean {
		if (!this.shouldFail) {
			return false;
		}

		this.shouldFail = false;
		return true;
	}
}

function repositoryFailure(): Result<never, DialogueTreeFailure> {
	return fail({
		code: "REPOSITORY_FAILURE",
		message: "Dialogue tree repository failed.",
	});
}
