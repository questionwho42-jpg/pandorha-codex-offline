<script lang="ts">
import { fade } from "svelte/transition";
import {
	applyStatusEffects,
	BaseCharacterStats,
	EncumberedStatusDecorator,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";
import {
	OFFICIAL_CONSUMABLES,
	OFFICIAL_EQUIPMENT,
} from "$lib/entities/equipment";
import {
	type InventoryCapacityResult,
	InventoryCapacityService,
} from "$lib/shared/inventory";

type Props = {
	characters: CharacterRecord[];
	activeStatusEffects?: CharacterStatusEffectRecord[];
	items?: any[]; // Prop opcional para inicialização
	onItemEquipped?: (slot: string, item: any) => void;
};

let props: Props = $props();

const characters = $derived(props.characters);
const activeStatusEffects = $derived(props.activeStatusEffects ?? []);
const onItemEquipped = $derived(props.onItemEquipped);

// Estados Reativos do Inventário
let selectedCharacterId = $state(props.characters[0]?.id || "");
let selectedChar = $derived(
	characters.find((c) => c.id === selectedCharacterId) || characters[0],
);

$effect(() => {
	if (!selectedCharacterId && props.characters[0]) {
		selectedCharacterId = props.characters[0].id;
	}
});

// Interface para Item Avançado com Durabilidade
interface AdvancedInventoryItem {
	id: string;
	label: string;
	categoryLabel: "Equipamento" | "Consumível";
	slotCost: number;
	kind?:
		| "weapon"
		| "armor"
		| "shield"
		| "adventuring-item"
		| "potion-belt"
		| "currency";
	durabilityCurrent?: number;
	durabilityMax?: number;
	mechanicalSummary?: string;
}

// Slots de Equipamento Ativo
let mainHand = $state<AdvancedInventoryItem | null>(null);
let offHand = $state<AdvancedInventoryItem | null>(null);
let armor = $state<AdvancedInventoryItem | null>(null);
let quickBelt = $state<(AdvancedInventoryItem | null)[]>([null, null, null]);
let backpack = $state<AdvancedInventoryItem[]>([]);

// Drag and drop tracking
let draggingItem = $state<{
	item: AdvancedInventoryItem;
	source: string;
	index?: number;
} | null>(null);

const capacityService = new InventoryCapacityService();
const FALLBACK_CAPACITY: InventoryCapacityResult = {
	excessSlots: 0,
	movementPenaltyMeters: 0,
	slotLimit: 0,
	state: "normal",
	usedSlots: 0,
};

// Inicializa a mochila com itens oficiais enriquecidos e alguns estados de durabilidade
initializeItems();

// Inicializa a mochila com itens oficiais enriquecidos e alguns estados de durabilidade
function initializeItems() {
	const enriched: AdvancedInventoryItem[] = [];

	// Equipamentos Oficiais
	for (const eq of OFFICIAL_EQUIPMENT) {
		let currentDur = eq.durabilityCurrent;
		// Injeta variação de durabilidade para fins de demonstração visual e de teste
		if (eq.id === "dagger") {
			currentDur = 45; // Danificado
		} else if (eq.id === "round-shield") {
			currentDur = 0; // Quebrado
		}

		enriched.push({
			id: eq.id,
			label: eq.label,
			categoryLabel: "Equipamento",
			slotCost: eq.slotCost,
			kind: eq.kind as any,
			durabilityCurrent: currentDur,
			durabilityMax: eq.durabilityMax,
			mechanicalSummary: eq.mechanicalSummary,
		});
	}

	// Consumíveis Oficiais
	for (const c of OFFICIAL_CONSUMABLES) {
		enriched.push({
			id: c.id,
			label: c.label,
			categoryLabel: "Consumível",
			slotCost: c.slotCostPerStack,
			kind: c.kind as any,
			mechanicalSummary: `Limite de stack: ${c.maxQuantityPerStack}`,
		});
	}

	// Pré-equipa alguns itens para dar vida inicial à UI
	const sword = enriched.find((i) => i.id === "longsword");
	const shield = enriched.find((i) => i.id === "round-shield");
	const leather = enriched.find((i) => i.id === "leather-armor");
	const ration = enriched.find((i) => i.id === "ration-stack");

	if (sword) mainHand = sword;
	if (shield) offHand = shield;
	if (leather) armor = leather;
	if (ration) quickBelt[0] = ration;

	// O resto vai para a mochila
	backpack = enriched.filter(
		(i) =>
			i.id !== "longsword" &&
			i.id !== "round-shield" &&
			i.id !== "leather-armor" &&
			i.id !== "ration-stack",
	);
}

// Todos os itens carregados pelo herói no momento
let allCarriedItems = $derived.by(() => {
	const result: AdvancedInventoryItem[] = [];
	if (mainHand) result.push(mainHand);
	if (offHand) result.push(offHand);
	if (armor) result.push(armor);
	for (const q of quickBelt) {
		if (q) result.push(q);
	}
	for (const b of backpack) {
		result.push(b);
	}
	return result;
});

// Peso total em slots carregados
let totalWeight = $derived.by(() => {
	return allCarriedItems.reduce((sum, item) => sum + item.slotCost, 0);
});

// Estatísticas reativas do herói considerando peso/carga
let finalStats = $derived.by(() => {
	if (!selectedChar) return null;

	// 1. Instancia as estatísticas base
	const base = new BaseCharacterStats(selectedChar, {
		id: selectedChar.classId,
		baseHp:
			selectedChar.classId === "vanguard"
				? 10
				: selectedChar.classId === "weaver"
					? 6
					: 8,
	});

	// 2. Aplica efeitos de status de sobrevivência/doenças ativos
	const charEffects = activeStatusEffects
		.filter((e) => e.characterId === selectedChar.id)
		.map((e) => ({
			type: e.type,
			severity: e.severity,
			metadata: e.metadata ?? null,
		}));
	const decorated = applyStatusEffects(base, charEffects);

	// 3. Aplica o decorador de sobrecarga de peso baseando-se no peso equipado
	return new EncumberedStatusDecorator(decorated, totalWeight);
});

// Progresso e cores da barra de carga
let percent = $derived.by(() => {
	if (!finalStats) return 0;
	return (totalWeight / finalStats.carrySlotLimit) * 100;
});

let progressColor = $derived.by(() => {
	if (!finalStats) return "bg-ether";
	const state = finalStats.encumbranceState;
	if (state === "overloaded") return "bg-blood animate-pulse";
	if (state === "encumbered") return "bg-bronze";
	return "bg-ether";
});

// Helpers de Durabilidade
function getDurabilityLabel(item: AdvancedInventoryItem): string {
	if (item.durabilityCurrent === undefined || item.durabilityMax === undefined)
		return "";
	if (item.durabilityCurrent === 0) return "QUEBRADO";
	if (item.durabilityCurrent < item.durabilityMax) return "DANIFICADO";
	return "PRONTO";
}

function getDurabilityColorClass(item: AdvancedInventoryItem): string {
	if (item.durabilityCurrent === undefined || item.durabilityMax === undefined)
		return "";
	if (item.durabilityCurrent === 0)
		return "text-blood border-blood/40 bg-blood/10";
	if (item.durabilityCurrent < item.durabilityMax)
		return "text-orange-hungry border-orange-hungry/40 bg-orange-hungry/10";
	return "text-emerald-poison border-emerald-poison/40 bg-emerald-poison/10";
}

// Drag & Drop Handlers
function handleDragStart(
	item: AdvancedInventoryItem,
	source: string,
	index?: number,
) {
	return (e: DragEvent) => {
		draggingItem = { item, source, index };
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setData("text/plain", item.id);
		}
	};
}

function handleDragOver(e: DragEvent) {
	e.preventDefault();
}

function handleDrop(target: string, targetIndex?: number) {
	return (e: DragEvent) => {
		e.preventDefault();
		if (!draggingItem) return;
		moveItem(draggingItem, target, targetIndex);
		draggingItem = null;
	};
}

// Move o item e valida restrições físicas
function moveItem(
	from: { item: AdvancedInventoryItem; source: string; index?: number },
	target: string,
	targetIndex?: number,
) {
	const item = from.item;

	// Validação de restrições físicas
	if (target === "mainHand" && item.categoryLabel !== "Equipamento") return;
	if (target === "mainHand" && item.kind !== "weapon") return;

	if (target === "offHand" && item.categoryLabel !== "Equipamento") return;
	if (
		target === "offHand" &&
		item.kind !== "shield" &&
		item.id !== "dagger" &&
		item.id !== "magic-ring" &&
		item.kind !== "weapon"
	)
		return;

	if (target === "armor" && item.categoryLabel !== "Equipamento") return;
	if (target === "armor" && item.kind !== "armor") return;

	if (target === "quickBelt" && item.categoryLabel !== "Consumível") return;

	// Remove do container de origem
	if (from.source === "backpack") {
		backpack = backpack.filter((b) => b.id !== item.id);
	} else if (from.source === "mainHand") {
		mainHand = null;
	} else if (from.source === "offHand") {
		offHand = null;
	} else if (from.source === "armor") {
		armor = null;
	} else if (from.source === "quickBelt" && from.index !== undefined) {
		const newBelt = [...quickBelt];
		newBelt[from.index] = null;
		quickBelt = newBelt;
	}

	// Adiciona ao container de destino
	if (target === "backpack") {
		backpack = [...backpack, item];
	} else if (target === "mainHand") {
		const prev = mainHand;
		mainHand = item;
		if (prev) returnToSource(prev, from);
		if (onItemEquipped) onItemEquipped("mainHand", item);
	} else if (target === "offHand") {
		const prev = offHand;
		offHand = item;
		if (prev) returnToSource(prev, from);
		if (onItemEquipped) onItemEquipped("offHand", item);
	} else if (target === "armor") {
		const prev = armor;
		armor = item;
		if (prev) returnToSource(prev, from);
		if (onItemEquipped) onItemEquipped("armor", item);
	} else if (target === "quickBelt" && targetIndex !== undefined) {
		const prev = quickBelt[targetIndex];
		const newBelt = [...quickBelt];
		newBelt[targetIndex] = item;
		quickBelt = newBelt;
		if (prev) returnToSource(prev, from);
		if (onItemEquipped) onItemEquipped(`quickBelt_${targetIndex}`, item);
	}
}

function returnToSource(
	item: AdvancedInventoryItem,
	from: { source: string; index?: number },
) {
	if (from.source === "backpack") {
		backpack = [...backpack, item];
	} else if (from.source === "mainHand") {
		mainHand = item;
	} else if (from.source === "offHand") {
		offHand = item;
	} else if (from.source === "armor") {
		armor = item;
	} else if (from.source === "quickBelt" && from.index !== undefined) {
		const newBelt = [...quickBelt];
		newBelt[from.index] = item;
		quickBelt = newBelt;
	}
}

// Duplo clique como atalho acessível para equipar/desequipar
function handleDoubleClick(
	item: AdvancedInventoryItem,
	source: string,
	index?: number,
) {
	if (source === "backpack") {
		if (item.categoryLabel === "Equipamento") {
			if (item.kind === "weapon") {
				if (!mainHand) {
					backpack = backpack.filter((b) => b.id !== item.id);
					mainHand = item;
				} else if (
					!offHand &&
					(item.id === "dagger" || item.id === "magic-ring")
				) {
					backpack = backpack.filter((b) => b.id !== item.id);
					offHand = item;
				} else {
					const prev = mainHand;
					backpack = backpack.filter((b) => b.id !== item.id);
					mainHand = item;
					backpack = [...backpack, prev];
				}
			} else if (item.kind === "armor") {
				const prev = armor;
				backpack = backpack.filter((b) => b.id !== item.id);
				armor = item;
				if (prev) backpack = [...backpack, prev];
			} else if (item.kind === "shield") {
				const prev = offHand;
				backpack = backpack.filter((b) => b.id !== item.id);
				offHand = item;
				if (prev) backpack = [...backpack, prev];
			}
		} else if (item.categoryLabel === "Consumível") {
			const emptyIdx = quickBelt.findIndex((q) => q === null);
			if (emptyIdx !== -1) {
				backpack = backpack.filter((b) => b.id !== item.id);
				const newBelt = [...quickBelt];
				newBelt[emptyIdx] = item;
				quickBelt = newBelt;
			}
		}
	} else {
		// Desequipar
		if (source === "mainHand") {
			backpack = [...backpack, item];
			mainHand = null;
		} else if (source === "offHand") {
			backpack = [...backpack, item];
			offHand = null;
		} else if (source === "armor") {
			backpack = [...backpack, item];
			armor = null;
		} else if (source === "quickBelt" && index !== undefined) {
			backpack = [...backpack, item];
			const newBelt = [...quickBelt];
			newBelt[index] = null;
			quickBelt = newBelt;
		}
	}
}
</script>

<section aria-labelledby="inventory-title" class="flex flex-col gap-6 text-bone">
	<!-- Cabeçalho e Seletor -->
	<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-bronze/20 pb-4">
		<div>
			<p class="text-sm font-semibold text-ether">Inventário Avançado e Carga Tática</p>
			<h2 id="inventory-title" class="text-2xl font-bold text-bone flex items-center gap-2">
				🎒 Drag-and-Drop & Ficha de Equipamento
			</h2>
		</div>

		<div class="flex items-center gap-2 bg-void/50 p-2 rounded border border-bronze/15 shrink-0">
			<label class="text-xs text-ether font-bold uppercase" for="inventory-char">Carga do Personagem:</label>
			<select id="inventory-char" class="runic-select max-w-[180px] bg-void text-bone border border-bronze/30 px-2 py-1 rounded" bind:value={selectedCharacterId}>
				{#each characters as char}
					<option value={char.id}>{char.name} (Físico: {char.physical})</option>
				{/each}
			</select>
		</div>
	</div>

	{#if selectedChar && finalStats}
		<!-- Painel de Status de Sobrecarga -->
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="border border-bronze/30 bg-ruin/5 px-4 py-3 rounded backdrop-blur-md">
				<p class="text-xs font-semibold text-ether uppercase tracking-wider">Capacidade Utilizada</p>
				<p class="mt-1 text-xl font-bold text-bone font-mono" data-testid="capacity-display">
					{totalWeight} / {finalStats.carrySlotLimit} Slots
				</p>
				<span class="text-[10px] text-bone/60">
					{selectedChar.ancestryId === "dwarf" ? "✨ Bônus Anão (+2 slots) ativo" : "Limite base: Físico + Resistência + 6"}
				</span>
			</div>
			
			<div class="border border-bronze/30 bg-ruin/5 px-4 py-3 rounded backdrop-blur-md">
				<p class="text-xs font-semibold text-ether uppercase tracking-wider">Estado de Carga</p>
				<p class="mt-1 text-xl font-bold text-bone" data-testid="capacity-state">
					{#if finalStats.encumbranceState === 'overloaded'}
						❌ IMOBILIZADO
					{:else}
						{finalStats.encumbranceState === 'encumbered' ? '⚠️ LENTO' : '✔️ NORMAL'}
					{/if}
				</p>
				<span class="text-[10px] text-bone/60">
					{#if finalStats.encumbranceState === 'overloaded'}
						Excesso de carga severa (> limite + 5 slots)
					{:else}
						{finalStats.encumbranceState === 'encumbered' ? 'Penalidade de velocidade ativa' : 'Peso dentro do limite seguro'}
					{/if}
				</span>
			</div>

			<div class="border border-bronze/30 bg-ruin/5 px-4 py-3 rounded backdrop-blur-md">
				<p class="text-xs font-semibold text-ether uppercase tracking-wider">Deslocamento & Iniciativa</p>
				<p class="mt-1 text-xl font-bold text-bone font-mono">
					{finalStats.movementSpeedBase}m <span class="text-ether">/</span> +{finalStats.initiativeBase}
				</p>
				<span class="text-[10px] text-bone/60">
					{#if finalStats.encumbranceState === 'overloaded'}
						Velocidade zero e iniciativa -2
					{:else if finalStats.encumbranceState === 'encumbered'}
						Movimento reduzido (-3m) e iniciativa -2
					{:else}
						Deslocamento padrão de 9m ativo
					{/if}
				</span>
			</div>
		</div>

		<!-- Barra de Progresso de Peso -->
		<div class="p-4 bg-void/50 border border-bronze/30 rounded flex flex-col gap-2 backdrop-blur-md">
			<div class="flex justify-between items-center text-xs font-semibold">
				<span class="text-ether uppercase tracking-widest font-mono">Carga de Mochila Ativa</span>
				<span class="text-bone font-mono">{totalWeight} / {finalStats.carrySlotLimit} Slots ({Math.round(percent)}%)</span>
			</div>
			<div class="w-full h-3 bg-ruin border border-bronze/25 rounded overflow-hidden p-[2px]">
				<div 
					class="h-full rounded-sm transition-all duration-300 {progressColor}"
					style="width: {Math.min(100, percent)}%"
				></div>
			</div>
		</div>

		<!-- Grid Layout Principal de Equipamentos e Mochila -->
		<div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
			<!-- Slots Corporais do Personagem (Esquerda) -->
			<div class="border border-bronze/30 bg-void/40 p-5 rounded-lg flex flex-col gap-4 backdrop-blur-md">
				<h3 class="text-sm font-bold text-ether uppercase tracking-wider border-b border-bronze/20 pb-2 mb-2 text-center">
					🛡️ Equipamento Ativo
				</h3>

				<div class="flex flex-col gap-4">
					<!-- Mão Principal -->
					<div 
						class="border border-dashed border-bronze/30 rounded-lg p-3 bg-void/50 min-h-[90px] flex flex-col justify-center items-center relative transition-all"
						ondragover={handleDragOver}
						ondrop={handleDrop("mainHand")}
						data-testid="slot-mainhand"
					>
						{#if mainHand}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div 
								class="w-full flex items-center justify-between cursor-pointer select-none bg-ruin/20 p-2 rounded border border-bronze/25 hover:border-ether/60"
								draggable="true"
								ondragstart={handleDragStart(mainHand, "mainHand")}
								ondblclick={() => handleDoubleClick(mainHand!, "mainHand")}
							>
								<div class="flex items-center gap-2">
									<span class="text-xl">⚔️</span>
									<div>
										<p class="text-xs font-bold text-bone">{mainHand.label}</p>
										<p class="text-[9px] text-ether/60 uppercase">{mainHand.mechanicalSummary}</p>
									</div>
								</div>
								<span class="text-[9px] px-1.5 py-0.5 border rounded {getDurabilityColorClass(mainHand)}">
									{getDurabilityLabel(mainHand)} ({mainHand.durabilityCurrent}/{mainHand.durabilityMax})
								</span>
							</div>
						{:else}
							<span class="text-xs text-bone/45 font-bold uppercase tracking-wider">Mão Principal (Arma)</span>
							<span class="text-[10px] text-bone/30">Arrastar arma aqui</span>
						{/if}
					</div>

					<!-- Mão Secundária -->
					<div 
						class="border border-dashed border-bronze/30 rounded-lg p-3 bg-void/50 min-h-[90px] flex flex-col justify-center items-center relative transition-all"
						ondragover={handleDragOver}
						ondrop={handleDrop("offHand")}
						data-testid="slot-offhand"
					>
						{#if offHand}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div 
								class="w-full flex items-center justify-between cursor-pointer select-none bg-ruin/20 p-2 rounded border border-bronze/25 hover:border-ether/60"
								draggable="true"
								ondragstart={handleDragStart(offHand, "offHand")}
								ondblclick={() => handleDoubleClick(offHand!, "offHand")}
							>
								<div class="flex items-center gap-2">
									<span class="text-xl">{offHand.kind === 'shield' ? '🛡️' : '🗡️'}</span>
									<div>
										<p class="text-xs font-bold text-bone">{offHand.label}</p>
										<p class="text-[9px] text-ether/60 uppercase">{offHand.mechanicalSummary}</p>
									</div>
								</div>
								<span class="text-[9px] px-1.5 py-0.5 border rounded {getDurabilityColorClass(offHand)}">
									{getDurabilityLabel(offHand)} ({offHand.durabilityCurrent}/{offHand.durabilityMax})
								</span>
							</div>
						{:else}
							<span class="text-xs text-bone/45 font-bold uppercase tracking-wider">Mão Secundária (Escudo/Adaga)</span>
							<span class="text-[10px] text-bone/30">Arrastar escudo/adaga aqui</span>
						{/if}
					</div>

					<!-- Armadura -->
					<div 
						class="border border-dashed border-bronze/30 rounded-lg p-3 bg-void/50 min-h-[90px] flex flex-col justify-center items-center relative transition-all"
						ondragover={handleDragOver}
						ondrop={handleDrop("armor")}
						data-testid="slot-armor"
					>
						{#if armor}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div 
								class="w-full flex items-center justify-between cursor-pointer select-none bg-ruin/20 p-2 rounded border border-bronze/25 hover:border-ether/60"
								draggable="true"
								ondragstart={handleDragStart(armor, "armor")}
								ondblclick={() => handleDoubleClick(armor!, "armor")}
							>
								<div class="flex items-center gap-2">
									<span class="text-xl">👕</span>
									<div>
										<p class="text-xs font-bold text-bone">{armor.label}</p>
										<p class="text-[9px] text-ether/60 uppercase">{armor.mechanicalSummary}</p>
									</div>
								</div>
								<span class="text-[9px] px-1.5 py-0.5 border rounded {getDurabilityColorClass(armor)}">
									{getDurabilityLabel(armor)} ({armor.durabilityCurrent}/{armor.durabilityMax})
								</span>
							</div>
						{:else}
							<span class="text-xs text-bone/45 font-bold uppercase tracking-wider">Armadura</span>
							<span class="text-[10px] text-bone/30">Arrastar armadura aqui</span>
						{/if}
					</div>

					<!-- Cinto / Acesso Rápido (Consumíveis) -->
					<div class="border border-bronze/20 p-3 rounded-lg bg-void/30 flex flex-col gap-2">
						<span class="text-[10px] font-bold text-ether uppercase tracking-wider text-center">🧪 Itens Rápidos (Cinto)</span>
						<div class="grid grid-cols-3 gap-2">
							{#each quickBelt as quickItem, idx}
								<div 
									class="border border-dashed border-bronze/35 rounded h-16 flex flex-col items-center justify-center bg-void/50 text-[10px] relative transition-all text-center p-1"
									ondragover={handleDragOver}
									ondrop={handleDrop("quickBelt", idx)}
									data-testid="slot-quick-{idx}"
								>
									{#if quickItem}
										<!-- svelte-ignore a11y_no_static_element_interactions -->
										<div 
											class="w-full h-full flex flex-col justify-center items-center cursor-pointer select-none bg-ruin/30 border border-bronze/20 hover:border-ether/60 rounded"
											draggable="true"
											ondragstart={handleDragStart(quickItem, "quickBelt", idx)}
											ondblclick={() => handleDoubleClick(quickItem!, "quickBelt", idx)}
										>
											<span class="text-lg">🧪</span>
											<span class="text-[8px] font-bold truncate max-w-full px-1">{quickItem.label}</span>
										</div>
									{:else}
										<span class="text-bone/35 font-bold">Vazio</span>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				</div>
			</div>

			<!-- Grid da Mochila (Direita) -->
			<div 
				class="border border-bronze/30 bg-void/40 p-5 rounded-lg flex flex-col gap-4 backdrop-blur-md"
				ondragover={handleDragOver}
				ondrop={handleDrop("backpack")}
				data-testid="backpack-dropzone"
			>
				<div class="flex items-center justify-between border-b border-bronze/20 pb-2 mb-2">
					<h3 class="text-sm font-bold text-ether uppercase tracking-wider">
						📦 Mochila Ativa ({backpack.length} Itens)
					</h3>
					<span class="text-xs text-bone/60 italic">💡 Duplo clique para equipar rápido</span>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
					{#each backpack as item (item.id)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div 
							class="border border-bronze/25 bg-void/60 rounded p-3 flex flex-col justify-between gap-2 cursor-grab hover:border-ether/60 hover:bg-ruin/5 transition-all select-none"
							draggable="true"
							onddragstart={handleDragStart(item, "backpack")}
							ondblclick={() => handleDoubleClick(item, "backpack")}
							data-testid="item-{item.id}"
						>
							<div class="flex items-start justify-between gap-2">
								<div>
									<h4 class="text-xs font-bold text-bone">{item.label}</h4>
									<p class="text-[9px] text-ether/60 uppercase">{item.categoryLabel}</p>
								</div>
								<span class="text-[10px] font-mono text-ether font-bold">
									+{item.slotCost} {item.slotCost === 1 ? 'Slot' : 'Slots'}
								</span>
							</div>

							{#if item.categoryLabel === "Equipamento" && item.durabilityCurrent !== undefined}
								<div class="flex items-center justify-between text-[9px] mt-1 border-t border-bronze/10 pt-1.5">
									<span class="text-bone/50">Durabilidade:</span>
									<span class="px-1 py-0.5 border rounded {getDurabilityColorClass(item)}">
										{getDurabilityLabel(item)} ({item.durabilityCurrent}/{item.durabilityMax})
									</span>
								</div>
							{/if}

							{#if item.mechanicalSummary}
								<p class="text-[9px] text-bone/60 italic leading-snug line-clamp-2 mt-1">
									{item.mechanicalSummary}
								</p>
							{/if}
						</div>
					{/each}

					{#if backpack.length === 0}
						<div class="col-span-full py-16 text-center text-bone/40 italic">
							Mochila vazia. Todos os itens estão equipados ou dropados!
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</section>
