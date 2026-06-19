import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import initSqlJs from "sql.js";
import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { SqliteOpfsBootstrapService } from "$lib/shared/persistence/domain/SqliteOpfsBootstrapService";
import type {
	DatabaseFileFailure,
	DatabaseFileStorage,
} from "$lib/shared/persistence/model/sqliteOpfsTypes";
import { handleDatabaseWorkerRequest } from "$lib/shared/persistence/worker/databaseWorkerHandler";

const REQUESTED_AT = "2026-06-13T11:30:00.000Z";
const projectRoot = resolve(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"..",
	"..",
);
const sqlJsWasmPath = join(
	projectRoot,
	"node_modules",
	"sql.js",
	"dist",
	"sql-wasm.wasm",
);

class InMemoryDatabaseFileStorage implements DatabaseFileStorage {
	public fileName = "pandorha.sqlite3";
	public writeCount = 0;
	public fileBytes: Uint8Array | null = null;

	public async readDatabaseFile(): Promise<
		Result<Uint8Array | null, DatabaseFileFailure>
	> {
		return ok(this.fileBytes);
	}

	public async writeDatabaseFile(
		bytes: Uint8Array,
	): Promise<Result<void, DatabaseFileFailure>> {
		this.writeCount += 1;
		this.fileBytes = bytes;
		return ok(undefined);
	}
}

function createService(
	storage: DatabaseFileStorage,
): SqliteOpfsBootstrapService {
	return new SqliteOpfsBootstrapService({
		storage,
		createSqlite: async () => {
			return initSqlJs({
				locateFile: () => sqlJsWasmPath,
			});
		},
	});
}

describe("Downtime & Recess - Integration Tests (RPC)", () => {
	it("deve executar o recesso semanal sob transação RPC, atualizando clocks, ameaça e logs", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const bootstrapService = createService(storage);

		// 1. Inicializar o banco de dados
		const initRes = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "INIT_DATABASE",
				payload: { requestedAt: REQUESTED_AT },
			},
			{ bootstrapService },
		);
		if (!initRes.success) {
			console.error("INIT_DATABASE ERROR:", initRes.error);
			expect.fail(
				`INIT_DATABASE falhou: ${initRes.error.message} (${initRes.error.code})`,
			);
		}

		// 2. Criar personagem de teste (Kael)
		const charRes = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "SAVE_CHARACTER",
				payload: {
					character: {
						id: "kael-123",
						name: "Kael de Almar",
						concept: "Vanguarda Protetor",
						ancestryId: "human",
						classId: "vanguard",
						backgroundId: "acolyte",
						level: 2,
						experiencePoints: 0,
						physical: 3,
						mental: 2,
						social: 1,
						conflict: 2,
						interaction: 1,
						resistance: 3,
						createdAt: REQUESTED_AT,
						updatedAt: REQUESTED_AT,
					},
				},
			},
			{ bootstrapService },
		);
		expect(charRes.success).toBe(true);

		// 3. Criar Bastião de teste com 1000 PO
		const bastionRes = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "SAVE_BASTION",
				payload: {
					bastion: {
						id: "bastion_default",
						name: "O Bastião Central",
						chassisId: "fortaleza_pedra",
						tier: 1,
						structure: 5,
						vigilance: 5,
						logistics: 5,
						integrityCurrent: 100,
						threatCurrent: 2, // Ameaça inicial
						vaultGold: 1000,
						createdAt: REQUESTED_AT,
						updatedAt: REQUESTED_AT,
					},
				},
			},
			{ bootstrapService },
		);
		expect(bastionRes.success).toBe(true);

		// 4. Registrar um clock de ameaça ativo
		const clockRes = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "SAVE_CLOCK",
				payload: {
					clock: {
						id: "00000000-0000-0000-0000-000000000001",
						name: "Ameaça: Sectários da Ruína",
						totalSegments: 4,
						filledSegments: 2,
						isCompleted: false,
						triggerEvent: "siege",
					},
				},
			},
			{ bootstrapService },
		);
		expect(clockRes.success).toBe(true);

		// 5. Verificar recesso inicial da campanha (deve ser criado se não existir)
		const getRecessRes1 = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "GET_CAMPAIGN_RECESS",
				payload: { campaignId: "campaign_default" },
			},
			{ bootstrapService },
		);
		expect(getRecessRes1.success).toBe(true);
		expect((getRecessRes1 as any).data.recessDays).toBe(7);

		// Adicionar 7 dias adicionais de recesso para ter saldo
		const addRecessRes = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "ADD_RECESS_DAYS",
				payload: { campaignId: "campaign_default", days: 7 },
			},
			{ bootstrapService },
		);
		expect(addRecessRes.success).toBe(true);

		// 6. Resolver a semana de recesso alocando Kael no Sustento (Tag A) no Bastião
		const resolveDowntimeRes = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "RESOLVE_DOWNTIME_WEEK",
				payload: {
					campaignId: "campaign_default",
					location: "bastion",
					allocations: [
						{
							characterId: "kael-123",
							actionTag: "A",
							params: {
								tier: "militar",
								statName: "physical",
							},
						},
					],
				},
			},
			{ bootstrapService },
		);

		if (!resolveDowntimeRes.success) {
			console.error("RESOLVE_DOWNTIME_WEEK ERROR:", resolveDowntimeRes.error);
			expect.fail(
				`RESOLVE_DOWNTIME_WEEK falhou: ${resolveDowntimeRes.error.message} (${resolveDowntimeRes.error.code})`,
			);
		}
		const data = (resolveDowntimeRes as any).data;
		expect(data.recessDaysRemaining).toBe(7); // Tinha 14 (7+7), consumiu 7
		expect(data.currentDateDays).toBe(7);
		expect(data.logRecords).toHaveLength(1);
		expect(data.logRecords[0].actionTag).toBe("A");

		// 7. Validar avanço de Ameaça e Clocks
		// O recesso foi no Bastião, então a ameaça deve ter sido atenuada (reduziu em 1, de 2 para 1)
		const getBastionRes = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "FIND_BASTION",
				payload: { id: "bastion_default" },
			},
			{ bootstrapService },
		);
		expect(getBastionRes.success).toBe(true);
		expect((getBastionRes as any).data.threatCurrent).toBe(1);

		// O Clock de ameaça (Sectários) avançou +1 segmento (2 -> 3) e não disparou cerco ainda
		expect(data.siegeTriggered).toBe(false);
	});

	it("deve disparar cerco militar atenuado ao preencher o clock de Ameaça sob recesso no Bastião", async () => {
		const storage = new InMemoryDatabaseFileStorage();
		const bootstrapService = createService(storage);

		await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "INIT_DATABASE",
				payload: { requestedAt: REQUESTED_AT },
			},
			{ bootstrapService },
		);

		await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "SAVE_BASTION",
				payload: {
					bastion: {
						id: "bastion_default",
						name: "O Bastião Central",
						chassisId: "fortaleza_pedra",
						tier: 1,
						structure: 5,
						vigilance: 5,
						logistics: 5,
						integrityCurrent: 100,
						threatCurrent: 2,
						vaultGold: 1000,
						createdAt: REQUESTED_AT,
						updatedAt: REQUESTED_AT,
					},
				},
			},
			{ bootstrapService },
		);

		// Registrar um clock na beira da conclusão (3/4 segmentos)
		await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "SAVE_CLOCK",
				payload: {
					clock: {
						id: "00000000-0000-0000-0000-000000000001",
						name: "Ameaça: Sectários da Ruína",
						totalSegments: 4,
						filledSegments: 3, // Vai para 4 e dispara cerco
						isCompleted: false,
						triggerEvent: "siege",
					},
				},
			},
			{ bootstrapService },
		);

		// Resolver a semana de recesso no Bastião
		const res = await handleDatabaseWorkerRequest(
			{
				messageId: crypto.randomUUID(),
				type: "RESOLVE_DOWNTIME_WEEK",
				payload: {
					campaignId: "campaign_default",
					location: "bastion",
					allocations: [],
				},
			},
			{ bootstrapService },
		);

		if (!res.success) {
			console.error("RESOLVE_DOWNTIME_WEEK ERROR:", res.error);
			expect.fail(
				`RESOLVE_DOWNTIME_WEEK falhou: ${res.error.message} (${res.error.code})`,
			);
		}
		const data = (res as any).data;
		expect(data.siegeTriggered).toBe(true);
		// Nível de perigo do cerco original seria 3, mas foi atenuado para 2
		expect(data.siegeRecord.dangerLevel).toBe(2);
		expect(data.siegeRecord.factionId).toBe("fac-ruin");
	});
});
