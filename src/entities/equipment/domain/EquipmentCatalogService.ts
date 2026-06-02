import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type ConsumableRecord,
	consumableIdSchema,
	consumableSelectSchema,
	type EquipmentRecord,
	equipmentIdSchema,
	equipmentSelectSchema,
} from "../model/equipmentSchema";
import type { EquipmentFailure } from "../model/equipmentTypes";
import type { EquipmentCatalogRepository } from "./EquipmentCatalogRepository";

/**
 * @description Exposes the minimum equipment and consumable catalog without applying inventory, combat, rune, or durability mechanics.
 * @rule docs/architecture/blueprint.md - equipment are unique instances, while consumables are stacked quantity records
 * @rule docs/system/survival/04-arsenal-e-economia.md - arsenal records define examples of weapons, armor, shields, slots, price, and rune tier
 */
export class EquipmentCatalogService {
	public constructor(private readonly repository: EquipmentCatalogRepository) {}

	public async listEquipment(): Promise<
		Result<readonly EquipmentRecord[], EquipmentFailure>
	> {
		const listed = await this.repository.listEquipment();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: EquipmentRecord[] = [];
		for (const record of listed.data) {
			const parsed = equipmentSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_EQUIPMENT_RECORD",
					message: "Equipment record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findEquipmentById(
		id: unknown,
	): Promise<Result<EquipmentRecord, EquipmentFailure>> {
		const parsedId = equipmentIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_EQUIPMENT_ID",
				message: "Equipment id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findEquipmentById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = equipmentSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_EQUIPMENT_RECORD",
				message: "Equipment record failed output validation.",
				details: { issues: formatIssues(parsedRecord.error.issues) },
			});
		}

		return ok(parsedRecord.data);
	}

	public async listConsumables(): Promise<
		Result<readonly ConsumableRecord[], EquipmentFailure>
	> {
		const listed = await this.repository.listConsumables();
		if (!listed.success) {
			return fail(listed.error);
		}

		const validated: ConsumableRecord[] = [];
		for (const record of listed.data) {
			const parsed = consumableSelectSchema.safeParse(record);
			if (!parsed.success) {
				return fail({
					code: "CORRUPTED_CONSUMABLE_RECORD",
					message: "Consumable record failed output validation.",
					details: { issues: formatIssues(parsed.error.issues) },
				});
			}

			validated.push(parsed.data);
		}

		return ok(validated);
	}

	public async findConsumableById(
		id: unknown,
	): Promise<Result<ConsumableRecord, EquipmentFailure>> {
		const parsedId = consumableIdSchema.safeParse(id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_CONSUMABLE_ID",
				message: "Consumable id does not match the catalog id format.",
				details: { issues: formatIssues(parsedId.error.issues) },
			});
		}

		const found = await this.repository.findConsumableById(parsedId.data);
		if (!found.success) {
			return fail(found.error);
		}

		const parsedRecord = consumableSelectSchema.safeParse(found.data);
		if (!parsedRecord.success) {
			return fail({
				code: "CORRUPTED_CONSUMABLE_RECORD",
				message: "Consumable record failed output validation.",
				details: { issues: formatIssues(parsedRecord.error.issues) },
			});
		}

		return ok(parsedRecord.data);
	}
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
