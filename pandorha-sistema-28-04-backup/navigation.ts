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
		id: "exploration",
		label: "Exploração",
		heading: "Exploração",
		description:
			"O mapa de treino permite mover o grupo entre hexes adjacentes.",
	},
	{
		id: "magic",
		label: "Magia",
		heading: "Magia",
		description:
			"A conjuraÃ§Ã£o de treino prepara comandos sem executar efeitos.",
	},
	{
		id: "combat",
		label: "Combate",
		heading: "Combate",
		description:
			"O primeiro encontro de treino permite testar ataque, dano e log.",
	},
	{
		id: "social",
		label: "Social",
		heading: "Combate Social",
		description: "Interações e negociações sociais.",
	},
	{
		id: "clocks",
		label: "Relógios",
		heading: "Relógios de Progresso",
		description: "Mecânica de acompanhamento de eventos estendidos.",
	},
	{
		id: "camp",
		label: "Acampamento",
		heading: "Descanso Ativo",
		description: "Gestão de tempo, vigília e recuperação do grupo.",
	},
	{
		id: "crafting",
		label: "Oficina e Forja",
		heading: "Forja Tática",
		description:
			"Forja de itens base e decorações de qualidade (Afiado, Reforçado, Rúnico).",
	},
	{
		id: "bastion",
		label: "Bastião",
		heading: "Bastião e Recesso",
		description: "Gestão física de base de operações e projetos de downtime.",
	},
	{
		id: "saves",
		label: "Saves",
		heading: "Gerenciador de Saves",
		description:
			"Exportação e importação física de snapshots de jogo em formato JSON local.",
	},
	{
		id: "dialogue",
		label: "Diálogos",
		heading: "Diálogos e Investigação",
		description:
			"Conduza investigações, interrogue NPCs e desvende pistas consumindo seu Esforço Extra.",
	},
] as const;

export type AppNavigationId = (typeof APP_NAVIGATION_ITEMS)[number]["id"];

export function getAppNavigationItem(id: AppNavigationId) {
	return (
		APP_NAVIGATION_ITEMS.find((item) => item.id === id) ??
		APP_NAVIGATION_ITEMS[0]
	);
}
