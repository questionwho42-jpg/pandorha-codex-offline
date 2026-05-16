/**
 * Interface comum para cálculos de recuperação no acampamento.
 */
export interface ICampRecovery {
	calculate(baseAmount: number): number;
}

/**
 * Componente Concreto: Recuperação Padrão (100% do valor base).
 */
export class StandardRecovery implements ICampRecovery {
	calculate(baseAmount: number): number {
		return baseAmount;
	}
}

/**
 * Decorador Base: Mantém uma referência ao componente embrulhado.
 */
export abstract class RecoveryDecorator implements ICampRecovery {
	constructor(protected decoratedRecovery: ICampRecovery) {}

	calculate(baseAmount: number): number {
		return this.decoratedRecovery.calculate(baseAmount);
	}
}

/**
 * Decorador Concreto: Banquete Revigorante.
 * Adiciona 25% de bônus à recuperação final.
 */
export class BanqueteDecorator extends RecoveryDecorator {
	override calculate(baseAmount: number): number {
		const amount = super.calculate(baseAmount);
		return amount * 1.25;
	}
}

/**
 * Decorador Concreto: Abrigo Térmico.
 * Garante que a recuperação não seja reduzida por frio (anula penalidade se houver).
 * Para simplificar o exemplo, vamos apenas adicionar um bônus flat de +5 PV/EE.
 */
export class AbrigoTermicoDecorator extends RecoveryDecorator {
	override calculate(baseAmount: number): number {
		const amount = super.calculate(baseAmount);
		return amount + 5;
	}
}
