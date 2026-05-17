export type CraftingFailureCode =
	| "RECIPE_NOT_FOUND"
	| "CRAFTING_REPOSITORY_WRITE_FAILED"
	| "CRAFTING_REPOSITORY_READ_FAILED"
	| "CORRUPTED_CRAFTING_RECORD"
	| "INSUFFICIENT_MATERIALS"
	| "INSUFFICIENT_GOLD"
	| "RESOLUTION_FAILED"
	| "CRAFTING_DATABASE_ERROR";

export type CraftingFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface CraftingFailure {
	readonly code: CraftingFailureCode;
	readonly message: string;
	readonly details?: CraftingFailureDetails;
}
