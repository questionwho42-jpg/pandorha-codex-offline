import type { FactionRecord, FactionStandingRecord } from "./factionSchema";

export const TRAINING_FACTIONS = [
	{
		id: "training-thieves-guild",
		label: "Guilda dos Ladrões de Treino",
		kind: "guild",
		sourceFile: "docs/system/survival/31-codex-teia-infamia-patrocinio.md",
		summary:
			"Facção de treino para testar favores, intriga e dívida sem assumir lore oficial.",
	},
	{
		id: "training-war-temple",
		label: "Templo da Guerra de Treino",
		kind: "temple",
		sourceFile: "docs/system/survival/21-mecanicas-de-fama-e-influencia.md",
		summary:
			"Facção de treino para validar fama, patrocínio e reputação social.",
	},
	{
		id: "training-merchant-league",
		label: "Liga Mercante de Treino",
		kind: "company",
		sourceFile: "docs/system/survival/regras-fama-infamia-favor-faccoes.md",
		summary:
			"Facção de treino para exercitar favores econômicos sem modelar comércio real.",
	},
] as const satisfies readonly FactionRecord[];

export const TRAINING_FACTION_STANDINGS = [
	{
		factionId: "training-thieves-guild",
		fameLevel: 1,
		fameXp: 0,
		infamyLevel: 0,
		bloodDebt: 0,
		favorPoints: 0,
		intriguePoints: 0,
		status: "sponsored",
	},
	{
		factionId: "training-war-temple",
		fameLevel: 1,
		fameXp: 0,
		infamyLevel: 0,
		bloodDebt: 0,
		favorPoints: 0,
		intriguePoints: 0,
		status: "sponsored",
	},
	{
		factionId: "training-merchant-league",
		fameLevel: 1,
		fameXp: 0,
		infamyLevel: 0,
		bloodDebt: 0,
		favorPoints: 0,
		intriguePoints: 0,
		status: "sponsored",
	},
] as const satisfies readonly FactionStandingRecord[];

export const TRAINING_FACTION_IDS = TRAINING_FACTIONS.map(
	(faction) => faction.id,
);
