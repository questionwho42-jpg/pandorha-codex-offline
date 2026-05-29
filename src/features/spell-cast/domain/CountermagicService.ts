import { fail, ok, type Result } from "$lib/shared/lib/result";

export type CountermagicFailureCode =
	| "INSUFFICIENT_REACTION"
	| "INVALID_COUNTER_INPUT"
	| "COUNTER_RESOLUTION_FAILED";

export interface CountermagicFailure {
	readonly code: CountermagicFailureCode;
	readonly message: string;
}

export interface CountermagicInput {
	readonly abjuradorId: string;
	readonly abjuradorLevel: number;
	readonly abjuradorMental: number;
	readonly abjuradorConflict: number;
	readonly abjuradorItemBonus?: number;
	readonly hasReaction: boolean;
	readonly spellCircle: number;
	readonly rollValue: number;
}

export interface CountermagicResult {
	readonly success: boolean;
	readonly log: string;
}

/**
 * @description Servico de Contramagia, Interrupcao e Anulacao Eterica.
 * @rule docs/system/survival/capitulo-xx-contramagia-e-anulacao.md - abjuration and magic interception rules
 */
export class CountermagicService {
	/**
	 * Resolve a interrupcao de uma magia adversaria (Contramagia)
	 */
	public resolveCountermagic(
		input: CountermagicInput,
	): Result<CountermagicResult, CountermagicFailure> {
		if (!input.hasReaction) {
			return fail({
				code: "INSUFFICIENT_REACTION",
				message: "O abjurador nao possui reacao disponivel para esta rodada.",
			});
		}

		if (input.spellCircle < 0 || input.spellCircle > 10) {
			return fail({
				code: "INVALID_COUNTER_INPUT",
				message: "O circulo da magia alvo deve estar entre 0 e 10.",
			});
		}

		const cd = 10 + input.spellCircle;

		// Magia de 3º circulo ou inferior: falha automatica do inimigo (sem rolagem)
		if (input.spellCircle <= 3) {
			return ok({
				success: true,
				log: `Contramagia bem-sucedida! Magia de circulo inferior (${input.spellCircle}) foi anulada automaticamente sem necessidade de teste.`,
			});
		}

		// Magia de 4º circulo ou superior exige teste de Habilidade de Conjuracao
		const total =
			input.rollValue +
			input.abjuradorLevel +
			input.abjuradorMental +
			input.abjuradorConflict +
			(input.abjuradorItemBonus ?? 0);

		if (total >= cd) {
			return ok({
				success: true,
				log: `Contramagia bem-sucedida! Rolagem total (${total}) superou a CD (${cd}) da magia de circulo ${input.spellCircle}.`,
			});
		}

		return ok({
			success: false,
			log: `Falha na contramagia! Rolagem total (${total}) nao atingiu a CD (${cd}) da magia de circulo ${input.spellCircle}.`,
		});
	}

	/**
	 * Calcula o dano final apos aplicacao de Resistencia, Vulnerabilidade e Anulacao Mutua.
	 */
	public calculateMagicDamage(params: {
		readonly baseDamage: number;
		readonly hasResistance: boolean;
		readonly hasVulnerability: boolean;
	}): number {
		if (params.hasResistance && params.hasVulnerability) {
			// Anulacao Mutua: efeitos se cancelam
			return params.baseDamage;
		}
		if (params.hasResistance) {
			// Resistencia: reduz pela metade (arredondado para baixo)
			return Math.floor(params.baseDamage / 2);
		}
		if (params.hasVulnerability) {
			// Vulnerabilidade: dobra o dano
			return params.baseDamage * 2;
		}
		return params.baseDamage;
	}

	/**
	 * Resolve a mecanica de Refletir Magia caso passe no teste de resistencia.
	 */
	public resolveReflectMagic(params: {
		readonly savingThrowPassed: boolean;
		readonly spellDamage: number;
		readonly availableTargets: readonly string[];
		readonly randomValue: number;
	}): {
		readonly reflected: boolean;
		readonly targetId?: string;
		readonly reflectedDamage?: number;
	} {
		if (!params.savingThrowPassed || params.availableTargets.length === 0) {
			return { reflected: false };
		}

		const index = Math.floor(
			params.randomValue * params.availableTargets.length,
		);
		const targetId = params.availableTargets[index] as string;

		return {
			reflected: true,
			targetId,
			reflectedDamage: params.spellDamage,
		};
	}
}
