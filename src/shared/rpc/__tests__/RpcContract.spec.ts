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
					version: 1,
					savedAt: CREATED_AT,
					characters: [{ id: "lia", name: "Lia", level: 1 }],
					worldState: [
						{
							key: "location:morden:gate-open",
							value: true,
							updatedAt: CREATED_AT,
						},
					],
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

	it("accepts SAVE_REGIONAL_DOMAIN, FIND_REGIONAL_DOMAIN, and LIST_REGIONAL_DOMAINS requests", () => {
		const saveParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "SAVE_REGIONAL_DOMAIN",
			payload: {
				regionalDomain: {
					id: "domain-1",
					matrixPhysicalLevel: 3,
					matrixMentalLevel: 1,
					matrixSocialLevel: 1,
					regentId: null,
					weeksAway: 0,
					taxStabilityRollDisadvantage: false,
					stabilityRollMinimumDc: 9,
					createdAt: CREATED_AT,
					updatedAt: CREATED_AT,
				},
			},
		});
		const findParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "FIND_REGIONAL_DOMAIN",
			payload: { id: "domain-1" },
		});
		const listParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "LIST_REGIONAL_DOMAINS",
			payload: {},
		});

		expect(saveParsed.success).toBe(true);
		expect(findParsed.success).toBe(true);
		expect(listParsed.success).toBe(true);
	});

	it("accepts camp session RPC requests (SAVE, FIND, LIST, DELETE)", () => {
		const saveParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "SAVE_CAMP_SESSION",
			payload: {
				campSession: {
					id: "camp-1",
					totalTime: 12,
					sleepHours: 8,
					availableActions: 4,
					dangerCounter: 2,
					activeActivitiesJson: "[]",
					createdAt: CREATED_AT,
					updatedAt: CREATED_AT,
				},
			},
		});
		const findParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "FIND_CAMP_SESSION",
			payload: { id: "camp-1" },
		});
		const listParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "LIST_CAMP_SESSIONS",
			payload: {},
		});
		const deleteParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "DELETE_CAMP_SESSION",
			payload: { id: "camp-1" },
		});

		expect(saveParsed.success).toBe(true);
		expect(findParsed.success).toBe(true);
		expect(listParsed.success).toBe(true);
		expect(deleteParsed.success).toBe(true);
	});

	it("accepts mercenary RPC requests (SAVE_COMPANY, FIND_COMPANY, LIST_COMPANIES, SAVE_SQUAD, FIND_SQUAD, LIST_SQUADS)", () => {
		const saveCompanyParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "SAVE_MERCENARY_COMPANY",
			payload: {
				company: {
					id: "company-1",
					bastionId: "bastion-1",
					tier: 2,
					reputation: 15,
					hqName: "Batalhão Dourado",
					createdAt: CREATED_AT,
					updatedAt: CREATED_AT,
				},
			},
		});
		const findCompanyParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "FIND_MERCENARY_COMPANY",
			payload: { id: "company-1" },
		});
		const listCompaniesParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "LIST_MERCENARY_COMPANIES",
			payload: {},
		});
		const saveSquadParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "SAVE_MERCENARY_SQUAD",
			payload: {
				squad: {
					id: "squad-1",
					companyId: "company-1",
					name: "Garras de Aço",
					physical: 3,
					mental: 1,
					social: 1,
					cohesionMax: 13,
					cohesionCurrent: 13,
					tagsJson: '["elite", "heavy_infantry"]',
					commandTactic: "stealthy",
					status: "available",
					assignedMissionId: null,
					createdAt: CREATED_AT,
					updatedAt: CREATED_AT,
				},
			},
		});
		const findSquadParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "FIND_MERCENARY_SQUAD",
			payload: { id: "squad-1" },
		});
		const listSquadsParsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "LIST_MERCENARY_SQUADS_BY_COMPANY",
			payload: { companyId: "company-1" },
		});

		expect(saveCompanyParsed.success).toBe(true);
		expect(findCompanyParsed.success).toBe(true);
		expect(listCompaniesParsed.success).toBe(true);
		expect(saveSquadParsed.success).toBe(true);
		expect(findSquadParsed.success).toBe(true);
		expect(listSquadsParsed.success).toBe(true);
	});

	it("rejects non-serializable request payload values", () => {
		const parsed = rpcRequestSchema.safeParse({
			messageId: MESSAGE_ID,
			type: "SAVE_GAME_SNAPSHOT",
			payload: {
				saveId: "primary",
				snapshot: {
					version: 1,
					savedAt: CREATED_AT,
					characters: [{ id: "lia", createdAt: new Date(CREATED_AT) }],
					worldState: [],
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
