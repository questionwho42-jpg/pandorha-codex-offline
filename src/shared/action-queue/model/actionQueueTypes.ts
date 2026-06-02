import type { Result } from "$lib/shared/lib/result";

export type ActionCommandPayloadValue = string | number | boolean | null;
export type ActionCommandPayload = Readonly<
	Record<string, ActionCommandPayloadValue>
>;

export interface ActionCommand {
	readonly id: string;
	readonly type: string;
	readonly source?: string;
	readonly createdAt: string;
	readonly payload?: ActionCommandPayload;
}

export interface ActionQueueSnapshot {
	readonly normal: readonly ActionCommand[];
	readonly interruptions: readonly ActionCommand[];
}

export interface ActionQueueProcessedCommand {
	readonly commandId: string;
	readonly commandType: string;
	readonly processedAt: string;
}

export type ActionQueueProcessorFailureCode = "PROCESSOR_REJECTED_COMMAND";

export type ActionQueueFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface ActionQueueProcessorFailure {
	readonly code: ActionQueueProcessorFailureCode;
	readonly message: string;
	readonly details?: ActionQueueFailureDetails;
}

export interface ActionCommandProcessor {
	process(
		command: ActionCommand,
	): Result<ActionQueueProcessedCommand, ActionQueueProcessorFailure>;
}

export type ActionQueueFailureCode =
	| "INVALID_ACTION_COMMAND"
	| "DUPLICATE_PENDING_COMMAND"
	| "ACTION_QUEUE_EMPTY"
	| "ACTION_PROCESSOR_FAILED";

export interface ActionQueueFailure {
	readonly code: ActionQueueFailureCode;
	readonly message: string;
	readonly details?: ActionQueueFailureDetails;
	readonly cause?: ActionQueueProcessorFailure;
}
