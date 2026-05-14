import type { SpellFailure, SpellRecord } from "$lib/entities/spell";
import type { ActionCommand } from "$lib/shared/action-queue";
import type { Result } from "$lib/shared/lib/result";
import type { SpellCastInput } from "./spellCastBuilderSchemas";

export type { SpellCastInput };

export type SpellCastFailureCode =
	| "INVALID_SPELL_CAST_INPUT"
	| "SPELL_LOOKUP_FAILED"
	| "UNSUPPORTED_METAMAGIC"
	| "INSUFFICIENT_ETHER"
	| "INVALID_SPELL_COMMAND";

export type SpellCastFailure = {
	readonly code: SpellCastFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
	readonly cause?: SpellFailure;
};

export interface SpellCastCatalogPort {
	findSpellById(id: unknown): Promise<Result<SpellRecord, SpellFailure>>;
}

export type SpellCastCommandValidator = (
	command: ActionCommand,
) => Result<ActionCommand, SpellCastFailure>;

export interface SpellCastDraft {
	readonly casterId: string;
	readonly spellId: string;
	readonly spellLabel: string;
	readonly targetId: string;
	readonly flow: "Draft" | "Weaving" | "Audit" | "Commit";
}

export interface SpellCastAudit {
	readonly baseEtherCost: number;
	readonly metamagicEtherCost: number;
	readonly totalEtherCost: number;
	readonly availableEther: number;
}

export interface SpellCastBuildResult {
	readonly draft: SpellCastDraft;
	readonly audit: SpellCastAudit;
	readonly command: ActionCommand;
}
