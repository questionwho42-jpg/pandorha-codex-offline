export interface ICraftingDamageProfile {
	readonly baseDamage: number;
	readonly extraModifier: number;
	readonly damageType: string;
	readonly extraMargin: number;
}

export class BaseCraftingDamageProfile implements ICraftingDamageProfile {
	public constructor(
		public readonly baseDamage: number = 4,
		public readonly extraModifier: number = 3,
		public readonly damageType: string = "physical",
		public readonly extraMargin: number = 0,
	) {}
}

export abstract class CraftingDamageDecorator
	implements ICraftingDamageProfile
{
	public constructor(protected readonly wrapped: ICraftingDamageProfile) {}

	public get baseDamage(): number {
		return this.wrapped.baseDamage;
	}

	public get extraModifier(): number {
		return this.wrapped.extraModifier;
	}

	public get damageType(): string {
		return this.wrapped.damageType;
	}

	public get extraMargin(): number {
		return this.wrapped.extraMargin;
	}
}

// Decorador de Arma Afiada: +2 na margem de sucesso e +1 de dano
export class SharpDamageDecorator extends CraftingDamageDecorator {
	public override get extraMargin(): number {
		return this.wrapped.extraMargin + 2;
	}

	public override get extraModifier(): number {
		return this.wrapped.extraModifier + 1;
	}
}

// Decorador de Arma Rúnica: Converte o tipo de dano base para Éter elemental
export class RunedDamageDecorator extends CraftingDamageDecorator {
	public override get damageType(): string {
		return "ether";
	}
}
