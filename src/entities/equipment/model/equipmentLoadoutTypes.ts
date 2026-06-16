import type { EquipmentLoadoutEventSlot } from "./equipmentLoadoutEventSchema";

export type EquipmentLoadoutLedgerFailureCode =
	| "INVALID_EQUIPMENT_LOADOUT_LEDGER"
	| "EQUIPMENT_LOADOUT_LEDGER_SEQUENCE_INVALID";

export interface EquipmentLoadoutLedgerFailure {
	readonly code: EquipmentLoadoutLedgerFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export type EquipmentLoadoutRepositoryFailureCode =
	| "EQUIPMENT_LOADOUT_EVENT_REPOSITORY_READ_FAILED"
	| "EQUIPMENT_LOADOUT_EVENT_REPOSITORY_WRITE_FAILED";

export interface EquipmentLoadoutRepositoryFailure {
	readonly code: EquipmentLoadoutRepositoryFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export interface EquipmentLoadoutLedgerSnapshot {
	readonly characterId: string;
	readonly slot: EquipmentLoadoutEventSlot;
	readonly inventoryEntryId: string;
	readonly lastSequence: number;
}
