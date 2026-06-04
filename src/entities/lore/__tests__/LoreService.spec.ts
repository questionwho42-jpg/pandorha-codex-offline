import { describe, expect, it } from "vitest";
import type {
	ClockData,
	IClockRepository,
} from "$lib/entities/clocks/model-api";
import type {
	SocialRepository,
	SocialRepositoryFailure,
} from "$lib/entities/social/domain/SocialRepository";
import type {
	BloodDebtRecord,
	FactionRecord,
	ReputationRecord,
} from "$lib/entities/social/model/socialSchema";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import { LoreService } from "../domain/LoreService";
import { InMemoryLoreRepository } from "../infrastructure/InMemoryLoreRepository";

// Implementação Fake de IClockRepository para Teste
class FakeClockRepository implements IClockRepository {
	public clocks = new Map<string, ClockData>();
	public shouldFail = false;

	public async save(clock: ClockData): Promise<Result<ClockData, Error>> {
		if (this.shouldFail) return fail(new Error("Injected clock save failure"));
		this.clocks.set(clock.id, clock);
		return ok(clock);
	}

	public async findById(id: string): Promise<Result<ClockData | null, Error>> {
		if (this.shouldFail) return fail(new Error("Injected clock find failure"));
		return ok(this.clocks.get(id) ?? null);
	}

	public async findAll(): Promise<Result<ClockData[], Error>> {
		if (this.shouldFail)
			return fail(new Error("Injected clock find all failure"));
		return ok(Array.from(this.clocks.values()));
	}

	public async delete(id: string): Promise<Result<void, Error>> {
		if (this.shouldFail)
			return fail(new Error("Injected clock delete failure"));
		this.clocks.delete(id);
		return ok(undefined);
	}
}

// Implementação Fake de SocialRepository para Teste
class FakeSocialRepository implements SocialRepository {
	public reputations = new Map<string, ReputationRecord>();
	public shouldFail = false;
	public errorCode: SocialRepositoryFailure["code"] =
		"SOCIAL_REPOSITORY_READ_FAILED";

	public async saveFaction(
		faction: FactionRecord,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		return ok(faction);
	}

	public async findFactionById(
		id: string,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		return ok({
			id,
			name: "Faction Name",
			description: "",
			alignment: "neutral",
		});
	}

	public async listFactions(): Promise<
		Result<readonly FactionRecord[], SocialRepositoryFailure>
	> {
		return ok([]);
	}

	public async saveReputation(
		reputation: ReputationRecord,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		const key = `${reputation.characterId}:${reputation.factionId}`;
		this.reputations.set(key, reputation);
		return ok(reputation);
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		if (this.shouldFail) {
			return fail({
				code: this.errorCode,
				message: "Injected social failure",
			});
		}
		const key = `${characterId}:${factionId}`;
		const rep = this.reputations.get(key);
		if (!rep) {
			return fail({
				code: "REPUTATION_NOT_FOUND",
				message: `Reputation not found for character ${characterId} and faction ${factionId}`,
			});
		}
		return ok(rep);
	}

	public async listReputationsByCharacter(
		_characterId: string,
	): Promise<Result<readonly ReputationRecord[], SocialRepositoryFailure>> {
		return ok([]);
	}

	public async saveBloodDebt(
		debt: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, SocialRepositoryFailure>> {
		return ok(debt);
	}

	public async listBloodDebtsByCharacter(
		_characterId: string,
	): Promise<Result<readonly BloodDebtRecord[], SocialRepositoryFailure>> {
		return ok([]);
	}
}

describe("LoreService", () => {
	const createSetup = () => {
		const loreRepo = new InMemoryLoreRepository();
		const clockRepo = new FakeClockRepository();
		const socialRepo = new FakeSocialRepository();
		const service = new LoreService(loreRepo, clockRepo, socialRepo);
		return { loreRepo, clockRepo, socialRepo, service };
	};

	describe("resolveLoreEncounter", () => {
		it("returns ok(null) when no encounters exist for the tile", async () => {
			const { service } = createSetup();
			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeNull();
			}
		});

		it("returns ok(null) when all encounters on the tile have already been triggered", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveEncounter({
				id: "enc-1",
				tileId: "tile-1",
				title: "Encontro 1",
				content: "Corpo do Encontro 1",
				factionIdRequired: null,
				reputationRequired: 0,
				requiredClockId: null,
				requiredClockValue: 0,
				isTriggered: true,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeNull();
			}
		});

		it("successfully resolves encounter when no conditions are specified, marking it as triggered", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveEncounter({
				id: "enc-1",
				tileId: "tile-1",
				title: "Encontro 1",
				content: "Corpo do Encontro 1",
				factionIdRequired: null,
				reputationRequired: 0,
				requiredClockId: null,
				requiredClockValue: 0,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success && result.data) {
				expect(result.data.id).toBe("enc-1");
				expect(result.data.isTriggered).toBe(true);
			}

			// Validar persistência
			const check = await loreRepo.findEncounterById("enc-1");
			expect(check.success && check.data?.isTriggered).toBe(true);
		});

		it("resolves the encounter with the alphabetically lower ID when multiple encounters match", async () => {
			const { service, loreRepo } = createSetup();
			const encB = {
				id: "enc-b",
				tileId: "tile-1",
				title: "Encontro B",
				content: "Conteudo B",
				factionIdRequired: null,
				reputationRequired: 0,
				requiredClockId: null,
				requiredClockValue: 0,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			};
			const encA = {
				id: "enc-a",
				tileId: "tile-1",
				title: "Encontro A",
				content: "Conteudo A",
				factionIdRequired: null,
				reputationRequired: 0,
				requiredClockId: null,
				requiredClockValue: 0,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			};

			await loreRepo.saveEncounter(encB);
			await loreRepo.saveEncounter(encA);

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success && result.data) {
				expect(result.data.id).toBe("enc-a");
			}
		});

		it("filters out encounters requiring faction reputation if the character has insufficient renown", async () => {
			const { service, loreRepo, socialRepo } = createSetup();
			await loreRepo.saveEncounter({
				id: "enc-faction",
				tileId: "tile-1",
				title: "Faction Encounter",
				content: "Need renown",
				factionIdRequired: "fac-order",
				reputationRequired: 10,
				requiredClockId: null,
				requiredClockValue: 0,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			// Caso 1: Sem registro de reputação (trata como 0)
			let result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeNull();
			}

			// Caso 2: Reputação abaixo do limite (ex: 5)
			await socialRepo.saveReputation({
				id: "rep-1",
				characterId: "char-1",
				factionId: "fac-order",
				value: 5,
				updatedAt: "2026-06-02T00:00:00Z",
			});
			result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeNull();
			}

			// Caso 3: Reputação suficiente (ex: 10)
			await socialRepo.saveReputation({
				id: "rep-1",
				characterId: "char-1",
				factionId: "fac-order",
				value: 10,
				updatedAt: "2026-06-02T00:00:00Z",
			});
			result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success && result.data) {
				expect(result.data.id).toBe("enc-faction");
			}
		});

		it("filters out encounters requiring a progress clock if the clock value is insufficient", async () => {
			const { service, loreRepo, clockRepo } = createSetup();
			await loreRepo.saveEncounter({
				id: "enc-clock",
				tileId: "tile-1",
				title: "Clock Encounter",
				content: "Need clock ticks",
				factionIdRequired: null,
				reputationRequired: 0,
				requiredClockId: "clock-doom",
				requiredClockValue: 4,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			// Caso 1: Clock não existe
			let result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeNull();
			}

			// Caso 2: Clock existe com ticks insuficientes (ex: 2)
			await clockRepo.save({
				id: "clock-doom",
				name: "Doom Clock",
				totalSegments: 6,
				filledSegments: 2,
				isCompleted: false,
			});
			result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toBeNull();
			}

			// Caso 3: Clock com ticks suficientes (ex: 4)
			await clockRepo.save({
				id: "clock-doom",
				name: "Doom Clock",
				totalSegments: 6,
				filledSegments: 4,
				isCompleted: false,
			});
			result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(true);
			if (result.success && result.data) {
				expect(result.data.id).toBe("enc-clock");
			}
		});

		it("propagates lore repository listing failures", async () => {
			const { service, loreRepo } = createSetup();
			loreRepo.listEncountersByTile = async () =>
				fail({
					code: "LORE_REPOSITORY_READ_FAILED",
					message: "Mocked repository read failure",
				});

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Mocked repository read failure");
			}
		});

		it("propagates social repository failures other than REPUTATION_NOT_FOUND", async () => {
			const { service, loreRepo, socialRepo } = createSetup();
			await loreRepo.saveEncounter({
				id: "enc-1",
				tileId: "tile-1",
				title: "Encontro",
				content: "Conteudo",
				factionIdRequired: "fac-order",
				reputationRequired: 5,
				requiredClockId: null,
				requiredClockValue: 0,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			socialRepo.shouldFail = true;
			socialRepo.errorCode = "SOCIAL_REPOSITORY_READ_FAILED";

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Injected social failure");
			}
		});

		it("propagates clock repository failures", async () => {
			const { service, loreRepo, clockRepo } = createSetup();
			await loreRepo.saveEncounter({
				id: "enc-1",
				tileId: "tile-1",
				title: "Encontro",
				content: "Conteudo",
				factionIdRequired: null,
				reputationRequired: 0,
				requiredClockId: "clock-doom",
				requiredClockValue: 2,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			clockRepo.shouldFail = true;

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Injected clock find failure");
			}
		});

		it("propagates save encounter failures", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveEncounter({
				id: "enc-1",
				tileId: "tile-1",
				title: "Encontro 1",
				content: "Corpo do Encontro 1",
				factionIdRequired: null,
				reputationRequired: 0,
				requiredClockId: null,
				requiredClockValue: 0,
				isTriggered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			loreRepo.saveEncounter = async () =>
				fail({
					code: "LORE_REPOSITORY_WRITE_FAILED",
					message: "Mocked write error",
				});

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Mocked write error");
			}
		});

		it("deve capturar erros lançados como Error na resolução de encontro", async () => {
			const { service, loreRepo } = createSetup();
			loreRepo.listEncountersByTile = async () => {
				throw new TypeError("Erro catastrófico");
			};

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Erro catastrófico");
			}
		});

		it("deve capturar erros lançados como string genérica na resolução de encontro", async () => {
			const { service, loreRepo } = createSetup();
			loreRepo.listEncountersByTile = async () => {
				throw "Erro texto";
			};

			const result = await service.resolveLoreEncounter("tile-1", "char-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe(
					"An unexpected error occurred during lore encounter resolution.",
				);
			}
		});
	});

	describe("discoverRumor", () => {
		it("marks a rumor as discovered successfully", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveRumor({
				id: "rumor-1",
				tileId: "tile-1",
				factionId: null,
				title: "Rumor 1",
				content: "Conteudo 1",
				isDiscovered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			const result = await service.discoverRumor("rumor-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBe("rumor-1");
				expect(result.data.isDiscovered).toBe(true);
			}

			// Validar persistência
			const check = await loreRepo.findRumorById("rumor-1");
			expect(check.success && check.data?.isDiscovered).toBe(true);
		});

		it("returns rumor immediately if already discovered without saving again", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveRumor({
				id: "rumor-1",
				tileId: "tile-1",
				factionId: null,
				title: "Rumor 1",
				content: "Conteudo 1",
				isDiscovered: true,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			let saveCalled = false;
			loreRepo.saveRumor = async (r) => {
				saveCalled = true;
				return ok(r);
			};

			const result = await service.discoverRumor("rumor-1");
			expect(result.success).toBe(true);
			expect(saveCalled).toBe(false);
		});

		it("fails if searching the rumor fails in repository", async () => {
			const { service, loreRepo } = createSetup();
			loreRepo.findRumorById = async () =>
				fail({
					code: "LORE_REPOSITORY_READ_FAILED",
					message: "Mocked read error",
				});

			const result = await service.discoverRumor("rumor-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Mocked read error");
			}
		});

		it("fails if the rumor does not exist", async () => {
			const { service } = createSetup();
			const result = await service.discoverRumor("missing-rumor");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe(
					"Rumor with ID missing-rumor not found.",
				);
			}
		});

		it("fails if saving the discovered rumor fails in repository", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveRumor({
				id: "rumor-1",
				tileId: "tile-1",
				factionId: null,
				title: "Rumor 1",
				content: "Conteudo 1",
				isDiscovered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			loreRepo.saveRumor = async () =>
				fail({
					code: "LORE_REPOSITORY_WRITE_FAILED",
					message: "Mocked write error",
				});

			const result = await service.discoverRumor("rumor-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Mocked write error");
			}
		});
	});

	describe("listDiscoveredRumorsByTile", () => {
		it("lists only discovered rumors for a specific tile", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveRumor({
				id: "rumor-a",
				tileId: "tile-1",
				factionId: null,
				title: "Rumor A",
				content: "Conteudo A",
				isDiscovered: true,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});
			await loreRepo.saveRumor({
				id: "rumor-b",
				tileId: "tile-1",
				factionId: null,
				title: "Rumor B",
				content: "Conteudo B",
				isDiscovered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			const result = await service.listDiscoveredRumorsByTile("tile-1");
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.length).toBe(1);
				expect(result.data[0]?.id).toBe("rumor-a");
			}
		});

		it("propagates repository read failures", async () => {
			const { service, loreRepo } = createSetup();
			loreRepo.listRumorsByTile = async () =>
				fail({
					code: "LORE_REPOSITORY_READ_FAILED",
					message: "Mocked tile read error",
				});

			const result = await service.listDiscoveredRumorsByTile("tile-1");
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Mocked tile read error");
			}
		});
	});

	describe("listAllDiscoveredRumors", () => {
		it("lists all discovered rumors across all tiles", async () => {
			const { service, loreRepo } = createSetup();
			await loreRepo.saveRumor({
				id: "rumor-a",
				tileId: "tile-1",
				factionId: null,
				title: "Rumor A",
				content: "Conteudo A",
				isDiscovered: true,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});
			await loreRepo.saveRumor({
				id: "rumor-b",
				tileId: "tile-2",
				factionId: null,
				title: "Rumor B",
				content: "Conteudo B",
				isDiscovered: true,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});
			await loreRepo.saveRumor({
				id: "rumor-c",
				tileId: "tile-2",
				factionId: null,
				title: "Rumor C",
				content: "Conteudo C",
				isDiscovered: false,
				createdAt: "2026-06-02T00:00:00Z",
				updatedAt: "2026-06-02T00:00:00Z",
			});

			const result = await service.listAllDiscoveredRumors();
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.length).toBe(2);
				expect(result.data.map((r) => r.id)).toContain("rumor-a");
				expect(result.data.map((r) => r.id)).toContain("rumor-b");
			}
		});

		it("propagates repository read failures", async () => {
			const { service, loreRepo } = createSetup();
			loreRepo.listAllRumors = async () =>
				fail({
					code: "LORE_REPOSITORY_READ_FAILED",
					message: "Mocked all read error",
				});

			const result = await service.listAllDiscoveredRumors();
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.message).toBe("Mocked all read error");
			}
		});
	});
});
