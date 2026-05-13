export const APP_NAVIGATION_ITEMS = [
	{
		id: "home",
		label: "Início",
		heading: "Pandorha Engine",
		description:
			"O app está carregado e pronto para receber as próximas telas.",
	},
	{
		id: "characters",
		label: "Personagens",
		heading: "Personagens",
		description:
			"A listagem e a criação de personagens serão implementadas nas tarefas T07 e T08.",
	},
	{
		id: "compendium",
		label: "Compêndio",
		heading: "Compêndio",
		description:
			"A consulta de regras e lore será implementada nas tarefas T16 e T17.",
	},
	{
		id: "inventory",
		label: "Inventário",
		heading: "Inventário",
		description:
			"A carga de treino mostra itens e slots em modo somente leitura.",
	},
	{
		id: "combat",
		label: "Combate",
		heading: "Combate",
		description:
			"O primeiro encontro de treino permite testar ataque, dano e log.",
	},
] as const;

export type AppNavigationId = (typeof APP_NAVIGATION_ITEMS)[number]["id"];

export function getAppNavigationItem(id: AppNavigationId) {
	return (
		APP_NAVIGATION_ITEMS.find((item) => item.id === id) ??
		APP_NAVIGATION_ITEMS[0]
	);
}
