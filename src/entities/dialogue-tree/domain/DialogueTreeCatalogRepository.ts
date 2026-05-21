import type { Result } from "$lib/shared/lib/result";
import type {
	DialogueNodeId,
	DialogueNodeRecord,
	DialogueNpcId,
	DialogueOptionRecord,
} from "../model/dialogueTreeSchema";
import type { DialogueTreeFailure } from "../model/dialogueTreeTypes";

export type DialogueTreeCatalogRepository = {
	readonly listNodesByNpcId: (
		npcId: DialogueNpcId,
	) => Promise<Result<readonly DialogueNodeRecord[], DialogueTreeFailure>>;
	readonly findNodeById: (
		id: DialogueNodeId,
	) => Promise<Result<DialogueNodeRecord, DialogueTreeFailure>>;
	readonly listOptionsByNodeId: (
		nodeId: DialogueNodeId,
	) => Promise<Result<readonly DialogueOptionRecord[], DialogueTreeFailure>>;
};
