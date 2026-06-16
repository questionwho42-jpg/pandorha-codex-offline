import type { EquipmentLoadoutSnapshot } from "$lib/entities/equipment";
import type { Result } from "$lib/shared/lib/result";

export interface CombatPersistentLoadoutInput {
	readonly characterId: string;
}

export type CombatPersistentLoadoutFailureCode =
	| "COMBAT_LOADOUT_INVENTORY_UNAVAILABLE"
	| "COMBAT_LOADOUT_LEDGER_INVALID"
	| "COMBAT_LOADOUT_ENTRY_INVALID"
	| "COMBAT_LOADOUT_EQUIPMENT_INVALID";

export interface CombatPersistentLoadoutFailure {
	readonly code: CombatPersistentLoadoutFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export type CombatPersistentLoadoutResolver = (
	input: CombatPersistentLoadoutInput,
) => Promise<Result<EquipmentLoadoutSnapshot, CombatPersistentLoadoutFailure>>;
