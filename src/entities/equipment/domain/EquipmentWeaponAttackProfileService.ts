import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { EquipmentCatalogRepository } from "../domain/EquipmentCatalogRepository";
import { OFFICIAL_WEAPON_ATTACK_PROFILE_DEFINITIONS } from "../model/equipmentCatalog";
import {
	equipmentIdSchema,
	equipmentSelectSchema,
} from "../model/equipmentSchema";
import type {
	EquipmentFailure,
	EquipmentWeaponAttackProfile,
} from "../model/equipmentTypes";

/**
 * @description Builds the first combat-safe profile for real catalog weapons without mutating inventory, durability, save data, or damage rolls.
 * @rule docs/architecture/gdd.md - equipped items have slots, occupied hands, and durability before full damage rules.
 * @rule docs/system/combat/18-tratado-de-dano.md - weapon attacks use weapon dice + attack matrix + extra modifiers.
 * @rule docs/system/survival/04-arsenal-e-economia.md - weapon examples define dice, tags, slots, hands, and durability context.
 */
export class EquipmentWeaponAttackProfileService {
	public constructor(private readonly repository: EquipmentCatalogRepository) {}

	public async buildWeaponAttackProfile(
		id: unknown,
	): Promise<Result<EquipmentWeaponAttackProfile, EquipmentFailure>> {
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
		if (equipment.kind !== "weapon") {
			return fail({
				code: "EQUIPMENT_NOT_A_WEAPON",
				message: "Equipment attack profiles can only be built from weapons.",
				details: { id: equipment.id, kind: equipment.kind },
			});
		}

		if (equipment.durabilityCurrent < 1) {
			return fail({
				code: "EQUIPMENT_WEAPON_UNUSABLE",
				message: "Weapon durability is too low for combat.",
				details: {
					durabilityCurrent: equipment.durabilityCurrent,
					id: equipment.id,
				},
			});
		}

		const definition = OFFICIAL_WEAPON_ATTACK_PROFILE_DEFINITIONS[equipment.id];
		if (!definition) {
			return fail({
				code: "WEAPON_ATTACK_PROFILE_NOT_FOUND",
				message: "Weapon does not have a structured attack profile yet.",
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
