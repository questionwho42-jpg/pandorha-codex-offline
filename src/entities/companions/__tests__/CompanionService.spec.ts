import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRecord } from "../../character/model/characterSchema";
import {
	BaseCompanionStats,
	CompanionService,
	CompanionStatsDecorator,
	SensorySharingStatsDecorator,
} from "../domain/CompanionService";
import { InMemoryCompanionRepository } from "../infrastructure/InMemoryCompanionRepository";
import type { CompanionRecord } from "../model/companionSchema";

// Stub do repositório de personagem para os testes unitários
class StubCharacterRepository {
	private characters = new Map<string, CharacterRecord>();

	public setCharacter(char: CharacterRecord) {
		this.characters.set(char.id, char);
	}

	public async findById(
		id: string,
	): Promise<Result<CharacterRecord, { code: string; message: string }>> {
		const char = this.characters.get(id);
		if (!char) {
			return fail({
				code: "CHARACTER_NOT_FOUND",
				message: "Mestre não encontrado",
			});
		}
		return ok(char);
	}

	public async save(
		char: CharacterRecord,
	): Promise<Result<CharacterRecord, { code: string; message: string }>> {
		this.characters.set(char.id, char);
		return ok(char);
	}
}

// Decorador concreto de testes para exercitar a classe abstrata CompanionStatsDecorator
class TestStatsDecorator extends CompanionStatsDecorator {
	// Apenas herda e passa chamadas adiante
}

const TEST_TIMESTAMP = "2026-05-23T14:30:00.000Z";

describe("CompanionService", () => {
	it("invoca um novo familiar calculando o HP maximo a partir da Matriz Mental do mestre", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const master: CharacterRecord = {
			id: "master_val",
			name: "Val",
			concept: "Conjuradora Arcana",
			ancestryId: "elf",
			classId: "weaver",
			backgroundId: "sage",
			level: 3,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 2,
			mental: 3,
			social: 2,
			conflict: 1,
			interaction: 2,
			resistance: 2,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		charRepo.setCharacter(master);

		const res = await service.summonCompanion(
			"master_val",
			"Faisca",
			"familiar",
			"Esquilo Alado",
			1,
			TEST_TIMESTAMP,
		);

		expect(res.success).toBe(true);
		if (res.success) {
			const companion = res.data;
			expect(companion.name).toBe("Faisca");
			expect(companion.type).toBe("familiar");
			expect(companion.tier).toBe(1);
			expect(companion.hpMax).toBe(15);
			expect(companion.hpCurrent).toBe(15);
			expect(companion.isDissipated).toBe(false);
		}
	});

	it("deve retornar erro se tentar summonar para mestre inexistente", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const res = await service.summonCompanion(
			"mestre_inexistente",
			"Faisca",
			"familiar",
			"Esquilo Alado",
			1,
			TEST_TIMESTAMP,
		);

		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.error.code).toBe("CHARACTER_NOT_FOUND");
		}
	});

	it("permite ativar a partilha de sentidos no familiar", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord: CompanionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faisca",
			type: "familiar",
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		const res = await service.shareSensory("comp_1", true, TEST_TIMESTAMP);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.isShareSensory).toBe(true);
		}
	});

	it("deve falhar shareSensory se o companheiro nao existir ou se o repositorio falhar", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const res1 = await service.shareSensory(
			"id_inexistente",
			true,
			TEST_TIMESTAMP,
		);
		expect(res1.success).toBe(false);
		if (!res1.success) {
			expect(res1.error.code).toBe("COMPANION_NOT_FOUND");
		}

		// Simula erro de repositorio
		repository.getCompanion = async () =>
			fail({ code: "REPOSITORY_READ_FAILED", message: "Erro" });
		const res2 = await service.shareSensory("comp_1", true, TEST_TIMESTAMP);
		expect(res2.success).toBe(false);
	});

	it("transfere 50% do dano do familiar como dano mental no mestre em transe sensorial", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const master: CharacterRecord = {
			id: "master_val",
			name: "Val",
			concept: "Conjuradora Arcana",
			ancestryId: "elf",
			classId: "weaver",
			backgroundId: "sage",
			level: 3,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 2,
			mental: 3,
			social: 2,
			conflict: 1,
			interaction: 2,
			resistance: 2,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		charRepo.setCharacter(master);

		const companionRecord: CompanionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faisca",
			type: "familiar",
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: true,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		const res = await service.applyDamageToCompanion(
			"comp_1",
			6,
			TEST_TIMESTAMP,
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.hpCurrent).toBe(9);
		}

		const updatedMaster = await charRepo.findById("master_val");
		expect(updatedMaster.success).toBe(true);
		if (updatedMaster.success) {
			expect(updatedMaster.data.mental).toBe(0);
		}
	});

	it("deve lidar com falhas de repositorio e companheiro nao encontrado no applyDamageToCompanion", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const res1 = await service.applyDamageToCompanion(
			"inexistente",
			5,
			TEST_TIMESTAMP,
		);
		expect(res1.success).toBe(false);

		repository.getCompanion = async () =>
			fail({ code: "REPOSITORY_READ_FAILED", message: "Erro" });
		const res2 = await service.applyDamageToCompanion(
			"comp_1",
			5,
			TEST_TIMESTAMP,
		);
		expect(res2.success).toBe(false);
	});

	it("dissipa o familiar se o HP dele chegar a 0", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord: CompanionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faisca",
			type: "familiar",
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 5,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		const res = await service.applyDamageToCompanion(
			"comp_1",
			10,
			TEST_TIMESTAMP,
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.hpCurrent).toBe(0);
			expect(res.data.isDissipated).toBe(true);
		}
	});

	it("sacrifica o familiar para estabilizar o mestre se o mestre cair a 0 PV", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord: CompanionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faisca",
			type: "familiar",
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		const res = await service.stabilizeMaster("master_val", TEST_TIMESTAMP);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data).toBe(true);
		}

		const compResult = await repository.getCompanion("comp_1");
		expect(compResult.success).toBe(true);
		if (compResult.success && compResult.data) {
			expect(compResult.data.isDissipated).toBe(true);
		}
	});

	it("deve falhar stabilizeMaster se o repositorio falhar ou nao houver familiares ativos", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		// Nao ha familiares sumonados
		const res1 = await service.stabilizeMaster("master_val", TEST_TIMESTAMP);
		expect(res1.success).toBe(true);
		if (res1.success) {
			expect(res1.data).toBe(false);
		}

		// Repositorio falha
		repository.findCompanionsByCharacter = async () =>
			fail({ code: "REPOSITORY_READ_FAILED", message: "Erro" });
		const res2 = await service.stabilizeMaster("master_val", TEST_TIMESTAMP);
		expect(res2.success).toBe(false);
	});

	it("valida limite de tracos/truques selecionados com base no Tier", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord: CompanionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faisca",
			type: "familiar",
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		const okTraits = await service.updateSelectedTraits(
			"comp_1",
			["truque_1", "truque_2"],
			TEST_TIMESTAMP,
		);
		expect(okTraits.success).toBe(true);

		const failTraits = await service.updateSelectedTraits(
			"comp_1",
			["truque_1", "truque_2", "truque_3"],
			TEST_TIMESTAMP,
		);
		expect(failTraits.success).toBe(false);
		if (!failTraits.success) {
			expect(failTraits.error.code).toBe("EXCEEDS_TIER_LIMIT");
		}
	});

	it("deve lidar com erros no updateSelectedTraits se companheiro nao existir ou se o repositorio falhar", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const res1 = await service.updateSelectedTraits(
			"inexistente",
			[],
			TEST_TIMESTAMP,
		);
		expect(res1.success).toBe(false);

		repository.getCompanion = async () =>
			fail({ code: "REPOSITORY_READ_FAILED", message: "Erro" });
		const res2 = await service.updateSelectedTraits(
			"comp_1",
			[],
			TEST_TIMESTAMP,
		);
		expect(res2.success).toBe(false);
	});

	it("exercita BaseCompanionStats, SensorySharingStatsDecorator e a classe abstrata CompanionStatsDecorator", () => {
		const record: CompanionRecord = {
			id: "comp_id",
			characterId: "master_id",
			name: "Familiar Concreto",
			type: "familiar",
			subModel: "Sombra",
			tier: 2,
			hpCurrent: 20,
			hpMax: 30,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: `["voo", "furtividade"]`,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};

		const base = new BaseCompanionStats(record, 4); // mestre com Mental 4

		// Valida getters do concrete component
		expect(base.id).toBe("comp_id");
		expect(base.characterId).toBe("master_id");
		expect(base.name).toBe("Familiar Concreto");
		expect(base.type).toBe("familiar");
		expect(base.subModel).toBe("Sombra");
		expect(base.tier).toBe(2);
		expect(base.hpMax).toBe(40); // 4 * 5 * 2 = 40
		expect(base.hpCurrent).toBe(20);
		expect(base.armorClass).toBe(16); // 10 + 4 + 2 = 16
		expect(base.isShareSensory).toBe(false);
		expect(base.isDissipated).toBe(false);
		expect(base.selectedTraits).toEqual(["voo", "furtividade"]);

		// Testa o catch do JSON.parse na classe BaseCompanionStats
		const brokenRecord = { ...record, selectedTraitsJson: "{" }; // json invalido
		const brokenBase = new BaseCompanionStats(brokenRecord, 4);
		expect(brokenBase.selectedTraits).toEqual([]);

		// Valida decorador abstrato
		const abstractDec = new TestStatsDecorator(base);
		expect(abstractDec.id).toBe("comp_id");
		expect(abstractDec.characterId).toBe("master_id");
		expect(abstractDec.name).toBe("Familiar Concreto");
		expect(abstractDec.type).toBe("familiar");
		expect(abstractDec.subModel).toBe("Sombra");
		expect(abstractDec.tier).toBe(2);
		expect(abstractDec.hpMax).toBe(40);
		expect(abstractDec.hpCurrent).toBe(20);
		expect(abstractDec.armorClass).toBe(16);
		expect(abstractDec.isShareSensory).toBe(false);
		expect(abstractDec.isDissipated).toBe(false);
		expect(abstractDec.selectedTraits).toEqual(["voo", "furtividade"]);

		// Valida SensorySharingStatsDecorator
		const shareDec = new SensorySharingStatsDecorator(base);
		expect(shareDec.isShareSensory).toBe(true);
		expect(shareDec.armorClass).toBe(14); // 16 - 2 = 14
	});

	it("calcula corretamente HP e CA para os arquetipos de animal (agressor, protetor, batedor)", () => {
		const master: CharacterRecord = {
			id: "master_val",
			name: "Val",
			concept: "Cacador",
			ancestryId: "human",
			classId: "hunter",
			backgroundId: "outlander",
			level: 3,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 2,
			social: 1,
			conflict: 2,
			interaction: 2,
			resistance: 2,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};

		const recordAgressor: CompanionRecord = {
			id: "aggr_1",
			characterId: "master_val",
			name: "Rex",
			type: "aggressor",
			subModel: "Lobo",
			tier: 1,
			hpCurrent: 21,
			hpMax: 21,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		const statsAgressor = new BaseCompanionStats(recordAgressor, master);
		expect(statsAgressor.hpMax).toBe(21); // (6 * 3) + 3 = 21
		expect(statsAgressor.armorClass).toBe(16); // 12 + 3 + 1 = 16

		const recordProtetor: CompanionRecord = {
			id: "prot_1",
			characterId: "master_val",
			name: "Balu",
			type: "protector",
			subModel: "Urso",
			tier: 1,
			hpCurrent: 33,
			hpMax: 33,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		const statsProtetor = new BaseCompanionStats(recordProtetor, master);
		expect(statsProtetor.hpMax).toBe(33); // (10 * 3) + 3 = 33
		expect(statsProtetor.armorClass).toBe(18); // 14 + 3 + 1 = 18

		const recordBatedor: CompanionRecord = {
			id: "scout_1",
			characterId: "master_val",
			name: "Aero",
			type: "scout",
			subModel: "Falcao",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		const statsBatedor = new BaseCompanionStats(recordBatedor, master);
		expect(statsBatedor.hpMax).toBe(15); // (4 * 3) + 3 = 15
		expect(statsBatedor.armorClass).toBe(17); // 13 + 3 + 1 = 17
	});

	it("summons animal companion archetypes calculating correct HP max", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const master: CharacterRecord = {
			id: "master_val",
			name: "Val",
			concept: "Cacador",
			ancestryId: "human",
			classId: "hunter",
			backgroundId: "sage",
			level: 3,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 3,
			mental: 2,
			social: 1,
			conflict: 1,
			interaction: 2,
			resistance: 2,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		charRepo.setCharacter(master);

		const res1 = await service.summonCompanion(
			"master_val",
			"Rex",
			"aggressor",
			"Lobo",
			1,
			TEST_TIMESTAMP,
		);
		expect(res1.success).toBe(true);
		if (res1.success) {
			expect(res1.data.hpMax).toBe(21); // (6 * 3) + 3 = 21
		}

		const res2 = await service.summonCompanion(
			"master_val",
			"Balu",
			"protector",
			"Urso",
			1,
			TEST_TIMESTAMP,
		);
		expect(res2.success).toBe(true);
		if (res2.success) {
			expect(res2.data.hpMax).toBe(33); // (10 * 3) + 3 = 33
		}

		const res3 = await service.summonCompanion(
			"master_val",
			"Aero",
			"scout",
			"Falcao",
			1,
			TEST_TIMESTAMP,
		);
		expect(res3.success).toBe(true);
		if (res3.success) {
			expect(res3.data.hpMax).toBe(15); // (4 * 3) + 3 = 15
		}
	});

	it("does not apply mental damage when damage is 0 even if sensory sharing is active", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const master: CharacterRecord = {
			id: "master_val",
			name: "Val",
			concept: "Conjuradora Arcana",
			ancestryId: "elf",
			classId: "weaver",
			backgroundId: "sage",
			level: 3,
			experiencePoints: 0,
			tensionMeter: 0,
			physical: 2,
			mental: 3,
			social: 2,
			conflict: 1,
			interaction: 2,
			resistance: 2,
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		charRepo.setCharacter(master);

		const companionRecord: CompanionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faisca",
			type: "familiar",
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: true,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		const res = await service.applyDamageToCompanion(
			"comp_1",
			0,
			TEST_TIMESTAMP,
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.hpCurrent).toBe(15);
		}

		const updatedMaster = await charRepo.findById("master_val");
		expect(updatedMaster.success).toBe(true);
		if (updatedMaster.success) {
			expect(updatedMaster.data.mental).toBe(3);
		}
	});

	it("handles case where master character is not found when applying sensory damage", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord: CompanionRecord = {
			id: "comp_1",
			characterId: "non_existent_master",
			name: "Faisca",
			type: "familiar",
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: true,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		const res = await service.applyDamageToCompanion(
			"comp_1",
			6,
			TEST_TIMESTAMP,
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.hpCurrent).toBe(9);
		}
	});
});
