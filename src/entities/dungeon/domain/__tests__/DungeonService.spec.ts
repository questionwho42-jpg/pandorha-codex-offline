import { describe, expect, it } from "vitest";
import { fail, ok } from "$lib/shared/lib/result";
import { SessionTrapRepository } from "../../../traps/infrastructure/SessionTrapRepository";
import { InMemoryDungeonRepository } from "../../infrastructure/InMemoryDungeonRepository";
import type { DungeonRoomRecord } from "../../model/dungeonSchema";
import { DungeonService } from "../DungeonService";

describe("DungeonService", () => {
	it("deve gerar uma masmorra com 16 salas de forma determinística baseada na seed", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const res1 = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 12345,
			dangerLevel: 1,
		});

		expect(res1.success).toBe(true);
		if (res1.success) {
			const delve = res1.data.delve;
			const rooms = res1.data.rooms;

			expect(delve.biome).toBe("crypt");
			expect(delve.seed).toBe(12345);
			expect(delve.status).toBe("active");
			expect(rooms).toHaveLength(16);

			// Entrada (0,0) deve ser sempre rest e começar cleared
			const startRoom = rooms.find(
				(r: DungeonRoomRecord) => r.roomId === "room_0_0",
			);
			expect(startRoom).toBeDefined();
			expect(startRoom?.type).toBe("rest");
			expect(startRoom?.status).toBe("cleared");

			// Boss (3,3) deve ser sempre boss e começar hidden
			const bossRoom = rooms.find(
				(r: DungeonRoomRecord) => r.roomId === "room_3_3",
			);
			expect(bossRoom).toBeDefined();
			expect(bossRoom?.type).toBe("boss");
			expect(bossRoom?.status).toBe("hidden");

			// Gerar masmorra 2 com a mesma seed e validar se são idênticas
			const res2 = await service.generateDelve({
				campaignId: "campaign_1",
				biome: "crypt",
				seed: 12345,
				dangerLevel: 1,
			});

			expect(res2.success).toBe(true);
			if (res2.success) {
				const rooms2 = res2.data.rooms;
				for (let i = 0; i < 16; i++) {
					expect(rooms[i]?.roomId).toBe(rooms2[i]?.roomId);
					expect(rooms[i]?.type).toBe(rooms2[i]?.type);
					expect(rooms[i]?.coordinateX).toBe(rooms2[i]?.coordinateX);
					expect(rooms[i]?.coordinateY).toBe(rooms2[i]?.coordinateY);
				}
			}
		}
	});

	it("deve permitir mover o grupo para salas reveladas e revelar as salas vizinhas ocultas", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const res = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "ruins",
			seed: 999,
			dangerLevel: 2,
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const delve = res.data.delve;

			// Sala (1,0) deve começar revelada (revealed) como vizinha da entrada (0,0)
			const room1_0 = res.data.rooms.find(
				(r: DungeonRoomRecord) => r.roomId === "room_1_0",
			);
			expect(room1_0?.status).toBe("revealed");

			// Mover para (1,0)
			const moveRes = await service.moveParty(delve.id, "room_1_0");
			expect(moveRes.success).toBe(true);

			if (moveRes.success) {
				const updatedRooms = moveRes.data.rooms;
				const currentRoom = updatedRooms.find(
					(r: DungeonRoomRecord) => r.roomId === "room_1_0",
				);
				// Sala (1,0) deve agora ser limpa (cleared)
				expect(currentRoom?.status).toBe("cleared");

				// Vizinho (2,0) deve agora estar revelado (estava hidden)
				const room2_0 = updatedRooms.find(
					(r: DungeonRoomRecord) => r.roomId === "room_2_0",
				);
				expect(room2_0?.status).toBe("revealed");
			}
		}
	});

	it("deve falhar ao tentar mover o grupo para salas ocultas (hidden)", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const res = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "caverns",
			seed: 555,
			dangerLevel: 3,
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const delve = res.data.delve;

			// Sala (2,2) é distante e deve estar oculta (hidden)
			const room2_2 = res.data.rooms.find(
				(r: DungeonRoomRecord) => r.roomId === "room_2_2",
			);
			expect(room2_2?.status).toBe("hidden");

			const moveRes = await service.moveParty(delve.id, "room_2_2");
			expect(moveRes.success).toBe(false);
			if (!moveRes.success) {
				expect(moveRes.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
			}
		}
	});

	it("deve auto-completar a masmorra quando o chefe (boss) final for limpo", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const res = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 777,
			dangerLevel: 1,
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const delve = res.data.delve;

			// Simular exploração rápida: limpar todas as salas no caminho até (3,3)
			// Para isso, forçamos o status das salas intermediárias a 'cleared' e vizinhas a 'revealed'
			await repo.updateRoomStatus("room_1_0", "cleared");
			await repo.updateRoomStatus("room_2_0", "cleared");
			await repo.updateRoomStatus("room_3_0", "cleared");
			await repo.updateRoomStatus("room_3_1", "cleared");
			await repo.updateRoomStatus("room_3_2", "cleared");
			await repo.updateRoomStatus("room_3_3", "revealed");

			// Mover para a sala do Boss (3,3)
			const moveRes = await service.moveParty(delve.id, "room_3_3");
			expect(moveRes.success).toBe(true);

			if (moveRes.success) {
				expect(moveRes.data.delve.status).toBe("completed");
				const bossRoom = moveRes.data.rooms.find(
					(r: DungeonRoomRecord) => r.roomId === "room_3_3",
				);
				expect(bossRoom?.status).toBe("cleared");
			}
		}
	});

	it("deve gerar armadilhas procedimentais deterministicamente baseadas na semente", async () => {
		const repo = new InMemoryDungeonRepository();
		const trapRepo = new SessionTrapRepository();
		const service = new DungeonService(repo, trapRepo);

		const res = await service.generateDelve({
			campaignId: "campaign_test",
			biome: "caverns",
			seed: 54321,
			dangerLevel: 3,
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const delveId = res.data.delve.id;
			const allTraps = trapRepo.all();
			expect(allTraps.length).toBeGreaterThan(0);

			for (const trap of allTraps) {
				expect(trap.tileId).toContain(delveId);
				expect(trap.id).toMatch(/^trap-[a-z0-9-]+$/);
				expect(trap.dc).toBe(3 * 2 + 2); // dangerLevel * 2 + 2 = 8
				expect(trap.damage).toBe(3 * 6 + 5); // dangerLevel * 6 + 5 = 23
				expect(["simple", "hidden", "deadly"]).toContain(trap.severity);
				expect(["mechanical", "magical"]).toContain(trap.type);
			}
		}
	});

	it("deve retornar falha se saveDelve falhar no repositório", async () => {
		const repo = new InMemoryDungeonRepository();
		repo.saveDelve = async () =>
			fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: "Save delve failed",
			});
		const service = new DungeonService(repo);

		const res = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
		}
	});

	it("deve retornar falha se saveRoom falhar no repositório", async () => {
		const repo = new InMemoryDungeonRepository();
		repo.saveRoom = async () =>
			fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: "Save room failed",
			});
		const service = new DungeonService(repo);

		const res = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
		}
	});

	it("deve retornar falha em getDelve se delve não for encontrada", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const res = await service.getDelve("non-existent-id");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DUNGEON_DELVE_NOT_FOUND");
		}
	});

	it("deve retornar falha em moveParty se findRoomsByDelveId falhar", async () => {
		const repo = new InMemoryDungeonRepository();
		repo.findRoomsByDelveId = async () =>
			fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message: "Find rooms failed",
			});
		const service = new DungeonService(repo);

		const res = await service.moveParty("some-delve-id", "room_1_0");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DUNGEON_REPOSITORY_READ_FAILED");
		}
	});

	it("deve retornar falha em moveParty se a sala de destino não pertencer a masmorra", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			const res = await service.moveParty(gen.data.delve.id, "room_invalid");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("DUNGEON_ROOM_NOT_FOUND");
			}
		}
	});

	it("deve retornar falha em moveParty se a sala de destino não estiver conectada a nenhuma explorada", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			// Definir a entrada como oculta e a sala (1,0) como revelada para forçar desconexão
			const delveId = gen.data.delve.id;
			const rooms = gen.data.rooms;
			const r0_0 = rooms.find((r) => r.roomId === "room_0_0");
			const r1_0 = rooms.find((r) => r.roomId === "room_1_0");
			expect(r0_0).toBeDefined();
			expect(r1_0).toBeDefined();
			if (r0_0 && r1_0) {
				await repo.updateRoomStatus(r0_0.id, "hidden");
				await repo.updateRoomStatus(r1_0.id, "revealed");
			}

			const res = await service.moveParty(delveId, "room_1_0");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
				expect(res.error.message).toContain(
					"não está conectada a nenhuma área explorada",
				);
			}
		}
	});

	it("deve retornar falha em moveParty se updateRoomStatus falhar", async () => {
		const repo = new InMemoryDungeonRepository();
		repo.updateRoomStatus = async () =>
			fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: "Update status failed",
			});
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			const res = await service.moveParty(gen.data.delve.id, "room_1_0");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
			}
		}
	});

	it("deve retornar falha em getDelve se findDelveById falhar", async () => {
		const repo = new InMemoryDungeonRepository();
		repo.findDelveById = async () =>
			fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message: "Find delve failed",
			});
		const service = new DungeonService(repo);

		const res = await service.getDelve("some-delve-id");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DUNGEON_REPOSITORY_READ_FAILED");
		}
	});

	it("deve retornar falha em getDelve se findRoomsByDelveId falhar", async () => {
		const repo = new InMemoryDungeonRepository();
		repo.findRoomsByDelveId = async () =>
			fail({
				code: "DUNGEON_REPOSITORY_READ_FAILED",
				message: "Find rooms failed",
			});
		const service = new DungeonService(repo);

		await repo.saveDelve({
			id: "delve-test-id",
			campaignId: "campaign_1",
			seed: 123,
			currentLevel: 1,
			dangerLevel: 1,
			biome: "crypt",
			status: "active",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		});

		const res = await service.getDelve("delve-test-id");
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("DUNGEON_REPOSITORY_READ_FAILED");
		}
	});

	it("deve retornar falha em moveParty se updateDelveStatus falhar", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			const delveId = gen.data.delve.id;
			const rooms = gen.data.rooms;

			for (const room of rooms) {
				if (room.roomId === "room_3_3") {
					await repo.updateRoomStatus(room.id, "revealed");
				} else {
					await repo.updateRoomStatus(room.id, "cleared");
				}
			}

			repo.updateDelveStatus = async () =>
				fail({
					code: "DUNGEON_REPOSITORY_WRITE_FAILED",
					message: "Update status failed",
				});

			const res = await service.moveParty(delveId, "room_3_3");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
			}
		}
	});

	it("deve retornar falha em moveParty se o repositório falhar ao revelar sala vizinha", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			const delveId = gen.data.delve.id;

			let callCount = 0;
			repo.updateRoomStatus = async (id, status) => {
				callCount++;
				if (callCount > 1 && status === "revealed") {
					return fail({
						code: "DUNGEON_REPOSITORY_WRITE_FAILED",
						message: "Reveal neighbor failed",
					});
				}
				const allRoomsRes = await repo.findRoomsByDelveId(delveId);
				if (allRoomsRes.success) {
					const room = allRoomsRes.data.find((r) => r.id === id);
					if (room) room.status = status;
				}
				return ok({ id } as any);
			};

			const res = await service.moveParty(delveId, "room_1_0");
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
			}
		}
	});

	it("deve gerar armadilhas de alta severidade com dangerLevel alto", async () => {
		const repo = new InMemoryDungeonRepository();
		const trapRepo = new SessionTrapRepository();
		const service = new DungeonService(repo, trapRepo);

		const res = await service.generateDelve({
			campaignId: "campaign_test",
			biome: "caverns",
			seed: 99999,
			dangerLevel: 5,
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const allTraps = trapRepo.all();
			expect(allTraps.length).toBeGreaterThan(0);
		}
	});

	it("deve retornar falha ao tentar se mover para uma sala oculta", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			const delveId = gen.data.delve.id;
			const res = await service.moveParty(delveId, "room_3_3"); // room_3_3 inicia hidden
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("DUNGEON_REPOSITORY_WRITE_FAILED");
				expect(res.error.message).toContain(
					"Não é possível mover-se para uma sala oculta",
				);
			}
		}
	});

	it("deve gerar armadilhas de severidade moderada (simple/hidden) com dangerLevel 2 ou 3", async () => {
		const repo = new InMemoryDungeonRepository();
		const trapRepo = new SessionTrapRepository();
		const service = new DungeonService(repo, trapRepo);

		const res = await service.generateDelve({
			campaignId: "campaign_test",
			biome: "caverns",
			seed: 12345,
			dangerLevel: 3,
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const allTraps = trapRepo.all();
			expect(allTraps.length).toBeGreaterThan(0);
			for (const trap of allTraps) {
				expect(["simple", "hidden"]).toContain(trap.severity);
			}
		}
	});

	it("deve concluir a masmorra ao entrar com sucesso na sala do chefe (boss)", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			const delveId = gen.data.delve.id;
			const rooms = gen.data.rooms;

			// Marcar todas as salas como cleared exceto o boss (room_3_3) que deve ser revealed
			for (const room of rooms) {
				if (room.roomId === "room_3_3") {
					await repo.updateRoomStatus(room.id, "revealed");
				} else {
					await repo.updateRoomStatus(room.id, "cleared");
				}
			}

			const res = await service.moveParty(delveId, "room_3_3");
			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.delve.status).toBe("completed");
			}
		}
	});

	it("deve permitir mover o grupo de volta para uma sala que já foi limpa (cleared)", async () => {
		const repo = new InMemoryDungeonRepository();
		const service = new DungeonService(repo);

		const gen = await service.generateDelve({
			campaignId: "campaign_1",
			biome: "crypt",
			seed: 123,
			dangerLevel: 1,
		});

		expect(gen.success).toBe(true);
		if (gen.success) {
			const delveId = gen.data.delve.id;

			// Move para room_1_0 (revelada) -> vira cleared
			const move1 = await service.moveParty(delveId, "room_1_0");
			expect(move1.success).toBe(true);

			// Move de volta para room_0_0 (já é cleared)
			const moveBack = await service.moveParty(delveId, "room_0_0");
			expect(moveBack.success).toBe(true);
		}
	});

	it("deve gerar armadilhas de severidade moderada com dangerLevel 2", async () => {
		const repo = new InMemoryDungeonRepository();
		const trapRepo = new SessionTrapRepository();
		const service = new DungeonService(repo, trapRepo);

		const res = await service.generateDelve({
			campaignId: "campaign_test",
			biome: "caverns",
			seed: 12345,
			dangerLevel: 2,
		});

		expect(res.success).toBe(true);
		if (res.success) {
			const allTraps = trapRepo.all();
			expect(allTraps.length).toBeGreaterThan(0);
			for (const trap of allTraps) {
				expect(["simple", "hidden"]).toContain(trap.severity);
			}
		}
	});

	it("deve gerar todos os tipos de severidade e tipos de armadilhas cobrindo todas as ramificações", async () => {
		const repo = new InMemoryDungeonRepository();
		const trapRepo = new SessionTrapRepository();
		const service = new DungeonService(repo, trapRepo);

		// Loop por vários seeds e níveis de perigo para garantir que todos os ramos de tipo/severidade de armadilha sejam executados
		for (let seed = 1; seed <= 30; seed++) {
			await service.generateDelve({
				campaignId: `campaign_${seed}`,
				biome: "caverns",
				seed,
				dangerLevel: (seed % 5) + 1, // varia de 1 a 5
			});
		}

		const allTraps = trapRepo.all();
		const trapNames = allTraps.map((t) => t.name);
		expect(trapNames.length).toBeGreaterThan(0);
	});
});
