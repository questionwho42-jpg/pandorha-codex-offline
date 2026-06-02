import type { AncestryRecord } from "./ancestrySchema";

export const OFFICIAL_ANCESTRIES = [
	{
		id: "human",
		label: "Humano",
		epithet: "Os Sobreviventes de Morden",
		sourceFile: "docs/system/survival/01-01-humanos.md",
		initialBonus:
			"Escolha +1 em um Eixo (Físico, Mental ou Social) OU +1 em uma Aplicação (Interação, Conflito ou Resistência).",
		primordialAbilityName: "Mente Inquieta",
		primordialAbilityDescription:
			"Sua mente absorve conhecimento rapidamente. Você ganha +1 Talento Geral adicional no Nível 1 e pode escolher +1 Aplicação extra para aumentar em +1.",
	},
	{
		id: "elf",
		label: "Elfo",
		epithet: "Os Tecelões das Eras",
		sourceFile: "docs/system/survival/01-02-elfos.md",
		initialBonus: "Escolha +1 no Eixo Mental OU +1 na Aplicação Interação.",
		primordialAbilityName: "Sentido Etérico",
		primordialAbilityDescription:
			"Elfos percebem a presença de magia em um raio de 9m (Passiva). Eles não precisam rolar para saber que há um item ou magia ativa (DC da Fonte).",
	},
	{
		id: "dwarf",
		label: "Anão",
		epithet: "Os Guardiões da Raiz",
		sourceFile: "docs/system/survival/01-03-anoes.md",
		initialBonus: "Escolha +1 no Eixo Físico OU +1 na Aplicação Resistência.",
		primordialAbilityName: "Peso Pétreo",
		primordialAbilityDescription:
			"Devido à sua densidade, Anões são imunes a efeitos de Empurrão de criaturas ou magias cujo Nível seja menor ou igual ao seu valor de Físico (Resistência).",
	},
	{
		id: "drakari",
		label: "Drakari",
		epithet: "Os Senhores do Metal Vivo",
		sourceFile: "docs/system/survival/01-04-drakari.md",
		initialBonus: "Escolha +1 no Eixo Físico OU +1 na Aplicação Conflito.",
		primordialAbilityName: "Sopro Elemental",
		primordialAbilityDescription:
			"Exala um cone de 4,5m de energia (Fogo, Gelo ou Raio). Dano escala com Nível: 1d8 (Nv 1), 2d8 (Nv 5), 3d8 (Nv 10), 4d8 (Nv 15). Uso: 1x por Cena.",
	},
	{
		id: "umbral",
		label: "Umbral",
		epithet: "Os Andarilhos do Vazio",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
		initialBonus: "Escolha +1 no Eixo Mental OU +1 na Aplicação Interação.",
		primordialAbilityName: "Corpo de Éter",
		primordialAbilityDescription:
			"Podem atravessar frestas de até 10cm sem sofrer penalidades de movimento ou carga (exceto para itens Grandes).",
	},
	{
		id: "beast",
		label: "Fera",
		epithet: "Os Predadores do Éter",
		sourceFile: "docs/system/survival/01-06-feras.md",
		initialBonus: "Escolha +1 no Eixo Físico OU +1 na Aplicação Conflito.",
		primordialAbilityName: "Faro Aguçado",
		primordialAbilityDescription:
			"Detecta odores em um raio de 18 metros. O rastreio de inimigos feridos recebe bônus de +5 em Testes de Mental + Interação.",
	},
] as const satisfies readonly AncestryRecord[];

export const OFFICIAL_ANCESTRY_IDS = OFFICIAL_ANCESTRIES.map(
	(ancestry) => ancestry.id,
);
