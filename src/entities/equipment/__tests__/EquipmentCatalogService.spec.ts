import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import { ok } from "$lib/shared/lib/result";
import type { EquipmentCatalogRepository } from "../domain/EquipmentCatalogRepository";
import { EquipmentCatalogService } from "../domain/EquipmentCatalogService";
import {
	OFFICIAL_CONSUMABLES,
	OFFICIAL_EQUIPMENT,
} from "../model/equipmentCatalog";
import {
	type ConsumableRecord,
	consumableSelectSchema,
	type EquipmentRecord,
	equipmentSelectSchema,
} from "../model/equipmentSchema";
import type {
	EquipmentFailure,
	EquipmentRepositoryFailure,
} from "../model/equipmentTypes";
import { InMemoryEquipmentCatalogRepository } from "../testing/InMemoryEquipmentCatalogRepository";

describe("Official equipment catalog", () => {
	it("contains the minimum validated equipment and consumable records", () => {
		expect(OFFICIAL_EQUIPMENT).toHaveLength(7);
		expect(OFFICIAL_CONSUMABLES).toHaveLength(6);
		expect(OFFICIAL_EQUIPMENT.map((item) => item.id)).toEqual([
			"longsword",
			"dagger",
			"longbow",
			"leather-armor",
			"plate-armor",
			"round-shield",
			"magic-ring",
		]);
		expect(OFFICIAL_CONSUMABLES.map((item) => item.id)).toEqual([
			"rope-stack",
			"torch-stack",
			"ration-stack",
			"potion-belt-stack",
			"first-aid-kit",
			"gold-coins-stack",
		]);

		for (const item of OFFICIAL_EQUIPMENT) {
			expect(equipmentSelectSchema.safeParse(item).success).toBe(true);
			expect(item.id).toMatch(/^[a-z][a-z0-9-]*$/);
		}

		for (const item of OFFICIAL_CONSUMABLES) {
			expect(consumableSelectSchema.safeParse(item).success).toBe(true);
			expect(item.id).toMatch(/^[a-z][a-z0-9-]*$/);
		}
	});
});

describe("EquipmentCatalogService", () => {
	it("lists validated equipment records from the repository", async () => {
		const service = createService();

		const result = await service.listEquipment();
		const equipment = expectEquipmentSuccess(result);

		expect(equipment).toHaveLength(7);
		expect(equipment[0]).toMatchObject({
			id: "longsword",
			label: "Espada Longa",
			kind: "weapon",
			slotCost: 2,
			priceCopper: 5000,
		});
	});

	it("finds longsword by its English technical id", async () => {
		const service = createService();

		const result = await service.findEquipmentById("longsword");
		const equipment = expectEquipmentSuccess(result);

		expect(equipment).toMatchObject({
			id: "longsword",
			label: "Espada Longa",
			sourceFile: "docs/system/survival/04-arsenal-e-economia.md",
		});
	});

	it("lists validated consumables from the repository", async () => {
		const service = createService();

		const result = await service.listConsumables();
		const consumables = expectEquipmentSuccess(result);

		expect(consumables).toHaveLength(6);
		expect(consumables).toContainEqual(
			expect.objectContaining({
				id: "potion-belt-stack",
				label: "Cinto de Pocoes",
				quantity: 5,
				maxQuantityPerStack: 5,
				slotCostPerStack: 1,
			}),
		);
	});

	it("finds zero-slot gold coin stacks", async () => {
		const service = createService();

		const result = await service.findConsumableById("gold-coins-stack");
		const consumable = expectEquipmentSuccess(result);

		expect(consumable).toMatchObject({
			id: "gold-coins-stack",
			quantity: 100,
			maxQuantityPerStack: 100,
			slotCostPerStack: 0,
		});
	});

	it("rejects invalid equipment ids before asking the repository", async () => {
		const repository = createRepository();
		const service = new EquipmentCatalogService(repository);

		const result = await service.findEquipmentById("Espada Longa");
		const failure = expectEquipmentFailure(result);

		expect(failure.code).toBe("INVALID_EQUIPMENT_ID");
		expect(repository.equipmentLookupCount).toBe(0);
	});

	it("rejects invalid consumable ids before asking the repository", async () => {
		const repository = createRepository();
		const service = new EquipmentCatalogService(repository);

		const result = await service.findConsumableById("Cinto de Pocoes");
		const failure = expectEquipmentFailure(result);

		expect(failure.code).toBe("INVALID_CONSUMABLE_ID");
		expect(repository.consumableLookupCount).toBe(0);
	});

	it("returns not found for missing equipment and consumables", async () => {
		const service = createService();

		const missingEquipment = await service.findEquipmentById("missing-item");
		const missingConsumable = await service.findConsumableById("missing-stack");

		expect(expectEquipmentFailure(missingEquipment).code).toBe(
			"EQUIPMENT_NOT_FOUND",
		);
		expect(expectEquipmentFailure(missingConsumable).code).toBe(
			"CONSUMABLE_NOT_FOUND",
		);
	});

	it("maps repository read failures into service failures", async () => {
		const repository = createRepository();
		repository.failNextEquipmentList({
			code: "EQUIPMENT_REPOSITORY_READ_FAILED",
			message: "Injected equipment read failure.",
			details: { cause: "locked-equipment-catalog" },
		});
		repository.failNextConsumableList({
			code: "CONSUMABLE_REPOSITORY_READ_FAILED",
			message: "Injected consumable read failure.",
			details: { cause: "locked-consumable-catalog" },
		});
		const service = new EquipmentCatalogService(repository);

		expect(expectEquipmentFailure(await service.listEquipment())).toMatchObject(
			{
				code: "EQUIPMENT_REPOSITORY_READ_FAILED",
				details: { cause: "locked-equipment-catalog" },
			},
		);
		expect(
			expectEquipmentFailure(await service.listConsumables()),
		).toMatchObject({
			code: "CONSUMABLE_REPOSITORY_READ_FAILED",
			details: { cause: "locked-consumable-catalog" },
		});
	});

	it("rejects corrupted records returned by the repository", async () => {
		const service = new EquipmentCatalogService(
			new CorruptEquipmentRepository(),
		);

		expect(expectEquipmentFailure(await service.listEquipment()).code).toBe(
			"CORRUPTED_EQUIPMENT_RECORD",
		);
		expect(expectEquipmentFailure(await service.listConsumables()).code).toBe(
			"CORRUPTED_CONSUMABLE_RECORD",
		);
		expect(
			expectEquipmentFailure(await service.findEquipmentById("longsword")).code,
		).toBe("CORRUPTED_EQUIPMENT_RECORD");
		expect(
			expectEquipmentFailure(await service.findConsumableById("rope-stack"))
				.code,
		).toBe("CORRUPTED_CONSUMABLE_RECORD");
	});
});

function createRepository(): InMemoryEquipmentCatalogRepository {
	return new InMemoryEquipmentCatalogRepository({
		equipment: OFFICIAL_EQUIPMENT,
		consumables: OFFICIAL_CONSUMABLES,
	});
}

function createService(): EquipmentCatalogService {
	return new EquipmentCatalogService(createRepository());
}

function expectEquipmentSuccess<Success>(
	result: Result<Success, EquipmentFailure>,
): Success {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectEquipmentFailure<Success>(
	result: Result<Success, EquipmentFailure>,
): EquipmentFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}

class CorruptEquipmentRepository implements EquipmentCatalogRepository {
	public async listEquipment(): Promise<
		Result<readonly EquipmentRecord[], EquipmentRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_EQUIPMENT[0],
				label: "",
			} as EquipmentRecord,
		]);
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
		Result<readonly ConsumableRecord[], EquipmentRepositoryFailure>
	> {
		return ok([
			{
				...OFFICIAL_CONSUMABLES[0],
				quantity: 0,
			} as ConsumableRecord,
		]);
	}

	public async findConsumableById(): Promise<
		Result<ConsumableRecord, EquipmentRepositoryFailure>
	> {
		return ok({
			...OFFICIAL_CONSUMABLES[0],
			quantity: 0,
		} as ConsumableRecord);
	}
}
