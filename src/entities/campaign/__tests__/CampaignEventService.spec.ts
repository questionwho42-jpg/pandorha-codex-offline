import { describe, expect, it, vi } from "vitest";
import { fail, ok } from "$lib/shared/lib/result";
import {
	CampaignEventService,
	type ICampaignFactionStanding,
	type ICampaignSiegeTrigger,
	type ICampaignWorldState,
} from "../domain/CampaignEventService";
import { InMemoryCampaignRepository } from "../infrastructure/InMemoryCampaignRepository";

describe("CampaignEventService", () => {
	const campaignId = "camp-123";
	const bastionId = "bast-456";

	const createMockWorldState = (
		flags: Record<string, any>,
	): ICampaignWorldState => {
		const store = { ...flags };
		return {
			getFlag: async (key: string) => {
				if (key in store) {
					return ok({
						key,
						value: store[key],
						updatedAt: new Date().toISOString(),
					});
				}
				return fail({ code: "FLAG_NOT_FOUND", message: "Flag não encontrada" });
			},
			setFlag: async (key: string, value: any) => {
				store[key] = value;
				return ok({ key, value, updatedAt: new Date().toISOString() });
			},
		};
	};

	it("should record and list campaign events correctly", async () => {
		const repository = new InMemoryCampaignRepository();
		const service = new CampaignEventService(repository);

		const recordRes = await service.recordEvent(
			campaignId,
			"siege_start",
			"O cerco começou",
		);

		expect(recordRes.success).toBe(true);
		if (recordRes.success) {
			expect(recordRes.data.campaignId).toBe(campaignId);
			expect(recordRes.data.eventType).toBe("siege_start");
			expect(recordRes.data.description).toBe("O cerco começou");
		}

		const listRes = await service.listEvents(campaignId);
		expect(listRes.success).toBe(true);
		if (listRes.success) {
			expect(listRes.data).toHaveLength(1);
			expect(listRes.data[0]?.description).toBe("O cerco começou");
		}
	});

	describe("evaluateTriggers - Faction Infamy Rule", () => {
		it("should trigger siege when rule is enabled and infamy is extreme (<= -10)", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:siege_on_extreme_infamy": true,
			});
			const triggerSiegeSpy = vi.fn().mockResolvedValue(ok(undefined));
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};
			const mockFactionStanding: ICampaignFactionStanding = {
				getInfamy: async () => ok(-12),
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
				mockFactionStanding,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
				{ bastionId, factionId: "fac-rival" },
			);
			expect(evalRes.success).toBe(true);
			expect(triggerSiegeSpy).toHaveBeenCalledWith({
				campaignId,
				bastionId,
				factionId: "fac-rival",
				dangerLevel: 2, // Max(1, Floor(|-12| / 5)) = Floor(12/5) = 2
			});

			const listRes = await service.listEvents(campaignId);
			expect(listRes.success).toBe(true);
			if (listRes.success) {
				expect(listRes.data).toHaveLength(2); // recordEvent for infamy check info + siege start
				expect(listRes.data.some((e) => e.eventType === "siege_start")).toBe(
					true,
				);
			}
		});

		it("should NOT trigger siege when rule is disabled even if infamy is extreme", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:siege_on_extreme_infamy": false,
			});
			const triggerSiegeSpy = vi.fn().mockResolvedValue(ok(undefined));
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};
			const mockFactionStanding: ICampaignFactionStanding = {
				getInfamy: async () => ok(-12),
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
				mockFactionStanding,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
				{ bastionId, factionId: "fac-rival" },
			);
			expect(evalRes.success).toBe(true);
			expect(triggerSiegeSpy).not.toHaveBeenCalled();
		});
	});

	describe("evaluateTriggers - Clock Completion Rule", () => {
		it("should trigger weather shift when weather clock completes", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({});
			const triggerSiegeSpy = vi.fn();
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CLOCK_COMPLETED",
				{
					clockName: "Ameaça: Nevasca Biomecânica",
					triggerEvent: "weather:blizzard",
				},
			);

			expect(evalRes.success).toBe(true);
			const activeWeather = await mockWorldState.getFlag(
				"location:weather_active",
			);
			expect(activeWeather.success).toBe(true);
			if (activeWeather.success) {
				expect(activeWeather.data.value).toBe("blizzard");
			}

			const listRes = await service.listEvents(campaignId);
			if (listRes.success) {
				expect(listRes.data.some((e) => e.eventType === "weather_shift")).toBe(
					true,
				);
			}
		});
	});

	describe("evaluateTriggers - Debt-Marked Ambush Rule", () => {
		it("should trigger ambush event when rule is enabled and player is debt-marked", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:block_rest_on_debt_marked": true,
			});
			const triggerSiegeSpy = vi.fn();
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CAMP_REST_ATTEMPT",
				{
					isDebtMarked: true,
				},
			);

			expect(evalRes.success).toBe(true);
			if (evalRes.success) {
				expect(evalRes.data?.ambushTriggered).toBe(true);
			}

			const listRes = await service.listEvents(campaignId);
			if (listRes.success) {
				expect(
					listRes.data.some((e) => e.eventType === "ambience_change"),
				).toBe(true);
			}
		});

		it("should NOT trigger ambush event when rule is disabled even if player is debt-marked", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:block_rest_on_debt_marked": false,
			});
			const triggerSiegeSpy = vi.fn();
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CAMP_REST_ATTEMPT",
				{
					isDebtMarked: true,
				},
			);

			expect(evalRes.success).toBe(true);
			if (evalRes.success) {
				expect(evalRes.data?.ambushTriggered).toBe(false);
			}
		});
	});

	describe("evaluateTriggers - additional branch coverage", () => {
		it("should return failure when recordEvent validation fails", async () => {
			const repository = new InMemoryCampaignRepository();
			const service = new CampaignEventService(repository);

			const spy = vi
				.spyOn(crypto, "randomUUID")
				.mockReturnValue("not-a-uuid" as any);
			const res = await service.recordEvent(campaignId, "siege_start", "desc");
			expect(res.success).toBe(false);
			spy.mockRestore();
		});

		it("should handle CHECK_INFAMY with fallback isRuleEnabled when worldState fails to get flag", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = {
				getFlag: async () => fail("injected error"),
				setFlag: async () => ok(undefined),
			};
			const triggerSiegeSpy = vi.fn().mockResolvedValue(ok(undefined));
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};
			const mockFactionStanding: ICampaignFactionStanding = {
				getInfamy: async () => ok(-12),
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
				mockFactionStanding,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
				{ bastionId, factionId: "fac-rival" },
			);
			expect(evalRes.success).toBe(true);
			expect(triggerSiegeSpy).toHaveBeenCalled();
		});

		it("should return fail when factionStanding fails in CHECK_INFAMY", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:siege_on_extreme_infamy": true,
			});
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: vi.fn().mockResolvedValue(ok(undefined)),
			};
			const mockFactionStanding: ICampaignFactionStanding = {
				getInfamy: async () => fail("failedstanding"),
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
				mockFactionStanding,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
				{ bastionId, factionId: "fac-rival" },
			);
			expect(evalRes.success).toBe(false);
		});

		it("should NOT trigger siege when infamy is not extreme (>-10)", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:siege_on_extreme_infamy": true,
			});
			const triggerSiegeSpy = vi.fn().mockResolvedValue(ok(undefined));
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};
			const mockFactionStanding: ICampaignFactionStanding = {
				getInfamy: async () => ok(-5),
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
				mockFactionStanding,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
				{ bastionId, factionId: "fac-rival" },
			);
			expect(evalRes.success).toBe(true);
			expect(triggerSiegeSpy).not.toHaveBeenCalled();
		});

		it("should handle CLOCK_COMPLETED when worldState is missing", async () => {
			const repository = new InMemoryCampaignRepository();
			const service = new CampaignEventService(repository);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CLOCK_COMPLETED",
				{ clockName: "Test Clock", triggerEvent: "weather:rain" },
			);
			expect(evalRes.success).toBe(true);
		});

		it("should handle CLOCK_COMPLETED when triggerEvent does not start with weather:", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({});
			const service = new CampaignEventService(repository, mockWorldState);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CLOCK_COMPLETED",
				{ clockName: "Test Clock", triggerEvent: "other:event" },
			);
			expect(evalRes.success).toBe(true);
		});

		it("should handle CAMP_REST_ATTEMPT with fallback isRuleEnabled when worldState fails to get flag", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = {
				getFlag: async () => fail("error"),
				setFlag: async () => ok(undefined),
			};
			const service = new CampaignEventService(repository, mockWorldState);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CAMP_REST_ATTEMPT",
				{ isDebtMarked: true },
			);
			expect(evalRes.success).toBe(true);
			expect(evalRes.success && evalRes.data?.ambushTriggered).toBe(true);
		});

		it("should catch errors and return failure in evaluateTriggers", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = {
				getFlag: () => {
					throw new TypeError("unhandled throw");
				},
				setFlag: async () => ok(undefined),
			};
			const trigger = new CampaignEventService(
				repository,
				mockWorldState as any,
			);
			const evalRes = await trigger.evaluateTriggers(
				campaignId,
				"CAMP_REST_ATTEMPT",
				{ isDebtMarked: true },
			);
			expect(evalRes.success).toBe(false);
			if (!evalRes.success) {
				expect(evalRes.error.message).toBe("unhandled throw");
			}
		});

		it("should catch non-Error throws", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = {
				getFlag: () => {
					throw "non-error string";
				},
				setFlag: async () => ok(undefined),
			};
			const trigger = new CampaignEventService(
				repository,
				mockWorldState as any,
			);
			const evalRes = await trigger.evaluateTriggers(
				campaignId,
				"CAMP_REST_ATTEMPT",
				{ isDebtMarked: true },
			);
			expect(evalRes.success).toBe(false);
			if (!evalRes.success) {
				expect(evalRes.error.message).toBe(
					"Erro ao avaliar gatilhos de campanha.",
				);
			}
		});

		it("should return ok when worldState or other triggers are missing in CHECK_INFAMY", async () => {
			const repository = new InMemoryCampaignRepository();
			const service = new CampaignEventService(repository);
			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
			);
			expect(evalRes.success).toBe(true);
		});

		it("should use default factionId and bastionId in CHECK_INFAMY when context is missing", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:siege_on_extreme_infamy": true,
			});
			const triggerSiegeSpy = vi.fn().mockResolvedValue(ok(undefined));
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};
			const mockFactionStanding: ICampaignFactionStanding = {
				getInfamy: async (id) => {
					expect(id).toBe("rival_faction");
					return ok(-15);
				},
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
				mockFactionStanding,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
			);
			expect(evalRes.success).toBe(true);
			expect(triggerSiegeSpy).toHaveBeenCalledWith(
				expect.objectContaining({
					factionId: "rival_faction",
					bastionId: "primary_bastion",
				}),
			);
		});

		it("should NOT record siege_start event if triggerSiege fails", async () => {
			const repository = new InMemoryCampaignRepository();
			const mockWorldState = createMockWorldState({
				"system:rules:siege_on_extreme_infamy": true,
			});
			const triggerSiegeSpy = vi
				.fn()
				.mockResolvedValue(fail("failed to siege"));
			const mockSiegeTrigger: ICampaignSiegeTrigger = {
				triggerSiege: triggerSiegeSpy,
			};
			const mockFactionStanding: ICampaignFactionStanding = {
				getInfamy: async () => ok(-12),
			};

			const service = new CampaignEventService(
				repository,
				mockWorldState,
				mockSiegeTrigger,
				mockFactionStanding,
			);

			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CHECK_INFAMY",
				{ bastionId, factionId: "fac-rival" },
			);
			expect(evalRes.success).toBe(true);

			const listRes = await service.listEvents(campaignId);
			if (listRes.success) {
				expect(listRes.data.some((e) => e.eventType === "siege_start")).toBe(
					false,
				);
			}
		});

		it("should return ok with ambushTriggered false in CAMP_REST_ATTEMPT when worldState is missing", async () => {
			const repository = new InMemoryCampaignRepository();
			const service = new CampaignEventService(repository);
			const evalRes = await service.evaluateTriggers(
				campaignId,
				"CAMP_REST_ATTEMPT",
			);
			expect(evalRes.success).toBe(true);
			expect(evalRes.success && evalRes.data?.ambushTriggered).toBe(false);
		});

		it("should return ok when triggerPayload is unknown", async () => {
			const repository = new InMemoryCampaignRepository();
			const service = new CampaignEventService(repository);
			const evalRes = await service.evaluateTriggers(
				campaignId,
				"UNKNOWN_PAYLOAD",
			);
			expect(evalRes.success).toBe(true);
		});
	});
});
