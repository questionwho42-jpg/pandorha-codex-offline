import type { SocialTarget } from "../model-api";

export interface SocialAttackContext {
	margin: number;
	target: SocialTarget;
	generatedFavors: number; // 1 = Favor Menor, 5 = Favor Maior
	log: string[];
}

/**
 * Interface/Componente Abstrato
 * O contrato comum para aplicar danos ou efeitos em uma negociação social.
 */
export interface ISocialAttack {
	execute(context: SocialAttackContext): SocialAttackContext;
}

/**
 * Componente Concreto
 * O objeto base que executa um ataque social simples, sem manobras especiais.
 */
export class BasicSocialAttack implements ISocialAttack {
	execute(context: SocialAttackContext): SocialAttackContext {
		// O ataque base apenas passa o contexto adiante. O dano efetivo é a margin bruta.
		return context;
	}
}

/**
 * Decorador Base
 * Permite compor múltiplas manobras (o "efeito cebola"), passando o contexto de uma camada para a próxima.
 */
export abstract class SocialAttackDecorator implements ISocialAttack {
	constructor(protected wrappee: ISocialAttack) {}

	execute(context: SocialAttackContext): SocialAttackContext {
		return this.wrappee.execute(context);
	}
}

/**
 * Decorador Concreto: Senso de Grupo
 * Se o jogador tiver uma margem de sucesso razoável (>= 2), ele ativa sua rede de contatos e
 * gera 1 Favor Menor passivamente na mesa.
 */
export class GroupSenseDecorator extends SocialAttackDecorator {
	override execute(context: SocialAttackContext): SocialAttackContext {
		const result = super.execute(context);
		if (result.margin >= 2) {
			result.generatedFavors += 1;
			result.log.push(
				"Manobra [Senso de Grupo]: Seus contatos na região renderam 1 Favor Menor na mesa!",
			);
		}
		return result;
	}
}

/**
 * Decorador Concreto: Lisonja Venenosa
 * Adiciona um bônus numérico fixo (+2) na margem devido às palavras doces, amolecendo a paciência do alvo mais rápido.
 */
export class VenomousFlatteryDecorator extends SocialAttackDecorator {
	override execute(context: SocialAttackContext): SocialAttackContext {
		const result = super.execute(context);
		result.margin += 2;
		result.log.push(
			"Manobra [Lisonja Venenosa]: O alvo baixou a guarda com os elogios (+2 Dano Mental efetivo).",
		);
		return result;
	}
}

/**
 * Decorador Concreto: Charme Místico
 * Subjuga a atitude natural do alvo, forçando-o a ser "friendly" imediatamente.
 */
export class MysticCharmDecorator extends SocialAttackDecorator {
	override execute(context: SocialAttackContext): SocialAttackContext {
		const result = super.execute(context);
		// Força a mudança na atitude do alvo no contexto.
		result.target = { ...result.target, attitude: "friendly" };
		result.log.push(
			"Manobra [Charme Místico]: O alvo subitamente age de forma Amigável sob sua influência!",
		);
		return result;
	}
}
