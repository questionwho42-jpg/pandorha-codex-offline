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
			// biome-ignore lint/suspicious/noExplicitAny: access private storage dynamically
			const storage = (input.bootstrapService as any).storage;
			if (
				command.payload.activeSaveFile &&
				storage &&
				typeof storage.fileName === "string"
			) {
				storage.fileName = command.payload.activeSaveFile;
			}
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

		case "LIST_SAVE_SLOTS": {
			try {
				if (!globalThis.navigator?.storage?.getDirectory) {
					return createRpcFailureResponse({
						messageId: command.messageId,
						code: "OPFS_UNAVAILABLE",
						message: "OPFS não está disponível no contexto do navegador.",
					});
				}
				const root = await globalThis.navigator.storage.getDirectory();
				const slots = [];
				for await (const name of root.keys()) {
					if (name.endsWith(".sqlite3")) {
						const fileHandle = await root.getFileHandle(name);
						const file = await fileHandle.getFile();
						slots.push({
							fileName: name,
							sizeBytes: file.size,
							lastModified: new Date(file.lastModified).toISOString(),
						});
					}
				}
				return createRpcSuccessResponse({
					messageId: command.messageId,
					data: slots as unknown as JsonValue,
				});
			} catch (err: unknown) {
				const errMsg = err instanceof Error ? err.message : String(err);
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: "LIST_SAVE_SLOTS_FAILED",
					message: `Falha ao listar slots de save: ${errMsg}`,
				});
			}
		}

		case "CREATE_SAVE_SLOT": {
			try {
				// biome-ignore lint/suspicious/noExplicitAny: access private storage dynamically
				const storage = (input.bootstrapService as any).storage;
				if (!storage || typeof storage.fileName !== "string") {
					return createRpcFailureResponse({
						messageId: command.messageId,
						code: "STORAGE_UNAVAILABLE",
						message: "Storage não inicializado ou inválido.",
					});
				}
				const previousFileName = storage.fileName;
				storage.fileName = command.payload.fileName;
				const result = await input.bootstrapService.initializeDatabase({
					requestedAt: new Date().toISOString(),
				});
				storage.fileName = previousFileName;

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
					data: { created: true },
				});
			} catch (err: unknown) {
				const errMsg = err instanceof Error ? err.message : String(err);
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: "CREATE_SAVE_SLOT_FAILED",
					message: `Falha ao criar slot de save: ${errMsg}`,
				});
			}
		}

		case "CLONE_SAVE_SLOT": {
			try {
				if (!globalThis.navigator?.storage?.getDirectory) {
					return createRpcFailureResponse({
						messageId: command.messageId,
						code: "OPFS_UNAVAILABLE",
						message: "OPFS não está disponível.",
					});
				}
				const root = await globalThis.navigator.storage.getDirectory();
				const sourceHandle = await root.getFileHandle(
					command.payload.sourceFileName,
				);
				const sourceFile = await sourceHandle.getFile();
				const bytes = new Uint8Array(await sourceFile.arrayBuffer());

				const targetHandle = await root.getFileHandle(
					command.payload.targetFileName,
					{ create: true },
				);
				const writable = await targetHandle.createWritable();
				await writable.write(bytes);
				await writable.close();

				return createRpcSuccessResponse({
					messageId: command.messageId,
					data: { cloned: true },
				});
			} catch (err: unknown) {
				const errMsg = err instanceof Error ? err.message : String(err);
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: "CLONE_SAVE_SLOT_FAILED",
					message: `Falha ao clonar slot de save: ${errMsg}`,
				});
			}
		}

		case "DELETE_SAVE_SLOT": {
			try {
				if (!globalThis.navigator?.storage?.getDirectory) {
					return createRpcFailureResponse({
						messageId: command.messageId,
						code: "OPFS_UNAVAILABLE",
						message: "OPFS não está disponível.",
					});
				}
				const root = await globalThis.navigator.storage.getDirectory();
				await root.removeEntry(command.payload.fileName);
				return createRpcSuccessResponse({
					messageId: command.messageId,
					data: { deleted: true },
				});
			} catch (err: unknown) {
				const errMsg = err instanceof Error ? err.message : String(err);
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: "DELETE_SAVE_SLOT_FAILED",
					message: `Falha ao deletar slot de save: ${errMsg}`,
				});
			}
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
				data: result.data as unknown as JsonValue,
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

		case "SAVE_DIALOGUE_STATE": {
			const result = await input.bootstrapService.saveDialogueState(
				command.payload.dialogueState,
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

		case "FIND_DIALOGUE_STATE": {
			const result = await input.bootstrapService.findDialogueState(
				command.payload.characterId,
				command.payload.npcId,
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

		case "DELETE_DIALOGUE_STATE": {
			const result = await input.bootstrapService.deleteDialogueState(
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

		case "SAVE_QUEST": {
			const result = await input.bootstrapService.saveQuest(
				command.payload.quest,
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

		case "FIND_QUEST": {
			const result = await input.bootstrapService.findQuest(command.payload.id);
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

		case "LIST_QUESTS": {
			const result = await input.bootstrapService.listQuests();
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

		case "DELETE_QUEST": {
			const result = await input.bootstrapService.deleteQuest(
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

		case "SAVE_COHESION": {
			const result = await input.bootstrapService.saveCohesion(
				command.payload.cohesion,
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

		case "FIND_COHESION": {
			const result = await input.bootstrapService.findCohesion(
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "SAVE_SIGNATURE": {
			const result = await input.bootstrapService.saveSignature(
				command.payload.signature,
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

		case "FIND_SIGNATURE": {
			const result = await input.bootstrapService.findSignature(
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
				data: result.data as unknown as JsonValue,
			});
		}

		case "LIST_SIGNATURES": {
			const result = await input.bootstrapService.listSignatures();
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

		case "DELETE_SIGNATURE": {
			const result = await input.bootstrapService.deleteSignature(
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

		case "SAVE_TRAP": {
			const result = await input.bootstrapService.saveTrap(
				command.payload.trap,
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

		case "FIND_TRAP": {
			const result = await input.bootstrapService.findTrap(command.payload.id);
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

		case "LIST_TRAPS": {
			const result = await input.bootstrapService.listTraps(
				command.payload.tileId,
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

		case "DELETE_TRAP": {
			const result = await input.bootstrapService.deleteTrap(
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

		case "SAVE_COMPANION": {
			const result = await input.bootstrapService.saveCompanion(
				command.payload.companion,
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

		case "FIND_COMPANION": {
			const result = await input.bootstrapService.findCompanion(
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

		case "LIST_COMPANIONS": {
			const result = await input.bootstrapService.listCompanionsByCharacter(
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

		case "SAVE_INVESTIGATION": {
			const result = await input.bootstrapService.saveInvestigation(
				command.payload.investigation,
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

		case "FIND_INVESTIGATION": {
			const result = await input.bootstrapService.findInvestigation(
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

		case "LIST_INVESTIGATIONS_BY_TARGET": {
			const result = await input.bootstrapService.listInvestigationsByTarget(
				command.payload.targetId,
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

		case "LIST_ACTIVE_INVESTIGATIONS": {
			const result = await input.bootstrapService.listActiveInvestigations();
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

		case "SAVE_REGIONAL_DOMAIN": {
			const result = await input.bootstrapService.saveRegionalDomain(
				command.payload.regionalDomain,
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

		case "FIND_REGIONAL_DOMAIN": {
			const result = await input.bootstrapService.findRegionalDomain(
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

		case "LIST_REGIONAL_DOMAINS": {
			const result = await input.bootstrapService.listRegionalDomains();
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

		case "SAVE_CAMP_SESSION": {
			const result = await input.bootstrapService.saveCampSession(
				command.payload.campSession,
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

		case "FIND_CAMP_SESSION": {
			const result = await input.bootstrapService.findCampSession(
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

		case "LIST_CAMP_SESSIONS": {
			const result = await input.bootstrapService.listCampSessions();
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

		case "DELETE_CAMP_SESSION": {
			const result = await input.bootstrapService.deleteCampSession(
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

		case "SAVE_MERCENARY_COMPANY": {
			const result = await input.bootstrapService.saveMercenaryCompany(
				command.payload.company,
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

		case "FIND_MERCENARY_COMPANY": {
			const result = await input.bootstrapService.findMercenaryCompany(
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

		case "LIST_MERCENARY_COMPANIES": {
			const result = await input.bootstrapService.listMercenaryCompanies();
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

		case "SAVE_MERCENARY_SQUAD": {
			const result = await input.bootstrapService.saveMercenarySquad(
				command.payload.squad,
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

		case "FIND_MERCENARY_SQUAD": {
			const result = await input.bootstrapService.findMercenarySquad(
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

		case "LIST_MERCENARY_SQUADS_BY_COMPANY": {
			const result = await input.bootstrapService.listMercenarySquadsByCompany(
				command.payload.companyId,
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

		case "SAVE_ESPIONAGE_CELL": {
			const result = await input.bootstrapService.saveEspionageCell(
				command.payload.cell,
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

		case "FIND_ESPIONAGE_CELL": {
			const result = await input.bootstrapService.findEspionageCell(
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

		case "LIST_ESPIONAGE_CELLS": {
			const result = await input.bootstrapService.listEspionageCells(
				command.payload.campaignId,
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

		case "DELETE_ESPIONAGE_CELL": {
			const result = await input.bootstrapService.deleteEspionageCell(
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

		case "DISMANTLE_CRAFTED_ITEM": {
			const result = await input.bootstrapService.dismantleCraftedItem(
				command.payload.characterId,
				command.payload.itemId,
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

		case "SCRAP_EQUIPMENT": {
			const result = input.bootstrapService.scrapEquipment(
				command.payload.equipmentId,
			);
			if (!result.success) {
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: result.error.code,
					message: result.error.message,
				});
			}
			return createRpcSuccessResponse({
				messageId: command.messageId,
				data: result.data as unknown as JsonValue,
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
