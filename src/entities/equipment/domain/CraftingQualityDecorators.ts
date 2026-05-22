/**
 * ============================================================================
 * PANDORHA ENGINE - DECORATOR MANIFESTO (CRAFTING QUALITY DECORATORS)
 * ============================================================================
 *
 * 🗣️ MODO PROFESSOR (EXPLICAÇÃO DIDÁTICA DA ARQUITETURA):
 *
 * 🤔 POR QUE A HERANÇA FALHARIA NESTE CENÁRIO?
 * Se tentássemos utilizar herança de classes para modelar as qualidades superiores dos
 * itens forjados (Afiado, Reforçado, Rúnico), cairíamos no clássico problema da
 * "EXPLOSÃO DE CLASSES".
 * Imagine que o jogador crie uma espada que é apenas "Afiada". Precisamos da classe "SharpWeapon".
 * E se for "Afiada e Reforçada"? Precisamos de "SharpReinforcedWeapon".
 * E se for "Afiada, Reforçada e Rúnica"? Precisamos de "SharpReinforcedRunicWeapon".
 * Para apenas 3 qualidades combináveis, precisaríamos de 8 combinações de classes para CADA item.
 * Se tivermos 20 tipos de armas no catálogo, teríamos 160 classes apenas para lidar com isso!
 *
 * 💡 SOLUÇÃO: PADRÃO DECORATOR (COMPOSIÇÃO SOBRE HERANÇA)
 * O padrão Decorator permite adicionar comportamentos a um objeto individual, dinamicamente,
 * sem afetar o comportamento de outros objetos da mesma classe. Nós criamos um objeto base
 * simples e o "embrulhamos" (wrap) com cascas de comportamento extra.
 *
 * 🧅 O "EFEITO CEBOLA" (CALL STACK RECURSIVO):
 * Ao chamar o método getSlotCost() na camada externa:
 * 1. O Decorador Externo (ex: Reinforced) recebe a chamada.
 * 2. Ele repassa (delega) a chamada para o Decorador Interno (ex: Sharp).
 * 3. O Decorador Interno delega ao item concreto base (BaseCraftedEquipment).
 * 4. A resposta retorna do centro da cebola: a base diz que custa 2 slots.
 * 5. O decorador Sharp apenas repassa o valor 2.
 * 6. O decorador Reinforced intercepta o valor 2 e subtrai 1, retornando o valor final de 1 slot!
 */

export interface ICraftedEquipment {
	readonly id: string;
	readonly label: string;
	readonly kind: "weapon" | "armor" | "shield";
	readonly slotCost: number;
	readonly priceCopper: number;
	readonly durabilityCurrent: number;
	readonly durabilityMax: number;
	readonly mechanicalSummary: string;
	readonly baseRuneSlots: number;

	getDamageBonus(): number;
	getCriticalMarginBonus(): number;
	getDefenseBonus(): number;
	getRuneSlotsCount(): number;
	getSlotCost(): number;
}

// 1. Componente Concreto Base
export class BaseCraftedEquipment implements ICraftedEquipment {
	public readonly id: string;
	public readonly label: string;
	public readonly kind: "weapon" | "armor" | "shield";
	public readonly slotCost: number;
	public readonly priceCopper: number;
	public readonly durabilityCurrent: number;
	public readonly durabilityMax: number;
	public readonly mechanicalSummary: string;
	public readonly baseRuneSlots: number;

	public constructor(input: {
		readonly id: string;
		readonly label: string;
		readonly kind: "weapon" | "armor" | "shield";
		readonly slotCost: number;
		readonly priceCopper: number;
		readonly durabilityCurrent: number;
		readonly durabilityMax: number;
		readonly mechanicalSummary: string;
		readonly runeSlots: number;
	}) {
		this.id = input.id;
		this.label = input.label;
		this.kind = input.kind;
		this.slotCost = input.slotCost;
		this.priceCopper = input.priceCopper;
		this.durabilityCurrent = input.durabilityCurrent;
		this.durabilityMax = input.durabilityMax;
		this.mechanicalSummary = input.mechanicalSummary;
		this.baseRuneSlots = input.runeSlots;
	}

	public getDamageBonus(): number {
		return 0;
	}

	public getCriticalMarginBonus(): number {
		return 0;
	}

	public getDefenseBonus(): number {
		return 0;
	}

	public getRuneSlotsCount(): number {
		return this.baseRuneSlots;
	}

	public getSlotCost(): number {
		return this.slotCost;
	}
}

// 2. Decorador Abstrato Base
export abstract class CraftedEquipmentDecorator implements ICraftedEquipment {
	protected readonly wrapped: ICraftedEquipment;

	public constructor(wrapped: ICraftedEquipment) {
		this.wrapped = wrapped;
	}

	public get id(): string {
		return this.wrapped.id;
	}

	public get label(): string {
		return this.wrapped.label;
	}

	public get kind(): "weapon" | "armor" | "shield" {
		return this.wrapped.kind;
	}

	public get slotCost(): number {
		return this.wrapped.slotCost;
	}

	public get priceCopper(): number {
		return this.wrapped.priceCopper;
	}

	public get durabilityCurrent(): number {
		return this.wrapped.durabilityCurrent;
	}

	public get durabilityMax(): number {
		return this.wrapped.durabilityMax;
	}

	public get mechanicalSummary(): string {
		return this.wrapped.mechanicalSummary;
	}

	public get baseRuneSlots(): number {
		return this.wrapped.baseRuneSlots;
	}

	public getDamageBonus(): number {
		return this.wrapped.getDamageBonus();
	}

	public getCriticalMarginBonus(): number {
		return this.wrapped.getCriticalMarginBonus();
	}

	public getDefenseBonus(): number {
		return this.wrapped.getDefenseBonus();
	}

	public getRuneSlotsCount(): number {
		return this.wrapped.getRuneSlotsCount();
	}

	public getSlotCost(): number {
		return this.wrapped.getSlotCost();
	}
}

// 3. Decorador Concreto: Qualidade Afiada (Sharp)
// Bônus: +1 de Dano Físico e +2 de Margem Crítica a armas.
export class SharpEquipmentDecorator extends CraftedEquipmentDecorator {
	public override get label(): string {
		if (
			this.wrapped.label.includes("Afiada") ||
			this.wrapped.label.includes("Afiado")
		) {
			return this.wrapped.label;
		}
		const suffix = this.wrapped.kind === "weapon" ? "Afiada" : "Afiado";
		return `${this.wrapped.label} ${suffix}`;
	}

	public override getDamageBonus(): number {
		const baseBonus = this.wrapped.getDamageBonus();
		return this.wrapped.kind === "weapon" ? baseBonus + 1 : baseBonus;
	}

	public override getCriticalMarginBonus(): number {
		const baseBonus = this.wrapped.getCriticalMarginBonus();
		return this.wrapped.kind === "weapon" ? baseBonus + 2 : baseBonus;
	}
}

// 4. Decorador Concreto: Qualidade Reforçada (Reinforced)
// Bônus: Reduz peso em inventário em 1 slot (mínimo de 1) ou concede +1 de Defesa Física a armaduras/escudos.
export class ReinforcedEquipmentDecorator extends CraftedEquipmentDecorator {
	public override get label(): string {
		if (
			this.wrapped.label.includes("Reforçada") ||
			this.wrapped.label.includes("Reforçado")
		) {
			return this.wrapped.label;
		}
		const suffix = this.wrapped.kind === "weapon" ? "Reforçado" : "Reforçada";
		return `${this.wrapped.label} ${suffix}`;
	}

	public override getSlotCost(): number {
		const baseCost = this.wrapped.getSlotCost();
		return Math.max(1, baseCost - 1);
	}

	public override getDefenseBonus(): number {
		const baseBonus = this.wrapped.getDefenseBonus();
		const isProtective =
			this.wrapped.kind === "armor" || this.wrapped.kind === "shield";
		return isProtective ? baseBonus + 1 : baseBonus;
	}
}

// 5. Decorador Concreto: Qualidade Rúnica (Runic)
// Bônus: Concede 1 slot de runa adicional para infusões mágicas.
export class RunicEquipmentDecorator extends CraftedEquipmentDecorator {
	public override get label(): string {
		if (
			this.wrapped.label.includes("Rúnica") ||
			this.wrapped.label.includes("Rúnico")
		) {
			return this.wrapped.label;
		}
		const suffix = this.wrapped.kind === "weapon" ? "Rúnica" : "Rúnico";
		return `${this.wrapped.label} ${suffix}`;
	}

	public override getRuneSlotsCount(): number {
		return this.wrapped.getRuneSlotsCount() + 1;
	}
}
