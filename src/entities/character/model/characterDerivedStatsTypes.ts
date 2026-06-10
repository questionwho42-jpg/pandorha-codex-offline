import { z } from "zod/v4";
import { characterSelectSchema } from "./characterSchema";

const notBlankText = z.string().trim().min(1);
const resolvedClassId = notBlankText.regex(/^[a-z][a-z-]*$/).max(60);
const classBaseHp = z.number().int().min(1).max(30);
const derivedStatValue = z.number().int().min(0).max(9999);

export const characterDerivedStatsClassSourceSchema = z.object({
	id: resolvedClassId,
	baseHp: classBaseHp,
});

export const characterDerivedStatsInputSchema = z.object({
	character: characterSelectSchema,
	characterClass: characterDerivedStatsClassSourceSchema,
	climaExtremo: z.enum(["frost", "storm", "heat"]).nullable().optional(),
});

export const characterDerivedStatsResultSchema = z.object({
	maxHp: derivedStatValue,
	initiativeBase: derivedStatValue,
	carrySlotLimit: derivedStatValue,
	armorClass: derivedStatValue,
	stealthPenalty: z.number().int().max(0),
});

export type CharacterDerivedStatsClassSource = z.infer<
	typeof characterDerivedStatsClassSourceSchema
>;
export type CharacterDerivedStatsInput = z.infer<
	typeof characterDerivedStatsInputSchema
>;
export type CharacterDerivedStatsResult = z.infer<
	typeof characterDerivedStatsResultSchema
>;

export type CharacterDerivedStatsFailureCode =
	| "INVALID_DERIVED_STATS_INPUT"
	| "CHARACTER_CLASS_MISMATCH";

export type CharacterDerivedStatsFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CharacterDerivedStatsFailure {
	readonly code: CharacterDerivedStatsFailureCode;
	readonly message: string;
	readonly details?: CharacterDerivedStatsFailureDetails;
}
