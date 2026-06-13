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
	ElementAffinityDecorator,
	InfusedRuneDecorator,
	ReinforcedEquipmentDecorator,
	RunicEquipmentDecorator,
	SharpEquipmentDecorator,
} from "$lib/entities/equipment/domain/CraftingQualityDecorators";
import { SynergyForgeService } from "$lib/entities/equipment/domain/SynergyForgeService";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";
import { fail, ok } from "$lib/shared/lib/result";
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

// Tabs system
let activeTab = $state<"forge" | "synergy">("forge");

// Estado reativo da oficina (Svelte 5 Runes)
let selectedCharacterId = $state("");
let characterGoldCopper = $state(50000);
let characterMaterials = $state<Record<string, number>>({
	"metal-ore": 8,
	ironwood: 4,
	"ether-ore": 3,
	"mystic-essence": 3,
	rune_stone: 2,
	ancient_relic: 2,
	insight_scroll: 2,
});

let craftedItemsList = $state<CharacterCraftedItemRecord[]>([]);

let selectedRecipeId = $state(RECIPES[0].id);
let artificeTalentBonus = $state(2); // Modificador de talento de Artífice
let itemBonus = $state(1); // Ferramentas superiores de bigorna
let selectedRecipe = $derived(
	RECIPES.find((r) => r.id === selectedRecipeId) || RECIPES[0],
);

// Adaptador de Repositório Reativo Local para o SynergyForgeService na UI
const mockRepo = {
	saveRecipe: async () =>
		fail({
			code: "CRAFTING_REPOSITORY_WRITE_FAILED",
			message: "Not supported in client-side simulation",
		}),
	findAllRecipes: async () =>
		fail({
			code: "CRAFTING_REPOSITORY_WRITE_FAILED",
			message: "Not supported in client-side simulation",
		}),
	findRecipeById: async () =>
		fail({
			code: "CRAFTING_REPOSITORY_WRITE_FAILED",
			message: "Not supported in client-side simulation",
		}),
	saveCraftedItem: async () =>
		fail({
			code: "CRAFTING_REPOSITORY_WRITE_FAILED",
			message: "Not supported in client-side simulation",
		}),
	findCraftedItemsByCharacterId: async (charId: string) => {
		return ok(craftedItemsList.filter((it) => it.characterId === charId));
	},
	deleteCraftedItem: async () =>
		fail({
			code: "CRAFTING_REPOSITORY_WRITE_FAILED",
			message: "Not supported in client-side simulation",
		}),
	updateCraftedItemEquipStatus: async () =>
		fail({
			code: "CRAFTING_REPOSITORY_WRITE_FAILED",
			message: "Not supported in client-side simulation",
		}),
	updateCraftedItemDurability: async () =>
		fail({
			code: "CRAFTING_REPOSITORY_WRITE_FAILED",
			message: "Not supported in client-side simulation",
		}),
	updateCraftedItem: async (item: CharacterCraftedItemRecord) => {
		const idx = craftedItemsList.findIndex((it) => it.id === item.id);
		if (idx !== -1) {
			craftedItemsList[idx] = item;
			craftedItemsList = [...craftedItemsList];
			saveItemsToStorage(craftedItemsList);
			return ok(item);
		}
		return fail({ code: "ITEM_NOT_FOUND", message: "Item não encontrado." });
	},
};

const synergyService = new SynergyForgeService(mockRepo as any);

// Estados adicionais para a aba de Sinergia
let selectedSynergyItemId = $state("");
let synergyError = $state("");
let synergySuccess = $state("");

let selectedCharacterSynergyItems = $derived(
	craftedItemsList.filter((it) => it.characterId === selectedCharacterId),
);

let selectedSynergyItem = $derived(
	craftedItemsList.find((it) => it.id === selectedSynergyItemId),
);

let decoratedSynergyItem = $derived.by(() => {
	if (!selectedSynergyItem) return null;
	const baseEquipment = OFFICIAL_EQUIPMENT.find(
		(e) => e.id === selectedSynergyItem.equipmentId,
	);
	if (!baseEquipment) return null;

	let decorated = new BaseCraftedEquipment({
		id: selectedSynergyItem.id,
		label: baseEquipment.label,
		kind: baseEquipment.kind as "weapon" | "armor" | "shield",
		slotCost: baseEquipment.slotCost,
		priceCopper: baseEquipment.priceCopper,
		durabilityCurrent: selectedSynergyItem.durabilityCurrent,
		durabilityMax: selectedSynergyItem.durabilityMax,
		mechanicalSummary: baseEquipment.mechanicalSummary,
		runeSlots: baseEquipment.runeSlots,
	});

	if (selectedSynergyItem.isSharp === 1) {
		decorated = new SharpEquipmentDecorator(decorated);
	}
	if (selectedSynergyItem.isReinforced === 1) {
		decorated = new ReinforcedEquipmentDecorator(decorated);
	}
	if (selectedSynergyItem.isRunic === 1) {
		decorated = new RunicEquipmentDecorator(decorated);
	}
	if (selectedSynergyItem.elementalAffinity) {
		decorated = new ElementAffinityDecorator(
			decorated,
			selectedSynergyItem.elementalAffinity,
		);
	}
	if (selectedSynergyItem.infusedRunesJson) {
		try {
			const runes = JSON.parse(
				selectedSynergyItem.infusedRunesJson,
			) as string[];
			if (runes.length > 0) {
				decorated = new InfusedRuneDecorator(decorated, runes);
			}
		} catch (e) {
			console.error("Erro ao processar runas no decorator da UI", e);
		}
	}
	return decorated;
});

let synergyItemMaxRuneSlots = $derived(
	decoratedSynergyItem ? decoratedSynergyItem.getRuneSlotsCount() : 0,
);

let synergyItemCurrentRunes = $derived.by(() => {
	if (!selectedSynergyItem || !selectedSynergyItem.infusedRunesJson) return [];
	try {
		return JSON.parse(selectedSynergyItem.infusedRunesJson) as string[];
	} catch {
		return [];
	}
});

$effect(() => {
	if (selectedCharacterId) {
		const items = craftedItemsList.filter(
			(it) => it.characterId === selectedCharacterId,
		);
		if (items.length > 0) {
			selectedSynergyItemId = items[0].id;
		} else {
			selectedSynergyItemId = "";
		}
		synergyError = "";
		synergySuccess = "";
	}
});

async function handleInfuseRune(
	runeType: "rune_stone" | "ancient_relic" | "insight_scroll",
) {
	synergyError = "";
	synergySuccess = "";
	if (!selectedSynergyItemId) return;

	const res = await synergyService.infuseRune({
		characterId: selectedCharacterId,
		itemId: selectedSynergyItemId,
		runeType,
		characterMaterials,
	});

	if (res.success) {
		characterMaterials[runeType] -= 1;
		craftedItemsList = [...craftedItemsList];
		saveItemsToStorage(craftedItemsList);
		synergySuccess = `Sucesso! Runa infundida no item.`;
	} else {
		synergyError = res.error.message;
	}
}

async function handleInfuseElement(
	affinity: "fire" | "frost" | "lightning" | "void",
) {
	synergyError = "";
	synergySuccess = "";
	if (!selectedSynergyItemId) return;

	const res = await synergyService.infuseElementalAffinity({
		characterId: selectedCharacterId,
		itemId: selectedSynergyItemId,
		affinity,
		characterMaterials,
	});

	if (res.success) {
		characterMaterials["mystic-essence"] -= 1;
		craftedItemsList = [...craftedItemsList];
		saveItemsToStorage(craftedItemsList);
		synergySuccess = `Sucesso! Afinidade elemental de ${
			affinity === "fire"
				? "Fogo"
				: affinity === "frost"
					? "Gelo"
					: affinity === "lightning"
						? "Raio"
						: "Vazio"
		} infundida.`;
	} else {
		synergyError = res.error.message;
	}
}

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

	<!-- Navegação por Abas (Svelte 5) -->
	<div class="flex gap-4 border-b border-bronze/20 pb-2 mb-2 z-10">
		<button
			type="button"
			class="px-4 py-2 font-bold uppercase tracking-wider text-xs transition-all duration-300 rounded {activeTab === 'forge' ? 'text-ether bg-ruin/50 border border-bronze/30 shadow' : 'text-bone/60 hover:text-bone'}"
			onclick={() => activeTab = "forge"}
		>
			🔨 Forja na Bigorna
		</button>
		<button
			type="button"
			class="px-4 py-2 font-bold uppercase tracking-wider text-xs transition-all duration-300 rounded {activeTab === 'synergy' ? 'text-ether bg-ruin/50 border border-bronze/30 shadow' : 'text-bone/60 hover:text-bone'}"
			onclick={() => activeTab = "synergy"}
		>
			✨ Sinergia Rúnica & Elemental
		</button>
	</div>

	{#if activeTab === "forge"}
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

		<!-- Bigorna Física Interativa (Componente Filho) -->
		<CraftingAnvilView 
			{isCrafting} 
			{showSpark} 
			{hasEnoughResources} 
			triggerCraft={triggerCraft} 
		/>

		<!-- Resultado da Rolagem RPG (Componente Filho) -->
		<CraftingRollResult {lastRollResult} {characterName} />
	{:else}
		<!-- ABA: Sinergia Rúnica e Elemental -->
		<div class="grid md:grid-cols-[1.1fr_0.9fr] gap-6 z-10 bg-ruin/20 p-4 rounded border border-bronze/10 animate-fade-in">
			<!-- Coluna 1: Item Selecionado e Soquetes -->
			<div class="flex flex-col gap-4">
				<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/10 pb-2">
					🔮 Item Selecionado para Encantamento
				</h3>
				
				<!-- Selecionar Artífice (Sinergia) -->
				<div class="flex flex-col gap-1.5 text-xs">
					<label for="synergy-char-select" class="text-bone/70 font-semibold">Selecionar Artífice:</label>
					<select 
						id="synergy-char-select"
						bind:value={selectedCharacterId}
						class="bg-void border border-bronze/35 rounded p-2 text-xs font-mono text-ether focus:outline-none focus:border-ether"
					>
						{#each characters as char}
							<option value={char.id} class="bg-void text-bone">{char.name} (Nível {char.level})</option>
						{/each}
						<option value="manual-artisan" class="bg-void text-bone">Artífice Viajante (Nível {characterLevel})</option>
					</select>
				</div>

				<!-- Seletor de Item -->
				<div class="flex flex-col gap-1.5 text-xs">
					<label for="synergy-item-select" class="text-bone/70 font-semibold">Escolher Item Artesanal:</label>
					<select 
						id="synergy-item-select"
						bind:value={selectedSynergyItemId}
						class="bg-void border border-bronze/35 rounded p-2 text-xs font-mono text-ether focus:outline-none focus:border-ether"
					>
						{#if selectedCharacterSynergyItems.length === 0}
							<option value="">-- Nenhum item no inventário --</option>
						{:else}
							{#each selectedCharacterSynergyItems as item}
								<option value={item.id}>{item.label}</option>
							{/each}
						{/if}
					</select>
				</div>

				{#if decoratedSynergyItem && selectedSynergyItem}
					<!-- Cartão do Item Decorado -->
					<div class="bg-void/80 p-4 rounded border border-bronze/25 relative overflow-hidden flex flex-col gap-3">
						<div class="flex justify-between items-start border-b border-bronze/10 pb-2">
							<div>
								<h4 class="font-bold text-bone text-sm">{decoratedSynergyItem.label}</h4>
								<span class="text-[10px] text-ether uppercase tracking-wider">
									Tipo: {decoratedSynergyItem.kind === "weapon" ? "Arma" : decoratedSynergyItem.kind === "armor" ? "Armadura" : "Escudo"}
								</span>
							</div>
							<div class="text-right">
								<span class="text-xs font-mono text-ether font-bold">
									{getFinalSlotCost(selectedSynergyItem)} Slot(s) Peso
								</span>
							</div>
						</div>

						<!-- Detalhes Físicos / Místicos Calculados pelos Decorators -->
						<div class="grid grid-cols-2 gap-2 text-xs">
							<div class="flex justify-between bg-ruin/30 p-1.5 rounded">
								<span class="text-bone/60">Bônus Dano:</span>
								<span class="font-mono text-ether font-bold">+{decoratedSynergyItem.getDamageBonus()}</span>
							</div>
							<div class="flex justify-between bg-ruin/30 p-1.5 rounded">
								<span class="text-bone/60">Bônus Defesa:</span>
								<span class="font-mono text-ether font-bold">+{decoratedSynergyItem.getDefenseBonus()}</span>
							</div>
							<div class="flex justify-between bg-ruin/30 p-1.5 rounded">
								<span class="text-bone/60">Margem Crítica:</span>
								<span class="font-mono text-ether font-bold">+{decoratedSynergyItem.getCriticalMarginBonus()}</span>
							</div>
							<div class="flex justify-between bg-ruin/30 p-1.5 rounded">
								<span class="text-bone/60">Durabilidade:</span>
								<span class="font-mono text-bone">{decoratedSynergyItem.durabilityCurrent}/{decoratedSynergyItem.durabilityMax}</span>
							</div>
						</div>

						<!-- Afinidade Elemental Ativa -->
						<div class="flex items-center gap-2 text-xs border-t border-bronze/10 pt-2">
							<span class="text-bone/60">Afinidade Elemental:</span>
							{#if selectedSynergyItem.elementalAffinity === "fire"}
								<span class="px-2 py-0.5 rounded bg-orange-hungry/20 text-orange-hungry text-[10px] font-bold uppercase border border-orange-hungry/35">🔥 Fogo</span>
							{:else if selectedSynergyItem.elementalAffinity === "frost"}
								<span class="px-2 py-0.5 rounded bg-sky-runic/20 text-sky-runic text-[10px] font-bold uppercase border border-sky-runic/35">❄️ Gelo</span>
							{:else if selectedSynergyItem.elementalAffinity === "lightning"}
								<span class="px-2 py-0.5 rounded bg-ether/20 text-ether text-[10px] font-bold uppercase border border-ether/35">⚡ Raio</span>
							{:else if selectedSynergyItem.elementalAffinity === "void"}
								<span class="px-2 py-0.5 rounded bg-purple-runic/20 text-purple-runic text-[10px] font-bold uppercase border border-purple-runic/35">🌌 Vazio</span>
							{:else}
								<span class="px-2 py-0.5 rounded bg-ruin text-bone/40 text-[10px] uppercase">Nenhuma</span>
							{/if}
						</div>

						<!-- Soquetes de Runas Visuais -->
						<div class="flex flex-col gap-2 border-t border-bronze/10 pt-2">
							<span class="text-[10px] uppercase font-bold text-bone/50 tracking-wider">Soquetes de Runa ({synergyItemCurrentRunes.length} / {synergyItemMaxRuneSlots}):</span>
							<div class="flex gap-3">
								{#each Array(synergyItemMaxRuneSlots) as _, i}
									<div class="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 {i < synergyItemCurrentRunes.length ? 'border-ether bg-ruin shadow-lg shadow-ether/10' : 'border-dashed border-bronze/30 bg-void/50'}" title={i < synergyItemCurrentRunes.length ? `Soquete ${i+1}: ${synergyItemCurrentRunes[i]}` : 'Soquete Vazio'}>
										{#if i < synergyItemCurrentRunes.length}
											{#if synergyItemCurrentRunes[i] === "rune_stone"}
												<span class="text-orange-hungry font-bold text-sm" title="Runa Eleriana (+1 Dano)">🔸</span>
											{:else if synergyItemCurrentRunes[i] === "ancient_relic"}
												<span class="text-sky-runic font-bold text-sm" title="Runa Ancestral (+1 Defesa)">🔹</span>
											{:else if synergyItemCurrentRunes[i] === "insight_scroll"}
												<span class="text-purple-runic font-bold text-sm" title="Runa Insight (+2 Margem Crítica)">🌌</span>
											{/if}
										{:else}
											<span class="text-bone/20 text-[10px] font-mono">Ø</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>
				{:else}
					<div class="bg-void/50 p-6 rounded border border-dashed border-bronze/20 text-center text-bone/40 text-xs">
						Selecione ou crie um item artesanal para visualizar os soquetes e aplicar afinidades mágicas.
					</div>
				{/if}
			</div>

			<!-- Coluna 2: Ações de Infusão -->
			<div class="flex flex-col gap-4">
				<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/10 pb-2">
					✨ Altares de Infusão Mística
				</h3>

				{#if decoratedSynergyItem}
					<!-- Infusão Elemental (Apenas para Armas) -->
					<div class="bg-void/80 p-3.5 rounded border border-bronze/20 flex flex-col gap-3">
						<div class="flex justify-between items-center border-b border-bronze/10 pb-1.5">
							<span class="text-xs font-bold text-bone">Altar Elemental</span>
							<span class="text-[10px] font-mono text-ether">Essência: {characterMaterials['mystic-essence'] || 0}</span>
						</div>

						{#if decoratedSynergyItem.kind !== "weapon"}
							<div class="text-[11px] text-orange-hungry bg-orange-hungry/5 p-2 rounded border border-orange-hungry/20">
								⚠️ Apenas armas podem receber afinidade elemental na bigorna de Pandorha.
							</div>
						{:else}
							<div class="grid grid-cols-2 gap-2">
								<button 
									type="button"
									class="p-2 rounded bg-ruin border border-orange-hungry/20 hover:border-orange-hungry text-xs font-bold flex flex-col items-center gap-1 transition-all duration-300 disabled:opacity-40"
									disabled={(characterMaterials['mystic-essence'] || 0) < 1}
									onclick={() => handleInfuseElement("fire")}
								>
									<span class="text-base">🔥</span>
									<span>Fogo</span>
									<span class="text-[9px] text-bone/50 font-normal">+1 Dano</span>
								</button>
								<button 
									type="button"
									class="p-2 rounded bg-ruin border border-sky-runic/20 hover:border-sky-runic text-xs font-bold flex flex-col items-center gap-1 transition-all duration-300 disabled:opacity-40"
									disabled={(characterMaterials['mystic-essence'] || 0) < 1}
									onclick={() => handleInfuseElement("frost")}
								>
									<span class="text-base">❄️</span>
									<span>Gelo</span>
									<span class="text-[9px] text-bone/50 font-normal">Têmpera Gelo</span>
								</button>
								<button 
									type="button"
									class="p-2 rounded bg-ruin border border-ether/20 hover:border-ether text-xs font-bold flex flex-col items-center gap-1 transition-all duration-300 disabled:opacity-40"
									disabled={(characterMaterials['mystic-essence'] || 0) < 1}
									onclick={() => handleInfuseElement("lightning")}
								>
									<span class="text-base">⚡</span>
									<span>Raio</span>
									<span class="text-[9px] text-bone/50 font-normal">Choque Raio</span>
								</button>
								<button 
									type="button"
									class="p-2 rounded bg-ruin border border-purple-runic/20 hover:border-purple-runic text-xs font-bold flex flex-col items-center gap-1 transition-all duration-300 disabled:opacity-40"
									disabled={(characterMaterials['mystic-essence'] || 0) < 1}
									onclick={() => handleInfuseElement("void")}
								>
									<span class="text-base">🌌</span>
									<span>Vazio</span>
									<span class="text-[9px] text-bone/50 font-normal">+1 Margem Crítico</span>
								</button>
							</div>
							<div class="flex justify-between items-center text-[10px] text-bone/60 mt-1">
								<span>Custo: 1x Essência Mística</span>
								<span>Possui: {characterMaterials['mystic-essence'] || 0}</span>
							</div>
						{/if}
					</div>

					<!-- Infusão de Runas -->
					<div class="bg-void/80 p-3.5 rounded border border-bronze/20 flex flex-col gap-3">
						<span class="text-xs font-bold text-bone border-b border-bronze/10 pb-1.5 flex justify-between">
							<span>Altar de Runas</span>
							<span class="text-[10px] font-mono text-ether">Soquetes Livres: {synergyItemMaxRuneSlots - synergyItemCurrentRunes.length}</span>
						</span>

						{#if synergyItemCurrentRunes.length >= synergyItemMaxRuneSlots}
							<div class="text-[11px] text-orange-hungry bg-orange-hungry/5 p-2 rounded border border-orange-hungry/20">
								🚫 Soquetes de runa esgotados. Forje um item Rúnico ou de maior qualidade para liberar mais slots.
							</div>
						{:else}
							<div class="flex flex-col gap-2">
								<!-- Runa Eleriana -->
								<div class="flex justify-between items-center bg-ruin/50 p-2 rounded border border-bronze/15">
									<div class="flex flex-col text-xs">
										<span class="font-bold text-orange-hungry">🔸 Runa Eleriana</span>
										<span class="text-[10px] text-bone/60">+1 Dano Físico</span>
									</div>
									<button 
										type="button"
										class="px-2.5 py-1.5 bg-ether hover:bg-ether/85 text-void text-xs font-bold rounded transition-all duration-300 disabled:opacity-40"
										disabled={(characterMaterials['rune_stone'] || 0) < 1}
										onclick={() => handleInfuseRune("rune_stone")}
									>
										Infundir ({characterMaterials['rune_stone'] || 0})
									</button>
								</div>

								<!-- Runa Ancestral -->
								<div class="flex justify-between items-center bg-ruin/50 p-2 rounded border border-bronze/15">
									<div class="flex flex-col text-xs">
										<span class="font-bold text-sky-runic">🔹 Runa Ancestral</span>
										<span class="text-[10px] text-bone/60">+1 Defesa Física</span>
									</div>
									<button 
										type="button"
										class="px-2.5 py-1.5 bg-ether hover:bg-ether/85 text-void text-xs font-bold rounded transition-all duration-300 disabled:opacity-40"
										disabled={(characterMaterials['ancient_relic'] || 0) < 1}
										onclick={() => handleInfuseRune("ancient_relic")}
									>
										Infundir ({characterMaterials['ancient_relic'] || 0})
									</button>
								</div>

								<!-- Runa Insight -->
								<div class="flex justify-between items-center bg-ruin/50 p-2 rounded border border-bronze/15">
									<div class="flex flex-col text-xs">
										<span class="font-bold text-purple-runic">🌌 Runa Insight</span>
										<span class="text-[10px] text-bone/60">+2 Margem Crítica</span>
									</div>
									<button 
										type="button"
										class="px-2.5 py-1.5 bg-ether hover:bg-ether/85 text-void text-xs font-bold rounded transition-all duration-300 disabled:opacity-40"
										disabled={(characterMaterials['insight_scroll'] || 0) < 1}
										onclick={() => handleInfuseRune("insight_scroll")}
									>
										Infundir ({characterMaterials['insight_scroll'] || 0})
									</button>
								</div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="bg-void/50 p-6 rounded border border-dashed border-bronze/20 text-center text-bone/40 text-xs">
						Nenhuma ação de infusão disponível. Selecione um item.
					</div>
				{/if}
			</div>
		</div>

		<!-- Alertas de Feedback da Sinergia -->
		{#if synergySuccess}
			<div class="bg-emerald-poison/10 border border-emerald-poison/30 text-emerald-poison p-3 rounded text-xs z-10 shadow-lg">
				<strong>✨ SUCESSO:</strong> {synergySuccess}
			</div>
		{/if}
		{#if synergyError}
			<div class="bg-blood/10 border border-blood/30 text-blood p-3 rounded text-xs z-10 shadow-lg">
				<strong>⚠️ ERRO:</strong> {synergyError}
			</div>
		{/if}
	{/if}

	<!-- Inventário Tático & Capacidade de Carga (Decoradores e Carga) -->
	<CraftingInventoryStatus
		{equippedWeight}
		{finalStats}
		{activeCharacterRecord}
	/>

	<!-- Lista de Itens Forjados (Componente Filho) -->
	<CraftedItemsList 
		{characterItems} 
		{characterName} 
		{getFinalSlotCost} 
		toggleEquipItem={toggleEquipItem} 
		deleteItem={deleteItem} 
	/>
</div>
