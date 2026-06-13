<script lang="ts">
// biome-ignore-all lint/correctness/noUnusedImports: Usados no template Svelte 5
// biome-ignore-all lint/correctness/noUnusedVariables: Usados no template Svelte 5
import type { CharacterRecord } from "$lib/entities/character";
import type { CraftingRecipeRecord } from "$lib/entities/equipment/model/craftingSchema";

interface Props {
	characters: readonly CharacterRecord[];
	selectedCharacterId: string;
	selectedRecipeId: string;
	recipes: CraftingRecipeRecord[];
	characterLevel: number;
	mentalAptitude: number;
	artificeTalentBonus: number;
	itemBonus: number;
	characterGoldCopper: number;
	characterMaterials: Record<string, number>;
}

let {
	characters,
	selectedCharacterId = $bindable(),
	selectedRecipeId = $bindable(),
	recipes,
	characterLevel,
	mentalAptitude,
	artificeTalentBonus = $bindable(),
	itemBonus = $bindable(),
	characterGoldCopper = $bindable(),
	characterMaterials = $bindable(),
}: Props = $props();

let selectedRecipe = $derived(
	recipes.find((r) => r.id === selectedRecipeId) || recipes[0],
);

// Parse dos materiais exigidos pela receita atual
let requiredMaterials = $derived(
	JSON.parse(selectedRecipe.materialsRequiredJson) as Array<{
		materialId: string;
		quantity: number;
	}>,
);

// Didática em pt-BR (Modo Professor)
function getMaterialName(id: string): string {
	switch (id) {
		case "metal-ore":
			return "Minério de Ferro";
		case "ironwood":
			return "Ferro-Árvore";
		case "ether-ore":
			return "Cristal de Éter";
		case "mystic-essence":
			return "Essência Mística";
		case "rune_stone":
			return "Runa Eleriana";
		case "ancient_relic":
			return "Runa Ancestral";
		case "insight_scroll":
			return "Runa Insight";
		default:
			return id;
	}
}

// Adicionar materiais manualmente para testes livres
function adjustMaterial(matId: string, amount: number) {
	const current = characterMaterials[matId] || 0;
	characterMaterials[matId] = Math.max(0, current + amount);
}

// Ajustar cobre manualmente
function adjustCopper(amount: number) {
	characterGoldCopper = Math.max(0, characterGoldCopper + amount);
}
</script>

<div class="grid md:grid-cols-[1.2fr_0.8fr] gap-6 z-10">
	
	<!-- Seção de Seleção e Rolagem de Dados -->
	<div class="flex flex-col gap-4 bg-ruin p-4 rounded border border-bronze/20">
		<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/10 pb-2">1. Preparar a Forja</h3>
		
		<!-- Escolher Personagem -->
		<div class="flex flex-col gap-1.5 text-xs">
			<label for="char-select" class="text-bone/70 font-semibold">Selecionar Artífice:</label>
			<select 
				id="char-select"
				bind:value={selectedCharacterId}
				class="bg-void border border-bronze/35 rounded p-2 text-xs font-mono text-ether focus:outline-none focus:border-ether"
			>
				{#each characters as char}
					<option value={char.id} class="bg-void text-bone">{char.name} (Nível {char.level})</option>
				{/each}
				<option value="manual-artisan" class="bg-void text-bone">Artífice Viajante (Nível 2)</option>
			</select>
		</div>

		<!-- Escolher Receita -->
		<div class="flex flex-col gap-1.5 text-xs">
			<label for="recipe-select" class="text-bone/70 font-semibold">Escolher Receita:</label>
			<select 
				id="recipe-select"
				bind:value={selectedRecipeId}
				class="bg-void border border-bronze/35 rounded p-2 text-xs font-mono text-ether focus:outline-none focus:border-ether"
			>
				{#each recipes as recipe}
					<option value={recipe.id} class="bg-void text-bone">{recipe.label} (CD {recipe.difficultyClass})</option>
				{/each}
			</select>
		</div>

		<!-- Modificadores e Cálculo da Rolagem -->
		<div class="bg-void p-3 rounded border border-bronze/10 flex flex-col gap-2 text-xs">
			<div class="flex justify-between items-center text-[11px]">
				<span class="text-bone/60">Nível do Personagem:</span>
				<span class="font-mono text-ether font-bold">+{characterLevel}</span>
			</div>
			<div class="flex justify-between items-center text-[11px]">
				<span class="text-bone/60">Aptidão Mental (Artífice):</span>
				<span class="font-mono text-ether font-bold">+{mentalAptitude}</span>
			</div>
			<div class="flex justify-between items-center text-[11px]">
				<span class="text-bone/60">Talento de Artífice:</span>
				<div class="flex items-center gap-2">
					<button onclick={() => artificeTalentBonus = Math.max(0, artificeTalentBonus - 1)} class="px-1.5 bg-ruin hover:bg-bronze/20 text-bone rounded">-</button>
					<span class="font-mono text-ether font-bold">+{artificeTalentBonus}</span>
					<button onclick={() => artificeTalentBonus++} class="px-1.5 bg-ruin hover:bg-bronze/20 text-bone rounded">+</button>
				</div>
			</div>
			<div class="flex justify-between items-center text-[11px]">
				<span class="text-bone/60">Ferramenta Superior:</span>
				<div class="flex items-center gap-2">
					<button onclick={() => itemBonus = Math.max(0, itemBonus - 1)} class="px-1.5 bg-ruin hover:bg-bronze/20 text-bone rounded">-</button>
					<span class="font-mono text-ether font-bold">+{itemBonus}</span>
					<button onclick={() => itemBonus++} class="px-1.5 bg-ruin hover:bg-bronze/20 text-bone rounded">+</button>
				</div>
			</div>
			<div class="border-t border-bronze/15 pt-2 flex justify-between items-center font-bold text-xs text-ether">
				<span>Bônus Total na Rolagem:</span>
				<span class="font-mono">d20 + {characterLevel + mentalAptitude + artificeTalentBonus + itemBonus}</span>
			</div>
		</div>
	</div>

	<!-- Painel de Gerenciamento de Inventário / Custos -->
	<div class="flex flex-col gap-4 bg-ruin p-4 rounded border border-bronze/20">
		<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/10 pb-2">2. Caixa de Recursos</h3>
		
		<!-- Cobre / Gold -->
		<div class="flex justify-between items-center bg-void p-2.5 rounded border border-bronze/10 text-xs">
			<span class="font-bold text-bone/70">Moedas de Cobre:</span>
			<div class="flex items-center gap-2">
				<button onclick={() => adjustCopper(-100)} class="px-1.5 bg-ruin hover:bg-bronze/25 rounded text-[10px]">-100</button>
				<span class="font-mono text-ether font-bold">{characterGoldCopper} CC</span>
				<button onclick={() => adjustCopper(500)} class="px-1.5 bg-ruin hover:bg-bronze/25 rounded text-[10px] font-bold text-ether">+500</button>
			</div>
		</div>

		<!-- Materiais -->
		<div class="flex flex-col gap-2">
			<span class="text-[10px] uppercase font-bold text-bone/50 tracking-wider">Materiais no Almoxarifado:</span>
			{#each Object.keys(characterMaterials) as matId}
				<div class="flex justify-between items-center bg-void p-2 rounded text-xs">
					<span class="text-bone/80">{getMaterialName(matId)}:</span>
					<div class="flex items-center gap-2">
						<button onclick={() => adjustMaterial(matId, -1)} class="px-1 bg-ruin hover:bg-bronze/25 rounded">-</button>
						<span class="font-mono text-bone font-bold">{characterMaterials[matId]}</span>
						<button onclick={() => adjustMaterial(matId, 1)} class="px-1 bg-ruin hover:bg-bronze/25 rounded">+</button>
					</div>
				</div>
			{/each}
		</div>

		<!-- Custo da Receita Selecionada -->
		<div class="mt-auto bg-ether/5 border border-ether/20 p-3 rounded flex flex-col gap-2 text-xs">
			<span class="text-[10px] uppercase font-bold text-ether tracking-wider">Custos Requeridos:</span>
			<div class="flex justify-between items-center text-[11px]">
				<span class="text-bone/70">Cobre da Bigorna:</span>
				<span class="font-mono {characterGoldCopper >= selectedRecipe.copperCost ? 'text-bone' : 'text-blood font-bold'}">{selectedRecipe.copperCost} CC</span>
			</div>
			{#each requiredMaterials as req}
				<div class="flex justify-between items-center text-[11px]">
					<span class="text-bone/70">{getMaterialName(req.materialId)}:</span>
					<span class="font-mono {(characterMaterials[req.materialId] || 0) >= req.quantity ? 'text-bone' : 'text-blood font-bold'}">
						{req.quantity} ({characterMaterials[req.materialId] || 0} possuídos)
					</span>
				</div>
			{/each}
		</div>
	</div>
</div>
