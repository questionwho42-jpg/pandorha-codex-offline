import type { SocialRepository } from "$lib/entities/social";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { DialogueStateData } from "../model/dialogueSchema";
import type { DialogueRepository } from "./DialogueRepository";
import type { DialogueTree } from "./dialogueTypes";

export interface DialogueAdvanceResult {
	state: DialogueStateData;
	nextNodeId: string;
	log: string;
	effectsApplied?:
		| {
				consumeEe?: number;
				unlockClues?: string[];
				triggerEvent?: string;
				factionReputation?: {
					factionId: string;
					reputationChange: number;
				}[];
		  }
		| undefined;
}

export class DialogueService {
	public constructor(
		private readonly repository: DialogueRepository,
		private readonly socialRepository?: SocialRepository,
	) {}

	public async getOrCreateState(
		characterId: string,
		npcId: string,
		dialogueTreeId: string,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		if (!characterId) {
			return fail({
				code: "INVALID_CHARACTER_ID",
				message: "ID do personagem é obrigatório.",
			});
		}
		if (!npcId) {
			return fail({
				code: "INVALID_NPC_ID",
				message: "ID do NPC é obrigatório.",
			});
		}

		const findResult = await this.repository.findByCharacterAndNpc(
			characterId,
			npcId,
		);
		if (!findResult.success) {
			return fail(findResult.error);
		}

		if (findResult.data) {
			return ok(findResult.data);
		}

		// Cria um novo estado inicial
		const newState = {
			id: crypto.randomUUID(),
			characterId,
			npcId,
			currentConversationNodeId: "root",
			dialogueTreeId,
			historyJson: JSON.stringify(["root"]),
			unlockedCluesJson: JSON.stringify([]),
			updatedAt: new Date().toISOString(),
			patienceCurrent: 0,
			patienceMax: 0,
			persuasionCurrent: 0,
			persuasionMax: 0,
			attitude: "neutral" as const,
			fatigueCountersJson: JSON.stringify({}),
		};

		const saveResult = await this.repository.save(newState);
		if (!saveResult.success) {
			return fail(saveResult.error);
		}

		return ok(saveResult.data);
	}

	public async advance(
		characterId: string,
		npcId: string,
		tree: DialogueTree,
		optionId: string,
		rollValue?: number,
		characterStats?: { ee: number; social: number; mental: number },
		activeWorldClues: string[] = [],
	): Promise<Result<DialogueAdvanceResult, { code: string; message: string }>> {
		// 1. Carrega o estado atual
		const stateResult = await this.getOrCreateState(
			characterId,
			npcId,
			tree.id,
		);
		if (!stateResult.success) {
			return fail(stateResult.error);
		}
		const state = stateResult.data;

		// 2. Busca o nó atual na árvore
		const currentNodeId = state.currentConversationNodeId;
		const currentNode = tree.nodes[currentNodeId];
		if (!currentNode) {
			return fail({
				code: "CONVERSATION_NODE_NOT_FOUND",
				message: `Nó de conversa '${currentNodeId}' não encontrado na árvore '${tree.id}'.`,
			});
		}

		// 3. Procura a opção selecionada
		const option = currentNode.options.find((o) => o.id === optionId);
		if (!option) {
			return fail({
				code: "DIALOGUE_OPTION_NOT_FOUND",
				message: `Opção de diálogo '${optionId}' não encontrada no nó '${currentNodeId}'.`,
			});
		}

		// 4. Valida condições
		if (option.conditions) {
			// A. Esforço Extra (EE) mínimo
			if (option.conditions.requiredMinEe !== undefined) {
				const currentEe = characterStats?.ee ?? 0;
				if (currentEe < option.conditions.requiredMinEe) {
					return fail({
						code: "INSUFFICIENT_EFFORT",
						message: `Esforço Extra insuficiente. Necessário: ${option.conditions.requiredMinEe}, Atual: ${currentEe}.`,
					});
				}
			}

			// B. Pistas necessárias no WorldState
			if (option.conditions.requiredClues) {
				const currentClues = JSON.parse(state.unlockedCluesJson) as string[];
				for (const clue of option.conditions.requiredClues) {
					if (
						!activeWorldClues.includes(clue) &&
						!currentClues.includes(clue)
					) {
						return fail({
							code: "MISSING_REQUIRED_CLUE",
							message:
								"Você não possui as pistas necessárias para escolher esta opção.",
						});
					}
				}
			}
		}

		// 5. Trata o Desafio Social (se houver)
		let nextNodeId = option.nextNodeId;
		let logMessage = `O jogador escolheu: "${option.playerText}".`;

		if (option.socialChallenge) {
			if (rollValue === undefined || rollValue < 1 || rollValue > 20) {
				return fail({
					code: "INVALID_ROLL_VALUE",
					message: "Rolagem de dados d20 inválida para o desafio social.",
				});
			}

			const matrixValue = characterStats
				? characterStats[option.socialChallenge.matrix]
				: 0;
			const totalRoll = rollValue + matrixValue;
			const targetCd = option.socialChallenge.difficultyClass;

			if (totalRoll >= targetCd) {
				nextNodeId = option.socialChallenge.onSuccessNodeId;
				logMessage = `Sucesso no teste de ${option.socialChallenge.matrix.toUpperCase()} (d20: ${rollValue} + modificador: ${matrixValue} = ${totalRoll} vs CD: ${targetCd}).`;
			} else {
				nextNodeId = option.socialChallenge.onFailureNodeId;
				logMessage = `Falha no teste de ${option.socialChallenge.matrix.toUpperCase()} (d20: ${rollValue} + modificador: ${matrixValue} = ${totalRoll} vs CD: ${targetCd}).`;
			}
		}

		// 6. Aplica efeitos da opção
		const effectsApplied: DialogueAdvanceResult["effectsApplied"] = {};

		if (option.effects) {
			if (option.effects.consumeEe) {
				effectsApplied.consumeEe = option.effects.consumeEe;
			}
			if (option.effects.unlockClues && option.effects.unlockClues.length > 0) {
				effectsApplied.unlockClues = option.effects.unlockClues;
			}
			if (option.effects.triggerEvent) {
				effectsApplied.triggerEvent = option.effects.triggerEvent;
			}
			if (
				option.effects.factionReputation &&
				option.effects.factionReputation.length > 0
			) {
				effectsApplied.factionReputation = option.effects.factionReputation;
				if (this.socialRepository) {
					for (const repEffect of option.effects.factionReputation) {
						const repResult = await this.socialRepository.findReputation(
							characterId,
							repEffect.factionId,
						);
						if (repResult.success) {
							const currentRep = repResult.data;
							const updatedRep = {
								...currentRep,
								value: currentRep.value + repEffect.reputationChange,
								updatedAt: new Date().toISOString(),
							};
							const saveRepRes =
								await this.socialRepository.saveReputation(updatedRep);
							if (!saveRepRes.success) {
								return fail({
									code: "SOCIAL_REPOSITORY_WRITE_FAILED",
									message: saveRepRes.error.message,
								});
							}
						} else if (repResult.error.code === "REPUTATION_NOT_FOUND") {
							const newRep = {
								id: crypto.randomUUID(),
								characterId,
								factionId: repEffect.factionId,
								value: repEffect.reputationChange,
								updatedAt: new Date().toISOString(),
							};
							const saveRepRes =
								await this.socialRepository.saveReputation(newRep);
							if (!saveRepRes.success) {
								return fail({
									code: "SOCIAL_REPOSITORY_WRITE_FAILED",
									message: saveRepRes.error.message,
								});
							}
						} else {
							return fail({
								code: "SOCIAL_REPOSITORY_READ_FAILED",
								message: repResult.error.message,
							});
						}
					}
				}
			}
		}

		// 7. Atualiza o estado
		const historyList = JSON.parse(state.historyJson) as string[];
		historyList.push(nextNodeId);

		const unlockedCluesList = JSON.parse(state.unlockedCluesJson) as string[];
		if (effectsApplied.unlockClues) {
			for (const clue of effectsApplied.unlockClues) {
				if (!unlockedCluesList.includes(clue)) {
					unlockedCluesList.push(clue);
				}
			}
		}

		const updatedState = {
			...state,
			currentConversationNodeId: nextNodeId,
			historyJson: JSON.stringify(historyList),
			unlockedCluesJson: JSON.stringify(unlockedCluesList),
			updatedAt: new Date().toISOString(),
		};

		const saveResult = await this.repository.save(updatedState);
		if (!saveResult.success) {
			return fail(saveResult.error);
		}

		return ok({
			state: saveResult.data,
			nextNodeId,
			log: logMessage,
			effectsApplied:
				Object.keys(effectsApplied).length > 0 ? effectsApplied : undefined,
		});
	}
}
