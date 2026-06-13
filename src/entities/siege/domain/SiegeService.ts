import type { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { SiegeEventRecord } from "../model/siegeSchema";
import type { SiegeServiceFailure } from "../model/siegeTypes";
import type { SiegeRepository } from "./SiegeRepository";

export interface ISiegeBastionDefender {
	id: string;
	integrityCurrent: number;
	structure: number;
	threatCurrent: number;
}

export interface ISiegeMercenarySquad {
	id: string;
	physical: number;
	cohesionCurrent: number;
	status: "available" | "on_mission" | "resting" | "dead";
}

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
		uuid?: string | undefined;
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
		bastion?: ISiegeBastionDefender | undefined;
		squads?: ISiegeMercenarySquad[] | undefined;
	}): Promise<
		Result<
			{
				damageToBastion: number;
				isResolved: boolean;
				logMessage: string;
				updatedBastion?: ISiegeBastionDefender | undefined;
				updatedSquads?: ISiegeMercenarySquad[] | undefined;
				resetClockName?: string | undefined;
			},
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

		// Rolar defesa do Bastião: 1d20 + Bônus de Defesa (Estrutura) + Bônus de Mercenários
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

		// Bônus de mercenários designados: somatório de Physical
		const squadsList = params.squads ?? [];
		const activeSquads = squadsList.filter(
			(s) => s.status === "available" && s.cohesionCurrent > 0,
		);
		const mercenaryDefenseBonus = activeSquads.reduce(
			(acc, sq) => acc + sq.physical,
			0,
		);

		const defenseTotal =
			defenseDie + params.defenseRollBonus + mercenaryDefenseBonus;

		let damageToBastion = 0;
		let isResolved = false;
		let logMessage = "";

		const diff = attackTotal - defenseTotal;

		let updatedBastion: ISiegeBastionDefender | undefined;
		let updatedSquads: ISiegeMercenarySquad[] | undefined;
		let resetClockName: string | undefined;

		if (diff > 0) {
			// Sucesso do ataque inimigo
			const rawDamage = diff * siege.dangerLevel;
			let remainingDamage = rawDamage;

			if (activeSquads.length > 0) {
				updatedSquads = squadsList.map((sq) => ({ ...sq }));
				let currentActives = updatedSquads.filter(
					(s) => s.status === "available" && s.cohesionCurrent > 0,
				);

				while (remainingDamage > 0 && currentActives.length > 0) {
					for (const squad of currentActives) {
						if (remainingDamage <= 0) break;
						squad.cohesionCurrent--;
						remainingDamage--;
						if (squad.cohesionCurrent <= 0) {
							squad.cohesionCurrent = 0;
							squad.status = "dead";
						}
					}
					currentActives = updatedSquads.filter(
						(s) => s.status === "available" && s.cohesionCurrent > 0,
					);
				}
			}

			damageToBastion = remainingDamage;
			const mercenariesMitigated = rawDamage - remainingDamage;

			logMessage = `As defesas do Bastião cederam sob o ataque (Ataque: ${attackTotal} vs Defesa: ${defenseTotal}).`;
			if (mercenariesMitigated > 0) {
				logMessage += ` Esquadrões mercenários absorveram ${mercenariesMitigated} de dano de coesão.`;
			}
			logMessage += ` As muralhas sofreram ${damageToBastion} de dano estrutural!`;
		} else if (Math.abs(diff) >= 5) {
			// Defesa vence por margem >= 5: O cerco é repelido e resolvido
			isResolved = true;
			logMessage = `Defesa triunfante! As defesas do Bastião repeliram com sucesso os invasores (Defesa: ${defenseTotal} vs Ataque: ${attackTotal}). O cerco foi quebrado!`;

			// Determinar relógio de ameaça correspondente à facção agressora
			if (siege.factionId === "fac-ruin") {
				resetClockName = "Ameaça: Sectários da Ruína";
			} else if (siege.factionId === "fac-ether") {
				resetClockName = "Ameaça: Guardiões do Ether";
			}
		} else {
			// Empate ou vitória menor da defesa: O cerco continua
			logMessage = `O cerco persiste nas fronteiras. Os defensores aguentam firmes mas as forças inimigas continuam pressionando (Defesa: ${defenseTotal} vs Ataque: ${attackTotal}).`;
		}

		if (params.bastion) {
			updatedBastion = {
				...params.bastion,
				integrityCurrent: Math.max(
					0,
					params.bastion.integrityCurrent - damageToBastion,
				),
				threatCurrent: isResolved ? 0 : params.bastion.threatCurrent,
			};
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
			updatedBastion,
			updatedSquads,
			resetClockName,
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
