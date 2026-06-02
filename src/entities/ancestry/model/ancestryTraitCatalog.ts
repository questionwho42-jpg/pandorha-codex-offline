import type {
	AncestryId,
	AncestryTraitLinkRecord,
	AncestryTraitRecord,
} from "./ancestrySchema";

type OfficialAncestryTraitEntry = AncestryTraitRecord & {
	readonly ancestryId: AncestryId;
};

const OFFICIAL_ANCESTRY_TRAIT_ENTRIES = [
	{
		ancestryId: "human",
		id: "human-diligencia-erudita",
		label: "Diligência Erudita",
		description:
			"Ganha +2 em qualquer Teste Global cuja soma de bônus fixos (Nível + Eixo + Aplicação) já seja 10 ou superior.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-lingua-de-prata",
		label: "Língua de Prata",
		description:
			"Pode ganhar vantagem em um Teste Global de Social + Interação + Nível um número de vezes igual ao seu Eixo Social por Descanso Longo.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-vontade-indomavel",
		label: "Vontade Indomável",
		description:
			"Quando seu HP chega a 0 pela primeira vez na cena, você pode gastar sua Reação para estabilizar automaticamente sem precisar rolar dados.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-maestria-improvisada",
		label: "Maestria Improvisada",
		description:
			"Você ignora a penalidade de -4 por usar ferramentas ou armas que não possua treinamento.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-memoria-de-mercador",
		label: "Memória de Mercador",
		description:
			"+2 em Testes Globais de Mental + Interação + Nível para lembrar fatos históricos ou avaliar itens.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-imunidade-adaptativa",
		label: "Imunidade Adaptativa",
		description:
			"Imune a Doenças Comuns e ganha +2 de Resistência contra Toxinas Mágicas.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-sorte-do-novato",
		label: "Sorte do Novato",
		description:
			"Uma vez por sessão, pode rolar novamente um teste de Social + Interação que tenha resultado em uma Falha Crítica.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-artifice-de-ferro",
		label: "Artífice de Ferro",
		description:
			"O tempo necessário para construir, consertar ou modificar itens mundanos é reduzido pela metade.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-foco-cooperativo",
		label: "Foco Cooperativo",
		description:
			"Aliados em um raio de 1,5m de você ganham +1 de bônus em testes de Resistência Mental.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "human",
		id: "human-pensamento-estrategico",
		label: "Pensamento Estratégico",
		description:
			"Gaste 1 Ação de Interagir para observar um inimigo; seu próximo ataque contra ele ganha +2 de bônus no dado.",
		sourceFile: "docs/system/survival/01-01-humanos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-visao-estelar",
		label: "Visão Estelar",
		description:
			"Você ignora penalidades de baixa luminosidade (Penumbra), enxergando perfeitamente sombras.",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-passo-de-folha",
		label: "Passo de Folha",
		description:
			"Sem penalidade de movimento em terrenos difíceis de origem natural (florestas, neve).",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-memoria-arcaica",
		label: "Memória Arcaica",
		description:
			"+2 em Testes Globais de Mental + Interação + Nível sobre eventos de mais de 500 anos atrás.",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-agilidade-elfica",
		label: "Agilidade Élfica",
		description: "Sua velocidade base aumenta em 1,5 metros (total de 10,5m).",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-mente-de-cristal",
		label: "Mente de Cristal",
		description: "Ganha +2 de Resistência contra a condição 'Confuso'.",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-arquearia-tradicional",
		label: "Arquearia Tradicional",
		description:
			"O alcance de qualquer arma de distância empunhada por você (Arco, Besta) aumenta em 6 metros.",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-transe-profundo",
		label: "Transe Profundo",
		description:
			"Um transe de 4 horas fornece todos os benefícios de um Descanso Longo humano de 8 horas.",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-dominio-animal",
		label: "Domínio Animal",
		description:
			"Pode tentar comandar uma criatura natural de nível inferior ao seu (Teste Global de Social + Interação).",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-reflexos-celere",
		label: "Reflexos Célere",
		description: "Ganha +1 permanentemente em sua Iniciativa.",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "elf",
		id: "elf-ressonancia-elemental",
		label: "Ressonância Elemental",
		description:
			"Ganha RD 2 (Redução de Dano) contra um elemento escolhido (Fogo, Gelo ou Raio).",
		sourceFile: "docs/system/survival/01-02-elfos.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-folego-da-profundeza",
		label: "Fôlego da Profundeza",
		description:
			"Pode segurar o fôlego por três vezes o tempo normal de um humano.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-sentido-de-minerio",
		label: "Sentido de Minério",
		description:
			"Sente metais ou pedras raras a até 18 metros através de rocha sólida.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-inimizade-ancestral",
		label: "Inimizade Ancestral",
		description:
			"Ganha +2 de bônus no dano contra criaturas das Famílias Orc ou Goblin.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-couraca-biologica",
		label: "Couraça Biológica",
		description:
			"Pele dura concede +2 de Resistência em testes contra Venenos e Doenças naturais.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-estreito-de-armadura",
		label: "Estreito de Armadura",
		description:
			"A penalidade de velocidade de armaduras pesadas é reduzida em 1,5m.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-bussola-interna",
		label: "Bússola Interna",
		description:
			"Em ambientes subterrâneos, sempre sabe onde é o Norte e nunca se perde (Sucesso Automático).",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-ruptura-de-rocha",
		label: "Ruptura de Rocha",
		description:
			"Margem de Sucesso Crítico em testes de Físico + Conflito é reduzida em 1 (crita com 19 ou 20).",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-mule-do-abismo",
		label: "Mule do Abismo",
		description: "Ganha +2 Slots extras em seu inventário de carga pesada.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-barganha-mercantil",
		label: "Barganha Mercantil",
		description:
			"+1 em Testes Globais de Social + Interação para barganhar preços.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "dwarf",
		id: "dwarf-vontade-de-rocha",
		label: "Vontade de Rocha",
		description:
			"Mente sólida concede +4 de bônus contra magias de controle mental.",
		sourceFile: "docs/system/survival/01-03-anoes.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-escamas-de-guerra",
		label: "Escamas de Guerra",
		description: "Se sem armadura, CA = 11 + Nível + Físico + Resistência.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-rugido-aterrorizante",
		label: "Rugido Aterrorizante",
		description:
			"Gaste 1 ação; inimigos em 3m devem passar em Teste de Mental + Resistência ou ficam 'Abalados'.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-honra-de-sangue",
		label: "Honra de Sangue",
		description: "+2 de Resistência em testes contra a condição 'Medo'.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-coracao-de-dragao",
		label: "Coração de Dragão",
		description: "Ganha +1 HP extra para cada nível global que possuir.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-garras-letais",
		label: "Garras Letais",
		description:
			"Ataques desarmados causam 1d8 de dano + Físico (Conflito), considerados armas leves.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-heranca-de-cor",
		label: "Herança de Cor",
		description: "Ganha RD 5 contra o elemento correspondente ao seu sopro.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-carga-traumatica",
		label: "Carga Traumática",
		description:
			"Ao mover 3m e acertar, empurra o alvo 1,5m. No Crítico, alvo pode cair 'Caído'.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-visao-termica",
		label: "Visão Térmica",
		description:
			"Detecta calor; ignora invisibilidade e camuflagem de seres vivos em um raio de 15m.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-misticismo-inato",
		label: "Misticismo Inato",
		description:
			"Ganha uma magia de 1º Círculo. Pode lançá-la 1x/dia sem custo de EE.",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "drakari",
		id: "drakari-golpe-de-cauda",
		label: "Golpe de Cauda",
		description:
			"Quando um inimigo tenta fugir, pode usar Reação para atacá-lo (1d4 + Físico).",
		sourceFile: "docs/system/survival/01-04-drakari.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-visao-do-vazio",
		label: "Visão do Vazio",
		description: "Enxerga perfeitamente na escuridão total, mesmo mágica.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-passo-silencioso",
		label: "Passo Silencioso",
		description:
			"Ganha +2 em Testes Globais de Furtividade (Físico + Interação).",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-toque-de-geada",
		label: "Toque de Geada",
		description:
			"Ataques desarmados podem usar Matriz Mental para o bônus de dano.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-aura-de-inquietude",
		label: "Aura de Inquietude",
		description:
			"Criaturas mundanas de nível inferior evitam contato visual e se afastam instintivamente.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-nevoa-de-protecao",
		label: "Névoa de Proteção",
		description:
			"Ganha Redução de Dano (RD) 1 contra qualquer ataque físico não-mágico.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-desvanecer",
		label: "Desvanecer",
		description: "Uma vez por cena, pode tornar-se invisível por 1 Rodada.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-elo-telepatico",
		label: "Elo Telepático",
		description:
			"Transmite pensamentos para qualquer criatura em um raio de 15m.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-resistencia-a-luz",
		label: "Resistência à Luz",
		description: "+2 de Resistência contra efeitos mágicos de Luz ou Cegueira.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-salto-de-sombra",
		label: "Salto de Sombra",
		description:
			"Ao ser atacado, pode usar Reação para se teletransportar 1,5m para uma sombra próxima.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "umbral",
		id: "umbral-memoria-genetica",
		label: "Memória Genética",
		description:
			"1x/Descanso Longo, usa uma habilidade Nível 0 como se fosse Nível 1.",
		sourceFile: "docs/system/survival/01-05-umbrais.md",
	},
	{
		ancestryId: "beast",
		id: "beast-tatica-de-matilha",
		label: "Tática de Matilha",
		description:
			"+2 de bônus no dano sempre que houver um aliado adjacente ao mesmo inimigo.",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-impulso-selvagem",
		label: "Impulso Selvagem",
		description:
			"Velocidade base de movimento aumenta em 3 metros (Total 12m).",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-resiliencia-primal",
		label: "Resiliência Primal",
		description:
			"Imune a doenças causadas por carne podre ou águas contaminadas.",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-predador-vertical",
		label: "Predador Vertical",
		description:
			"Realiza testes de Salto como parte do movimento, sem custo extra.",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-sangue-de-fera",
		label: "Sangue de Fera",
		description:
			"Ataques com garras ou dentes aplicam 'Sangrando' (1d4/turno) em caso de Sucesso Crítico.",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-couraca-de-pelagem",
		label: "Couraça de Pelagem",
		description:
			"Pelagem grossa fornece bônus permanente de +1 na Defesa (CA).",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-instinto-de-sobrevivencia",
		label: "Instinto de Sobrevivência",
		description:
			"Imunidade à condição 'Surpreendido' no primeiro turno de combate.",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-mestre-do-terreno",
		label: "Mestre do Terreno",
		description:
			"Ignora penalidade de movimento em vegetação densa ou pântanos.",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-rugido-de-comando",
		label: "Rugido de Comando",
		description:
			"Pode se comunicar e dar ordens a animais selvagens (Sucesso Automático Nv 1).",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
	{
		ancestryId: "beast",
		id: "beast-ira-de-pandorha",
		label: "Ira de Pandorha",
		description:
			"Com HP abaixo de 50%, ganha bônus de +2 em testes de Físico + Conflito.",
		sourceFile: "docs/system/survival/01-06-feras.md",
	},
] as const satisfies readonly OfficialAncestryTraitEntry[];

export const OFFICIAL_ANCESTRY_TRAITS = OFFICIAL_ANCESTRY_TRAIT_ENTRIES.map(
	(entry) => ({
		id: entry.id,
		label: entry.label,
		description: entry.description,
		sourceFile: entry.sourceFile,
	}),
) satisfies readonly AncestryTraitRecord[];

export const OFFICIAL_ANCESTRY_TRAIT_LINKS =
	OFFICIAL_ANCESTRY_TRAIT_ENTRIES.map((entry) => ({
		ancestryId: entry.ancestryId,
		traitId: entry.id,
	})) satisfies readonly AncestryTraitLinkRecord[];
