import {
	CompendiumSearchService,
	InMemoryCompendiumRepository,
	OFFICIAL_COMPENDIUM_ENTRIES,
} from "$lib/entities/compendium";

export type CompendiumSession = Readonly<{
	searchService: CompendiumSearchService;
}>;

export function createCompendiumSession(): CompendiumSession {
	return {
		searchService: new CompendiumSearchService(
			new InMemoryCompendiumRepository(OFFICIAL_COMPENDIUM_ENTRIES),
		),
	};
}
