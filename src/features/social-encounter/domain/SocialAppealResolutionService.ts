import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	ResolutionDegree,
	ResolutionService,
} from "$lib/shared/resolution";
import {
	formatSocialAppealResolutionIssues,
	socialAppealResolutionInputSchema,
} from "../model/socialAppealResolutionSchemas";
import type {
	SocialAppealResolutionFailure,
	SocialAppealResolutionResult,
} from "../model/socialAppealResolutionTypes";
import type { SocialAppealOutcome } from "../model/socialEncounterTypes";

const SOCIAL_APPEAL_OUTCOMES: Record<
	ResolutionDegree,
	{
		readonly outcome: SocialAppealOutcome;
		readonly summary: string;
	}
> = {
	criticalSuccess: {
		outcome: {
			kind: "success",
			mentalDamage: 5,
			persuasionProgress: 2,
		},
		summary: "Apelo crítico: o argumento atingiu o ponto central do NPC.",
	},
	success: {
		outcome: {
			kind: "success",
			mentalDamage: 3,
			persuasionProgress: 1,
		},
		summary: "Apelo bem-sucedido: a negociação avançou.",
	},
	successWithCost: {
		outcome: {
			kind: "success",
			mentalDamage: 1,
			persuasionProgress: 1,
		},
		summary: "Apelo com custo: houve progresso, mas com pouco impacto.",
	},
	failure: {
		outcome: {
			kind: "failure",
			patienceDamage: 2,
		},
		summary: "Apelo falhou: a paciência do NPC diminuiu.",
	},
};

/**
 * @description Converts an audited global social test into a deterministic SocialAppealOutcome. It does not mutate encounter state or persist data.
 * @rule docs/system/survival/regras-negociacao.md - social negotiation uses Social + Interaction + Level.
 * @rule docs/architecture/feature_state_machines.md - social actions enter the queue, while outcomes derive state.
 */
export class SocialAppealResolutionService {
	public constructor(private readonly resolutionService: ResolutionService) {}

	public resolveAppealOutcome(
		input: unknown,
	): Result<SocialAppealResolutionResult, SocialAppealResolutionFailure> {
		const parsed = socialAppealResolutionInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_SOCIAL_APPEAL_RESOLUTION_INPUT",
				message: "Social appeal resolution input failed validation.",
				details: {
					issues: formatSocialAppealResolutionIssues(parsed.error.issues),
				},
			});
		}

		const resolution = this.resolutionService.resolveGlobalTest({
			reason: parsed.data.reason,
			level: parsed.data.level,
			axisValue: parsed.data.social,
			applicationValue: parsed.data.interaction,
			itemBonus: parsed.data.itemBonus,
			dc: parsed.data.dc,
		});
		if (!resolution.success) {
			return fail({
				code: "SOCIAL_APPEAL_RESOLUTION_FAILED",
				message: "Resolution service failed while resolving social appeal.",
				details: { resolutionFailureCode: resolution.error.code },
				cause: resolution.error,
			});
		}

		const mapped = SOCIAL_APPEAL_OUTCOMES[resolution.data.degree];
		return ok({
			resolution: resolution.data,
			outcome: mapped.outcome,
			summary: mapped.summary,
		});
	}
}
