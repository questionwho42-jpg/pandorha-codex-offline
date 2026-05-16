import { beforeEach, describe, expect, it } from "vitest";
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
import { SocialStandingService } from "../SocialStandingService";

class InMemorySocialRepository implements SocialRepository {
	public factions: FactionRecord[] = [];
	public reputations: ReputationRecord[] = [];
	public debts: BloodDebtRecord[] = [];

	public async saveFaction(
		faction: FactionRecord,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		const idx = this.factions.findIndex((f) => f.id === faction.id);
		if (idx >= 0) {
			this.factions[idx] = faction;
		} else {
			this.factions.push(faction);
		}
		return ok(faction);
	}

	public async findFactionById(
		id: string,
	): Promise<Result<FactionRecord, SocialRepositoryFailure>> {
		const f = this.factions.find((f) => f.id === id);
		if (!f) return fail({ code: "FACTION_NOT_FOUND", message: "Not found" });
		return ok(f);
	}

	public async listFactions(): Promise<
		Result<readonly FactionRecord[], SocialRepositoryFailure>
	> {
		return ok(this.factions);
	}

	public async saveReputation(
		reputation: ReputationRecord,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		const idx = this.reputations.findIndex(
			(r) =>
				r.characterId === reputation.characterId &&
				r.factionId === reputation.factionId,
		);
		if (idx >= 0) {
			this.reputations[idx] = reputation;
		} else {
			this.reputations.push(reputation);
		}
		return ok(reputation);
	}

	public async findReputation(
		characterId: string,
		factionId: string,
	): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
		const r = this.reputations.find(
			(r) => r.characterId === characterId && r.factionId === factionId,
		);
		if (!r) return fail({ code: "REPUTATION_NOT_FOUND", message: "Not found" });
		return ok(r);
	}

	public async listReputationsByCharacter(
		characterId: string,
	): Promise<Result<readonly ReputationRecord[], SocialRepositoryFailure>> {
		return ok(this.reputations.filter((r) => r.characterId === characterId));
	}

	public async saveBloodDebt(
		debt: BloodDebtRecord,
	): Promise<Result<BloodDebtRecord, SocialRepositoryFailure>> {
		const idx = this.debts.findIndex((d) => d.id === debt.id);
		if (idx >= 0) {
			this.debts[idx] = debt;
		} else {
			this.debts.push(debt);
		}
		return ok(debt);
	}

	public async listBloodDebtsByCharacter(
		characterId: string,
	): Promise<Result<readonly BloodDebtRecord[], SocialRepositoryFailure>> {
		return ok(this.debts.filter((d) => d.characterId === characterId));
	}
}

describe("SocialStandingService - Testes Unitários de Regras Sociais", () => {
	let repository: InMemorySocialRepository;
	let service: SocialStandingService;
	const charId = "char-wanderer";

	beforeEach(() => {
		repository = new InMemorySocialRepository();
		service = new SocialStandingService(repository);
	});

	it("deve inicializar facções padrão corretamente", async () => {
		await service.ensureBaseFactions();
		expect(repository.factions.length).toBe(3);
		const firstFaction = repository.factions[0];
		expect(firstFaction?.id).toBe("fac-ether");
	});

	it("deve registrar nova reputação do personagem", async () => {
		const result = await service.updateReputation(charId, "fac-ether", 10);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.value).toBe(10);
			expect(result.data.factionId).toBe("fac-ether");
		}
	});

	it("deve atualizar incrementalmente reputação existente", async () => {
		await service.updateReputation(charId, "fac-ether", 10);
		const result = await service.updateReputation(charId, "fac-ether", 5);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.value).toBe(15);
		}
	});

	it("deve adicionar nova dívida de sangue", async () => {
		const result = await service.addBloodDebt(charId, "Cobrante Sombrio", 50);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.debtValue).toBe(50);
			expect(result.data.targetName).toBe("Cobrante Sombrio");
			expect(result.data.isPaid).toBe(false);
		}
	});

	it("deve obter o standing social completo do personagem", async () => {
		await service.updateReputation(charId, "fac-ether", 10);
		await service.addBloodDebt(charId, "Cobrante Sombrio", 30);

		const standing = await service.getCharacterStanding(charId);
		expect(standing.reputations.length).toBe(1);
		expect(standing.debts.length).toBe(1);
		const firstRep = standing.reputations[0];
		const firstDebt = standing.debts[0];
		expect(firstRep?.value).toBe(10);
		expect(firstDebt?.debtValue).toBe(30);
	});

	describe("Regra de Bloqueio de Descanso (Marcado pela Dívida: divida > fama * 3)", () => {
		it("deve permitir descanso quando o Andarilho não possui dívidas de sangue", async () => {
			await service.updateReputation(charId, "fac-ether", 10);
			const isBlocked = await service.isRestBlocked(charId);
			expect(isBlocked).toBe(false);
		});

		it("deve permitir descanso se o valor das dívidas for menor ou igual a 3 vezes a fama", async () => {
			await service.updateReputation(charId, "fac-ether", 10);
			await service.addBloodDebt(charId, "Cobrante A", 30);
			const isBlocked = await service.isRestBlocked(charId);
			expect(isBlocked).toBe(false);
		});

		it("deve bloquear descanso se o valor total das dívidas de sangue superar 3 vezes a fama total positiva (Marcado pela Dívida)", async () => {
			await service.updateReputation(charId, "fac-ether", 10);
			await service.addBloodDebt(charId, "Cobrante A", 31);
			const isBlocked = await service.isRestBlocked(charId);
			expect(isBlocked).toBe(true);
		});

		it("deve bloquear descanso imediatamente se o Andarilho tiver qualquer dívida ativa e nenhuma fama positiva", async () => {
			await service.addBloodDebt(charId, "Cobrante A", 1);
			const isBlocked = await service.isRestBlocked(charId);
			expect(isBlocked).toBe(true);
		});
	});

	describe("Tratamento de Erros e Falhas de Persistência", () => {
		class FailingSocialRepository extends InMemorySocialRepository {
			public override async findReputation(
				_characterId: string,
				_factionId: string,
			): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
				return fail({
					code: "SOCIAL_REPOSITORY_READ_FAILED",
					message: "Database failure",
				});
			}

			public override async saveReputation(
				_reputation: ReputationRecord,
			): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
				return fail({
					code: "SOCIAL_REPOSITORY_WRITE_FAILED",
					message: "Save failed",
				});
			}

			public override async saveBloodDebt(
				_debt: BloodDebtRecord,
			): Promise<Result<BloodDebtRecord, SocialRepositoryFailure>> {
				return fail({
					code: "SOCIAL_REPOSITORY_WRITE_FAILED",
					message: "Save debt failed",
				});
			}

			public override async listReputationsByCharacter(
				_characterId: string,
			): Promise<Result<readonly ReputationRecord[], SocialRepositoryFailure>> {
				return fail({
					code: "SOCIAL_REPOSITORY_READ_FAILED",
					message: "List failed",
				});
			}

			public override async listBloodDebtsByCharacter(
				_characterId: string,
			): Promise<Result<readonly BloodDebtRecord[], SocialRepositoryFailure>> {
				return fail({
					code: "SOCIAL_REPOSITORY_READ_FAILED",
					message: "List failed",
				});
			}
		}

		it("deve falhar ao atualizar reputação se houver falha de leitura no banco", async () => {
			const failingRepo = new FailingSocialRepository();
			const failingService = new SocialStandingService(failingRepo);
			const res = await failingService.updateReputation(
				charId,
				"fac-ether",
				10,
			);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("PERSISTENCE_ERROR");
			}
		});

		it("deve falhar ao atualizar reputação se falhar ao salvar no banco", async () => {
			class SaveFailingRepository extends InMemorySocialRepository {
				public override async saveReputation(
					_reputation: ReputationRecord,
				): Promise<Result<ReputationRecord, SocialRepositoryFailure>> {
					return fail({
						code: "SOCIAL_REPOSITORY_WRITE_FAILED",
						message: "Save failed",
					});
				}
			}
			const failingRepo = new SaveFailingRepository();
			const failingService = new SocialStandingService(failingRepo);
			const res = await failingService.updateReputation(
				charId,
				"fac-ether",
				10,
			);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("PERSISTENCE_ERROR");
			}
		});

		it("deve falhar ao adicionar divida de sangue se falhar ao salvar no banco", async () => {
			const failingRepo = new FailingSocialRepository();
			const failingService = new SocialStandingService(failingRepo);
			const res = await failingService.addBloodDebt(charId, "Cobrante A", 10);
			expect(res.success).toBe(false);
			if (!res.success) {
				expect(res.error.code).toBe("PERSISTENCE_ERROR");
			}
		});

		it("deve retornar arrays vazios ao obter standing social se as consultas falharem", async () => {
			const failingRepo = new FailingSocialRepository();
			const failingService = new SocialStandingService(failingRepo);
			const standing = await failingService.getCharacterStanding(charId);
			expect(standing.reputations).toEqual([]);
			expect(standing.debts).toEqual([]);
		});
	});
});
