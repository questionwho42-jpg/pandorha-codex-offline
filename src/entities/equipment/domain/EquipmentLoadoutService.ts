import type { ZodIssue } from "zod/v4";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import {
	type EquipmentRecord,
	equipmentIdSchema,
	equipmentSelectSchema,
} from "../model/equipmentSchema";
import type {
	EquipmentFailure,
	EquipmentFailureCode,
	EquipmentLoadoutInput,
	EquipmentLoadoutItemSnapshot,
	EquipmentLoadoutSlot,
	EquipmentLoadoutSnapshot,
	EquipmentWeaponAttackProfile,
} from "../model/equipmentTypes";
import type { EquipmentCatalogRepository } from "./EquipmentCatalogRepository";
import { EquipmentWeaponAttackProfileService } from "./EquipmentWeaponAttackProfileService";

type LoadoutKindSlot = Extract<EquipmentLoadoutSlot, "offHand" | "armor">;

interface MainHandResolution {
	readonly item: EquipmentLoadoutItemSnapshot | null;
	readonly profile: EquipmentWeaponAttackProfile | null;
}

/**
 * @description Builds a pure equipment loadout snapshot from catalog ids without mutating inventory, save data, durability, or combat state.
 * @rule docs/architecture/gdd.md - equipped items have slots, occupied hands, and durability before full damage rules.
 * @rule docs/system/survival/04-arsenal-e-economia.md - weapons, shields, and armor define hand/slot constraints and durability context.
 */
export class EquipmentLoadoutService {
	private readonly weaponProfileService: EquipmentWeaponAttackProfileService;

	public constructor(private readonly repository: EquipmentCatalogRepository) {
		this.weaponProfileService = new EquipmentWeaponAttackProfileService(
			repository,
		);
	}

	public async buildLoadout(
		input: EquipmentLoadoutInput,
	): Promise<Result<EquipmentLoadoutSnapshot, EquipmentFailure>> {
		const mainHand = await this.resolveMainHand(input.mainHandWeaponId);
		if (!mainHand.success) {
			return fail(mainHand.error);
		}

		const offHand = await this.resolveEquipmentSlot({
			expectedKind: "shield",
			id: input.offHandShieldId,
			slot: "offHand",
			slotMismatchCode: "EQUIPMENT_NOT_A_SHIELD",
		});
		if (!offHand.success) {
			return fail(offHand.error);
		}

		const armor = await this.resolveEquipmentSlot({
			expectedKind: "armor",
			id: input.armorId,
			slot: "armor",
			slotMismatchCode: "EQUIPMENT_NOT_ARMOR",
		});
		if (!armor.success) {
			return fail(armor.error);
		}

		if (
			mainHand.data.profile &&
			mainHand.data.profile.handsRequired > 1 &&
			offHand.data
		) {
			return fail({
				code: "EQUIPMENT_LOADOUT_HAND_CONFLICT",
				message: "Two-handed weapons cannot be equipped with an off-hand item.",
				details: {
					handsRequired: mainHand.data.profile.handsRequired,
					mainHandWeaponId: mainHand.data.profile.id,
					offHandShieldId: offHand.data.id,
				},
			});
		}

		return ok({
			activeWeaponProfile: mainHand.data.profile,
			armor: armor.data,
			mainHand: mainHand.data.item,
			occupiedHands:
				(mainHand.data.profile?.handsRequired ?? 0) + (offHand.data ? 1 : 0),
			offHand: offHand.data,
		});
	}

	private async resolveMainHand(
		id: unknown,
	): Promise<Result<MainHandResolution, EquipmentFailure>> {
		if (!hasSlotId(id)) {
			return ok({ item: null, profile: null });
		}

		const profile =
			await this.weaponProfileService.buildWeaponAttackProfile(id);
		if (!profile.success) {
			return fail(profile.error);
		}

		return ok({
			item: createWeaponSnapshot(profile.data),
			profile: profile.data,
		});
	}

	private async resolveEquipmentSlot(input: {
		readonly expectedKind: "shield" | "armor";
		readonly id: unknown;
		readonly slot: LoadoutKindSlot;
		readonly slotMismatchCode: Extract<
			EquipmentFailureCode,
			"EQUIPMENT_NOT_A_SHIELD" | "EQUIPMENT_NOT_ARMOR"
		>;
	}): Promise<Result<EquipmentLoadoutItemSnapshot | null, EquipmentFailure>> {
		if (!hasSlotId(input.id)) {
			return ok(null);
		}

		const parsedId = equipmentIdSchema.safeParse(input.id);
		if (!parsedId.success) {
			return fail({
				code: "INVALID_EQUIPMENT_ID",
				message: "Equipment id does not match the catalog id format.",
				details: {
					issues: formatIssues(parsedId.error.issues),
					slot: input.slot,
				},
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

		if (parsedRecord.data.kind !== input.expectedKind) {
			return fail({
				code: input.slotMismatchCode,
				message: "Equipment kind does not match the requested loadout slot.",
				details: {
					expectedKind: input.expectedKind,
					id: parsedRecord.data.id,
					kind: parsedRecord.data.kind,
					slot: input.slot,
				},
			});
		}

		if (parsedRecord.data.durabilityCurrent < 1) {
			return fail({
				code: "EQUIPMENT_ITEM_UNUSABLE",
				message: "Equipment durability is too low for loadout use.",
				details: {
					durabilityCurrent: parsedRecord.data.durabilityCurrent,
					id: parsedRecord.data.id,
					slot: input.slot,
				},
			});
		}

		return ok(createEquipmentSnapshot(parsedRecord.data));
	}
}

function hasSlotId(id: unknown): boolean {
	return id != null;
}

function createWeaponSnapshot(
	profile: EquipmentWeaponAttackProfile,
): EquipmentLoadoutItemSnapshot {
	return {
		durabilityCurrent: profile.durabilityCurrent,
		durabilityMax: profile.durabilityMax,
		id: profile.id,
		kind: "weapon",
		label: profile.label,
		slotCost: profile.slotCost,
		sourceFile: profile.sourceFile,
	};
}

function createEquipmentSnapshot(
	equipment: EquipmentRecord,
): EquipmentLoadoutItemSnapshot {
	return {
		durabilityCurrent: equipment.durabilityCurrent,
		durabilityMax: equipment.durabilityMax,
		id: equipment.id,
		kind: equipment.kind,
		label: equipment.label,
		slotCost: equipment.slotCost,
		sourceFile: equipment.sourceFile,
	};
}

function formatIssues(issues: readonly ZodIssue[]): readonly string[] {
	return issues.map(
		(issue) => `${issue.path.join(".") || "root"}: ${issue.message}`,
	);
}
