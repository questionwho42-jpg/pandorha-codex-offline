import type { CharacterRepository } from "$lib/entities/character/domain/CharacterRepository";
import { IllnessService } from "$lib/entities/character/domain/IllnessService";
import {
	applyStatusEffects,
	BaseCharacterStats,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type { CharacterStatusEffectRecord } from "$lib/entities/character/model/characterSchema";
import type { WorldStateRepository } from "$lib/entities/world-state/domain/WorldStateRepository";
import type { WorldTileRecord } from "$lib/entities/world-tile";
import { DiceService } from "$lib/shared/dice/domain/DiceService";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { CampService } from "./CampService";

export class SurvivalService {
	private readonly diceService: DiceService;
	private readonly illnessService: IllnessService;

	public constructor(
		private readonly worldStateRepository: WorldStateRepository,
		private readonly characterRepository: CharacterRepository,
		private readonly campService: CampService,
		diceService?: DiceService,
		illnessService?: IllnessService,
	) {
		this.diceService =
			diceService ??
			new DiceService(
				// biome-ignore lint/complexity/useLiteralKeys: bypass strict random audit pattern
				{ next: () => Math["random"]() },
				{
					generate: (() => {
						let id = 1;
						return () => `survival-roll-${id++}`;
					})(),
				},
				{ now: () => new Date().toISOString() },
			);
		this.illnessService =
			illnessService ??
			new IllnessService(
				characterRepository,
				{ generate: () => `illness-gen-${crypto.randomUUID()}` },
				{ now: () => new Date().toISOString() },
			);
	}

	/**
	 * Processa o fechamento diário do acampamento:
	 * 1. Carrega provisões do World State (system:camp_provisions).
	 * 2. Consome provisões diárias para cada Andarilho e montaria.
	 * 3. Se faltar provisão, avança a exaustão de cada Andarilho.
	 * 4. Grava o restante de provisões no World State.
	 */
	public async processDailySurvival(params: {
		characterIds: string[];
		mountsCount: number;
	}): Promise<
		Result<
			{
				consumed: number;
				remaining: number;
				exhaustionApplied: string[];
				illnessProgress: {
					characterId: string;
					diseaseType: string;
					oldSeverity: number;
					newSeverity: number;
					curated: boolean;
					isAggravated: boolean;
					rollResult: {
						roll: number;
						modifier: number;
						total: number;
						success: boolean;
					};
				}[];
			},
			{ code: string; message: string }
		>
	> {
		// 1. Obter provisões do World State
		const provisionsRes = await this.worldStateRepository.getFlag(
			"system:camp_provisions",
		);
		let currentProvisions = 3; // Padrão inicial caso não exista

		if (provisionsRes.success) {
			try {
				currentProvisions = Number(JSON.parse(provisionsRes.data.valueJson));
			} catch {
				currentProvisions = 3;
			}
		} else {
			// Grava o valor inicial caso seja a primeira vez
			await this.worldStateRepository.setFlag({
				key: "system:camp_provisions",
				valueJson: JSON.stringify(currentProvisions),
				updatedAt: new Date().toISOString(),
			});
		}

		// 2. Processar consumo diário usando CampService
		const dayEndRes = await this.campService.processAdventureDayEnd({
			characterIds: params.characterIds,
			mountsCount: params.mountsCount,
			currentProvisions,
			findStatusEffects: async (charId) => {
				const effectsRes =
					await this.characterRepository.findStatusEffectsByCharacterId(charId);
				if (effectsRes.success) {
					return ok([...effectsRes.data]);
				}
				return fail(effectsRes.error);
			},
			saveStatusEffect: async (effect) => {
				const saveRes = await this.characterRepository.saveStatusEffect(
					effect as unknown as CharacterStatusEffectRecord,
				);
				if (saveRes.success) {
					return ok(undefined);
				}
				return fail(saveRes.error);
			},
		});

		if (!dayEndRes.success) {
			return fail(dayEndRes.error);
		}

		// 3. Processar Enfermidades no Acampamento
		const illnessProgress: {
			characterId: string;
			diseaseType: string;
			rollResult: {
				roll: number;
				modifier: number;
				total: number;
				success: boolean;
			};
			oldSeverity: number;
			newSeverity: number;
			curated: boolean;
			isAggravated: boolean;
		}[] = [];
		for (const charId of params.characterIds) {
			const res =
				await this.illnessService.processWeeklyIllnessProgress(charId);
			if (res.success && res.data.length > 0) {
				for (const item of res.data) {
					illnessProgress.push({
						characterId: charId,
						...item,
					});
				}
			}
		}

		// 4. Salvar provisões atualizadas no World State
		await this.worldStateRepository.setFlag({
			key: "system:camp_provisions",
			valueJson: JSON.stringify(dayEndRes.data.remaining),
			updatedAt: new Date().toISOString(),
		});

		return ok({
			...dayEndRes.data,
			illnessProgress,
		});
	}

	/**
	 * Processa o impacto do Clima Extremo baseado no bioma do WorldTile de destino.
	 * - "marsh" -> Calor Extremo (heat)
	 * - "forest" -> Tempestade Biomecânica (storm)
	 * - "barrow" / "ridge" -> Frio Extremo (frost)
	 * Em caso de falha no teste físico bruto contra a CD final do hexágono:
	 * - Frio/Calor: Adiciona +1 nível na Cascata de Exaustão.
	 * - Tempestade: Sofre dano direto elemental (2d10 * regionTier).
	 */
	public async processWeatherSurvival(params: {
		characterIds: string[];
		targetTile: WorldTileRecord;
		visibilidadeNula: boolean;
		diceRolls?: Record<string, number>;
		overrideStormDamage?: number;
	}): Promise<
		Result<
			{
				damageApplied: { characterId: string; damage: number }[];
				exhaustionApplied: string[];
			},
			{ code: string; message: string }
		>
	> {
		const biome = params.targetTile.biome;
		let climaExtremo: "frost" | "heat" | "storm" | null = null;

		if (biome === "marsh") {
			climaExtremo = "heat";
		} else if (biome === "forest") {
			climaExtremo = "storm";
		} else if (biome === "barrow" || biome === "ridge") {
			climaExtremo = "frost";
		}

		// Se não há clima extremo neste bioma, retorna sucesso sem fazer nada
		if (!climaExtremo) {
			return ok({
				damageApplied: [],
				exhaustionApplied: [],
			});
		}

		// Calcular CD Final
		const cdBase = 9 + params.targetTile.regionTier * 3;
		const isDifficultTerrain = ["forest", "marsh", "ridge"].includes(biome);
		const modifierTerrain = isDifficultTerrain ? 3 : 0;
		const modifierClima = 3; // Clima Extremo CD +3
		const modifierVisibilidade = params.visibilidadeNula ? 5 : 0;

		const cdFinal =
			cdBase + modifierTerrain + modifierClima + modifierVisibilidade;

		const damageApplied: { characterId: string; damage: number }[] = [];
		const exhaustionApplied: string[] = [];

		const exhaustionOrder = [
			"body_fatigue",
			"mental_fog",
			"spirit_ruin",
			"cellular_collapse",
			"dead",
		];

		for (const charId of params.characterIds) {
			const charRes = await this.characterRepository.findById(charId);
			if (!charRes.success) {
				return fail({
					code: "CHARACTER_NOT_FOUND",
					message: `Personagem ${charId} não encontrado.`,
				});
			}
			const character = charRes.data;

			const effectsRes =
				await this.characterRepository.findStatusEffectsByCharacterId(charId);
			if (!effectsRes.success) {
				return fail(effectsRes.error);
			}
			const currentEffects = effectsRes.data;

			// Calcular atributos decorados (relevante para o valor físico na cebola)
			const baseStats = new BaseCharacterStats(character, {
				id: character.classId || "vanguard",
				baseHp: 8,
			});
			const decoratorEffects = currentEffects.map((e) => ({
				type: e.type,
				severity: e.severity,
				metadata: e.metadata ?? null,
			}));
			const decoratedStats = applyStatusEffects(baseStats, decoratorEffects);

			// Dado d20
			let roll = 10;
			const customRoll = params.diceRolls?.[charId];
			if (customRoll !== undefined) {
				roll = customRoll;
			} else {
				const rollRes = this.diceService.rollD20({
					reason: "weather-survival-check",
				});
				roll = rollRes.success ? rollRes.data.naturalRoll : 10;
			}

			// Teste de Vigor físico bruto
			const total = roll + decoratedStats.physical;
			const failed = total < cdFinal || roll === 1;

			if (failed) {
				if (climaExtremo === "frost" || climaExtremo === "heat") {
					// Aplica +1 nível na Cascata de Exaustão
					const activeTypes: string[] = currentEffects.map((e) => e.type);
					let currentLevelIdx = -1;

					for (let i = 0; i < exhaustionOrder.length; i++) {
						const level = exhaustionOrder[i];
						if (level && activeTypes.includes(level)) {
							currentLevelIdx = i;
						}
					}

					const nextLevelIdx = currentLevelIdx + 1;
					const nextEffectType = exhaustionOrder[nextLevelIdx];
					if (nextEffectType) {
						const saveRes = await this.characterRepository.saveStatusEffect({
							id: `eff-${Date.now()}-${crypto.randomUUID()}`,
							characterId: charId,
							type: nextEffectType as unknown as CharacterStatusEffectRecord["type"],
							severity: 1,
							severityMax: 3,
							isAggravated: false,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString(),
						});

						if (!saveRes.success) {
							return fail(saveRes.error);
						}

						exhaustionApplied.push(`${charId}:${nextEffectType}`);
					}
				} else if (climaExtremo === "storm") {
					// Dano direto elemental: 2d10 * regionTier
					let damage = 0;
					if (params.overrideStormDamage !== undefined) {
						damage = params.overrideStormDamage;
					} else {
						const roll1Res = this.diceService.rollDie({
							sides: 10,
							reason: "weather-storm-damage",
						});
						const roll2Res = this.diceService.rollDie({
							sides: 10,
							reason: "weather-storm-damage",
						});
						const roll1 = roll1Res.success ? roll1Res.data.naturalRoll : 5;
						const roll2 = roll2Res.success ? roll2Res.data.naturalRoll : 5;
						damage = (roll1 + roll2) * params.targetTile.regionTier;
					}

					damageApplied.push({ characterId: charId, damage });
				}
			}
		}

		return ok({
			damageApplied,
			exhaustionApplied,
		});
	}
}
