import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { EquipmentCatalogRepository } from "../domain/EquipmentCatalogRepository";
import { EquipmentWeaponAttackProfileService } from "../domain/EquipmentWeaponAttackProfileService";
import { OFFICIAL_EQUIPMENT } from "../model/equipmentCatalog";
import type { EquipmentRecord } from "../model/equipmentSchema";
import type {
	EquipmentFailure,
	EquipmentRepositoryFailure,
	EquipmentWeaponAttackProfile,
} from "../model/equipmentTypes";
import { InMemoryEquipmentCatalogRepository } from "../testing/InMemoryEquipmentCatalogRepository";

describe("[GDD 4] EquipmentWeaponAttackProfileService", () => {
	it("builds a longsword attack profile from the official equipment catalog", async () => {
		const service = createService();

		const result = await service.buildWeaponAttackProfile("longsword");
		const profile = expectWeaponProfileSuccess(result);

		expect(profile).toEqual({
			baseDiceTotal: 4,
			damageType: "physical",
			diceExpression: "1d8",
			durabilityCurrent: 100,
			durabilityMax: 100,
			handsRequired: 1,
			id: "longsword",
			label: "Espada Longa",
			matrix: "physical",
			mechanicalSummary: "1d8/1d10, Versatil. Item unico de treino.",
			slotCost: 2,
			sourceFile: "docs/system/survival/04-arsenal-e-economia.md",
			tags: ["versatile"],
		});
	});

	it("keeps ranged weapon matrix and slot facts explicit", async () => {
		const service = createService();

		const result = await service.buildWeaponAttackProfile("longbow");
		const profile = expectWeaponProfileSuccess(result);

		expect(profile).toMatchObject({
			baseDiceTotal: 4,
			diceExpression: "1d8",
			handsRequired: 2,
			label: "Arco Longo",
			matrix: "mental",
			slotCost: 2,
			tags: ["range-36m", "two-handed"],
		});
	});

	it("rejects invalid weapon ids before asking the repository", async () => {
		const repository = new InMemoryEquipmentCatalogRepository({
			equipment: OFFICIAL_EQUIPMENT,
			consumables: [],
		});
		const service = new EquipmentWeaponAttackProfileService(repository);

		const result = await service.buildWeaponAttackProfile("Espada Longa");
		const failure = expectWeaponProfileFailure(result);

		expect(failure.code).toBe("INVALID_EQUIPMENT_ID");
		expect(repository.equipmentLookupCount).toBe(0);
	});

	it("rejects catalog equipment that is not a weapon", async () => {
		const service = createService();

		const result = await service.buildWeaponAttackProfile("leather-armor");
		const failure = expectWeaponProfileFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_NOT_A_WEAPON",
			details: { id: "leather-armor", kind: "armor" },
		});
	});

	it("maps repository read failures into service failures", async () => {
		const repository = new InMemoryEquipmentCatalogRepository({
			equipment: OFFICIAL_EQUIPMENT,
			consumables: [],
		});
		repository.failNextEquipmentFind({
			code: "EQUIPMENT_REPOSITORY_READ_FAILED",
			message: "Injected weapon profile read failure.",
			details: { cause: "locked-equipment-catalog" },
		});
		const service = new EquipmentWeaponAttackProfileService(repository);

		const result = await service.buildWeaponAttackProfile("longsword");
		const failure = expectWeaponProfileFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_REPOSITORY_READ_FAILED",
			details: { cause: "locked-equipment-catalog" },
		});
	});

	it("rejects corrupted weapon records returned by the repository", async () => {
		const service = new EquipmentWeaponAttackProfileService(
			new CorruptWeaponProfileRepository(),
		);

		const result = await service.buildWeaponAttackProfile("longsword");
		const failure = expectWeaponProfileFailure(result);

		expect(failure.code).toBe("CORRUPTED_EQUIPMENT_RECORD");
		expect(failure.details?.issues).toContain(
			"label: Too small: expected string to have >=1 characters",
		);
	});

	it("rejects broken weapons before combat can use them", async () => {
		const service = createService([
			createEquipmentRecord({
				durabilityCurrent: 0,
				id: "longsword",
				kind: "weapon",
				label: "Espada Longa",
			}),
		]);

		const result = await service.buildWeaponAttackProfile("longsword");
		const failure = expectWeaponProfileFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_WEAPON_UNUSABLE",
			details: { durabilityCurrent: 0, id: "longsword" },
		});
	});

	it("rejects weapons that have no structured attack profile yet", async () => {
		const service = createService([
			createEquipmentRecord({
				id: "training-hammer",
				kind: "weapon",
				label: "Martelo de Treino",
			}),
		]);

		const result = await service.buildWeaponAttackProfile("training-hammer");
		const failure = expectWeaponProfileFailure(result);

		expect(failure).toMatchObject({
			code: "WEAPON_ATTACK_PROFILE_NOT_FOUND",
			details: { id: "training-hammer" },
		});
	});
});

function createService(
	equipment: readonly EquipmentRecord[] = OFFICIAL_EQUIPMENT,
): EquipmentWeaponAttackProfileService {
	return new EquipmentWeaponAttackProfileService(
		new InMemoryEquipmentCatalogRepository({
			equipment,
			consumables: [],
		}),
	);
}

function createEquipmentRecord(
	patch: Partial<EquipmentRecord>,
): EquipmentRecord {
	return {
		...OFFICIAL_EQUIPMENT[0],
		...patch,
	};
}

function expectWeaponProfileSuccess(
	result: Result<EquipmentWeaponAttackProfile, EquipmentFailure>,
): EquipmentWeaponAttackProfile {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}.`);
}

function expectWeaponProfileFailure(
	result: Result<EquipmentWeaponAttackProfile, EquipmentFailure>,
): EquipmentFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptWeaponProfileRepository implements EquipmentCatalogRepository {
	public async listEquipment(): Promise<
		Result<readonly EquipmentRecord[], EquipmentRepositoryFailure>
	> {
		return ok([]);
	}

	public async findEquipmentById(): Promise<
		Result<EquipmentRecord, EquipmentRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_EQUIPMENT[0],
			label: "",
		} as EquipmentRecord);
	}

	public async listConsumables(): Promise<
		Result<readonly never[], EquipmentRepositoryFailure>
	> {
		return ok([]);
	}

	public async findConsumableById(): Promise<
		Result<never, EquipmentRepositoryFailure>
	> {
		return {
			success: false,
			error: {
				code: "CONSUMABLE_NOT_FOUND",
				message: "Unused corrupt repository consumable lookup.",
			},
		};
	}
}
