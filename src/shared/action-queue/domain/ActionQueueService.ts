import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	actionCommandSchema,
	formatActionQueueIssues,
} from "../model/actionQueueSchemas";
import type {
	ActionCommand,
	ActionCommandProcessor,
	ActionQueueFailure,
	ActionQueueProcessedCommand,
	ActionQueueSnapshot,
} from "../model/actionQueueTypes";

/**
 * @rule docs/architecture/feature_state_machines.md - Action Queue uses FIFO sequencing and LIFO interruptions.
 */
export class ActionQueueService {
	private readonly normalQueue: ActionCommand[] = [];
	private readonly interruptionStack: ActionCommand[] = [];

	public enqueue(
		command: unknown,
	): Result<ActionQueueSnapshot, ActionQueueFailure> {
		const parsed = this.parseCommand(command);
		if (!parsed.success) {
			return fail(parsed.error);
		}

		const duplicate = this.findPendingCommand(parsed.data.id);
		if (duplicate) {
			return fail(createDuplicateFailure(duplicate.id));
		}

		this.normalQueue.push(parsed.data);
		return ok(this.snapshot());
	}

	public interrupt(
		command: unknown,
	): Result<ActionQueueSnapshot, ActionQueueFailure> {
		const parsed = this.parseCommand(command);
		if (!parsed.success) {
			return fail(parsed.error);
		}

		const duplicate = this.findPendingCommand(parsed.data.id);
		if (duplicate) {
			return fail(createDuplicateFailure(duplicate.id));
		}

		this.interruptionStack.push(parsed.data);
		return ok(this.snapshot());
	}

	public processNext(
		processor: ActionCommandProcessor,
	): Result<ActionQueueProcessedCommand, ActionQueueFailure> {
		const command = this.takeNext();
		if (!command) {
			return fail({
				code: "ACTION_QUEUE_EMPTY",
				message: "Action queue has no pending command to process.",
			});
		}

		const processed = processor.process(command);
		if (!processed.success) {
			return fail({
				code: "ACTION_PROCESSOR_FAILED",
				message: "Action command processor failed.",
				details: { processorFailureCode: processed.error.code },
				cause: processed.error,
			});
		}

		return ok(processed.data);
	}

	public peekNext(): Result<ActionCommand, ActionQueueFailure> {
		const command = this.readNext();
		if (!command) {
			return fail({
				code: "ACTION_QUEUE_EMPTY",
				message: "Action queue has no pending command to inspect.",
			});
		}

		return ok(copyCommand(command));
	}

	public snapshot(): ActionQueueSnapshot {
		return {
			normal: this.normalQueue.map(copyCommand),
			interruptions: this.interruptionStack.map(copyCommand),
		};
	}

	private parseCommand(
		command: unknown,
	): Result<ActionCommand, ActionQueueFailure> {
		const parsed = actionCommandSchema.safeParse(command);
		if (!parsed.success) {
			return fail({
				code: "INVALID_ACTION_COMMAND",
				message: "Action command failed validation.",
				details: { issues: formatActionQueueIssues(parsed.error.issues) },
			});
		}

		const normalizedCommand = {
			id: parsed.data.id,
			type: parsed.data.type,
			createdAt: parsed.data.createdAt,
			...(parsed.data.source !== undefined
				? { source: parsed.data.source }
				: {}),
			...(parsed.data.payload !== undefined
				? { payload: parsed.data.payload }
				: {}),
		};

		return ok(copyCommand(normalizedCommand));
	}

	private findPendingCommand(id: string): ActionCommand | null {
		return (
			this.normalQueue.find((command) => command.id === id) ??
			this.interruptionStack.find((command) => command.id === id) ??
			null
		);
	}

	private readNext(): ActionCommand | null {
		return (
			this.interruptionStack[this.interruptionStack.length - 1] ??
			this.normalQueue[0] ??
			null
		);
	}

	private takeNext(): ActionCommand | null {
		const interruption = this.interruptionStack.pop();
		if (interruption) {
			return interruption;
		}

		return this.normalQueue.shift() ?? null;
	}
}

function createDuplicateFailure(id: string): ActionQueueFailure {
	return {
		code: "DUPLICATE_PENDING_COMMAND",
		message: "Action command id is already pending in the queue.",
		details: { id },
	};
}

function copyCommand(command: ActionCommand): ActionCommand {
	const base = {
		id: command.id,
		type: command.type,
		createdAt: command.createdAt,
		...(command.source !== undefined ? { source: command.source } : {}),
	};

	return command.payload !== undefined
		? { ...base, payload: { ...command.payload } }
		: base;
}
