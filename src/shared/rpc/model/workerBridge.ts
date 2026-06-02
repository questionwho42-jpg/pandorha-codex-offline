import type { Result } from "$lib/shared/lib/result";
import type { RpcBridgeFailure, RpcResponse } from "./rpcSchemas";

export interface WorkerBridge {
	send(request: unknown): Promise<Result<RpcResponse, RpcBridgeFailure>>;
}
