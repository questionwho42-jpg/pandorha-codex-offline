import type { WorldStateService } from "$lib/entities/world-state/domain/WorldStateService";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { WorldTileFailure } from "../model/worldTileTypes";

export interface TravelRolesRecord {
	guideCharacterId: string | null;
	scoutCharacterId: string | null;
	foragerCharacterId: string | null;
	cartographerCharacterId: string | null;
	assignedAtDay: number;
}

export interface ExplorationTime {
	day: number;
	turn: number; // 1 = manha, 2 = tarde, 3 = anoitecer, 4 = madrugada
	phase: "manha" | "tarde" | "anoitecer" | "madrugada";
}

const TURN_PHASES = ["manha", "tarde", "anoitecer", "madrugada"] as const;

export class TravelRoleService {
	public constructor(private readonly worldStateService: WorldStateService) {}

	public async assignRoles(input: {
		guideCharacterId: string | null;
		scoutCharacterId: string | null;
		foragerCharacterId: string | null;
		cartographerCharacterId: string | null;
		assignedAtDay: number;
		updatedAt: string;
	}): Promise<Result<void, WorldTileFailure>> {
		const wsResult = await this.worldStateService.setNarrativeFlag({
			key: "location:travel_roles",
			value: {
				guideCharacterId: input.guideCharacterId,
				scoutCharacterId: input.scoutCharacterId,
				foragerCharacterId: input.foragerCharacterId,
				cartographerCharacterId: input.cartographerCharacterId,
				assignedAtDay: input.assignedAtDay,
			},
			updatedAt: input.updatedAt,
		});

		if (!wsResult.success) {
			return fail({
				code: "WORLD_TILE_REPOSITORY_READ_FAILED",
				message: `Falha ao salvar papéis de viagem: ${wsResult.error.message}`,
			});
		}

		return ok(undefined);
	}

	public async getActiveRoles(): Promise<
		Result<TravelRolesRecord | null, WorldTileFailure>
	> {
		const wsResult = await this.worldStateService.getFlag(
			"location:travel_roles",
		);
		if (!wsResult.success) {
			if (wsResult.error.code === "WORLD_STATE_FLAG_NOT_FOUND") {
				return ok(null);
			}
			return fail({
				code: "WORLD_TILE_REPOSITORY_READ_FAILED",
				message: `Falha ao buscar papéis de viagem: ${wsResult.error.message}`,
			});
		}

		// biome-ignore lint/suspicious/noExplicitAny: parsing dynamic JSON state
		const data = wsResult.data.value as any;
		return ok({
			guideCharacterId: data.guideCharacterId ?? null,
			scoutCharacterId: data.scoutCharacterId ?? null,
			foragerCharacterId: data.foragerCharacterId ?? null,
			cartographerCharacterId: data.cartographerCharacterId ?? null,
			assignedAtDay: data.assignedAtDay ?? 1,
		});
	}

	public async getExplorationTime(): Promise<
		Result<ExplorationTime, WorldTileFailure>
	> {
		const wsResult = await this.worldStateService.getFlag(
			"location:current_time",
		);
		if (!wsResult.success) {
			if (wsResult.error.code === "WORLD_STATE_FLAG_NOT_FOUND") {
				return ok({ day: 1, turn: 1, phase: "manha" });
			}
			return fail({
				code: "WORLD_TILE_REPOSITORY_READ_FAILED",
				message: `Falha ao obter tempo de exploração: ${wsResult.error.message}`,
			});
		}

		// biome-ignore lint/suspicious/noExplicitAny: parsing dynamic JSON state
		const data = wsResult.data.value as any;
		const day = data.day ?? 1;
		const turn = data.turn ?? 1;
		const phase =
			data.phase && TURN_PHASES.includes(data.phase as any)
				? (data.phase as ExplorationTime["phase"])
				: "manha";

		return ok({ day, turn, phase });
	}

	public async advanceExplorationTime(
		updatedAt: string,
	): Promise<Result<ExplorationTime, WorldTileFailure>> {
		const timeRes = await this.getExplorationTime();
		if (!timeRes.success) {
			return fail(timeRes.error);
		}

		let { day, turn } = timeRes.data;
		turn += 1;
		if (turn > 4) {
			turn = 1;
			day += 1;
		}

		const phase = TURN_PHASES[turn - 1]!;

		const wsResult = await this.worldStateService.setNarrativeFlag({
			key: "location:current_time",
			value: { day, turn, phase },
			updatedAt,
		});

		if (!wsResult.success) {
			return fail({
				code: "WORLD_TILE_REPOSITORY_READ_FAILED",
				message: `Falha ao salvar tempo de exploração: ${wsResult.error.message}`,
			});
		}

		return ok({ day, turn, phase });
	}
}
