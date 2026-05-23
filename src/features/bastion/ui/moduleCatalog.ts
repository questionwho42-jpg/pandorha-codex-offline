export interface CatalogItem {
	id: string;
	name: string;
	tier: number;
	cost: number;
	dc: number;
	desc: string;
}

export const moduleCatalog: CatalogItem[] = [
	{
		id: "horta_alquimia",
		name: "Horta de Alquimia",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "Gera essências alquímicas a cada recesso.",
	},
	{
		id: "ferraria_reparo",
		name: "Ferraria de Reparo",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "Corta os custos de reparos pela metade.",
	},
	{
		id: "dormitorio_comum",
		name: "Dormitório Comum",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "Aumenta limite de Especialistas contratados.",
	},
	{
		id: "cofre_reforcado",
		name: "Cofre Reforçado",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "+1.000 PO de limite seguro no cofre.",
	},
	{
		id: "muralha_madeira",
		name: "Muralha de Madeira",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "+2 de Estrutura para a base.",
	},
	{
		id: "posto_vigia",
		name: "Posto de Vigia",
		tier: 1,
		cost: 500,
		dc: 15,
		desc: "+2 de Vigilância para a base.",
	},
	{
		id: "muralha_pedra",
		name: "Muralha de Pedra",
		tier: 2,
		cost: 1500,
		dc: 20,
		desc: "+4 de Estrutura (Exige troféu T2).",
	},
	{
		id: "laboratorio_destilacao",
		name: "Laboratório de Destilação",
		tier: 2,
		cost: 1500,
		dc: 20,
		desc: "+2 em testes de alquimia.",
	},
	{
		id: "cofre_dimensional",
		name: "Cofre Dimensional (Menor)",
		tier: 3,
		cost: 5000,
		dc: 25,
		desc: "Riqueza não gera Ameaça até 10.000 PO.",
	},
	{
		id: "muralha_runica",
		name: "Muralha Rúnica Absoluta",
		tier: 4,
		cost: 20000,
		dc: 30,
		desc: "+10 de Estrutura e imunidade mágica.",
	},
];
