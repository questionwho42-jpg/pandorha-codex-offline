export interface RegionalDomainRepositoryFailure {
	readonly code:
		| "REGIONAL_DOMAIN_REPOSITORY_WRITE_FAILED"
		| "REGIONAL_DOMAIN_NOT_FOUND"
		| "CORRUPTED_REGIONAL_DOMAIN_RECORD";
	readonly message: string;
	readonly details?: Record<string, string>;
}

export interface RegionalDomainFailure {
	readonly code:
		| "INVALID_REGIONAL_DOMAIN_INPUT"
		| "REGIONAL_DOMAIN_NOT_FOUND"
		| "REPOSITORY_WRITE_FAILED";
	readonly message: string;
}

export interface RegionalDomainClock {
	now(): string;
}

export interface RegionalDomainIdProvider {
	generate(): string;
}
