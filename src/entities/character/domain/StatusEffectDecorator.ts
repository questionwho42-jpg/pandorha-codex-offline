import type { CharacterRecord } from "../model/characterSchema";

/**
 * 🧅 INTERFACE / COMPONENTE ABSTRATO
 * Define o contrato comum para todos os objetos de estatísticas de personagem,
 * sejam eles personagens base ou personagens decorados com penalidades/doenças.
 */
export interface ICharacterStats {
	readonly physical: number;
	readonly mental: number;
	readonly social: number;
	readonly conflict: number;
	readonly interaction: number;
	readonly resistance: number;
	readonly level: number;
	readonly classBaseHp: number; // HP Base da classe exposto para reatividade da cebola

	// Estatísticas Derivadas
	readonly maxHp: number;
	readonly initiativeBase: number;
	readonly carrySlotLimit: number;
	readonly movementSpeedBase: number;

	// Logística de Carga
	readonly currentCarryWeight: number;
	readonly encumbranceState: "light" | "encumbered" | "overloaded";

	// Flags de Sobrevivência
	readonly allowsNaturalRecovery: boolean;
}

/**
 * 🧅 COMPONENTE CONCRETO
 * Representa as estatísticas base originais e puras de um personagem,
 * calculadas a partir da sua ficha e da sua classe sem nenhum efeito ativo.
 */
export class BaseCharacterStats implements ICharacterStats {
	public constructor(
		private readonly character: CharacterRecord,
		private readonly characterClass: { id: string; baseHp: number },
	) {}

	public get physical(): number {
		return this.character.physical;
	}

	public get mental(): number {
		return this.character.mental;
	}

	public get social(): number {
		return this.character.social;
	}

	public get conflict(): number {
		return this.character.conflict;
	}

	public get interaction(): number {
		return this.character.interaction;
	}

	public get resistance(): number {
		return this.character.resistance;
	}

	public get level(): number {
		return this.character.level;
	}

	public get classBaseHp(): number {
		return this.characterClass.baseHp;
	}

	// Regra de RPG: HP = (Base HP + Físico + Resistência) * Nível
	public get maxHp(): number {
		return (this.classBaseHp + this.physical + this.resistance) * this.level;
	}

	// Regra de RPG: Iniciativa = Nível + Mental + Interação
	public get initiativeBase(): number {
		return this.level + this.mental + this.interaction;
	}

	// Regra de RPG: Carga = Físico + Resistência + 6 + (2 se for Anão - Mule do Abismo)
	public get carrySlotLimit(): number {
		const bonus = this.character.ancestryId === "dwarf" ? 2 : 0;
		return this.physical + this.resistance + 6 + bonus;
	}

	// Velocidade base em metros (Pandorha padrão: 9m)
	public get movementSpeedBase(): number {
		return 9;
	}

	public get currentCarryWeight(): number {
		return 0;
	}

	public get encumbranceState(): "light" | "encumbered" | "overloaded" {
		return "light";
	}

	// Por padrão, um personagem saudável pode se recuperar normalmente no acampamento
	public get allowsNaturalRecovery(): boolean {
		return true;
	}
}

/**
 * 🧅 DECORADOR BASE (StatusEffectDecorator)
 * Implementa a interface comum e recebe uma instância da própria interface no construtor.
 * Ele repassa (delega) recursivamente todas as chamadas para o objeto interno que ele envolve.
 * Além disso, ele unifica os cálculos das estatísticas derivadas a partir das propriedades
 * redefinidas pelos decoradores concretos (garantindo a propagação reativa exata na cebola).
 */
export abstract class StatusEffectDecorator implements ICharacterStats {
	public constructor(protected readonly wrapped: ICharacterStats) {}

	public get physical(): number {
		return this.wrapped.physical;
	}

	public get mental(): number {
		return this.wrapped.mental;
	}

	public get social(): number {
		return this.wrapped.social;
	}

	public get conflict(): number {
		return this.wrapped.conflict;
	}

	public get interaction(): number {
		return this.wrapped.interaction;
	}

	public get resistance(): number {
		return this.wrapped.resistance;
	}

	public get level(): number {
		return this.wrapped.level;
	}

	public get classBaseHp(): number {
		return this.wrapped.classBaseHp;
	}

	// Reatividade Cebola: usa as propriedades do decorador (this) em vez do embrulhado (wrapped)
	public get maxHp(): number {
		return (this.classBaseHp + this.physical + this.resistance) * this.level;
	}

	public get initiativeBase(): number {
		return this.level + this.mental + this.interaction;
	}

	// Reatividade de Carga: recalcula com os atributos flutuantes na cebola mas preserva o bônus de anão original do wrapped
	public get carrySlotLimit(): number {
		const originalBaseLimit = this.wrapped.carrySlotLimit;
		const originalAttributesSum =
			this.wrapped.physical + this.wrapped.resistance + 6;
		const fixedBonus = originalBaseLimit - originalAttributesSum;
		return this.physical + this.resistance + 6 + fixedBonus;
	}

	public get movementSpeedBase(): number {
		return this.wrapped.movementSpeedBase;
	}

	public get currentCarryWeight(): number {
		return this.wrapped.currentCarryWeight;
	}

	public get encumbranceState(): "light" | "encumbered" | "overloaded" {
		return this.wrapped.encumbranceState;
	}

	public get allowsNaturalRecovery(): boolean {
		return this.wrapped.allowsNaturalRecovery;
	}
}

/**
 * 🧅 DECORADOR CONCRETO 1: Febre de Éter (EterFeverDecorator)
 * Enfermidade climática/mística que debilita a mente e a resistência geral do aventureiro.
 * Reduz: mental -1, resistance -1.
 */
export class EterFeverDecorator extends StatusEffectDecorator {
	public override get mental(): number {
		return Math.max(0, this.wrapped.mental - 1);
	}

	public override get resistance(): number {
		return Math.max(0, this.wrapped.resistance - 1);
	}
}

/**
 * 🧅 DECORADOR CONCRETO 2: Infecção de Ferida (WoundInfectionDecorator)
 * Infecção física grave resultante de combates sem higienização adequada.
 * Reduz: physical -1, impede cura natural no acampamento.
 */
export class WoundInfectionDecorator extends StatusEffectDecorator {
	public override get physical(): number {
		return Math.max(0, this.wrapped.physical - 1);
	}

	// Impede a cura natural
	public override get allowsNaturalRecovery(): boolean {
		return false;
	}
}

/**
 * 🧅 DECORADOR CONCRETO 3: Veneno de Víbora (ViperPoisonDecorator)
 * Toxina paralisante que sabota os músculos e a reação rápida do personagem.
 * Reduz: physical -2, iniciativa -1.
 */
export class ViperPoisonDecorator extends StatusEffectDecorator {
	public override get physical(): number {
		return Math.max(0, this.wrapped.physical - 2);
	}

	// Reduz a iniciativa base final em 1
	public override get initiativeBase(): number {
		return Math.max(0, super.initiativeBase - 1);
	}
}

/**
 * 🧅 DECORADOR CONCRETO 4: Sobrecarga de Peso (EncumberedStatusDecorator)
 * Decorador de logística que penaliza o deslocamento e reação baseando-se no peso equipado.
 */
export class EncumberedStatusDecorator extends StatusEffectDecorator {
	public constructor(
		wrapped: ICharacterStats,
		private readonly equippedWeight: number,
	) {
		super(wrapped);
	}

	public override get currentCarryWeight(): number {
		return this.equippedWeight;
	}

	public override get encumbranceState():
		| "light"
		| "encumbered"
		| "overloaded" {
		const limit = this.carrySlotLimit;
		if (this.equippedWeight > limit + 5) {
			return "overloaded";
		}
		if (this.equippedWeight > limit) {
			return "encumbered";
		}
		return "light";
	}

	public override get movementSpeedBase(): number {
		const state = this.encumbranceState;
		if (state === "overloaded") {
			return 0; // Imobilizado (Velocidade 0)
		}
		if (state === "encumbered") {
			// Lento (-3m na velocidade)
			return Math.max(1, this.wrapped.movementSpeedBase - 3);
		}
		return this.wrapped.movementSpeedBase;
	}

	public override get initiativeBase(): number {
		const state = this.encumbranceState;
		if (state === "encumbered" || state === "overloaded") {
			// -2 na Iniciativa por estar sobrecarregado
			return Math.max(0, this.wrapped.initiativeBase - 2);
		}
		return this.wrapped.initiativeBase;
	}
}

/**
 * 🧅 DECORADOR CONCRETO 5: Faminto (HungryDecorator)
 * Condição severa por falta de nutrientes no descanso do acampamento.
 * Reduz: physical -1, mental -1, impede cura natural.
 */
export class HungryDecorator extends StatusEffectDecorator {
	public override get physical(): number {
		return Math.max(0, this.wrapped.physical - 1);
	}

	public override get mental(): number {
		return Math.max(0, this.wrapped.mental - 1);
	}

	public override get allowsNaturalRecovery(): boolean {
		return false;
	}
}

/**
 * 🧅 DECORADOR CONCRETO 6: Exausto (ExhaustedDecorator)
 * Condição de exaustão física e mental temporária após fuga de combate sob estresse.
 * Reduz: physical -1, mental -1, social -1.
 */
export class ExhaustedDecorator extends StatusEffectDecorator {
	public override get physical(): number {
		return Math.max(0, this.wrapped.physical - 1);
	}

	public override get mental(): number {
		return Math.max(0, this.wrapped.mental - 1);
	}

	public override get social(): number {
		return Math.max(0, this.wrapped.social - 1);
	}
}

/**
 * 🧅 DECORADOR CONCRETO 7: Sangramento (BleedingDecorator)
 * Condição de ferimento com perda contínua de sangue.
 * Reduz: physical -1, impede cura natural.
 */
export class BleedingDecorator extends StatusEffectDecorator {
	public override get physical(): number {
		return Math.max(0, this.wrapped.physical - 1);
	}

	public override get allowsNaturalRecovery(): boolean {
		return false;
	}
}

/**
 * 🧅 DECORADOR CONCRETO 8: Silenciado (SilencedDecorator)
 * Condição mística ou química que impede a fala e a conjuração mágica.
 * Reduz: mental -1, interaction -1.
 */
export class SilencedDecorator extends StatusEffectDecorator {
	public override get mental(): number {
		return Math.max(0, this.wrapped.mental - 1);
	}

	public override get interaction(): number {
		return Math.max(0, this.wrapped.interaction - 1);
	}
}

/**
 * 🧅 DECORADOR CONCRETO 9: Imobilizado (ImmobilizedDecorator)
 * Condição física extrema provocada por presas ou garras que impede locomoção.
 * Reduz: movementSpeedBase para 0, conflict -2, e initiativeBase -2.
 */
export class ImmobilizedDecorator extends StatusEffectDecorator {
	public override get movementSpeedBase(): number {
		return 0;
	}

	public override get conflict(): number {
		return Math.max(0, this.wrapped.conflict - 2);
	}

	public override get initiativeBase(): number {
		return Math.max(0, super.initiativeBase - 2);
	}
}
