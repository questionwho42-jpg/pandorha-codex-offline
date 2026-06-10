import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type CharacterDerivedStatsFailure,
	type CharacterDerivedStatsResult,
	characterDerivedStatsInputSchema,
} from "../model/characterDerivedStatsTypes";

/**
 * @description Calculates non-persisted base derived stats for a character from validated character and resolved class data.
 * @rule docs/system/survival/05-00-regras-de-classe.md - HP = [HP Base da Classe + Físico + Resistência] × Nível Atual
 * @rule docs/system/survival/regras-peso-carga.md - Carga = [Físico + Resistência] + 6 Slots
 */
export class CharacterDerivedStatsService {
	public calculateCharacterDerivedStats(
		input: unknown,
	): Result<CharacterDerivedStatsResult, CharacterDerivedStatsFailure> {
		const parsed = characterDerivedStatsInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_DERIVED_STATS_INPUT",
				message: "Character derived stats input failed validation.",
				details: { issues: formatIssues(parsed.error.issues) },
			});
		}

		const { character, characterClass } = parsed.data;
		if (character.classId !== characterClass.id) {
			return fail({
				code: "CHARACTER_CLASS_MISMATCH",
				message:
					"Resolved character class does not match the character record.",
				details: {
					characterClassId: character.classId,
					resolvedClassId: characterClass.id,
				},
			});
		}

		const climaExtremo = parsed.data.climaExtremo;
		const physical = character.physical - (climaExtremo === "frost" ? 1 : 0);
		const mental = character.mental - (climaExtremo === "heat" ? 1 : 0);

		let initiativeBase = character.level + mental + character.interaction;
		let armorClass = 10 + character.level + physical;

		if (climaExtremo === "storm") {
			initiativeBase -= 1;
			armorClass -= 1;
		}

		return ok({
			maxHp:
				(characterClass.baseHp + physical + character.resistance) *
				character.level,
			initiativeBase,
			carrySlotLimit: physical + character.resistance + 6,
			armorClass,
			stealthPenalty: 0,
		});
	}
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
