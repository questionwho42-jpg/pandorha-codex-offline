import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import {
	createRpcFailureResponse,
	createRpcSuccessResponse,
	type RpcBridgeFailure,
	type RpcRequest,
	type RpcResponse,
	rpcRequestSchema,
	rpcResponseSchema,
} from "../model/rpcSchemas";
import { FakeWorkerBridge } from "../testing/FakeWorkerBridge";

const MESSAGE_ID = "8aefb02e-6e5d-4d3c-9b2d-0d6af3497f52";
const CREATED_AT = "2026-05-14T11:20:00.000Z";

describe("RPC save/load contract", () => {
	it("accepts INIT_DATABASE requests with serializable payload", () => {
		const parsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "INIT_DATABASE",
			payload: { requestedAt: CREATED_AT },
		});

		expect(parsed.success).toBe(true);
	});

	it("accepts SAVE_GAME_SNAPSHOT requests for the primary save", () => {
		const parsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "SAVE_GAME_SNAPSHOT",
			payload: {
				saveId: "primary",
				snapshot: {
					version: 5,
					savedAt: CREATED_AT,
					characters: [{ id: "lia", name: "Lia", level: 1 }],
					worldState: [
						{
							key: "location:morden:gate-open",
							value: true,
							updatedAt: CREATED_AT,
						},
					],
					clocks: [{ id: "fortify-perimeter", currentSlices: 1 }],
					campSessions: [{ id: "camp-session-1", danger: 1 }],
					campAssignments: [{ id: "camp-assignment-1", hour: 1 }],
					factionStandings: [
						{ factionId: "training-thieves-guild", bloodDebt: 1 },
					],
					socialEncounters: [{ id: "social-encounter-one", status: "active" }],
					socialEncounterEvents: [
						{ id: "social-encounter-one-event-one", sequence: 0 },
					],
					npcRelationships: [{ npcId: "training-broker", status: "stable" }],
				},
			},
		});

		expect(parsed.success).toBe(true);
	});

	it("accepts LOAD_GAME_SNAPSHOT requests for the primary save", () => {
		const parsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "LOAD_GAME_SNAPSHOT",
			payload: { saveId: "primary" },
		});

		expect(parsed.success).toBe(true);
	});

	it("rejects non-serializable request payload values", () => {
		const parsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "SAVE_GAME_SNAPSHOT",
			payload: {
				saveId: "primary",
				snapshot: {
					version: 5,
					savedAt: CREATED_AT,
					characters: [{ id: "lia", createdAt: new Date(CREATED_AT) }],
					worldState: [],
					clocks: [],
					campSessions: [],
					campAssignments: [],
					factionStandings: [],
					socialEncounters: [],
					socialEncounterEvents: [],
					npcRelationships: [],
				},
			},
		});

		expect(parsed.success).toBe(false);
	});

	it("accepts success and failure responses without throwing", () => {
		const success = rpcResponseSchema.safeParse(
			createRpcSuccessResponse({
				messageId: MESSAGE_ID,
				data: { initialized: true },
			}),
		);
		const failure = rpcResponseSchema.safeParse(
			createRpcFailureResponse({
				messageId: MESSAGE_ID,
				code: "VALIDATION_ERROR",
				message: "Payload invalido.",
				details: { field: "payload" },
			}),
		);

		expect(success.success).toBe(true);
		expect(failure.success).toBe(true);
	});
});

describe("FakeWorkerBridge", () => {
	it("returns queued responses for valid requests", async () => {
		const bridge = new FakeWorkerBridge();
		const request = buildInitRequest();
		bridge.queueResponse(
			createRpcSuccessResponse({
				messageId: request.messageId,
				data: { initialized: true },
			}),
		);

		const result = await bridge.send(request);
		const response = expectBridgeSuccess(result);

		expect(response).toMatchObject({
			messageId: request.messageId,
			success: true,
			data: { initialized: true },
		});
		expect(bridge.requests).toEqual([request]);
	});

	it("rejects invalid requests before queue consumption", async () => {
		const bridge = new FakeWorkerBridge();
		bridge.queueResponse(
			createRpcSuccessResponse({
				messageId: MESSAGE_ID,
				data: { initialized: true },
			}),
		);

		const failure = expectBridgeFailure(
			await bridge.send({ type: "INIT_DATABASE" }),
		);

		expect(failure.code).toBe("INVALID_RPC_REQUEST");
		expect(bridge.requests).toEqual([]);
		expect(bridge.queuedResponseCount).toBe(1);
	});

	it("returns a typed failure when no response is queued", async () => {
		const failure = expectBridgeFailure(
			await new FakeWorkerBridge().send(buildInitRequest()),
		);

		expect(failure.code).toBe("RPC_RESPONSE_NOT_QUEUED");
	});

	it("rejects invalid queued responses and mismatched message ids", async () => {
		const invalidResponseBridge = new FakeWorkerBridge();
		invalidResponseBridge.queueResponse({
			messageId: MESSAGE_ID,
			success: true,
			data: () => "not serializable",
		});

		const mismatchBridge = new FakeWorkerBridge();
		mismatchBridge.queueResponse(
			createRpcSuccessResponse({
				messageId: "b99a8b77-a7a8-40c8-a327-45d6232fd31b",
				data: { initialized: true },
			}),
		);

		expect(
			expectBridgeFailure(await invalidResponseBridge.send(buildInitRequest()))
				.code,
		).toBe("INVALID_RPC_RESPONSE");
		expect(
			expectBridgeFailure(await mismatchBridge.send(buildInitRequest())).code,
		).toBe("RPC_MESSAGE_ID_MISMATCH");
	});
});

function buildInitRequest(): RpcRequest {
	return {
		messageId: MESSAGE_ID,
		type: "INIT_DATABASE",
		payload: { requestedAt: CREATED_AT },
	};
}

function expectBridgeSuccess(
	result: Result<RpcResponse, RpcBridgeFailure>,
): RpcResponse {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectBridgeFailure(
	result: Result<RpcResponse, RpcBridgeFailure>,
): RpcBridgeFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}
