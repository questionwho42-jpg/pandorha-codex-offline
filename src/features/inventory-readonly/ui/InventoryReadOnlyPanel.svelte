<script lang="ts">
import type { InventoryCapacityResult } from "$lib/shared/inventory";
import {
	createInventoryReadOnlyView,
	type InventoryReadOnlyItem,
} from "../model/inventoryReadOnlyView";

type Props = {
	capacity: InventoryCapacityResult;
	items: readonly InventoryReadOnlyItem[];
};

let { capacity, items }: Props = $props();

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(createInventoryReadOnlyView({ capacity, items }));

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let percent = $derived(
	capacity.slotLimit > 0 ? (capacity.usedSlots / capacity.slotLimit) * 100 : 0,
);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let progressColor = $derived(
	capacity.state === "normal"
		? "bg-ether"
		: capacity.state === "slowed"
			? "bg-bronze"
			: "bg-blood/80 border border-blood/50 animate-pulse",
);
</script>

<section aria-labelledby="inventory-readonly-title" data-testid="inventory-panel">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Inventário</p>
			<h2
				id="inventory-readonly-title"
				class="mt-2 text-2xl font-semibold text-bone"
			>
				Carga de treino
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Itens fixos do catálogo atual com carga calculada pela regra de slots.
			</p>
		</div>
		<p class="text-sm font-semibold text-ether" data-testid="inventory-count">
			{view.itemCountLabel}
		</p>
	</div>

	<div class="mt-6 grid gap-3 md:grid-cols-3">
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Slots</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="inventory-slot-usage"
			>
				{view.slotUsageLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Estado</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="inventory-state"
			>
				{view.stateLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Movimento</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="inventory-movement"
			>
				{view.movementLabel}
			</p>
		</div>
	</div>
	<p class="mt-4 leading-7 text-bone" data-testid="inventory-state-description">
		{view.stateDescription}
	</p>

	<!-- Barra de progresso de carga horizontal premium -->
	<div class="mt-6 p-4 bg-void border border-bronze/40 rounded flex flex-col gap-2">
		<div class="flex justify-between items-center text-xs font-semibold">
			<span class="text-ether uppercase tracking-wider">Capacidade de Carga Ativa</span>
			<span class="text-bone font-mono">{capacity.usedSlots} / {capacity.slotLimit} Slots ({Math.min(100, Math.round(percent))}% em uso)</span>
		</div>
		<div class="w-full h-3 bg-ruin border border-bronze/30 rounded overflow-hidden p-[2px]">
			<div 
				class="h-full rounded-sm transition-all duration-500 {progressColor}"
				style="width: {Math.min(100, percent)}%"
			></div>
		</div>
	</div>

	<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-6">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-lg font-semibold text-bone">Itens carregados</h3>
			<p class="text-sm font-semibold text-ether">Somente leitura</p>
		</div>
		<ul class="mt-4 divide-y divide-bronze" data-testid="inventory-item-list">
			{#each view.items as item (item.id)}
				<li class="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
					<div>
						<p class="text-base font-semibold text-bone">{item.label}</p>
						<p class="mt-1 text-sm text-ether">{item.categoryLabel}</p>
					</div>
					<p class="text-sm font-semibold text-bone">
						{item.slotCost}
						{item.slotCost === 1 ? "slot" : "slots"}
					</p>
				</li>
			{/each}
		</ul>
	</div>
</section>
