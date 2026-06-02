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
	type BackgroundRecord,
	OFFICIAL_BACKGROUNDS,
} from "$lib/entities/background";
import type { CharacterRepositoryFailure } from "$lib/entities/character";
import {
	type CharacterClock,
	type CharacterIdProvider,
	type CharacterRecord,
	CharacterService,
	SessionCharacterRepository,
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
	repository: SessionCharacterRepository;
	restoreRecords(
		records: readonly CharacterRecord[],
	): Result<readonly CharacterRecord[], CharacterRepositoryFailure>;
	service: CharacterService;
	traitsByAncestryId: Readonly<Record<string, readonly AncestryTraitRecord[]>>;
}>;

export function createCharacterSession(): CharacterSession {
	const repository = new SessionCharacterRepository();
	const ancestryTraitRepository = new InMemoryAncestryTraitRepository(
		OFFICIAL_ANCESTRY_TRAITS,
		OFFICIAL_ANCESTRY_TRAIT_LINKS,
	);
	const idState = createSessionCharacterIdState();

	return {
		ancestries: OFFICIAL_ANCESTRIES,
		ancestryTraitSelectionService: new AncestryTraitSelectionService(
			ancestryTraitRepository,
		),
		backgrounds: OFFICIAL_BACKGROUNDS,
		characterClasses: OFFICIAL_CHARACTER_CLASSES,
		repository,
		restoreRecords: (records) => {
			const restored = repository.replaceAll(records);
			if (!restored.success) {
				return restored;
			}

			idState.syncFromRecords(restored.data);
			return ok(restored.data);
		},
		service: new CharacterService(
			repository,
			idState.provider,
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

function createSystemCharacterClock(): CharacterClock {
	return {
		now: () => new Date().toISOString(),
	};
}
