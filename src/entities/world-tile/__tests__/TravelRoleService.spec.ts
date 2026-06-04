import { describe, expect, it } from "vitest";
import { WorldStateService } from "$lib/entities/world-state/domain/WorldStateService";
import { InMemoryWorldStateRepository } from "$lib/entities/world-state/testing/InMemoryWorldStateRepository";
import { TravelRoleService } from "../domain/TravelRoleService";

const TEST_TIMESTAMP = "2026-06-03T09:00:00.000Z";

describe("TravelRoleService", () => {
	it("assigns travel roles for a specific day and retrieves them", async () => {
		const wsRepository = new InMemoryWorldStateRepository();
		const wsService = new WorldStateService(wsRepository);
		const service = new TravelRoleService(wsService);

		const assignResult = await service.assignRoles({
			guideCharacterId: "char-guide",
			scoutCharacterId: "char-scout",
			foragerCharacterId: "char-forager",
			cartographerCharacterId: "char-cartographer",
			assignedAtDay: 1,
			updatedAt: TEST_TIMESTAMP,
		});

		expect(assignResult.success).toBe(true);

		const activeRolesResult = await service.getActiveRoles();
		expect(activeRolesResult.success).toBe(true);
		if (activeRolesResult.success) {
			expect(activeRolesResult.data).toEqual({
				guideCharacterId: "char-guide",
				scoutCharacterId: "char-scout",
				foragerCharacterId: "char-forager",
				cartographerCharacterId: "char-cartographer",
				assignedAtDay: 1,
			});
		}
	});

	it("returns null if no roles have been assigned yet", async () => {
		const wsRepository = new InMemoryWorldStateRepository();
		const wsService = new WorldStateService(wsRepository);
		const service = new TravelRoleService(wsService);

		const activeRolesResult = await service.getActiveRoles();
		expect(activeRolesResult.success).toBe(true);
		if (activeRolesResult.success) {
			expect(activeRolesResult.data).toBeNull();
		}
	});

	it("manages and advances exploration turns and days sequentially", async () => {
		const wsRepository = new InMemoryWorldStateRepository();
		const wsService = new WorldStateService(wsRepository);
		const service = new TravelRoleService(wsService);

		// Tempo de início padrão: Dia 1, Turno 1 (Manhã)
		let timeResult = await service.getExplorationTime();
		expect(timeResult.success).toBe(true);
		if (timeResult.success) {
			expect(timeResult.data).toEqual({
				day: 1,
				turn: 1,
				phase: "manha",
			});
		}

		// Avançar para Turno 2 (Tarde)
		let advanceResult = await service.advanceExplorationTime(TEST_TIMESTAMP);
		expect(advanceResult.success).toBe(true);
		if (advanceResult.success) {
			expect(advanceResult.data).toEqual({
				day: 1,
				turn: 2,
				phase: "tarde",
			});
		}

		// Avançar para Turno 3 (Anoitecer)
		advanceResult = await service.advanceExplorationTime(TEST_TIMESTAMP);
		if (advanceResult.success) {
			expect(advanceResult.data).toEqual({
				day: 1,
				turn: 3,
				phase: "anoitecer",
			});
		}

		// Avançar para Turno 4 (Madrugada)
		advanceResult = await service.advanceExplorationTime(TEST_TIMESTAMP);
		if (advanceResult.success) {
			expect(advanceResult.data).toEqual({
				day: 1,
				turn: 4,
				phase: "madrugada",
			});
		}

		// Avançar vira o dia: Dia 2, Turno 1 (Manhã)
		advanceResult = await service.advanceExplorationTime(TEST_TIMESTAMP);
		if (advanceResult.success) {
			expect(advanceResult.data).toEqual({
				day: 2,
				turn: 1,
				phase: "manha",
			});
		}

		// Confirmar persistência no tempo atualizado
		timeResult = await service.getExplorationTime();
		if (timeResult.success) {
			expect(timeResult.data).toEqual({
				day: 2,
				turn: 1,
				phase: "manha",
			});
		}
	});

	describe("Failure and Fallback coverage", () => {
		it("handles write failure in assignRoles", async () => {
			const wsRepository = new InMemoryWorldStateRepository();
			const wsService = new WorldStateService(wsRepository);
			const service = new TravelRoleService(wsService);

			wsRepository.failNextWrite({
				code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
				message: "Mock database write error",
			});

			const result = await service.assignRoles({
				guideCharacterId: null,
				scoutCharacterId: null,
				foragerCharacterId: null,
				cartographerCharacterId: null,
				assignedAtDay: 1,
				updatedAt: TEST_TIMESTAMP,
			});

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("WORLD_TILE_REPOSITORY_READ_FAILED");
			}
		});

		it("handles lookup failure in getActiveRoles", async () => {
			const wsRepository = new InMemoryWorldStateRepository();
			const wsService = new WorldStateService(wsRepository);
			const service = new TravelRoleService(wsService);

			wsRepository.failNextLookup({
				code: "WORLD_STATE_REPOSITORY_READ_FAILED",
				message: "Mock database read error",
			});

			const result = await service.getActiveRoles();
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("WORLD_TILE_REPOSITORY_READ_FAILED");
			}
		});

		it("handles lookup failure in getExplorationTime", async () => {
			const wsRepository = new InMemoryWorldStateRepository();
			const wsService = new WorldStateService(wsRepository);
			const service = new TravelRoleService(wsService);

			wsRepository.failNextLookup({
				code: "WORLD_STATE_REPOSITORY_READ_FAILED",
				message: "Mock database read error",
			});

			const result = await service.getExplorationTime();
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("WORLD_TILE_REPOSITORY_READ_FAILED");
			}
		});

		it("parses empty or invalid time values with default fallbacks", async () => {
			const wsRepository = new InMemoryWorldStateRepository();
			const wsService = new WorldStateService(wsRepository);
			const service = new TravelRoleService(wsService);

			await wsRepository.setFlag({
				key: "location:current_time",
				valueJson: JSON.stringify({
					day: null,
					turn: null,
					phase: "invalid_value",
				}),
				updatedAt: TEST_TIMESTAMP,
			});

			const result = await service.getExplorationTime();
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					day: 1,
					turn: 1,
					phase: "manha",
				});
			}
		});

		it("parses empty or invalid travel role values with default fallbacks", async () => {
			const wsRepository = new InMemoryWorldStateRepository();
			const wsService = new WorldStateService(wsRepository);
			const service = new TravelRoleService(wsService);

			await wsRepository.setFlag({
				key: "location:travel_roles",
				valueJson: JSON.stringify({
					guideCharacterId: undefined,
					scoutCharacterId: undefined,
					foragerCharacterId: undefined,
					cartographerCharacterId: undefined,
					assignedAtDay: undefined,
				}),
				updatedAt: TEST_TIMESTAMP,
			});

			const result = await service.getActiveRoles();
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual({
					guideCharacterId: null,
					scoutCharacterId: null,
					foragerCharacterId: null,
					cartographerCharacterId: null,
					assignedAtDay: 1,
				});
			}
		});

		it("handles failures inside advanceExplorationTime", async () => {
			const wsRepository = new InMemoryWorldStateRepository();
			const wsService = new WorldStateService(wsRepository);
			const service = new TravelRoleService(wsService);

			// 1. getExplorationTime lookup fails
			wsRepository.failNextLookup({
				code: "WORLD_STATE_REPOSITORY_READ_FAILED",
				message: "Read error",
			});
			let result = await service.advanceExplorationTime(TEST_TIMESTAMP);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("WORLD_TILE_REPOSITORY_READ_FAILED");
			}

			// 2. setNarrativeFlag write fails
			wsRepository.failNextWrite({
				code: "WORLD_STATE_REPOSITORY_WRITE_FAILED",
				message: "Write error",
			});
			result = await service.advanceExplorationTime(TEST_TIMESTAMP);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe("WORLD_TILE_REPOSITORY_READ_FAILED");
			}
		});
	});
});
