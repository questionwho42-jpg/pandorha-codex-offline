import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { ActionQueueService } from "../domain/ActionQueueService";
import type {
	ActionCommand,
	ActionCommandProcessor,
	ActionQueueFailure,
	ActionQueueProcessedCommand,
	ActionQueueProcessorFailure,
} from "../model/actionQueueTypes";

describe("ActionQueueService", () => {
	it("processes normal commands in FIFO order", () => {
		const queue = new ActionQueueService();
		const processor = new RecordingProcessor();

		expect(queue.enqueue(createCommand("move-1")).success).toBe(true);
		expect(queue.enqueue(createCommand("attack-1")).success).toBe(true);

		const first = expectQueueSuccess(queue.processNext(processor));
		const second = expectQueueSuccess(queue.processNext(processor));

		expect(first.commandId).toBe("move-1");
		expect(second.commandId).toBe("attack-1");
		expect(processor.processedIds).toEqual(["move-1", "attack-1"]);
	});

	it("processes interruptions in LIFO order before normal commands", () => {
		const queue = new ActionQueueService();
		const processor = new RecordingProcessor();

		queue.enqueue(createCommand("attack-1"));
		queue.interrupt(createCommand("reaction-1"));
		queue.interrupt(createCommand("reaction-2"));

		const first = expectQueueSuccess(queue.processNext(processor));
		const second = expectQueueSuccess(queue.processNext(processor));
		const third = expectQueueSuccess(queue.processNext(processor));

		expect([first.commandId, second.commandId, third.commandId]).toEqual([
			"reaction-2",
			"reaction-1",
			"attack-1",
		]);
	});

	it("peeks the next command without removing it", () => {
		const queue = new ActionQueueService();
		const processor = new RecordingProcessor();

		queue.enqueue(createCommand("attack-1"));
		queue.interrupt(createCommand("reaction-1"));

		const peeked = expectCommandSuccess(queue.peekNext());
		const processed = expectQueueSuccess(queue.processNext(processor));

		expect(peeked.id).toBe("reaction-1");
		expect(processed.commandId).toBe("reaction-1");
		expect(queue.snapshot().normal).toHaveLength(1);
	});

	it("peeks a normal command when no interruption is pending", () => {
		const queue = new ActionQueueService();
		queue.enqueue(createMinimalCommand("move-1"));

		const peeked = expectCommandSuccess(queue.peekNext());

		expect(peeked).toEqual(createMinimalCommand("move-1"));
		expect(queue.snapshot().normal).toHaveLength(1);
	});

	it("returns typed failure when processing an empty queue", () => {
		const queue = new ActionQueueService();
		const processor = new RecordingProcessor();

		const failure = expectQueueFailure(queue.processNext(processor));

		expect(failure.code).toBe("ACTION_QUEUE_EMPTY");
		expect(processor.processedIds).toEqual([]);
	});

	it("returns typed failure when peeking an empty queue", () => {
		const queue = new ActionQueueService();

		const failure = expectCommandFailure(queue.peekNext());

		expect(failure.code).toBe("ACTION_QUEUE_EMPTY");
	});

	it("rejects invalid commands", () => {
		const queue = new ActionQueueService();

		const result = queue.enqueue({
			id: "invalid id",
			type: "attack",
			createdAt: "not-an-iso-date",
		});
		const failure = expectSnapshotFailure(result);

		expect(failure.code).toBe("INVALID_ACTION_COMMAND");
		expect(failure.details?.issues).toContain(
			"id: Invalid string: must match pattern /^[a-z][a-z0-9-]*$/",
		);
	});

	it("rejects invalid interruption commands", () => {
		const queue = new ActionQueueService();

		const result = queue.interrupt({
			id: "reaction-1",
			type: "invalid type",
			createdAt: "2026-05-06T00:00:00.000Z",
		});
		const failure = expectSnapshotFailure(result);

		expect(failure.code).toBe("INVALID_ACTION_COMMAND");
	});

	it("rejects duplicate pending command ids across normal and interruption queues", () => {
		const queue = new ActionQueueService();

		queue.enqueue(createCommand("attack-1"));
		const duplicate = expectSnapshotFailure(
			queue.interrupt(createCommand("attack-1")),
		);

		expect(duplicate.code).toBe("DUPLICATE_PENDING_COMMAND");
		expect(duplicate.details?.id).toBe("attack-1");
	});

	it("rejects duplicate pending command ids when enqueueing after an interruption", () => {
		const queue = new ActionQueueService();

		queue.interrupt(createCommand("reaction-1"));
		const duplicate = expectSnapshotFailure(
			queue.enqueue(createCommand("reaction-1")),
		);

		expect(duplicate.code).toBe("DUPLICATE_PENDING_COMMAND");
		expect(duplicate.details?.id).toBe("reaction-1");
	});

	it("returns typed failure when the processor fails", () => {
		const queue = new ActionQueueService();
		const processor = new RecordingProcessor({
			code: "PROCESSOR_REJECTED_COMMAND",
			message: "Processor rejected the command.",
			details: { reason: "fixture" },
		});

		queue.enqueue(createCommand("attack-1"));
		const failure = expectQueueFailure(queue.processNext(processor));

		expect(failure.code).toBe("ACTION_PROCESSOR_FAILED");
		expect(failure.details?.processorFailureCode).toBe(
			"PROCESSOR_REJECTED_COMMAND",
		);
		expect(queue.snapshot().normal).toHaveLength(0);
	});

	it("returns snapshots that cannot mutate internal queue state", () => {
		const queue = new ActionQueueService();
		queue.enqueue(createCommand("attack-1"));
		queue.interrupt(createCommand("reaction-1"));

		const snapshot = queue.snapshot();
		const mutableNormal = snapshot.normal as ActionCommand[];
		const mutableInterruptions = snapshot.interruptions as ActionCommand[];
		mutableNormal.push(createCommand("external-normal"));
		mutableInterruptions.push(createCommand("external-interruption"));

		expect(queue.snapshot().normal.map((command) => command.id)).toEqual([
			"attack-1",
		]);
		expect(queue.snapshot().interruptions.map((command) => command.id)).toEqual(
			["reaction-1"],
		);
	});
});

function createCommand(id: string): ActionCommand {
	return {
		id,
		type: "test-command",
		source: "ActionQueueService.spec",
		createdAt: "2026-05-06T00:00:00.000Z",
		payload: { actorId: "hero-1", cost: 1, consumesAction: true },
	};
}

function createMinimalCommand(id: string): ActionCommand {
	return {
		id,
		type: "test-command",
		createdAt: "2026-05-06T00:00:00.000Z",
	};
}

function expectQueueSuccess(
	result: Result<ActionQueueProcessedCommand, ActionQueueFailure>,
): ActionQueueProcessedCommand {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectQueueFailure(
	result: Result<ActionQueueProcessedCommand, ActionQueueFailure>,
): ActionQueueFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

function expectCommandSuccess(
	result: Result<ActionCommand, ActionQueueFailure>,
): ActionCommand {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectCommandFailure(
	result: Result<ActionCommand, ActionQueueFailure>,
): ActionQueueFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

function expectSnapshotFailure(
	result: Result<unknown, ActionQueueFailure>,
): ActionQueueFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class RecordingProcessor implements ActionCommandProcessor {
	public readonly processedIds: string[] = [];

	public constructor(
		private readonly nextFailure: ActionQueueProcessorFailure | null = null,
	) {}

	public process(
		command: ActionCommand,
	): Result<ActionQueueProcessedCommand, ActionQueueProcessorFailure> {
		this.processedIds.push(command.id);

		if (this.nextFailure) {
			return fail(this.nextFailure);
		}

		return ok({
			commandId: command.id,
			commandType: command.type,
			processedAt: "2026-05-06T00:00:01.000Z",
		});
	}
}
