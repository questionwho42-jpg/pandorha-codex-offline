export interface Monster {
	readonly id: string;
	readonly label: string;
	readonly description: string;
	readonly maxHitPoints: number;
	currentHitPoints: number;
	readonly armorClass: number;
	readonly level: number;
	readonly attackBonus: number;
	readonly damageDice: string; // ex: "1d6", "2d8"
	readonly damageBonus: number;
	readonly initiativeBase: number;
	readonly xpValue: number;
	role?: "brute" | "sniper" | "controller";
	position?: { x: number; y: number };
	debuffs?: string[];
	spellsCount?: number;
}

export const MONSTER_TEMPLATES: Record<
	string,
	readonly Omit<Monster, "currentHitPoints">[]
> = {
	"Bando de Goblins Saqueadores": [
		{
			id: "goblin-1",
			label: "Goblin Saqueador A",
			description: "Goblin armado com adaga enferrujada.",
			maxHitPoints: 10,
			armorClass: 11,
			level: 1,
			attackBonus: 1,
			damageDice: "1d6",
			damageBonus: 1,
			initiativeBase: 2,
			xpValue: 25,
		},
		{
			id: "goblin-2",
			label: "Goblin Saqueador B",
			description: "Goblin armado com funda.",
			maxHitPoints: 8,
			armorClass: 11,
			level: 1,
			attackBonus: 1,
			damageDice: "1d4",
			damageBonus: 1,
			initiativeBase: 2,
			xpValue: 25,
		},
		{
			id: "goblin-3",
			label: "Goblin Saqueador C",
			description: "Líder Goblin robusto.",
			maxHitPoints: 14,
			armorClass: 12,
			level: 2,
			attackBonus: 2,
			damageDice: "1d6",
			damageBonus: 2,
			initiativeBase: 3,
			xpValue: 50,
		},
	],
	"Alcateia de Lobos Famintos": [
		{
			id: "wolf-1",
			label: "Lobo Faminto A",
			description: "Predador veloz de dentes afiados.",
			maxHitPoints: 12,
			armorClass: 12,
			level: 1,
			attackBonus: 2,
			damageDice: "1d6",
			damageBonus: 1,
			initiativeBase: 4,
			xpValue: 30,
		},
		{
			id: "wolf-2",
			label: "Lobo Faminto B",
			description: "Predador veloz de dentes afiados.",
			maxHitPoints: 12,
			armorClass: 12,
			level: 1,
			attackBonus: 2,
			damageDice: "1d6",
			damageBonus: 1,
			initiativeBase: 4,
			xpValue: 30,
		},
	],
	"Ninho de Wyverns": [
		{
			id: "wyvern-1",
			label: "Wyvern Jovem",
			description: "Réptil alado com ferrão peçonhento.",
			maxHitPoints: 45,
			armorClass: 15,
			level: 4,
			attackBonus: 5,
			damageDice: "1d8",
			damageBonus: 3,
			initiativeBase: 3,
			xpValue: 150,
		},
	],
	"Basilisco das Ruínas": [
		{
			id: "basilisk-1",
			label: "Basilisco das Ruínas",
			description: "Fera petrificante e pesada.",
			maxHitPoints: 55,
			armorClass: 14,
			level: 5,
			attackBonus: 4,
			damageDice: "2d6",
			damageBonus: 2,
			initiativeBase: 1,
			xpValue: 200,
		},
	],
	"Covil de Dragão Jovem": [
		{
			id: "dragon-1",
			label: "Dragão Jovem",
			description: "Sopro de chamas e escamas de éter.",
			maxHitPoints: 95,
			armorClass: 18,
			level: 7,
			attackBonus: 8,
			damageDice: "2d8",
			damageBonus: 5,
			initiativeBase: 4,
			xpValue: 400,
		},
	],
	"Monolito da Loucura Absoluta": [
		{
			id: "monolith-1",
			label: "Fragmento do Monolito",
			description: "Projeção psíquica perturbadora.",
			maxHitPoints: 75,
			armorClass: 16,
			level: 6,
			attackBonus: 6,
			damageDice: "1d10",
			damageBonus: 4,
			initiativeBase: 2,
			xpValue: 300,
		},
	],
	"Fortaleza de Lich Adormecido": [
		{
			id: "lich-sentry-1",
			label: "Sentinela Esqueleto A",
			description: "Guerreiro esquelético eterno.",
			maxHitPoints: 20,
			armorClass: 13,
			level: 2,
			attackBonus: 3,
			damageDice: "1d6",
			damageBonus: 1,
			initiativeBase: 2,
			xpValue: 50,
		},
		{
			id: "lich-sentry-2",
			label: "Sentinela Esqueleto B",
			description: "Guerreiro esquelético eterno.",
			maxHitPoints: 20,
			armorClass: 13,
			level: 2,
			attackBonus: 3,
			damageDice: "1d6",
			damageBonus: 1,
			initiativeBase: 2,
			xpValue: 50,
		},
		{
			id: "lich-sentry-3",
			label: "Vigia Necromante",
			description: "Morto-vivo de capuz escuro.",
			maxHitPoints: 40,
			armorClass: 14,
			level: 4,
			attackBonus: 4,
			damageDice: "1d8",
			damageBonus: 2,
			initiativeBase: 3,
			xpValue: 120,
		},
	],
	"Avatares de Deuses Mortos": [
		{
			id: "avatar-1",
			label: "Eco Divino de Kael",
			description: "Projeção de pura força destrutiva.",
			maxHitPoints: 150,
			armorClass: 22,
			level: 10,
			attackBonus: 12,
			damageDice: "2d10",
			damageBonus: 8,
			initiativeBase: 6,
			xpValue: 1000,
		},
	],
	"Devorador de Mundos Menor": [
		{
			id: "devourer-1",
			label: "Engolidor do Éter",
			description: "Aberrações titânicas que comem matéria.",
			maxHitPoints: 180,
			armorClass: 20,
			level: 11,
			attackBonus: 11,
			damageDice: "3d8",
			damageBonus: 6,
			initiativeBase: 3,
			xpValue: 1200,
		},
	],
} as const;

export function instantiateMonsters(encounterName: string): Monster[] {
	const templates = MONSTER_TEMPLATES[encounterName];
	if (!templates) {
		// Retorna um alvo de treino padrão caso o encontro não seja listado
		return [
			{
				id: "default-enemy-1",
				label: encounterName,
				description: "Criatura hostil avistada no Hexágono.",
				maxHitPoints: 20,
				currentHitPoints: 20,
				armorClass: 12,
				level: 1,
				attackBonus: 2,
				damageDice: "1d6",
				damageBonus: 1,
				initiativeBase: 2,
				xpValue: 40,
			},
		];
	}

	return templates.map((t, idx) => ({
		...t,
		id: `${t.id}-${idx}`,
		currentHitPoints: t.maxHitPoints,
	}));
}
