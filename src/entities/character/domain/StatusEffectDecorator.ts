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

	// Regra de RPG: Carga = Físico + Resistência + 6
	public get carrySlotLimit(): number {
		return this.physical + this.resistance + 6;
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

	public get carrySlotLimit(): number {
		return this.physical + this.resistance + 6;
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
