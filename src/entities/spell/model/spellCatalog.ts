import type { SpellRecord } from "./spellSchema";

const CIRCLE_ZERO = 0;
const CANTRIP_ETHER_COST = 0;
const CIRCLE_ZERO_SOURCE = "docs/system/magic/12-02-grimorio-circulo-0.md";

export const OFFICIAL_SPELLS = [
	{
		id: "light",
		label: "Luz",
		circle: CIRCLE_ZERO,
		etherCost: CANTRIP_ETHER_COST,
		school: "evocation",
		castingKind: "instant",
		components: ["V", "M"],
		requiresAttackRoll: false,
		requiresSavingThrow: false,
		damageText: null,
		tags: ["utility", "light", "object"],
		sourceFile: CIRCLE_ZERO_SOURCE,
		summary: "Um objeto tocado emite luz plena em 6m e luz fraca por mais 6m.",
	},
	{
		id: "mending",
		label: "Consertar",
		circle: CIRCLE_ZERO,
		etherCost: CANTRIP_ETHER_COST,
		school: "transmutation",
		castingKind: "instant",
		components: ["V", "S", "M"],
		requiresAttackRoll: false,
		requiresSavingThrow: false,
		damageText: null,
		tags: ["utility", "repair", "touch"],
		sourceFile: CIRCLE_ZERO_SOURCE,
		summary:
			"Repara uma quebra ou fissura pequena em um objeto tocado, sem mecanizar durabilidade.",
	},
	{
		id: "mage-hand",
		label: "Mãos Mágicas",
		circle: CIRCLE_ZERO,
		etherCost: CANTRIP_ETHER_COST,
		school: "conjuration",
		castingKind: "instant",
		components: ["V", "S"],
		requiresAttackRoll: false,
		requiresSavingThrow: false,
		damageText: null,
		tags: ["utility", "manipulation", "spectral-hand"],
		sourceFile: CIRCLE_ZERO_SOURCE,
		summary:
			"Cria uma mão espectral para manipular objetos simples sem atacar.",
	},
	{
		id: "etheric-dart",
		label: "Seta Etérica",
		circle: CIRCLE_ZERO,
		etherCost: CANTRIP_ETHER_COST,
		school: "evocation",
		castingKind: "instant",
		components: ["V", "S"],
		requiresAttackRoll: false,
		requiresSavingThrow: false,
		damageText: "1d4+1 de dano de Energia",
		tags: ["damage", "energy", "auto-hit", "single-target"],
		sourceFile: CIRCLE_ZERO_SOURCE,
		summary:
			"Cria um dardo de energia que acerta automaticamente uma criatura escolhida.",
	},
	{
		id: "ray-of-frost",
		label: "Raio de Gelo",
		circle: CIRCLE_ZERO,
		etherCost: CANTRIP_ETHER_COST,
		school: "evocation",
		castingKind: "instant",
		components: ["V", "S"],
		requiresAttackRoll: true,
		requiresSavingThrow: false,
		damageText: "1d8 de dano de Frio",
		tags: ["damage", "cold", "spell-attack", "single-target"],
		sourceFile: CIRCLE_ZERO_SOURCE,
		summary:
			"Dispara um raio frio que usa ataque mágico à distância e reduz deslocamento ao acertar.",
	},
	{
		id: "sacred-flame",
		label: "Chama Sagrada",
		circle: CIRCLE_ZERO,
		etherCost: CANTRIP_ETHER_COST,
		school: "evocation",
		castingKind: "instant",
		components: ["V", "S"],
		requiresAttackRoll: false,
		requiresSavingThrow: true,
		damageText: "1d8 de dano Radiante",
		tags: ["damage", "radiant", "saving-throw", "single-target"],
		sourceFile: CIRCLE_ZERO_SOURCE,
		summary:
			"Chamas radiantes exigem teste de resistência do alvo contra a CD de Magia.",
	},
] satisfies readonly SpellRecord[];

export const OFFICIAL_SPELL_IDS = OFFICIAL_SPELLS.map((spell) => spell.id);
