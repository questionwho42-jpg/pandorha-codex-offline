import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	MercenaryCompanyRecord,
	MercenarySquadRecord,
	NewMercenaryCompanyRecord,
	NewMercenarySquadRecord,
} from "../model/mercenarySchema";
import type {
	MercenaryClock,
	MercenaryFailure,
	MercenaryIdProvider,
} from "../model/mercenaryTypes";
import type { MercenaryRepository } from "./MercenaryRepository";

export class MercenaryService {
	public constructor(
		private readonly repository: MercenaryRepository,
		private readonly idProvider: MercenaryIdProvider,
		private readonly clock: MercenaryClock,
	) {}

	public async createCompany(params: {
		hqName: string;
		bastionId?: string | null;
		tier?: number;
	}): Promise<Result<MercenaryCompanyRecord, MercenaryFailure>> {
		const timestamp = this.clock.now();
		const record: NewMercenaryCompanyRecord = {
			id: this.idProvider.generate(),
			hqName: params.hqName.trim(),
			bastionId: params.bastionId ?? null,
			tier: params.tier ?? 1,
			reputation: 0,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const saved = await this.repository.saveCompany(record);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Não foi possível registrar a companhia mercenária.",
			});
		}
		return ok(saved.data);
	}

	public async recruitSquad(
		companyId: string,
		params: {
			name: string;
			physical: number;
			mental: number;
			social: number;
			tags: string[];
		},
	): Promise<Result<MercenarySquadRecord, MercenaryFailure>> {
		const companyRes = await this.repository.findCompanyById(companyId);
		if (!companyRes.success) {
			return fail({
				code: "MERCENARY_COMPANY_NOT_FOUND",
				message: "Companhia mercenária não encontrada.",
			});
		}

		if (
			params.physical < 0 ||
			params.physical > 5 ||
			params.mental < 0 ||
			params.mental > 5 ||
			params.social < 0 ||
			params.social > 5
		) {
			return fail({
				code: "INVALID_MERCENARY_INPUT",
				message: "Os atributos do esquadrão devem estar entre 0 e 5.",
			});
		}

		const cohesionMax = 10 + params.physical;
		const timestamp = this.clock.now();
		const record: NewMercenarySquadRecord = {
			id: this.idProvider.generate(),
			companyId,
			name: params.name.trim(),
			physical: params.physical,
			mental: params.mental,
			social: params.social,
			cohesionMax,
			cohesionCurrent: cohesionMax,
			tagsJson: JSON.stringify(params.tags),
			commandTactic: "honorable",
			status: "available",
			assignedMissionId: null,
			createdAt: timestamp,
			updatedAt: timestamp,
		};

		const saved = await this.repository.saveSquad(record);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao persistir novo esquadrão no banco local.",
			});
		}
		return ok(saved.data);
	}

	public async assignTactic(
		squadId: string,
		tactic: "honorable" | "cruel" | "stealthy",
	): Promise<Result<MercenarySquadRecord, MercenaryFailure>> {
		const squadRes = await this.repository.findSquadById(squadId);
		if (!squadRes.success) {
			return fail({
				code: "MERCENARY_SQUAD_NOT_FOUND",
				message: "Esquadrão mercenário não encontrado.",
			});
		}

		const squad = squadRes.data;
		if (squad.status === "dead") {
			return fail({
				code: "INVALID_MERCENARY_INPUT",
				message: "Não é possível atribuir táticas a um esquadrão destruído.",
			});
		}

		const updated: MercenarySquadRecord = {
			...squad,
			commandTactic: tactic,
			updatedAt: this.clock.now(),
		};

		const saved = await this.repository.saveSquad(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao atualizar a tática do esquadrão.",
			});
		}
		return ok(saved.data);
	}

	public async assignMission(
		squadId: string,
		missionId: string,
	): Promise<Result<MercenarySquadRecord, MercenaryFailure>> {
		const squadRes = await this.repository.findSquadById(squadId);
		if (!squadRes.success) {
			return fail({
				code: "MERCENARY_SQUAD_NOT_FOUND",
				message: "Esquadrão mercenário não encontrado.",
			});
		}

		const squad = squadRes.data;
		if (squad.status !== "available") {
			return fail({
				code: "INVALID_MERCENARY_INPUT",
				message: "O esquadrão deve estar disponível para assumir missões.",
			});
		}

		const updated: MercenarySquadRecord = {
			...squad,
			status: "on_mission",
			assignedMissionId: missionId,
			updatedAt: this.clock.now(),
		};

		const saved = await this.repository.saveSquad(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Erro ao designar missão ao esquadrão.",
			});
		}
		return ok(saved.data);
	}

	public async resolveMission(params: {
		squadId: string;
		requiredTags: string[];
		difficulty: number;
		matrix: "Physical" | "Mental" | "Social";
		rewardGold: number;
		d20Roll: number;
		leaderCargo?: "Mestre de Armas" | "Estrategista" | "Emissário" | null;
	}): Promise<
		Result<
			{
				success: boolean;
				goldEarned: number;
				cohesionLost: number;
				squad: MercenarySquadRecord;
			},
			MercenaryFailure
		>
	> {
		const squadRes = await this.repository.findSquadById(params.squadId);
		if (!squadRes.success) {
			return fail({
				code: "MERCENARY_SQUAD_NOT_FOUND",
				message: "Esquadrão mercenário não encontrado.",
			});
		}

		const squad = squadRes.data;
		if (squad.status !== "on_mission") {
			return fail({
				code: "INVALID_MERCENARY_INPUT",
				message: "O esquadrão deve estar em missão ativa para resolvê-la.",
			});
		}

		if (params.d20Roll < 1 || params.d20Roll > 20) {
			return fail({
				code: "INVALID_MERCENARY_INPUT",
				message: "A rolagem d20 deve estar entre 1 e 20.",
			});
		}

		// 1. Atributo base da Matriz da Missão
		let baseAttr = 0;
		if (params.matrix === "Physical") baseAttr = squad.physical;
		else if (params.matrix === "Mental") baseAttr = squad.mental;
		else if (params.matrix === "Social") baseAttr = squad.social;

		// 2. Modificador do Cargo de Liderança do Andarilho
		let leaderBonus = 0;
		if (
			params.leaderCargo === "Mestre de Armas" &&
			params.matrix === "Physical"
		) {
			leaderBonus = 1;
		} else if (
			params.leaderCargo === "Estrategista" &&
			params.matrix === "Mental"
		) {
			leaderBonus = 1;
		} else if (
			params.leaderCargo === "Emissário" &&
			params.matrix === "Social"
		) {
			leaderBonus = 1;
		}

		// 3. Regra de correspondência de Tags
		const squadTags: string[] = JSON.parse(squad.tagsJson);
		let tagsBonus = 0;

		// +2 para cada tag compatível
		for (const req of params.requiredTags) {
			if (squadTags.includes(req)) {
				tagsBonus += 2;
			} else {
				// -2 para cada tag ausente
				tagsBonus -= 2;
			}
		}

		// 4. Modificador de Tática de Comando
		let tacticBonus = 0;
		if (squad.commandTactic === "honorable") {
			tacticBonus = 1;
		} else if (squad.commandTactic === "cruel") {
			tacticBonus = -1;
		} else if (squad.commandTactic === "stealthy") {
			const hasStealth = params.requiredTags.includes("stealth");
			tacticBonus = hasStealth ? 2 : -1;
		}

		// Rolagem total
		const totalRoll =
			params.d20Roll + baseAttr + leaderBonus + tagsBonus + tacticBonus;
		const success = totalRoll >= params.difficulty;

		// Cálculo do Ouro e dano de Coesão
		let goldEarned = 0;
		let cohesionLost = 0;

		if (success) {
			goldEarned = params.rewardGold;
			cohesionLost = 1; // Desgaste normal por missão concluída
		} else {
			goldEarned = 0;
			// Falha inflige dano de coesão baseado na tática
			if (squad.commandTactic === "honorable") {
				cohesionLost = 3; // +1 extra de dano por resistir rigidamente
			} else if (squad.commandTactic === "cruel") {
				cohesionLost = 1; // peões usados como escudo mitigam dano
			} else {
				cohesionLost = 2; // padrão para furtivos/neutros
			}
		}

		const nextCohesion = Math.max(0, squad.cohesionCurrent - cohesionLost);
		const nextStatus = nextCohesion === 0 ? "dead" : "available";

		const updated: MercenarySquadRecord = {
			...squad,
			cohesionCurrent: nextCohesion,
			status: nextStatus,
			assignedMissionId: null,
			updatedAt: this.clock.now(),
		};

		const saved = await this.repository.saveSquad(updated);
		if (!saved.success) {
			return fail({
				code: "REPOSITORY_WRITE_FAILED",
				message: "Falha ao salvar esquadrão após resolução de missão.",
			});
		}

		return ok({
			success,
			goldEarned,
			cohesionLost,
			squad: saved.data,
		});
	}
}
