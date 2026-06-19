import type { EquipmentDurabilityCondition } from "./equipmentDurabilityEventSchema";

export type EquipmentDurabilityLedgerFailureCode =
	| "INVALID_EQUIPMENT_DURABILITY_LEDGER"
	| "EQUIPMENT_DURABILITY_LEDGER_SEQUENCE_INVALID";

export interface EquipmentDurabilityLedgerFailure {
	readonly code: EquipmentDurabilityLedgerFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export type EquipmentDurabilityRepositoryFailureCode =
	| "EQUIPMENT_DURABILITY_EVENT_REPOSITORY_READ_FAILED"
	| "EQUIPMENT_DURABILITY_EVENT_REPOSITORY_WRITE_FAILED";

export interface EquipmentDurabilityRepositoryFailure {
	readonly code: EquipmentDurabilityRepositoryFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export interface EquipmentDurabilityLedgerSnapshot {
	readonly characterId: string;
	readonly condition: EquipmentDurabilityCondition;
	readonly inventoryEntryId: string;
	readonly lastSequence: number;
}
