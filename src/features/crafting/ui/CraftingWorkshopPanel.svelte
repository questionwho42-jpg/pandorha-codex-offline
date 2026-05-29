<script lang="ts">
// biome-ignore-all lint/correctness/noUnusedImports: Usados no template Svelte 5
// biome-ignore-all lint/correctness/noUnusedVariables: Usados no template Svelte 5
import { onMount } from "svelte";

import type { CharacterRecord } from "$lib/entities/character";
import {
	BaseCharacterStats,
	EncumberedStatusDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import {
	BaseCraftedEquipment,
	ReinforcedEquipmentDecorator,
	RunicEquipmentDecorator,
	SharpEquipmentDecorator,
} from "$lib/entities/equipment/domain/CraftingQualityDecorators";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";
import { RECIPES } from "../model/recipesCatalog";
import CraftedItemsList from "./CraftedItemsList.svelte";
import CraftingAnvilView from "./CraftingAnvilView.svelte";
import CraftingInventoryStatus from "./CraftingInventoryStatus.svelte";
import CraftingRecipeSelector from "./CraftingRecipeSelector.svelte";
import CraftingRollResult from "./CraftingRollResult.svelte";

interface Props {
	characters: readonly CharacterRecord[];
	initialGoldCopper?: number;
	onCraftSuccess?: (item: CharacterCraftedItemRecord) => void;
}

let props: Props = $props();
let characters = $derived(props.characters);
let initialGoldCopper = $derived(props.initialGoldCopper);

// Estado reativo da oficina (Svelte 5 Runes)
let selectedCharacterId = $state("");
let characterGoldCopper = $state(50000);
let characterMaterials = $state<Record<string, number>>({
	"metal-ore": 8,
	ironwood: 4,
	"ether-ore": 3,
});

let selectedRecipeId = $state(RECIPES[0].id);
let artificeTalentBonus = $state(2); // Modificador de talento de Artífice
let itemBonus = $state(1); // Ferramentas superiores de bigorna
let selectedRecipe = $derived(
	RECIPES.find((r) => r.id === selectedRecipeId) || RECIPES[0],
);

// Estado de simulação de rolagens e animação
let isCrafting = $state(false);
let showSpark = $state(false);
let lastRollResult = $state<{
	success: boolean;
	degree: "criticalSuccess" | "success" | "successWithCost" | "failure";
	naturalRoll: number;
	totalRoll: number;
	dc: number;
	modifier: number;
	message: string;
	details: string;
	itemCreated?: {
		label: string;
		isSharp: boolean;
		isReinforced: boolean;
		isRunic: boolean;
		slots: number;
		damageBonus: number;
		runeSlots: number;
	};
} | null>(null);

let craftedItemsList = $state<CharacterCraftedItemRecord[]>([]);

// Sincronizar propriedades de entrada
$effect(() => {
	if (initialGoldCopper !== undefined) {
		characterGoldCopper = initialGoldCopper;
	}
});

$effect(() => {
	if (characters && characters.length > 0 && !selectedCharacterId) {
		selectedCharacterId = characters[0].id;
	}
});

// Carregar itens salvos anteriormente da sessão (LocalStorage) para persistência amigável
onMount(() => {
	const stored = localStorage.getItem("pandorha_crafted_items");
	if (stored) {
		try {
			craftedItemsList = JSON.parse(stored);
		} catch (e) {
			console.error("Erro ao carregar itens da forja", e);
		}
	}
});

function saveItemsToStorage(list: CharacterCraftedItemRecord[]) {
	localStorage.setItem("pandorha_crafted_items", JSON.stringify(list));
	if (typeof window !== "undefined") {
		window.dispatchEvent(new CustomEvent("pandorha:crafted-items-changed"));
	}
}

// Encontra as estatísticas de um personagem da sessão
let activeCharacter = $derived(
	characters.find((c) => c.id === selectedCharacterId),
);
let characterName = $derived(activeCharacter?.name || "Artífice Viajante");
let characterLevel = $derived(activeCharacter?.level || 2);
let mentalAptitude = $derived(activeCharacter ? 3 : 2); // Simula aptidão mental base do personagem selecionado

// Simulação de personagem com estatísticas de RPG integradas para Decorators de Carga
let activeCharacterRecord = $derived(
	activeCharacter || {
		id: "manual-artisan",
		name: "Artífice Viajante",
		concept: "Guerreiro",
		ancestryId: "human", // Humano por padrão
		classId: "vanguard",
		backgroundId: "solitary",
		level: characterLevel,
		physical: 2, // Físico de treino
		mental: mentalAptitude,
		social: 1,
		conflict: 1,
		interaction: 1,
		resistance: 1, // Resistência de treino
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	},
);

// Estatísticas base do herói
let baseStats = $derived(
	new BaseCharacterStats(activeCharacterRecord, { id: "vanguard", baseHp: 10 }),
);

// Peso equipado derivado de todos os itens ativos deste personagem no acervo
let equippedWeight = $derived.by(() => {
	let total = 0;
	for (const item of craftedItemsList) {
		if (item.characterId === selectedCharacterId && item.isEquipped === 1) {
			const eq = OFFICIAL_EQUIPMENT.find((e) => e.id === item.equipmentId);
			let cost = eq ? eq.slotCost : 1;
			// Se o item é reforçado, o decorator reduz o custo de peso em 1 slot (mínimo de 1)
			if (item.isReinforced === 1) {
				cost = Math.max(1, cost - 1);
			}
			total += cost;
		}
	}
	return total;
});

let finalStats = $derived(
	new EncumberedStatusDecorator(baseStats, equippedWeight),
);

let characterItems = $derived(
	craftedItemsList.filter((item) => item.characterId === selectedCharacterId),
);

function toggleEquipItem(id: string) {
	craftedItemsList = craftedItemsList.map((item) => {
		if (item.id === id) {
			const nextStatus = item.isEquipped === 1 ? 0 : 1;
			return { ...item, isEquipped: nextStatus };
		}
		return item;
	});
	saveItemsToStorage(craftedItemsList);
}

function getFinalSlotCost(item: CharacterCraftedItemRecord): number {
	const eq = OFFICIAL_EQUIPMENT.find((e) => e.id === item.equipmentId);
	let baseCost = eq ? eq.slotCost : 1;
	if (item.isReinforced === 1) {
		baseCost = Math.max(1, baseCost - 1);
	}
	return baseCost;
}

// Parse dos materiais exigidos pela receita atual
let requiredMaterials = $derived(
	JSON.parse(selectedRecipe.materialsRequiredJson) as Array<{
		materialId: string;
		quantity: number;
	}>,
);

// Verifica se possui todos os recursos
let hasEnoughResources = $derived.by(() => {
	if (characterGoldCopper < selectedRecipe.copperCost) return false;
	for (const req of requiredMaterials) {
		const owned = characterMaterials[req.materialId] || 0;
		if (owned < req.quantity) return false;
	}
	return true;
});

function getSecureRandom(): number {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / 4294967296;
}

// Ação de Forja Ativa
async function triggerCraft() {
	if (!hasEnoughResources || isCrafting) return;

	isCrafting = true;
	lastRollResult = null;

	// Efeito visual de martelo batendo na bigorna: disparar faíscas em tempos sincronizados
	setTimeout(() => {
		showSpark = true;
	}, 400);
	setTimeout(() => {
		showSpark = false;
	}, 800);
	setTimeout(() => {
		showSpark = true;
	}, 1200);
	setTimeout(() => {
		showSpark = false;
	}, 1500);

	// Aguardar a conclusão da animação física da bigorna
	await new Promise((resolve) => setTimeout(resolve, 2000));

	isCrafting = false;

	// Executa a rolagem de d20
	const naturalRoll = Math.floor(getSecureRandom() * 20) + 1;
	const modifier =
		characterLevel + mentalAptitude + artificeTalentBonus + itemBonus;
	const totalRoll = naturalRoll + modifier;
	const dc = selectedRecipe.difficultyClass;

	let degree: "criticalSuccess" | "success" | "successWithCost" | "failure" =
		"failure";
	let success = false;

	// Regras oficiais do Pandorha Engine
	if (naturalRoll === 20 || (naturalRoll >= 10 && totalRoll >= dc + 10)) {
		degree = "criticalSuccess";
		success = true;
	} else if (totalRoll >= dc) {
		degree = "success";
		success = true;
	} else if (totalRoll >= dc - 2) {
		degree = "successWithCost";
		success = true;
	} else {
		degree = "failure";
		success = false;
	}

	// Consumir recursos de acordo com a margem do teste
	let copperSpent = 0;
	const matsSpent: Record<string, number> = {};

	if (success) {
		// Sucesso consome taxa total de ouro e todos os materiais requeridos
		copperSpent = selectedRecipe.copperCost;
		characterGoldCopper -= copperSpent;

		for (const req of requiredMaterials) {
			matsSpent[req.materialId] = req.quantity;
			characterMaterials[req.materialId] -= req.quantity;
		}
	} else {
		// Falha: Não cobra taxa de ouro da bigorna, e destrói apenas 50% dos materiais requeridos
		for (const req of requiredMaterials) {
			const quantityLost = Math.ceil(req.quantity / 2);
			matsSpent[req.materialId] = quantityLost;
			characterMaterials[req.materialId] -= quantityLost;
		}
	}

	// Se obteve sucesso, criar o item base e aplicar os Decorators de qualidade
	let finalLabel = "";
	let isSharp = false;
	let isReinforced = false;
	let isRunic = false;
	let durabilityCurrent = 100;

	// biome-ignore lint/suspicious/noExplicitAny: dynamic template object
	let itemCreatedDetails: any = null;

	if (success) {
		const baseEquipment = OFFICIAL_EQUIPMENT.find(
			(e) => e.id === selectedRecipe.targetEquipmentId,
		);
		if (baseEquipment) {
			// 1. Instanciar o Componente Concreto do Decorator (Base)
			let decorated = new BaseCraftedEquipment({
				id: `crafted-${baseEquipment.id}-${Date.now()}`,
				label: baseEquipment.label,
				kind: baseEquipment.kind,
				slotCost: baseEquipment.slotCost,
				priceCopper: baseEquipment.priceCopper,
				durabilityCurrent: 100,
				durabilityMax: 100,
				mechanicalSummary: baseEquipment.mechanicalSummary,
				runeSlots: baseEquipment.runeSlots,
			});

			// 2. Embrulhar (Wrap) dinamicamente nos Decoradores Concretos baseando-se no grau de sucesso
			// Aqui é demonstrado o padrão DECORATOR em sua essência: envolvemos recursivamente o objeto base
			if (degree === "criticalSuccess") {
				// Sucesso Crítico adiciona TODOS os 3 decoradores
				decorated = new SharpEquipmentDecorator(
					new ReinforcedEquipmentDecorator(
						new RunicEquipmentDecorator(decorated),
					),
				);
				isSharp = true;
				isReinforced = true;
				isRunic = true;
				finalLabel = `${baseEquipment.label} Afiada Reforçado Rúnica`;
			} else if (degree === "success") {
				// Sucesso normal: 50% de chance de adicionar 1 modificador aleatorio
				const rand = getSecureRandom();
				if (rand < 0.33) {
					decorated = new SharpEquipmentDecorator(decorated);
					isSharp = true;
					finalLabel = `${baseEquipment.label} Afiada`;
				} else if (rand < 0.66) {
					decorated = new ReinforcedEquipmentDecorator(decorated);
					isReinforced = true;
					finalLabel = `${baseEquipment.label} Reforçada`;
				} else {
					decorated = new RunicEquipmentDecorator(decorated);
					isRunic = true;
					finalLabel = `${baseEquipment.label} Rúnica`;
				}
			}

			// Se for Sucesso com Custo, durabilidade inicial é reduzida pela metade
			if (degree === "successWithCost") {
				durabilityCurrent = 50;
				finalLabel = `${baseEquipment.label} (Instável)`;
			}

			// Obter as propriedades físicas/místicas finais do Decorator composto
			itemCreatedDetails = {
				label: finalLabel,
				isSharp,
				isReinforced,
				isRunic,
				slots: decorated.getSlotCost(),
				damageBonus: decorated.getDamageBonus(),
				runeSlots: decorated.getRuneSlotsCount(),
			};

			// Salvar o novo item na lista persistida
			const recordItem: CharacterCraftedItemRecord = {
				id: decorated.id,
				characterId: selectedCharacterId,
				equipmentId: baseEquipment.id,
				label: finalLabel,
				isSharp: isSharp ? 1 : 0,
				isReinforced: isReinforced ? 1 : 0,
				isRunic: isRunic ? 1 : 0,
				isEquipped: 0,
				durabilityCurrent,
				durabilityMax: 100,
				createdAt: new Date().toISOString(),
			};

			craftedItemsList = [recordItem, ...craftedItemsList];
			saveItemsToStorage(craftedItemsList);

			if (props.onCraftSuccess) {
				props.onCraftSuccess(recordItem);
			}
		}
	}

	// Monta as mensagens didáticas em Português (Modo Professor)
	let message = "";
	let details = "";

	if (degree === "criticalSuccess") {
		message = "🔥 SUCESSO CRÍTICO EXTREMO! A obra de um Mestre!";
		details = `O d20 rolou um ${naturalRoll} natural com total de ${totalRoll} contra CD ${dc}! Você entrou em perfeita harmonia mental e física com a liga de ferro-árvore. O item foi forjado com as três qualidades supremas combinadas: Afiado (+1 Dano / +2 Margem Crítica), Reforçado (reduz 1 slot de peso) e Rúnica (adiciona 1 slot extra de Runa)!`;
	} else if (degree === "success") {
		message = "🔨 SUCESSO! O ferro obedece ao seu comando.";
		details = `Você rolou ${naturalRoll} natural (Total: ${totalRoll} vs CD ${dc}). A têmpera do aço foi ideal, consumindo os materiais com precisão de manual e criando uma peça de excelente equilíbrio no mercado de Pandorha.`;
	} else if (degree === "successWithCost") {
		message =
			"⚠️ SUCESSO COM CUSTO! A peça foi forjada, mas com falhas estruturais.";
		details = `Sua rolagem total de ${totalRoll} ficou levemente abaixo da CD ${dc} (por margem de -1/-2), mas por pura tenacidade você concluiu a forja! No entanto, o item saiu instável com apenas 50% de sua durabilidade máxima.`;
	} else {
		message = "💀 FALHA! O minério trincou na água fria da têmpera.";
		details = `Você rolou ${naturalRoll} natural (Total: ${totalRoll} vs CD ${dc}). A liga metálica superaqueceu, destruindo metade dos materiais aplicados (arredondado para cima). Felizmente, você recuperou sua taxa de ouro da bigorna de Pandorha.`;
	}

	lastRollResult = {
		success,
		degree,
		naturalRoll,
		totalRoll,
		dc,
		modifier,
		message,
		details,
		itemCreated: itemCreatedDetails,
	};
}

function deleteItem(id: string) {
	craftedItemsList = craftedItemsList.filter((item) => item.id !== id);
	saveItemsToStorage(craftedItemsList);
}
</script>

<div class="crafting-panel bg-void text-bone rounded-lg border border-bronze/35 p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
	
	<!-- Luz de fundo pulsante da fornalha mística -->
	<div class="absolute top-0 right-0 w-80 h-80 rounded-full bg-ether/5 filter blur-[80px] pointer-events-none"></div>
	
	<!-- Título Principal da Feature -->
	<div class="border-b border-bronze/20 pb-4 z-10">
		<h2 class="text-xl font-bold uppercase tracking-wider text-ether flex items-center gap-2">
			<span>⚒️</span> Oficina e Bigorna do Artífice
		</h2>
		<p class="text-xs text-bone/60 italic mt-1 leading-relaxed">
			Modifique propriedades físicas e místicas de suas armas e armaduras combinando Minério de Ferro e Ferro-Árvore sob o padrão <strong class="text-ether">Decorator</strong>.
		</p>
	</div>

	<!-- Componente Filho de Seleção de Receitas e Ajuste de Recursos -->
	<CraftingRecipeSelector
		{characters}
		bind:selectedCharacterId
		bind:selectedRecipeId
		recipes={RECIPES}
		{characterLevel}
		{mentalAptitude}
		bind:artificeTalentBonus
		bind:itemBonus
		bind:characterGoldCopper
		bind:characterMaterials
	/>

	<!-- Inventário Tático & Capacidade de Carga (Decoradores e Carga) -->
	<CraftingInventoryStatus
		{equippedWeight}
		{finalStats}
		{activeCharacterRecord}
	/>

	<!-- Bigorna Física Interativa (Componente Filho) -->
	<CraftingAnvilView 
		{isCrafting} 
		{showSpark} 
		{hasEnoughResources} 
		triggerCraft={triggerCraft} 
	/>

	<!-- Resultado da Rolagem RPG (Componente Filho) -->
	<CraftingRollResult {lastRollResult} {characterName} />

	<!-- Lista de Itens Forjados (Componente Filho) -->
	<CraftedItemsList 
		{characterItems} 
		{characterName} 
		{getFinalSlotCost} 
		toggleEquipItem={toggleEquipItem} 
		deleteItem={deleteItem} 
	/>
</div>
