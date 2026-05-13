import { z } from "zod/v4";

const inventoryItemId = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9-]*$/)
	.max(80);
const inventoryItemLabel = z.string().trim().min(1).max(120);
const aptitudeValue = z.number().int().min(0).max(20);
const slotBonus = z.number().int().min(0).max(100);
const slotCost = z.number().int().min(0).max(100);

export const inventoryCapacityItemSchema = z.object({
	id: inventoryItemId,
	label: inventoryItemLabel,
	slotCost,
});

export const inventoryCapacityInputSchema = z.object({
	physical: aptitudeValue,
	resistance: aptitudeValue,
	slotBonusTotal: slotBonus.optional().default(0),
	items: z.array(inventoryCapacityItemSchema).max(200),
});

export const inventoryCapacityStateSchema = z.enum([
	"normal",
	"slowed",
	"immobilized",
]);

export type InventoryCapacityFailureCode = "INVALID_INVENTORY_CAPACITY_INPUT";

export interface InventoryCapacityFailure {
	readonly code: InventoryCapacityFailureCode;
	readonly message: string;
	readonly details?: Readonly<Record<string, unknown>>;
}

export type InventoryCapacityItemInput = z.infer<
	typeof inventoryCapacityItemSchema
>;

export type InventoryCapacityInput = z.input<
	typeof inventoryCapacityInputSchema
>;

export type InventoryCapacityState = z.infer<
	typeof inventoryCapacityStateSchema
>;

export interface InventoryCapacityResult {
	readonly slotLimit: number;
	readonly usedSlots: number;
	readonly excessSlots: number;
	readonly state: InventoryCapacityState;
	readonly movementPenaltyMeters: number;
}
