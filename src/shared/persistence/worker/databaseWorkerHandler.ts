import {
	createRpcFailureResponse,
	createRpcSuccessResponse,
	type RpcResponse,
	rpcMessageIdSchema,
	rpcRequestSchema,
} from "$lib/shared/rpc";
import type { SqliteOpfsBootstrapService } from "../domain/SqliteOpfsBootstrapService";

const FALLBACK_MESSAGE_ID = "00000000-0000-4000-8000-000000000000";

interface DatabaseWorkerHandlerInput {
	readonly bootstrapService: SqliteOpfsBootstrapService;
}

export async function handleDatabaseWorkerRequest(
	request: unknown,
	input: DatabaseWorkerHandlerInput,
): Promise<RpcResponse> {
	const parsedRequest = rpcRequestSchema.safeParse(request);
	if (!parsedRequest.success) {
		return createRpcFailureResponse({
			messageId: extractMessageId(request),
			code: "VALIDATION_ERROR",
			message: "Mensagem RPC invalida.",
			details: {
				issues: parsedRequest.error.issues.map((issue) => issue.message),
			},
		});
	}

	if (parsedRequest.data.type !== "INIT_DATABASE") {
		return createRpcFailureResponse({
			messageId: parsedRequest.data.messageId,
			code: "RPC_COMMAND_NOT_IMPLEMENTED",
			message: "Este comando RPC sera implementado em uma etapa posterior.",
			details: { type: parsedRequest.data.type },
		});
	}

	const initialized = await input.bootstrapService.initializeDatabase({
		requestedAt: parsedRequest.data.payload.requestedAt,
	});
	if (!initialized.success) {
		return createRpcFailureResponse({
			messageId: parsedRequest.data.messageId,
			code: initialized.error.code,
			message: initialized.error.message,
			details: asSerializableDetails(initialized.error.details),
		});
	}

	return createRpcSuccessResponse({
		messageId: parsedRequest.data.messageId,
		data: {
			initialized: initialized.data.initialized,
			loadedExistingDatabase: initialized.data.loadedExistingDatabase,
			appliedMigrationIds: [...initialized.data.appliedMigrationIds],
			tableNames: [...initialized.data.tableNames],
		},
	});
}

function extractMessageId(request: unknown): string {
	if (typeof request !== "object" || request === null) {
		return FALLBACK_MESSAGE_ID;
	}

	const candidate = (request as { readonly messageId?: unknown }).messageId;
	const parsed = rpcMessageIdSchema.safeParse(candidate);
	return parsed.success ? parsed.data : FALLBACK_MESSAGE_ID;
}

function asSerializableDetails(details: unknown): string | null {
	if (details === undefined) {
		return null;
	}

	return JSON.stringify(details);
}
