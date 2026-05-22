import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export interface TrapResolution {
	characterId: string;
	damageTaken: number;
	appliedEffects: { type: string; severity: number }[];
	log: string;
}

export interface TrapDowntimeCharacterService {
	saveStatusEffect(effect: {
		characterId: string;
		type: string;
		severity: number;
		severityMax: number;
		isAggravated: boolean;
	}): Promise<Result<CharacterStatusEffectRecord, unknown>>;
}

export interface ITrapEffect {
	applyEffect(
		characterId: string,
		baseDamage: number,
		characterService: TrapDowntimeCharacterService,
	): Promise<Result<TrapResolution, Error>>;
}

export class BaseTrapEffect implements ITrapEffect {
	public async applyEffect(
		characterId: string,
		baseDamage: number,
		_characterService: TrapDowntimeCharacterService,
	): Promise<Result<TrapResolution, Error>> {
		return ok({
			characterId,
			damageTaken: baseDamage,
			appliedEffects: [],
			log: `O herói sofreu ${baseDamage} de dano físico base.`,
		});
	}
}

export abstract class TrapEffectDecorator implements ITrapEffect {
	public constructor(protected readonly wrapped: ITrapEffect) {}

	public abstract applyEffect(
		characterId: string,
		baseDamage: number,
		characterService: TrapDowntimeCharacterService,
	): Promise<Result<TrapResolution, Error>>;
}

export class PoisonedTrapDecorator extends TrapEffectDecorator {
	public async applyEffect(
		characterId: string,
		baseDamage: number,
		characterService: TrapDowntimeCharacterService,
	): Promise<Result<TrapResolution, Error>> {
		const wrappedRes = await this.wrapped.applyEffect(
			characterId,
			baseDamage,
			characterService,
		);

		if (!wrappedRes.success) {
			return wrappedRes;
		}

		const effectResult = await characterService.saveStatusEffect({
			characterId,
			type: "viper_poison",
			severity: 2,
			severityMax: 4,
			isAggravated: false,
		});

		if (!effectResult.success) {
			return fail(
				new Error(
					"Falha ao aplicar Veneno de Víbora no herói ferido pela armadilha.",
				),
			);
		}

		return ok({
			...wrappedRes.data,
			appliedEffects: [
				...wrappedRes.data.appliedEffects,
				{ type: "viper_poison", severity: 2 },
			],
			log: `${wrappedRes.data.log} Além disso, uma agulha injetou Veneno de Víbora (Severidade 2)!`,
		});
	}
}

export class EterFeverTrapDecorator extends TrapEffectDecorator {
	public async applyEffect(
		characterId: string,
		baseDamage: number,
		characterService: TrapDowntimeCharacterService,
	): Promise<Result<TrapResolution, Error>> {
		const wrappedRes = await this.wrapped.applyEffect(
			characterId,
			baseDamage,
			characterService,
		);

		if (!wrappedRes.success) {
			return wrappedRes;
		}

		const effectResult = await characterService.saveStatusEffect({
			characterId,
			type: "eter_fever",
			severity: 2,
			severityMax: 4,
			isAggravated: false,
		});

		if (!effectResult.success) {
			return fail(
				new Error(
					"Falha ao aplicar Febre de Éter no herói ferido pela armadilha.",
				),
			);
		}

		return ok({
			...wrappedRes.data,
			appliedEffects: [
				...wrappedRes.data.appliedEffects,
				{ type: "eter_fever", severity: 2 },
			],
			log: `${wrappedRes.data.log} Além disso, emanações provocaram Febre de Éter (Severidade 2)!`,
		});
	}
}

export class WoundInfectionTrapDecorator extends TrapEffectDecorator {
	public async applyEffect(
		characterId: string,
		baseDamage: number,
		characterService: TrapDowntimeCharacterService,
	): Promise<Result<TrapResolution, Error>> {
		const wrappedRes = await this.wrapped.applyEffect(
			characterId,
			baseDamage,
			characterService,
		);

		if (!wrappedRes.success) {
			return wrappedRes;
		}

		const effectResult = await characterService.saveStatusEffect({
			characterId,
			type: "wound_infection",
			severity: 2,
			severityMax: 4,
			isAggravated: false,
		});

		if (!effectResult.success) {
			return fail(
				new Error(
					"Falha ao aplicar Infecção de Ferida no herói ferido pela armadilha.",
				),
			);
		}

		return ok({
			...wrappedRes.data,
			appliedEffects: [
				...wrappedRes.data.appliedEffects,
				{ type: "wound_infection", severity: 2 },
			],
			log: `${wrappedRes.data.log} Além disso, detritos na lâmina causaram uma Infecção de Ferida (Severidade 2)!`,
		});
	}
}
