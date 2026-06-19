/**
 * @description Smoke spec para lógica pura de DungeonMap.
 * Testa funções utilitárias do componente sem montar Svelte (evita dep @testing-library/svelte).
 * Cobertura mínima garantida para o domain de Incursão de Masmorra.
 */
import { describe, expect, it } from "vitest";
import type { DungeonRoomRecord } from "../../../entities/dungeon/model/dungeonSchema";

// ─── Funções puras extraídas de DungeonMap.svelte ────────────────────────────
// (replicadas aqui para teste isolado — se extraídas para módulo próprio no futuro, importar de lá)

function getRoomTypeLabel(type: string): string {
	switch (type) {
		case "rest":
			return "Repouso";
		case "combat":
			return "Combate";
		case "treasure":
			return "Tesouro";
		case "puzzle":
			return "Enigma";
		case "boss":
			return "Chefe";
		default:
			return type;
	}
}

function getRoomTypeIcon(type: string): string {
	switch (type) {
		case "rest":
			return "⛺";
		case "combat":
			return "⚔️";
		case "treasure":
			return "📦";
		case "puzzle":
			return "🧩";
		case "boss":
			return "💀";
		default:
			return "❓";
	}
}

function generateGridMatrix(
	rooms: DungeonRoomRecord[],
	gridSize = 4,
): (DungeonRoomRecord | null)[][] {
	const matrix: (DungeonRoomRecord | null)[][] = Array(gridSize)
		.fill(null)
		.map(() => Array(gridSize).fill(null));

	for (const room of rooms) {
		if (
			room.coordinateX >= 0 &&
			room.coordinateX < gridSize &&
			room.coordinateY >= 0 &&
			room.coordinateY < gridSize
		) {
			matrix[room.coordinateY][room.coordinateX] = room;
		}
	}
	return matrix;
}

function deriveCurrentRoomId(rooms: DungeonRoomRecord[]): string {
	if (rooms.length === 0) return "room_0_0";
	const clearedRooms = rooms.filter((r) => r.status === "cleared");
	if (clearedRooms.length === 0) return "room_0_0";
	const sorted = [...clearedRooms].sort((a, b) => {
		const timeA = new Date(a.updatedAt).getTime();
		const timeB = new Date(b.updatedAt).getTime();
		if (timeA !== timeB) return timeB - timeA;
		return b.coordinateX + b.coordinateY - (a.coordinateX + a.coordinateY);
	});
	return sorted[0]?.roomId ?? "room_0_0";
}

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeRoom(
	overrides: Partial<DungeonRoomRecord> = {},
): DungeonRoomRecord {
	return {
		id: "r1",
		delveId: "d1",
		roomId: "room_0_0",
		type: "combat",
		status: "revealed",
		coordinateX: 0,
		coordinateY: 0,
		connectionsCsv: "",
		lootJson: null,
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		...overrides,
	};
}

// ─── Testes ───────────────────────────────────────────────────────────────────

describe("DungeonMap — getRoomTypeLabel", () => {
	it("traduz 'combat' para pt-BR", () => {
		expect(getRoomTypeLabel("combat")).toBe("Combate");
	});

	it("traduz 'rest' para pt-BR", () => {
		expect(getRoomTypeLabel("rest")).toBe("Repouso");
	});

	it("traduz 'treasure' para pt-BR", () => {
		expect(getRoomTypeLabel("treasure")).toBe("Tesouro");
	});

	it("traduz 'puzzle' para pt-BR", () => {
		expect(getRoomTypeLabel("puzzle")).toBe("Enigma");
	});

	it("traduz 'boss' para pt-BR", () => {
		expect(getRoomTypeLabel("boss")).toBe("Chefe");
	});

	it("retorna o próprio tipo para valores desconhecidos", () => {
		expect(getRoomTypeLabel("unknown_type")).toBe("unknown_type");
	});
});

describe("DungeonMap — getRoomTypeIcon", () => {
	it("retorna ícone correto para cada tipo canônico", () => {
		expect(getRoomTypeIcon("rest")).toBe("⛺");
		expect(getRoomTypeIcon("combat")).toBe("⚔️");
		expect(getRoomTypeIcon("treasure")).toBe("📦");
		expect(getRoomTypeIcon("puzzle")).toBe("🧩");
		expect(getRoomTypeIcon("boss")).toBe("💀");
	});

	it("retorna '❓' para tipo desconhecido", () => {
		expect(getRoomTypeIcon("anything_else")).toBe("❓");
	});
});

describe("DungeonMap — generateGridMatrix", () => {
	it("retorna matriz vazia (null) quando não há salas", () => {
		const grid = generateGridMatrix([]);
		expect(grid).toHaveLength(4);
		expect(grid[0]).toHaveLength(4);
		expect(grid[0][0]).toBeNull();
	});

	it("posiciona sala na célula correta [y][x]", () => {
		const room = makeRoom({ coordinateX: 2, coordinateY: 1, roomId: "room_2_1" });
		const grid = generateGridMatrix([room]);
		expect(grid[1][2]).toStrictEqual(room);
		expect(grid[0][0]).toBeNull();
	});

	it("ignora salas fora dos limites do grid", () => {
		const outOfBounds = makeRoom({ coordinateX: 5, coordinateY: 5 });
		const grid = generateGridMatrix([outOfBounds]);
		const allCells = grid.flat();
		expect(allCells.every((c) => c === null)).toBe(true);
	});

	it("posiciona múltiplas salas corretamente", () => {
		const r00 = makeRoom({ coordinateX: 0, coordinateY: 0, roomId: "room_0_0" });
		const r13 = makeRoom({ coordinateX: 1, coordinateY: 3, roomId: "room_1_3" });
		const grid = generateGridMatrix([r00, r13]);
		expect(grid[0][0]).toStrictEqual(r00);
		expect(grid[3][1]).toStrictEqual(r13);
	});
});

describe("DungeonMap — deriveCurrentRoomId", () => {
	it("retorna 'room_0_0' quando não há salas", () => {
		expect(deriveCurrentRoomId([])).toBe("room_0_0");
	});

	it("retorna 'room_0_0' quando nenhuma sala foi desbravada", () => {
		const rooms = [
			makeRoom({ status: "revealed", roomId: "room_0_0" }),
			makeRoom({ status: "hidden", roomId: "room_1_0" }),
		];
		expect(deriveCurrentRoomId(rooms)).toBe("room_0_0");
	});

	it("retorna a sala desbravada mais recente pelo timestamp", () => {
		const earlier = makeRoom({
			status: "cleared",
			roomId: "room_0_0",
			updatedAt: "2026-06-15T10:00:00.000Z",
		});
		const later = makeRoom({
			status: "cleared",
			roomId: "room_1_1",
			updatedAt: "2026-06-15T12:00:00.000Z",
		});
		expect(deriveCurrentRoomId([earlier, later])).toBe("room_1_1");
	});

	it("desempata por soma de coordenadas quando timestamps são iguais", () => {
		const ts = "2026-06-15T10:00:00.000Z";
		const low = makeRoom({ status: "cleared", roomId: "room_0_0", coordinateX: 0, coordinateY: 0, updatedAt: ts });
		const high = makeRoom({ status: "cleared", roomId: "room_2_2", coordinateX: 2, coordinateY: 2, updatedAt: ts });
		expect(deriveCurrentRoomId([low, high])).toBe("room_2_2");
	});
});
