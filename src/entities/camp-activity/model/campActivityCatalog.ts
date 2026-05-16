import type { CampActivityRecord } from "./campActivitySchema";

const SOURCE_FILE =
	"docs/system/survival/28-codex-acampamento-descanso-ativo.md";

export const CAMP_ACTIVITY_CATALOG = [
	{
		id: "watch",
		label: "Vigília",
		summary:
			"Mantém cobertura mínima do acampamento enquanto o grupo executa ações.",
		sourceFile: SOURCE_FILE,
		isCollective: false,
		createsClock: false,
	},
	{
		id: "repair-equipment",
		label: "Reparar equipamento",
		summary:
			"Usa kit de ferreiro para remover a condição Quebrado ou restaurar durabilidade.",
		sourceFile: SOURCE_FILE,
		isCollective: false,
		createsClock: false,
	},
	{
		id: "cook-meal",
		label: "Cozinhar refeição",
		summary: "Recupera recursos adicionais ou remove exaustão do grupo.",
		sourceFile: SOURCE_FILE,
		isCollective: false,
		createsClock: false,
	},
	{
		id: "fortify-perimeter",
		label: "Fortificar perímetro",
		summary: "Cria barricadas por meio de um relógio coletivo de 4 sucessos.",
		sourceFile: SOURCE_FILE,
		isCollective: true,
		createsClock: true,
	},
] as const satisfies readonly CampActivityRecord[];
