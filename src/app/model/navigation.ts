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
		id: "negotiation",
		label: "Negociação",
		heading: "Negociação & Reciclagem",
		description: "Sistema Avançado de Negociação e Economia de Quebra.",
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
		id: "domain_council",
		label: "Conselho",
		heading: "Conselho Regional",
		description: "Governança regional e evolução de matrizes de influência.",
	},
	{
		id: "crafting",
		label: "Oficina e Forja",
		heading: "Forja Tática",
		description:
			"Forja de itens base e decorações de qualidade (Afiado, Reforçado, Rúnico).",
	},
	{
		id: "traps",
		label: "Armadilhas",
		heading: "Códice de Armadilhas",
		description:
			"Fabricação e instalação de armadilhas táticas no hexcrawl regional.",
	},
	{
		id: "bastion",
		label: "Bastião",
		heading: "Bastião e Recesso",
		description: "Gestão física de base de operações e projetos de downtime.",
	},
	{
		id: "quests",
		label: "Missões",
		heading: "Diário de Missões e Rumores",
		description: "Acompanhe seus objetivos e boatos narrativos na crônica.",
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
	{
		id: "investigation",
		label: "Investigação",
		heading: "Sistema de Investigação e Descoberta",
		description:
			"Pesquise sobre monstros de Pandorha e acumule Tokens de Insight para manobras táticas em combate e narrativa.",
	},
	{
		id: "mercenary",
		label: "Mercenários",
		heading: "Guarnição Mercenária",
		description: "Gestão de companhias mercenárias, peões e missões táticas.",
	},
	{
		id: "espionage",
		label: "Espionagem",
		heading: "Teia de Espionagem",
		description: "Células de informantes e operações de downtime táticas.",
	},
	{
		id: "research",
		label: "Pesquisa",
		heading: "Pesquisa e Criptografia Rúnica",
		description:
			"Decifre inscrições de lore e monolitos antigos com suporte a Investigação Extrema e tradução instantânea.",
	},
	{
		id: "retrain",
		label: "Retreino",
		heading: "Retreino & Recondicionamento",
		description:
			"Altere talentos e manobras nos interlúdios ao custo de ouro e tempo de downtime.",
	},
	{
		id: "dungeon",
		label: "Masmorra",
		heading: "Geração Procedural de Masmorras",
		description:
			"Explore e desbrave masmorras biomecânicas geradas proceduralmente a partir de sementes determinísticas.",
	},
] as const;

export type AppNavigationId = (typeof APP_NAVIGATION_ITEMS)[number]["id"];

export function getAppNavigationItem(id: AppNavigationId) {
	return (
		APP_NAVIGATION_ITEMS.find((item) => item.id === id) ??
		APP_NAVIGATION_ITEMS[0]
	);
}
