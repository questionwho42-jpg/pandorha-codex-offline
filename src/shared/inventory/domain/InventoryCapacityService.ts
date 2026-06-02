import type { ZodIssue } from "zod/v4";
import { PANDORHA_RULES } from "$lib/shared/game-rules";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	InventoryCapacityFailure,
	InventoryCapacityResult,
} from "../model/inventoryCapacityTypes";
import { inventoryCapacityInputSchema } from "../model/inventoryCapacityTypes";

export class InventoryCapacityService {
	/**
	 * @rule docs/system/survival/regras-peso-carga.md - Limite = Fisico + Resistencia + 6 Slots; acima do limite fica Lento; acima de limite + 5 fica Imobilizado.
	 */
	public calculateCapacity(
		input: unknown,
	): Result<InventoryCapacityResult, InventoryCapacityFailure> {
		const parsed = inventoryCapacityInputSchema.safeParse(input);
		if (!parsed.success) {
			return fail({
				code: "INVALID_INVENTORY_CAPACITY_INPUT",
				message: "Inventory capacity input failed validation.",
				details: { issues: formatIssues(parsed.error.issues) },
			});
		}

		const { physical, resistance, slotBonusTotal, items } = parsed.data;
		const slotLimit =
			physical +
			resistance +
			PANDORHA_RULES.LOGISTICS.BASE_SLOTS_ADDITION +
			slotBonusTotal;
		const usedSlots = items.reduce((total, item) => total + item.slotCost, 0);
		const excessSlots = Math.max(0, usedSlots - slotLimit);
		const state = determineCapacityState(usedSlots, slotLimit);
		const movementPenaltyMeters =
			state === "slowed" ? PANDORHA_RULES.LOGISTICS.SLOWED_PENALTY_METERS : 0;

		return ok({
			slotLimit,
			usedSlots,
			excessSlots,
			state,
			movementPenaltyMeters,
		});
	}
}

function determineCapacityState(
	usedSlots: number,
	slotLimit: number,
): InventoryCapacityResult["state"] {
	if (
		usedSlots >
		slotLimit + PANDORHA_RULES.LOGISTICS.OVERLOAD_IMMOBILIZED_THRESHOLD
	) {
		return "immobilized";
	}

	if (usedSlots > slotLimit) {
		return "slowed";
	}

	return "normal";
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
