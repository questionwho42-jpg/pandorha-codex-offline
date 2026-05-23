import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	BastionModuleRecord,
	BastionRecord,
} from "../model/bastionSchema";
import type {
	BastionRepository,
	BastionRepositoryFailure,
} from "./BastionRepository";

/**
 * Interface do Componente Abstrato para atributos do Bastião.
 */
export interface IBastionStats {
	getMaintenanceCost(): number;
	getVaultCapacity(): number;
	getStructure(): number;
	getVigilance(): number;
	getLogistics(): number;
}

/**
 * Componente Concreto com os atributos base de persistência.
 */
export class BaseBastionStats implements IBastionStats {
	public constructor(
		private readonly bastion: BastionRecord,
		private readonly modules: readonly BastionModuleRecord[],
	) {}

	public getMaintenanceCost(): number {
		// Apenas módulos concluídos (progresso máximo atingido) e não quebrados contam para a taxa.
		const activeModulesCount = this.modules.filter(
			(m) => m.progressCurrent >= m.progressMax && !m.isBroken,
		).length;
		return this.bastion.tier * 100 + activeModulesCount * 50;
	}

	public getVaultCapacity(): number {
		return this.getVigilance() * 1000;
	}

	public getStructure(): number {
		return this.bastion.structure;
	}

	public getVigilance(): number {
		return this.bastion.vigilance;
	}

	public getLogistics(): number {
		return this.bastion.logistics;
	}
}

/**
 * Decorador Base abstrato.
 */
export abstract class BastionStatsDecorator implements IBastionStats {
	protected constructor(protected readonly wrapped: IBastionStats) {}

	public getMaintenanceCost(): number {
		return this.wrapped.getMaintenanceCost();
	}

	public getVaultCapacity(): number {
		return this.wrapped.getVaultCapacity();
	}

	public getStructure(): number {
		return this.wrapped.getStructure();
	}

	public getVigilance(): number {
		return this.wrapped.getVigilance();
	}

	public getLogistics(): number {
		return this.wrapped.getLogistics();
	}
}

/**
 * Decorador Concreto que aplica desconto de 10% por ponto de Logística na manutenção (limite de 90%).
 */
export class LogisticsDiscountDecorator extends BastionStatsDecorator {
	public override getMaintenanceCost(): number {
		const baseCost = this.wrapped.getMaintenanceCost();
		const logistics = this.wrapped.getLogistics();
		const discountPercent = Math.min(logistics * 10, 90);
		const discountAmount = Math.floor((baseCost * discountPercent) / 100);
		return baseCost - discountAmount;
	}
}

/**
 * Decorador Concreto que aumenta o limite do cofre em 1000 PO por módulo de "Cofre Reforçado".
 */
export class ReinforcedVaultDecorator extends BastionStatsDecorator {
	private readonly count: number;

	public constructor(
		wrapped: IBastionStats,
		modules: readonly BastionModuleRecord[],
	) {
		super(wrapped);
		this.count = modules.filter(
			(m) =>
				m.moduleId === "cofre_reforcado" &&
				m.progressCurrent >= m.progressMax &&
				!m.isBroken,
		).length;
	}

	public override getVaultCapacity(): number {
		return this.wrapped.getVaultCapacity() + this.count * 1000;
	}
}

/**
 * Decorador Concreto que adiciona +2 de Vigilância por módulo de "Posto de Vigia".
 */
export class WatchPostDecorator extends BastionStatsDecorator {
	private readonly count: number;

	public constructor(
		wrapped: IBastionStats,
		modules: readonly BastionModuleRecord[],
	) {
		super(wrapped);
		this.count = modules.filter(
			(m) =>
				m.moduleId === "posto_vigia" &&
				m.progressCurrent >= m.progressMax &&
				!m.isBroken,
		).length;
	}

	public override getVigilance(): number {
		return this.wrapped.getVigilance() + this.count * 2;
	}
}

/**
 * Decorador Concreto que adiciona +2 de Estrutura por módulo de "Muralha de Madeira".
 */
export class WoodenWallDecorator extends BastionStatsDecorator {
	private readonly count: number;

	public constructor(
		wrapped: IBastionStats,
		modules: readonly BastionModuleRecord[],
	) {
		super(wrapped);
		this.count = modules.filter(
			(m) =>
				m.moduleId === "muralha_madeira" &&
				m.progressCurrent >= m.progressMax &&
				!m.isBroken,
		).length;
	}

	public override getStructure(): number {
		return this.wrapped.getStructure() + this.count * 2;
	}
}

/**
 * Decorador Concreto que adiciona +4 de Estrutura por módulo de "Muralha de Pedra".
 */
export class StoneWallDecorator extends BastionStatsDecorator {
	private readonly count: number;

	public constructor(
		wrapped: IBastionStats,
		modules: readonly BastionModuleRecord[],
	) {
		super(wrapped);
		this.count = modules.filter(
			(m) =>
				m.moduleId === "muralha_pedra" &&
				m.progressCurrent >= m.progressMax &&
				!m.isBroken,
		).length;
	}

	public override getStructure(): number {
		return this.wrapped.getStructure() + this.count * 4;
	}
}

/**
 * DIDÁTICA DO DECORATOR:
 * Por que herança falharia aqui?
 * Se tentássemos usar herança clássica para representar combinações de Módulos (ex: "FortalezaComMuralhaDeMadeira",
 * "FortalezaComMuralhaDeMadeiraECofreReforçado", "GaleãoComMuralhaDeMadeiraEDormitório"), sofreríamos uma explosão de classes,
 * gerando centenas de subclasses para cobrir todas as combinações possíveis de módulos construídos.
 *
 * Como a chamada recursiva funciona (Efeito Cebola)?
 * Ao embrulhar o BaseBastionStats em múltiplos decoradores concretos (ex: new LogisticsDiscountDecorator(new ReinforcedVaultDecorator(base))),
 * chamamos getVaultCapacity() ou getMaintenanceCost() na casca externa. Ela delega a chamada para a camada interna de forma recursiva
 * até atingir o BaseBastionStats, aplicando modificações de forma cumulativa e desacoplada em cada camada que retorna.
 */

export class BastionService {
	public constructor(private readonly repository: BastionRepository) {}

	public async foundBastion(
		name: string,
		chassisId: string,
	): Promise<Result<BastionRecord, BastionRepositoryFailure>> {
		let structure = 1;
		let vigilance = 1;
		let logistics = 1;

		switch (chassisId) {
			case "fortaleza_pedra":
				structure += 2;
				break;
			case "taverna_guilda":
				vigilance += 2;
				break;
			case "galeao":
				logistics += 2;
				break;
			case "torre_arcana":
				structure += 1;
				vigilance += 1;
				break;
			case "masmorra_subterranea":
				structure += 2;
				break;
			case "templo_arruinado":
				vigilance += 1;
				logistics += 1;
				break;
			case "caravana_nomade":
				logistics += 2;
				break;
			case "mansao_nobre":
				vigilance += 2;
				break;
			case "mina_abandonada":
				structure += 1;
				logistics += 1;
				break;
			case "arvore_mae":
				structure += 1;
				vigilance += 1;
				break;
		}

		const bastion: BastionRecord = {
			id: crypto.randomUUID(),
			name,
			chassisId,
			tier: 0,
			structure,
			vigilance,
			logistics,
			integrityCurrent: structure * 10, // Base Nível 0: HP = Estrutura * 10
			threatCurrent: 0,
			vaultGold: 0,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return this.repository.save(bastion);
	}

	public async startModule(
		bastionId: string,
		moduleId: string,
		tier: number,
	): Promise<Result<BastionModuleRecord, BastionRepositoryFailure>> {
		const bastionRes = await this.repository.findById(bastionId);
		if (!bastionRes.success) {
			return fail(bastionRes.error);
		}

		let progressMax = 10;
		if (tier === 2) progressMax = 20;
		else if (tier === 3) progressMax = 30;
		else if (tier === 4) progressMax = 40;

		const moduleRecord: BastionModuleRecord = {
			id: crypto.randomUUID(),
			bastionId,
			moduleId,
			tier,
			progressCurrent: 0,
			progressMax,
			isBroken: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		return this.repository.saveModule(moduleRecord);
	}

	public async advanceModuleObra(
		moduleId: string,
		mentalStat: number,
		dadoRolado: number,
		dc: number,
	): Promise<
		Result<
			{ progressAdded: number; completed: boolean },
			BastionRepositoryFailure
		>
	> {
		const moduleRes = await this.repository.findModuleById(moduleId);
		if (!moduleRes.success) {
			return fail(moduleRes.error);
		}

		const mod = moduleRes.data;

		// Regra de Sucesso Crítico: Natural 20
		const isCrit = dadoRolado === 20;
		const isSuccess = mentalStat + dadoRolado >= dc;

		let progressAdded = 0;
		if (isCrit) {
			progressAdded = 3;
		} else if (isSuccess) {
			progressAdded = 1;
		}

		mod.progressCurrent = Math.min(
			mod.progressMax,
			mod.progressCurrent + progressAdded,
		);
		mod.updatedAt = new Date().toISOString();

		const saveRes = await this.repository.saveModule(mod);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok({
			progressAdded,
			completed: mod.progressCurrent >= mod.progressMax,
		});
	}

	public async calculateCurrentMaintenance(
		bastionId: string,
	): Promise<Result<number, BastionRepositoryFailure>> {
		const bastionRes = await this.repository.findById(bastionId);
		if (!bastionRes.success) {
			return fail(bastionRes.error);
		}

		const modulesRes = await this.repository.findModulesByBastionId(bastionId);
		if (!modulesRes.success) {
			return fail(modulesRes.error);
		}

		const baseStats = new BaseBastionStats(bastionRes.data, modulesRes.data);
		const decoratedStats = new LogisticsDiscountDecorator(baseStats);

		return ok(decoratedStats.getMaintenanceCost());
	}

	public async processRecessEnd(
		bastionId: string,
	): Promise<
		Result<
			{ maintenanceCost: number; threatGained: number },
			BastionRepositoryFailure
		>
	> {
		const bastionRes = await this.repository.findById(bastionId);
		if (!bastionRes.success) {
			return fail(bastionRes.error);
		}

		const modulesRes = await this.repository.findModulesByBastionId(bastionId);
		if (!modulesRes.success) {
			return fail(modulesRes.error);
		}

		const bastion = bastionRes.data;
		const modules = modulesRes.data;

		// Decorators para atributos e capacidades
		const baseStats = new BaseBastionStats(bastion, modules);
		const decorated = new LogisticsDiscountDecorator(
			new ReinforcedVaultDecorator(
				new WatchPostDecorator(
					new WoodenWallDecorator(
						new StoneWallDecorator(baseStats, modules),
						modules,
					),
					modules,
				),
				modules,
			),
		);

		const maintenanceCost = decorated.getMaintenanceCost();
		bastion.vaultGold = Math.max(0, bastion.vaultGold - maintenanceCost);

		// Ocultação Econômica: Ouro acima do limite do cofre gera ameaça passiva
		const capacity = decorated.getVaultCapacity();
		let threatGained = 0;
		if (bastion.vaultGold > capacity) {
			const excess = bastion.vaultGold - capacity;
			// 1 ponto a cada 500 PO excedentes por semana de recesso
			threatGained = Math.floor(excess / 500);
			bastion.threatCurrent = Math.min(
				10,
				bastion.threatCurrent + threatGained,
			);
		}

		// Atualiza HP máximo se atributos de estrutura mudaram por decorators
		const maxHp = decorated.getStructure() * 10 + bastion.tier * 20;
		if (bastion.integrityCurrent > maxHp) {
			bastion.integrityCurrent = maxHp;
		}

		const saveRes = await this.repository.save(bastion);
		if (!saveRes.success) {
			return fail(saveRes.error);
		}

		return ok({
			maintenanceCost,
			threatGained,
		});
	}
}
