import {
	type AncestryRecord,
	type AncestryTraitRecord,
	AncestryTraitSelectionService,
	InMemoryAncestryTraitRepository,
	OFFICIAL_ANCESTRIES,
	OFFICIAL_ANCESTRY_TRAIT_LINKS,
	OFFICIAL_ANCESTRY_TRAITS,
} from "$lib/entities/ancestry";
import {
	type CharacterClock,
	type CharacterIdProvider,
	CharacterService,
	SessionCharacterRepository,
} from "$lib/entities/character";

export type CharacterSession = Readonly<{
	ancestries: readonly AncestryRecord[];
	ancestryTraitSelectionService: AncestryTraitSelectionService;
	repository: SessionCharacterRepository;
	service: CharacterService;
	traitsByAncestryId: Readonly<Record<string, readonly AncestryTraitRecord[]>>;
}>;

export function createCharacterSession(): CharacterSession {
	const repository = new SessionCharacterRepository();
	const ancestryTraitRepository = new InMemoryAncestryTraitRepository(
		OFFICIAL_ANCESTRY_TRAITS,
		OFFICIAL_ANCESTRY_TRAIT_LINKS,
	);

	return {
		ancestries: OFFICIAL_ANCESTRIES,
		ancestryTraitSelectionService: new AncestryTraitSelectionService(
			ancestryTraitRepository,
		),
		repository,
		service: new CharacterService(
			repository,
			createSessionCharacterIdProvider(),
			createSystemCharacterClock(),
		),
		traitsByAncestryId: createTraitsByAncestryId(),
	};
}

function createTraitsByAncestryId(): Readonly<
	Record<string, readonly AncestryTraitRecord[]>
> {
	const traitsById = new Map(
		OFFICIAL_ANCESTRY_TRAITS.map((trait) => [trait.id, trait]),
	);
	const traitsByAncestryId: Record<string, AncestryTraitRecord[]> = {};

	for (const link of OFFICIAL_ANCESTRY_TRAIT_LINKS) {
		const trait = traitsById.get(link.traitId);
		if (!trait) {
			continue;
		}

		traitsByAncestryId[link.ancestryId] = [
			...(traitsByAncestryId[link.ancestryId] ?? []),
			trait,
		];
	}

	return traitsByAncestryId;
}

function createSessionCharacterIdProvider(): CharacterIdProvider {
	let nextId = 1;

	return {
		generate: () => {
			const id = `session-character-${nextId}`;
			nextId += 1;
			return id;
		},
	};
}

function createSystemCharacterClock(): CharacterClock {
	return {
		now: () => new Date().toISOString(),
	};
}
