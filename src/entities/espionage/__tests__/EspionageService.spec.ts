/* biome-ignore-start lint/suspicious/noExplicitAny: legacy test mocks */
import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRepository } from "../../character/domain/CharacterRepository";
import type { CharacterRecord } from "../../character/model/characterSchema";
import type { CompanionRepository } from "../../companions/domain/CompanionRepository";
import type { CompanionRecord } from "../../companions/model/companionSchema";
import type { FactionRepository } from "../../social/domain/FactionRepository";
import type { CampaignSocialLedgerRecord } from "../../social/model/socialSchema";
import { EspionageService } from "../domain/EspionageService";
import { InMemoryEspionageRepository } from "../infrastructure/InMemoryEspionageRepository";
import { InMemoryWorldStateRepository } from "../../world-state/testing/InMemoryWorldStateRepository";

const TEST_TIMESTAMP = "2026-05-28T12:00:00.000Z";

// Mock do CharacterRepository
class FakeCharacterRepository implements Partial<CharacterRepository> {
	private readonly chars = new Map<string, CharacterRecord>();

	public setChar(char: CharacterRecord) {
		this.chars.set(char.id, char);
	}

	public async findById(id: string): Promise<Result<CharacterRecord, any>> {
		const char = this.chars.get(id);
		if (!char) {
			return fail({ code: "CHARACTER_NOT_FOUND", message: "Não encontrado" });
		}
		return ok(char);
	}

	public async save(
		record: CharacterRecord,
	): Promise<Result<CharacterRecord, any>> {
		this.chars.set(record.id, record);
		return ok(record);
	}
}

// Mock do FactionRepository
class FakeFactionRepository implements Partial<FactionRepository> {
	private ledger: CampaignSocialLedgerRecord | null = null;

	public setLedger(ledger: CampaignSocialLedgerRecord) {
		this.ledger = ledger;
	}

	public async getLedger(
		_id: string,
	): Promise<Result<CampaignSocialLedgerRecord | null, any>> {
		return ok(this.ledger);
	}

	public async saveLedger(
		record: CampaignSocialLedgerRecord,
	): Promise<Result<CampaignSocialLedgerRecord, any>> {
		this.ledger = record;
		return ok(record);
	}
}

// Mock do CompanionRepository
class FakeCompanionRepository implements Partial<CompanionRepository> {
	private readonly companions = new Map<string, CompanionRecord>();

	public setCompanion(comp: CompanionRecord) {
		this.companions.set(comp.id, comp);
	}

	public async getCompanion(
		id: string,
	): Promise<Result<CompanionRecord | null, any>> {
		const comp = this.companions.get(id);
		return ok(comp ?? null);
	}

	public async saveCompanion(
		record: CompanionRecord,
	): Promise<Result<CompanionRecord, any>> {
		this.companions.set(record.id, record);
		return ok(record);
	}
}

describe("EspionageService - Fundação de Células", () => {
	it("falha ao fundar célula se o personagem mestre não for encontrado", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo,
			characterRepo,
		);

		const result = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "inexistente",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("CHARACTER_NOT_FOUND");
		}
	});

	it("falha ao fundar célula se o ledger social da campanha não existir", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo = new FakeCharacterRepository();

		const char: CharacterRecord = {
			id: "hero_1",
			name: "Aria",
			concept: "Rogue",
			ancestryId: "human",
			classId: "rogue",
			backgroundId: "spy",
			level: 1,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 3,
			social: 3,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		characterRepo.setChar(char);

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo,
			characterRepo as unknown as CharacterRepository,
		);

		const result = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("LEDGER_NOT_FOUND");
		}
	});

	it("falha ao fundar célula se exceder o limite de fama de células ativas", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo = new FakeFactionRepository();
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo = new FakeCharacterRepository();

		const char: CharacterRecord = {
			id: "hero_1",
			name: "Aria",
			concept: "Rogue",
			ancestryId: "human",
			classId: "rogue",
			backgroundId: "spy",
			level: 1,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 3,
			social: 3,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		characterRepo.setChar(char);

		// Nível de fama 1 = limite de 1 célula
		factionRepo.setLedger({
			id: "campaign_1",
			fameXp: 100,
			fameLevel: 1,
			favorPoints: 10,
			updatedAt: TEST_TIMESTAMP,
		});

		// Adiciona uma célula pré-existente
		await espionageRepo.save({
			id: "cell_prev",
			campaignId: "campaign_1",
			factionId: "faction_prev",
			regionId: "region_prev",
			tenenteCompanionId: "tenente_prev",
			specializedAxis: "physical",
			tier: 1,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo as unknown as FactionRepository,
			companionRepo,
			characterRepo as unknown as CharacterRepository,
		);

		const result = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("EXCEEDS_FAME_CELL_LIMIT");
		}
	});

	it("falha ao fundar célula se o tenente selecionado não pertencer ao personagem ou estiver dissipado", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo = new FakeFactionRepository();
		const companionRepo = new FakeCompanionRepository();
		const characterRepo = new FakeCharacterRepository();

		const char: CharacterRecord = {
			id: "hero_1",
			name: "Aria",
			concept: "Rogue",
			ancestryId: "human",
			classId: "rogue",
			backgroundId: "spy",
			level: 1,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 3,
			social: 3,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		characterRepo.setChar(char);
		factionRepo.setLedger({
			id: "campaign_1",
			fameXp: 250,
			fameLevel: 2,
			favorPoints: 10,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo as unknown as FactionRepository,
			companionRepo as unknown as CompanionRepository,
			characterRepo as unknown as CharacterRepository,
		);

		// Tenente não encontrado
		const res1 = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_inexistente",
			specializedAxis: "physical",
			tier: 1,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});
		expect(res1.success).toBe(false);
		if (!res1.success) {
			expect(res1.error.code).toBe("COMPANION_NOT_FOUND");
		}

		// Tenente dissipado
		companionRepo.setCompanion({
			id: "tenente_dissipado",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 1,
			hpCurrent: 0,
			hpMax: 10,
			isShareSensory: false,
			isDissipated: true,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});
		const res2 = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_dissipado",
			specializedAxis: "physical",
			tier: 1,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});
		expect(res2.success).toBe(false);
		if (!res2.success) {
			expect(res2.error.code).toBe("COMPANION_DISSIPATED");
		}
	});

	it("falha se o tenente já estiver liderando outra célula ativa", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo = new FakeFactionRepository();
		const companionRepo = new FakeCompanionRepository();
		const characterRepo = new FakeCharacterRepository();

		const char: CharacterRecord = {
			id: "hero_1",
			name: "Aria",
			concept: "Rogue",
			ancestryId: "human",
			classId: "rogue",
			backgroundId: "spy",
			level: 1,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 3,
			social: 3,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		characterRepo.setChar(char);
		factionRepo.setLedger({
			id: "campaign_1",
			fameXp: 500,
			fameLevel: 3,
			favorPoints: 10,
			updatedAt: TEST_TIMESTAMP,
		});

		companionRepo.setCompanion({
			id: "tenente_1",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 1,
			hpCurrent: 10,
			hpMax: 10,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		// Adiciona célula com tenente_1
		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo as unknown as FactionRepository,
			companionRepo as unknown as CompanionRepository,
			characterRepo as unknown as CharacterRepository,
		);

		const result = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_2",
			regionId: "region_2",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "mental",
			tier: 1,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.code).toBe("TENENTE_ALREADY_ASSIGNED");
		}
	});

	it("falha ao fundar célula se não houver pontos de favor suficientes ou ouro suficiente", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo = new FakeFactionRepository();
		const companionRepo = new FakeCompanionRepository();
		const characterRepo = new FakeCharacterRepository();

		const char: CharacterRecord = {
			id: "hero_1",
			name: "Aria",
			concept: "Rogue",
			ancestryId: "human",
			classId: "rogue",
			backgroundId: "spy",
			level: 1,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 3,
			social: 3,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		characterRepo.setChar(char);

		companionRepo.setCompanion({
			id: "tenente_1",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 1,
			hpCurrent: 10,
			hpMax: 10,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo as unknown as FactionRepository,
			companionRepo as unknown as CompanionRepository,
			characterRepo as unknown as CharacterRepository,
		);

		// Sem favores (necessário: 3, disponível: 2)
		factionRepo.setLedger({
			id: "campaign_1",
			fameXp: 250,
			fameLevel: 2,
			favorPoints: 2,
			updatedAt: TEST_TIMESTAMP,
		});
		const res1 = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});
		expect(res1.success).toBe(false);
		if (!res1.success) {
			expect(res1.error.code).toBe("FAVOR_POINTS_INSUFFICIENT");
		}

		// Recarrega favores, mas ouro insuficiente (necessário 100 * tier 1 = 100 PO, disponível: 50 PO)
		factionRepo.setLedger({
			id: "campaign_1",
			fameXp: 250,
			fameLevel: 2,
			favorPoints: 5,
			updatedAt: TEST_TIMESTAMP,
		});
		const res2 = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			availableGold: 50,
			timestamp: TEST_TIMESTAMP,
		});
		expect(res2.success).toBe(false);
		if (!res2.success) {
			expect(res2.error.code).toBe("GOLD_INSUFFICIENT");
		}
	});

	it("funda célula com sucesso deduzindo os pontos de favor e validando ouro gasto", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo = new FakeFactionRepository();
		const companionRepo = new FakeCompanionRepository();
		const characterRepo = new FakeCharacterRepository();

		const char: CharacterRecord = {
			id: "hero_1",
			name: "Aria",
			concept: "Rogue",
			ancestryId: "human",
			classId: "rogue",
			backgroundId: "spy",
			level: 1,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 3,
			social: 3,
			conflict: 1,
			interaction: 1,
			resistance: 1,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		characterRepo.setChar(char);
		factionRepo.setLedger({
			id: "campaign_1",
			fameXp: 500,
			fameLevel: 3,
			favorPoints: 10,
			updatedAt: TEST_TIMESTAMP,
		});

		companionRepo.setCompanion({
			id: "tenente_1",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 2,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo as unknown as FactionRepository,
			companionRepo as unknown as CompanionRepository,
			characterRepo as unknown as CharacterRepository,
		);

		const result = await service.establishCell({
			campaignId: "campaign_1",
			characterId: "hero_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			availableGold: 1000,
			timestamp: TEST_TIMESTAMP,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.goldSpent).toBe(200); // 100 * tier 2 = 200
			expect(result.data.cell.factionId).toBe("faction_1");
			expect(result.data.cell.isLockdown).toBe(false);

			// Ledger deve ter restado 7 favores (10 - 3)
			const lRes = await factionRepo.getLedger("campaign_1");
			expect(lRes.success && lRes.data?.favorPoints).toBe(7);
		}
	});
});

describe("EspionageService - Resolução de Missões Autônomas", () => {
	it("falha ao rodar se a célula não for encontrada ou se estiver em lockdown", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo,
			characterRepo,
		);

		const resNotFound = await service.runAutonomousOperation({
			cellId: "inexistente",
			targetDc: 15,
			roll: 10,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
		});
		expect(resNotFound.success).toBe(false);
		if (!resNotFound.success) {
			expect(resNotFound.error.code).toBe("CELL_NOT_FOUND");
		}

		// Em lockdown
		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			isLockdown: true,
			lockdownWeeksRemaining: 1,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});
		const resLockdown = await service.runAutonomousOperation({
			cellId: "cell_1",
			targetDc: 15,
			roll: 10,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
		});
		expect(resLockdown.success).toBe(false);
		if (!resLockdown.success) {
			expect(resLockdown.error.code).toBe("CELL_IN_LOCKDOWN");
		}
	});

	it("resolve com falha crítica se d20 for 1 natural (com e sem suborno)", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo = new FakeCompanionRepository();
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		companionRepo.setCompanion({
			id: "tenente_1",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 2,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo as unknown as CompanionRepository,
			characterRepo,
		);

		// Sem suborno preventivo: célula é deletada
		const resNoBribe = await service.runAutonomousOperation({
			cellId: "cell_1",
			targetDc: 15,
			roll: 1,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
		});
		expect(resNoBribe.success).toBe(true);
		if (resNoBribe.success) {
			expect(resNoBribe.data.status).toBe("critical_failure");
			expect(resNoBribe.data.cellDestroyed).toBe(true);
			expect(resNoBribe.data.infamyGained).toBe(20);
		}
		// A célula deve ter sido removida do repositório
		const findRes = await espionageRepo.findById("cell_1");
		expect(findRes.success).toBe(false);

		// Com suborno preventivo: vira falha normal, entra em lockdown
		await espionageRepo.save({
			id: "cell_2",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const resBribe = await service.runAutonomousOperation({
			cellId: "cell_2",
			targetDc: 15,
			roll: 1,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
			usePreventionBribery: true,
			availableGold: 1000,
		});
		expect(resBribe.success).toBe(true);
		if (resBribe.success) {
			expect(resBribe.data.status).toBe("failure");
			expect(resBribe.data.cellDestroyed).toBe(false);
			expect(resBribe.data.cellLockedDown).toBe(true);
			expect(resBribe.data.goldSpent).toBe(100); // 50 * tier 2 = 100
		}
	});

	it("resolve com sucesso crítico se total for DC + 10 ou natural 20", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo = new FakeCompanionRepository();
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		companionRepo.setCompanion({
			id: "tenente_1",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 2,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "mental",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo as unknown as CompanionRepository,
			characterRepo,
		);

		const result = await service.runAutonomousOperation({
			cellId: "cell_1",
			targetDc: 10,
			roll: 18,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
		});
		// total = 18 (roll) + 2 (lieutenant tier) = 20 (DC 10 + 10) => Sucesso Crítico
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("critical_success");
			expect(result.data.triumphBenefit).toContain("Análise Profunda"); // specializedAxis: 'mental'
		}
	});

	it("aplica Regra de Ouro (Sucesso com Custo) em falha menor (DC - 1 a DC - 4)", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo = new FakeCompanionRepository();
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		companionRepo.setCompanion({
			id: "tenente_1",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 2,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo as unknown as CompanionRepository,
			characterRepo,
		);

		// DC = 15. Total = 10 (roll) + 2 (tier) = 12. Falha por 3 (enquadra na Regra de Ouro)
		// Opção: "heat"
		const resHeat = await service.runAutonomousOperation({
			cellId: "cell_1",
			targetDc: 15,
			roll: 10,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
		});
		expect(resHeat.success).toBe(true);
		if (resHeat.success) {
			expect(resHeat.data.status).toBe("golden_rule_success");
			expect(resHeat.data.heatGained).toBe(1);
			expect(resHeat.data.infamyGained).toBe(0);
		}

		// Opção: "infamy"
		await espionageRepo.save({
			id: "cell_2",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});
		const resInf = await service.runAutonomousOperation({
			cellId: "cell_2",
			targetDc: 15,
			roll: 10,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "infamy",
		});
		expect(resInf.success).toBe(true);
		if (resInf.success) {
			expect(resInf.data.status).toBe("golden_rule_success");
			expect(resInf.data.heatGained).toBe(0);
			expect(resInf.data.infamyGained).toBe(10);
		}
	});

	it("destrói a célula se houver falha sob Vigilância 3 (Caçada) e desativa regra de ouro", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo = new FakeCompanionRepository();
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		companionRepo.setCompanion({
			id: "tenente_1",
			characterId: "hero_1",
			name: "Bob",
			type: "scout",
			subModel: "Furtivo",
			tier: 2,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 3,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo as unknown as CompanionRepository,
			characterRepo,
		);

		// DC = 10 + 5 (Heat 3) = 15. Total = 8 (roll) + 2 (tier) = 10.
		// Normalmente enquadraria na Regra de Ouro (falha por 5), mas sob Heat 3 ela é desativada e destrói a célula
		const result = await service.runAutonomousOperation({
			cellId: "cell_1",
			targetDc: 10,
			roll: 8,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("failure");
			expect(result.data.cellDestroyed).toBe(true);
			expect(result.data.infamyGained).toBe(5);
		}
	});
});

describe("EspionageService - Resolução de Missões Coordenadas", () => {
	it("resolve com sucesso calculando o bônus do herói, modificadores e nível de fama", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "social",
			tier: 1,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo,
			characterRepo,
		);

		// Teste Coordenado: roll (10) + heroLevel (5) + heroModifier (3) + fameLevel (2) = 20
		const result = await service.runCoordinatedOperation({
			cellId: "cell_1",
			heroLevel: 5,
			heroModifier: 3,
			fameLevel: 2,
			targetDc: 18,
			roll: 10,
			timestamp: TEST_TIMESTAMP,
			goldenRuleResolution: "heat",
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe("success");
			expect(result.data.totalRoll).toBe(20);
			expect(result.data.effectiveDc).toBe(18);
		}
	});
});

describe("EspionageService - Recesso Semanal e Recursos", () => {
	it("consome manutenção e coloca células sem saldo em lockdown, decrementando o tempo das outras", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		// Célula 1 (Ativa, Tier 2 => custa 25 PO)
		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		// Célula 2 (Ativa, Tier 3 => custa 50 PO)
		await espionageRepo.save({
			id: "cell_2",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_2",
			tenenteCompanionId: "tenente_2",
			specializedAxis: "mental",
			tier: 3,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		// Célula 3 (Já em Lockdown por 2 semanas)
		await espionageRepo.save({
			id: "cell_3",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_3",
			tenenteCompanionId: "tenente_3",
			specializedAxis: "social",
			tier: 1,
			isLockdown: true,
			lockdownWeeksRemaining: 2,
			vigilanceHeat: 0,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo,
			characterRepo,
		);

		// Passa recesso com 40 PO (paga a cell_1 [25], mas falta saldo para a cell_2 [50] que entra em lockdown)
		const result = await service.processWeeklyMaintenance({
			campaignId: "campaign_1",
			availableGold: 40,
			timestamp: TEST_TIMESTAMP,
		});

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.goldSpent).toBe(25);

			// Cell 1 permanece ativa
			const c1 = await espionageRepo.findById("cell_1");
			expect(c1.success && c1.data.isLockdown).toBe(false);

			// Cell 2 entra em lockdown por 1 semana
			const c2 = await espionageRepo.findById("cell_2");
			expect(c2.success && c2.data.isLockdown).toBe(true);
			expect(c2.success && c2.data.lockdownWeeksRemaining).toBe(1);

			// Cell 3 decrementa tempo restante (2 - 1 = 1)
			const c3 = await espionageRepo.findById("cell_3");
			expect(c3.success && c3.data.isLockdown).toBe(true);
			expect(c3.success && c3.data.lockdownWeeksRemaining).toBe(1);
		}
	});

	it("reduz Heat em -1 com resfriamento passivo, ativando lockdown", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo =
			new FakeFactionRepository() as unknown as FactionRepository;
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 1,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 2,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo,
			companionRepo,
			characterRepo,
		);

		const res = await service.coolDownCell("cell_1", TEST_TIMESTAMP);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.isLockdown).toBe(true);
			expect(res.data.lockdownWeeksRemaining).toBe(1);
			expect(res.data.vigilanceHeat).toBe(1); // 2 - 1 = 1
		}
	});

	it("reduz Heat em -2 com limpeza ativa usando ouro ou favores", async () => {
		const espionageRepo = new InMemoryEspionageRepository();
		const factionRepo = new FakeFactionRepository();
		const companionRepo =
			new FakeCompanionRepository() as unknown as CompanionRepository;
		const characterRepo =
			new FakeCharacterRepository() as unknown as CharacterRepository;

		await espionageRepo.save({
			id: "cell_1",
			campaignId: "campaign_1",
			factionId: "faction_1",
			regionId: "region_1",
			tenenteCompanionId: "tenente_1",
			specializedAxis: "physical",
			tier: 2,
			isLockdown: false,
			lockdownWeeksRemaining: 0,
			vigilanceHeat: 3,
			methodOfControl: null,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		});

		const service = new EspionageService(
			espionageRepo,
			factionRepo as unknown as FactionRepository,
			companionRepo,
			characterRepo,
		);

		// Limpeza com Ouro: consome 100 * tier 2 = 200 PO, reduz Heat para 1 (3 - 2)
		const resGold = await service.clearHeatWithResources({
			cellId: "cell_1",
			method: "gold",
			availableGold: 500,
			campaignId: "campaign_1",
			timestamp: TEST_TIMESTAMP,
		});
		expect(resGold.success).toBe(true);
		if (resGold.success) {
			expect(resGold.data.goldSpent).toBe(200);
			expect(resGold.data.cell.vigilanceHeat).toBe(1);
		}

		// Limpeza com Favor: consome 1 favor, reduz Heat para 0 (1 - 2 => 0)
		factionRepo.setLedger({
			id: "campaign_1",
			fameXp: 100,
			fameLevel: 1,
			favorPoints: 5,
			updatedAt: TEST_TIMESTAMP,
		});
		const resFavor = await service.clearHeatWithResources({
			cellId: "cell_1",
			method: "favor",
			availableGold: 500,
			campaignId: "campaign_1",
			timestamp: TEST_TIMESTAMP,
		});
		expect(resFavor.success).toBe(true);
		if (resFavor.success) {
			expect(resFavor.data.favorPointsSpent).toBe(1);
			expect(resFavor.data.cell.vigilanceHeat).toBe(0);

			// Deve restar 4 favores
			const lRes = await factionRepo.getLedger("campaign_1");
			expect(lRes.success && lRes.data?.favorPoints).toBe(4);
		}
	});

	describe("EspionageService - Avanço de Tempo e Consequências Críticas", () => {
		it("processa manutenção semanal reativa baseada no tempo do world state", async () => {
			const espionageRepo = new InMemoryEspionageRepository();
			const factionRepo = new FakeFactionRepository() as unknown as FactionRepository;
			const companionRepo = new FakeCompanionRepository() as unknown as CompanionRepository;
			const characterRepo = new FakeCharacterRepository() as unknown as CharacterRepository;
			const worldStateRepo = new InMemoryWorldStateRepository();

			// Inicializar tempo no dia 1
			await worldStateRepo.setFlag({
				key: "location:current_time",
				valueJson: JSON.stringify({ day: 1, turn: 1, phase: "manha" }),
				updatedAt: TEST_TIMESTAMP,
			});

			// Célula ativa Tier 1 (manutenção = 10 PO)
			await espionageRepo.save({
				id: "cell_1",
				campaignId: "campaign_1",
				factionId: "faction_1",
				regionId: "region_1",
				tenenteCompanionId: "tenente_1",
				specializedAxis: "physical",
				tier: 1,
				isLockdown: false,
				lockdownWeeksRemaining: 0,
				vigilanceHeat: 0,
				methodOfControl: null,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			});

			const service = new EspionageService(
				espionageRepo,
				factionRepo,
				companionRepo,
				characterRepo,
				worldStateRepo,
			);

			// Sem avanço de tempo: não deve rodar manutenção
			const resNoChange = await service.processWeeklyMaintenanceByTime({
				campaignId: "campaign_1",
				availableGold: 100,
				timestamp: TEST_TIMESTAMP,
			});
			expect(resNoChange.success).toBe(true);
			expect(resNoChange.success && resNoChange.data.maintenanceRun).toBe(false);

			// Avança tempo para o dia 8 (passou 7 dias)
			await worldStateRepo.setFlag({
				key: "location:current_time",
				valueJson: JSON.stringify({ day: 8, turn: 1, phase: "manha" }),
				updatedAt: TEST_TIMESTAMP,
			});

			const resMaintenance = await service.processWeeklyMaintenanceByTime({
				campaignId: "campaign_1",
				availableGold: 100,
				timestamp: TEST_TIMESTAMP,
			});

			expect(resMaintenance.success).toBe(true);
			if (resMaintenance.success) {
				expect(resMaintenance.data.maintenanceRun).toBe(true);
				expect(resMaintenance.data.goldSpent).toBe(10); // cobrou 10 PO da célula Tier 1
			}

			// A flag last_recess_day deve ter sido atualizada para 8
			const flag = await worldStateRepo.getFlag("location:espionage_last_recess_day");
			expect(flag.success && JSON.parse(flag.data.valueJson)).toBe(8);
		});

		it("dissipa o tenente na falha crítica sem suborno preventivo em missão autônoma", async () => {
			const espionageRepo = new InMemoryEspionageRepository();
			const factionRepo = new FakeFactionRepository() as unknown as FactionRepository;
			const companionRepo = new FakeCompanionRepository();
			const characterRepo = new FakeCharacterRepository() as unknown as CharacterRepository;

			companionRepo.setCompanion({
				id: "tenente_1",
				characterId: "hero_1",
				name: "Bob",
				type: "scout",
				subModel: "Furtivo",
				tier: 2,
				hpCurrent: 15,
				hpMax: 15,
				isShareSensory: false,
				isDissipated: false,
				selectedTraitsJson: "[]",
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			});

			await espionageRepo.save({
				id: "cell_1",
				campaignId: "campaign_1",
				factionId: "faction_1",
				regionId: "region_1",
				tenenteCompanionId: "tenente_1",
				specializedAxis: "physical",
				tier: 2,
				isLockdown: false,
				lockdownWeeksRemaining: 0,
				vigilanceHeat: 0,
				methodOfControl: null,
				createdAt: TEST_TIMESTAMP,
				updatedAt: TEST_TIMESTAMP,
			});

			const service = new EspionageService(
				espionageRepo,
				factionRepo,
				companionRepo as unknown as CompanionRepository,
				characterRepo,
			);

			// Falha Crítica (roll = 1)
			const res = await service.runAutonomousOperation({
				cellId: "cell_1",
				targetDc: 15,
				roll: 1,
				timestamp: TEST_TIMESTAMP,
				goldenRuleResolution: "heat",
			});

			expect(res.success).toBe(true);
			if (res.success) {
				expect(res.data.status).toBe("critical_failure");
				expect(res.data.cellDestroyed).toBe(true);
			}

			// Tenente deve estar dissipado no repositório
			const compRes = await companionRepo.getCompanion("tenente_1");
			expect(compRes.success && compRes.data?.isDissipated).toBe(true);
			expect(compRes.success && compRes.data?.hpCurrent).toBe(0);
		});
	});
});
/* biome-ignore-end */
