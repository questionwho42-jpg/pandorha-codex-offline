import {
	type AncestryRecord,
	type AncestryTraitFailure,
	type AncestryTraitRecord,
	AncestryTraitSelectionService,
	InMemoryAncestryTraitRepository,
	OFFICIAL_ANCESTRIES,
	OFFICIAL_ANCESTRY_TRAIT_LINKS,
	OFFICIAL_ANCESTRY_TRAITS,
} from "$lib/entities/ancestry";
import {
	type BackgroundRecord,
	OFFICIAL_BACKGROUNDS,
} from "$lib/entities/background";
import type { CharacterRepositoryFailure } from "$lib/entities/character";
import {
	type CharacterClock,
	type CharacterIdProvider,
	type CharacterRecord,
	CharacterService,
	type CharacterTraitSelectionRecord,
	type CharacterTraitSelectionRepositoryFailure,
	type CharacterTraitSelectionSequence,
	SessionCharacterRepository,
	SessionCharacterTraitSelectionRepository,
} from "$lib/entities/character";
import {
	type CharacterClassRecord,
	OFFICIAL_CHARACTER_CLASSES,
} from "$lib/entities/character-class";
import { ok, type Result } from "$lib/shared/lib/result";

export type CharacterSession = Readonly<{
	ancestries: readonly AncestryRecord[];
	ancestryTraitSelectionService: AncestryTraitSelectionService;
	backgrounds: readonly BackgroundRecord[];
	characterClasses: readonly CharacterClassRecord[];
	createTraitSelections(input: {
		readonly characterId: string;
		readonly ancestryId: string;
		readonly traitIds: readonly string[];
	}): Promise<
		Result<
			readonly CharacterTraitSelectionRecord[],
			AncestryTraitFailure | CharacterTraitSelectionRepositoryFailure
		>
	>;
	repository: SessionCharacterRepository;
	restoreRecords(
		records: readonly CharacterRecord[],
	): Result<readonly CharacterRecord[], CharacterRepositoryFailure>;
	restoreTraitSelections(
		records: readonly CharacterTraitSelectionRecord[],
	): Result<
		readonly CharacterTraitSelectionRecord[],
		CharacterTraitSelectionRepositoryFailure
	>;
	service: CharacterService;
	traitSelectionRepository: SessionCharacterTraitSelectionRepository;
	traitsByAncestryId: Readonly<Record<string, readonly AncestryTraitRecord[]>>;
}>;

export function createCharacterSession(): CharacterSession {
	const repository = new SessionCharacterRepository();
	const traitSelectionRepository =
		new SessionCharacterTraitSelectionRepository();
	const ancestryTraitRepository = new InMemoryAncestryTraitRepository(
		OFFICIAL_ANCESTRY_TRAITS,
		OFFICIAL_ANCESTRY_TRAIT_LINKS,
	);
	const idState = createSessionCharacterIdState();
	const traitSelectionIdState = createSessionCharacterTraitSelectionIdState();
	const clock = createSystemCharacterClock();
	const ancestryTraitSelectionService = new AncestryTraitSelectionService(
		ancestryTraitRepository,
	);

	return {
		ancestries: OFFICIAL_ANCESTRIES,
		ancestryTraitSelectionService,
		backgrounds: OFFICIAL_BACKGROUNDS,
		characterClasses: OFFICIAL_CHARACTER_CLASSES,
		createTraitSelections: async (input) => {
			const selected = await ancestryTraitSelectionService.chooseLevelOneTraits(
				{
					ancestryId: input.ancestryId,
					traitIds: input.traitIds,
				},
			);
			if (!selected.success) {
				return selected;
			}

			const records = selected.data.traitIds.map((traitId, index) => ({
				id: traitSelectionIdState.provider.generate(),
				characterId: input.characterId,
				sequence: (index + 1) as CharacterTraitSelectionSequence,
				traitId,
				createdAt: clock.now(),
			}));

			return traitSelectionRepository.append(records);
		},
		repository,
		restoreRecords: (records) => {
			const restored = repository.replaceAll(records);
			if (!restored.success) {
				return restored;
			}

			idState.syncFromRecords(restored.data);
			return ok(restored.data);
		},
		restoreTraitSelections: (records) => {
			const restored = traitSelectionRepository.replaceAll(records);
			if (!restored.success) {
				return restored;
			}

			traitSelectionIdState.syncFromRecords(restored.data);
			return ok(restored.data);
		},
		service: new CharacterService(repository, idState.provider, clock),
		traitSelectionRepository,
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

function createSessionCharacterIdState(): {
	readonly provider: CharacterIdProvider;
	syncFromRecords(records: readonly CharacterRecord[]): void;
} {
	let nextId = 1;

	return {
		provider: {
			generate: () => {
				const id = `session-character-${nextId}`;
				nextId += 1;
				return id;
			},
		},
		syncFromRecords: (records) => {
			const highestId = records.reduce((currentMax, record) => {
				const match = /^session-character-(\d+)$/.exec(record.id);
				if (!match) {
					return currentMax;
				}

				return Math.max(currentMax, Number(match[1]));
			}, 0);
			nextId = highestId + 1;
		},
	};
}

function createSessionCharacterTraitSelectionIdState(): {
	readonly provider: CharacterIdProvider;
	syncFromRecords(records: readonly CharacterTraitSelectionRecord[]): void;
} {
	let nextId = 1;

	return {
		provider: {
			generate: () => {
				const id = `session-character-trait-selection-${nextId}`;
				nextId += 1;
				return id;
			},
		},
		syncFromRecords: (records) => {
			const highestId = records.reduce((currentMax, record) => {
				const match = /^session-character-trait-selection-(\d+)$/.exec(
					record.id,
				);
				if (!match) {
					return currentMax;
				}

				return Math.max(currentMax, Number(match[1]));
			}, 0);
			nextId = highestId + 1;
		},
	};
}

function createSystemCharacterClock(): CharacterClock {
	return {
		now: () => new Date().toISOString(),
	};
}
