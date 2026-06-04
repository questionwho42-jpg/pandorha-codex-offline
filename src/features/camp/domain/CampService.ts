import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CampRepository } from "../../../entities/camp/domain/CampRepository";
import type {
	CampSessionRecord,
	NewCampSessionRecord,
} from "../../../entities/camp/model/campSchema";
import type { CampRepositoryFailure } from "../../../entities/camp/model/campTypes";
import type { SiegeService } from "../../../entities/siege/domain/SiegeService";
import type { CampActivity, CampSessionCreateOptions } from "./types";

export interface CampActivityParams {
	id: string;
	name: string;
	performerId: string;
	matrix: "Physical" | "Mental" | "Social";
	costCargas?: number;
	difficulty: number;
}

export class CampService {
	public constructor(
		private readonly repository: CampRepository,
		private readonly siegeService?: SiegeService,
	) {}

	/**
	 * Inicia uma nova sessão de acampamento no banco de dados.
	 * O número de ações disponíveis é igual a totalTime - sleepHours.
	 */
	public async createSession(
		id: string,
		options: CampSessionCreateOptions,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		const sleepHours = options.sleepHours ?? 8;
		const availableActions = Math.max(0, options.totalTime - sleepHours);

		const record: NewCampSessionRecord = {
			id,
			totalTime: options.totalTime,
			sleepHours,
			availableActions,
			dangerCounter: 0,
			activeActivitiesJson: JSON.stringify([]),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return this.repository.save(record);
	}

	/**
	 * Ativa ou desativa a fogueira no acampamento.
	 * Manter a fogueira acesa adiciona +3 fixo ao Contador de Perigo devido à visibilidade.
	 */
	public async toggleFogueira(
		sessionId: string,
		active: boolean,
	): Promise<Result<CampSessionRecord, CampRepositoryFailure>> {
		const sessionRes = await this.repository.findById(sessionId);
		if (!sessionRes.success) {
			return fail(sessionRes.error);
		}

		const session = sessionRes.data;
		const activities: CampActivity[] = JSON.parse(session.activeActivitiesJson);

		const hasFire = activities.some((act) => act.id === "fogueira_ativa");

		if (active && !hasFire) {
			activities.push({
				id: "fogueira_ativa",
				name: "Fogueira Acesa",
				performerId: "system",
				matrix: "Physical",
				difficulty: 1,
			});
			session.dangerCounter += 3;
		} else if (!active && hasFire) {
			const index = activities.findIndex((act) => act.id === "fogueira_ativa");
			if (index !== -1) {
				activities.splice(index, 1);
			}
			session.dangerCounter = Math.max(0, session.dangerCounter - 3);
		}

		session.activeActivitiesJson = JSON.stringify(activities);
		session.updatedAt = new Date().toISOString();

		return this.repository.save(session);
	}

	/**
	 * Executa uma atividade de acampamento consumindo 1 hora de ação.
	 * Ajusta o perigo baseado em falhas e sucessos, e avança relógios de grupo.
	 */
	public async executeActivity(
		sessionId: string,
		params: CampActivityParams,
		modifier: number,
		d20Roll: number,
		isCollective = false,
		collectiveMaxSucesses = 3,
	): Promise<
		Result<
			{
				success: boolean;
				dangerAdded: number;
				clockProgress?:
					| { current: number; max: number; completed: boolean }
					| undefined;
				session: CampSessionRecord;
			},
			CampRepositoryFailure
		>
	> {
		const sessionRes = await this.repository.findById(sessionId);
		if (!sessionRes.success) {
			return fail(sessionRes.error);
		}

		const session = sessionRes.data;
		if (session.availableActions <= 0) {
			return fail({
				code: "CAMP_REPOSITORY_WRITE_FAILED",
				message:
					"Não restam ações de acampamento disponíveis para esta sessão.",
			});
		}

		// Consome 1 ação de tempo
		session.availableActions -= 1;

		// Resolve teste d20
		const totalValue = d20Roll + modifier;
		const success = totalValue >= params.difficulty;

		let dangerAdded = 1; // +1 ao final de cada hora de atividade por padrão
		let clockProgress:
			| { current: number; max: number; completed: boolean }
			| undefined;

		const activities: CampActivity[] = JSON.parse(session.activeActivitiesJson);

		if (isCollective) {
			// Atividade Coletiva (Relógio de Grupo)
			// Estrutura de ID no array: `relogio:${params.id}:${current}:${max}`
			const regex = new RegExp(`^relogio:${params.id}:(\\d+):(\\d+)$`);
			const relogioIndex = activities.findIndex((act) => regex.test(act.id));

			let current = 0;
			const max = collectiveMaxSucesses;

			if (relogioIndex !== -1) {
				const activeActivity = activities[relogioIndex];
				const match = activeActivity?.id.match(regex);
				if (match && match[1] !== undefined) {
					current = Number.parseInt(match[1], 10);
				}
			}

			if (success) {
				current += 1;
			} else {
				// Falha em esforço coletivo adiciona +1 de perigo extra (totalizando +2: +1 da hora e +1 da falha)
				dangerAdded += 1;
			}

			const completed = current >= max;
			clockProgress = { current, max, completed };

			// Atualiza ou remove o relógio na sessão
			if (relogioIndex !== -1) {
				const activeAct = activities[relogioIndex];
				if (completed) {
					activities.splice(relogioIndex, 1);
				} else if (activeAct) {
					activeAct.id = `relogio:${params.id}:${current}:${max}`;
				}
			} else if (!completed) {
				activities.push({
					...params,
					id: `relogio:${params.id}:${current}:${max}`,
				});
			}
		} else {
			// Atividade Individual
			if (!success) {
				// Falha em atividade individual adiciona +2 extras ao Contador de Perigo (totalizando +3)
				dangerAdded += 2;
			}

			// Vigília Ativa reduz perigo em 2 se sucesso
			if (params.id === "vigilia_ativa" && success) {
				session.dangerCounter = Math.max(0, session.dangerCounter - 2);
			}

			// Adiciona atividade concluída (se for o caso) ou temporária
			activities.push({
				...params,
				id: `${params.id}:${crypto.randomUUID()}`,
			});
		}

		session.dangerCounter += dangerAdded;
		session.activeActivitiesJson = JSON.stringify(activities);
		session.updatedAt = new Date().toISOString();

		const saveRes = await this.repository.save(session);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok({
			success,
			dangerAdded,
			clockProgress,
			session: saveRes.data,
		});
	}

	/**
	 * Rola o encontro noturno do acampamento.
	 * Se a rolagem d20 for menor ou igual ao perigo acumulado, ativa um evento e reseta o perigo.
	 */
	public async rollEncounter(
		sessionId: string,
		d20Roll: number,
	): Promise<
		Result<
			{
				eventTriggered: boolean;
				eventNumber?: number | undefined;
				eventDescription?: string | undefined;
				session: CampSessionRecord;
			},
			CampRepositoryFailure
		>
	> {
		const sessionRes = await this.repository.findById(sessionId);
		if (!sessionRes.success) {
			return fail(sessionRes.error);
		}

		const session = sessionRes.data;
		const eventTriggered = d20Roll <= session.dangerCounter;

		let eventNumber: number | undefined;
		let eventDescription: string | undefined;

		if (eventTriggered) {
			session.dangerCounter = 0; // Reseta perigo após o encontro
			eventNumber = d20Roll; // A própria rolagem define o tipo de evento (1 a 20)
			eventDescription = this.getEventDescription(eventNumber);
		}

		session.updatedAt = new Date().toISOString();

		const saveRes = await this.repository.save(session);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok({
			eventTriggered,
			eventNumber,
			eventDescription,
			session: saveRes.data,
		});
	}

	private getEventDescription(eventNumber: number): string {
		const events: Record<number, string> = {
			1: "Emboscada Predatória: Combate imediato contra feras do Tier local.",
			2: "Chuva Torrencial: Apaga fogueiras mundanas; tarefas de precisão sofrem Desvantagem.",
			3: "Suprimentos Estragados: O grupo perde 1d4 Rações devido a umidade ou pragas.",
			4: "Viajante Perdido: NPC pede abrigo. Teste Social para obter informações ou evitar roubo.",
			5: "Ecos do Éter: Ruídos perturbadores. Todos rolam Mental+Resistência ou perdem 1 EE.",
			6: "Equipamento Danificado: Uma arma ou armadura ganha a condição 'Quebrado' aleatoriamente.",
			7: "Visão de Estrela Cadente: Momento de paz. Todos recuperam 1 Ponto de Vigor (PV) extra.",
			8: "Infestação de Insetos: O sono é perturbado. Personagens acordam sem recuperar exaustão.",
			9: "Rastros Próximos: Alguém está vigiando. O Contador de Perigo sobe +3 imediatamente.",
			10: "Mercador Ambulante: Oportunidade única de trocar itens ou comprar cargas de Kits.",
			11: "Gases Tóxicos: Vazamento natural de éter. Teste de Físico+Resistência ou ficam Envenenados.",
			12: "Conflito Interno: Stress acumulado. Dois jogadores devem resolver uma disputa (Social).",
			13: "Animal Curioso: Uma criatura pequena rouba um item leve de um Slot de Carga.",
			14: "Ruína Escondida: O acampamento foi montado sobre algo. Teste Mental para achar loot.",
			15: "Frio Intenso: Sem fogueira, todos sofrem a Penalidade de Exposição (recuperação 50%).",
			16: "Invasão de Sonho: Um Tecelão inimigo tenta extrair dados. Disputa de Mental+Resistência.",
			17: "Sinal de Fumaça: Inimigos distantes avistaram o fogo. Encontro garantido em 1d4 horas.",
			18: "Planta Medicinal: Um sucesso em Caçar/Forragear encontra ingredientes para 1 poção.",
			19: "Terreno Instável: Parte do acampamento cede. Teste de Físico+Interação para não perder itens.",
			20: "Paz Absoluta: O Contador de Perigo trava em 1 pelo restante da noite.",
		};

		return events[eventNumber] ?? "Evento desconhecido nas sombras do ermo.";
	}

	/**
	 * Processa o estado de cerco no início do acampamento.
	 * Se houver cerco ativo, executa uma rodada. Se a infâmia for extrema, inicia um cerco.
	 * Se o cerco continuar ativo ou for iniciado, penaliza o acampamento com +5 de perigo inicial.
	 */
	public async processSiegeAtCampStart(params: {
		sessionId: string;
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
			{ code: string; message: string; details?: unknown }
		>
	> {
		if (!this.siegeService) {
			return fail({
				code: "CAMP_REPOSITORY_WRITE_FAILED",
				message: "Serviço de cerco não injetado no acampamento.",
			});
		}

		const result = await this.siegeService.resolveSiegeAtCamp(params);
		if (!result.success) {
			return fail({
				code: "CAMP_REPOSITORY_WRITE_FAILED",
				message: "Erro ao processar cerco no acampamento.",
				details: result.error,
			});
		}

		const outcome = result.data;

		// Se o cerco continuar ativo ou tiver acabado de iniciar, adiciona +5 de perigo inicial devido à tensão
		if (
			outcome.status === "siege_continues" ||
			outcome.status === "siege_started"
		) {
			const sessionRes = await this.repository.findById(params.sessionId);
			if (sessionRes.success) {
				const session = sessionRes.data;
				session.dangerCounter += 5;
				await this.repository.save(session);
			}
		}

		return ok(outcome);
	}

	/**
	 * Processa o fechamento do Dia de Aventura.
	 * Deduz 1 Provisão Diária por Andarilho e montaria.
	 * Em caso de falta de provisões, cada Andarilho sofre +1 nível na Cascata de Exaustão.
	 */
	public async processAdventureDayEnd(params: {
		characterIds: string[];
		mountsCount: number;
		currentProvisions: number;
		saveStatusEffect: (effect: {
			id: string;
			characterId: string;
			type: string;
			severity: number;
			severityMax: number;
			isAggravated: boolean;
			createdAt: string;
		}) => Promise<Result<void, { code: string; message: string }>>;
		findStatusEffects: (
			characterId: string,
		) => Promise<
			Result<readonly { type: string }[], { code: string; message: string }>
		>;
	}): Promise<
		Result<
			{
				consumed: number;
				remaining: number;
				exhaustionApplied: string[];
			},
			{ code: string; message: string }
		>
	> {
		const required = params.characterIds.length + params.mountsCount;
		const consumed = Math.min(params.currentProvisions, required);
		const remaining = Math.max(0, params.currentProvisions - consumed);

		const exhaustionApplied: string[] = [];

		if (consumed < required) {
			const exhaustionOrder = [
				"body_fatigue",
				"mental_fog",
				"spirit_ruin",
				"cellular_collapse",
				"dead",
			];

			for (const charId of params.characterIds) {
				const effectsRes = await params.findStatusEffects(charId);
				if (!effectsRes.success) {
					return fail(effectsRes.error);
				}

				const currentEffects = effectsRes.data.map((e) => e.type);

				// Achar o nível mais alto de exaustão ativo
				let currentLevelIdx = -1;
				for (let i = 0; i < exhaustionOrder.length; i++) {
					if (currentEffects.includes(exhaustionOrder[i]!)) {
						currentLevelIdx = i;
					}
				}

				const nextLevelIdx = currentLevelIdx + 1;
				if (nextLevelIdx < exhaustionOrder.length) {
					const nextEffectType = exhaustionOrder[nextLevelIdx]!;

					// Salva o novo efeito de exaustão cumulativo
					const saveRes = await params.saveStatusEffect({
						id: `eff-${Date.now()}-${crypto.randomUUID()}`,
						characterId: charId,
						type: nextEffectType,
						severity: 1,
						severityMax: 3,
						isAggravated: false,
						createdAt: new Date().toISOString(),
					});

					if (!saveRes.success) {
						return fail(saveRes.error);
					}

					exhaustionApplied.push(`${charId}:${nextEffectType}`);
				}
			}
		}

		return ok({
			consumed,
			remaining,
			exhaustionApplied,
		});
	}
}
