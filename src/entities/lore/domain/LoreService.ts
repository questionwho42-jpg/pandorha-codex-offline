import type { IClockRepository } from "$lib/entities/clocks/model-api";
import type { SocialRepository } from "$lib/entities/social/domain/SocialRepository";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type {
	CampaignRumorRecord,
	LoreEncounterRecord,
} from "../model/loreSchema";
import type { ILoreRepository } from "./ILoreRepository";

export class LoreService {
	public constructor(
		private readonly loreRepository: ILoreRepository,
		private readonly clocksRepository: IClockRepository,
		private readonly socialRepository: SocialRepository,
	) {}

	public async resolveLoreEncounter(
		tileId: string,
		characterId: string,
	): Promise<Result<LoreEncounterRecord | null, Error>> {
		try {
			const encountersResult =
				await this.loreRepository.listEncountersByTile(tileId);
			if (!encountersResult.success) {
				return fail(new Error(encountersResult.error.message));
			}

			const availableEncounters: LoreEncounterRecord[] = [];

			for (const encounter of encountersResult.data) {
				if (encounter.isTriggered) {
					continue;
				}

				// 1. Verificar requisito de reputação com facção
				if (encounter.factionIdRequired) {
					const reputationResult = await this.socialRepository.findReputation(
						characterId,
						encounter.factionIdRequired,
					);

					let reputationValue = 0;
					if (reputationResult.success) {
						reputationValue = reputationResult.data.value;
					} else if (reputationResult.error.code !== "REPUTATION_NOT_FOUND") {
						return fail(new Error(reputationResult.error.message));
					}

					const requiredRep = encounter.reputationRequired ?? 0;
					if (reputationValue < requiredRep) {
						continue;
					}
				}

				// 2. Verificar requisito de clock
				if (encounter.requiredClockId) {
					const clockResult = await this.clocksRepository.findById(
						encounter.requiredClockId,
					);

					if (!clockResult.success) {
						return fail(clockResult.error);
					}

					const clock = clockResult.data;
					if (!clock) {
						continue;
					}

					const requiredValue = encounter.requiredClockValue ?? 0;
					if (clock.filledSegments < requiredValue) {
						continue;
					}
				}

				availableEncounters.push(encounter);
			}

			// Desempate determinístico: ordenar alfabeticamente por ID do encontro
			availableEncounters.sort((a, b) => a.id.localeCompare(b.id));
			const selectedEncounter = availableEncounters[0];
			if (!selectedEncounter) {
				return ok(null);
			}

			// Marcar encontro como ativado
			const updatedEncounter: LoreEncounterRecord = {
				...selectedEncounter,
				isTriggered: true,
				updatedAt: new Date().toISOString(),
			};

			const saveResult =
				await this.loreRepository.saveEncounter(updatedEncounter);
			if (!saveResult.success) {
				return fail(new Error(saveResult.error.message));
			}

			return ok(saveResult.data);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error(
							"An unexpected error occurred during lore encounter resolution.",
						),
			);
		}
	}

	public async discoverRumor(
		rumorId: string,
	): Promise<Result<CampaignRumorRecord, Error>> {
		try {
			const rumorResult = await this.loreRepository.findRumorById(rumorId);
			if (!rumorResult.success) {
				return fail(new Error(rumorResult.error.message));
			}

			const rumor = rumorResult.data;
			if (!rumor) {
				return fail(new Error(`Rumor with ID ${rumorId} not found.`));
			}

			if (rumor.isDiscovered) {
				return ok(rumor);
			}

			const updatedRumor: CampaignRumorRecord = {
				...rumor,
				isDiscovered: true,
				updatedAt: new Date().toISOString(),
			};

			const saveResult = await this.loreRepository.saveRumor(updatedRumor);
			if (!saveResult.success) {
				return fail(new Error(saveResult.error.message));
			}

			return ok(saveResult.data);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("An unexpected error occurred during rumor discovery."),
			);
		}
	}

	public async listDiscoveredRumorsByTile(
		tileId: string,
	): Promise<Result<readonly CampaignRumorRecord[], Error>> {
		try {
			const rumorsResult = await this.loreRepository.listRumorsByTile(tileId);
			if (!rumorsResult.success) {
				return fail(new Error(rumorsResult.error.message));
			}

			const discoveredRumors = rumorsResult.data.filter((r) => r.isDiscovered);
			return ok(discoveredRumors);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("An unexpected error occurred while listing rumors."),
			);
		}
	}

	public async listAllDiscoveredRumors(): Promise<
		Result<readonly CampaignRumorRecord[], Error>
	> {
		try {
			const rumorsResult = await this.loreRepository.listAllRumors();
			if (!rumorsResult.success) {
				return fail(new Error(rumorsResult.error.message));
			}

			const discoveredRumors = rumorsResult.data.filter((r) => r.isDiscovered);
			return ok(discoveredRumors);
		} catch (error: unknown) {
			return fail(
				error instanceof Error
					? error
					: new Error("An unexpected error occurred while listing all rumors."),
			);
		}
	}
}
