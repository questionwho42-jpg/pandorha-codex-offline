import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	createRpcBridgeFailure,
	type RpcBridgeFailure,
	type RpcRequest,
	type RpcResponse,
	rpcMessageIdSchema,
	rpcRequestSchema,
	rpcResponseSchema,
} from "../model/rpcSchemas";
import type { WorkerBridge } from "../model/workerBridge";

const DEFAULT_TIMEOUT_MS = 5_000;
const INIT_TIMEOUT_MS = 30_000;

export interface BrowserWorkerLike {
	postMessage(message: unknown): void;
	addEventListener(
		type: "message",
		listener: (event: MessageEvent<unknown>) => void,
	): void;
	removeEventListener(
		type: "message",
		listener: (event: MessageEvent<unknown>) => void,
	): void;
}

interface PendingRequest {
	readonly request: RpcRequest;
	readonly resolve: (result: Result<RpcResponse, RpcBridgeFailure>) => void;
	readonly timeoutId: ReturnType<typeof setTimeout>;
}

/**
 * @description Bridges validated browser Worker messages into typed Result responses while preserving request/response correlation.
 * @rule docs/architecture/worker_rpc_spec.md - Main Thread/Worker exchange must stay typed and serializable.
 */
export class BrowserWorkerBridge implements WorkerBridge {
	private readonly pendingByMessageId = new Map<string, PendingRequest>();

	public constructor(private readonly worker: BrowserWorkerLike) {
		this.worker.addEventListener("message", this.handleMessage);
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

		return new Promise((resolve) => {
			const timeoutId = setTimeout(() => {
				this.pendingByMessageId.delete(parsedRequest.data.messageId);
				resolve(
					fail(
						createRpcBridgeFailure(
							"RPC_RESPONSE_TIMEOUT",
							"Worker did not answer the RPC request before the timeout.",
							{
								messageId: parsedRequest.data.messageId,
								type: parsedRequest.data.type,
							},
						),
					),
				);
			}, getTimeoutMs(parsedRequest.data.type));

			this.pendingByMessageId.set(parsedRequest.data.messageId, {
				request: parsedRequest.data,
				resolve,
				timeoutId,
			});
			this.worker.postMessage(parsedRequest.data);
		});
	}

	private readonly handleMessage = (event: MessageEvent<unknown>): void => {
		const parsedResponse = rpcResponseSchema.safeParse(event.data);
		if (!parsedResponse.success) {
			const messageId = extractMessageId(event.data);
			if (messageId === null) {
				return;
			}

			const pending = this.pendingByMessageId.get(messageId);
			if (!pending) {
				return;
			}

			this.resolvePending(
				pending,
				fail(
					createRpcBridgeFailure(
						"INVALID_RPC_RESPONSE",
						"Worker returned an invalid RPC response.",
						{
							issues: parsedResponse.error.issues.map((issue) => issue.message),
						},
					),
				),
			);
			return;
		}

		const pending = this.pendingByMessageId.get(parsedResponse.data.messageId);
		if (pending) {
			this.resolvePending(pending, ok(parsedResponse.data));
			return;
		}

		if (this.pendingByMessageId.size === 1) {
			const lonePending = [
				...this.pendingByMessageId.values(),
			][0] as PendingRequest;
			this.resolvePending(
				lonePending,
				fail(
					createRpcBridgeFailure(
						"RPC_MESSAGE_ID_MISMATCH",
						"Worker response did not match the pending request message id.",
						{
							requestMessageId: lonePending.request.messageId,
							responseMessageId: parsedResponse.data.messageId,
						},
					),
				),
			);
		}
	};

	private resolvePending(
		pending: PendingRequest,
		result: Result<RpcResponse, RpcBridgeFailure>,
	): void {
		clearTimeout(pending.timeoutId);
		this.pendingByMessageId.delete(pending.request.messageId);
		pending.resolve(result);
	}
}

function getTimeoutMs(type: RpcRequest["type"]): number {
	return type === "INIT_DATABASE" ? INIT_TIMEOUT_MS : DEFAULT_TIMEOUT_MS;
}

function extractMessageId(response: unknown): string | null {
	if (typeof response !== "object" || response === null) {
		return null;
	}

	const candidate = (response as { readonly messageId?: unknown }).messageId;
	const parsed = rpcMessageIdSchema.safeParse(candidate);
	return parsed.success ? parsed.data : null;
}
