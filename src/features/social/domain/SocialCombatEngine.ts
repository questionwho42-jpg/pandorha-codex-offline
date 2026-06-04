import type { DialogueRepository } from "$lib/entities/dialogue/domain/DialogueRepository";
import type { DialogueStateData } from "$lib/entities/dialogue/model/dialogueSchema";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	SocialAttitude,
	SocialConflictState,
	SocialTarget,
} from "../model/socialTypes";
import { calculatePatience } from "./DispositionCalculator";
import {
	type NegotiationRoundResult,
	NegotiationService,
} from "./NegotiationService";
import type { SocialCombatEvent } from "./SocialCombatService";

export interface NpcSocialProfile {
	patienceMax: number;
	persuasionMax: number;
	attitude: SocialAttitude;
	tier: number;
	mentalStat: number;
	resistanceStat: number;
	label: string;
}

export const NPC_SOCIAL_PROFILES: Record<string, NpcSocialProfile> = {
	"npc-merchant": {
		patienceMax: 0, // Será calculada dinamicamente
		persuasionMax: 6,
		attitude: "neutral",
		tier: 2,
		mentalStat: 10,
		resistanceStat: 10,
		label: "Silas o Mercador",
	},
	"npc-alchemist": {
		patienceMax: 0,
		persuasionMax: 8,
		attitude: "skeptical",
		tier: 3,
		mentalStat: 12,
		resistanceStat: 12,
		label: "Eldrin o Alquimista",
	},
	"npc-scribe": {
		patienceMax: 0,
		persuasionMax: 10,
		attitude: "neutral",
		tier: 4,
		mentalStat: 14,
		resistanceStat: 14,
		label: "Silas o Escriba",
	},
};

export const DEFAULT_NPC_PROFILE: NpcSocialProfile = {
	patienceMax: 0,
	persuasionMax: 6,
	attitude: "neutral",
	tier: 2,
	mentalStat: 10,
	resistanceStat: 10,
	label: "NPC Desconhecido",
};

export class SocialCombatEngine {
	private readonly negotiationService: NegotiationService;

	public constructor(
		private readonly dialogueRepository: DialogueRepository,
		negotiationServiceOrClock?: NegotiationService | { now(): string },
	) {
		if (negotiationServiceOrClock instanceof NegotiationService) {
			this.negotiationService = negotiationServiceOrClock;
		} else {
			this.negotiationService = new NegotiationService(
				negotiationServiceOrClock,
			);
		}
	}

	/**
	 * Retorna ou inicializa o perfil social do NPC e o calcula dinamicamente baseado na fórmula oficial
	 */
	public getInitialNpcStats(npcId: string): {
		patienceMax: number;
		persuasionMax: number;
		attitude: SocialAttitude;
		tier: number;
		mentalStat: number;
		resistanceStat: number;
		label: string;
	} {
		const profile = NPC_SOCIAL_PROFILES[npcId] || {
			...DEFAULT_NPC_PROFILE,
			label: npcId,
		};
		const tempTarget: SocialTarget = {
			id: npcId,
			label: profile.label,
			tier: profile.tier,
			mentalStat: profile.mentalStat,
			resistanceStat: profile.resistanceStat,
			attitude: profile.attitude,
			patience: { baseValue: 10, currentValue: 10 },
			persuasion: {
				totalSegments: profile.persuasionMax,
				completedSegments: 0,
			},
			fatigueCounters: {},
		};

		const patienceMax = calculatePatience(tempTarget);
		return {
			...profile,
			patienceMax,
		};
	}

	/**
	 * Resolve uma rodada de combate social persistente no SQLite
	 */
	public async resolveSocialRound(params: {
		characterId: string;
		npcId: string;
		treeId: string;
		oratorId: string;
		axis: string;
		rollValue: number;
		dc: number;
		maneuver:
			| "none"
			| "group_sense"
			| "venomous_flattery"
			| "mystic_charm"
			| "ether_contract";
		offerGold: number;
		offerFavors: number;
		events?: readonly SocialCombatEvent[];
	}): Promise<
		Result<NegotiationRoundResult, { code: string; message: string }>
	> {
		// 1. Carrega o estado atual do diálogo do banco de dados (se não existir, cria)
		const findResult = await this.dialogueRepository.findByCharacterAndNpc(
			params.characterId,
			params.npcId,
		);

		if (!findResult.success) {
			return fail(findResult.error);
		}

		let state = findResult.data;
		const initialProfile = this.getInitialNpcStats(params.npcId);

		if (!state) {
			// Cria um novo estado inicializado
			const newState = {
				id: crypto.randomUUID(),
				characterId: params.characterId,
				npcId: params.npcId,
				currentConversationNodeId: "root",
				dialogueTreeId: params.treeId,
				historyJson: JSON.stringify(["root"]),
				unlockedCluesJson: JSON.stringify([]),
				updatedAt: new Date().toISOString(),
				patienceMax: initialProfile.patienceMax,
				patienceCurrent: initialProfile.patienceMax,
				persuasionMax: initialProfile.persuasionMax,
				persuasionCurrent: 0,
				attitude: initialProfile.attitude,
				fatigueCountersJson: "{}",
			};

			const saveResult = await this.dialogueRepository.save(newState);
			if (!saveResult.success) {
				return fail(saveResult.error);
			}
			state = saveResult.data;
		} else if (state.patienceMax === 0) {
			// NPC não inicializado socialmente (migração de dados legados no SQLite)
			state.patienceMax = initialProfile.patienceMax;
			state.patienceCurrent = initialProfile.patienceMax;
			state.persuasionMax = initialProfile.persuasionMax;
			state.persuasionCurrent = 0;
			state.attitude = initialProfile.attitude;
			state.fatigueCountersJson = "{}";

			const saveResult = await this.dialogueRepository.save(state);
			if (!saveResult.success) {
				return fail(saveResult.error);
			}
			state = saveResult.data;
		}

		// 2. Calcula bônus de barganha e aplica no rollValue final
		const totalBargainBonus =
			Math.floor(params.offerGold / 100) + params.offerFavors * 2;
		const finalRoll = params.rollValue + totalBargainBonus;

		// 3. Monta o target no formato exigido pelo NegotiationService
		let fatigueCounters: Record<string, number> = {};
		try {
			fatigueCounters = JSON.parse(state.fatigueCountersJson);
		} catch (_) {
			fatigueCounters = {};
		}

		const target: SocialTarget = {
			id: state.npcId,
			label: initialProfile.label,
			tier: initialProfile.tier,
			mentalStat: initialProfile.mentalStat,
			resistanceStat: initialProfile.resistanceStat,
			attitude: state.attitude as SocialAttitude,
			patience: {
				baseValue: state.patienceMax,
				currentValue: state.patienceCurrent,
			},
			persuasion: {
				totalSegments: state.persuasionMax,
				completedSegments: state.persuasionCurrent,
			},
			fatigueCounters,
		};

		// 4. Monta o conflictState e os eventos (events é passado pela UI)
		const activeEvents = params.events ?? [];
		const conflictState: SocialConflictState = {
			id: `conflict-${state.id}`,
			participantIds: [params.oratorId, params.npcId],
			currentRound: activeEvents.length + 1,
			maxRounds: 10,
			bargainOffers: [],
		};

		// 5. Executa a rodada de negociação
		const roundResult = this.negotiationService.resolveRound({
			oratorId: params.oratorId,
			axis: params.axis,
			rollValue: finalRoll,
			dc: params.dc,
			maneuver: params.maneuver,
			target,
			conflictState,
			events: activeEvents,
		});

		if (!roundResult.success) {
			return fail({
				code: "NEGOTIATION_ROUND_FAILED",
				message: roundResult.error.message,
			});
		}

		const data = roundResult.data;

		// 6. Atualiza o estado do diálogo com o resultado retornado pelo serviço
		const updatedState = {
			...state,
			patienceCurrent: data.target.patience.currentValue,
			patienceMax: data.target.patience.baseValue,
			persuasionCurrent: data.target.persuasion.completedSegments,
			persuasionMax: data.target.persuasion.totalSegments,
			attitude: data.target.attitude,
			fatigueCountersJson: JSON.stringify(data.target.fatigueCounters),
			updatedAt: new Date().toISOString(),
		};

		const saveResult = await this.dialogueRepository.save(updatedState);
		if (!saveResult.success) {
			return fail({
				code: "DATABASE_SAVE_FAILED",
				message:
					"Não foi possível salvar o estado do combate social no banco de dados.",
			});
		}

		return ok(data);
	}

	/**
	 * Redefine as estatísticas sociais do NPC no banco de dados para reiniciar o debate
	 */
	public async resetSocialStats(
		characterId: string,
		npcId: string,
		treeId: string,
	): Promise<Result<DialogueStateData, { code: string; message: string }>> {
		const findResult = await this.dialogueRepository.findByCharacterAndNpc(
			characterId,
			npcId,
		);

		if (!findResult.success) {
			return fail(findResult.error);
		}

		const state = findResult.data;
		const initialProfile = this.getInitialNpcStats(npcId);

		if (!state) {
			const newState = {
				id: crypto.randomUUID(),
				characterId,
				npcId,
				currentConversationNodeId: "root",
				dialogueTreeId: treeId,
				historyJson: JSON.stringify(["root"]),
				unlockedCluesJson: JSON.stringify([]),
				updatedAt: new Date().toISOString(),
				patienceMax: initialProfile.patienceMax,
				patienceCurrent: initialProfile.patienceMax,
				persuasionMax: initialProfile.persuasionMax,
				persuasionCurrent: 0,
				attitude: initialProfile.attitude,
				fatigueCountersJson: "{}",
			};
			return this.dialogueRepository.save(newState);
		}

		state.patienceMax = initialProfile.patienceMax;
		state.patienceCurrent = initialProfile.patienceMax;
		state.persuasionMax = initialProfile.persuasionMax;
		state.persuasionCurrent = 0;
		state.attitude = initialProfile.attitude;
		state.fatigueCountersJson = "{}";
		state.updatedAt = new Date().toISOString();

		return this.dialogueRepository.save(state);
	}
}
