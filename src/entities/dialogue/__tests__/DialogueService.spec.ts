import { beforeEach, describe, expect, it } from "vitest";
import { fail, ok } from "$lib/shared/lib/result";
import type { DialogueRepository } from "../domain/DialogueRepository";
import { DialogueService } from "../domain/DialogueService";
import type { DialogueTree } from "../domain/dialogueTypes";
import { InMemoryDialogueRepository } from "../infrastructure/InMemoryDialogueRepository";

describe("DialogueService", () => {
	let repository: InMemoryDialogueRepository;
	let service: DialogueService;

	const testCharacterId = "00000000-0000-0000-0000-000000000001";
	const testNpcId = "npc-merchant";
	const testTreeId = "tree-merchant-bargain";

	// Árvore de diálogo de testes
	const mockTree: DialogueTree = {
		id: testTreeId,
		npcId: testNpcId,
		rootNodeId: "root",
		nodes: {
			root: {
				id: "root",
				npcText: "Saudações, viajadante! O que deseja comprar?",
				options: [
					{
						id: "opt-buy-normal",
						playerText: "Gostaria de ver suas mercadorias comuns.",
						nextNodeId: "node-normal-store",
					},
					{
						id: "opt-bargain",
						playerText:
							"Acho que podemos negociar um desconto especial... (Barganha)",
						nextNodeId: "node-bargain-success",
						socialChallenge: {
							matrix: "social",
							difficultyClass: 15,
							onSuccessNodeId: "node-bargain-success",
							onFailureNodeId: "node-bargain-failure",
						},
					},
					{
						id: "opt-buy-secret",
						playerText:
							"Ouvi dizer que você vende itens especiais sob o pano... (Requer pista)",
						nextNodeId: "node-secret-store",
						conditions: {
							requiredClues: ["clue-secret-inventory"],
						},
					},
					{
						id: "opt-magic-meditate",
						playerText:
							"Gostaria de canalizar meu esforço para examinar seus amuletos mágicos. (Requer 3 EE)",
						nextNodeId: "node-magic-details",
						conditions: {
							requiredMinEe: 3,
						},
						effects: {
							consumeEe: 3,
							unlockClues: ["clue-magic-amulet"],
							triggerEvent: "event-examine-amulets",
						},
					},
				],
			},
			"node-normal-store": {
				id: "node-normal-store",
				npcText: "Aqui estão minhas espadas de ferro e rações comuns.",
				options: [],
			},
			"node-bargain-success": {
				id: "node-bargain-success",
				npcText: "Tudo bem, você me convenceu. Dou 10% de desconto.",
				options: [],
			},
			"node-bargain-failure": {
				id: "node-bargain-failure",
				npcText: "Negócios são negócios! O preço é o mesmo para todos.",
				options: [],
			},
			"node-secret-store": {
				id: "node-secret-store",
				npcText:
					"Ah, vejo que você sabe das coisas... Aqui estão as relíquias do Bastião.",
				options: [],
			},
			"node-magic-details": {
				id: "node-magic-details",
				npcText:
					"Sua mente se conecta às energias do amuleto e você percebe runas de proteção antiga.",
				options: [],
			},
		},
	};

	beforeEach(() => {
		repository = new InMemoryDialogueRepository();
		service = new DialogueService(repository);
	});

	describe("InMemoryDialogueRepository", () => {
		it("deve carregar estado por id com sucesso e lançar erro no findById se não existir", async () => {
			const state = {
				id: crypto.randomUUID(),
				characterId: testCharacterId,
				npcId: testNpcId,
				currentConversationNodeId: "root",
				dialogueTreeId: testTreeId,
				historyJson: JSON.stringify(["root"]),
				unlockedCluesJson: JSON.stringify([]),
				updatedAt: new Date().toISOString(),
				patienceCurrent: 0,
				patienceMax: 0,
				persuasionCurrent: 0,
				persuasionMax: 0,
				attitude: "neutral" as const,
				fatigueCountersJson: "{}",
			};
			await repository.save(state);
			const findOk = await repository.findById(state.id);
			expect(findOk.success).toBe(true);
			if (findOk.success) {
				expect(findOk.data.id).toBe(state.id);
			}

			const result = await repository.findById("non-existent-id");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("DIALOGUE_STATE_NOT_FOUND");
			}
		});

		it("deve permitir deletar e lançar erro se deletar id inexistente", async () => {
			const state = {
				id: crypto.randomUUID(),
				characterId: testCharacterId,
				npcId: testNpcId,
				currentConversationNodeId: "root",
				dialogueTreeId: testTreeId,
				historyJson: JSON.stringify(["root"]),
				unlockedCluesJson: JSON.stringify([]),
				updatedAt: new Date().toISOString(),
				patienceCurrent: 0,
				patienceMax: 0,
				persuasionCurrent: 0,
				persuasionMax: 0,
				attitude: "neutral" as const,
				fatigueCountersJson: "{}",
			};
			await repository.save(state);
			const delOk = await repository.delete(state.id);
			expect(delOk.success).toBe(true);

			const delFail = await repository.delete(state.id);
			expect(delFail.success).toBe(false);
			if (!delFail.success) {
				expect(delFail.error.code).toBe("DIALOGUE_STATE_NOT_FOUND");
			}
		});
	});

	describe("getOrCreateState", () => {
		it("deve criar um novo estado inicial se não existir", async () => {
			const result = await service.getOrCreateState(
				testCharacterId,
				testNpcId,
				testTreeId,
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.characterId).toBe(testCharacterId);
				expect(result.data.npcId).toBe(testNpcId);
				expect(result.data.currentConversationNodeId).toBe("root");
				expect(JSON.parse(result.data.historyJson)).toEqual(["root"]);
				expect(JSON.parse(result.data.unlockedCluesJson)).toEqual([]);
			}
		});

		it("deve recuperar um estado existente", async () => {
			await service.getOrCreateState(testCharacterId, testNpcId, testTreeId);

			const findRes = await repository.findByCharacterAndNpc(
				testCharacterId,
				testNpcId,
			);
			expect(findRes.success).toBe(true);
			if (findRes.success && findRes.data) {
				findRes.data.currentConversationNodeId = "node-normal-store";
				await repository.save(findRes.data);
			}

			const result = await service.getOrCreateState(
				testCharacterId,
				testNpcId,
				testTreeId,
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.currentConversationNodeId).toBe("node-normal-store");
			}
		});

		it("deve falhar se os parâmetros forem vazios", async () => {
			const resChar = await service.getOrCreateState("", testNpcId, testTreeId);
			expect(resChar.success).toBe(false);
			if (!resChar.success) {
				expect(resChar.error.code).toBe("INVALID_CHARACTER_ID");
			}

			const resNpc = await service.getOrCreateState(
				testCharacterId,
				"",
				testTreeId,
			);
			expect(resNpc.success).toBe(false);
			if (!resNpc.success) {
				expect(resNpc.error.code).toBe("INVALID_NPC_ID");
			}
		});

		it("deve propagar falha de busca do repositório ao buscar estado", async () => {
			const failingRepo: DialogueRepository = {
				save: async () =>
					fail({ code: "DB_ERROR", message: "Erro de escrita." }),
				findById: async () =>
					fail({ code: "DB_ERROR", message: "Erro de busca." }),
				findByCharacterAndNpc: async () =>
					fail({ code: "QUERY_ERROR", message: "Erro ao buscar no banco." }),
				delete: async () => fail({ code: "DB_ERROR", message: "Erro." }),
			};
			const failingService = new DialogueService(failingRepo);
			const result = await failingService.getOrCreateState(
				testCharacterId,
				testNpcId,
				testTreeId,
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("QUERY_ERROR");
			}
		});

		it("deve propagar falha de gravação do repositório ao criar estado", async () => {
			const failingRepo: DialogueRepository = {
				save: async () =>
					fail({ code: "SAVE_ERROR", message: "Erro de banco simulado." }),
				findById: async () =>
					fail({ code: "DB_ERROR", message: "Erro de banco simulado." }),
				findByCharacterAndNpc: async () => ok(null),
				delete: async () => fail({ code: "DB_ERROR", message: "Erro." }),
			};
			const failingService = new DialogueService(failingRepo);
			const result = await failingService.getOrCreateState(
				testCharacterId,
				testNpcId,
				testTreeId,
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("SAVE_ERROR");
			}
		});
	});

	describe("advance", () => {
		it("deve avançar o diálogo simples com sucesso", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-buy-normal",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.nextNodeId).toBe("node-normal-store");
				expect(result.data.state.currentConversationNodeId).toBe(
					"node-normal-store",
				);
				expect(JSON.parse(result.data.state.historyJson)).toEqual([
					"root",
					"node-normal-store",
				]);
				expect(result.data.log).toContain("ver suas mercadorias comuns");
			}
		});

		it("deve propagar falha de criação/carregamento de estado no advance", async () => {
			const failingRepo: DialogueRepository = {
				save: async () =>
					fail({ code: "DB_ERROR", message: "Erro de escrita." }),
				findById: async () =>
					fail({ code: "DB_ERROR", message: "Erro de busca." }),
				findByCharacterAndNpc: async () =>
					fail({ code: "QUERY_ERROR", message: "Erro ao buscar no banco." }),
				delete: async () => fail({ code: "DB_ERROR", message: "Erro." }),
			};
			const failingService = new DialogueService(failingRepo);
			const result = await failingService.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-buy-normal",
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("QUERY_ERROR");
			}
		});

		it("deve falhar se o nó de diálogo atual não existir na árvore", async () => {
			const stateResult = await service.getOrCreateState(
				testCharacterId,
				testNpcId,
				testTreeId,
			);
			expect(stateResult.success).toBe(true);
			if (stateResult.success) {
				stateResult.data.currentConversationNodeId = "invalid-node-id";
				await repository.save(stateResult.data);
			}

			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-buy-normal",
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("CONVERSATION_NODE_NOT_FOUND");
			}
		});

		it("deve falhar se a opção não existir no nó de diálogo atual", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-invalid-option",
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("DIALOGUE_OPTION_NOT_FOUND");
			}
		});

		it("deve aplicar condições de EE (Esforço Extra) com sucesso", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-magic-meditate",
				undefined,
				{ ee: 4, social: 1, mental: 2 },
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.nextNodeId).toBe("node-magic-details");
				expect(result.data.effectsApplied?.consumeEe).toBe(3);
				expect(result.data.effectsApplied?.unlockClues).toEqual([
					"clue-magic-amulet",
				]);
				expect(result.data.effectsApplied?.triggerEvent).toBe(
					"event-examine-amulets",
				);
				expect(JSON.parse(result.data.state.unlockedCluesJson)).toEqual([
					"clue-magic-amulet",
				]);
			}
		});

		it("deve bloquear avanço por EE insuficiente", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-magic-meditate",
				undefined,
				{ ee: 2, social: 1, mental: 2 },
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INSUFFICIENT_EFFORT");
			}
		});

		it("deve bloquear avanço por pista ausente", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-buy-secret",
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("MISSING_REQUIRED_CLUE");
			}
		});

		it("deve permitir avanço se o WorldState contiver a pista necessária", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-buy-secret",
				undefined,
				undefined,
				["clue-secret-inventory"],
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.nextNodeId).toBe("node-secret-store");
			}
		});

		it("deve permitir avanço se a pista estiver destravada no histórico do diálogo", async () => {
			const stateResult = await service.getOrCreateState(
				testCharacterId,
				testNpcId,
				testTreeId,
			);
			expect(stateResult.success).toBe(true);
			if (stateResult.success) {
				stateResult.data.unlockedCluesJson = JSON.stringify([
					"clue-secret-inventory",
				]);
				await repository.save(stateResult.data);
			}

			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-buy-secret",
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.nextNodeId).toBe("node-secret-store");
			}
		});

		it("deve processar Desafio Social com sucesso (rolagem alta)", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-bargain",
				13, // 13 + 3 (social) = 16 >= CD 15
				{ ee: 5, social: 3, mental: 1 },
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.nextNodeId).toBe("node-bargain-success");
				expect(result.data.log).toContain("Sucesso no teste de SOCIAL");
			}
		});

		it("deve processar Desafio Social com falha (rolagem baixa)", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-bargain",
				8, // 8 + 3 (social) = 11 < CD 15
				{ ee: 5, social: 3, mental: 1 },
			);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.nextNodeId).toBe("node-bargain-failure");
				expect(result.data.log).toContain("Falha no teste de SOCIAL");
			}
		});

		it("deve falhar se o teste social não fornecer valor de rolagem d20", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-bargain",
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INVALID_ROLL_VALUE");
			}
		});

		it("deve propagar falha de gravação do repositório ao avançar", async () => {
			const existingState = {
				id: crypto.randomUUID(),
				characterId: testCharacterId,
				npcId: testNpcId,
				currentConversationNodeId: "root",
				dialogueTreeId: testTreeId,
				historyJson: JSON.stringify(["root"]),
				unlockedCluesJson: JSON.stringify([]),
				updatedAt: new Date().toISOString(),
				patienceCurrent: 0,
				patienceMax: 0,
				persuasionCurrent: 0,
				persuasionMax: 0,
				attitude: "neutral" as const,
				fatigueCountersJson: "{}",
			};
			const failingRepo: DialogueRepository = {
				save: async () =>
					fail({ code: "SAVE_ERROR", message: "Erro de escrita simulado." }),
				findById: async () => ok(existingState),
				findByCharacterAndNpc: async () => ok(existingState),
				delete: async () => fail({ code: "SAVE_ERROR", message: "Erro." }),
			};
			const failingService = new DialogueService(failingRepo);
			const result = await failingService.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-buy-normal",
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("SAVE_ERROR");
			}
		});

		it("deve bloquear avanço se requiredMinEe estiver ativo mas characterStats for undefined", async () => {
			const result = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-magic-meditate",
				undefined,
				undefined, // characterStats undefined
			);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("INSUFFICIENT_EFFORT");
			}
		});

		it("deve processar Desafio Social sem characterStats (considerando atributo como 0)", async () => {
			// CD é 15. Se d20 for 15, com atributo 0 (já que characterStats é undefined), totaliza 15 >= CD 15 (Sucesso)
			const resSuccess = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-bargain",
				15,
				undefined, // characterStats undefined
			);
			expect(resSuccess.success).toBe(true);
			if (resSuccess.success) {
				expect(resSuccess.data.nextNodeId).toBe("node-bargain-success");
			}

			// Reinicia repositório e serviço para limpar o estado de progresso de root para node-bargain-success
			repository = new InMemoryDialogueRepository();
			service = new DialogueService(repository);

			// Se d20 for 14, totaliza 14 < CD 15 (Falha)
			const resFailure = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-bargain",
				14,
				undefined,
			);
			expect(resFailure.success).toBe(true);
			if (resFailure.success) {
				expect(resFailure.data.nextNodeId).toBe("node-bargain-failure");
			}
		});

		it("deve falhar se a rolagem for invalida (menor que 1 ou maior que 20)", async () => {
			const resLow = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-bargain",
				0, // invalido
				{ ee: 5, social: 3, mental: 1 },
			);
			expect(resLow.success).toBe(false);

			const resHigh = await service.advance(
				testCharacterId,
				testNpcId,
				mockTree,
				"opt-bargain",
				21, // invalido
				{ ee: 5, social: 3, mental: 1 },
			);
			expect(resHigh.success).toBe(false);
		});
	});
});
