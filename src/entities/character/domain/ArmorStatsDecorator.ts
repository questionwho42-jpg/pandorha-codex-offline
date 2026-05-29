import {
	type ICharacterStats,
	StatusEffectDecorator,
} from "./StatusEffectDecorator";

export interface ArmorSetup {
	readonly armorBonus: number;
	readonly isHeavy: boolean;
	readonly isNoisy: boolean;
	readonly shieldBonus: number;
}

/**
 * 🧅 DECORADOR CONCRETO DE ARMADURA E ESCUDO (ArmorStatsDecorator)
 * Envolve a cebola de atributos do personagem e aplica os bônus e restrições
 * de armaduras (leves/pesadas) e escudos ativos de forma reativa.
 *
 * Regra de CA: 10 + Nível + Bônus de Armadura + Eixo Limitado + Escudo
 * Eixo Limitado: Físico é limitado a 0 se a armadura for Pesada.
 */
export class ArmorStatsDecorator extends StatusEffectDecorator {
	public constructor(
		wrapped: ICharacterStats,
		private readonly setup: ArmorSetup,
	) {
		super(wrapped);
	}

	public override get armorClass(): number {
		const limitedPhysical = this.setup.isHeavy ? 0 : this.wrapped.physical;
		return (
			10 +
			this.wrapped.level +
			this.setup.armorBonus +
			limitedPhysical +
			this.setup.shieldBonus
		);
	}

	public override get movementSpeedBase(): number {
		const baseSpeed = this.wrapped.movementSpeedBase;
		if (this.setup.isHeavy) {
			// Reduz em 3m a velocidade base do personagem
			return Math.max(0, baseSpeed - 3);
		}
		return baseSpeed;
	}

	public override get stealthPenalty(): number {
		const basePenalty = this.wrapped.stealthPenalty;
		if (this.setup.isNoisy) {
			// Armadura ruidosa aplica -2 em Furtividade
			return basePenalty - 2;
		}
		return basePenalty;
	}
}
