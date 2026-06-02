import { describe, expect, it } from "vitest";
import {
	type FactionStandingRecord,
	InMemoryFactionCatalogRepository,
	TRAINING_FACTION_STANDINGS,
	TRAINING_FACTIONS,
} from "$lib/entities/faction";
import type { Result } from "$lib/shared/lib/result";
import { SocialStandingService } from "../domain/SocialStandingService";
import type {
	SocialDebtLimitResult,
	SocialStandingChangeResult,
	SocialStandingFailure,
} from "../model/socialStandingTypes";

describe("SocialStandingService", () => {
	it("calculates debt limit as fame level multiplied by three", () => {
		const result = createService().calculateDebtLimit({ fameLevel: 2 });
		const debtLimit = expectDebtLimitSuccess(result);

		expect(debtLimit).toEqual({
			fameLevel: 2,
			debtLimit: 6,
		});
	});

	it("invokes a Tier 1 favor and increases blood debt and intrigue", async () => {
		const standing = buildStanding({ bloodDebt: 0, intriguePoints: 0 });
		const result = await createService().invokeFavor({ standing, tier: 1 });
		const change = expectChangeSuccess(result);

		expect(change.standing).toMatchObject({
			bloodDebt: 1,
			intriguePoints: 1,
			status: "sponsored",
		});
		expect(change.debtLimit).toBe(3);
		expect(change.event).toMatchObject({
			type: "faction-favor-invoked",
			message: "Favor Tier 1 invocado. Dívida de Sangue 1/3; Intriga 1.",
		});
		expect(standing).toMatchObject({ bloodDebt: 0, intriguePoints: 0 });
	});

	it("rejects favor tiers that would reach or exceed the debt limit", async () => {
		const result = await createService().invokeFavor({
			standing: buildStanding({ bloodDebt: 2, fameLevel: 1 }),
			tier: 1,
		});
		const failure = expectFailure(result);

		expect(failure).toMatchObject({
			code: "DEBT_LIMIT_EXCEEDED",
			details: { nextDebt: 3, debtLimit: 3 },
		});
	});

	it("rejects invalid input and unsupported standing status", async () => {
		const service = createService();

		expect(
			expectFailure(service.calculateDebtLimit({ fameLevel: 6 })).code,
		).toBe("INVALID_SOCIAL_STANDING_INPUT");
		expect(
			expectFailure(
				await service.invokeFavor({ standing: buildStanding(), tier: 5 }),
			).code,
		).toBe("INVALID_SOCIAL_STANDING_INPUT");
		expect(
			expectFailure(
				await service.invokeFavor({
					standing: buildStanding({ status: "unpledged" }),
					tier: 1,
				}),
			).code,
		).toBe("OPERATION_NOT_ALLOWED");
	});

	it("rejects invalid inputs for every social standing mutation", async () => {
		const service = createService();

		expect(
			expectFailure(await service.redeemDebt({ standing: buildStanding() }))
				.code,
		).toBe("INVALID_SOCIAL_STANDING_INPUT");
		expect(
			expectFailure(await service.gainFame({ standing: buildStanding() })).code,
		).toBe("INVALID_SOCIAL_STANDING_INPUT");
		expect(
			expectFailure(await service.gainInfamy({ standing: buildStanding() }))
				.code,
		).toBe("INVALID_SOCIAL_STANDING_INPUT");
		expect(
			expectFailure(await service.loseFame(undefined)).details,
		).toMatchObject({
			issues: ["root: Invalid input: expected object, received undefined"],
		});
	});

	it("redeems blood debt by mission tier without dropping below zero", async () => {
		const service = createService();

		const reduced = expectChangeSuccess(
			await service.redeemDebt({
				standing: buildStanding({ bloodDebt: 2 }),
				tier: 1,
			}),
		);
		const cleared = expectChangeSuccess(
			await service.redeemDebt({
				standing: buildStanding({ bloodDebt: 1 }),
				tier: 4,
			}),
		);

		expect(reduced.standing.bloodDebt).toBe(1);
		expect(cleared.standing.bloodDebt).toBe(0);
		expect(reduced.event.message).toBe(
			"Missão de redenção Tier 1 concluída. Dívida de Sangue 1/3.",
		);
	});

	it("restores sponsored status when ultimatum debt is redeemed below limit", async () => {
		const result = await createService().redeemDebt({
			standing: buildStanding({
				bloodDebt: 4,
				fameLevel: 1,
				status: "ultimatum",
			}),
			tier: 2,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing).toMatchObject({
			bloodDebt: 2,
			status: "sponsored",
		});
	});

	it("keeps current debt status when redemption does not clear the ultimatum", async () => {
		const result = await createService().redeemDebt({
			standing: buildStanding({
				bloodDebt: 6,
				fameLevel: 1,
				status: "ultimatum",
			}),
			tier: 1,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing).toMatchObject({
			bloodDebt: 5,
			status: "ultimatum",
		});
	});

	it("keeps non-ultimatum status while redeeming debt", async () => {
		const result = await createService().redeemDebt({
			standing: buildStanding({
				bloodDebt: 2,
				status: "hunted",
			}),
			tier: 1,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing).toMatchObject({
			bloodDebt: 1,
			status: "hunted",
		});
	});

	it("gains fame and clamps at fame level five", async () => {
		const result = await createService().gainFame({
			standing: buildStanding({ fameLevel: 4 }),
			levels: 3,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing.fameLevel).toBe(5);
		expect(change.debtLimit).toBe(15);
		expect(change.event.message).toBe(
			"Fama com a facção aumentou para 5. Limite de Dívida 15.",
		);
	});

	it("clears ultimatum when fame gain makes current debt valid again", async () => {
		const result = await createService().gainFame({
			standing: buildStanding({
				bloodDebt: 4,
				fameLevel: 1,
				status: "ultimatum",
			}),
			levels: 1,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing).toMatchObject({
			fameLevel: 2,
			status: "sponsored",
		});
	});

	it("keeps current status when fame gain does not change ultimatum state", async () => {
		const service = createService();

		const sponsored = expectChangeSuccess(
			await service.gainFame({
				standing: buildStanding({
					bloodDebt: 0,
					fameLevel: 1,
					status: "sponsored",
				}),
				levels: 1,
			}),
		);
		const ultimatum = expectChangeSuccess(
			await service.gainFame({
				standing: buildStanding({
					bloodDebt: 10,
					fameLevel: 1,
					status: "ultimatum",
				}),
				levels: 1,
			}),
		);

		expect(sponsored.standing.status).toBe("sponsored");
		expect(ultimatum.standing.status).toBe("ultimatum");
	});

	it("loses fame and marks ultimatum when debt exceeds the new limit", async () => {
		const result = await createService().loseFame({
			standing: buildStanding({ bloodDebt: 4, fameLevel: 2 }),
			levels: 1,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing).toMatchObject({
			fameLevel: 1,
			status: "ultimatum",
		});
		expect(change.debtLimit).toBe(3);
	});

	it("clamps fame loss at zero without mutating the input", async () => {
		const standing = buildStanding({ fameLevel: 1, bloodDebt: 0 });

		const result = await createService().loseFame({
			standing,
			levels: 5,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing.fameLevel).toBe(0);
		expect(change.standing.status).toBe("sponsored");
		expect(standing.fameLevel).toBe(1);
	});

	it("keeps current status when fame loss remains within the debt limit", async () => {
		const result = await createService().loseFame({
			standing: buildStanding({
				bloodDebt: 2,
				fameLevel: 2,
				status: "sponsored",
			}),
			levels: 1,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing).toMatchObject({
			fameLevel: 1,
			status: "sponsored",
		});
		expect(change.debtLimit).toBe(3);
	});

	it("gains infamy and clamps at infamy level five", async () => {
		const standing = buildStanding({ fameLevel: 0, infamyLevel: 4 });

		const result = await createService().gainInfamy({
			standing,
			levels: 3,
		});
		const change = expectChangeSuccess(result);

		expect(change.standing.infamyLevel).toBe(5);
		expect(change.standing.fameLevel).toBe(0);
		expect(change.debtLimit).toBe(0);
		expect(change.event).toEqual({
			type: "faction-infamy-gained",
			message: "Infâmia com a facção aumentou para 5.",
		});
		expect(standing.infamyLevel).toBe(4);
	});

	it("returns typed failures when faction is missing or lookup fails", async () => {
		const emptyRepository = new InMemoryFactionCatalogRepository({
			factions: [],
			standings: [],
		});
		const failingRepository = createRepository();
		failingRepository.failNextFactionFind({
			code: "FACTION_REPOSITORY_READ_FAILED",
			message: "Injected faction lookup failure.",
			details: { cause: "locked-faction" },
		});

		expect(
			expectFailure(
				await new SocialStandingService(emptyRepository).invokeFavor({
					standing: buildStanding(),
					tier: 1,
				}),
			).code,
		).toBe("FACTION_NOT_FOUND");
		expect(
			expectFailure(
				await new SocialStandingService(failingRepository).redeemDebt({
					standing: buildStanding(),
					tier: 1,
				}),
			),
		).toMatchObject({
			code: "FACTION_LOOKUP_FAILED",
			details: { cause: "locked-faction" },
		});
	});

	it("returns typed lookup failures even when repository details are absent", async () => {
		const missingRepository = createRepository();
		const failingRepository = createRepository();
		const infamyMissingRepository = createRepository();
		missingRepository.failNextFactionFind({
			code: "FACTION_NOT_FOUND",
			message: "Injected missing faction.",
		});
		failingRepository.failNextFactionFind({
			code: "FACTION_REPOSITORY_READ_FAILED",
			message: "Injected faction lookup failure.",
		});
		infamyMissingRepository.failNextFactionFind({
			code: "FACTION_NOT_FOUND",
			message: "Injected missing faction.",
		});

		expect(
			expectFailure(
				await new SocialStandingService(missingRepository).gainFame({
					standing: buildStanding(),
					levels: 1,
				}),
			),
		).toEqual({
			code: "FACTION_NOT_FOUND",
			message: "Faction was not found for social standing operation.",
		});
		expect(
			expectFailure(
				await new SocialStandingService(failingRepository).loseFame({
					standing: buildStanding(),
					levels: 1,
				}),
			),
		).toEqual({
			code: "FACTION_LOOKUP_FAILED",
			message: "Faction lookup failed before social standing operation.",
		});
		expect(
			expectFailure(
				await new SocialStandingService(infamyMissingRepository).gainInfamy({
					standing: buildStanding(),
					levels: 1,
				}),
			),
		).toEqual({
			code: "FACTION_NOT_FOUND",
			message: "Faction was not found for social standing operation.",
		});
	});
});

function createRepository(): InMemoryFactionCatalogRepository {
	return new InMemoryFactionCatalogRepository({
		factions: TRAINING_FACTIONS,
		standings: TRAINING_FACTION_STANDINGS,
	});
}

function createService(): SocialStandingService {
	return new SocialStandingService(createRepository());
}

function buildStanding(
	patch: Partial<FactionStandingRecord> = {},
): FactionStandingRecord {
	return {
		...TRAINING_FACTION_STANDINGS[0],
		...patch,
	};
}

function expectDebtLimitSuccess(
	result: Result<SocialDebtLimitResult, SocialStandingFailure>,
): SocialDebtLimitResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectChangeSuccess(
	result: Result<SocialStandingChangeResult, SocialStandingFailure>,
): SocialStandingChangeResult {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}

	expect.fail(`Expected success, received ${result.error.code}`);
}

function expectFailure<Success>(
	result: Result<Success, SocialStandingFailure>,
): SocialStandingFailure {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}

	expect.fail("Expected failure, received success.");
}
