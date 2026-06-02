export { CompendiumCatalogService } from "./domain/CompendiumCatalogService";
export type { CompendiumRepository } from "./domain/CompendiumRepository";
export type { CompendiumSearchInput } from "./domain/CompendiumSearchService";
export {
	CompendiumSearchService,
	compendiumSearchInputSchema,
} from "./domain/CompendiumSearchService";
export {
	OFFICIAL_COMPENDIUM_ENTRIES,
	OFFICIAL_COMPENDIUM_ENTRY_IDS,
} from "./model/compendiumCatalog";
export type {
	CompendiumCategory,
	CompendiumEntry,
	CompendiumEntryId,
	NewCompendiumEntry,
} from "./model/compendiumSchema";
export {
	compendiumCategorySchema,
	compendiumEntries,
	compendiumEntryIdSchema,
	compendiumEntryInsertSchema,
	compendiumEntrySelectSchema,
} from "./model/compendiumSchema";
export type {
	CompendiumFailure,
	CompendiumFailureCode,
	CompendiumFailureDetails,
	CompendiumRepositoryFailure,
	CompendiumRepositoryFailureCode,
} from "./model/compendiumTypes";
export { InMemoryCompendiumRepository } from "./testing/InMemoryCompendiumRepository";
