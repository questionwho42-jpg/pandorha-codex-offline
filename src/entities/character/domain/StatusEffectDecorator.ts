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
	readonly maxEe: number;
	readonly initiativeBase: number;
	readonly carrySlotLimit: number;
	readonly movementSpeedBase: number;
	readonly armorClass: number;
	readonly stealthPenalty: number;

	// Logística de Carga
	readonly currentCarryWeight: number;
	readonly encumbranceState: "light" | "encumbered" | "overloaded";

	// Flags de Sobrevivência
	readonly allowsNaturalRecovery: boolean;

	// Novas propriedades de Combate, Ultimates e 0 HP
	readonly size: "medium" | "large";
	readonly weaponDamageBonus: number;
	readonly extraActions: number;
	readonly attackBonus: number;
	readonly ignoresDifficultTerrain: boolean;
	readonly automaticDefenseFailure: boolean;
	readonly hasLatentDiscoordination: boolean;
	readonly latentDiscoordinationAxis: string | null;
	readonly latentDiscoordinationTestsLeft: number;
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

	public get maxEe(): number {
		return this.level + this.mental;
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

	// Regra de RPG: CA base sem armadura = 10 + Nível + Físico
	public get armorClass(): number {
		return 10 + this.level + this.physical;
	}

	public get stealthPenalty(): number {
		return 0;
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

	public get size(): "medium" | "large" {
		return "medium";
	}

	public get weaponDamageBonus(): number {
		return 0;
	}

	public get extraActions(): number {
		return 0;
	}

	public get attackBonus(): number {
		return 0;
	}

	public get ignoresDifficultTerrain(): boolean {
		return false;
	}

	public get automaticDefenseFailure(): boolean {
		return false;
	}

	public get hasLatentDiscoordination(): boolean {
		return false;
	}

	public get latentDiscoordinationAxis(): string | null {
		return null;
	}

	public get latentDiscoordinationTestsLeft(): number {
		return 0;
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

	// Reatividade Cebola: usa as propriedades do decorador (this) em vez do embrulhado (wrapped), somando os ajustes customizados do wrapped
	public get maxHp(): number {
		const baseFromAttributes =
			(this.classBaseHp + this.physical + this.resistance) * this.level;
		const wrappedFromAttributes =
			(this.wrapped.classBaseHp +
				this.wrapped.physical +
				this.wrapped.resistance) *
			this.wrapped.level;
		const adjustment = this.wrapped.maxHp - wrappedFromAttributes;
		return baseFromAttributes + adjustment;
	}

	public get maxEe(): number {
		const baseFromAttributes = this.level + this.mental;
		const wrappedFromAttributes = this.wrapped.level + this.wrapped.mental;
		const adjustment = this.wrapped.maxEe - wrappedFromAttributes;
		return baseFromAttributes + adjustment;
	}

	public get initiativeBase(): number {
		const baseFromAttributes = this.level + this.mental + this.interaction;
		const wrappedFromAttributes =
			this.wrapped.level + this.wrapped.mental + this.wrapped.interaction;
		const adjustment = this.wrapped.initiativeBase - wrappedFromAttributes;
		return baseFromAttributes + adjustment;
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

	public get armorClass(): number {
		return this.wrapped.armorClass;
	}

	public get stealthPenalty(): number {
		return this.wrapped.stealthPenalty;
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

	public get size(): "medium" | "large" {
		return this.wrapped.size;
	}

	public get weaponDamageBonus(): number {
		return this.wrapped.weaponDamageBonus;
	}

	public get extraActions(): number {
		return this.wrapped.extraActions;
	}

	public get attackBonus(): number {
		return this.wrapped.attackBonus;
	}

	public get ignoresDifficultTerrain(): boolean {
		return this.wrapped.ignoresDifficultTerrain;
	}

	public get automaticDefenseFailure(): boolean {
		return this.wrapped.automaticDefenseFailure;
	}

	public get hasLatentDiscoordination(): boolean {
		return this.wrapped.hasLatentDiscoordination;
	}

	public get latentDiscoordinationAxis(): string | null {
		return this.wrapped.latentDiscoordinationAxis;
	}

	public get latentDiscoordinationTestsLeft(): number {
		return this.wrapped.latentDiscoordinationTestsLeft;
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

/**
 * 🧅 DECORADOR CONCRETO 10: Inconsciente (UnconsciousDecorator)
 * Condição de inconsciência que incapacita o personagem.
 * Reduz: extraActions e velocidade para 0, e força falha automática em testes de defesa.
 */
export class UnconsciousDecorator extends StatusEffectDecorator {
	public override get extraActions(): number {
		return 0;
	}

	public override get movementSpeedBase(): number {
		return 0;
	}

	public override get automaticDefenseFailure(): boolean {
		return true;
	}
}

/**
 * 🧅 DECORADOR CONCRETO 11: Moribundo (MoribundDecorator)
 * Condição crítica de 0 HP onde testes de morte são exigidos.
 * Especializa o comportamento inconsciente.
 */
export class MoribundDecorator extends UnconsciousDecorator {}

/**
 * 🧅 DECORADOR CONCRETO: Avatar da Guerra (AvatarGuerraDecorator)
 * Ultimate de Vanguarda: Aumenta o tamanho, concede HP temporário (+20) e adiciona +2 no dano com armas.
 */
export class AvatarGuerraDecorator extends StatusEffectDecorator {
	public override get size(): "medium" | "large" {
		return "large";
	}

	public override get maxHp(): number {
		return this.wrapped.maxHp + 20;
	}

	public override get weaponDamageBonus(): number {
		return this.wrapped.weaponDamageBonus + 2;
	}
}

/**
 * 🧅 DECORADOR CONCRETO: Surto de Tempo (SurtoTempoDecorator)
 * Ultimate de Tecelão: +1 ação extra por turno, +2 em Resistência Física (eixo physical).
 */
export class SurtoTempoDecorator extends StatusEffectDecorator {
	public override get extraActions(): number {
		return this.wrapped.extraActions + 1;
	}

	public override get physical(): number {
		return this.wrapped.physical + 2;
	}
}

/**
 * 🧅 DECORADOR CONCRETO: Caçada Selvagem (CacadaSelvagemDecorator)
 * Ultimate de Caçador: +5 de bônus no ataque, ignora terreno difícil.
 */
export class CacadaSelvagemDecorator extends StatusEffectDecorator {
	public override get attackBonus(): number {
		return this.wrapped.attackBonus + 5;
	}

	public override get ignoresDifficultTerrain(): boolean {
		return true;
	}
}

/**
 * 🧅 DECORADOR CONCRETO: Rede de Intrigas (RedeIntrigasDecorator)
 * Ultimate de Emissário: Foco narrativo.
 */
export class RedeIntrigasDecorator extends StatusEffectDecorator {}

/**
 * 🧅 DECORADOR CONCRETO: Descoordenação Latente (LatentDiscoordinationDecorator)
 * Status temporário aplicado após Recondicionamento de Eixo.
 * Gera desvantagem nas primeiras 3 rolagens táticas sob perigo usando a manobra do novo eixo.
 */
export class LatentDiscoordinationDecorator extends StatusEffectDecorator {
	public constructor(
		wrapped: ICharacterStats,
		private readonly axis: string,
		private readonly tests: number,
	) {
		super(wrapped);
	}

	public override get hasLatentDiscoordination(): boolean {
		return true;
	}

	public override get latentDiscoordinationAxis(): string | null {
		return this.axis;
	}

	public override get latentDiscoordinationTestsLeft(): number {
		return this.tests;
	}
}

/**
 * 🧅 DECORADOR CONCRETO: Fôlego Extra (ExtraBreathDecorator)
 * Talento Tático de Vanguarda: Concede +2 de Resistência (eixo resistance) e +1 de Físico (eixo physical).
 */
export class ExtraBreathDecorator extends StatusEffectDecorator {
	public override get resistance(): number {
		return this.wrapped.resistance + 2;
	}

	public override get physical(): number {
		return this.wrapped.physical + 1;
	}
}

/**
 * 🧅 DECORADOR CONCRETO: Dobrar Tempo (DoubleTimeDecorator)
 * Talento Tático de Tecelão: Concede +1 Ação Adicional (extraActions).
 */
export class DoubleTimeDecorator extends StatusEffectDecorator {
	public override get extraActions(): number {
		return this.wrapped.extraActions + 1;
	}
}

/**
 * 🧅 DECORADOR CONCRETO: Fadiga Corporal (BodyFatigueDecorator)
 * Primeiro nível da Cascata de Exaustão.
 * (A desvantagem física é resolvida dinamicamente nas rolagens).
 */
export class BodyFatigueDecorator extends StatusEffectDecorator {}

/**
 * 🧅 DECORADOR CONCRETO: Neblina Mental (MentalFogDecorator)
 * Segundo nível da Cascata de Exaustão.
 */
export class MentalFogDecorator extends StatusEffectDecorator {}

/**
 * 🧅 DECORADOR CONCRETO: Ruína Espiritual (SpiritRuinDecorator)
 * Terceiro nível da Cascata de Exaustão.
 */
export class SpiritRuinDecorator extends StatusEffectDecorator {}

/**
 * 🧅 DECORADOR CONCRETO: Colapso Celular (CellularCollapseDecorator)
 * Quarto nível da Cascata de Exaustão.
 * Corta HP e EE máximo pela metade e reduz o deslocamento tático a 50%.
 */
export class CellularCollapseDecorator extends StatusEffectDecorator {
	public override get maxHp(): number {
		return Math.floor(super.maxHp * 0.5);
	}

	public override get maxEe(): number {
		return Math.floor(super.maxEe * 0.5);
	}

	public override get movementSpeedBase(): number {
		return Math.max(1, Math.floor(super.movementSpeedBase * 0.5));
	}
}

/**
 * 🧅 HELPER: Aplica todos os efeitos de status e ultimates ativos recursivamente
 */
export function applyStatusEffects(
	baseStats: ICharacterStats,
	effects: readonly {
		readonly type: string;
		readonly metadata?: string | null;
		readonly severity?: number;
	}[],
): ICharacterStats {
	let decorated = baseStats;
	for (const effect of effects) {
		switch (effect.type) {
			case "eter_fever":
				decorated = new EterFeverDecorator(decorated);
				break;
			case "wound_infection":
				decorated = new WoundInfectionDecorator(decorated);
				break;
			case "viper_poison":
				decorated = new ViperPoisonDecorator(decorated);
				break;
			case "hungry":
				decorated = new HungryDecorator(decorated);
				break;
			case "exhausted":
				decorated = new ExhaustedDecorator(decorated);
				break;
			case "bleeding":
				decorated = new BleedingDecorator(decorated);
				break;
			case "silenced":
				decorated = new SilencedDecorator(decorated);
				break;
			case "immobilized":
				decorated = new ImmobilizedDecorator(decorated);
				break;
			case "unconscious":
				decorated = new UnconsciousDecorator(decorated);
				break;
			case "moribund":
				decorated = new MoribundDecorator(decorated);
				break;
			case "avatar_guerra":
				decorated = new AvatarGuerraDecorator(decorated);
				break;
			case "surto_tempo":
				decorated = new SurtoTempoDecorator(decorated);
				break;
			case "cacada_selvagem":
				decorated = new CacadaSelvagemDecorator(decorated);
				break;
			case "rede_intrigas":
				decorated = new RedeIntrigasDecorator(decorated);
				break;
			case "extra_breath":
				decorated = new ExtraBreathDecorator(decorated);
				break;
			case "double_time":
				decorated = new DoubleTimeDecorator(decorated);
				break;
			case "body_fatigue":
				decorated = new BodyFatigueDecorator(decorated);
				break;
			case "mental_fog":
				decorated = new MentalFogDecorator(decorated);
				break;
			case "spirit_ruin":
				decorated = new SpiritRuinDecorator(decorated);
				break;
			case "cellular_collapse":
				decorated = new CellularCollapseDecorator(decorated);
				break;
			case "latent_discoordination": {
				const axis = effect.metadata || "physical";
				const severity = effect.severity ?? 3;
				decorated = new LatentDiscoordinationDecorator(
					decorated,
					axis,
					severity,
				);
				break;
			}
		}
	}
	return decorated;
}
