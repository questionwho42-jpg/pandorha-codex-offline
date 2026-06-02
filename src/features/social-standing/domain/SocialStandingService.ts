import type { ZodIssue } from "zod/v4";
import type { FactionCatalogRepository } from "$lib/entities/faction";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	socialDebtLimitInputSchema,
	socialFameGainInputSchema,
	socialFameLossInputSchema,
	socialInfamyGainInputSchema,
	socialStandingActionInputSchema,
} from "../model/socialStandingSchemas";
import type {
	SocialDebtLimitResult,
	SocialStandingChangeResult,
	SocialStandingFailure,
} from "../model/socialStandingTypes";

const BLOOD_DEBT_PER_FAME_LEVEL = 3;
const MAX_FAME_LEVEL = 5;
const MIN_FAME_LEVEL = 0;
const MAX_INFAMY_LEVEL = 5;

/**
 * @description Applies party-level social standing operations without persistence, UI, dialogue, or prestige checks.
 * @rule docs/system/survival/31-codex-teia-infamia-patrocinio.md - maximum blood debt is faction fame level multiplied by three.
 * @rule docs/system/survival/21-mecanicas-de-fama-e-influencia.md - fame is mutable and can rise or fall.
 */
export class SocialStandingService {
	public constructor(private readonly repository: FactionCatalogRepository) {}

	public calculateDebtLimit(
		input: unknown,
	): Result<SocialDebtLimitResult, SocialStandingFailure> {
		const parsed = socialDebtLimitInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		return ok({
			fameLevel: parsed.data.fameLevel,
			debtLimit: calculateDebtLimitForFame(parsed.data.fameLevel),
		});
	}

	public async invokeFavor(
		input: unknown,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>> {
		const parsed = socialStandingActionInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		const factionCheck = await this.ensureFactionExists(
			parsed.data.standing.factionId,
		);
		if (!factionCheck.success) {
			return fail(factionCheck.error);
		}

		if (parsed.data.standing.status !== "sponsored") {
			return fail({
				code: "OPERATION_NOT_ALLOWED",
				message: "Only sponsored factions can grant favors.",
				details: { status: parsed.data.standing.status },
			});
		}

		const debtLimit = calculateDebtLimitForFame(parsed.data.standing.fameLevel);
		const nextBloodDebt = parsed.data.standing.bloodDebt + parsed.data.tier;
		if (nextBloodDebt >= debtLimit) {
			return fail({
				code: "DEBT_LIMIT_EXCEEDED",
				message: "Invoking this favor would trigger the impossible favor.",
				details: {
					currentDebt: parsed.data.standing.bloodDebt,
					nextDebt: nextBloodDebt,
					debtLimit,
				},
			});
		}

		const standing = {
			...parsed.data.standing,
			bloodDebt: nextBloodDebt,
			intriguePoints: parsed.data.standing.intriguePoints + parsed.data.tier,
		};

		return ok({
			standing,
			debtLimit,
			event: {
				type: "faction-favor-invoked",
				message: `Favor Tier ${parsed.data.tier} invocado. Dívida de Sangue ${standing.bloodDebt}/${debtLimit}; Intriga ${standing.intriguePoints}.`,
			},
		});
	}

	public async redeemDebt(
		input: unknown,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>> {
		const parsed = socialStandingActionInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		const factionCheck = await this.ensureFactionExists(
			parsed.data.standing.factionId,
		);
		if (!factionCheck.success) {
			return fail(factionCheck.error);
		}

		const debtLimit = calculateDebtLimitForFame(parsed.data.standing.fameLevel);
		const standing = {
			...parsed.data.standing,
			bloodDebt: Math.max(0, parsed.data.standing.bloodDebt - parsed.data.tier),
			status:
				parsed.data.standing.status === "ultimatum" &&
				parsed.data.standing.bloodDebt - parsed.data.tier <= debtLimit
					? "sponsored"
					: parsed.data.standing.status,
		};

		return ok({
			standing,
			debtLimit,
			event: {
				type: "faction-debt-redeemed",
				message: `Missão de redenção Tier ${parsed.data.tier} concluída. Dívida de Sangue ${standing.bloodDebt}/${debtLimit}.`,
			},
		});
	}

	public async gainFame(
		input: unknown,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>> {
		const parsed = socialFameGainInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		const factionCheck = await this.ensureFactionExists(
			parsed.data.standing.factionId,
		);
		if (!factionCheck.success) {
			return fail(factionCheck.error);
		}

		const fameLevel = Math.min(
			MAX_FAME_LEVEL,
			parsed.data.standing.fameLevel + parsed.data.levels,
		);
		const debtLimit = calculateDebtLimitForFame(fameLevel);
		const standing = {
			...parsed.data.standing,
			fameLevel,
			status:
				parsed.data.standing.status === "ultimatum" &&
				parsed.data.standing.bloodDebt <= debtLimit
					? "sponsored"
					: parsed.data.standing.status,
		};

		return ok({
			standing,
			debtLimit,
			event: {
				type: "faction-fame-gained",
				message: `Fama com a facção aumentou para ${standing.fameLevel}. Limite de Dívida ${debtLimit}.`,
			},
		});
	}

	public async loseFame(
		input: unknown,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>> {
		const parsed = socialFameLossInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		const factionCheck = await this.ensureFactionExists(
			parsed.data.standing.factionId,
		);
		if (!factionCheck.success) {
			return fail(factionCheck.error);
		}

		const fameLevel = Math.max(
			MIN_FAME_LEVEL,
			parsed.data.standing.fameLevel - parsed.data.levels,
		);
		const debtLimit = calculateDebtLimitForFame(fameLevel);
		const standing = {
			...parsed.data.standing,
			fameLevel,
			status:
				parsed.data.standing.bloodDebt > debtLimit
					? "ultimatum"
					: parsed.data.standing.status,
		};

		return ok({
			standing,
			debtLimit,
			event: {
				type: "faction-fame-lost",
				message: `Fama com a facção caiu para ${standing.fameLevel}. Limite de Dívida ${debtLimit}.`,
			},
		});
	}

	public async gainInfamy(
		input: unknown,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>> {
		const parsed = socialInfamyGainInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail(invalidInput(parsed.error.issues));
		}

		const factionCheck = await this.ensureFactionExists(
			parsed.data.standing.factionId,
		);
		if (!factionCheck.success) {
			return fail(factionCheck.error);
		}

		const infamyLevel = Math.min(
			MAX_INFAMY_LEVEL,
			parsed.data.standing.infamyLevel + parsed.data.levels,
		);
		const debtLimit = calculateDebtLimitForFame(parsed.data.standing.fameLevel);
		const standing = {
			...parsed.data.standing,
			infamyLevel,
		};

		return ok({
			standing,
			debtLimit,
			event: {
				type: "faction-infamy-gained",
				message: `Infâmia com a facção aumentou para ${standing.infamyLevel}.`,
			},
		});
	}

	private async ensureFactionExists(
		factionId: string,
	): Promise<Result<true, SocialStandingFailure>> {
		const found = await this.repository.findFactionById(factionId);
		if (found.success) {
			return ok(true);
		}

		if (found.error.code === "FACTION_NOT_FOUND") {
			const failure: SocialStandingFailure = {
				code: "FACTION_NOT_FOUND",
				message: "Faction was not found for social standing operation.",
				...(found.error.details ? { details: found.error.details } : {}),
			};
			return fail(failure);
		}

		const failure: SocialStandingFailure = {
			code: "FACTION_LOOKUP_FAILED",
			message: "Faction lookup failed before social standing operation.",
			...(found.error.details ? { details: found.error.details } : {}),
		};
		return fail(failure);
	}
}

function calculateDebtLimitForFame(fameLevel: number): number {
	return fameLevel * BLOOD_DEBT_PER_FAME_LEVEL;
}

function invalidInput(issues: readonly ZodIssue[]): SocialStandingFailure {
	return {
		code: "INVALID_SOCIAL_STANDING_INPUT",
		message: "Social standing input failed validation.",
		details: { issues: formatIssues(issues) },
	};
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
