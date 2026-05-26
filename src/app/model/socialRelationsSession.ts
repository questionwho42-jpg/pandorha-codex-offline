import {
	type FactionRecord,
	type FactionStandingRecord,
	InMemoryFactionCatalogRepository,
	TRAINING_FACTION_STANDINGS,
	TRAINING_FACTIONS,
} from "$lib/entities/faction";
import {
	type SocialStandingChangeResult,
	type SocialStandingFailure,
	SocialStandingService,
} from "$lib/features/social-standing";
import type { Result } from "$lib/shared/lib/result";

export interface SocialRelationsSession {
	readonly factions: readonly FactionRecord[];
	createInitialStandings(): FactionStandingRecord[];
	invokeTierOneFavor(
		standing: FactionStandingRecord,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
	loseFame(
		standing: FactionStandingRecord,
		levels?: number,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
	normalizeStandings(
		standings: readonly FactionStandingRecord[],
	): FactionStandingRecord[];
	redeemTierOneDebt(
		standing: FactionStandingRecord,
	): Promise<Result<SocialStandingChangeResult, SocialStandingFailure>>;
}

export function createSocialRelationsSession(): SocialRelationsSession {
	const repository = new InMemoryFactionCatalogRepository({
		factions: TRAINING_FACTIONS,
		standings: TRAINING_FACTION_STANDINGS,
	});
	const service = new SocialStandingService(repository);

	return {
		factions: TRAINING_FACTIONS,
		createInitialStandings,
		invokeTierOneFavor: (standing) =>
			service.invokeFavor({ standing, tier: 1 }),
		loseFame: (standing, levels = 1) => service.loseFame({ standing, levels }),
		normalizeStandings,
		redeemTierOneDebt: (standing) => service.redeemDebt({ standing, tier: 1 }),
	};
}

function createInitialStandings(): FactionStandingRecord[] {
	return TRAINING_FACTION_STANDINGS.map((standing) => ({ ...standing }));
}

function normalizeStandings(
	standings: readonly FactionStandingRecord[],
): FactionStandingRecord[] {
	if (standings.length === 0) {
		return createInitialStandings();
	}

	const byFactionId = new Map(
		standings.map((standing) => [standing.factionId, standing]),
	);
	return TRAINING_FACTION_STANDINGS.map(
		(defaultStanding) =>
			byFactionId.get(defaultStanding.factionId) ?? {
				...defaultStanding,
			},
	);
}
