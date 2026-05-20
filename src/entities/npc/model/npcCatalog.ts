import type { NpcRecord } from "./npcSchema";

export const NPC_CATALOG = [
	{
		id: "training-broker",
		label: "Corretora de Treino",
		role: "broker",
		factionId: "training-merchant-league",
		tier: 1,
		mentalHp: 8,
		patience: 6,
		attitude: "skeptical",
		sourceFile: "docs/system/survival/regras-negociacao.md",
		summary:
			"NPC de treino para validar negociações comerciais, paciência social e vínculo com facção mercante.",
	},
	{
		id: "training-captain",
		label: "Capitão de Treino",
		role: "captain",
		factionId: "training-war-temple",
		tier: 1,
		mentalHp: 10,
		patience: 5,
		attitude: "neutral",
		sourceFile: "docs/system/survival/06-npcs-e-aliados.md",
		summary:
			"NPC de treino para validar liderança, moral e negociação com autoridade militar.",
	},
	{
		id: "training-informant",
		label: "Informante de Treino",
		role: "informant",
		factionId: "training-thieves-guild",
		tier: 1,
		mentalHp: 6,
		patience: 4,
		attitude: "friendly",
		sourceFile: "docs/system/survival/regras-negociacao.md",
		summary:
			"NPC de treino para validar coleta de informação, favores sociais e futuras cenas de negociação.",
	},
] as const satisfies readonly NpcRecord[];

export const NPC_IDS = NPC_CATALOG.map((npcRecord) => npcRecord.id);
