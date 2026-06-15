import type { InventoryCatalogKind } from "./inventoryEventSchema";

export type InventoryFailureCode =
	| "INVALID_INVENTORY_LEDGER"
	| "INVENTORY_LEDGER_SEQUENCE_INVALID"
	| "INVENTORY_LEDGER_ENTRY_NOT_FOUND"
	| "INVENTORY_LEDGER_ENTRY_CONFLICT"
	| "INVENTORY_LEDGER_QUANTITY_INVALID";

export interface InventoryFailure {
	readonly code: InventoryFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export type InventoryRepositoryFailureCode =
	| "INVENTORY_EVENT_REPOSITORY_READ_FAILED"
	| "INVENTORY_EVENT_REPOSITORY_WRITE_FAILED";

export interface InventoryRepositoryFailure {
	readonly code: InventoryRepositoryFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export interface InventoryEntrySnapshot {
	readonly characterId: string;
	readonly entryId: string;
	readonly catalogKind: InventoryCatalogKind;
	readonly catalogItemId: string;
	readonly quantity: number;
	readonly lastSequence: number;
}
