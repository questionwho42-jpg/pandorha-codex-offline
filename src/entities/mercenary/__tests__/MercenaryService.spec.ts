import { beforeEach, describe, expect, it } from "vitest";
import { fail } from "$lib/shared/lib/result";
import { MercenaryService } from "../domain/MercenaryService";
import { InMemoryMercenaryRepository } from "../infrastructure/InMemoryMercenaryRepository";
import type { NewMercenarySquadRecord } from "../model/mercenarySchema";

describe("MercenaryService", () => {
	let repository: InMemoryMercenaryRepository;
	let service: MercenaryService;

	const idProvider = {
		generate: () => "id-123",
	};

	const clock = {
		now: () => "2026-05-27T12:00:00Z",
	};

	beforeEach(() => {
		repository = new InMemoryMercenaryRepository();
		service = new MercenaryService(repository, idProvider, clock);
	});

	describe("createCompany", () => {
		it("should successfully create and persist a mercenary company", async () => {
			const res = await service.createCompany({
				hqName: "Gaviões de Éter",
				tier: 2,
			});
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.id).toBe("id-123");
				expect(res.data.hqName).toBe("Gaviões de Éter");
				expect(res.data.tier).toBe(2);
				expect(res.data.reputation).toBe(0);

				const found = await repository.findCompanyById("id-123");
				expect(found.success).toBe(true);
			}
		});

		it("should return repository write failure if database save fails", async () => {
			repository.saveCompany = async () =>
				fail({
					code: "MERCENARY_REPOSITORY_WRITE_FAILED",
					message: "Save failed",
				});

			const res = await service.createCompany({ hqName: "Falha" });
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("REPOSITORY_WRITE_FAILED");
			}
		});
	});

	describe("recruitSquad", () => {
		const companyId = "company-1";

		beforeEach(async () => {
			const res = await repository.saveCompany({
				id: companyId,
				hqName: "Base",
				tier: 1,
				reputation: 0,
				createdAt: "2026",
				updatedAt: "2026",
			});
			expect(res.success).toBe(true);
		});

		it("should successfully recruit a squad with attributes within limits", async () => {
			const res = await service.recruitSquad(companyId, {
				name: "Vanguardas Mecânicas",
				physical: 3,
				mental: 1,
				social: 0,
				tags: ["heavy_infantry", "siege"],
			});

			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.id).toBe("id-123");
				expect(res.data.name).toBe("Vanguardas Mecânicas");
				expect(res.data.cohesionMax).toBe(13); // 10 + physical (3)
				expect(res.data.cohesionCurrent).toBe(13);
				expect(res.data.commandTactic).toBe("honorable");
				expect(res.data.status).toBe("available");
			}
		});

		it("should fail to recruit squad if company does not exist", async () => {
			const res = await service.recruitSquad("missing-company", {
				name: "Invalido",
				physical: 1,
				mental: 1,
				social: 1,
				tags: [],
			});

			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("MERCENARY_COMPANY_NOT_FOUND");
			}
		});

		it("should fail if attributes are out of bounds (> 5)", async () => {
			const res = await service.recruitSquad(companyId, {
				name: "Invalido",
				physical: 6,
				mental: 1,
				social: 0,
				tags: [],
			});

			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("INVALID_MERCENARY_INPUT");
			}
		});

		it("should fail if database save fails", async () => {
			repository.saveSquad = async () =>
				fail({
					code: "MERCENARY_REPOSITORY_WRITE_FAILED",
					message: "Save failed",
				});

			const res = await service.recruitSquad(companyId, {
				name: "Invalido",
				physical: 2,
				mental: 1,
				social: 1,
				tags: [],
			});

			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("REPOSITORY_WRITE_FAILED");
			}
		});
	});

	describe("squad operations & mission resolution", () => {
		const squadId = "squad-1";
		const companyId = "company-1";

		beforeEach(async () => {
			await repository.saveCompany({
				id: companyId,
				hqName: "Base",
				tier: 1,
				reputation: 0,
				createdAt: "2026",
				updatedAt: "2026",
			});

			await repository.saveSquad({
				id: squadId,
				companyId,
				name: "Esquadrão Beta",
				physical: 3,
				mental: 1,
				social: 2,
				cohesionMax: 13,
				cohesionCurrent: 13,
				tagsJson: JSON.stringify(["heavy_infantry", "stealth"]),
				commandTactic: "honorable",
				status: "available",
				assignedMissionId: null,
				createdAt: "2026",
				updatedAt: "2026",
			});
		});

		it("should successfully assign tactic", async () => {
			const res = await service.assignTactic(squadId, "cruel");
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.commandTactic).toBe("cruel");
			}
		});

		it("should fail to assign tactic if squad is dead", async () => {
			const deadSquad: NewMercenarySquadRecord = {
				id: "squad-dead",
				companyId,
				name: "Mortos",
				physical: 1,
				mental: 1,
				social: 1,
				cohesionMax: 11,
				cohesionCurrent: 0,
				tagsJson: "[]",
				commandTactic: "honorable",
				status: "dead",
				assignedMissionId: null,
				createdAt: "2026",
				updatedAt: "2026",
			};
			await repository.saveSquad(deadSquad);

			const res = await service.assignTactic("squad-dead", "stealthy");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("INVALID_MERCENARY_INPUT");
			}
		});

		it("should fail to assign tactic if squad does not exist", async () => {
			const res = await service.assignTactic("missing-squad", "stealthy");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("MERCENARY_SQUAD_NOT_FOUND");
			}
		});

		it("should successfully assign mission", async () => {
			const res = await service.assignMission(squadId, "mission-456");
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.status).toBe("on_mission");
				expect(res.data.assignedMissionId).toBe("mission-456");
			}
		});

		it("should fail to assign mission if squad is not available", async () => {
			await service.assignMission(squadId, "mission-456");
			const res = await service.assignMission(squadId, "mission-789");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("INVALID_MERCENARY_INPUT");
			}
		});

		describe("resolveMission", () => {
			beforeEach(async () => {
				await service.assignMission(squadId, "mission-456");
			});

			it("should resolve physical mission successfully (success, gold earned, 1 cohesion lost)", async () => {
				const res = await service.resolveMission({
					squadId,
					requiredTags: ["heavy_infantry"], // +2 bonus, no penalty. Total roll: 10 + 3 + 2 + 1 = 16
					difficulty: 15,
					matrix: "Physical",
					rewardGold: 500,
					d20Roll: 10,
				});

				expect(res.success).toBe(true);
				if (res.success) {
					expect(res.data.success).toBe(true);
					expect(res.data.goldEarned).toBe(500);
					expect(res.data.cohesionLost).toBe(1);
					expect(res.data.squad.cohesionCurrent).toBe(12);
					expect(res.data.squad.status).toBe("available");
				}
			});

			it("should apply tag penalties for missing tags", async () => {
				// required tags: ["heavy_infantry", "siege"] -> squad has "heavy_infantry" (+2) but misses "siege" (-2). Net tags: 0.
				// total roll: 10 (roll) + 3 (phys) + 0 (tags) + 1 (honorable) = 14. Difficulty = 15. Falha!
				const res = await service.resolveMission({
					squadId,
					requiredTags: ["heavy_infantry", "siege"],
					difficulty: 15,
					matrix: "Physical",
					rewardGold: 500,
					d20Roll: 10,
				});

				expect(res.success).toBe(true);
				if (res.success) {
					expect(res.data.success).toBe(false);
					expect(res.data.goldEarned).toBe(0);
					expect(res.data.cohesionLost).toBe(3); // honorable failure loses 3 cohesion
					expect(res.data.squad.cohesionCurrent).toBe(10);
				}
			});

			it("should apply leader cargo modifiers", async () => {
				// physical mission + Mestre de Armas -> +1 bonus.
				// total roll: 9 (roll) + 3 (phys) + 1 (leader) + 2 (tag heavy_infantry) + 1 (honorable) = 16 vs CD 15. Sucesso!
				const res = await service.resolveMission({
					squadId,
					requiredTags: ["heavy_infantry"],
					difficulty: 15,
					matrix: "Physical",
					rewardGold: 500,
					d20Roll: 9,
					leaderCargo: "Mestre de Armas",
				});

				expect(res.success).toBe(true);
				if (res.success) {
					expect(res.data.success).toBe(true);
				}
			});

			it("should resolve with cruel tactic correctly (failure, 1 cohesion lost)", async () => {
				await service.assignTactic(squadId, "cruel");
				// total roll: 9 (roll) + 3 (phys) + 2 (tag) - 1 (cruel tactic) = 13 vs CD 15. Falha!
				const res = await service.resolveMission({
					squadId,
					requiredTags: ["heavy_infantry"],
					difficulty: 15,
					matrix: "Physical",
					rewardGold: 500,
					d20Roll: 9,
				});

				expect(res.success).toBe(true);
				if (res.success) {
					expect(res.data.success).toBe(false);
					expect(res.data.cohesionLost).toBe(1); // cruel tactic limits failure damage to 1 cohesion
					expect(res.data.squad.cohesionCurrent).toBe(12);
				}
			});

			it("should resolve with stealthy tactic correctly in a stealth mission (+2 bonus)", async () => {
				await service.assignTactic(squadId, "stealthy");
				// required tags has "stealth" -> squad has "stealth" (+2), "heavy_infantry" (+0, not required).
				// stealthy tactic gives +2 on stealth mission.
				// total roll: 8 (roll) + 3 (phys) + 2 (tag) + 2 (stealthy tactic) = 15 vs CD 15. Sucesso!
				const res = await service.resolveMission({
					squadId,
					requiredTags: ["stealth"],
					difficulty: 15,
					matrix: "Physical",
					rewardGold: 500,
					d20Roll: 8,
				});

				expect(res.success).toBe(true);
				if (res.success) {
					expect(res.data.success).toBe(true);
				}
			});

			it("should punish stealthy tactic in non-stealth missions (-1 penalty, 2 cohesion lost on failure)", async () => {
				await service.assignTactic(squadId, "stealthy");
				// required tags is ["heavy_infantry"] -> not stealth. Stealthy tactic gives -1.
				// total roll: 10 (roll) + 3 (phys) + 2 (tag) - 1 (stealthy tactic) = 14 vs CD 15. Falha!
				const res = await service.resolveMission({
					squadId,
					requiredTags: ["heavy_infantry"],
					difficulty: 15,
					matrix: "Physical",
					rewardGold: 500,
					d20Roll: 10,
				});

				expect(res.success).toBe(true);
				if (res.success) {
					expect(res.data.success).toBe(false);
					expect(res.data.cohesionLost).toBe(2); // standard failure loses 2 cohesion
				}
			});

			it("should mark squad as dead if cohesion hits 0", async () => {
				// We force cohesionCurrent to 2. Honorable failure loses 3.
				const mockSquad = await repository.findSquadById(squadId);
				expect(mockSquad.success).toBe(true);
				if (mockSquad.success) {
					mockSquad.data.cohesionCurrent = 2;
					await repository.saveSquad(mockSquad.data);
				}

				const res = await service.resolveMission({
					squadId,
					requiredTags: ["heavy_infantry"],
					difficulty: 30, // impossible difficulty to force failure
					matrix: "Physical",
					rewardGold: 500,
					d20Roll: 1,
				});

				expect(res.success).toBe(true);
				if (res.success) {
					expect(res.data.squad.cohesionCurrent).toBe(0);
					expect(res.data.squad.status).toBe("dead");
				}
			});

			it("should fail resolveMission if d20Roll is invalid", async () => {
				const res = await service.resolveMission({
					squadId,
					requiredTags: [],
					difficulty: 10,
					matrix: "Physical",
					rewardGold: 100,
					d20Roll: 25,
				});

				expect(res.success).toBe(false);
				if (!res.success) {
					expect(res.error.code).toBe("INVALID_MERCENARY_INPUT");
				}
			});

			it("should fail if squad is not on_mission", async () => {
				const otherSquadId = "squad-other";
				await repository.saveSquad({
					id: otherSquadId,
					companyId,
					name: "Outro",
					physical: 1,
					mental: 1,
					social: 1,
					cohesionMax: 11,
					cohesionCurrent: 11,
					tagsJson: "[]",
					commandTactic: "honorable",
					status: "available",
					assignedMissionId: null,
					createdAt: "2026",
					updatedAt: "2026",
				});

				const res = await service.resolveMission({
					squadId: otherSquadId,
					requiredTags: [],
					difficulty: 10,
					matrix: "Physical",
					rewardGold: 100,
					d20Roll: 10,
				});

				expect(res.success).toBe(false);
				if (!res.success) {
					expect(res.error.code).toBe("INVALID_MERCENARY_INPUT");
				}
			});
		});
	});
});
