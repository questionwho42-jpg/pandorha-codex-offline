import {
	type ActionCommand,
	actionCommandSchema,
	formatActionQueueIssues,
} from "$lib/shared/action-queue";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	formatSpellCastIssues,
	spellCastInputSchema,
} from "../model/spellCastBuilderSchemas";
import type {
	SpellCastAudit,
	SpellCastBuildResult,
	SpellCastCatalogPort,
	SpellCastCommandValidator,
	SpellCastDraft,
	SpellCastFailure,
} from "../model/spellCastBuilderTypes";

const SPELL_CAST_COMMAND_TYPE = "cast-spell";
const SPELL_CAST_COMMAND_SOURCE = "SpellCastBuilderService";
const NO_METAMAGIC_ETHER_COST = 0;

/**
 * @description Builds an auditable cast-spell ActionCommand without executing spell effects, spending persisted EE, rolling attacks, or applying metamagic.
 * @rule docs/architecture/feature_state_machines.md - spell casting must pass Draft -> Weaving -> Audit -> Commit before entering the ActionQueue
 * @rule docs/system/magic/12-metamagias-as-40-quebras.md - metamagic spends EE at casting time, but T27 blocks metamagic until the dedicated implementation
 */
export class SpellCastBuilderService {
	public constructor(
		private readonly catalog: SpellCastCatalogPort,
		private readonly commandValidator: SpellCastCommandValidator = validateSpellCastCommand,
	) {}

	public async buildCastCommand(
		input: unknown,
	): Promise<Result<SpellCastBuildResult, SpellCastFailure>> {
		const parsedInput = spellCastInputSchema.safeParse(input);
		if (!parsedInput.success) {
			return fail({
				code: "INVALID_SPELL_CAST_INPUT",
				message: "Spell cast input failed validation.",
				details: { issues: formatSpellCastIssues(parsedInput.error.issues) },
			});
		}

		const castInput = parsedInput.data;
		if (castInput.metamagicIds.length > 0) {
			return fail({
				code: "UNSUPPORTED_METAMAGIC",
				message:
					"Metamagic is not supported by the minimum spell cast builder.",
				details: { metamagicIds: castInput.metamagicIds },
			});
		}

		const spellLookup = await this.catalog.findSpellById(castInput.spellId);
		if (!spellLookup.success) {
			return fail({
				code: "SPELL_LOOKUP_FAILED",
				message: "Spell lookup failed before building the cast command.",
				details: {
					spellId: castInput.spellId,
					spellFailureCode: spellLookup.error.code,
				},
				cause: spellLookup.error,
			});
		}

		const spell = spellLookup.data;
		const audit: SpellCastAudit = {
			baseEtherCost: spell.etherCost,
			metamagicEtherCost: NO_METAMAGIC_ETHER_COST,
			totalEtherCost: spell.etherCost + NO_METAMAGIC_ETHER_COST,
			availableEther: castInput.availableEther,
		};

		if (audit.totalEtherCost > audit.availableEther) {
			return fail({
				code: "INSUFFICIENT_ETHER",
				message: "Caster does not have enough available ether.",
				details: {
					spellId: spell.id,
					availableEther: audit.availableEther,
					requiredEther: audit.totalEtherCost,
				},
			});
		}

		const draft: SpellCastDraft = {
			casterId: castInput.casterId,
			spellId: spell.id,
			spellLabel: spell.label,
			targetId: castInput.targetId,
			flow: "Commit",
		};
		const command = createSpellCastCommand(castInput, spell, audit);
		const validatedCommand = this.commandValidator(command);
		if (!validatedCommand.success) {
			return fail(validatedCommand.error);
		}

		return ok({
			draft,
			audit,
			command: validatedCommand.data,
		});
	}
}

function createSpellCastCommand(
	input: Readonly<{
		commandId: string;
		casterId: string;
		targetId: string;
		createdAt: string;
	}>,
	spell: Readonly<{
		id: string;
		circle: number;
		requiresAttackRoll: boolean;
		requiresSavingThrow: boolean;
		damageText: string | null;
	}>,
	audit: SpellCastAudit,
): ActionCommand {
	return {
		id: input.commandId,
		type: SPELL_CAST_COMMAND_TYPE,
		source: SPELL_CAST_COMMAND_SOURCE,
		createdAt: input.createdAt,
		payload: {
			casterId: input.casterId,
			targetId: input.targetId,
			spellId: spell.id,
			spellCircle: spell.circle,
			totalEtherCost: audit.totalEtherCost,
			requiresAttackRoll: spell.requiresAttackRoll,
			requiresSavingThrow: spell.requiresSavingThrow,
			damageText: spell.damageText,
		},
	};
}

function validateSpellCastCommand(
	command: ActionCommand,
): Result<ActionCommand, SpellCastFailure> {
	const parsedCommand = actionCommandSchema.safeParse(command);
	if (!parsedCommand.success) {
		return fail({
			code: "INVALID_SPELL_COMMAND",
			message: "Built spell command failed ActionQueue validation.",
			details: {
				issues: formatActionQueueIssues(parsedCommand.error.issues),
			},
		});
	}

	return ok(parsedCommand.data as ActionCommand);
}
