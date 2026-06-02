import type {
	DialogueNodeRecord,
	DialogueOptionRecord,
	DialogueTreeFailure,
} from "$lib/entities/dialogue-tree";
import type { Result } from "$lib/shared/lib/result";
import type { SocialEncounterEvent } from "./socialEncounterTypes";

export type DialogueTraversalFailureCode =
	| "INVALID_DIALOGUE_TRAVERSAL_INPUT"
	| "DIALOGUE_TREE_LOOKUP_FAILED"
	| "DIALOGUE_NODE_MISMATCH"
	| "DIALOGUE_OPTION_MISSING"
	| "DIALOGUE_OPTION_BLOCKED";

export interface DialogueTraversalFailure {
	readonly code: DialogueTraversalFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
	readonly cause?: DialogueTreeFailure;
}

export interface DialogueTraversalTreePort {
	findNodeById(
		id: string,
	): Promise<Result<DialogueNodeRecord, DialogueTreeFailure>>;
	listOptionsByNodeId(
		nodeId: string,
	): Promise<Result<readonly DialogueOptionRecord[], DialogueTreeFailure>>;
}

export interface DialogueTraversalResult {
	readonly currentNode: DialogueNodeRecord;
	readonly selectedOption: DialogueOptionRecord;
	readonly nextNode: DialogueNodeRecord;
	readonly selectedChoiceId: string;
	readonly event: SocialEncounterEvent;
}
