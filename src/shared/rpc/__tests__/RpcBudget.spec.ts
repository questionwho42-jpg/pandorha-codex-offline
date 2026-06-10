import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { CharacterBuilder } from "$lib/entities/character/testing/CharacterBuilder";
import { ok, type Result } from "$lib/shared/lib/result";
import { SqliteOpfsBootstrapService } from "$lib/shared/persistence/domain/SqliteOpfsBootstrapService";
import type { DatabaseFileStorage } from "$lib/shared/persistence/model/sqliteOpfsTypes";
import { FakeWorkerBridge } from "../testing/FakeWorkerBridge";

const projectRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"../../../../",
);
const sqlJsWasmPath = path.join(
	projectRoot,
	"node_modules",
	"sql.js",
	"dist",
	"sql-wasm.wasm",
);

describe("RPC Call Budget & SQLite Benchmarks", () => {
	it("should respect the exact RPC message budget (1 message per operation)", async () => {
		const bridge = new FakeWorkerBridge();
		const msgId1 = "11111111-1111-4111-8111-111111111111";
		const msgId2 = "22222222-2222-4222-8222-222222222222";

		// 1. Inicia o Database (Budget: 1 chamada)
		bridge.queueResponse({
			messageId: msgId1,
			success: true,
			data: {
				initialized: true,
				loadedExistingDatabase: false,
				appliedMigrationIds: ["0000_init"],
				tableNames: ["characters"],
			},
		});

		const initReq = {
			messageId: msgId1,
			type: "INIT_DATABASE" as const,
			payload: { requestedAt: "2026-06-10T00:00:00.000Z" },
		};

		const initResult = await bridge.send(initReq);
		if (!initResult.success) {
			console.log("BRIDGE INIT FAILED:", initResult.error);
		}
		expect(initResult.success).toBe(true);
		expect(bridge.requests.length).toBe(1);
		expect(bridge.requests[0]?.type).toBe("INIT_DATABASE");

		// 2. Salva o Snapshot (Budget: 1 chamada adicional)
		bridge.queueResponse({
			messageId: msgId2,
			success: true,
			data: { saved: true },
		});

		const saveReq = {
			messageId: msgId2,
			type: "SAVE_GAME_SNAPSHOT" as const,
			payload: {
				saveId: "primary",
				snapshot: {
					version: 1,
					savedAt: "2026-06-10T00:00:00.000Z",
					characters: [],
					worldState: [],
				},
			},
		};

		const saveResult = await bridge.send(saveReq);
		if (!saveResult.success) {
			console.log("BRIDGE SAVE FAILED:", saveResult.error);
		}
		expect(saveResult.success).toBe(true);
		expect(bridge.requests.length).toBe(2);
		expect(bridge.requests[1]?.type).toBe("SAVE_GAME_SNAPSHOT");
	});

	it("should benchmark SQLite database operations and write to artifacts", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const SQL = await initSqlJs({
			locateFile: () => sqlJsWasmPath,
		});

		const bootstrapService = new SqliteOpfsBootstrapService({
			storage,
			createSqlite: () => Promise.resolve(SQL), // Passa a fábrica SQL retornada pelo initSqlJs
			bindDrizzle: (database) => drizzle(database),
		});

		// 1. Benchmark Database Initialization
		const t0 = performance.now();
		const initRes = await bootstrapService.initializeDatabase({
			requestedAt: "2026-06-10T00:00:00.000Z",
		});
		const t1 = performance.now();
		const initMs = t1 - t0;

		if (!initRes.success) {
			console.log("BOOTSTRAP INIT DATABASE FAILED:", initRes.error);
		}
		expect(initRes.success).toBe(true);

		// 2. Benchmark Save Snapshot (com payload complexo)
		const mockCharacter = {
			...CharacterBuilder.valid().buildCreateInput(),
			id: "char-bench-1",
			experiencePoints: 100,
			tensionMeter: 4,
			createdAt: "2026-06-10T00:00:00.000Z",
			updatedAt: "2026-06-10T00:00:00.000Z",
		};

		const snapshotPayload = {
			version: 1 as const,
			savedAt: "2026-06-10T00:00:00.000Z",
			characters: [mockCharacter],
			worldState: [
				{
					key: "clock:active-threat",
					value: true,
					updatedAt: "2026-06-10T00:00:00.000Z",
				},
			],
		};

		const t2 = performance.now();
		const saveRes = await bootstrapService.saveGameSnapshot(snapshotPayload);
		const t3 = performance.now();
		const saveMs = t3 - t2;

		if (!saveRes.success) {
			console.log("BOOTSTRAP SAVE SNAPSHOT FAILED:", saveRes.error);
		}
		expect(saveRes.success).toBe(true);

		// 3. Benchmark Load Snapshot
		const t4 = performance.now();
		const loadRes = await bootstrapService.loadGameSnapshot();
		const t5 = performance.now();
		const loadMs = t5 - t4;

		if (!loadRes.success) {
			console.log("BOOTSTRAP LOAD SNAPSHOT FAILED:", loadRes.error);
		}
		expect(loadRes.success).toBe(true);

		// Garantir orçamentos máximos de tempo de execução local (tolerâncias generosas para evitar CI flutuante)
		expect(initMs).toBeLessThan(1500); // init (migrations) < 1.5s
		expect(saveMs).toBeLessThan(500); // save < 500ms
		expect(loadMs).toBeLessThan(500); // load < 500ms

		// Exportar relatório de benchmarks em JSON
		const benchmarkResult = {
			timestamp: new Date().toISOString(),
			database_init_ms: Number(initMs.toFixed(2)),
			snapshot_save_ms: Number(saveMs.toFixed(2)),
			snapshot_load_ms: Number(loadMs.toFixed(2)),
		};

		const artifactPath = path.join(projectRoot, "artifacts");
		mkdirSync(artifactPath, { recursive: true });
		writeFileSync(
			path.join(artifactPath, "benchmarks.json"),
			`${JSON.stringify(benchmarkResult, null, 2)}\n`,
			"utf8",
		);
	});
});

// Helper Storage
class InMemoryDatabaseFileStorage implements DatabaseFileStorage {
	private fileBytes: Uint8Array | null = null;

	public async readDatabaseFile(): Promise<Result<Uint8Array | null, never>> {
		return ok(this.fileBytes);
	}

	public async writeDatabaseFile(
		bytes: Uint8Array,
	): Promise<Result<void, never>> {
		this.fileBytes = bytes;
		return ok(undefined);
	}
}
