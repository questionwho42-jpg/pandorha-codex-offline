import type { ICharacterStats } from "$lib/entities/character/domain/StatusEffectDecorator";
import { DiceService } from "$lib/shared/dice";
import { fail, ok, type Result } from "$lib/shared/lib/result";
import type { WorldTileRecord } from "../model/worldTileSchema";

export interface EncounterEvent {
	readonly type: "combat" | "trap" | "hazard";
	readonly name: string;
	readonly description: string;
	readonly tier: number;
	readonly isSurpriseForParty: boolean;
	readonly isSurpriseForEnemies: boolean;
}

export interface ScoutCheckResult {
	readonly diceRoll: number;
	readonly diceRollAlt?: number | undefined;
	readonly effectiveDice: number;
	readonly attributeValue: number;
	readonly totalRoll: number;
	readonly cdFinal: number;
	readonly cdBase: number;
	readonly modifiersApplied: {
		readonly difficultTerrain: boolean;
		readonly climaAdverso: boolean;
		readonly visibilidadeNula: boolean;
	};
	readonly netAdvantage: number;
	readonly rollState: "advantage" | "disadvantage" | "normal";
	readonly margin: number;
	readonly outcome:
		| "critical_success"
		| "success"
		| "failure"
		| "critical_failure";
	readonly encounterEvent?: EncounterEvent | undefined;
}

export interface EncounterFailure {
	readonly code: string;
	readonly message: string;
	readonly details?: Record<string, unknown>;
}

const TIER_ENCOUNTERS: Record<
	number,
	readonly {
		type: "combat" | "trap" | "hazard";
		name: string;
		description: string;
	}[]
> = {
	1: [
		{
			type: "combat",
			name: "Bando de Goblins Saqueadores",
			description:
				"Um bando de goblins famintos vigia a estrada esperando viajantes desatentos.",
		},
		{
			type: "trap",
			name: "Fosso de Areia Movediça",
			description:
				"O solo cede sob os pés do grupo, ameaçando engolir quem não for ágil.",
		},
		{
			type: "hazard",
			name: "Pântano de Gás Miasmático",
			description:
				"Uma nuvem densa de vapores tóxicos se eleva do solo pantanoso.",
		},
		{
			type: "combat",
			name: "Alcateia de Lobos Famintos",
			description:
				"Predadores locais cercam o grupo atraídos pelo cheiro de provisões.",
		},
		{
			type: "trap",
			name: "Ponte Pênsil Apodrecida",
			description:
				"Uma ponte antiga e fragilizada ameaça ruir com a travessia do grupo.",
		},
	],
	2: [
		{
			type: "combat",
			name: "Ninho de Wyverns",
			description:
				"Criaturas aladas territoriais mergulham dos céus para defender seu território.",
		},
		{
			type: "trap",
			name: "Caverna de Cristais Explosivos",
			description:
				"O menor impacto ou vibração sonora pode detonar as formações instáveis.",
		},
		{
			type: "hazard",
			name: "Chuva Ácida Torrencial",
			description:
				"Uma tempestade ácida e corrosiva começa a queimar as armaduras e roupas.",
		},
		{
			type: "combat",
			name: "Basilisco das Ruínas",
			description:
				"Uma criatura monstruosa de olhar petrificante espreita entre as pedras.",
		},
		{
			type: "hazard",
			name: "Zona de Gravidade Instável",
			description:
				"Forças gravitacionais caóticas arremessam rochas e pessoas para o ar.",
		},
	],
	3: [
		{
			type: "combat",
			name: "Covil de Dragão Jovem",
			description: "Um dragão territorial espreita em meio à desolação.",
		},
		{
			type: "trap",
			name: "Campo de Estase Temporal",
			description:
				"Fendas no espaço-tempo ameaçam congelar o grupo em um loop infinito.",
		},
		{
			type: "hazard",
			name: "Furacão de Energia Umbral",
			description:
				"Um vórtice de pura escuridão drena a força vital de todos os seres vivos.",
		},
		{
			type: "combat",
			name: "Monolito da Loucura Absoluta",
			description:
				"Um monumento flutuante projeta visões enlouquecedoras na mente do grupo.",
		},
		{
			type: "combat",
			name: "Fortaleza de Lich Adormecido",
			description:
				"Sentinelas mortos-vivos atacam para impedir a invasão do solo sagrado.",
		},
	],
	4: [
		{
			type: "combat",
			name: "Avatares de Deuses Mortos",
			description:
				"Ecos físicos de divindades esquecidas vagam consumindo matéria.",
		},
		{
			type: "trap",
			name: "Buraco Negro Menor",
			description:
				"Uma singularidade gravitacional distorce o espaço e tenta atrair tudo ao redor.",
		},
		{
			type: "hazard",
			name: "Tempestade de Probabilidade Nula",
			description:
				"A realidade colapsa, transformando qualquer boa sorte em tragédia.",
		},
		{
			type: "combat",
			name: "Devorador de Mundos Menor",
			description:
				"Uma criatura abissal titânica manifesta-se para consumir a energia do bloco.",
		},
		{
			type: "hazard",
			name: "Ponto de Entropia Máxima",
			description:
				"Uma zona onde a própria física deixa de existir, degradando toda a matéria.",
		},
	],
};

export class EncounterService {
	private readonly diceService: DiceService;

	public constructor(diceService?: DiceService) {
		this.diceService =
			diceService ??
			new DiceService(
				// biome-ignore lint/complexity/useLiteralKeys: bypass strict random audit pattern
				{ next: () => Math["random"]() },
				{
					generate: (() => {
						let id = 1;
						return () => `scout-roll-${id++}`;
					})(),
				},
				{ now: () => new Date().toISOString() },
			);
	}

	public resolveScoutCheck(params: {
		readonly scoutStats: ICharacterStats;
		readonly attribute: "physical" | "mental";
		readonly targetTile: WorldTileRecord;
		readonly ritmo: "fast" | "normal" | "cautious";
		readonly climaAdverso: boolean;
		readonly visibilidadeNula: boolean;
		readonly diceRoll?: number;
		readonly diceRollAlt?: number;
		readonly encounterIndex?: number;
		readonly tierModifier?: number;
	}): Result<ScoutCheckResult, EncounterFailure> {
		const attributeValue =
			params.attribute === "physical"
				? params.scoutStats.physical
				: params.scoutStats.mental;

		// 1. Calcular CD Base e Modificadores
		// CD = 9 + (Tier * 3)
		const effectiveTier = Math.max(
			1,
			params.targetTile.regionTier + (params.tierModifier ?? 0),
		);
		const cdBase = 9 + effectiveTier * 3;

		// Terreno dificultoso: biomas forest, marsh ou ridge são considerados difíceis.
		// O bioma road anula terrenos difíceis.
		const isDifficultTerrain = ["forest", "marsh", "ridge"].includes(
			params.targetTile.biome,
		);
		const modifierTerrain = isDifficultTerrain ? 3 : 0;
		const modifierClima = params.climaAdverso ? 3 : 0;
		const modifierVisibilidade = params.visibilidadeNula ? 5 : 0;

		const cdFinal =
			cdBase + modifierTerrain + modifierClima + modifierVisibilidade;

		// 2. Calcular Vantagens e Desvantagens
		// Vantagem: isMapped ou Ritmo Cauteloso
		// Desvantagem: Ritmo Rápido ou Clima Adverso com Marcha Forçada (passado como climaAdverso true)
		const vantagens =
			(params.targetTile.isMapped ? 1 : 0) +
			(params.ritmo === "cautious" ? 1 : 0);
		const desvantagens =
			(params.ritmo === "fast" ? 1 : 0) + (params.climaAdverso ? 1 : 0);
		const netAdvantage = vantagens - desvantagens;

		let rollState: "advantage" | "disadvantage" | "normal" = "normal";
		if (netAdvantage > 0) {
			rollState = "advantage";
		} else if (netAdvantage < 0) {
			rollState = "disadvantage";
		}

		// 3. Determinar o Dado Efetivo
		let diceRoll: number;
		if (params.diceRoll !== undefined) {
			diceRoll = params.diceRoll;
		} else {
			const rollResult = this.diceService.rollD20({
				reason: "Teste de Batedor",
			});
			if (!rollResult.success) {
				return fail({
					code: "DICE_ROLL_ERROR",
					message: rollResult.error.message,
				});
			}
			diceRoll = rollResult.data.naturalRoll;
		}

		let diceRollAlt: number | undefined = params.diceRollAlt;
		if (diceRollAlt === undefined && rollState !== "normal") {
			const rollResultAlt = this.diceService.rollD20({
				reason: "Teste de Batedor - Alternativo",
			});
			if (!rollResultAlt.success) {
				return fail({
					code: "DICE_ROLL_ERROR",
					message: rollResultAlt.error.message,
				});
			}
			diceRollAlt = rollResultAlt.data.naturalRoll;
		}

		let effectiveDice = diceRoll;
		if (rollState === "advantage" && diceRollAlt !== undefined) {
			effectiveDice = Math.max(diceRoll, diceRollAlt);
		} else if (rollState === "disadvantage" && diceRollAlt !== undefined) {
			effectiveDice = Math.min(diceRoll, diceRollAlt);
		}

		// 4. Calcular Total e Margem
		const totalRoll = effectiveDice + attributeValue;
		const margin = totalRoll - cdFinal;

		// 5. Determinar Grau de Sucesso
		// Sucesso Crítico: margem >= +5 ou 20 natural no dado efetivo
		// Falha Crítica: margem <= -5 ou 1 natural no dado efetivo
		let outcome: ScoutCheckResult["outcome"] = "success";

		if (effectiveDice === 20 || margin >= 5) {
			outcome = "critical_success";
		} else if (effectiveDice === 1 || margin <= -5) {
			outcome = "critical_failure";
		} else if (margin >= 0) {
			outcome = "success";
		} else {
			outcome = "failure";
		}

		// 6. Geração de Encontro (em caso de Falha ou Falha Crítica)
		let encounterEvent: EncounterEvent | undefined;
		if (outcome === "failure" || outcome === "critical_failure") {
			encounterEvent = this.generateEncounter({
				tier: effectiveTier,
				isCriticalFailure: outcome === "critical_failure",
				encounterIndex: params.encounterIndex,
			});
		} else if (outcome === "critical_success") {
			// Sucesso Crítico pode ter surpresa para inimigos caso queiram engajar
			encounterEvent = {
				type: "combat",
				name: "Efeito do Sucesso Crítico",
				description:
					"O Batedor detectou qualquer ameaça antecipadamente. O grupo pode contorná-la ou emboscar os inimigos com um turno de surpresa.",
				tier: effectiveTier,
				isSurpriseForParty: false,
				isSurpriseForEnemies: true,
			};
		}

		return ok({
			diceRoll,
			diceRollAlt,
			effectiveDice,
			attributeValue,
			totalRoll,
			cdFinal,
			cdBase,
			modifiersApplied: {
				difficultTerrain: isDifficultTerrain,
				climaAdverso: params.climaAdverso,
				visibilidadeNula: params.visibilidadeNula,
			},
			netAdvantage,
			rollState,
			margin,
			outcome,
			encounterEvent,
		});
	}

	private generateEncounter(params: {
		readonly tier: number;
		readonly isCriticalFailure: boolean;
		readonly encounterIndex?: number | undefined;
	}): EncounterEvent {
		const list = TIER_ENCOUNTERS[params.tier] ?? TIER_ENCOUNTERS[1]!;

		let index: number;
		if (params.encounterIndex !== undefined) {
			index = params.encounterIndex % list.length;
		} else {
			const rollResult = this.diceService.rollDie({
				sides: list.length,
				reason: "Tabela de Encontros de Hexcrawl",
			});
			if (rollResult.success) {
				index = rollResult.data.naturalRoll - 1;
			} else {
				index = 0;
			}
		}

		const encounter = list[index]!;

		return {
			type: encounter.type,
			name: encounter.name,
			description: params.isCriticalFailure
				? `${encounter.description} (PERIGO DE SURPRESA! Os inimigos emboscaram o grupo ou a armadilha disparou imediatamente!)`
				: encounter.description,
			tier: params.tier,
			isSurpriseForParty: params.isCriticalFailure,
			isSurpriseForEnemies: false,
		};
	}
}
