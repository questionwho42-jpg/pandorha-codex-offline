export type EquipmentFailureCode =
	| "INVALID_EQUIPMENT_ID"
	| "EQUIPMENT_NOT_FOUND"
	| "EQUIPMENT_REPOSITORY_READ_FAILED"
	| "CORRUPTED_EQUIPMENT_RECORD"
	| "INVALID_CONSUMABLE_ID"
	| "CONSUMABLE_NOT_FOUND"
	| "CONSUMABLE_REPOSITORY_READ_FAILED"
	| "CORRUPTED_CONSUMABLE_RECORD";

export type EquipmentFailureDetails = Readonly<
	Record<string, string | number | boolean | readonly string[]>
>;

export interface EquipmentFailure {
	readonly code: EquipmentFailureCode;
	readonly message: string;
	readonly details?: EquipmentFailureDetails;
}

export type EquipmentRepositoryFailureCode =
	| "EQUIPMENT_NOT_FOUND"
	| "EQUIPMENT_REPOSITORY_READ_FAILED"
	| "CORRUPTED_EQUIPMENT_RECORD"
	| "CONSUMABLE_NOT_FOUND"
	| "CONSUMABLE_REPOSITORY_READ_FAILED"
	| "CORRUPTED_CONSUMABLE_RECORD";

export interface EquipmentRepositoryFailure {
	readonly code: EquipmentRepositoryFailureCode;
	readonly message: string;
	readonly details?: EquipmentFailureDetails;
}
