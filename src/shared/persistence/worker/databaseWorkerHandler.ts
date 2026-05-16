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

	const command = parsedRequest.data;
	switch (command.type) {
		case "INIT_DATABASE": {
			const result = await input.bootstrapService.initializeDatabase({
				requestedAt: command.payload.requestedAt,
			});
			if (!result.success) {
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: result.error.code,
					message: result.error.message,
					details: asSerializableDetails(result.error.details),
				});
			}
			return createRpcSuccessResponse({
				messageId: command.messageId,
				data: {
					initialized: result.data.initialized,
					loadedExistingDatabase: result.data.loadedExistingDatabase,
					appliedMigrationIds: [...result.data.appliedMigrationIds],
					tableNames: [...result.data.tableNames],
				},
			});
		}

		case "SAVE_GAME_SNAPSHOT": {
			const result = await input.bootstrapService.saveGameSnapshot(
				command.payload.snapshot,
			);
			if (!result.success) {
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: result.error.code,
					message: result.error.message,
					details: asSerializableDetails(result.error.details),
				});
			}
			return createRpcSuccessResponse({
				messageId: command.messageId,
				data: {
					saved: true as const,
				},
			});
		}

		case "LOAD_GAME_SNAPSHOT": {
			const result = await input.bootstrapService.loadGameSnapshot();
			if (!result.success) {
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: result.error.code,
					message: result.error.message,
					details: asSerializableDetails(result.error.details),
				});
			}
			return createRpcSuccessResponse({
				messageId: command.messageId,
				data: {
					snapshot: result.data,
				},
			});
		}

		default: {
			const _exhaustiveCheck: never = command;
			return createRpcFailureResponse({
				messageId: (command as { messageId: string }).messageId,
				code: "UNKNOWN_COMMAND",
				message: "Tipo de comando RPC nao reconhecido.",
			});
		}
	}
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
