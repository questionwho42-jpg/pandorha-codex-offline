import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	createRpcBridgeFailure,
	type RpcBridgeFailure,
	type RpcRequest,
	type RpcResponse,
	rpcRequestSchema,
	rpcResponseSchema,
} from "../model/rpcSchemas";

export interface WorkerBridge {
	send(request: unknown): Promise<Result<RpcResponse, RpcBridgeFailure>>;
}

export class FakeWorkerBridge implements WorkerBridge {
	private readonly recordedRequests: RpcRequest[] = [];
	private readonly queuedResponses: unknown[] = [];

	public get requests(): readonly RpcRequest[] {
		return this.recordedRequests;
	}

	public get queuedResponseCount(): number {
		return this.queuedResponses.length;
	}

	public queueResponse(response: unknown): void {
		this.queuedResponses.push(response);
	}

	public async send(
		request: unknown,
	): Promise<Result<RpcResponse, RpcBridgeFailure>> {
		const parsedRequest = rpcRequestSchema.safeParse(request);
		if (!parsedRequest.success) {
			return fail(
				createRpcBridgeFailure(
					"INVALID_RPC_REQUEST",
					"RPC request failed validation before reaching the Worker.",
					{ issues: parsedRequest.error.issues.map((issue) => issue.message) },
				),
			);
		}

		const queuedResponse = this.queuedResponses.shift();
		if (queuedResponse === undefined) {
			return fail(
				createRpcBridgeFailure(
					"RPC_RESPONSE_NOT_QUEUED",
					"FakeWorkerBridge has no queued response for this request.",
					{ messageId: parsedRequest.data.messageId },
				),
			);
		}

		const parsedResponse = rpcResponseSchema.safeParse(queuedResponse);
		if (!parsedResponse.success) {
			return fail(
				createRpcBridgeFailure(
					"INVALID_RPC_RESPONSE",
					"Queued RPC response failed validation.",
					{ issues: parsedResponse.error.issues.map((issue) => issue.message) },
				),
			);
		}

		this.recordedRequests.push(parsedRequest.data);

		if (parsedResponse.data.messageId !== parsedRequest.data.messageId) {
			return fail(
				createRpcBridgeFailure(
					"RPC_MESSAGE_ID_MISMATCH",
					"Queued RPC response did not match the request message id.",
					{
						requestMessageId: parsedRequest.data.messageId,
						responseMessageId: parsedResponse.data.messageId,
					},
				),
			);
		}

		return ok(parsedResponse.data);
	}
}
