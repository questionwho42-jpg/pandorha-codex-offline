<script lang="ts">
import { onMount } from "svelte";
import type {
	CompendiumEntry,
	CompendiumFailure,
} from "$lib/entities/compendium";
import type { Result } from "$lib/shared/lib/result";
import {
	type CompendiumCategoryFilter,
	createCompendiumBrowserView,
	mapCompendiumFailure,
} from "../model/compendiumBrowserView";

type Props = {
	searchEntries: (
		input: unknown,
	) => Promise<Result<readonly CompendiumEntry[], CompendiumFailure>>;
};

let { searchEntries }: Props = $props();

let query = $state("");
let selectedCategory = $state<CompendiumCategoryFilter>("all");
let entries = $state<readonly CompendiumEntry[]>([]);
let selectedEntryId = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let errorMessage = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isSearching = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let view = $derived(
	createCompendiumBrowserView(entries, {
		query,
		selectedCategory,
		selectedEntryId,
	}),
);
let searchSequence = 0;

onMount(() => {
	void runSearch(query, selectedCategory);
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function updateQuery(event: Event): void {
	const nextQuery = (event.currentTarget as HTMLInputElement).value;
	query = nextQuery;
	void runSearch(nextQuery, selectedCategory);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectEntry(entryId: string): void {
	selectedEntryId = entryId;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectCategory(category: CompendiumCategoryFilter): void {
	selectedCategory = category;
	selectedEntryId = null;
	void runSearch(query, category);
}

async function runSearch(
	nextQuery: string,
	nextCategory: CompendiumCategoryFilter,
): Promise<void> {
	const currentSearch = searchSequence + 1;
	searchSequence = currentSearch;
	isSearching = true;

	const result = await searchEntries({
		category: nextCategory,
		limit: 200,
		query: nextQuery,
	});
	if (currentSearch !== searchSequence) {
		return;
	}

	isSearching = false;
	if (!result.success) {
		entries = [];
		selectedEntryId = null;
		errorMessage = mapCompendiumFailure(result.error);
		return;
	}

	entries = result.data;
	selectedEntryId = null;
	errorMessage = null;
}
</script>

<section aria-labelledby="compendium-browser-title" data-testid="compendium-browser">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Compêndio</p>
			<h2
				id="compendium-browser-title"
				class="mt-2 text-2xl font-semibold text-bone"
			>
				Consulta de regras
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Pesquise entradas curadas e o índice estático de sobrevivência, combate e magia.
			</p>
		</div>
		<p class="text-sm font-medium text-ether" data-testid="compendium-result-count">
			{isSearching ? "Buscando..." : view.countLabel}
		</p>
	</div>

	<label class="mt-6 block">
		<span class="text-sm font-semibold text-ether">Buscar no compêndio</span>
		<input
			type="search"
			value={query}
			oninput={updateQuery}
			data-testid="compendium-search-input"
			class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
			autocomplete="off"
			placeholder="Ex.: Vanguarda, contramagia ou descanso"
		/>
	</label>

	<div
		aria-label="Filtrar categoria do compendio"
		class="mt-4 flex flex-wrap gap-2"
		data-testid="compendium-category-filter"
		role="group"
	>
		{#each view.categoryOptions as option (option.id)}
			<button
				type="button"
				aria-pressed={option.isSelected}
				class="border px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
				class:border-ether={option.isSelected}
				class:bg-ether={option.isSelected}
				class:text-void={option.isSelected}
				class:border-bronze={!option.isSelected}
				class:bg-ruin={!option.isSelected}
				class:text-bone={!option.isSelected}
				data-testid="compendium-category-option"
				onclick={() => selectCategory(option.id)}
			>
				{option.label}
			</button>
		{/each}
	</div>

	{#if errorMessage}
		<div
			class="mt-5 border border-bronze bg-blood-shadow px-4 py-3 text-bone"
			data-testid="compendium-error"
		>
			{errorMessage}
		</div>
	{/if}

	<div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
		<div>
			{#if view.emptyState}
				<div
					class="border border-bronze bg-blood-shadow px-5 py-6"
					data-testid="compendium-empty-state"
				>
					<h3 class="text-lg font-semibold text-bone">{view.emptyState.title}</h3>
					<p class="mt-3 leading-7 text-bone">{view.emptyState.description}</p>
				</div>
			{:else}
				<ul class="divide-y divide-bronze border-y border-bronze">
					{#each view.items as item (item.id)}
						<li class="py-4" data-testid="compendium-result-item">
							<button
								type="button"
								aria-current={item.isSelected ? "true" : undefined}
								class="w-full border px-4 py-3 text-left transition-colors hover:border-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
								class:border-ether={item.isSelected}
								class:bg-blood-shadow={item.isSelected}
								class:border-bronze={!item.isSelected}
								class:bg-ruin={!item.isSelected}
								onclick={() => selectEntry(item.id)}
							>
								<span class="text-xs font-semibold text-ether">
									{item.categoryLabel}
								</span>
								<span class="mt-2 block text-lg font-semibold text-bone">
									{item.title}
								</span>
								<span class="mt-2 block leading-7 text-bone">{item.summary}</span>
								<span class="mt-2 block break-words text-xs text-ether">
									{item.sourceLabel}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<aside
			class="border border-bronze bg-blood-shadow px-5 py-6"
			data-testid="compendium-entry-detail"
		>
			{#if view.selectedEntry}
				<p class="text-sm font-semibold text-ether">
					{view.selectedEntry.categoryLabel}
				</p>
				<h3 class="mt-2 text-2xl font-semibold text-bone">
					{view.selectedEntry.title}
				</h3>
				<p class="mt-4 leading-7 text-bone">{view.selectedEntry.summary}</p>
				<p class="mt-5 text-sm font-semibold text-ether">Fonte</p>
				<p class="mt-2 break-words text-sm leading-6 text-bone">
					{view.selectedEntry.sourceLabel}
				</p>
			{:else}
				<h3 class="text-lg font-semibold text-bone">Detalhes da entrada</h3>
				<p class="mt-3 leading-7 text-bone">{view.detailInstruction}</p>
			{/if}
		</aside>
	</div>
</section>
