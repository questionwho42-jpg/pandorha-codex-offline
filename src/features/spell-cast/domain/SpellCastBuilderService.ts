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

const METAMAGIC_COSTS: Record<
	string,
	number | ((spellCost: number) => number)
> = {
	"distant-spell": 1,
	"subtle-spell": 1,
	"transmuted-spell": 1,
	"ricochet-spell": 1,
	"malleable-spell": 1,
	"glide-spell": 1,
	extensa: 1,
	oculta: 1,
	transmutada: 1,
	ricochete: 1,
	moldavel: 1,
	deslizante: 1,

	"resonant-spell": 2,
	"bulwark-spell": 2,
	"purifying-spell": 2,
	"chain-spell": 2,
	"piercing-spell": 2,
	"widen-spell": 2,
	"anchored-spell": 2,
	"debilitating-spell": 2,
	"persistent-spell": 2,
	"protective-spell": 2,
	"unbreakable-spell": 2,
	"frenzied-spell": 2,
	"shared-spell": 2,
	"explosive-spell": 2,
	"repelling-spell": 2,
	"attracting-spell": 2,
	"transposed-spell": 2,
	"dormant-spell": 2,
	"vengeful-spell": 2,
	"revealing-spell": 2,
	"incorporeal-spell": 2,
	"unstable-spell": 2,
	"blinding-spell": 2,
	ressonante: 2,
	baluarte: 2,
	purificadora: 2,
	corrente: 2,
	perfurante: 2,
	ampla: 2,
	ancorada: 2,
	debilitante: 2,
	persistente: 2,
	protetora: 2,
	inexpugnavel: 2,
	frenetica: 2,
	partilhada: 2,
	explosiva: 2,
	repulsora: 2,
	atrativa: 2,
	permutada: 2,
	dormente: 2,
	vingativa: 2,
	reveladora: 2,
	incorporea: 2,
	instavel: 2,
	ofuscante: 2,

	"vampiric-spell": 3,
	"brutal-spell": 3,
	"heightened-spell": 3,
	"colossal-spell": 3,
	"mirrored-spell": 3,
	"cataclysmic-spell": 3,
	vampirica: 3,
	brutal: 3,
	implacavel: 3,
	colossal: 3,
	espelhada: 3,
	cataclimica: 3,

	"echoing-spell": 4,
	"conditional-spell": 4,
	"eternal-spell": 4,
	ecoante: 4,
	condicional: 4,
	eterna: 4,

	"twin-spell": (spellCost: number) => Math.max(1, spellCost),
	"twinned-spell": (spellCost: number) => Math.max(1, spellCost),
	gemea: (spellCost: number) => Math.max(1, spellCost),
};

/**
 * @description Builds an auditable cast-spell ActionCommand without executing spell effects, spending persisted EE, rolling attacks, or applying metamagic.
 * @rule docs/architecture/feature_state_machines.md - spell casting must pass Draft -> Weaving -> Audit -> Commit before entering the ActionQueue
 * @rule docs/system/magic/12-metamagias-as-40-quebras.md - metamagic spends EE at casting time
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

		// Calculate metamagic EE costs
		let metamagicEtherCost = 0;
		for (const id of castInput.metamagicIds) {
			const costEntry = METAMAGIC_COSTS[id];
			if (costEntry === undefined) {
				metamagicEtherCost += 1; // Fallback for unknown metamagics
			} else if (typeof costEntry === "function") {
				metamagicEtherCost += costEntry(spell.etherCost);
			} else {
				metamagicEtherCost += costEntry;
			}
		}

		const audit: SpellCastAudit = {
			baseEtherCost: spell.etherCost,
			metamagicEtherCost: metamagicEtherCost,
			totalEtherCost: spell.etherCost + metamagicEtherCost,
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
		metamagicIds: readonly string[];
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
			metamagicIdsCsv: input.metamagicIds.join(","),
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
