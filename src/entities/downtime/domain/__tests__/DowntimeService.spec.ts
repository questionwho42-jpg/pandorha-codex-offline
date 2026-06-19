import { describe, expect, it } from "vitest";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	IDowntimeActor,
	IDowntimeContext,
	IDowntimeDice,
	IDowntimeEquipment,
	IDowntimeFaction,
	IDowntimeQuest,
} from "../../model/downtimeTypes";
import { DowntimeService } from "../DowntimeService";

class FakeDowntimeActor implements IDowntimeActor {
	constructor(
		public id: string,
		public gold: number,
		public level: number,
		public stats: Record<string, number>,
		public hasIllness: boolean,
		public talents: string[],
	) {}

	getId(): string {
		return this.id;
	}

	getGold(): number {
		return this.gold;
	}

	async modifyGold(amount: number): Promise<Result<void, string>> {
		this.gold = Math.max(0, this.gold + amount);
		return ok(undefined);
	}

	getLevel(): number {
		return this.level;
	}

	getStat(statName: string): number {
		return this.stats[statName] ?? 0;
	}

	hasIllnessOrNecroticLoss(): boolean {
		return this.hasIllness;
	}

	async clearIllnessesAndNecroticLosses(): Promise<Result<void, string>> {
		this.hasIllness = false;
		return ok(undefined);
	}

	hasTalent(talentId: string): boolean {
		return this.talents.includes(talentId);
	}

	async retrainTalent(
		oldTalentId: string,
		newTalentId: string,
	): Promise<Result<void, string>> {
		const idx = this.talents.indexOf(oldTalentId);
		if (idx !== -1) {
			this.talents[idx] = newTalentId;
		} else {
			this.talents.push(newTalentId);
		}
		return ok(undefined);
	}
}

class FakeDowntimeFaction implements IDowntimeFaction {
	public infamy: Record<string, number> = {};
	public standing: Record<string, number> = {};
	public sealedPacts: string[] = [];

	getInfamy(regionId: string): number {
		return this.infamy[regionId] ?? 0;
	}

	async modifyInfamy(
		regionId: string,
		amount: number,
	): Promise<Result<void, string>> {
		this.infamy[regionId] = Math.max(0, (this.infamy[regionId] ?? 0) + amount);
		return ok(undefined);
	}

	getStanding(factionId: string): number {
		return this.standing[factionId] ?? 0;
	}

	async modifyStanding(
		factionId: string,
		amount: number,
	): Promise<Result<void, string>> {
		this.standing[factionId] = (this.standing[factionId] ?? 0) + amount;
		return ok(undefined);
	}

	async sealPact(
		factionId: string,
		artifactSpent: boolean,
	): Promise<Result<void, string>> {
		this.sealedPacts.push(factionId);
		return ok(undefined);
	}
}

class FakeDowntimeEquipment implements IDowntimeEquipment {
	public durabilities: Record<string, number> = {};

	getWeaponDurability(characterId: string): number {
		return this.durabilities[characterId] ?? 10;
	}

	async repairAllEquipment(characterId: string): Promise<Result<void, string>> {
		this.durabilities[characterId] = 10;
		return ok(undefined);
	}
}

class FakeDowntimeQuest implements IDowntimeQuest {
	public revealed: Record<string, string> = {};

	async revealWeaknessOrImmunity(
		bossId: string,
		details: string,
	): Promise<Result<void, string>> {
		this.revealed[bossId] = details;
		return ok(undefined);
	}
}

class FakeDowntimeDice implements IDowntimeDice {
	public nextRoll = 10;

	rollD20(): number {
		return this.nextRoll;
	}

	rollWithAdvantage(): number {
		return this.nextRoll;
	}

	rollWithDisadvantage(): number {
		return this.nextRoll;
	}
}

class FakeDowntimeContext implements IDowntimeContext {
	public actors = new Map<string, FakeDowntimeActor>();
	public factions = new Map<string, FakeDowntimeFaction>();
	public equipment = new FakeDowntimeEquipment();
	public quest = new FakeDowntimeQuest();
	public dice = new FakeDowntimeDice();

	async getActor(characterId: string): Promise<Result<IDowntimeActor, string>> {
		const act = this.actors.get(characterId);
		if (!act) return fail("Actor not found");
		return ok(act);
	}

	async getFaction(
		factionId: string,
	): Promise<Result<IDowntimeFaction, string>> {
		let fac = this.factions.get(factionId);
		if (!fac) {
			fac = new FakeDowntimeFaction();
			this.factions.set(factionId, fac);
		}
		return ok(fac);
	}

	async getEquipment(
		characterId: string,
	): Promise<Result<IDowntimeEquipment, string>> {
		return ok(this.equipment);
	}

	getQuest(): IDowntimeQuest {
		return this.quest;
	}

	getDice(): IDowntimeDice {
		return this.dice;
	}
}

function expectSuccess<T, E>(result: Result<T, E>): T {
	expect(result.success).toBe(true);
	if (result.success) {
		return result.data;
	}
	expect.fail("Expected success");
}

function expectFailure<T, E>(result: Result<T, E>): E {
	expect(result.success).toBe(false);
	if (!result.success) {
		return result.error;
	}
	expect.fail("Expected failure");
}

describe("DowntimeService - TDD Engine", () => {
	it("Tag A: Busca Legal de Ouro - deve ter sucesso no Sustento DC 10", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			50,
			3,
			{ physical: 2 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 10; // d20 Roll

		const service = new DowntimeService(context);
		const res = await service.resolveTagA({
			characterId: actor.id,
			tier: "sustento",
			statName: "physical",
		});

		const log = expectSuccess(res);
		expect(log.rollResult).toBe(12); // d20(10) + mod(2)
		expect(log.outcomeDetails).toContain("Sustentou-se com sucesso");
		expect(actor.getGold()).toBe(50); // Sustento não gera ouro líquido direto, apenas garante o custo regional.
	});

	it("Tag A: Busca Legal de Ouro - deve ganhar 15 PO no Militar DC 15", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			50,
			3,
			{ physical: 2 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 13; // 13 + 2 = 15

		const service = new DowntimeService(context);
		const res = await service.resolveTagA({
			characterId: actor.id,
			tier: "militar",
			statName: "physical",
		});

		const log = expectSuccess(res);
		expect(log.rollResult).toBe(15);
		expect(actor.getGold()).toBe(65); // 50 + 15
	});

	it("Tag A: Busca Legal de Ouro - deve ganhar crítico no Militar DC 15 (>= 25)", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			50,
			3,
			{ physical: 5 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 20; // d20 natural 20. total = 25.

		const service = new DowntimeService(context);
		const res = await service.resolveTagA({
			characterId: actor.id,
			tier: "militar",
			statName: "physical",
		});

		const log = expectSuccess(res);
		expect(log.rollResult).toBe(25);
		expect(log.outcomeDetails).toContain("Crítico");
		expect(actor.getGold()).toBe(80); // 50 + 30
		// Adicionalmente podemos verificar se foi retornado um favor
	});

	it("Tag A: Busca Legal de Ouro - deve sofrer multa de 5 PO na falha militar DC 15", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			50,
			3,
			{ physical: 1 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 10; // total 11 < 15

		const service = new DowntimeService(context);
		const res = await service.resolveTagA({
			characterId: actor.id,
			tier: "militar",
			statName: "physical",
		});

		const log = expectSuccess(res);
		expect(log.rollResult).toBe(11);
		expect(log.outcomeDetails).toContain("Falha");
		expect(actor.getGold()).toBe(45); // 50 - 5
	});

	it("Tag A: Busca Legal de Ouro - deve ganhar 50 PO no Lorde DC 20", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			100,
			3,
			{ social: 3 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 17; // total = 20

		const service = new DowntimeService(context);
		const res = await service.resolveTagA({
			characterId: actor.id,
			tier: "lorde",
			statName: "social",
		});

		const log = expectSuccess(res);
		expect(log.rollResult).toBe(20);
		expect(actor.getGold()).toBe(150); // 100 + 50
	});

	it("Tag A: Busca Legal de Ouro - deve perder Fama (-10 XP) na falha do Lorde DC 20", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			100,
			3,
			{ social: 2 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		const faction = expectSuccess(await context.getFaction("region_1"));
		await faction.modifyStanding("region_1", 50); // Standing inicial
		context.dice.nextRoll = 5; // total = 7 < 20. Falha crítica (<= DC - 10)

		const service = new DowntimeService(context);
		const res = await service.resolveTagA({
			characterId: actor.id,
			tier: "lorde",
			statName: "social",
			regionId: "region_1",
		});

		const log = expectSuccess(res);
		expect(log.rollResult).toBe(7);
		expect(log.outcomeDetails).toContain("Falha Crítica");
		expect(faction.getStanding("region_1")).toBe(40); // 50 - 10
	});

	it("Tag B: Recuperação Prolongada Intensiva - deve curar se possuir 100 PO", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor("actor-1", 150, 3, {}, true, []);
		context.actors.set(actor.id, actor);

		const service = new DowntimeService(context);
		const res = await service.resolveTagB(actor.id);

		const log = expectSuccess(res);
		expect(actor.getGold()).toBe(50); // 150 - 100
		expect(actor.hasIllnessOrNecroticLoss()).toBe(false);
		expect(log.outcomeDetails).toContain("Cura concluída");
	});

	it("Tag B: Recuperação Prolongada Intensiva - deve falhar se não possuir 100 PO", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor("actor-1", 30, 3, {}, true, []);
		context.actors.set(actor.id, actor);

		const service = new DowntimeService(context);
		const res = await service.resolveTagB(actor.id);

		const err = expectFailure(res);
		expect(err).toContain("Ouro insuficiente");
	});

	it("Tag C: Investigação Arcana/Urbana - deve revelar fraqueza com sucesso vs DC 20", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			100,
			3,
			{ mental: 3, interaction: 2 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 15; // 15 + 5 = 20

		const service = new DowntimeService(context);
		const res = await service.resolveTagC({
			characterId: actor.id,
			bossId: "lich-1",
			dc: 20,
			subornoPO: 20,
		});

		const log = expectSuccess(res);
		expect(log.rollResult).toBe(20);
		expect(actor.getGold()).toBe(80); // 100 - 20 de suborno
		expect(context.quest.revealed["lich-1"]).toContain("fraqueza");
	});

	it("Tag D: Compra e Venda Especulativa - deve conceder 20% de lucro/desconto vs DC 20", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			100,
			3,
			{ social: 3 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 18; // 18 + 3 = 21 >= 20

		const service = new DowntimeService(context);
		const res = await service.resolveTagD(actor.id, "social");

		const log = expectSuccess(res);
		expect(log.outcomeDetails).toContain("20% de benefício");
	});

	it("Tag D: Compra e Venda Especulativa - falha crítica deve cobrar 20 PO", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			100,
			3,
			{ social: 1 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 5; // 5 + 1 = 6 <= 10 (Falha Crítica)

		const service = new DowntimeService(context);
		const res = await service.resolveTagD(actor.id, "social");

		const log = expectSuccess(res);
		expect(log.outcomeDetails).toContain("Falha Crítica");
		expect(actor.getGold()).toBe(80); // Multa de 20 PO
	});

	it("Tag E: Boemia e Lavagem de Infâmia - deve reduzir infâmia proporcional ao ouro gasto", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			100,
			3,
			{ social: 3 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		const faction = expectSuccess(await context.getFaction("region_1"));
		await faction.modifyInfamy("region_1", 10);
		context.dice.nextRoll = 15; // Sucesso

		const service = new DowntimeService(context);
		const res = await service.resolveTagE({
			characterId: actor.id,
			regionId: "region_1",
			goldSpent: 30, // 30 PO livres
			statName: "social",
			dc: 15,
		});

		const log = expectSuccess(res);
		expect(actor.getGold()).toBe(70);
		expect(faction.getInfamy("region_1")).toBe(7); // Reduziu 3 (30 PO / 10)
	});

	it("Tag F: Re-Treinamento - deve substituir talento com sucesso", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor("actor-1", 100, 3, {}, false, [
			"talent-old",
		]);
		context.actors.set(actor.id, actor);

		const service = new DowntimeService(context);
		const res = await service.resolveTagF({
			characterId: actor.id,
			oldTalentId: "talent-old",
			newTalentId: "talent-new",
		});

		const log = expectSuccess(res);
		expect(actor.hasTalent("talent-old")).toBe(false);
		expect(actor.hasTalent("talent-new")).toBe(true);
	});

	it("Tag G: Gestão de Domínio - deve coletar impostos e rodar estabilidade", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			100,
			3,
			{ mental: 2 },
			false,
			[],
		);
		context.actors.set(actor.id, actor);
		context.dice.nextRoll = 12; // d20

		const service = new DowntimeService(context);
		const res = await service.resolveTagG({
			characterId: actor.id,
			actionType: "coleta_impostos",
			statName: "mental",
		});

		const log = expectSuccess(res);
		expect(log.outcomeDetails).toContain("Renda de Imposto coletada");
	});

	it("Tag H: Juramento de Sangue - deve selar pacto de facção se cumprir ouro e DC", async () => {
		const context = new FakeDowntimeContext();
		const actor = new FakeDowntimeActor(
			"actor-1",
			2000,
			3,
			{ social: 3 },
			false,
			[],
		); // Tier 3
		context.actors.set(actor.id, actor);
		const faction = expectSuccess(await context.getFaction("faction_1"));
		context.dice.nextRoll = 15; // 15 + 3 = 18 >= 15

		const service = new DowntimeService(context);
		const res = await service.resolveTagH({
			characterId: actor.id,
			factionId: "faction_1",
			statName: "social",
			dc: 15,
		});

		const log = expectSuccess(res);
		expect(actor.getGold()).toBe(500); // 2000 - (500 * 3) = 500 PO spent
		expect((faction as FakeDowntimeFaction).sealedPacts).toContain("faction_1");
		expect(faction.getStanding("faction_1")).toBeGreaterThan(0);
	});

	describe("DowntimeService - Additional Branch Coverage", () => {
		it("resolveTagA - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagA({
				characterId: "non-existent",
				tier: "sustento",
				statName: "physical",
			});
			const err = expectFailure(res);
			expect(err).toBe("Actor not found");
		});

		it("resolveTagA - Lorde falha normal", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				100,
				3,
				{ social: 2 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 11; // total = 13 (vs 20 DC, 13 > 10 DC - 10) => normal falha
			const service = new DowntimeService(context);
			const res = await service.resolveTagA({
				characterId: actor.id,
				tier: "lorde",
				statName: "social",
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain("Rejeitado nos círculos");
		});

		it("resolveTagA - Lorde falha critica com getFaction falhando", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				100,
				3,
				{ social: 1 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 1; // falha critica natural

			// Força falha no getFaction
			context.getFaction = async () => fail("Faction error");

			const service = new DowntimeService(context);
			const res = await service.resolveTagA({
				characterId: actor.id,
				tier: "lorde",
				statName: "social",
				regionId: "invalid-region",
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain("Falha Crítica");
		});

		it("resolveTagB - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagB("non-existent");
			expectFailure(res);
		});

		it("resolveTagC - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagC({
				characterId: "non-existent",
				bossId: "boss",
				dc: 15,
				subornoPO: 10,
			});
			expectFailure(res);
		});

		it("resolveTagC - falha quando ouro insuficiente para suborno", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor("actor-1", 5, 3, {}, false, []);
			context.actors.set(actor.id, actor);
			const service = new DowntimeService(context);
			const res = await service.resolveTagC({
				characterId: actor.id,
				bossId: "boss",
				dc: 15,
				subornoPO: 10,
			});
			const err = expectFailure(res);
			expect(err).toContain("insuficiente");
		});

		it("resolveTagC - falha na rolagem vs DC", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				20,
				3,
				{ mental: 1, interaction: 1 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 5; // total = 7 < 15
			const service = new DowntimeService(context);
			const res = await service.resolveTagC({
				characterId: actor.id,
				bossId: "boss",
				dc: 15,
				subornoPO: 10,
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain(
				"Falha: Trilha de investigação falsa",
			);
		});

		it("resolveTagD - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagD("non-existent", "social");
			expectFailure(res);
		});

		it("resolveTagD - falha normal na especulacao", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				100,
				3,
				{ social: 1 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 12; // total = 13 (normal falha)
			const service = new DowntimeService(context);
			const res = await service.resolveTagD(actor.id, "social");
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain("Sem oportunidades mercantilistas");
		});

		it("resolveTagE - falha quando goldSpent fora do limite", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res1 = await service.resolveTagE({
				characterId: "any",
				regionId: "any",
				goldSpent: 10, // < 15
				statName: "social",
				dc: 15,
			});
			expectFailure(res1);

			const res2 = await service.resolveTagE({
				characterId: "any",
				regionId: "any",
				goldSpent: 60, // > 50
				statName: "social",
				dc: 15,
			});
			expectFailure(res2);
		});

		it("resolveTagE - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagE({
				characterId: "non-existent",
				regionId: "any",
				goldSpent: 20,
				statName: "social",
				dc: 15,
			});
			expectFailure(res);
		});

		it("resolveTagE - falha com actor sem ouro suficiente", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor("actor-1", 10, 3, {}, false, []);
			context.actors.set(actor.id, actor);
			const service = new DowntimeService(context);
			const res = await service.resolveTagE({
				characterId: actor.id,
				regionId: "any",
				goldSpent: 20,
				statName: "social",
				dc: 15,
			});
			expectFailure(res);
		});

		it("resolveTagE - falha quando a faccao nao existe", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor("actor-1", 100, 3, {}, false, []);
			context.actors.set(actor.id, actor);
			context.getFaction = async () => fail("Faction not found");

			const service = new DowntimeService(context);
			const res = await service.resolveTagE({
				characterId: actor.id,
				regionId: "any",
				goldSpent: 20,
				statName: "social",
				dc: 15,
			});
			expectFailure(res);
		});

		it("resolveTagE - falha normal na boemia", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				100,
				3,
				{ social: 1 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 5; // total = 6 < 15
			const service = new DowntimeService(context);
			const res = await service.resolveTagE({
				characterId: actor.id,
				regionId: "region_1",
				goldSpent: 20,
				statName: "social",
				dc: 15,
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain("Falha: Boemia sem impacto");
		});

		it("resolveTagF - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagF({
				characterId: "non-existent",
				oldTalentId: "a",
				newTalentId: "b",
			});
			expectFailure(res);
		});

		it("resolveTagF - falha quando o actor nao possui o talento antigo", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor("actor-1", 100, 3, {}, false, [
				"other-talent",
			]);
			context.actors.set(actor.id, actor);
			const service = new DowntimeService(context);
			const res = await service.resolveTagF({
				characterId: actor.id,
				oldTalentId: "talent-old",
				newTalentId: "talent-new",
			});
			expectFailure(res);
		});

		it("resolveTagF - falha quando o retreinamento em si falha", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor("actor-1", 100, 3, {}, false, [
				"talent-old",
			]);
			actor.retrainTalent = async () => fail("respec failed");
			context.actors.set(actor.id, actor);
			const service = new DowntimeService(context);
			const res = await service.resolveTagF({
				characterId: actor.id,
				oldTalentId: "talent-old",
				newTalentId: "talent-new",
			});
			expectFailure(res);
		});

		it("resolveTagG - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagG({
				characterId: "non-existent",
				actionType: "coleta_impostos",
				statName: "mental",
			});
			expectFailure(res);
		});

		it("resolveTagG - falha na coleta de impostos", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				100,
				3,
				{ mental: 1 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 5; // total = 6 < 10
			const service = new DowntimeService(context);
			const res = await service.resolveTagG({
				characterId: actor.id,
				actionType: "coleta_impostos",
				statName: "mental",
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain("Falha: Instabilidade gerada");
		});

		it("resolveTagH - falha quando o actor nao existe", async () => {
			const context = new FakeDowntimeContext();
			const service = new DowntimeService(context);
			const res = await service.resolveTagH({
				characterId: "non-existent",
				factionId: "fac",
				statName: "social",
				dc: 15,
			});
			expectFailure(res);
		});

		it("resolveTagH - falha com ouro insuficiente", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor("actor-1", 100, 3, {}, false, []); // Cost = 1500
			context.actors.set(actor.id, actor);
			const service = new DowntimeService(context);
			const res = await service.resolveTagH({
				characterId: actor.id,
				factionId: "fac",
				statName: "social",
				dc: 15,
			});
			expectFailure(res);
		});

		it("resolveTagH - falha com getFaction falhando", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor("actor-1", 2000, 3, {}, false, []);
			context.actors.set(actor.id, actor);
			context.getFaction = async () => fail("Faction error");
			const service = new DowntimeService(context);
			const res = await service.resolveTagH({
				characterId: actor.id,
				factionId: "fac",
				statName: "social",
				dc: 15,
			});
			expectFailure(res);
		});

		it("resolveTagH - falha normal na rolagem de pacto vs DC", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				2000,
				3,
				{ social: 1 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 5; // total = 6 < 15
			const service = new DowntimeService(context);
			const res = await service.resolveTagH({
				characterId: actor.id,
				factionId: "faction_1",
				statName: "social",
				dc: 15,
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain(
				"Falha: Emissário da facção recusou",
			);
		});

		it("resolveTagA - falha no Sustento DC 10", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				50,
				3,
				{ physical: 0 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			context.dice.nextRoll = 5; // total = 5 < 10
			const service = new DowntimeService(context);
			const res = await service.resolveTagA({
				characterId: actor.id,
				tier: "sustento",
				statName: "physical",
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain("Falha: Expulso do trabalho");
		});

		it("resolveTagG - subir_nivel com sucesso", async () => {
			const context = new FakeDowntimeContext();
			const actor = new FakeDowntimeActor(
				"actor-1",
				100,
				3,
				{ mental: 2 },
				false,
				[],
			);
			context.actors.set(actor.id, actor);
			const service = new DowntimeService(context);
			const res = await service.resolveTagG({
				characterId: actor.id,
				actionType: "subir_nivel",
				statName: "mental",
			});
			const log = expectSuccess(res);
			expect(log.outcomeDetails).toContain(
				"Ação de Domínio (subir_nivel) resolvida",
			);
		});
	});
});
