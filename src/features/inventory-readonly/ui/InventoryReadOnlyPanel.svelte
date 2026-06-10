<script lang="ts">
import { onMount } from "svelte";
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

type Props = {
	characters: CharacterRecord[];
	activeStatusEffects?: CharacterStatusEffectRecord[];
};

let { characters, activeStatusEffects = [] }: Props = $props();

// Estados Reativos do Inventário
let selectedCharacterId = $state("");

// Catálogo de Itens Úteis
const CATALOG_ITEMS = [
	...OFFICIAL_EQUIPMENT.map((eq) => ({
		id: eq.id,
		label: eq.label,
		slotCost: eq.slotCost,
		category: "Equipamento",
	})),
	...OFFICIAL_CONSUMABLES.map((c) => ({
		id: c.id,
		label: c.label,
		slotCost: c.slotCostPerStack,
		category: "Consumível",
	})),
];

// Itens equipados por padrão
let equippedItemIds = $state<string[]>([
	"ration-stack",
	"armor-leather",
	"sword-steel",
]);

let selectedChar = $derived(
	characters.find((c) => c.id === selectedCharacterId) || characters[0],
);

// Peso total dos itens equipados
let totalWeight = $derived.by(() => {
	return CATALOG_ITEMS.filter((item) =>
		equippedItemIds.includes(item.id),
	).reduce((sum, item) => sum + item.slotCost, 0);
});

// Cebola de Decoradores de Status de Carga reativa
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

onMount(() => {
	const firstChar = characters[0];
	if (firstChar) {
		selectedCharacterId = firstChar.id;
	}
});

function _toggleEquip(itemId: string) {
	if (equippedItemIds.includes(itemId)) {
		equippedItemIds = equippedItemIds.filter((id) => id !== itemId);
	} else {
		equippedItemIds = [...equippedItemIds, itemId];
	}
}

let _percent = $derived.by(() => {
	if (!finalStats) return 0;
	return (totalWeight / finalStats.carrySlotLimit) * 100;
});

let _progressColor = $derived.by(() => {
	if (!finalStats) return "bg-ether";
	const state = finalStats.encumbranceState;
	if (state === "overloaded") return "bg-blood animate-pulse";
	if (state === "encumbered") return "bg-bronze";
	return "bg-ether";
});
</script>

<section aria-labelledby="inventory-title" class="flex flex-col gap-6 animate-fade">
	<!-- Cabeçalho com seletor de herói -->
	<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-ether/20 pb-4">
		<div>
			<p class="text-sm font-semibold text-ether">Inventário Dinâmico e Carga</p>
			<h2 id="inventory-title" class="text-2xl font-semibold text-bone">Slots & Sobrecarga Tática</h2>
		</div>

		<div class="flex items-center gap-2 bg-void/50 p-2 rounded border border-ether/15 shrink-0">
			<label class="text-xs text-ether font-bold uppercase" for="inventory-char">Carga do Personagem:</label>
			<select id="inventory-char" class="runic-select max-w-[180px]" bind:value={selectedCharacterId}>
				{#each characters as char}
					<option value={char.id}>{char.name} (Físico: {char.physical})</option>
				{/each}
			</select>
		</div>
	</div>

	{#if selectedChar && finalStats}
		<!-- Estatísticas da Carga e Efeitos de Sobrecarga -->
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="border border-bronze bg-blood-shadow/40 px-4 py-3 rounded">
				<p class="text-xs font-semibold text-ether uppercase tracking-wider">Capacidade Utilizada</p>
				<p class="mt-1 text-xl font-bold text-bone font-mono">
					{totalWeight} / {finalStats.carrySlotLimit} Slots
				</p>
				<span class="text-[10px] text-bone/60">
					{selectedChar.ancestryId === "dwarf" ? "✨ Bônus Anão (+2 slots) aplicado" : "Limite base: Físico + Resistência + 6"}
				</span>
			</div>
			
			<div class="border border-bronze bg-blood-shadow/40 px-4 py-3 rounded">
				<p class="text-xs font-semibold text-ether uppercase tracking-wider">Estado de Carga</p>
				<p class="mt-1 text-xl font-bold text-bone">
					{#if finalStats.encumbranceState === 'overloaded'}
						❌ IMOBILIZADO
					{:else}
						{finalStats.encumbranceState === 'encumbered' ? '⚠️ LENTO' : '✔️ NORMAL'}
					{/if}
				</p>
				<span class="text-[10px] text-bone/60">
					{#if finalStats.encumbranceState === 'overloaded'}
						Sobrecarga extrema (> limite + 5 slots)
					{:else}
						{finalStats.encumbranceState === 'encumbered' ? 'Peso excede o limite ativo' : 'Peso dentro do limite seguro'}
					{/if}
				</span>
			</div>

			<div class="border border-bronze bg-blood-shadow/40 px-4 py-3 rounded">
				<p class="text-xs font-semibold text-ether uppercase tracking-wider">Deslocamento & Iniciativa</p>
				<p class="mt-1 text-xl font-bold text-bone font-mono">
					{finalStats.movementSpeedBase}m <span class="text-ether">/</span> +{finalStats.initiativeBase}
				</p>
				<span class="text-[10px] text-bone/60">
					{#if finalStats.encumbranceState === 'overloaded'}
						Movimento zerado e penalidade de -2 na iniciativa
					{:else if finalStats.encumbranceState === 'encumbered'}
						Movimento reduzido em -3m e iniciativa em -2
					{:else}
						Deslocamento padrão de 9m ativo
					{/if}
				</span>
			</div>
		</div>

		<!-- Barra de Progresso Rúnica -->
		<div class="p-4 bg-void/50 border border-bronze/45 rounded flex flex-col gap-2">
			<div class="flex justify-between items-center text-xs font-semibold">
				<span class="text-ether uppercase tracking-widest font-mono">Carga Máxima de Interlúdio</span>
				<span class="text-bone font-mono">{totalWeight} / {finalStats.carrySlotLimit} Slots ({Math.round(percent)}%)</span>
			</div>
			<div class="w-full h-3 bg-ruin border border-bronze/35 rounded overflow-hidden p-[2px]">
				<div 
					class="h-full rounded-sm transition-all duration-300 {progressColor}"
					style="width: {Math.min(100, percent)}%"
				></div>
			</div>
		</div>

		<!-- Listagem de Itens e Forja -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Seletor de Equipamentos (Equipar/Desequipar) -->
			<div class="border border-bronze bg-void/40 p-4 rounded flex flex-col">
				<h3 class="text-sm font-bold text-ether uppercase tracking-wider mb-3">📦 Equipar Mochila</h3>
				<p class="text-xs text-bone/70 mb-4">Selecione quais itens estão carregados na mochila ativa para atualizar o peso.</p>

				<div class="flex-1 max-h-[300px] overflow-y-auto pr-2 divide-y divide-ether/10">
					{#each CATALOG_ITEMS as item (item.id)}
						<button 
							type="button"
							class="w-full flex items-center justify-between py-2 text-left hover:bg-ether/5 px-2 rounded transition-all"
							onclick={() => toggleEquip(item.id)}
						>
							<div class="flex items-center gap-3">
								<input type="checkbox" checked={equippedItemIds.includes(item.id)} class="pointer-events-none" />
								<div>
									<p class="text-xs font-bold text-bone">{item.label}</p>
									<p class="text-[10px] text-ether/60 uppercase">{item.category}</p>
								</div>
							</div>
							<span class="text-xs font-bold text-ether font-mono">+{item.slotCost} {item.slotCost === 1 ? 'Slot' : 'Slots'}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Itens Equipados e Status Final -->
			<div class="border border-bronze bg-void/40 p-4 rounded flex flex-col">
				<h3 class="text-sm font-bold text-ether uppercase tracking-wider mb-3">🎒 Mochila Ativa</h3>
				<p class="text-xs text-bone/70 mb-4">Itens carregados no inventário que afetam o peso total.</p>

				<div class="flex-1 max-h-[300px] overflow-y-auto divide-y divide-ether/10">
					{#each CATALOG_ITEMS.filter(item => equippedItemIds.includes(item.id)) as item (item.id)}
						<div class="flex justify-between py-2.5 px-2">
							<div>
								<p class="text-xs font-bold text-bone">{item.label}</p>
								<p class="text-[10px] text-ether/60 uppercase">{item.category}</p>
							</div>
							<div class="flex items-center gap-3">
								<span class="text-xs font-bold text-ether font-mono">{item.slotCost} slot(s)</span>
								<button 
									type="button" 
									class="text-[10px] text-blood hover:underline font-bold"
									onclick={() => toggleEquip(item.id)}
								>
									Soltar
								</button>
							</div>
						</div>
					{/each}
					{#if equippedItemIds.length === 0}
						<p class="text-xs text-bone/50 text-center py-8">Mochila vazia. O herói viaja sem carga.</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</section>

