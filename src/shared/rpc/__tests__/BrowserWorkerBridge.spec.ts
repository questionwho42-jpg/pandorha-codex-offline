import { describe, expect, it, vi } from "vitest";
import {
	BrowserWorkerBridge,
	type BrowserWorkerLike,
} from "../infrastructure/BrowserWorkerBridge";

const INIT_MESSAGE_ID = "11111111-1111-4111-8111-111111111111";
const SAVE_MESSAGE_ID = "22222222-2222-4222-8222-222222222222";
const LOAD_MESSAGE_ID = "33333333-3333-4333-8333-333333333333";
const UNKNOWN_MESSAGE_ID = "44444444-4444-4444-8444-444444444444";

describe("BrowserWorkerBridge", () => {
	it("rejects invalid requests before posting to the Worker", async () => {
		const worker = new FakeBrowserWorker();
		const bridge = new BrowserWorkerBridge(worker);

		const result = await bridge.send({ type: "LOAD_GAME_SNAPSHOT" });

		expect(result).toMatchObject({
			success: false,
			error: { code: "INVALID_RPC_REQUEST" },
		});
		expect(worker.postedMessages).toEqual([]);
	});

	it("correlates out-of-order responses by message id", async () => {
		const worker = new FakeBrowserWorker();
		const bridge = new BrowserWorkerBridge(worker);
		const saveRequest = bridge.send(buildSaveRequest());
		const loadRequest = bridge.send(buildLoadRequest());

		worker.emitMessage({
			messageId: LOAD_MESSAGE_ID,
			success: true,
			data: { version: 1, savedAt: "2026-05-15T20:14:00.000Z" },
		});
		worker.emitMessage({
			messageId: SAVE_MESSAGE_ID,
			success: true,
			data: { saved: true },
		});

		expect(await saveRequest).toMatchObject({
			success: true,
			data: { messageId: SAVE_MESSAGE_ID, success: true },
		});
		expect(await loadRequest).toMatchObject({
			success: true,
			data: { messageId: LOAD_MESSAGE_ID, success: true },
		});
	});

	it("uses a shorter timeout for non-init commands", async () => {
		vi.useFakeTimers();
		const worker = new FakeBrowserWorker();
		const bridge = new BrowserWorkerBridge(worker);
		const resultPromise = bridge.send(buildSaveRequest());

		await vi.advanceTimersByTimeAsync(5_000);

		await expect(resultPromise).resolves.toMatchObject({
			success: false,
			error: { code: "RPC_RESPONSE_TIMEOUT" },
		});
		vi.useRealTimers();
	});

	it("uses the extended timeout for database initialization", async () => {
		vi.useFakeTimers();
		const worker = new FakeBrowserWorker();
		const bridge = new BrowserWorkerBridge(worker);
		const resultPromise = bridge.send(buildInitRequest());

		await vi.advanceTimersByTimeAsync(5_000);
		expect(worker.postedMessages).toHaveLength(1);
		await vi.advanceTimersByTimeAsync(25_000);

		await expect(resultPromise).resolves.toMatchObject({
			success: false,
			error: { code: "RPC_RESPONSE_TIMEOUT" },
		});
		vi.useRealTimers();
	});

	it("fails invalid responses for the matching pending request", async () => {
		const worker = new FakeBrowserWorker();
		const bridge = new BrowserWorkerBridge(worker);
		const resultPromise = bridge.send(buildSaveRequest());

		worker.emitMessage({
			messageId: SAVE_MESSAGE_ID,
			success: true,
			data: () => "not serializable",
		});

		await expect(resultPromise).resolves.toMatchObject({
			success: false,
			error: { code: "INVALID_RPC_RESPONSE" },
		});
	});

	it("ignores invalid responses that cannot be correlated", async () => {
		vi.useFakeTimers();
		const worker = new FakeBrowserWorker();
		const bridge = new BrowserWorkerBridge(worker);
		const resultPromise = bridge.send(buildSaveRequest());

		worker.emitMessage("invalid");
		worker.emitMessage(null);
		worker.emitMessage({
			messageId: "not-a-uuid",
			success: true,
			data: () => "invalid message id",
		});
		worker.emitMessage({
			messageId: UNKNOWN_MESSAGE_ID,
			success: true,
			data: () => "still invalid",
		});
		await vi.advanceTimersByTimeAsync(5_000);

		await expect(resultPromise).resolves.toMatchObject({
			success: false,
			error: { code: "RPC_RESPONSE_TIMEOUT" },
		});
		vi.useRealTimers();
	});

	it("fails a lone pending request when the Worker responds with another id", async () => {
		const worker = new FakeBrowserWorker();
		const bridge = new BrowserWorkerBridge(worker);
		const resultPromise = bridge.send(buildLoadRequest());

		worker.emitMessage({
			messageId: UNKNOWN_MESSAGE_ID,
			success: true,
			data: {},
		});

		await expect(resultPromise).resolves.toMatchObject({
			success: false,
			error: { code: "RPC_MESSAGE_ID_MISMATCH" },
		});
	});
});

function buildInitRequest() {
	return {
		messageId: INIT_MESSAGE_ID,
		type: "INIT_DATABASE" as const,
		payload: { requestedAt: "2026-05-15T20:14:00.000Z" },
	};
}

function buildSaveRequest() {
	return {
		messageId: SAVE_MESSAGE_ID,
		type: "SAVE_GAME_SNAPSHOT" as const,
		payload: {
			saveId: "primary" as const,
			snapshot: {
				version: 4 as const,
				savedAt: "2026-05-15T20:14:00.000Z",
				characters: [],
				worldState: [],
				clocks: [],
				campSessions: [],
				campAssignments: [],
				factionStandings: [],
				socialEncounters: [],
				socialEncounterEvents: [],
			},
		},
	};
}

function buildLoadRequest() {
	return {
		messageId: LOAD_MESSAGE_ID,
		type: "LOAD_GAME_SNAPSHOT" as const,
		payload: { saveId: "primary" as const },
	};
}

class FakeBrowserWorker implements BrowserWorkerLike {
	public readonly postedMessages: unknown[] = [];
	private readonly messageListeners = new Set<
		(event: MessageEvent<unknown>) => void
	>();

	public postMessage(message: unknown): void {
		this.postedMessages.push(message);
	}

	public addEventListener(
		type: "message",
		listener: (event: MessageEvent<unknown>) => void,
	): void {
		if (type === "message") {
			this.messageListeners.add(listener);
		}
	}

	public removeEventListener(
		type: "message",
		listener: (event: MessageEvent<unknown>) => void,
	): void {
		if (type === "message") {
			this.messageListeners.delete(listener);
		}
	}

	public emitMessage(data: unknown): void {
		for (const listener of this.messageListeners) {
			listener({ data } as MessageEvent<unknown>);
		}
	}
}
