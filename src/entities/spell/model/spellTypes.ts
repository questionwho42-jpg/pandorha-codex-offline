export type SpellRepositoryFailureCode =
	| "SPELL_REPOSITORY_READ_FAILED"
	| "SPELL_REPOSITORY_LOOKUP_FAILED";

export type SpellServiceFailureCode =
	| "INVALID_SPELL_ID"
	| "INVALID_SPELL_CIRCLE"
	| "SPELL_NOT_FOUND"
	| "CORRUPTED_SPELL_RECORD";

export type SpellFailureCode =
	| SpellRepositoryFailureCode
	| SpellServiceFailureCode;

export type SpellFailure = {
	readonly code: SpellFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
};

export type SpellRepositoryFailure = SpellFailure & {
	readonly code: SpellRepositoryFailureCode | "SPELL_NOT_FOUND";
};
