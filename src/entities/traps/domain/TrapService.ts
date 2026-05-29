import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { TrapRecord } from "../model/trapSchema";
import {
	BaseTrapEffect,
	BleedingTrapDecorator,
	EterFeverTrapDecorator,
	ImmobilizedTrapDecorator,
	type ITrapEffect,
	NoisyRuneTrapDecorator,
	PoisonedTrapDecorator,
	SilencedTrapDecorator,
	type TrapDowntimeCharacterService,
	type TrapResolution,
	WoundInfectionTrapDecorator,
} from "./TrapDecorators";

export class TrapService {
	public getTrapDC(trap: TrapRecord): number {
		let severityBonus = 1;
		if (trap.severity === "hidden") {
			severityBonus = 3;
		} else if (trap.severity === "deadly") {
			severityBonus = 5;
		}
		return 10 + trap.dc + severityBonus;
	}

	public detectTrap(
		character: CharacterRecord,
		trap: TrapRecord,
		roll: number,
	): Result<{ isDetected: boolean; log: string }, Error> {
		if (roll < 1 || roll > 20) {
			return fail(
				new Error("O resultado do dado (d20) deve estar entre 1 e 20."),
			);
		}

		if (roll === 1) {
			return ok({
				isDetected: false,
				log: `[Vigília] Falha Crítica (1) de ${character.name}! O herói pisou no gatilho da armadilha sem perceber!`,
			});
		}

		const dc = this.getTrapDC(trap);
		// Vigília = d20 + Nível + Mental + Interação
		const total =
			roll + character.level + character.mental + character.interaction;
		const isDetected = total >= dc;

		const log = isDetected
			? `[Vigília] Sucesso (${total} vs DC ${dc}) de ${character.name}! A armadilha "${trap.name}" foi avistada a tempo!`
			: `[Vigília] Falha (${total} vs DC ${dc}) de ${character.name}! A armadilha "${trap.name}" passou despercebida!`;

		return ok({ isDetected, log });
	}

	public async disarmTrap(
		character: CharacterRecord,
		trap: TrapRecord,
		roll: number,
		isTrained: boolean,
		characterService: TrapDowntimeCharacterService,
	): Promise<
		Result<
			{
				isDisarmed: boolean;
				gatheredComponents: boolean;
				damageTaken: number;
				effects: { type: string; severity: number }[];
				log: string;
				tensionIncreased?: number;
			},
			Error
		>
	> {
		if (roll < 1 || roll > 20) {
			return fail(
				new Error("O resultado do dado (d20) deve estar entre 1 e 20."),
			);
		}

		const dc = this.getTrapDC(trap);
		const attributeBonus =
			trap.type === "magical" ? character.mental : character.physical;
		const trainingPenalty = isTrained ? 0 : -4;

		// Desarme Tático = d20 + Nível + Atributo + Interação + Penalidade se destreinado
		const total =
			roll +
			character.level +
			attributeBonus +
			character.interaction +
			trainingPenalty;

		if (roll === 20 || total >= dc + 10) {
			return ok({
				isDisarmed: true,
				gatheredComponents: true,
				damageTaken: 0,
				effects: [],
				log: `[Desarme] Sucesso Crítico (${total} vs DC ${dc}) de ${character.name}! A armadilha "${trap.name}" foi completamente neutralizada e seus componentes foram recolhidos para a forja!`,
			});
		}

		if (total >= dc) {
			return ok({
				isDisarmed: true,
				gatheredComponents: false,
				damageTaken: 0,
				effects: [],
				log: `[Desarme] Sucesso (${total} vs DC ${dc}) de ${character.name}! A armadilha "${trap.name}" foi desarmada com segurança.`,
			});
		}

		if (roll !== 1 && total >= dc - 4) {
			const damage = Math.floor(trap.damage / 2);
			return ok({
				isDisarmed: false,
				gatheredComponents: false,
				damageTaken: damage,
				effects: [],
				log: `[Desarme] Sucesso com Custo (${total} vs DC ${dc}) de ${character.name}! A armadilha disparou de raspão, causando apenas ${damage} de dano físico (metade) e sem efeitos de status adicionais.`,
			});
		}

		// Falha feia
		const triggerResult = await this.resolveTriggeredTrap(
			character,
			trap,
			1, // Força falha no teste de resistência do disparo, pois o desarme falhou feio
			characterService,
		);

		if (!triggerResult.success) {
			return fail(triggerResult.error);
		}

		const finalResult: {
			isDisarmed: boolean;
			gatheredComponents: boolean;
			damageTaken: number;
			effects: { type: string; severity: number }[];
			log: string;
			tensionIncreased?: number;
		} = {
			isDisarmed: false,
			gatheredComponents: false,
			damageTaken: triggerResult.data.damageTaken,
			effects: triggerResult.data.appliedEffects,
			log: `[Desarme] Falha Feia (${total} vs DC ${dc}) de ${character.name}! A armadilha disparou com força total! ${triggerResult.data.log}`,
		};

		if (triggerResult.data.tensionIncreased !== undefined) {
			finalResult.tensionIncreased = triggerResult.data.tensionIncreased;
		}

		return ok(finalResult);
	}

	public async resolveTriggeredTrap(
		character: CharacterRecord,
		trap: TrapRecord,
		roll: number,
		characterService: TrapDowntimeCharacterService,
	): Promise<Result<TrapResolution, Error>> {
		if (roll < 1 || roll > 20) {
			return fail(
				new Error("O resultado do dado (d20) deve estar entre 1 e 20."),
			);
		}

		const dc = this.getTrapDC(trap);
		// Evasão/Resistência: d20 + Nível + (se mágica: resistência, se mecânica: conflito/esquiva)
		const attributeBonus =
			trap.type === "magical" ? character.resistance : character.conflict;
		const total = roll + character.level + attributeBonus;

		const isSaved = total >= dc && roll !== 1;

		if (isSaved) {
			const damage = Math.floor(trap.damage / 2);
			return ok({
				characterId: character.id,
				damageTaken: damage,
				appliedEffects: [],
				log: `[Sobrevivência] Sucesso (${total} vs DC ${dc})! ${character.name} esquivou-se/resistiu parcialmente, sofrendo ${damage} de dano (metade) e evitando condições de status.`,
			});
		}

		// Falha: sofre dano total e aplica decoradores de status de forma aninhada (efeito cebola)
		let effectPipeline: ITrapEffect = new BaseTrapEffect();
		const parsedEffects = JSON.parse(trap.effects || "[]") as string[];

		for (const effectType of parsedEffects) {
			if (effectType === "viper_poison") {
				effectPipeline = new PoisonedTrapDecorator(effectPipeline);
			} else if (effectType === "eter_fever") {
				effectPipeline = new EterFeverTrapDecorator(effectPipeline);
			} else if (effectType === "wound_infection") {
				effectPipeline = new WoundInfectionTrapDecorator(effectPipeline);
			} else if (effectType === "bleeding") {
				effectPipeline = new BleedingTrapDecorator(effectPipeline);
			} else if (effectType === "silenced") {
				effectPipeline = new SilencedTrapDecorator(effectPipeline);
			} else if (effectType === "immobilized") {
				effectPipeline = new ImmobilizedTrapDecorator(effectPipeline);
			} else if (effectType === "noisy_rune") {
				effectPipeline = new NoisyRuneTrapDecorator(effectPipeline);
			}
		}

		const resolution = await effectPipeline.applyEffect(
			character.id,
			trap.damage,
			characterService,
		);

		if (!resolution.success) {
			return fail(resolution.error);
		}

		return ok({
			...resolution.data,
			log: `[Sobrevivência] Falha (${total} vs DC ${dc})! ${character.name} foi atingido em cheio! ${resolution.data.log}`,
		});
	}
}
