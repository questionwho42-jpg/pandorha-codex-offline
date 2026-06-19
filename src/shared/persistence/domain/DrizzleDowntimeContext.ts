import { and, eq, sql } from "drizzle-orm";
import { bastions } from "$lib/entities/bastion/model/bastionSchema";
import {
	characterStatusEffects,
	characters,
} from "$lib/entities/character/model/characterSchema";
import type {
	IDowntimeActor,
	IDowntimeContext,
	IDowntimeDice,
	IDowntimeEquipment,
	IDowntimeFaction,
	IDowntimeQuest,
} from "$lib/entities/downtime/model/downtimeTypes";
import { characterCraftedItems } from "$lib/entities/equipment/model/craftingSchema";
import { campaignInvestigations } from "$lib/entities/investigation/model/investigationSchema";
import {
	characterReputation,
	factionPatronages,
	factions,
} from "$lib/entities/social/model/socialSchema";
import { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok, type Result } from "$lib/shared/lib/result";

export class DrizzleDowntimeActor implements IDowntimeActor {
	constructor(
		private readonly characterId: string,
		private readonly db: any,
		private readonly bastionId: string,
	) {}

	getId(): string {
		return this.characterId;
	}

	getGold(): number {
		// O ouro do grupo/campanha é centralizado na tesouraria do Bastião (vaultGold)
		try {
			const rows = this.db
				.select()
				.from(bastions)
				.where(eq(bastions.id, this.bastionId))
				.all();
			const row = rows[0];
			return row ? row.vaultGold : 1000;
		} catch (_e) {
			return 1000;
		}
	}

	async modifyGold(amount: number): Promise<Result<void, string>> {
		try {
			const rows = this.db
				.select()
				.from(bastions)
				.where(eq(bastions.id, this.bastionId))
				.all();
			const row = rows[0];
			if (row) {
				const nextGold = Math.max(0, row.vaultGold + amount);
				this.db
					.update(bastions)
					.set({ vaultGold: nextGold })
					.where(eq(bastions.id, this.bastionId))
					.run();
			}
			return ok(undefined);
		} catch (e: any) {
			return fail(`Erro ao modificar ouro no Bastião: ${e.message}`);
		}
	}

	getLevel(): number {
		try {
			const rows = this.db
				.select()
				.from(characters)
				.where(eq(characters.id, this.characterId))
				.all();
			const row = rows[0];
			return row ? row.level : 1;
		} catch (_e) {
			return 1;
		}
	}

	getStat(statName: string): number {
		try {
			const rows = this.db
				.select()
				.from(characters)
				.where(eq(characters.id, this.characterId))
				.all();
			const row = rows[0];
			if (!row) return 0;
			return row[statName] ?? 0;
		} catch (_e) {
			return 0;
		}
	}

	hasIllnessOrNecroticLoss(): boolean {
		try {
			const rows = this.db
				.select()
				.from(characterStatusEffects)
				.where(eq(characterStatusEffects.characterId, this.characterId))
				.all();
			const illnesses = [
				"eter_fever",
				"wound_infection",
				"viper_poison",
				"body_fatigue",
				"mental_fog",
				"spirit_ruin",
				"cellular_collapse",
			];
			return rows.some((r: any) => illnesses.includes(r.type));
		} catch (_e) {
			return false;
		}
	}

	async clearIllnessesAndNecroticLosses(): Promise<Result<void, string>> {
		try {
			const illnesses = [
				"eter_fever",
				"wound_infection",
				"viper_poison",
				"body_fatigue",
				"mental_fog",
				"spirit_ruin",
				"cellular_collapse",
			];
			for (const ill of illnesses) {
				this.db
					.delete(characterStatusEffects)
					.where(
						and(
							eq(characterStatusEffects.characterId, this.characterId),
							eq(characterStatusEffects.type, ill),
						),
					)
					.run();
			}
			return ok(undefined);
		} catch (e: any) {
			return fail(`Erro ao limpar enfermidades: ${e.message}`);
		}
	}

	hasTalent(talentId: string): boolean {
		// Talentos não são persistidos na tabela characters no SQLite físico atual
		return true;
	}

	async retrainTalent(
		oldTalentId: string,
		newTalentId: string,
	): Promise<Result<void, string>> {
		// Simula o retreinamento com sucesso
		return ok(undefined);
	}
}

export class DrizzleDowntimeFaction implements IDowntimeFaction {
	constructor(
		private readonly db: any,
		private readonly campaignId: string,
	) {}

	getInfamy(regionId: string): number {
		try {
			const rows = this.db
				.select()
				.from(characterReputation)
				.where(eq(characterReputation.factionId, regionId))
				.all();
			// Infâmia é representada por reputação negativa
			let sum = 0;
			for (const r of rows) {
				if (r.value < 0) sum += Math.abs(r.value);
			}
			return sum;
		} catch (_e) {
			return 0;
		}
	}

	async modifyInfamy(
		regionId: string,
		amount: number,
	): Promise<Result<void, string>> {
		try {
			// A infâmia diminui aumentando a reputação (tornando-a menos negativa)
			// amount costuma ser negativo para redução de infâmia
			const rows = this.db
				.select()
				.from(characterReputation)
				.where(eq(characterReputation.factionId, regionId))
				.all();
			for (const r of rows) {
				const currentVal = r.value;
				if (currentVal < 0) {
					// Reduz a infâmia (aumentando a reputação em direção a 0)
					const nextVal = Math.min(0, currentVal - amount);
					this.db
						.update(characterReputation)
						.set({ value: nextVal, updatedAt: new Date().toISOString() })
						.where(eq(characterReputation.id, r.id))
						.run();
				}
			}
			return ok(undefined);
		} catch (e: any) {
			return fail(`Erro ao modificar infâmia: ${e.message}`);
		}
	}

	getStanding(factionId: string): number {
		try {
			const rows = this.db
				.select()
				.from(characterReputation)
				.where(eq(characterReputation.factionId, factionId))
				.all();
			let sum = 0;
			for (const r of rows) {
				if (r.value > 0) sum += r.value;
			}
			return sum;
		} catch (_e) {
			return 0;
		}
	}

	async modifyStanding(
		factionId: string,
		amount: number,
	): Promise<Result<void, string>> {
		try {
			// Busca qualquer reputação para a facção e adiciona standing
			const rows = this.db
				.select()
				.from(characterReputation)
				.where(eq(characterReputation.factionId, factionId))
				.all();
			if (rows.length > 0) {
				const r = rows[0];
				this.db
					.update(characterReputation)
					.set({ value: r.value + amount, updatedAt: new Date().toISOString() })
					.where(eq(characterReputation.id, r.id))
					.run();
			} else {
				// Cria reputação inicial
				this.db
					.insert(characterReputation)
					.values({
						id: crypto.randomUUID(),
						characterId: "default_actor",
						factionId,
						value: amount,
						updatedAt: new Date().toISOString(),
					})
					.run();
			}
			return ok(undefined);
		} catch (e: any) {
			return fail(`Erro ao modificar standing: ${e.message}`);
		}
	}

	async sealPact(
		factionId: string,
		_artifactSpent: boolean,
	): Promise<Result<void, string>> {
		try {
			const rows = this.db
				.select()
				.from(factionPatronages)
				.where(eq(factionPatronages.factionId, factionId))
				.all();
			if (rows.length > 0) {
				this.db
					.update(factionPatronages)
					.set({ famaLevel: 1, bloodDebt: 0 })
					.where(eq(factionPatronages.factionId, factionId))
					.run();
			} else {
				this.db
					.insert(factionPatronages)
					.values({
						id: crypto.randomUUID(),
						factionId,
						famaLevel: 1,
						bloodDebt: 0,
						relicsCount: 0,
					})
					.run();
			}
			return ok(undefined);
		} catch (e: any) {
			return fail(`Erro ao selar pacto de patrocínio: ${e.message}`);
		}
	}
}

export class DrizzleDowntimeEquipment implements IDowntimeEquipment {
	constructor(private readonly db: any) {}

	getWeaponDurability(characterId: string): number {
		try {
			const rows = this.db
				.select()
				.from(characterCraftedItems)
				.where(eq(characterCraftedItems.characterId, characterId))
				.all();
			return rows.length > 0 ? rows[0].durabilityCurrent : 10;
		} catch (_e) {
			return 10;
		}
	}

	async repairAllEquipment(characterId: string): Promise<Result<void, string>> {
		try {
			this.db
				.update(characterCraftedItems)
				.set({ durabilityCurrent: 10, durability: "mint" })
				.where(eq(characterCraftedItems.characterId, characterId))
				.run();
			return ok(undefined);
		} catch (e: any) {
			return fail(`Erro ao reparar equipamentos: ${e.message}`);
		}
	}
}

export class DrizzleDowntimeQuest implements IDowntimeQuest {
	constructor(private readonly db: any) {}

	async revealWeaknessOrImmunity(
		bossId: string,
		details: string,
	): Promise<Result<void, string>> {
		try {
			const rows = this.db
				.select()
				.from(campaignInvestigations)
				.where(
					and(
						eq(campaignInvestigations.targetId, bossId),
						eq(campaignInvestigations.status, "active"),
					),
				)
				.all();

			if (rows.length > 0) {
				const r = rows[0];
				const nextS = r.successesAccumulated + 1;
				const status =
					nextS >= r.successesRequired ? "completed_standard" : "active";
				this.db
					.update(campaignInvestigations)
					.set({
						successesAccumulated: nextS,
						discoveredSecrets: r.discoveredSecrets + "; " + details,
						status,
						updatedAt: new Date().toISOString(),
					})
					.where(eq(campaignInvestigations.id, r.id))
					.run();
			} else {
				this.db
					.insert(campaignInvestigations)
					.values({
						id: crypto.randomUUID(),
						targetId: bossId,
						targetName: `Boss: ${bossId}`,
						type: "weekly_metropolis",
						tier: 1,
						dc: 20,
						successesRequired: 3,
						successesAccumulated: 1,
						failuresMax: 3,
						failuresAccumulated: 0,
						status: "active",
						goldCostPerTest: 0,
						translatedPercent: 0,
						discoveredSecrets: details,
						createdAt: new Date().toISOString(),
						updatedAt: new Date().toISOString(),
					})
					.run();
			}
			return ok(undefined);
		} catch (e: any) {
			return fail(`Erro ao gravar investigação/fraqueza: ${e.message}`);
		}
	}
}

export class DrizzleDowntimeDice implements IDowntimeDice {
	private rollSingle(): number {
		const array = new Uint32Array(1);
		crypto.getRandomValues(array);
		const val = array[0] ?? 0;
		return (val % 20) + 1;
	}

	rollD20(): number {
		return this.rollSingle();
	}

	rollWithAdvantage(): number {
		const r1 = this.rollSingle();
		const r2 = this.rollSingle();
		return Math.max(r1, r2);
	}

	rollWithDisadvantage(): number {
		const r1 = this.rollSingle();
		const r2 = this.rollSingle();
		return Math.min(r1, r2);
	}
}

export class DrizzleDowntimeContext implements IDowntimeContext {
	private readonly dice = new DrizzleDowntimeDice();
	private readonly quest: DrizzleDowntimeQuest;
	private readonly equipment: DrizzleDowntimeEquipment;

	constructor(
		private readonly db: any,
		private readonly campaignId: string,
		private readonly bastionId: string,
	) {
		this.quest = new DrizzleDowntimeQuest(db);
		this.equipment = new DrizzleDowntimeEquipment(db);
	}

	async getActor(characterId: string): Promise<Result<IDowntimeActor, string>> {
		return ok(new DrizzleDowntimeActor(characterId, this.db, this.bastionId));
	}

	async getFaction(
		factionId: string,
	): Promise<Result<IDowntimeFaction, string>> {
		return ok(new DrizzleDowntimeFaction(this.db, this.campaignId));
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
