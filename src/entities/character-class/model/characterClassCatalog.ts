import type { CharacterClassRecord } from "./characterClassSchema";

export const OFFICIAL_CHARACTER_CLASSES = [
	{
		id: "vanguard",
		label: "Vanguarda",
		epithet: "A Legião de Ferro",
		sourceFile: "docs/system/survival/05-01-vanguarda.md",
		primaryAttributesText: "Físico/Resistência e Conflito.",
		baseHp: 10,
		resourceText: "Nenhum recurso adicional no Nível 1.",
		equipmentText: "Treinamento em todas as Armas, Armaduras e Escudos.",
		passiveAbilityName: "Postura de Combate",
		passiveAbilityDescription:
			"Uma vez por turno, pode realizar uma Ação de Interagir como Ação Livre, sem gastar pontos de ação.",
		initialTalentChoiceCount: 2,
		initialTalentOptionsText:
			"Golpe Esmagador; Muralha Humana; Grito de Desafio; Segundo Fôlego; Investida de Escudo; Quebra-Hordas.",
	},
	{
		id: "weaver",
		label: "Tecelão de Sombras",
		epithet: "O Arcano",
		sourceFile: "docs/system/survival/05-02-tecelao.md",
		primaryAttributesText: "Mental/Conflito e Interação.",
		baseHp: 6,
		resourceText: "+5 Energia Etérica (EE) adicional.",
		equipmentText: "Armas Simples, Sem Armadura; metal interfere no fluxo.",
		passiveAbilityName: "Visão de Éter",
		passiveAbilityDescription:
			"Enxerga auras mágicas e invisibilidade naturalmente. Pode gastar 1 EE para rerolar Teste de Conhecimento.",
		initialTalentChoiceCount: 2,
		initialTalentOptionsText:
			"Seta Etérica; Passo de Bruma; Armadura Mágica; Bola de Fogo Menor; Sono; Mãos Mágicas; Vínculo Familiar.",
	},
	{
		id: "emissary",
		label: "Emissário",
		epithet: "A Voz do Destino",
		sourceFile: "docs/system/survival/05-03-emissario.md",
		primaryAttributesText: "Social/Interação e Conflito.",
		baseHp: 8,
		resourceText: "Nenhum recurso adicional no Nível 1.",
		equipmentText: "Armas Leves, Marciais e Armaduras até Médias.",
		passiveAbilityName: "Diplomacia Armada",
		passiveAbilityDescription:
			"Pode usar o Eixo Social para rolar Iniciativa. Aliados em 3m ganham +1 em Testes de Mental + Resistência.",
		initialTalentChoiceCount: 2,
		initialTalentOptionsText:
			"Ataque Furtivo; Inspirar Coragem; Voz de Comando; Truque Sujo; Mestre dos Disfarces; Golpe Fantasma.",
	},
	{
		id: "hunter",
		label: "Caçador",
		epithet: "O Guardião Selvagem",
		sourceFile: "docs/system/survival/05-04-cacador.md",
		primaryAttributesText: "Híbrido; escolha 2 primários no nível 1.",
		baseHp: 8,
		resourceText: "Nenhum recurso adicional no Nível 1.",
		equipmentText: "Armas de Distância, Leves e Armaduras até Médias.",
		passiveAbilityName: "Predador",
		passiveAbilityDescription:
			"Rastreia em velocidade normal. Causa +2 de Dano contra Inimigos Conhecidos já enfrentados.",
		initialTalentChoiceCount: 2,
		initialTalentOptionsText:
			"Companheiro Animal; Tiro Preciso; Armadilha de Urso; Marca do Caçador; Saraivada; Cura Natural.",
	},
] as const satisfies readonly CharacterClassRecord[];

export const OFFICIAL_CHARACTER_CLASS_IDS = OFFICIAL_CHARACTER_CLASSES.map(
	(characterClass) => characterClass.id,
);
