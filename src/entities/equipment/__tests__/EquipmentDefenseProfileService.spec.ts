import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { EquipmentCatalogRepository } from "../domain/EquipmentCatalogRepository";
import { EquipmentDefenseProfileService } from "../domain/EquipmentDefenseProfileService";
import { OFFICIAL_EQUIPMENT } from "../model/equipmentCatalog";
import type {
	ConsumableRecord,
	EquipmentRecord,
} from "../model/equipmentSchema";
import type {
	EquipmentDefenseProfile,
	EquipmentFailure,
	EquipmentRepositoryFailure,
} from "../model/equipmentTypes";
import { InMemoryEquipmentCatalogRepository } from "../testing/InMemoryEquipmentCatalogRepository";

describe("[Survival 04] EquipmentDefenseProfileService", () => {
	it("builds the official leather armor defense profile", async () => {
		const service = createService();

		const result = await service.buildDefenseProfile("leather-armor");
		const profile = expectDefenseProfileSuccess(result);

		expect(profile).toEqual({
			armorClassBonus: 2,
			durabilityCurrent: 100,
			durabilityMax: 100,
			id: "leather-armor",
			kind: "armor",
			label: "Armadura de Couro",
			mechanicalSummary: "+2 CA, Leve, sem penalidades. Item unico.",
			slotCost: 1,
			sourceFile: "docs/system/survival/04-arsenal-e-economia.md",
			tags: ["light", "no-penalty"],
		});
	});

	it("keeps official plate and shield CA bonuses explicit", async () => {
		const service = createService();

		const plate = await service.buildDefenseProfile("plate-armor");
		const shield = await service.buildDefenseProfile("round-shield");

		expect(expectDefenseProfileSuccess(plate)).toMatchObject({
			armorClassBonus: 5,
			kind: "armor",
			label: "Armadura de Placas",
			tags: ["heavy", "noisy", "speed-penalty-3m"],
		});
		expect(expectDefenseProfileSuccess(shield)).toMatchObject({
			armorClassBonus: 1,
			kind: "shield",
			label: "Escudo Redondo",
			tags: ["light", "free-hand-interaction"],
		});
	});

	it("rejects invalid ids before asking the repository", async () => {
		const repository = new InMemoryEquipmentCatalogRepository({
			consumables: [],
			equipment: OFFICIAL_EQUIPMENT,
		});
		const service = new EquipmentDefenseProfileService(repository);

		const result = await service.buildDefenseProfile("Armadura de Couro");
		const failure = expectDefenseProfileFailure(result);

		expect(failure.code).toBe("INVALID_EQUIPMENT_ID");
		expect(repository.equipmentLookupCount).toBe(0);
	});

	it("rejects weapons as non-defensive equipment", async () => {
		const service = createService();

		const result = await service.buildDefenseProfile("longsword");
		const failure = expectDefenseProfileFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_NOT_DEFENSIVE",
			details: { id: "longsword", kind: "weapon" },
		});
	});

	it("rejects broken defensive equipment before combat can display it", async () => {
		const service = createService([
			createEquipmentRecord({
				durabilityCurrent: 0,
				id: "round-shield",
				kind: "shield",
				label: "Escudo Redondo",
			}),
		]);

		const result = await service.buildDefenseProfile("round-shield");
		const failure = expectDefenseProfileFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_ITEM_UNUSABLE",
			details: { durabilityCurrent: 0, id: "round-shield" },
		});
	});

	it("maps repository read failures into service failures", async () => {
		const repository = new InMemoryEquipmentCatalogRepository({
			consumables: [],
			equipment: OFFICIAL_EQUIPMENT,
		});
		repository.failNextEquipmentFind({
			code: "EQUIPMENT_REPOSITORY_READ_FAILED",
			message: "Injected defense profile read failure.",
			details: { cause: "locked-equipment-catalog" },
		});
		const service = new EquipmentDefenseProfileService(repository);

		const result = await service.buildDefenseProfile("leather-armor");
		const failure = expectDefenseProfileFailure(result);

		expect(failure).toMatchObject({
			code: "EQUIPMENT_REPOSITORY_READ_FAILED",
			details: { cause: "locked-equipment-catalog" },
		});
	});

	it("rejects corrupted defensive records returned by the repository", async () => {
		const service = new EquipmentDefenseProfileService(
			new CorruptDefenseProfileRepository(),
		);

		const result = await service.buildDefenseProfile("leather-armor");
		const failure = expectDefenseProfileFailure(result);

		expect(failure.code).toBe("CORRUPTED_EQUIPMENT_RECORD");
		expect(failure.details?.issues).toContain(
			"label: Too small: expected string to have >=1 characters",
		);
	});

	it("rejects defensive equipment without a structured profile", async () => {
		const service = createService([
			createEquipmentRecord({
				id: "tower-shield",
				kind: "shield",
				label: "Escudo Torre",
			}),
		]);

		const result = await service.buildDefenseProfile("tower-shield");
		const failure = expectDefenseProfileFailure(result);

		expect(failure).toMatchObject({
			code: "DEFENSE_PROFILE_NOT_FOUND",
			details: { id: "tower-shield" },
		});
	});

	it("keeps starting kit armor without structured defense profiles", async () => {
		const service = createService();

		for (const id of ["chainmail", "luxury-padded-armor"]) {
			const result = await service.buildDefenseProfile(id);
			const failure = expectDefenseProfileFailure(result);

			expect(failure).toMatchObject({
				code: "DEFENSE_PROFILE_NOT_FOUND",
				details: { id },
			});
		}
	});
});

function createService(
	equipment: readonly EquipmentRecord[] = OFFICIAL_EQUIPMENT,
): EquipmentDefenseProfileService {
	return new EquipmentDefenseProfileService(
		new InMemoryEquipmentCatalogRepository({
			consumables: [],
			equipment,
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

function expectDefenseProfileSuccess(
	result: Result<EquipmentDefenseProfile, EquipmentFailure>,
): EquipmentDefenseProfile {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}.`);
}

function expectDefenseProfileFailure(
	result: Result<EquipmentDefenseProfile, EquipmentFailure>,
): EquipmentFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptDefenseProfileRepository implements EquipmentCatalogRepository {
	public async listEquipment(): Promise<
		Result<readonly EquipmentRecord[], EquipmentRepositoryFailure>
	> {
		return ok([]);
	}

	public async findEquipmentById(): Promise<
		Result<EquipmentRecord, EquipmentRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_EQUIPMENT[3],
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
