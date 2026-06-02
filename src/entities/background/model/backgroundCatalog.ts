import type { BackgroundRecord } from "./backgroundSchema";

const SOURCE_FILE = "docs/system/survival/10-antecedentes-e-origens.md";

export const OFFICIAL_BACKGROUNDS = [
	{
		id: "acolyte",
		label: "Acólito",
		epithet: "O Devoto",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Abrigo da Fé",
		originAbilityDescription:
			"Você e seu grupo sempre têm hospedagem e cura gratuita em templos da sua religião.",
		talentChoiceCount: 1,
		talentOptionsText: "Ritualista Sacro; Teólogo de Combate; Voto de Pobreza.",
	},
	{
		id: "aristocrat",
		label: "Aristocrata",
		epithet: "O Nobre",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Sangue Azul",
		originAbilityDescription:
			"Pessoas comuns tendem a obedecer ordens simples sem questionar. Você tem acesso a bailes e audiências reais e começa com 1 Ponto de Favor com a nobreza de sua terra natal.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Esgrimista Clássico; Rede de Contatos; Educação Superior.",
	},
	{
		id: "guild-artisan",
		label: "Artesão de Guilda",
		epithet: "O Criador",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Olho para Valor",
		originAbilityDescription:
			"Você sabe estimar o preço exato de qualquer item e nunca é enganado por falsificações.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Forja de Guerra; Manutenção de Campo; Negociante Mestre.",
	},
	{
		id: "artist",
		label: "Artista",
		epithet: "O Bardo",
		sourceFile: SOURCE_FILE,
		originAbilityName: "A Fama Precede",
		originAbilityDescription:
			"Em qualquer taverna, você pode tocar ou atuar em troca de estadia de luxo e refeições para o grupo. Você começa com Nível 1 de Fama em sua região de origem.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Distração Fascinante; Memória Eidética; Insulto Cortante.",
	},
	{
		id: "bounty-hunter",
		label: "Caçador de Recompensas",
		epithet: "O Rastreador",
		sourceFile: SOURCE_FILE,
		originAbilityName: "O Contrato",
		originAbilityDescription:
			"Se você tiver um contrato formal para capturar alguém, recebe +2 de Bônus em todos os testes para rastrear esse alvo específico.",
		talentChoiceCount: 1,
		talentOptionsText: "Algemas Rápidas; Interrogador Urbano; Olhar da Morte.",
	},
	{
		id: "charlatan",
		label: "Charlatão",
		epithet: "O Vigarista",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Identidade Falsa",
		originAbilityDescription:
			"Você possui documentos perfeitos e um disfarce completo para uma segunda vida que ninguém consegue desmentir.",
		talentChoiceCount: 1,
		talentOptionsText: "Mãos Leves; Língua de Prata; Truque de Moeda.",
	},
	{
		id: "criminal",
		label: "Criminoso",
		epithet: "O Fora da Lei",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Contato Criminal",
		originAbilityDescription:
			"Em qualquer cidade, você sabe encontrar um receptador para vender itens roubados.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Ataque Furtivo; Arrombador; Talento sem título preservado no arquivo fonte: você não sofre penalidade para atacar.",
	},
	{
		id: "hermit",
		label: "Eremita",
		epithet: "O Isolado",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Segredo da Descoberta",
		originAbilityDescription:
			"Você carrega um segredo cósmico ou uma profecia que ninguém mais sabe; o detalhe deve ser discutido com o Mestre.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Ciência Alquímica; Metabolismo Lento; Sentido de Perigo.",
	},
	{
		id: "scholar",
		label: "Erudito",
		epithet: "O Acadêmico",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Acesso Restrito",
		originAbilityDescription:
			"Você tem credenciais para entrar em bibliotecas arcanas, arquivos reais e universidades fechadas ao público.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Engenharia Etérica; Analista Tático; Poliglota Supremo.",
	},
	{
		id: "escaped-slave",
		label: "Escravo Fugitivo",
		epithet: "O Sobrevivente",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Indomável",
		originAbilityDescription:
			"Você recebe +2 de Bônus em testes para resistir a controle mental ou medo.",
		talentChoiceCount: 1,
		talentOptionsText: "Resistência à Dor; Improvisador; Corrida Desesperada.",
	},
	{
		id: "gladiator",
		label: "Gladiador",
		epithet: "O Campeão da Arena",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Glória de Sangue",
		originAbilityDescription:
			"NPCs guerreiros e mercenários reconhecem e respeitam sua força. Você ganha +2 em interações com eles e começa com Nível 1 de Fama na cidade da arena principal.",
		talentChoiceCount: 1,
		talentOptionsText: "Exibicionista; Mestre de Armas Exóticas; Golpe Baixo.",
	},
	{
		id: "city-guard",
		label: "Guarda da Cidade",
		epithet: "A Lei",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Autoridade Legal",
		originAbilityDescription:
			"Você pode acessar cenas de crime e exigir cooperação de cidadãos comuns.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Formação de Escudos; Sentido de Investigação; Talento sem título preservado no arquivo fonte: dano não-letal sem penalidade.",
	},
	{
		id: "sailor",
		label: "Marinheiro",
		epithet: "O Lobo do Mar",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Passagem Livre",
		originAbilityDescription:
			"Você consegue transporte gratuito em qualquer navio mercante para você e seu grupo em troca de trabalho no convés.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Equilíbrio Perfeito; Talento sem título preservado no arquivo fonte: nunca se perde sob o céu aberto; Luta de Taverna.",
	},
	{
		id: "field-medic",
		label: "Médico de Campo",
		epithet: "O Curandeiro",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Triagem",
		originAbilityDescription:
			"Você sabe imediatamente quem está morrendo, quem está estável e quem está fingindo.",
		talentChoiceCount: 1,
		talentOptionsText: "Cirurgião de Combate; Anatomista; Mãos Firmes.",
	},
	{
		id: "merchant",
		label: "Mercador",
		epithet: "O Negociante",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Caravana",
		originAbilityDescription:
			"Você começa o jogo com uma carroça, um animal de carga e 50 Ouro extra.",
		talentChoiceCount: 1,
		talentOptionsText: "Avaliação Mística; Língua de Ouro; Mochileiro.",
	},
	{
		id: "nomad",
		label: "Nômade",
		epithet: "O Viajante",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Guia Regional",
		originAbilityDescription:
			"Você conhece as rotas, poços de água e abrigos seguros de qualquer região selvagem que já visitou.",
		talentChoiceCount: 1,
		talentOptionsText: "Passo Leve; Caçador-Coletor; Poliglota Selvagem.",
	},
	{
		id: "pirate",
		label: "Pirata",
		epithet: "O Saqueador",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Má Reputação",
		originAbilityDescription:
			"As pessoas têm medo de você. Você pode cometer crimes menores sem que chamem a guarda imediatamente e começa com Nível 1 de Infâmia.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Acrobacia de Cordas; Bebedor Resistente; Pólvora e Chumbo.",
	},
	{
		id: "street-rat",
		label: "Rato de Rua",
		epithet: "O Órfão",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Mapa da Cidade",
		originAbilityDescription:
			"Você conhece atalhos, telhados e esgotos da cidade, deslocando-se duas vezes mais rápido em ambiente urbano.",
		talentChoiceCount: 1,
		talentOptionsText: "Estômago de Ferro; Esconderijo Mestre; Faca na Bota.",
	},
	{
		id: "veteran-soldier",
		label: "Soldado Veterano",
		epithet: "O Guerreiro",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Patente Militar",
		originAbilityDescription:
			"Soldados da sua nação prestam continência e podem oferecer suporte logístico se solicitado.",
		talentChoiceCount: 1,
		talentOptionsText:
			"Forja de Guerra; Talento sem título preservado no arquivo fonte: dorme de armadura leve ou média sem penalidade; Tática de Cerco.",
	},
	{
		id: "seer",
		label: "Vidente",
		epithet: "O Místico",
		sourceFile: SOURCE_FILE,
		originAbilityName: "Presságio",
		originAbilityDescription:
			"Uma vez por dia, role 1d20 e anote o número. Você pode substituir uma rolagem futura sua ou de um aliado por esse número.",
		talentChoiceCount: 1,
		talentOptionsText: "Vinculação Rúnica; Leitura Fria; Sexto Sentido.",
	},
] as const satisfies readonly BackgroundRecord[];

export const OFFICIAL_BACKGROUND_IDS = OFFICIAL_BACKGROUNDS.map(
	(background) => background.id,
);
