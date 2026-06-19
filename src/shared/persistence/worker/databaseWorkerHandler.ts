import { OFFICIAL_ANCESTRIES } from "$lib/entities/ancestry";
import { OFFICIAL_BACKGROUNDS } from "$lib/entities/background";
import type { LevelUpInput } from "$lib/entities/character/model/characterSchema";
import { OFFICIAL_CHARACTER_CLASSES } from "$lib/entities/character-class";
import { OFFICIAL_SPELLS } from "$lib/entities/spell";
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
		case "GET_ANCESTRY_CATALOG": {
			const result = await input.bootstrapService.listAncestries();
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

		case "GET_BACKGROUND_CATALOG": {
			const result = await input.bootstrapService.listBackgrounds();
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

		case "GET_CHARACTER_CLASS_CATALOG": {
			const result = await input.bootstrapService.listCharacterClasses();
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

		case "GET_SPELL_CATALOG": {
			const result = await input.bootstrapService.listSpells();
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

		case "APPLY_LEVEL_UP": {
			const result = await input.bootstrapService.applyLevelUp(
				command.payload.levelUpInput as LevelUpInput,
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

		case "SAVE_COMBAT_ENCOUNTER": {
			const result = await input.bootstrapService.saveCombatEncounter(
				command.payload.combatEncounter,
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

		case "FIND_COMBAT_ENCOUNTER": {
			const result = await input.bootstrapService.findCombatEncounter(
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

		case "SAVE_COMBAT_MONSTER": {
			const result = await input.bootstrapService.saveCombatMonster(
				command.payload.combatMonster,
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

		case "FIND_COMBAT_MONSTERS_BY_ENCOUNTER": {
			const result = await input.bootstrapService.findCombatMonstersByEncounter(
				command.payload.combatEncounterId,
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

		case "SAVE_ACTIVE_SESSION": {
			const result = await input.bootstrapService.saveActiveSession(
				command.payload.activeSession,
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

		case "FIND_ACTIVE_SESSION": {
			const result = await input.bootstrapService.findActiveSession(
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

		case "CAST_SPELL": {
			const result = await input.bootstrapService.castSpell({
				casterId: command.payload.casterId,
				targetId: command.payload.targetId,
				spellId: command.payload.spellId,
				upcastLevel: command.payload.upcastLevel,
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
				data: result.data,
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

		case "SAVE_SOCIAL_LEDGER": {
			const result = await input.bootstrapService.saveSocialLedger(
				command.payload.ledger,
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

		case "FIND_SOCIAL_LEDGER": {
			const result = await input.bootstrapService.findSocialLedger(
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

		case "SAVE_FACTION_PATRONAGE": {
			const result = await input.bootstrapService.savePatronage(
				command.payload.patronage,
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

		case "FIND_FACTION_PATRONAGE": {
			const result = await input.bootstrapService.findPatronage(
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

		case "FIND_FACTION_PATRONAGE_BY_FACTION": {
			const result = await input.bootstrapService.findPatronageByFaction(
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

		case "LIST_FACTION_PATRONAGES": {
			const result = await input.bootstrapService.listPatronages();
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

		case "SAVE_LORE_ENCOUNTER": {
			const result = await input.bootstrapService.saveLoreEncounter(
				command.payload.encounter,
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

		case "FIND_LORE_ENCOUNTER": {
			const result = await input.bootstrapService.findLoreEncounter(
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

		case "LIST_LORE_ENCOUNTERS_BY_TILE": {
			const result = await input.bootstrapService.listLoreEncountersByTile(
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

		case "LIST_ALL_LORE_ENCOUNTERS": {
			const result = await input.bootstrapService.listAllLoreEncounters();
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

		case "SAVE_CAMPAIGN_RUMOR": {
			const result = await input.bootstrapService.saveCampaignRumor(
				command.payload.rumor,
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

		case "FIND_CAMPAIGN_RUMOR": {
			const result = await input.bootstrapService.findCampaignRumor(
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

		case "LIST_CAMPAIGN_RUMORS_BY_TILE": {
			const result = await input.bootstrapService.listCampaignRumorsByTile(
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

		case "LIST_ALL_CAMPAIGN_RUMORS": {
			const result = await input.bootstrapService.listAllCampaignRumors();
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

		case "SAVE_DUNGEON_DELVE": {
			const result = await input.bootstrapService.saveDungeonDelve(
				command.payload.delve,
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

		case "FIND_DUNGEON_DELVE": {
			const result = await input.bootstrapService.findDungeonDelve(
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

		case "LIST_DUNGEON_DELVES": {
			const result = await input.bootstrapService.listDungeonDelves(
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

		case "SAVE_DUNGEON_ROOM": {
			const result = await input.bootstrapService.saveDungeonRoom(
				command.payload.room,
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

		case "FIND_DUNGEON_ROOMS": {
			const result = await input.bootstrapService.findDungeonRooms(
				command.payload.delveId,
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

		case "FIND_DUNGEON_ROOM_BY_COORDS": {
			const result = await input.bootstrapService.findDungeonRoomByCoords(
				command.payload.delveId,
				command.payload.coordinateX,
				command.payload.coordinateY,
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

		case "UPDATE_DUNGEON_ROOM_STATUS": {
			const result = await input.bootstrapService.updateDungeonRoomStatus(
				command.payload.id,
				command.payload.status,
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

		case "UPDATE_DUNGEON_DELVE_STATUS": {
			const result = await input.bootstrapService.updateDungeonDelveStatus(
				command.payload.id,
				command.payload.status,
				command.payload.currentLevel,
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

		case "GET_CAMPAIGN_TIMELINE": {
			const result = await input.bootstrapService.getCampaignTimeline(
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

		case "RECORD_CAMPAIGN_EVENT": {
			const result = await input.bootstrapService.recordCampaignEvent(
				command.payload.campaignId,
				command.payload.eventType,
				command.payload.description,
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

		case "SAVE_QUEST_OBJECTIVE": {
			const result = await input.bootstrapService.saveQuestObjective(
				command.payload.objective,
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

		case "FIND_QUEST_OBJECTIVE": {
			const result = await input.bootstrapService.findQuestObjective(
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

		case "LIST_QUEST_OBJECTIVES_BY_QUEST": {
			const result = await input.bootstrapService.listQuestObjectivesByQuest(
				command.payload.questId,
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

		case "DELETE_QUEST_OBJECTIVE": {
			const result = await input.bootstrapService.deleteQuestObjective(
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

		case "MUTATE_WORLD_STATE": {
			const result = await input.bootstrapService.mutateWorldState(
				command.payload.worldStateMutations,
				command.payload.factionRenownMutations,
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

		case "SET_WORLD_STATE_FLAG": {
			const result = await input.bootstrapService.setWorldStateFlag({
				key: command.payload.key,
				valueJson: command.payload.valueJson,
				updatedAt: command.payload.updatedAt,
			});
			if (!result.success) {
				return createRpcFailureResponse({
					messageId: command.messageId,
					code: result.error.code,
					message: result.error.message,
				});
			}
			return createRpcSuccessResponse({
				messageId: command.messageId,
				data: result.data,
			});
		}

		case "GET_WORLD_STATE_FLAG": {
			const result = await input.bootstrapService.getWorldStateFlag(
				command.payload.key,
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
				data: result.data,
			});
		}

		case "LIST_WORLD_STATE_FLAGS": {
			const result = await input.bootstrapService.listWorldStateFlags(
				command.payload.prefix,
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
				data: result.data,
			});
		}

		case "TICK_CLOCK_MANUAL": {
			const result = await input.bootstrapService.tickClockManual(
				command.payload.clockId,
				command.payload.delta,
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

		case "FORCE_SPAWN_ACTOR": {
			const result = await input.bootstrapService.forceSpawnActor(
				command.payload,
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

		case "GET_CAMPAIGN_RECESS": {
			const result = await input.bootstrapService.getCampaignRecess(
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
				data: result.data,
			});
		}

		case "ADD_RECESS_DAYS": {
			const result = await input.bootstrapService.addRecessDays(
				command.payload.campaignId,
				command.payload.days,
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

		case "RESOLVE_DOWNTIME_WEEK": {
			const result = await input.bootstrapService.resolveDowntimeWeek(
				command.payload,
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

		case "TRIGGER_SIEGE": {
			const result = await input.bootstrapService.triggerSiege(command.payload);
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

		case "RESOLVE_SIEGE_ROUND": {
			const result = await input.bootstrapService.resolveSiegeRound(
				command.payload,
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

		case "FIND_ACTIVE_SIEGE": {
			const result = await input.bootstrapService.findActiveSiege(
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
				data: result.data,
			});
		}

		case "LIST_SIEGE_HISTORY": {
			const result = await input.bootstrapService.listSiegeHistory(
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
				data: result.data as any,
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
