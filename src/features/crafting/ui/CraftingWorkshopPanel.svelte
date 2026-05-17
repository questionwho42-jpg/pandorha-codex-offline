<script lang="ts">
import { onMount } from "svelte";

import type { CharacterRecord } from "$lib/entities/character";
import {
	BaseCraftedEquipment,
	ReinforcedEquipmentDecorator,
	RunicEquipmentDecorator,
	SharpEquipmentDecorator,
} from "$lib/entities/equipment/domain/CraftingQualityDecorators";
import type {
	CharacterCraftedItemRecord,
	CraftingRecipeRecord,
} from "$lib/entities/equipment/model/craftingSchema";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";

interface Props {
	characters: readonly CharacterRecord[];
	initialGoldCopper?: number;
	onCraftSuccess?: (item: CharacterCraftedItemRecord) => void;
}

let {
	characters = [],
	initialGoldCopper = 50000,
	onCraftSuccess,
}: Props = $props();

// Catálogo de receitas locais para a demonstração didática da oficina
const RECIPES: CraftingRecipeRecord[] = [
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

// Estado reativo da oficina (Svelte 5 Runes)
let selectedCharacterId = $state(characters[0]?.id || "manual-artisan");
let characterGoldCopper = $state(initialGoldCopper);
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
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte transition/markup
let showSpark = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte HTML template
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
}

// Encontra as estatísticas de um personagem da sessão
let activeCharacter = $derived(
	characters.find((c) => c.id === selectedCharacterId),
);
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte HTML template
let characterName = $derived(activeCharacter?.name || "Artífice Viajante");
let characterLevel = $derived(activeCharacter?.level || 2);
let mentalAptitude = $derived(activeCharacter ? 3 : 2); // Simula aptidão mental base do personagem selecionado

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

// Didática em pt-BR (Modo Professor)
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte HTML template
function getMaterialName(id: string): string {
	switch (id) {
		case "metal-ore":
			return "Minério de Ferro";
		case "ironwood":
			return "Ferro-Árvore";
		case "ether-ore":
			return "Cristal de Éter";
		default:
			return id;
	}
}

// Adicionar materiais manualmente para testes livres
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte HTML template
function adjustMaterial(matId: string, amount: number) {
	const current = characterMaterials[matId] || 0;
	characterMaterials[matId] = Math.max(0, current + amount);
}

// Ajustar cobre manualmente
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte HTML template
function adjustCopper(amount: number) {
	characterGoldCopper = Math.max(0, characterGoldCopper + amount);
}

function getSecureRandom(): number {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / 4294967296;
}

// Ação de Forja Ativa
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte HTML template
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
	let matsSpent: Record<string, number> = {};

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
			// 1. Instanciar o Componente Concreto do Decorator
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
				durabilityCurrent,
				durabilityMax: 100,
				createdAt: new Date().toISOString(),
			};

			craftedItemsList = [recordItem, ...craftedItemsList];
			saveItemsToStorage(craftedItemsList);

			if (onCraftSuccess) {
				onCraftSuccess(recordItem);
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

// Remover um item da lista
// biome-ignore lint/correctness/noUnusedVariables: Used in Svelte HTML template
function deleteItem(id: string) {
	craftedItemsList = craftedItemsList.filter((item) => item.id !== id);
	saveItemsToStorage(craftedItemsList);
}
</script>

<div class="crafting-panel bg-[#121214] text-[#ecece3] rounded-lg border border-[#c5a880]/50 p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
	
	<!-- Luz de fundo pulsante da fornalha -->
	<div class="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#ff5500]/5 filter blur-[80px] pointer-events-none"></div>
	
	<!-- Título Principal da Feature -->
	<div class="border-b border-[#c5a880]/20 pb-4 z-10">
		<h2 class="text-xl font-bold uppercase tracking-wider text-[#d8c3a5] flex items-center gap-2">
			<span>⚒️</span> Oficina e Bigorna do Artífice
		</h2>
		<p class="text-xs text-[#ecece3]/60 italic mt-1 leading-relaxed">
			Modifique propriedades físicas e místicas de suas armas e armaduras combinando Minério de Ferro e Ferro-Árvore sob o padrão <strong class="text-[#c5a880]">Decorator</strong>.
		</p>
	</div>

	<!-- Grid Superior: Painel de Controle e Recursos -->
	<div class="grid md:grid-cols-[1.2fr_0.8fr] gap-6 z-10">
		
		<!-- Seção de Seleção e Rolagem de Dados -->
		<div class="flex flex-col gap-4 bg-[#1a1a1f] p-4 rounded border border-[#c5a880]/20">
			<h3 class="text-xs font-bold uppercase tracking-widest text-[#c5a880] border-b border-[#c5a880]/10 pb-2">1. Preparar a Forja</h3>
			
			<!-- Escolher Personagem -->
			<div class="flex flex-col gap-1.5 text-xs">
				<label for="char-select" class="text-[#ecece3]/70 font-semibold">Selecionar Artífice:</label>
				<select 
					id="char-select"
					bind:value={selectedCharacterId}
					class="bg-[#121214] border border-[#c5a880]/30 rounded p-2 text-xs font-mono text-[#d8c3a5] focus:outline-none focus:border-[#c5a880]"
				>
					{#each characters as char}
						<option value={char.id}>{char.name} (Nível {char.level})</option>
					{/each}
					<option value="manual-artisan">Artífice Viajante (Nível 2)</option>
				</select>
			</div>

			<!-- Escolher Receita -->
			<div class="flex flex-col gap-1.5 text-xs">
				<label for="recipe-select" class="text-[#ecece3]/70 font-semibold">Escolher Receita:</label>
				<select 
					id="recipe-select"
					bind:value={selectedRecipeId}
					class="bg-[#121214] border border-[#c5a880]/30 rounded p-2 text-xs font-mono text-[#d8c3a5] focus:outline-none focus:border-[#c5a880]"
				>
					{#each RECIPES as recipe}
						<option value={recipe.id}>{recipe.label} (CD {recipe.difficultyClass})</option>
					{/each}
				</select>
			</div>

			<!-- Modificadores e Cálculo da Rolagem -->
			<div class="bg-[#121214] p-3 rounded border border-[#c5a880]/10 flex flex-col gap-2 text-xs">
				<div class="flex justify-between items-center text-[11px]">
					<span class="text-[#ecece3]/60">Nível do Personagem:</span>
					<span class="font-mono text-[#d8c3a5] font-bold">+{characterLevel}</span>
				</div>
				<div class="flex justify-between items-center text-[11px]">
					<span class="text-[#ecece3]/60">Aptidão Mental (Artífice):</span>
					<span class="font-mono text-[#d8c3a5] font-bold">+{mentalAptitude}</span>
				</div>
				<div class="flex justify-between items-center text-[11px]">
					<span class="text-[#ecece3]/60">Talento de Artífice:</span>
					<div class="flex items-center gap-2">
						<button onclick={() => artificeTalentBonus = Math.max(0, artificeTalentBonus - 1)} class="px-1.5 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded">-</button>
						<span class="font-mono text-[#d8c3a5] font-bold">+{artificeTalentBonus}</span>
						<button onclick={() => artificeTalentBonus++} class="px-1.5 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded">+</button>
					</div>
				</div>
				<div class="flex justify-between items-center text-[11px]">
					<span class="text-[#ecece3]/60">Ferramenta Superior:</span>
					<div class="flex items-center gap-2">
						<button onclick={() => itemBonus = Math.max(0, itemBonus - 1)} class="px-1.5 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded">-</button>
						<span class="font-mono text-[#d8c3a5] font-bold">+{itemBonus}</span>
						<button onclick={() => itemBonus++} class="px-1.5 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded">+</button>
					</div>
				</div>
				<div class="border-t border-[#c5a880]/10 pt-2 flex justify-between items-center font-bold text-xs text-[#c5a880]">
					<span>Bônus Total na Rolagem:</span>
					<span class="font-mono">d20 + {characterLevel + mentalAptitude + artificeTalentBonus + itemBonus}</span>
				</div>
			</div>
		</div>

		<!-- Painel de Gerenciamento de Inventário / Custos -->
		<div class="flex flex-col gap-4 bg-[#1a1a1f] p-4 rounded border border-[#c5a880]/20">
			<h3 class="text-xs font-bold uppercase tracking-widest text-[#c5a880] border-b border-[#c5a880]/10 pb-2">2. Caixa de Recursos</h3>
			
			<!-- Cobre / Gold -->
			<div class="flex justify-between items-center bg-[#121214] p-2.5 rounded border border-[#c5a880]/10 text-xs">
				<span class="font-bold text-[#ecece3]/70">Moedas de Cobre:</span>
				<div class="flex items-center gap-2">
					<button onclick={() => adjustCopper(-100)} class="px-1.5 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded text-[10px]">-100</button>
					<span class="font-mono text-[#e0a96d] font-bold">{characterGoldCopper} CC</span>
					<button onclick={() => adjustCopper(500)} class="px-1.5 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded text-[10px] font-bold text-[#e0a96d]">+500</button>
				</div>
			</div>

			<!-- Materiais -->
			<div class="flex flex-col gap-2">
				<span class="text-[10px] uppercase font-bold text-[#ecece3]/50 tracking-wider">Materiais no Almoxarifado:</span>
				{#each Object.keys(characterMaterials) as matId}
					<div class="flex justify-between items-center bg-[#121214] p-2 rounded text-xs">
						<span class="text-[#ecece3]/80">{getMaterialName(matId)}:</span>
						<div class="flex items-center gap-2">
							<button onclick={() => adjustMaterial(matId, -1)} class="px-1 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded">-</button>
							<span class="font-mono text-[#ecece3] font-bold">{characterMaterials[matId]}</span>
							<button onclick={() => adjustMaterial(matId, 1)} class="px-1 bg-[#1a1a1f] hover:bg-[#c5a880]/20 rounded">+</button>
						</div>
					</div>
				{/each}
			</div>

			<!-- Custo da Receita Selecionada -->
			<div class="mt-auto bg-[#ff5500]/5 border border-[#ff5500]/20 p-3 rounded flex flex-col gap-2 text-xs">
				<span class="text-[10px] uppercase font-bold text-[#ff5500] tracking-wider">Custos Requeridos:</span>
				<div class="flex justify-between items-center text-[11px]">
					<span class="text-[#ecece3]/70">Cobre da Bigorna:</span>
					<span class="font-mono {characterGoldCopper >= selectedRecipe.copperCost ? 'text-[#ecece3]' : 'text-red-500 font-bold'}">{selectedRecipe.copperCost} CC</span>
				</div>
				{#each requiredMaterials as req}
					<div class="flex justify-between items-center text-[11px]">
						<span class="text-[#ecece3]/70">{getMaterialName(req.materialId)}:</span>
						<span class="font-mono {(characterMaterials[req.materialId] || 0) >= req.quantity ? 'text-[#ecece3]' : 'text-red-500 font-bold'}">
							{req.quantity} ({characterMaterials[req.materialId] || 0} possuídos)
						</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Bigorna Física Interativa (Visual) -->
	<div class="anvil-workspace bg-[#18181b] border border-[#c5a880]/30 rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] relative">
		
		<!-- Fogo de fundo e faísca -->
		{#if isCrafting}
			<div class="absolute inset-0 bg-[#ff3300]/10 filter blur-xl animate-pulse"></div>
		{/if}

		{#if showSpark}
			<div class="spark-overlay absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-yellow-300 via-orange-500 to-red-500 rounded-full filter blur-md animate-ping pointer-events-none opacity-80"></div>
			<div class="absolute text-yellow-200 text-3xl font-extrabold tracking-widest animate-bounce">⚡ SPARKS! ⚡</div>
		{/if}

		<!-- Elemento da Bigorna CSS -->
		<div class="flex flex-col items-center z-10 {isCrafting ? 'animate-wiggle' : ''}">
			<!-- Martelo de Forja -->
			<div class="hammer text-5xl transition-transform duration-300 {isCrafting ? 'animate-strike' : 'hover:-rotate-12 cursor-pointer'}">
				🔨
			</div>
			<!-- Bigorna Clássica -->
			<div class="anvil-icon text-7xl mt-2 select-none">
				🔘
			</div>
			<div class="text-[10px] uppercase font-bold text-[#c5a880] tracking-widest mt-3">Bigorna de Pandorha</div>
		</div>

		<!-- Botão Ativar Forja -->
		<button
			onclick={triggerCraft}
			disabled={!hasEnoughResources || isCrafting}
			class="w-full max-w-sm mt-5 py-3 rounded font-bold uppercase tracking-widest transition-all z-10 text-xs 
				{!hasEnoughResources ? 'bg-zinc-800 border border-zinc-700 text-zinc-500 cursor-not-allowed' :
				isCrafting ? 'bg-gradient-to-r from-orange-600 to-red-700 text-white cursor-wait animate-pulse' :
				'bg-[#c5a880] hover:bg-[#e8d2b0] border border-[#d8c3a5] text-zinc-950 active:scale-95 shadow-md shadow-orange-500/10'}"
		>
			{#if !hasEnoughResources}
				⚠️ Recursos Insuficientes
			{:else if isCrafting}
				🔨 Malhando o Ferro...
			{:else}
				🔥 Acionar a Forja (CC & Materiais)
			{/if}
		</button>
	</div>

	<!-- Resultado da Rolagem RPG (Didática) -->
	{#if lastRollResult}
		<div 
			transition:slide={{ duration: 400 }}
			class="roll-result-panel p-5 rounded-lg border flex flex-col gap-3 text-xs z-10
				{lastRollResult.degree === 'criticalSuccess' ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100' :
				lastRollResult.degree === 'success' ? 'bg-[#c5a880]/10 border-[#c5a880]/30 text-white' :
				lastRollResult.degree === 'successWithCost' ? 'bg-amber-950/20 border-amber-500/40 text-amber-100' :
				'bg-red-950/20 border-red-500/40 text-red-100'}"
		>
			<div class="flex justify-between items-center border-b pb-2 border-current/20">
				<span class="font-bold text-sm uppercase tracking-wider">{lastRollResult.message}</span>
				<div class="flex items-center gap-2">
					<span class="text-[10px] uppercase font-bold tracking-widest text-[#ecece3]/60">Teste de Artífice</span>
					<span class="font-mono font-bold bg-[#121214] px-2 py-0.5 rounded border border-current/20 text-sm">
						d20 ({lastRollResult.naturalRoll}) + {lastRollResult.modifier} = {lastRollResult.totalRoll} (CD {lastRollResult.dc})
					</span>
				</div>
			</div>

			<p class="leading-relaxed italic text-[#ecece3]/80">
				{lastRollResult.details}
			</p>

			{#if lastRollResult.itemCreated}
				<div class="item-card bg-[#121214]/60 border border-[#c5a880]/20 p-4 rounded mt-2 flex flex-col gap-2">
					<div class="flex justify-between items-center">
						<span class="font-bold text-sm text-[#d8c3a5]">{lastRollResult.itemCreated.label}</span>
						<span class="text-[10px] uppercase tracking-wider font-mono font-bold bg-[#c5a880]/15 text-[#c5a880] px-2 py-0.5 rounded">
							Forjado por {characterName}
						</span>
					</div>
					
					<div class="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono text-[#ecece3]/75">
						<div class="bg-[#1a1a1f] p-1.5 rounded border border-[#c5a880]/10 text-center">
							<span class="block text-zinc-500 uppercase">Carga</span>
							<strong class="text-white text-xs">{lastRollResult.itemCreated.slots} Slot{lastRollResult.itemCreated.slots !== 1 ? 's' : ''}</strong>
						</div>
						<div class="bg-[#1a1a1f] p-1.5 rounded border border-[#c5a880]/10 text-center">
							<span class="block text-zinc-500 uppercase">Dano Extra</span>
							<strong class="text-white text-xs">+{lastRollResult.itemCreated.damageBonus}</strong>
						</div>
						<div class="bg-[#1a1a1f] p-1.5 rounded border border-[#c5a880]/10 text-center">
							<span class="block text-zinc-500 uppercase">Slots Runas</span>
							<strong class="text-white text-xs">{lastRollResult.itemCreated.runeSlots}</strong>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Lista de Itens Forjados (Histórico da Sessão) -->
	<div class="crafted-items-section flex flex-col gap-4 bg-[#1a1a1f] p-4 rounded border border-[#c5a880]/20 mt-2 z-10">
		<h3 class="text-xs font-bold uppercase tracking-widest text-[#c5a880] border-b border-[#c5a880]/10 pb-2">3. Acervo de Armas e Armaduras Forjadas</h3>

		{#if craftedItemsList.length === 0}
			<p class="text-xs text-[#ecece3]/40 italic py-4 text-center">Nenhum item foi forjado nesta sessão de oficina. Acione o fole e comece a forja!</p>
		{:else}
			<div class="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
				{#each craftedItemsList as item (item.id)}
					<div 
						transition:fade={{ duration: 200 }}
						class="item-row flex justify-between items-center bg-[#121214] border border-[#c5a880]/10 p-2.5 rounded hover:border-[#c5a880]/30 transition-all text-xs"
					>
						<div class="flex flex-col gap-1">
							<div class="flex items-center gap-2">
								<span class="font-bold text-[#d8c3a5]">{item.label}</span>
								<!-- Tags de modificadores -->
								{#if item.isSharp === 1}
									<span class="text-[9px] uppercase font-mono px-1 rounded bg-red-950/40 border border-red-500/20 text-red-400">Afiado</span>
								{/if}
								{#if item.isReinforced === 1}
									<span class="text-[9px] uppercase font-mono px-1 rounded bg-sky-950/40 border border-sky-500/20 text-sky-400">Reforçado</span>
								{/if}
								{#if item.isRunic === 1}
									<span class="text-[9px] uppercase font-mono px-1 rounded bg-purple-950/40 border border-purple-500/20 text-purple-400">Rúnica</span>
								{/if}
							</div>
							<span class="text-[10px] text-[#ecece3]/50">
								Durabilidade: <strong class="font-mono text-[#ecece3]/70">{item.durabilityCurrent}/{item.durabilityMax}</strong>
							</span>
						</div>

						<button 
							onclick={() => deleteItem(item.id)}
							class="px-2 py-1 rounded bg-[#ff3300]/10 border border-[#ff3300]/20 text-[#ff3300] hover:bg-[#ff3300] hover:text-white font-bold text-[10px] uppercase tracking-wider transition-all"
						>
							Excluir
						</button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Animações CSS Customizadas e Premium */
	@keyframes wiggling {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.02) rotate(1deg); }
	}
	.animate-wiggle {
		animation: wiggling 0.3s ease-in-out infinite;
	}

	@keyframes strike-anvil {
		0%, 100% { transform: translateY(0) rotate(0deg); }
		20% { transform: translateY(-16px) rotate(-35deg); }
		40% { transform: translateY(4px) rotate(15deg); }
		50% { transform: translateY(0) rotate(0deg); }
	}
	.animate-strike {
		animation: strike-anvil 0.7s ease-in-out infinite;
	}
</style>
