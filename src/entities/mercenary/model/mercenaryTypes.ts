export interface MercenaryRepositoryFailure {
	readonly code:
		| "MERCENARY_REPOSITORY_WRITE_FAILED"
		| "MERCENARY_COMPANY_NOT_FOUND"
		| "MERCENARY_SQUAD_NOT_FOUND"
		| "CORRUPTED_MERCENARY_RECORD";
	readonly message: string;
	readonly details?: Record<string, string>;
}

export interface MercenaryFailure {
	readonly code:
		| "INVALID_MERCENARY_INPUT"
		| "MERCENARY_COMPANY_NOT_FOUND"
		| "MERCENARY_SQUAD_NOT_FOUND"
		| "REPOSITORY_WRITE_FAILED"
		| "INSUFFICIENT_FUNDS";
	readonly message: string;
}

export interface MercenaryClock {
	now(): string;
}

export interface MercenaryIdProvider {
	generate(): string;
}
