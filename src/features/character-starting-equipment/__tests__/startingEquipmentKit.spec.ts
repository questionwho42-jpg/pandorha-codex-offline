import { describe, expect, it } from "vitest";
import type { Result } from "$lib/shared/lib/result";
import {
	resolveStartingEquipmentKit,
	type StartingEquipmentKit,
	type StartingEquipmentKitFailure,
} from "../model/startingEquipmentKit";

describe("resolveStartingEquipmentKit", () => {
	it("resolves the approved vanguard starting kit", () => {
		const kit = expectKitSuccess(
			resolveStartingEquipmentKit({ classId: "vanguard" }),
		);

		expect(kit).toEqual({
			classId: "vanguard",
			label: "Vanguarda",
			items: [
				{
					catalogKind: "equipment",
					catalogItemId: "chainmail",
					count: 1,
				},
				{
					catalogKind: "equipment",
					catalogItemId: "longsword",
					count: 1,
				},
				{
					catalogKind: "equipment",
					catalogItemId: "round-shield",
					count: 1,
				},
				{
					catalogKind: "consumable",
					catalogItemId: "adventurer-kit-stack",
					quantity: 1,
				},
			],
		});
	});

	it("keeps the duplicate weaver dagger as two separate equipment grants", () => {
		const kit = expectKitSuccess(
			resolveStartingEquipmentKit({ classId: "weaver" }),
		);

		expect(kit.items).toEqual([
			{ catalogKind: "equipment", catalogItemId: "staff", count: 1 },
			{
				catalogKind: "consumable",
				catalogItemId: "grimoire-stack",
				quantity: 1,
			},
			{ catalogKind: "equipment", catalogItemId: "dagger", count: 2 },
			{
				catalogKind: "consumable",
				catalogItemId: "adventurer-kit-stack",
				quantity: 1,
			},
		]);
	});

	it("returns typed failures for unsupported classes", () => {
		const result = resolveStartingEquipmentKit({ classId: "paladin" });

		expect(result).toEqual({
			success: false,
			error: {
				code: "STARTING_EQUIPMENT_CLASS_NOT_SUPPORTED",
				message: "Starting equipment kit is not approved for this class.",
				details: { classId: "paladin" },
			},
		});
	});
});

function expectKitSuccess(
	result: Result<StartingEquipmentKit, StartingEquipmentKitFailure>,
): StartingEquipmentKit {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected starting equipment kit, received ${result.error.code}`);
}
