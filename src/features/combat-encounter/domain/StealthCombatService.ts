import { fail, ok, type Result } from "$lib/shared/lib/result";

export type StealthFailureCode =
	| "INVALID_STEALTH_INPUT"
	| "INSUFFICIENT_RESOURCES"
	| "STEALTH_ACTION_FAILED";

export interface StealthFailure {
	readonly code: StealthFailureCode;
	readonly message: string;
}

export interface TensionClockState {
	readonly maxSegments: number;
	readonly filledSegments: number;
	readonly alarmTriggered: boolean;
}

export interface GuardVisionInput {
	readonly position: "frontal_cone" | "flank" | "blind_spot";
	readonly stealthRoll: number;
	readonly stealthModifier: number;
	readonly guardPassivePerception: number;
	readonly useShadows?: boolean;
	readonly useStealthySlide?: boolean;
}

export interface VisionCheckResult {
	readonly detected: boolean;
	readonly tensionSegmentsAdded: number;
	readonly log: string;
}

export interface TakedownInput {
	readonly type: "strike" | "submission" | "tactical_execution";
	readonly rollValue: number;
	readonly modifier: number;
	readonly targetLevel: number;
	readonly casterLevel: number;
	readonly isElite: boolean;
	readonly targetHp: number;
	readonly targetMaxHp: number;
}

export interface TakedownResult {
	readonly success: boolean;
	readonly targetNewHp: number;
	readonly tensionSegmentsAdded: number;
	readonly applyBleeding: boolean;
	readonly vigorCost: number;
	readonly log: string;
}

/**
 * @description Servico de Furtividade, Infiltracao e Combate Silencioso.
 * @rule docs/system/survival/regras-furtividade-infiltracao.md - stealth, vision, and takedown rules
 */
export class StealthCombatService {
	/**
	 * Inicializa o Relogio de Tensao com base no nivel de Vigilancia (Heat) da regiao.
	 */
	public initTensionClock(heat: number): TensionClockState {
		let maxSegments = 12;
		if (heat === 1) maxSegments = 10;
		else if (heat === 2) maxSegments = 8;
		else if (heat === 3) maxSegments = 6;

		return {
			maxSegments,
			filledSegments: 0,
			alarmTriggered: false,
		};
	}

	/**
	 * Adiciona fatias ao Relogio de Tensao e verifica se o alarme geral disparou.
	 */
	public addTensionSegments(
		currentState: TensionClockState,
		segmentsToAdd: number,
	): TensionClockState {
		const nextFilled = currentState.filledSegments + segmentsToAdd;
		const alarmTriggered = nextFilled >= currentState.maxSegments;

		return {
			maxSegments: currentState.maxSegments,
			filledSegments: Math.min(currentState.maxSegments, nextFilled),
			alarmTriggered,
		};
	}

	/**
	 * Resolve a deteccao de um guarda com base no Cone de Visao, Flanco ou Ponto Cego.
	 */
	public checkGuardVision(
		input: GuardVisionInput,
	): Result<VisionCheckResult, StealthFailure> {
		if (input.guardPassivePerception < 0) {
			return fail({
				code: "INVALID_STEALTH_INPUT",
				message: "Percepcao passiva do guarda deve ser maior ou igual a zero.",
			});
		}

		// 1. Ponto Cego: automatico
		if (input.position === "blind_spot") {
			return ok({
				detected: false,
				tensionSegmentsAdded: 0,
				log: "Movimento no Ponto Cego (costas). Personagem permanece oculto.",
			});
		}

		// 2. Cone Frontal
		if (input.position === "frontal_cone") {
			if (input.useShadows) {
				return ok({
					detected: false,
					tensionSegmentsAdded: 0,
					log: "Cruzou o Cone Frontal sob Sombras Profundas. Permanecimento oculto.",
				});
			}
			if (input.useStealthySlide) {
				return ok({
					detected: false,
					tensionSegmentsAdded: 0,
					log: "Deslizamento Furtivo ativo. Cruzou o Cone Frontal com sucesso (Custo: 1 PV).",
				});
			}
			// Invasao direta sem cobertura: deteccao automatica e +2 segmentos
			return ok({
				detected: true,
				tensionSegmentsAdded: 2,
				log: "Deteccao imediata no Cone Frontal de visao direta do guarda! +2 fatias no Relogio.",
			});
		}

		// 3. Flancos (Visao Periferica)
		const totalStealth = input.stealthRoll + input.stealthModifier;
		if (totalStealth >= input.guardPassivePerception) {
			return ok({
				detected: false,
				tensionSegmentsAdded: 0,
				log: `Sucesso! Furtividade total (${totalStealth}) superou a Percepcao Passiva (${input.guardPassivePerception}) nos flancos do guarda.`,
			});
		}

		// Falha no teste de Furtividade nos flancos: deteccao imediata e +2 segmentos
		return ok({
			detected: true,
			tensionSegmentsAdded: 2,
			log: `Falha! Furtividade total (${totalStealth}) nao atingiu a Percepcao Passiva (${input.guardPassivePerception}). +2 fatias no Relogio.`,
		});
	}

	/**
	 * Resolve abates (Takedowns) furtivos contra um guarda desavisado.
	 */
	public resolveTakedown(
		input: TakedownInput,
	): Result<TakedownResult, StealthFailure> {
		if (input.targetHp <= 0) {
			return fail({
				code: "INVALID_STEALTH_INPUT",
				message: "O alvo ja esta morto ou nocauteado.",
			});
		}

		if (input.type === "strike") {
			// Golpe Ligeiro: Dano critico automatico (dobrado). Exige que reduza HP a zero para ser silencioso.
			const expectedDamage = input.rollValue + input.modifier;
			const doubleDamage = expectedDamage * 2;
			const newHp = Math.max(0, input.targetHp - doubleDamage);

			if (newHp === 0) {
				return ok({
					success: true,
					targetNewHp: 0,
					tensionSegmentsAdded: 0,
					applyBleeding: false,
					vigorCost: 0,
					log: `Golpe Ligeiro fatal! Causa ${doubleDamage} de dano critico e abate o inimigo em silencio.`,
				});
			}

			// Inimigo sobrevive e grita: gera 2 segmentos de tensao e inicia combate
			return ok({
				success: false,
				targetNewHp: newHp,
				tensionSegmentsAdded: 2,
				applyBleeding: false,
				vigorCost: 0,
				log: `Golpe Ligeiro falhou em abater! Alvo sobreviveu com ${newHp} PV e gritou por socorro. +2 fatias no Relogio.`,
			});
		}

		if (input.type === "submission") {
			// Submissao: Teste de Eixo Fisico vs Defesa (DC).
			const total = input.rollValue + input.modifier;
			const dc = 10 + input.targetLevel * 2; // Formula de Defesa base do alvo

			if (total >= dc) {
				return ok({
					success: true,
					targetNewHp: 0,
					tensionSegmentsAdded: 0,
					applyBleeding: false,
					vigorCost: 0,
					log: `Submissao bem-sucedida! Rolagem (${total}) superou a Defesa (${dc}). Guarda nocauteado em silencio.`,
				});
			}

			if (total >= dc - 4) {
				// Falha Parcial (Regra de Ouro): Guarda nocauteado, mas com barulho (+1 segmento)
				return ok({
					success: true,
					targetNewHp: 0,
					tensionSegmentsAdded: 1,
					applyBleeding: false,
					vigorCost: 0,
					log: `Submissao com custo (Regra de Ouro)! Rolagem (${total}) proxima da Defesa (${dc}). Guarda nocauteado, mas com barulho de luta. +1 fatia no Relogio.`,
				});
			}

			// Falha total: combate inicia, +2 segmentos
			return ok({
				success: false,
				targetNewHp: input.targetHp,
				tensionSegmentsAdded: 2,
				applyBleeding: false,
				vigorCost: 0,
				log: `Falha na submissao! Rolagem (${total}) inferior a Defesa (${dc}). Guarda escapa e alerta o setor. +2 fatias no Relogio.`,
			});
		}

		if (input.type === "tactical_execution") {
			// Execucao Tatica: Custo fixo de 2 PV.
			if (input.casterLevel < input.targetLevel) {
				return fail({
					code: "STEALTH_ACTION_FAILED",
					message:
						"O nivel do executor e inferior ao do alvo para execucao automatica.",
				});
			}

			if (!input.isElite) {
				// Alvo normal: morre automaticamente e 100% silencioso
				return ok({
					success: true,
					targetNewHp: 0,
					tensionSegmentsAdded: 0,
					applyBleeding: false,
					vigorCost: 2,
					log: "Execucao Tatica automatica! Inimigo abatido silenciosamente (Custo: 2 PV).",
				});
			}

			// Elite/Boss: perde 30% do HP maximo, ganha sangramento, combate inicia
			const damage = Math.floor(input.targetMaxHp * 0.3);
			const newHp = Math.max(1, input.targetHp - damage); // Nao mata Boss no susto, mantem 1 PV min

			return ok({
				success: true,
				targetNewHp: newHp,
				tensionSegmentsAdded: 0,
				applyBleeding: true,
				vigorCost: 2,
				log: `Execucao Tatica contra Elite! Alvo perde 30% dos PVs (${damage} de dano) e sofre Sangramento (Custo: 2 PV).`,
			});
		}

		return fail({
			code: "INVALID_STEALTH_INPUT",
			message: "Tipo de abate desconhecido ou nao suportado.",
		});
	}

	/**
	 * Resolve a limpeza de evidencias (corpos e rastros de sangue).
	 */
	public resolveEvidenceCleanup(params: {
		readonly rollValue: number;
		readonly modifier: number;
		readonly dc: number;
	}): {
		readonly success: boolean;
		readonly segmentsAdded: number;
		readonly log: string;
	} {
		const total = params.rollValue + params.modifier;

		if (total >= params.dc) {
			return {
				success: true,
				segmentsAdded: 0,
				log: `Evidencias limpas com sucesso! Teste (${total}) superou a DC (${params.dc}). O ambiente esta limpo.`,
			};
		}

		if (total >= params.dc - 4) {
			// Falha parcial (Regra de Ouro)
			return {
				success: true,
				segmentsAdded: 1,
				log: `Limpeza parcial com custo (Regra de Ouro)! Teste (${total}) proximo da DC (${params.dc}). Rastro de sangue escondido de pressa. +1 fatia no Relogio.`,
			};
		}

		return {
			success: false,
			segmentsAdded: 2,
			log: `Falha na limpeza! Teste (${total}) muito abaixo da DC (${params.dc}). O corpo nao foi movido a tempo e causou barulho. +2 fatias no Relogio.`,
		};
	}

	/**
	 * Resolve a transicao de fechaduras / barreiras.
	 */
	public resolveLockpicking(params: {
		readonly rollValue: number;
		readonly modifier: number;
		readonly dc: number;
		readonly currentPr: number;
	}): {
		readonly prRemoved: number;
		readonly segmentsAdded: number;
		readonly log: string;
	} {
		const total = params.rollValue + params.modifier;

		if (total >= params.dc) {
			return {
				prRemoved: 1,
				segmentsAdded: 0,
				log: `Sucesso! Rolagem (${total}) superou a DC (${params.dc}). 1 Ponto de Resistencia (PR) removido.`,
			};
		}

		if (total >= params.dc - 4) {
			return {
				prRemoved: 1,
				segmentsAdded: 1,
				log: `Regra de Ouro ativada! Rolagem (${total}) proxima da DC (${params.dc}). Fechadura cedeu, mas fez barulho. +1 fatia no Relogio.`,
			};
		}

		return {
			prRemoved: 0,
			segmentsAdded: 0,
			log: `Falha! Rolagem (${total}) nao atingiu a DC (${params.dc}). Fechadura intacta.`,
		};
	}

	/**
	 * Executa o desvio visual emergencial (Reacao de emergencia ao ser visto).
	 */
	public resolveVisualDodge(params: {
		readonly rollValue: number;
		readonly modifier: number;
		readonly perception: number;
	}): {
		readonly success: boolean;
		readonly segmentsAdded: number;
		readonly log: string;
	} {
		const total = params.rollValue + params.modifier;

		if (total >= params.perception) {
			return {
				success: true,
				segmentsAdded: 0,
				log: `Esquiva Visual bem-sucedida! Rolagem (${total}) superou a Percepcao (${params.perception}). Personagem correu para a cobertura a tempo.`,
			};
		}

		return {
			success: false,
			segmentsAdded: 2,
			log: `Esquiva Visual falhou! Rolagem (${total}) menor que a Percepcao (${params.perception}). Personagem foi avistado. +2 fatias no Relogio.`,
		};
	}

	/**
	 * Resolve o avanco vertical em Poleiros/Vigas.
	 */
	public resolvePoleiroClimb(params: {
		readonly rollValue: number;
		readonly modifier: number;
		readonly dc: number;
	}): {
		readonly success: boolean;
		readonly isHanging: boolean;
		readonly segmentsAdded: number;
		readonly vigorCost: number;
		readonly log: string;
	} {
		const total = params.rollValue + params.modifier;

		if (total >= params.dc) {
			return {
				success: true,
				isHanging: false,
				segmentsAdded: 0,
				vigorCost: 0,
				log: `Poleiro alcancado! Rolagem (${total}) superou a DC (${params.dc}). Personagem agora esta no poleiro.`,
			};
		}

		if (total >= params.dc - 4) {
			// Regra de ouro: pendurado
			return {
				success: true,
				isHanging: true,
				segmentsAdded: 0,
				vigorCost: 1, // Ira gastar 1 PV no proximo turno
				log: `Pendurado com custo (Regra de Ouro)! Rolagem (${total}) proxima da DC (${params.dc}). Personagem esta segurando-se com esforco. (Custo: 1 PV)`,
			};
		}

		// Falha total: queda, +2 segmentos no relogio
		return {
			success: false,
			isHanging: false,
			segmentsAdded: 2,
			vigorCost: 0,
			log: `Falha na escalada! Rolagem (${total}) menor que a DC (${params.dc}). Personagem caiu no chao e fez barulho. +2 fatias no Relogio.`,
		};
	}
}
