import type { LoreEncounterRecord, LoreService } from "$lib/entities/lore";
import type { TrapRepository } from "$lib/entities/traps";
import { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	DungeonBiome,
	DungeonDelveRecord,
	DungeonRoomRecord,
} from "../model/dungeonSchema";
import type {
	DungeonRepository,
	DungeonRepositoryFailure,
} from "./DungeonRepository";

class LcgRng {
	private state: number;

	constructor(seed: number) {
		this.state = Math.abs(seed) || 1;
	}

	public next(): number {
		// Constantes LCG clássicas
		this.state = (this.state * 1664525 + 1013904223) % 4294967296;
		return this.state / 4294967296;
	}
}

export class DungeonService {
	public constructor(
		private readonly repository: DungeonRepository,
		private readonly trapRepository?: TrapRepository,
		private readonly loreService?: LoreService,
	) {}

	/**
	 * Gera uma nova masmorra baseada em seed de forma determinística
	 */
	public async generateDelve(params: {
		campaignId: string;
		biome: DungeonBiome;
		seed: number;
		dangerLevel: number;
	}): Promise<
		Result<
			{ delve: DungeonDelveRecord; rooms: DungeonRoomRecord[] },
			DungeonRepositoryFailure
		>
	> {
		const delveId = crypto.randomUUID();
		const nowStr = new Date().toISOString();

		// Inicializar RNG determinístico baseado no seed
		const lcg = new LcgRng(params.seed);
		const diceService = new DiceService(
			{ next: () => lcg.next() },
			{
				generate: (() => {
					let rollId = 1;
					return () => `dungeon-gen-${rollId++}`;
				})(),
			},
			{ now: () => nowStr },
		);

		const delveRes = await this.repository.saveDelve({
			id: delveId,
			campaignId: params.campaignId,
			seed: params.seed,
			currentLevel: 1,
			dangerLevel: params.dangerLevel,
			biome: params.biome,
			status: "active",
			createdAt: nowStr,
			updatedAt: nowStr,
		});

		if (!delveRes.success) {
			return fail(delveRes.error);
		}

		const N = 4; // Grid 4x4 padrão
		const rooms: DungeonRoomRecord[] = [];

		for (let x = 0; x < N; x++) {
			for (let y = 0; y < N; y++) {
				const roomId = `room_${x}_${y}`;

				// Definir tipo de sala deterministicamente
				let type: "combat" | "treasure" | "puzzle" | "rest" | "boss" = "combat";
				if (x === 0 && y === 0) {
					type = "rest";
				} else if (x === N - 1 && y === N - 1) {
					type = "boss";
				} else {
					const rollRes = diceService.rollDie({
						sides: 100,
						reason: "dungeon-room-type",
					});
					const roll = rollRes.success ? rollRes.data.naturalRoll : 50;
					if (roll <= 50) {
						type = "combat";
					} else if (roll <= 70) {
						type = "treasure";
					} else if (roll <= 85) {
						type = "puzzle";
					} else {
						type = "rest";
					}
				}

				// Definir status inicial
				let status: "hidden" | "revealed" | "cleared" = "hidden";
				if (x === 0 && y === 0) {
					status = "cleared";
				} else if ((x === 1 && y === 0) || (x === 0 && y === 1)) {
					status = "revealed";
				}

				// Definir conexões ortogonais
				const connections: string[] = [];
				if (x > 0) connections.push(`room_${x - 1}_${y}`);
				if (x < N - 1) connections.push(`room_${x + 1}_${y}`);
				if (y > 0) connections.push(`room_${x}_${y - 1}`);
				if (y < N - 1) connections.push(`room_${x}_${y + 1}`);

				let spawnTrap = false;
				if (type === "puzzle") {
					const trapRollRes = diceService.rollDie({
						sides: 100,
						reason: "dungeon-room-trap-puzzle",
					});
					const trapRoll = trapRollRes.success
						? trapRollRes.data.naturalRoll
						: 50;
					if (trapRoll <= 70) {
						spawnTrap = true;
					}
				} else if (type === "combat") {
					const trapRollRes = diceService.rollDie({
						sides: 100,
						reason: "dungeon-room-trap-combat",
					});
					const trapRoll = trapRollRes.success
						? trapRollRes.data.naturalRoll
						: 50;
					if (trapRoll <= 30) {
						spawnTrap = true;
					}
				}

				if (spawnTrap && this.trapRepository) {
					const trapTypeRollRes = diceService.rollDie({
						sides: 100,
						reason: "dungeon-room-trap-type",
					});
					const trapTypeRoll = trapTypeRollRes.success
						? trapTypeRollRes.data.naturalRoll
						: 50;
					const trapType: "mechanical" | "magical" =
						trapTypeRoll <= 50 ? "mechanical" : "magical";

					const severityRollRes = diceService.rollDie({
						sides: 100,
						reason: "dungeon-room-trap-severity",
					});
					const severityRoll = severityRollRes.success
						? severityRollRes.data.naturalRoll
						: 50;

					let severity: "simple" | "hidden" | "deadly" = "simple";
					if (params.dangerLevel === 2 || params.dangerLevel === 3) {
						severity = severityRoll <= 60 ? "simple" : "hidden";
					} else if (params.dangerLevel >= 4) {
						severity =
							severityRoll <= 40
								? "simple"
								: severityRoll <= 80
									? "hidden"
									: "deadly";
					}

					let name = "Armadilha de Farpas";
					let effects = ["bleeding"];
					const dc = params.dangerLevel * 2 + 2;
					const damage = params.dangerLevel * 6 + 5;

					if (trapType === "mechanical") {
						if (severity === "simple") {
							name = "Armadilha de Farpas Subterrânea";
							effects = ["bleeding"];
						} else if (severity === "hidden") {
							name = "Mecanismo de Urso Enferrujado";
							effects = ["immobilized"];
						} else {
							name = "Guilhotina Oculta";
							effects = ["wound_infection"];
						}
					} else {
						if (severity === "simple") {
							name = "Runa de Gás Abissal";
							effects = ["silenced"];
						} else if (severity === "hidden") {
							name = "Selo de Febre do Éter";
							effects = ["eter_fever"];
						} else {
							name = "Maldição de Sangue Rúnica";
							effects = ["viper_poison"];
						}
					}

					const trapId = `trap-${crypto.randomUUID()}`;
					await this.trapRepository.save({
						id: trapId,
						tileId: `${delveId}:${roomId}`,
						name,
						type: trapType,
						severity,
						dc,
						damage,
						isDetected: false,
						isDisarmed: false,
						isTriggered: false,
						effects: JSON.stringify(effects),
						createdAt: nowStr,
						updatedAt: nowStr,
					});
				}

				const roomRes = await this.repository.saveRoom({
					id: crypto.randomUUID(),
					delveId,
					roomId,
					type,
					status,
					connectionsCsv: connections.join(","),
					coordinateX: x,
					coordinateY: y,
					createdAt: nowStr,
					updatedAt: nowStr,
				});

				if (!roomRes.success) {
					return fail(roomRes.error);
				}

				rooms.push(roomRes.data);
			}
		}

		return ok({
			delve: delveRes.data,
			rooms,
		});
	}

	/**
	 * Recupera masmorra e salas correspondentes
	 */
	public async getDelve(
		delveId: string,
	): Promise<
		Result<
			{ delve: DungeonDelveRecord; rooms: DungeonRoomRecord[] },
			DungeonRepositoryFailure
		>
	> {
		const delveRes = await this.repository.findDelveById(delveId);
		if (!delveRes.success) {
			return fail(delveRes.error);
		}

		if (!delveRes.data) {
			return fail({
				code: "DUNGEON_DELVE_NOT_FOUND",
				message: `Masmorra com ID ${delveId} não encontrada.`,
			});
		}

		const roomsRes = await this.repository.findRoomsByDelveId(delveId);
		if (!roomsRes.success) {
			return fail(roomsRes.error);
		}

		return ok({
			delve: delveRes.data,
			rooms: roomsRes.data,
		});
	}

	/**
	 * Movimenta o grupo para uma nova sala e revela salas vizinhas conectadas
	 */
	public async moveParty(
		delveId: string,
		targetRoomId: string,
		characterId?: string,
	): Promise<
		Result<
			{
				delve: DungeonDelveRecord;
				rooms: DungeonRoomRecord[];
				resolvedEncounter?: LoreEncounterRecord | null;
			},
			DungeonRepositoryFailure
		>
	> {
		const roomsRes = await this.repository.findRoomsByDelveId(delveId);
		if (!roomsRes.success) {
			return fail(roomsRes.error);
		}

		const rooms = roomsRes.data;
		const targetRoom = rooms.find((r) => r.roomId === targetRoomId);

		if (!targetRoom) {
			return fail({
				code: "DUNGEON_ROOM_NOT_FOUND",
				message: `Sala de destino ${targetRoomId} não pertence a esta masmorra.`,
			});
		}

		// Movimento válido se a sala estiver revelada ou já limpa
		if (targetRoom.status === "hidden") {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: "Não é possível mover-se para uma sala oculta.",
			});
		}

		// Validar conectividade com alguma sala já limpa (cleared)
		const connectedRoomIds = targetRoom.connectionsCsv.split(",");
		const hasClearedConnection = rooms.some(
			(r) => r.status === "cleared" && connectedRoomIds.includes(r.roomId),
		);

		// Caso especial: se o jogador estiver voltando para uma sala já limpa ou a própria entrada
		if (
			!hasClearedConnection &&
			targetRoomId !== "room_0_0" &&
			targetRoom.status !== "cleared"
		) {
			return fail({
				code: "DUNGEON_REPOSITORY_WRITE_FAILED",
				message: "Sala de destino não está conectada a nenhuma área explorada.",
			});
		}

		let resolvedEncounter: LoreEncounterRecord | null = null;

		// Se a sala de destino for visitada pela primeira vez, muda status para 'cleared'
		if (targetRoom.status === "revealed") {
			const updateRes = await this.repository.updateRoomStatus(
				targetRoom.id,
				"cleared",
			);
			if (!updateRes.success) {
				return fail(updateRes.error);
			}

			// Atualiza no nosso array local
			targetRoom.status = "cleared";

			// Resolve lore encounter if loreService is present
			if (this.loreService) {
				const charId = characterId ?? "party-leader";
				const tileId = `${delveId}:${targetRoomId}`;
				const loreResult = await this.loreService.resolveLoreEncounter(
					tileId,
					charId,
				);
				if (loreResult.success) {
					resolvedEncounter = loreResult.data;
				}
			}

			// Revelar todas as salas conectadas a este novo ponto limpo que forem hidden
			for (const connId of connectedRoomIds) {
				const neighbor = rooms.find((r) => r.roomId === connId);
				if (neighbor && neighbor.status === "hidden") {
					const revealRes = await this.repository.updateRoomStatus(
						neighbor.id,
						"revealed",
					);
					if (!revealRes.success) {
						return fail(revealRes.error);
					}
					neighbor.status = "revealed";
				}
			}

			// Se a sala limpa for a do chefe (boss), a masmorra é concluída!
			if (targetRoom.type === "boss") {
				const delveUpdateRes = await this.repository.updateDelveStatus(
					delveId,
					"completed",
					1,
				);
				if (!delveUpdateRes.success) {
					return fail(delveUpdateRes.error);
				}
			}
		}

		// Recarregar estado atualizado da masmorra
		const delveStateRes = await this.getDelve(delveId);
		if (!delveStateRes.success) {
			return fail(delveStateRes.error);
		}

		return ok({
			delve: delveStateRes.data.delve,
			rooms: delveStateRes.data.rooms,
			resolvedEncounter,
		});
	}
}
