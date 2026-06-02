import type { CompendiumEntry } from "./compendiumSchema";

export const OFFICIAL_COMPENDIUM_ENTRIES = [
	{
		id: "character-creation-guide",
		title: "Guia de criação de ficha",
		category: "character-creation",
		summary:
			"Fluxo oficial para criar personagem, distribuir Eixos e Aplicações, escolher ancestralidade, classe, antecedente e registrar a ficha.",
		sourceFile: "docs/system/survival/guia-criacao-de-ficha.md",
		sourceLine: 20,
		searchText:
			"guia criação ficha personagem eixos aplicações ancestralidade classe antecedente traços nível 1",
		tags: ["character", "creation", "sheet"],
	},
	{
		id: "ancestry-overview",
		title: "Ancestralidades",
		category: "ancestry",
		summary:
			"Visão geral das seis ancestralidades, incluindo bônus inicial, capacidade primordial e escolha de três traços no nível 1.",
		sourceFile: "docs/system/survival/01-00-regras-gerais.md",
		sourceLine: 20,
		searchText:
			"ancestralidades humano elfo anão drakari umbral fera bônus capacidade primordial traços",
		tags: ["ancestry", "character", "traits"],
	},
	{
		id: "class-overview",
		title: "Classes",
		category: "class",
		summary:
			"Regras gerais para escolher uma classe base, registrar passiva, vida base, proficiências e talentos iniciais.",
		sourceFile: "docs/system/survival/05-00-regras-de-classe.md",
		sourceLine: 20,
		searchText:
			"classes vanguarda tecelão emissário caçador passiva vida base talentos iniciais proficiências",
		tags: ["class", "character"],
	},
	{
		id: "class-vanguard",
		title: "Vanguarda",
		category: "class",
		summary:
			"Classe marcial resistente ligada à linha de frente, armaduras, escudos e postura de combate.",
		sourceFile: "docs/system/survival/05-01-vanguarda.md",
		sourceLine: 20,
		searchText:
			"vanguarda classe marcial linha de frente armadura escudo postura de combate físico resistência conflito",
		tags: ["class", "vanguard", "combat"],
	},
	{
		id: "class-weaver",
		title: "Tecelão de Sombras",
		category: "class",
		summary:
			"Classe arcana focada em Éter, percepção mágica e efeitos sobrenaturais desde o início da ficha.",
		sourceFile: "docs/system/survival/05-02-tecelao.md",
		sourceLine: 20,
		searchText:
			"tecelão sombras classe arcana éter magia visão energia etérica mental conflito",
		tags: ["class", "weaver", "magic"],
	},
	{
		id: "class-emissary",
		title: "Emissário",
		category: "class",
		summary:
			"Classe social e tática centrada em comando, negociação, presença e apoio aos aliados.",
		sourceFile: "docs/system/survival/05-03-emissario.md",
		sourceLine: 20,
		searchText:
			"emissário classe social comando diplomacia armada aliados presença negociação interação",
		tags: ["class", "emissary", "social"],
	},
	{
		id: "class-hunter",
		title: "Caçador",
		category: "class",
		summary:
			"Classe híbrida de rastreio, sobrevivência, ataques à distância e domínio do terreno.",
		sourceFile: "docs/system/survival/05-04-cacador.md",
		sourceLine: 20,
		searchText:
			"caçador classe híbrida rastreio sobrevivência predador terreno distância companheiro animal",
		tags: ["class", "hunter", "survival"],
	},
	{
		id: "background-overview",
		title: "Antecedentes e origens",
		category: "background",
		summary:
			"Lista de antecedentes, habilidade de origem e escolha de um talento exclusivo no nível 1.",
		sourceFile: "docs/system/survival/10-antecedentes-e-origens.md",
		sourceLine: 40,
		searchText:
			"antecedentes origens acólito aristocrata artesão mercador nômade talento origem personagem",
		tags: ["background", "origin", "character"],
	},
] as const satisfies readonly CompendiumEntry[];

export const OFFICIAL_COMPENDIUM_ENTRY_IDS = OFFICIAL_COMPENDIUM_ENTRIES.map(
	(entry) => entry.id,
);
