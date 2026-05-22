import type { CraftingRecipeRecord } from "$lib/entities/equipment/model/craftingSchema";

// Catálogo de receitas locais para a demonstração didática da oficina
export const RECIPES: CraftingRecipeRecord[] = [
	{
		id: "recipe-longsword",
		label: "Espada Longa de Ferro-Árvore",
		targetEquipmentId: "longsword",
		difficultyClass: 13,
		copperCost: 500,
		materialsRequiredJson: JSON.stringify([
			{ materialId: "metal-ore", quantity: 3 },
			{ materialId: "ironwood", quantity: 1 },
		]),
	},
	{
		id: "recipe-dagger",
		label: "Adaga Éter-Afiada",
		targetEquipmentId: "dagger",
		difficultyClass: 11,
		copperCost: 300,
		materialsRequiredJson: JSON.stringify([
			{ materialId: "ether-ore", quantity: 2 },
		]),
	},
	{
		id: "recipe-plate-armor",
		label: "Couraça de Placas Reforçada",
		targetEquipmentId: "plate-armor",
		difficultyClass: 15,
		copperCost: 1500,
		materialsRequiredJson: JSON.stringify([
			{ materialId: "metal-ore", quantity: 6 },
			{ materialId: "ironwood", quantity: 2 },
		]),
	},
	{
		id: "recipe-round-shield",
		label: "Escudo Redondo Leve",
		targetEquipmentId: "round-shield",
		difficultyClass: 10,
		copperCost: 200,
		materialsRequiredJson: JSON.stringify([
			{ materialId: "metal-ore", quantity: 2 },
			{ materialId: "ironwood", quantity: 1 },
		]),
	},
];
