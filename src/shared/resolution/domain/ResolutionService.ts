import type { DiceService } from "$lib/shared/dice";
import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	formatResolutionIssues,
	globalTestInputSchema,
} from "../model/resolutionSchemas";
import type {
	GlobalTestInput,
	ResolutionDegree,
	ResolutionFailure,
	ResolutionResult,
} from "../model/resolutionTypes";

/**
 * @rule docs/system/survival/00-mecanicas-fundamentais.md - Teste Global: d20 + Nivel + Eixo + Aplicacao + Bonus de Item
 * @rule docs/system/survival/glossario-definitivo-de-testes.md - 20 natural garante acerto, mas critico exige margem +10
 */
export class ResolutionService {
	public constructor(private readonly diceService: DiceService) {}

	public resolveGlobalTest(
		input: unknown,
	): Result<ResolutionResult, ResolutionFailure> {
		const parsed = globalTestInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_RESOLUTION_INPUT",
				message: "Global test input failed validation.",
				details: { issues: formatResolutionIssues(parsed.error.issues) },
			});
		}

		const diceRoll = this.diceService.rollD20({ reason: parsed.data.reason });
		if (!diceRoll.success) {
			return fail({
				code: "DICE_ROLL_FAILED",
				message: "Dice service failed while resolving the global test.",
				details: { diceFailureCode: diceRoll.error.code },
				cause: diceRoll.error,
			});
		}

		const total = calculateTotal(parsed.data, diceRoll.data.naturalRoll);
		const margin = total - parsed.data.dc;
		const isNaturalSuccess =
			diceRoll.data.naturalRoll === PANDORHA_RULES.DICE.NATURAL_CRITICAL;

		return ok({
			degree: resolveDegree({
				margin,
				isNaturalSuccess,
				isNaturalFailure: diceRoll.data.isNaturalFailure,
			}),
			total,
			margin,
			dc: parsed.data.dc,
			level: parsed.data.level,
			axisValue: parsed.data.axisValue,
			applicationValue: parsed.data.applicationValue,
			itemBonus: parsed.data.itemBonus,
			isNaturalSuccess,
			isNaturalFailure: diceRoll.data.isNaturalFailure,
			dice: diceRoll.data,
			breakdown: {
				naturalRoll: diceRoll.data.naturalRoll,
				level: parsed.data.level,
				axisValue: parsed.data.axisValue,
				applicationValue: parsed.data.applicationValue,
				itemBonus: parsed.data.itemBonus,
			},
		});
	}
}

function calculateTotal(input: GlobalTestInput, naturalRoll: number): number {
	return (
		naturalRoll +
		input.level +
		input.axisValue +
		input.applicationValue +
		input.itemBonus
	);
}

function resolveDegree(input: {
	readonly margin: number;
	readonly isNaturalSuccess: boolean;
	readonly isNaturalFailure: boolean;
}): ResolutionDegree {
	if (input.isNaturalFailure) {
		return "failure";
	}

	if (input.margin >= PANDORHA_RULES.UNIVERSAL_TESTS.CRITICAL_MARGIN) {
		return "criticalSuccess";
	}

	if (input.margin >= 0 || input.isNaturalSuccess) {
		return "success";
	}

	if (
		input.margin >= -PANDORHA_RULES.UNIVERSAL_TESTS.SUCCESS_WITH_COST_MARGIN
	) {
		return "successWithCost";
	}

	return "failure";
}
