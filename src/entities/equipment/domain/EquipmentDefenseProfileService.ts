import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { OFFICIAL_DEFENSE_PROFILE_DEFINITIONS } from "../model/equipmentCatalog";
import {
	equipmentIdSchema,
	equipmentSelectSchema,
} from "../model/equipmentSchema";
import type {
	EquipmentDefenseProfile,
	EquipmentFailure,
} from "../model/equipmentTypes";
import type { EquipmentCatalogRepository } from "./EquipmentCatalogRepository";

/**
 * @description Builds combat-display-safe defense profiles from armor and shield catalog records without changing save data, damage, or attack resolution.
 * @rule docs/system/survival/04-arsenal-e-economia.md - Couro grants +2 CA, Placas grants +5 CA, and Escudo Redondo grants +1 CA.
 */
export class EquipmentDefenseProfileService {
	public constructor(private readonly repository: EquipmentCatalogRepository) {}

	public async buildDefenseProfile(
		id: unknown,
	): Promise<Result<EquipmentDefenseProfile, EquipmentFailure>> {
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

		const equipment = parsedRecord.data;
		if (equipment.kind !== "armor" && equipment.kind !== "shield") {
			return fail({
				code: "EQUIPMENT_NOT_DEFENSIVE",
				message:
					"Equipment defense profiles can only be built from armor or shields.",
				details: { id: equipment.id, kind: equipment.kind },
			});
		}

		if (equipment.durabilityCurrent < 1) {
			return fail({
				code: "EQUIPMENT_ITEM_UNUSABLE",
				message: "Equipment durability is too low for defense profile use.",
				details: {
					durabilityCurrent: equipment.durabilityCurrent,
					id: equipment.id,
				},
			});
		}

		const definition = OFFICIAL_DEFENSE_PROFILE_DEFINITIONS[equipment.id];
		if (!definition) {
			return fail({
				code: "DEFENSE_PROFILE_NOT_FOUND",
				message: "Equipment does not have a structured defense profile yet.",
				details: { id: equipment.id },
			});
		}

		return ok({
			...definition,
			durabilityCurrent: equipment.durabilityCurrent,
			durabilityMax: equipment.durabilityMax,
			id: equipment.id,
			label: equipment.label,
			mechanicalSummary: equipment.mechanicalSummary,
			slotCost: equipment.slotCost,
			sourceFile: equipment.sourceFile,
		});
	}
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
