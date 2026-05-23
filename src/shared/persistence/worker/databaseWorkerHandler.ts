import {
	createRpcFailureResponse,
	createRpcSuccessResponse,
	type JsonValue,
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
				} as unknown as JsonValue,
			});
		}

		case "SAVE_CHARACTER": {
			const result = await input.bootstrapService.saveCharacter(
				command.payload.character,
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
				data: result.data,
			});
		}

		case "FIND_CHARACTER": {
			const result = await input.bootstrapService.findCharacter(
				command.payload.id,
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
				data: result.data,
			});
		}

		case "SAVE_STATUS_EFFECT": {
			const result = await input.bootstrapService.saveStatusEffect(
				command.payload.effect,
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
				data: result.data,
			});
		}

		case "FIND_STATUS_EFFECTS": {
			const result = await input.bootstrapService.findStatusEffects(
				command.payload.characterId,
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
				data: result.data,
			});
		}

		case "DELETE_STATUS_EFFECT": {
			const result = await input.bootstrapService.deleteStatusEffect(
				command.payload.id,
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
			});
		}

		case "SAVE_BASTION": {
			const result = await input.bootstrapService.saveBastion(
				command.payload.bastion,
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
				data: result.data,
			});
		}

		case "FIND_BASTION": {
			const result = await input.bootstrapService.findBastion(
				command.payload.id,
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
				data: result.data,
			});
		}

		case "SAVE_BASTION_MODULE": {
			const result = await input.bootstrapService.saveBastionModule(
				command.payload.module,
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
				data: result.data,
			});
		}

		case "FIND_BASTION_MODULES": {
			const result = await input.bootstrapService.findBastionModules(
				command.payload.bastionId,
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
				data: result.data as any,
			});
		}

		case "DELETE_BASTION_MODULE": {
			const result = await input.bootstrapService.deleteBastionModule(
				command.payload.id,
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
			});
		}

		case "SAVE_FACTION": {
			const result = await input.bootstrapService.saveFaction(
				command.payload.faction,
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
				data: result.data,
			});
		}

		case "FIND_FACTION": {
			const result = await input.bootstrapService.findFaction(
				command.payload.id,
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
				data: result.data,
			});
		}

		case "LIST_FACTIONS": {
			const result = await input.bootstrapService.listFactions();
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "SAVE_REPUTATION": {
			const result = await input.bootstrapService.saveReputation(
				command.payload.reputation,
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
				data: result.data,
			});
		}

		case "FIND_REPUTATION": {
			const result = await input.bootstrapService.findReputation(
				command.payload.characterId,
				command.payload.factionId,
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
				data: result.data,
			});
		}

		case "LIST_REPUTATIONS": {
			const result = await input.bootstrapService.listReputationsByCharacter(
				command.payload.characterId,
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "SAVE_BLOOD_DEBT": {
			const result = await input.bootstrapService.saveBloodDebt(
				command.payload.debt,
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
				data: result.data,
			});
		}

		case "LIST_BLOOD_DEBTS": {
			const result = await input.bootstrapService.listBloodDebtsByCharacter(
				command.payload.characterId,
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "SAVE_CLOCK": {
			const result = await input.bootstrapService.saveClock(
				command.payload.clock,
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "FIND_CLOCK": {
			const result = await input.bootstrapService.findClock(command.payload.id);
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "LIST_CLOCKS": {
			const result = await input.bootstrapService.listClocks();
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "DELETE_CLOCK": {
			const result = await input.bootstrapService.deleteClock(
				command.payload.id,
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
