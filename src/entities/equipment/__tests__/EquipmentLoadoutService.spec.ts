import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { EquipmentCatalogRepository } from "../domain/EquipmentCatalogRepository";
import { EquipmentLoadoutService } from "../domain/EquipmentLoadoutService";
import { OFFICIAL_EQUIPMENT } from "../model/equipmentCatalog";
import type {
	ConsumableRecord,
	EquipmentRecord,
} from "../model/equipmentSchema";
import type {
	EquipmentFailure,
	EquipmentLoadoutSnapshot,
	EquipmentRepositoryFailure,
} from "../model/equipmentTypes";
import { InMemoryEquipmentCatalogRepository } from "../testing/InMemoryEquipmentCatalogRepository";

describe("[GDD 4] EquipmentLoadoutService", () => {
	it("builds an empty loadout without touching the catalog", async () => {
		const repository = createRepository();
		const service = new EquipmentLoadoutService(repository);

		const result = await service.buildLoadout({});
		const snapshot = expectLoadoutSuccess(result);

		expect(snapshot).toEqual({
			activeWeaponProfile: null,
			armor: null,
			mainHand: null,
			occupiedHands: 0,
			offHand: null,
		});
		expect(repository.equipmentLookupCount).toBe(0);
	});

	it("equips one-handed weapon, shield, and armor from official records", async () => {
		const service = createService();

		const result = await service.buildLoadout({
			armorId: "leather-armor",
			mainHandWeaponId: "longsword",
			offHandShieldId: "round-shield",
		});
		const snapshot = expectLoadoutSuccess(result);

		expect(snapshot.occupiedHands).toBe(2);
		expect(snapshot.mainHand).toMatchObject({
			id: "longsword",
			kind: "weapon",
			label: "Espada Longa",
			slotCost: 2,
		});
		expect(snapshot.offHand).toMatchObject({
			id: "round-shield",
			kind: "shield",
			label: "Escudo Redondo",
			slotCost: 1,
		});
		expect(snapshot.armor).toMatchObject({
			id: "leather-armor",
			kind: "armor",
			label: "Armadura de Couro",
			slotCost: 1,
		});
		expect(snapshot.activeWeaponProfile).toMatchObject({
			diceExpression: "1d8",
			handsRequired: 1,
			id: "longsword",
			matrix: "physical",
		});
	});

	it("allows a two-handed weapon when the off hand is empty", async () => {
		const service = createService();

		const result = await service.buildLoadout({
			mainHandWeaponId: "longbow",
		});
		const snapshot = expectLoadoutSuccess(result);

		expect(snapshot).toMatchObject({
			armor: null,
			occupiedHands: 2,
			offHand: null,
		});
		expect(snapshot.activeWeaponProfile).toMatchObject({
			handsRequired: 2,
			id: "longbow",
			tags: ["range-36m", "two-handed"],
		});
	});

	it("rejects invalid ids before asking the repository", async () => {
		const repository = createRepository();
		const service = new EquipmentLoadoutService(repository);

		const result = await service.buildLoadout({
			mainHandWeaponId: "Espada Longa",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure.code).toBe("INVALID_EQUIPMENT_ID");
		expect(repository.equipmentLookupCount).toBe(0);
	});

	it("rejects invalid ids in secondary slots before asking the repository", async () => {
		const repository = createRepository();
		const service = new EquipmentLoadoutService(repository);

		const result = await service.buildLoadout({
			offHandShieldId: "Escudo Redondo",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure).toMatchObject({
			code: "INVALID_EQUIPMENT_ID",
			details: { slot: "offHand" },
		});
		expect(repository.equipmentLookupCount).toBe(0);
	});

	it("rejects non-weapons in the main hand slot", async () => {
		const service = createService();

		const result = await service.buildLoadout({
			mainHandWeaponId: "leather-armor",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_NOT_A_WEAPON",
			details: { id: "leather-armor", kind: "armor" },
		});
	});

	it("rejects weapons in the off hand shield slot", async () => {
		const service = createService();

		const result = await service.buildLoadout({
			offHandShieldId: "dagger",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_NOT_A_SHIELD",
			details: { id: "dagger", kind: "weapon", slot: "offHand" },
		});
	});

	it("rejects shields in the armor slot", async () => {
		const service = createService();

		const result = await service.buildLoadout({
			armorId: "round-shield",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_NOT_ARMOR",
			details: { id: "round-shield", kind: "shield", slot: "armor" },
		});
	});

	it("rejects broken off-hand and armor items", async () => {
		const service = createService(
			createCatalogPatch({
				"leather-armor": { durabilityCurrent: 0 },
				"round-shield": { durabilityCurrent: 0 },
			}),
		);

		const brokenShield = await service.buildLoadout({
			offHandShieldId: "round-shield",
		});
		const brokenArmor = await service.buildLoadout({
			armorId: "leather-armor",
		});

		expect(expectLoadoutFailure(brokenShield)).toMatchObject({
			code: "EQUIPMENT_ITEM_UNUSABLE",
			details: { durabilityCurrent: 0, id: "round-shield", slot: "offHand" },
		});
		expect(expectLoadoutFailure(brokenArmor)).toMatchObject({
			code: "EQUIPMENT_ITEM_UNUSABLE",
			details: { durabilityCurrent: 0, id: "leather-armor", slot: "armor" },
		});
	});

	it("blocks shields when the main weapon requires both hands", async () => {
		const service = createService();

		const result = await service.buildLoadout({
			mainHandWeaponId: "longbow",
			offHandShieldId: "round-shield",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_LOADOUT_HAND_CONFLICT",
			details: {
				handsRequired: 2,
				mainHandWeaponId: "longbow",
				offHandShieldId: "round-shield",
			},
		});
	});

	it("maps repository failures from secondary slots", async () => {
		const repository = createRepository();
		repository.failNextEquipmentFind({
			code: "EQUIPMENT_REPOSITORY_READ_FAILED",
			message: "Injected loadout read failure.",
			details: { cause: "locked-equipment-catalog" },
		});
		const service = new EquipmentLoadoutService(repository);

		const result = await service.buildLoadout({
			offHandShieldId: "round-shield",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_REPOSITORY_READ_FAILED",
			details: { cause: "locked-equipment-catalog" },
		});
	});

	it("rejects corrupted records returned for secondary slots", async () => {
		const service = new EquipmentLoadoutService(new CorruptLoadoutRepository());

		const result = await service.buildLoadout({
			offHandShieldId: "round-shield",
		});
		const failure = expectLoadoutFailure(result);

		expect(failure.code).toBe("CORRUPTED_EQUIPMENT_RECORD");
		expect(failure.details?.issues).toContain(
			"label: Too small: expected string to have >=1 characters",
		);
	});
});

function createRepository(
	equipment: readonly EquipmentRecord[] = OFFICIAL_EQUIPMENT,
): InMemoryEquipmentCatalogRepository {
	return new InMemoryEquipmentCatalogRepository({
		consumables: [],
		equipment,
	});
}

function createService(
	equipment: readonly EquipmentRecord[] = OFFICIAL_EQUIPMENT,
): EquipmentLoadoutService {
	return new EquipmentLoadoutService(createRepository(equipment));
}

function createCatalogPatch(
	patchesById: Readonly<Record<string, Partial<EquipmentRecord>>>,
): readonly EquipmentRecord[] {
	return OFFICIAL_EQUIPMENT.map((record) => ({
		...record,
		...patchesById[record.id],
	}));
}

function expectLoadoutSuccess(
	result: Result<EquipmentLoadoutSnapshot, EquipmentFailure>,
): EquipmentLoadoutSnapshot {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}.`);
}

function expectLoadoutFailure(
	result: Result<EquipmentLoadoutSnapshot, EquipmentFailure>,
): EquipmentFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptLoadoutRepository implements EquipmentCatalogRepository {
	public async listEquipment(): Promise<
		Result<readonly EquipmentRecord[], EquipmentRepositoryFailure>
	> {
		return ok([]);
	}

	public async findEquipmentById(): Promise<
		Result<EquipmentRecord, EquipmentRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_EQUIPMENT[5],
			label: "",
		} as EquipmentRecord);
	}

	public async listConsumables(): Promise<
		Result<readonly ConsumableRecord[], EquipmentRepositoryFailure>
	> {
		return ok([]);
	}

	public async findConsumableById(): Promise<
		Result<ConsumableRecord, EquipmentRepositoryFailure>
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
