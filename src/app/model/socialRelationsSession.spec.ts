import { describe, expect, it } from "vitest";
import { TRAINING_FACTION_STANDINGS } from "$lib/entities/faction";
import { createSocialRelationsSession } from "./socialRelationsSession";

describe("createSocialRelationsSession", () => {
	it("wraps fame loss and clamps Fame at zero", async () => {
		const session = createSocialRelationsSession();
		const result = await session.loseFame(
			{ ...TRAINING_FACTION_STANDINGS[0], fameLevel: 1 },
			5,
		);

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected success, received ${result.error.code}`);
		}

		expect(result.data.standing.fameLevel).toBe(0);
		expect(result.data.debtLimit).toBe(0);
	});

	it("keeps the ultimatum rule when Fame loss lowers the debt limit below current debt", async () => {
		const session = createSocialRelationsSession();
		const result = await session.loseFame(
			{
				...TRAINING_FACTION_STANDINGS[0],
				bloodDebt: 4,
				fameLevel: 2,
			},
			1,
		);

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected success, received ${result.error.code}`);
		}

		expect(result.data.standing).toMatchObject({
			bloodDebt: 4,
			fameLevel: 1,
			status: "ultimatum",
		});
		expect(result.data.debtLimit).toBe(3);
	});

	it("wraps infamy gain and clamps Infâmia at five", async () => {
		const session = createSocialRelationsSession();
		const result = await session.gainInfamy(
			{ ...TRAINING_FACTION_STANDINGS[0], infamyLevel: 4 },
			2,
		);

		expect(result.success).toBe(true);
		if (!result.success) {
			expect.fail(`Expected success, received ${result.error.code}`);
		}

		expect(result.data.standing.infamyLevel).toBe(5);
		expect(result.data.event.type).toBe("faction-infamy-gained");
	});
});
