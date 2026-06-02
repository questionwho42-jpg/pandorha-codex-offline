import { z } from "zod/v4";
import { factionStandingSelectSchema } from "$lib/entities/faction";

const tier = z.number().int().min(1).max(4);
const positiveLevelDelta = z.number().int().min(1).max(5);
const fameLevel = z.number().int().min(0).max(5);

export const socialDebtLimitInputSchema = z.object({
	fameLevel,
});

export const socialStandingActionInputSchema = z.object({
	standing: factionStandingSelectSchema,
	tier,
});

export const socialFameGainInputSchema = z.object({
	standing: factionStandingSelectSchema,
	levels: positiveLevelDelta,
});

export const socialFameLossInputSchema = z.object({
	standing: factionStandingSelectSchema,
	levels: positiveLevelDelta,
});

export const socialInfamyGainInputSchema = z.object({
	standing: factionStandingSelectSchema,
	levels: positiveLevelDelta,
});
