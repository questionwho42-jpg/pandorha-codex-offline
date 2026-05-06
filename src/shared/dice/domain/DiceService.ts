import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	diceD20RollInputSchema,
	diceRollInputSchema,
	formatDiceIssues,
} from "../model/diceSchemas";
import type {
	DiceClock,
	DiceFailure,
	DiceRng,
	DiceRollIdProvider,
	DiceRollInput,
	DiceRollResult,
} from "../model/diceTypes";

export class DiceService {
	public constructor(
		private readonly rng: DiceRng,
		private readonly rollIdProvider: DiceRollIdProvider,
		private readonly clock: DiceClock,
	) {}

	public rollD20(input: unknown): Result<DiceRollResult, DiceFailure> {
		const parsed = diceD20RollInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_DICE_REASON",
				message: "Dice roll reason is invalid.",
				details: { issues: formatDiceIssues(parsed.error.issues) },
			});
		}

		return this.rollParsedDie({
			sides: PANDORHA_RULES.DICE.D20_SIDES,
			reason: parsed.data.reason,
		});
	}

	public rollDie(input: unknown): Result<DiceRollResult, DiceFailure> {
		const parsed = diceRollInputSchema.safeParse(input);
		if (!parsed.success) {
			const code = parsed.error.issues.some((issue) =>
				issue.path.includes("sides"),
			)
				? "INVALID_DIE_SIDES"
				: "INVALID_DICE_REASON";

			return fail({
				code,
				message:
					code === "INVALID_DIE_SIDES"
						? "Die sides value is invalid."
						: "Dice roll reason is invalid.",
				details: { issues: formatDiceIssues(parsed.error.issues) },
			});
		}

		return this.rollParsedDie(parsed.data);
	}

	private rollParsedDie(
		input: DiceRollInput,
	): Result<DiceRollResult, DiceFailure> {
		const rngValue = this.rng.next();
		if (!Number.isFinite(rngValue) || rngValue < 0 || rngValue >= 1) {
			return fail({
				code: "INVALID_RNG_VALUE",
				message: "Dice RNG returned a value outside the [0, 1) range.",
				details: { value: String(rngValue) },
			});
		}

		const naturalRoll = Math.floor(rngValue * input.sides) + 1;
		const auditEntry = {
			rollId: this.rollIdProvider.generate(),
			reason: input.reason,
			sides: input.sides,
			naturalRoll,
			createdAt: this.clock.now(),
		};

		return ok({
			naturalRoll,
			sides: input.sides,
			isNaturalCritical:
				input.sides === PANDORHA_RULES.DICE.D20_SIDES &&
				naturalRoll === PANDORHA_RULES.DICE.NATURAL_CRITICAL,
			isNaturalFailure: naturalRoll === PANDORHA_RULES.DICE.NATURAL_FAILURE,
			auditEntry,
		});
	}
}
