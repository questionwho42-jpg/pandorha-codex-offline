import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CharacterRecord } from "../../character/model/characterSchema";
import { CompanionService } from "../domain/CompanionService";
import { InMemoryCompanionRepository } from "../infrastructure/InMemoryCompanionRepository";

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

const TEST_TIMESTAMP = "2026-05-23T14:30:00.000Z";

describe("CompanionService", () => {
	it("invoca um novo familiar calculando o HP máximo a partir da Matriz Mental do mestre", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		// Cria mestre Tecelão de Nível 3 (Tier 1) com Mental = 3
		const master: CharacterRecord = {
			id: "master_val",
			name: "Val",
			concept: "Conjuradora Arcana",
			ancestryId: "elf",
			classId: "weaver",
			backgroundId: "sage",
			level: 3,
			physical: 2,
			mental: 3, // Matriz Mental
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
			"Faísca",
			"familiar",
			"Esquilo Alado",
			1, // Tier 1
			TEST_TIMESTAMP,
		);

		expect(res.success).toBe(true);
		if (res.success) {
			const companion = res.data;
			expect(companion.name).toBe("Faísca");
			expect(companion.type).toBe("familiar");
			expect(companion.tier).toBe(1);
			// HP Max = (Mental 3 * 5) * Tier 1 = 15
			expect(companion.hpMax).toBe(15);
			expect(companion.hpCurrent).toBe(15);
			expect(companion.isDissipated).toBe(false);
		}
	});

	it("permite ativar a partilha de sentidos no familiar", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faísca",
			type: "familiar" as const,
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

		const companionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faísca",
			type: "familiar" as const,
			subModel: "Esquilo Alado",
			tier: 1,
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: true, // Partilha de sentidos ATIVA
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		// Aplica 6 de dano no familiar. 50% de 6 = 3 de dano mental no mestre.
		const res = await service.applyDamageToCompanion(
			"comp_1",
			6,
			TEST_TIMESTAMP,
		);
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.data.hpCurrent).toBe(9); // 15 - 6 = 9
		}

		// Verifica se o mestre perdeu 3 de mental (Matriz Mental temporária/recuperável sofre debuff ou simula redução no mental)
		// Espera! O dano mental do mestre é aplicado de qual forma?
		// A regra de RPG de transe diz: "50% do dano sofrido em transe como dano mental no mestre".
		// No stub de personagem, podemos verificar se o personagem sofreu uma redução ou se registramos o dano mental nele.
		// Vamos ver: no teste, podemos verificar se o mental do mestre ou sua saúde sofreu redução?
		// Se aplicamos redução no atributo mental do mestre!
		const updatedMaster = await charRepo.findById("master_val");
		expect(updatedMaster.success).toBe(true);
		if (updatedMaster.success) {
			// Atributo mental caiu de 3 para 1? (ou seja, sofreu 2 de dano mental? 3 - 2 = 1? Espera, o dano mental foi de 3. Se reduzir mental abaixo de 0, fica 0)
			// Sim, o dano mental reduz a aptidão Mental do mestre em 50% do dano do familiar.
			// Como o dano foi 6, 50% é 3. O Mental cai em 3 pontos. 3 - 3 = 0.
			expect(updatedMaster.data.mental).toBe(0);
		}
	});

	it("dissipa o familiar se o HP dele chegar a 0", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faísca",
			type: "familiar" as const,
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

		const companionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faísca",
			type: "familiar" as const,
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
			expect(res.data).toBe(true); // Estabilizou com sucesso
		}

		// Familiar deve ter sido dissipado como sacrifício
		const compResult = await repository.getCompanion("comp_1");
		expect(compResult.success).toBe(true);
		if (compResult.success && compResult.data) {
			expect(compResult.data.isDissipated).toBe(true);
		}
	});

	it("valida limite de traços/truques selecionados com base no Tier", async () => {
		const repository = new InMemoryCompanionRepository();
		const charRepo = new StubCharacterRepository();
		const service = new CompanionService(repository, charRepo);

		const companionRecord = {
			id: "comp_1",
			characterId: "master_val",
			name: "Faísca",
			type: "familiar" as const,
			subModel: "Esquilo Alado",
			tier: 1, // Tier 1 permite 2 truques/traços (Tier + 1)
			hpCurrent: 15,
			hpMax: 15,
			isShareSensory: false,
			isDissipated: false,
			selectedTraitsJson: "[]",
			createdAt: TEST_TIMESTAMP,
			updatedAt: TEST_TIMESTAMP,
		};
		await repository.saveCompanion(companionRecord);

		// Selecionar 2 traços -> Sucesso
		const okTraits = await service.updateSelectedTraits(
			"comp_1",
			["truque_1", "truque_2"],
			TEST_TIMESTAMP,
		);
		expect(okTraits.success).toBe(true);

		// Selecionar 3 traços -> Falha (Excede limite de 2)
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
});
