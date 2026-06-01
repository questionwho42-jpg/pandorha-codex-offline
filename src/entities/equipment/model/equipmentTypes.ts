export type EquipmentFailureCode =
	| "INVALID_EQUIPMENT_ID"
	| "EQUIPMENT_NOT_FOUND"
	| "EQUIPMENT_REPOSITORY_READ_FAILED"
	| "CORRUPTED_EQUIPMENT_RECORD"
	| "EQUIPMENT_NOT_A_WEAPON"
	| "EQUIPMENT_NOT_A_SHIELD"
	| "EQUIPMENT_NOT_ARMOR"
	| "EQUIPMENT_WEAPON_UNUSABLE"
	| "EQUIPMENT_ITEM_UNUSABLE"
	| "EQUIPMENT_LOADOUT_HAND_CONFLICT"
	| "WEAPON_ATTACK_PROFILE_NOT_FOUND"
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

export type EquipmentWeaponMatrix = "physical" | "mental" | "social";

export interface EquipmentWeaponAttackProfileDefinition {
	readonly baseDiceTotal: number;
	readonly damageType: string;
	readonly diceExpression: string;
	readonly handsRequired: number;
	readonly matrix: EquipmentWeaponMatrix;
	readonly tags: readonly string[];
}

export interface EquipmentWeaponAttackProfile
	extends EquipmentWeaponAttackProfileDefinition {
	readonly durabilityCurrent: number;
	readonly durabilityMax: number;
	readonly id: string;
	readonly label: string;
	readonly mechanicalSummary: string;
	readonly slotCost: number;
	readonly sourceFile: string;
}

export type EquipmentLoadoutSlot = "mainHand" | "offHand" | "armor";

export interface EquipmentLoadoutInput {
	readonly mainHandWeaponId?: unknown;
	readonly offHandShieldId?: unknown;
	readonly armorId?: unknown;
}

export interface EquipmentLoadoutItemSnapshot {
	readonly durabilityCurrent: number;
	readonly durabilityMax: number;
	readonly id: string;
	readonly kind: "weapon" | "shield" | "armor";
	readonly label: string;
	readonly slotCost: number;
	readonly sourceFile: string;
}

export interface EquipmentLoadoutSnapshot {
	readonly activeWeaponProfile: EquipmentWeaponAttackProfile | null;
	readonly armor: EquipmentLoadoutItemSnapshot | null;
	readonly mainHand: EquipmentLoadoutItemSnapshot | null;
	readonly occupiedHands: number;
	readonly offHand: EquipmentLoadoutItemSnapshot | null;
}
