import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	NewRegionalDomainRecord,
	RegionalDomainRecord,
} from "../model/regionalDomainSchema";
import type {
	RegionalDomainClock,
	RegionalDomainFailure,
	RegionalDomainIdProvider,
} from "../model/regionalDomainTypes";
import type { RegionalDomainRepository } from "./RegionalDomainRepository";

export class RegionalDomainService {
	public constructor(
		private readonly repository: RegionalDomainRepository,
		private readonly idProvider: RegionalDomainIdProvider,
		private readonly clock: RegionalDomainClock,
	) {}

	public async createDomain(params: {
		tier: number;
	}): Promise<Result<RegionalDomainRecord, RegionalDomainFailure>> {
		if (params.tier < 1 || params.tier > 4) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "O Tier do domínio deve estar entre 1 e 4.",
			});
		}

		const timestamp = this.clock.now();
		const record: NewRegionalDomainRecord = {
			id: this.idProvider.generate(),
			tier: params.tier,
			physicalLevel: 0,
			mentalLevel: 0,
			socialLevel: 0,
			regentId: null,
			weeksAway: 0,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(record);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Não foi possível criar o domínio regional.",
			});
		}

		return ok(saved.data);
	}

	public async upgradeMatrix(params: {
		id: string;
		matrix: "physical" | "mental" | "social";
	}): Promise<Result<RegionalDomainRecord, RegionalDomainFailure>> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		const domain = domainResult.data;
		let nextPhysical = domain.physicalLevel;
		let nextMental = domain.mentalLevel;
		let nextSocial = domain.socialLevel;

		if (params.matrix === "physical") nextPhysical += 1;
		else if (params.matrix === "mental") nextMental += 1;
		else if (params.matrix === "social") nextSocial += 1;

		// Validar limites
		if (nextPhysical > 5 || nextMental > 5 || nextSocial > 5) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "Nenhuma matriz pode exceder o nível 5.",
			});
		}

		// Validar regra 5/3/1
		const sorted = [nextPhysical, nextMental, nextSocial].sort((a, b) => b - a);
		if (sorted[0]! > 5 || sorted[1]! > 3 || sorted[2]! > 1) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "A evolução viola a regra 5/3/1 de foco de matrizes.",
			});
		}

		const timestamp = this.clock.now();
		const updatedRecord: RegionalDomainRecord = {
			...domain,
			physicalLevel: nextPhysical,
			mentalLevel: nextMental,
			socialLevel: nextSocial,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(updatedRecord);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Falha ao salvar a evolução da matriz.",
			});
		}

		return ok(saved.data);
	}

	public async hireRegent(params: {
		id: string;
		regentId: string | null;
	}): Promise<Result<RegionalDomainRecord, RegionalDomainFailure>> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		const domain = domainResult.data;
		const timestamp = this.clock.now();
		const updated: RegionalDomainRecord = {
			...domain,
			regentId: params.regentId,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao salvar regente do domínio.",
			});
		}

		return ok(saved.data);
	}

	public async addWeeksAway(params: {
		id: string;
		weeks: number;
	}): Promise<Result<RegionalDomainRecord, RegionalDomainFailure>> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		if (params.weeks < 0) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "As semanas adicionadas devem ser positivas.",
			});
		}

		const domain = domainResult.data;
		const timestamp = this.clock.now();
		const updated: RegionalDomainRecord = {
			...domain,
			weeksAway: domain.weeksAway + params.weeks,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao atualizar semanas de ausência.",
			});
		}

		return ok(saved.data);
	}

	public async resetWeeksAway(params: {
		id: string;
	}): Promise<Result<RegionalDomainRecord, RegionalDomainFailure>> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		const domain = domainResult.data;
		const timestamp = this.clock.now();
		const updated: RegionalDomainRecord = {
			...domain,
			weeksAway: 0,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao resetar semanas de ausência.",
			});
		}

		return ok(saved.data);
	}

	public async resolveStabilityCheck(params: {
		id: string;
		matrix: "physical" | "mental" | "social";
		leaderAttribute: number;
		d20Roll: number;
	}): Promise<
		Result<
			{
				roll: number;
				cd: number;
				hasCrisis: boolean;
				domain: RegionalDomainRecord;
			},
			RegionalDomainFailure
		>
	> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		if (params.d20Roll < 1 || params.d20Roll > 20) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "O valor do d20 deve estar entre 1 e 20.",
			});
		}

		const domain = domainResult.data;
		const level =
			params.matrix === "physical"
				? domain.physicalLevel
				: params.matrix === "mental"
					? domain.mentalLevel
					: domain.socialLevel;

		const penaltyRate = domain.regentId ? 1 : 2;
		const cd = 15 + domain.weeksAway * penaltyRate;
		const roll = params.d20Roll + params.leaderAttribute + level;
		const hasCrisis = roll < cd;

		return ok({
			roll,
			cd,
			hasCrisis,
			domain,
		});
	}

	public async collectTaxes(params: {
		id: string;
		leaderCarisma: number;
		d20Roll1: number;
		d20Roll2: number;
	}): Promise<
		Result<
			{
				revenue: number;
				stabilityRoll: number;
				cd: number;
				hasCrisis: boolean;
				domain: RegionalDomainRecord;
			},
			RegionalDomainFailure
		>
	> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		if (
			params.d20Roll1 < 1 ||
			params.d20Roll1 > 20 ||
			params.d20Roll2 < 1 ||
			params.d20Roll2 > 20
		) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "Os valores dos d20 devem estar entre 1 e 20.",
			});
		}

		const domain = domainResult.data;

		// Renda de Imposto
		const revenue = 5 * 10 ** domain.tier;

		// Teste de Estabilidade com Desvantagem (CD +5)
		const stabilityD20 = Math.min(params.d20Roll1, params.d20Roll2);
		const stabilityRoll =
			stabilityD20 + params.leaderCarisma + domain.socialLevel;
		const penaltyRate = domain.regentId ? 1 : 2;
		const cd = 15 + 5 + domain.weeksAway * penaltyRate;
		const hasCrisis = stabilityRoll < cd;

		return ok({
			revenue,
			stabilityRoll,
			cd,
			hasCrisis,
			domain,
		});
	}

	public async resolveCrisis(params: {
		id: string;
		matrix: "physical" | "mental" | "social";
		resolution: "delegate" | "negligence";
	}): Promise<
		Result<
			{
				status: "resolved" | "degraded";
				levelLost: boolean;
				costPaid: number;
				domain: RegionalDomainRecord;
			},
			RegionalDomainFailure
		>
	> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		const domain = domainResult.data;
		let currentLevel = 0;
		if (params.matrix === "physical") currentLevel = domain.physicalLevel;
		else if (params.matrix === "mental") currentLevel = domain.mentalLevel;
		else if (params.matrix === "social") currentLevel = domain.socialLevel;

		let status: "resolved" | "degraded" = "resolved";
		let levelLost = false;
		let costPaid = 0;

		let nextPhysical = domain.physicalLevel;
		let nextMental = domain.mentalLevel;
		let nextSocial = domain.socialLevel;

		if (params.resolution === "delegate") {
			costPaid = 5 * 10 ** domain.tier * currentLevel;
			status = "resolved";
		} else {
			levelLost = true;
			status = "degraded";
			if (params.matrix === "physical")
				nextPhysical = Math.max(0, nextPhysical - 1);
			else if (params.matrix === "mental")
				nextMental = Math.max(0, nextMental - 1);
			else if (params.matrix === "social")
				nextSocial = Math.max(0, nextSocial - 1);
		}

		const timestamp = this.clock.now();
		const updated: RegionalDomainRecord = {
			...domain,
			physicalLevel: nextPhysical,
			mentalLevel: nextMental,
			socialLevel: nextSocial,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao salvar domínio após resolução de crise.",
			});
		}

		return ok({
			status,
			levelLost,
			costPaid,
			domain: saved.data,
		});
	}

	public async reallocateLevels(params: {
		id: string;
		physical: number;
		mental: number;
		social: number;
	}): Promise<
		Result<
			{ cost: number; domain: RegionalDomainRecord },
			RegionalDomainFailure
		>
	> {
		const domainResult = await this.repository.findById(params.id);
		if (!domainResult.success) {
			return fail({
				code: "REGIONAL_DOMAIN_NOT_FOUND",
				message: "Domínio regional não encontrado.",
			});
		}

		// Validar limites
		if (params.physical > 5 || params.mental > 5 || params.social > 5) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "Nenhuma matriz pode exceder o nível 5.",
			});
		}

		// Validar regra 5/3/1
		const sorted = [params.physical, params.mental, params.social].sort(
			(a, b) => b - a,
		);
		if (sorted[0]! > 5 || sorted[1]! > 3 || sorted[2]! > 1) {
			return fail({
				code: "INVALID_REGIONAL_DOMAIN_INPUT",
				message: "A realocação viola a regra 5/3/1.",
			});
		}

		const domain = domainResult.data;
		const cost = 25 * 10 ** domain.tier;

		const timestamp = this.clock.now();
		const updated: RegionalDomainRecord = {
			...domain,
			physicalLevel: params.physical,
			mentalLevel: params.mental,
			socialLevel: params.social,
			updatedAt: timestamp,
		};

		const saved = await this.repository.save(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao salvar realocação de níveis.",
			});
		}

		return ok({
			cost,
			domain: saved.data,
		});
	}
}
