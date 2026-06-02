import type { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SiegeEventRecord } from "../model/siegeSchema";
import type { SiegeServiceFailure } from "../model/siegeTypes";
import type { SiegeRepository } from "./SiegeRepository";

export class SiegeService {
	public constructor(
		private readonly siegeRepository: SiegeRepository,
		private readonly diceService: DiceService,
	) {}

	public async triggerSiege(params: {
		campaignId: string;
		bastionId: string;
		factionId: string;
		dangerLevel: number;
		requestedAt: string;
		uuid?: string;
	}): Promise<Result<SiegeEventRecord, SiegeServiceFailure>> {
		const activeResult = await this.siegeRepository.findActiveSiege(
			params.campaignId,
		);
		if (!activeResult.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Erro ao verificar cercos ativos.",
				details: activeResult.error,
			});
		}

		if (activeResult.data) {
			return fail({
				code: "SIEGE_ALREADY_ACTIVE",
				message: "Já existe um cerco ativo nesta campanha.",
			});
		}

		const eventId = params.uuid ?? crypto.randomUUID();
		const newSiege = {
			id: eventId,
			campaignId: params.campaignId,
			bastionId: params.bastionId,
			factionId: params.factionId,
			status: "active" as const,
			dangerLevel: params.dangerLevel,
			damagePoints: 0,
			createdAt: params.requestedAt,
			updatedAt: params.requestedAt,
		};

		const saveResult = await this.siegeRepository.saveSiegeEvent(newSiege);
		if (!saveResult.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Erro ao persistir evento de cerco.",
				details: saveResult.error,
			});
		}

		const historyId = crypto.randomUUID();
		await this.siegeRepository.saveEventHistory({
			id: historyId,
			campaignId: params.campaignId,
			eventType: "siege_start",
			description: `Fase Macro: O exército da Facção inimiga [${params.factionId}] cercou as muralhas do Bastião com nível de perigo [${params.dangerLevel}]!`,
			createdAt: params.requestedAt,
		});

		return ok(saveResult.data);
	}

	public async resolveSiegeRound(params: {
		siegeId: string;
		defenseRollBonus: number;
		requestedAt: string;
		forcedAttackRoll?: number | undefined;
		forcedDefenseRoll?: number | undefined;
	}): Promise<
		Result<
			{ damageToBastion: number; isResolved: boolean; logMessage: string },
			SiegeServiceFailure
		>
	> {
		const findResult = await this.siegeRepository.findById(params.siegeId);
		if (!findResult.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Erro ao carregar o evento de cerco para resolução.",
				details: findResult.error,
			});
		}

		const siege = findResult.data;
		if (siege.status !== "active") {
			return fail({
				code: "NO_ACTIVE_SIEGE",
				message: "O evento de cerco selecionado já foi resolvido.",
			});
		}

		// Rolar ataque do inimigo: 1d20 + Nível de Perigo
		let attackDie = params.forcedAttackRoll;
		if (attackDie === undefined) {
			const attackRollResult = this.diceService.rollDie({ sides: 20 });
			if (!attackRollResult.success) {
				return fail({
					code: "REPOSITORY_ERROR",
					message: "Erro ao rolar dado de ataque do cerco.",
				});
			}
			attackDie = attackRollResult.data.naturalRoll;
		}
		const attackTotal = attackDie + siege.dangerLevel;

		// Rolar defesa do Bastião: 1d20 + Bônus de Defesa (Estrutura)
		let defenseDie = params.forcedDefenseRoll;
		if (defenseDie === undefined) {
			const defenseRollResult = this.diceService.rollDie({ sides: 20 });
			if (!defenseRollResult.success) {
				return fail({
					code: "REPOSITORY_ERROR",
					message: "Erro ao rolar dado de defesa do cerco.",
				});
			}
			defenseDie = defenseRollResult.data.naturalRoll;
		}
		const defenseTotal = defenseDie + params.defenseRollBonus;

		let damageToBastion = 0;
		let isResolved = false;
		let logMessage = "";

		const diff = attackTotal - defenseTotal;

		if (diff > 0) {
			// Sucesso do ataque inimigo
			damageToBastion = diff * siege.dangerLevel;
			logMessage = `As defesas do Bastião cederam sob o ataque (Ataque: ${attackTotal} vs Defesa: ${defenseTotal}). As muralhas sofreram ${damageToBastion} de dano!`;
		} else if (Math.abs(diff) >= 5) {
			// Defesa vence por margem >= 5: O cerco é repelido e resolvido
			isResolved = true;
			logMessage = `Defesa triunfante! As defesas do Bastião repeliram com sucesso os invasores (Defesa: ${defenseTotal} vs Ataque: ${attackTotal}). O cerco foi quebrado!`;
		} else {
			// Empate ou vitória menor da defesa: O cerco continua
			logMessage = `O cerco persiste nas fronteiras. Os defensores aguentam firmes mas as forças inimigas continuam pressionando (Defesa: ${defenseTotal} vs Ataque: ${attackTotal}).`;
		}

		// Salvar atualizações no cerco
		const updatedSiege = {
			...siege,
			damagePoints: siege.damagePoints + damageToBastion,
			status: isResolved ? ("resolved" as const) : ("active" as const),
			updatedAt: params.requestedAt,
		};

		const saveResult = await this.siegeRepository.saveSiegeEvent(updatedSiege);
		if (!saveResult.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Erro ao atualizar dados de cerco.",
				details: saveResult.error,
			});
		}

		// Registrar no histórico de eventos
		const historyId = crypto.randomUUID();
		await this.siegeRepository.saveEventHistory({
			id: historyId,
			campaignId: siege.campaignId,
			eventType: isResolved ? "siege_resolve" : "ambience_change",
			description: `Fase Macro: ${logMessage}`,
			createdAt: params.requestedAt,
		});

		return ok({
			damageToBastion,
			isResolved,
			logMessage,
		});
	}

	public async resolveSiegeAtCamp(params: {
		campaignId: string;
		bastionId: string;
		infamyValue: number;
		defenseRollBonus: number;
		requestedAt: string;
		forcedAttackRoll?: number;
		forcedDefenseRoll?: number;
	}): Promise<
		Result<
			{
				status:
					| "no_siege"
					| "siege_started"
					| "siege_continues"
					| "siege_resolved";
				damageToBastion: number;
				logMessage: string;
			},
			SiegeServiceFailure
		>
	> {
		const activeResult = await this.siegeRepository.findActiveSiege(
			params.campaignId,
		);
		if (!activeResult.success) {
			return fail({
				code: "REPOSITORY_ERROR",
				message: "Erro ao verificar cerco antes do acampamento.",
				details: activeResult.error,
			});
		}

		const activeSiege = activeResult.data;

		// 1. Sem cerco ativo: verifica se a infâmia acumulada atrai um novo cerco
		if (!activeSiege) {
			// Se a infâmia for extrema (ex: <= -10), há chance de ataque
			if (params.infamyValue <= -10) {
				const dangerLevel = Math.min(
					5,
					Math.max(1, Math.floor(Math.abs(params.infamyValue) / 5)),
				);
				const triggerResult = await this.triggerSiege({
					campaignId: params.campaignId,
					bastionId: params.bastionId,
					factionId: "rival_faction", // Facção genérica agressora
					dangerLevel,
					requestedAt: params.requestedAt,
				});

				if (!triggerResult.success) {
					return fail(triggerResult.error);
				}

				return ok({
					status: "siege_started" as const,
					damageToBastion: 0,
					logMessage: `A infâmia extrema com as facções locais (${params.infamyValue}) atraiu um cerco inimigo!`,
				});
			}

			return ok({
				status: "no_siege" as const,
				damageToBastion: 0,
				logMessage: "O acampamento transcorreu sem atividade inimiga.",
			});
		}

		// 2. Com cerco ativo: resolve automaticamente uma rodada de cerco no acampamento
		const resolveResult = await this.resolveSiegeRound({
			siegeId: activeSiege.id,
			defenseRollBonus: params.defenseRollBonus,
			requestedAt: params.requestedAt,
			forcedAttackRoll: params.forcedAttackRoll,
			forcedDefenseRoll: params.forcedDefenseRoll,
		});

		if (!resolveResult.success) {
			return fail(resolveResult.error);
		}

		const outcome = resolveResult.data;

		return ok({
			status: outcome.isResolved
				? ("siege_resolved" as const)
				: ("siege_continues" as const),
			damageToBastion: outcome.damageToBastion,
			logMessage: outcome.logMessage,
		});
	}
}
