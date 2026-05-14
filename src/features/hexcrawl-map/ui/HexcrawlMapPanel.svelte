<script lang="ts">
import type { WorldTileRecord } from "$lib/entities/world-tile";
import type { Result } from "$lib/shared/lib/result";
import {
	createHexcrawlMapView,
	mapHexcrawlMovementFailureToMessage,
} from "../model/hexcrawlMapView";
import type {
	HexcrawlMovementEvent,
	HexcrawlMovementFailure,
	HexcrawlMovementInput,
	HexcrawlMovementResult,
} from "../model/hexcrawlMovementTypes";

type Props = {
	createMovementInput: (
		currentTileId: string,
		targetTileId: string,
	) => HexcrawlMovementInput;
	initialTileId: string;
	moveParty: (
		input: unknown,
	) => Promise<Result<HexcrawlMovementResult, HexcrawlMovementFailure>>;
	tiles: readonly WorldTileRecord[];
};

let { createMovementInput, initialTileId, moveParty, tiles }: Props = $props();

// svelte-ignore state_referenced_locally: the initial training tile is captured once when the panel starts.
let currentTileId = $state(initialTileId);
let discoveredTileIds = $state<string[]>([]);
let errorMessage = $state<string | null>(null);
let events = $state<HexcrawlMovementEvent[]>([]);
let isMoving = $state(false);

let view = $derived(
	createHexcrawlMapView({
		currentTileId,
		discoveredTileIds,
		errorMessage,
		events,
		tiles,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function moveToTile(targetTileId: string): Promise<void> {
	const target = view.tiles.find((tile) => tile.id === targetTileId);
	if (!target?.canMove || isMoving) {
		return;
	}

	isMoving = true;
	const result = await moveParty(
		createMovementInput(currentTileId, targetTileId),
	);
	isMoving = false;

	if (!result.success) {
		errorMessage = mapHexcrawlMovementFailureToMessage(result.error);
		return;
	}

	currentTileId = result.data.toTile.id;
	events = [...result.data.events];
	errorMessage = null;

	if (
		result.data.discoveredTile &&
		!discoveredTileIds.includes(result.data.toTile.id)
	) {
		discoveredTileIds = [...discoveredTileIds, result.data.toTile.id];
	}
}
</script>

<section aria-labelledby="hexcrawl-map-title" data-testid="hexcrawl-map-panel">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Exploração</p>
			<h2 id="hexcrawl-map-title" class="mt-2 text-2xl font-semibold text-bone">
				Mapa de treino
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Movimente o grupo entre hexes adjacentes sem teste de Navegação,
				persistência ou encontro real.
			</p>
		</div>
		<p class="text-sm font-semibold text-ether" data-testid="hexcrawl-count">
			{view.tiles.length} hexes
		</p>
	</div>

	<div class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.75fr)]">
		<div
			class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
			data-testid="hexcrawl-map-grid"
		>
			{#each view.tiles as tile (tile.id)}
				<button
					type="button"
					disabled={!tile.canMove || isMoving}
					onclick={() => moveToTile(tile.id)}
					data-testid={`hexcrawl-tile-${tile.id}`}
					class="min-h-32 border px-4 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:cursor-not-allowed"
					class:border-ether={tile.isCurrent}
					class:bg-ether={tile.isCurrent}
					class:text-void={tile.isCurrent}
					class:border-bronze={!tile.isCurrent}
					class:bg-blood-shadow={!tile.isCurrent}
					class:text-bone={!tile.isCurrent}
					class:opacity-60={!tile.canMove && !tile.isCurrent}
				>
					<span class="block text-sm font-semibold">
						{tile.stateLabel}
					</span>
					<span class="mt-2 block text-lg font-semibold">{tile.label}</span>
					<span class="mt-3 block text-sm">
						{tile.biomeLabel} · {tile.regionTierLabel}
					</span>
					{#if tile.disabledReason}
						<span class="mt-3 block text-sm font-semibold">
							{tile.disabledReason}
						</span>
					{/if}
				</button>
			{/each}
		</div>

		<aside class="border border-bronze bg-blood-shadow px-5 py-5">
			<p class="text-sm font-semibold text-ether">Posição atual</p>
			<h3
				class="mt-2 text-xl font-semibold text-bone"
				data-testid="hexcrawl-current-tile"
			>
				{view.currentTileLabel}
			</h3>
			<div class="mt-5 grid gap-3">
				<div class="border border-bronze bg-ruin px-4 py-3">
					<p class="text-sm font-semibold text-ether">Bioma</p>
					<p class="mt-1 font-semibold text-bone">{view.biomeLabel}</p>
				</div>
				<div class="border border-bronze bg-ruin px-4 py-3">
					<p class="text-sm font-semibold text-ether">Região</p>
					<p class="mt-1 font-semibold text-bone">{view.regionTierLabel}</p>
				</div>
				<div class="border border-bronze bg-ruin px-4 py-3">
					<p class="text-sm font-semibold text-ether">Estado</p>
					<p
						class="mt-1 font-semibold text-bone"
						data-testid="hexcrawl-current-status"
					>
						{view.mappingStatusLabel}
					</p>
				</div>
			</div>
		</aside>
	</div>

	{#if view.errorMessage}
		<div
			class="mt-5 border border-bronze bg-blood-shadow px-4 py-3 text-bone"
			data-testid="hexcrawl-error"
		>
			{view.errorMessage}
		</div>
	{/if}

	<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-5">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<h3 class="text-lg font-semibold text-bone">Log de exploração</h3>
			<p class="text-sm font-semibold text-ether">Sessão atual</p>
		</div>

		{#if view.logEntries.length === 0}
			<p class="mt-4 leading-7 text-bone" data-testid="hexcrawl-empty-log">
				{view.logEmptyLabel}
			</p>
		{:else}
			<ul class="mt-4 divide-y divide-bronze" data-testid="hexcrawl-log">
				{#each view.logEntries as entry}
					<li class="py-3 leading-7 text-bone">{entry.message}</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
