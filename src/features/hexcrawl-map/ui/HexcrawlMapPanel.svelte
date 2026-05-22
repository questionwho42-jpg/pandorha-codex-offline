<script lang="ts">
import type { CharacterRecord } from "$lib/entities/character";
import type { TrapRecord } from "$lib/entities/traps";
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
	onMoveSuccess?: (toTileBiome: string) => void | Promise<void>;
	// Propriedades de perigos integrados
	currentTraps?: readonly TrapRecord[];
	characters?: readonly CharacterRecord[];
	onDetectTrap?: (
		trapId: string,
		characterId: string,
		roll: number,
	) => Promise<void>;
	onDisarmTrap?: (
		trapId: string,
		characterId: string,
		roll: number,
		isTrained: boolean,
	) => Promise<void>;
};

let props: Props = $props();

let createMovementInput = $derived(props.createMovementInput);
let moveParty = $derived(props.moveParty);
let tiles = $derived(props.tiles);
let onMoveSuccess = $derived(props.onMoveSuccess);
let onDetectTrap = $derived(props.onDetectTrap);
let onDisarmTrap = $derived(props.onDisarmTrap);
let initialTileId = $derived(props.initialTileId);

let currentTileId = $state("");
let lastInitialTileId = "";
$effect(() => {
	if (initialTileId !== lastInitialTileId) {
		lastInitialTileId = initialTileId;
		currentTileId = initialTileId;
	}
});

let discoveredTileIds = $state<string[]>([]);
let errorMessage = $state<string | null>(null);
let events = $state<HexcrawlMovementEvent[]>([]);
let isMoving = $state(false);

// Controles locais de RPG
let selectedCharacterId = $state("");
let rollOverride = $state(10);

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

	// Resetar selecao de personagem ao mudar de bloco
	selectedCharacterId = "";

	if (onMoveSuccess) {
		// biome-ignore lint/suspicious/noExplicitAny: supports both old and new callback parameters
		await (onMoveSuccess as any)(
			result.data.toTile.biome,
			result.data.toTile.id,
		);
	}

	if (
		result.data.discoveredTile &&
		!discoveredTileIds.includes(result.data.toTile.id)
	) {
		discoveredTileIds = [...discoveredTileIds, result.data.toTile.id];
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleDetect(trapId: string) {
	if (!selectedCharacterId || !onDetectTrap) return;
	await onDetectTrap(trapId, selectedCharacterId, rollOverride);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleDisarm(trapId: string, isTrained: boolean) {
	if (!selectedCharacterId || !onDisarmTrap) return;
	await onDisarmTrap(trapId, selectedCharacterId, rollOverride, isTrained);
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

	<div class="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(290px,0.75fr)]">
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

			<!-- Painel de Armadilhas e Perigos -->
			{#if props.currentTraps && props.currentTraps.length > 0}
				<div class="mt-6 border-t border-bronze/40 pt-5">
					<p class="text-sm font-semibold text-bronze uppercase tracking-wider">⚠️ Perigos no Bloco</p>
					
					{#each props.currentTraps as trap (trap.id)}
						<div class="mt-3 border border-bronze/30 bg-ruin px-4 py-4 rounded-lg flex flex-col gap-3 shadow-[0_4px_12px_rgba(26,15,15,0.15)] transition-all duration-300">
							
							{#if !trap.isDetected}
								<div class="flex flex-col gap-2 items-center justify-center py-1 text-center">
									<p class="text-xs text-bone/60 font-semibold italic">
										Algo parece suspeito neste hexágono...
									</p>
									
									<div class="mt-2 w-full flex flex-col gap-2">
										<div class="flex items-center justify-between gap-2 text-xs">
											<span class="text-bone/60">Aventureiro:</span>
											<select 
												bind:value={selectedCharacterId} 
												class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-32"
											>
												<option value="">Selecione...</option>
												{#if props.characters}
													{#each props.characters as char}
														<option value={char.id}>{char.name}</option>
													{/each}
												{/if}
											</select>
										</div>
										
										<div class="flex items-center justify-between gap-2 text-xs">
											<span class="text-bone/60">Rolagem d20:</span>
											<input 
												type="number" 
												min="1" 
												max="20" 
												bind:value={rollOverride}
												class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-16 text-center" 
											/>
										</div>

										<button
											type="button"
											disabled={!selectedCharacterId}
											onclick={() => handleDetect(trap.id)}
											class="w-full mt-2 bg-bronze border border-ether/35 hover:bg-ether hover:text-void disabled:opacity-50 disabled:cursor-not-allowed text-void font-bold text-xs py-2 px-3 uppercase tracking-wider rounded transition-all"
										>
											🔍 Teste de Vigília
										</button>
									</div>
								</div>
							{:else}
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between gap-2">
										<span class="text-sm font-bold text-bone">{trap.name}</span>
										{#if trap.isDisarmed}
											<span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-ruin border border-emerald-poison/30 text-emerald-poison">
												✅ Desarmada
											</span>
										{:else if trap.isTriggered}
											<span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blood-shadow border border-blood/30 text-blood">
												💥 Disparada
											</span>
										{:else}
											<span class="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-ruin border border-bronze/30 text-ether">
												⚠️ Ativa
											</span>
										{/if}
									</div>

									<div class="grid grid-cols-2 gap-2 text-[11px] text-bone/70 mt-1 border-b border-bronze/20 pb-2">
										<div><span class="text-ether font-semibold">Tipo:</span> {trap.type === 'magical' ? 'Mágica' : 'Mecânica'}</div>
										<div><span class="text-ether font-semibold">Severidade:</span> {trap.severity}</div>
										<div><span class="text-ether font-semibold">DC Percepção:</span> {trap.dc + 10}</div>
										<div><span class="text-ether font-semibold">Dano Base:</span> {trap.damage} PV</div>
									</div>

									{#if !trap.isDisarmed && !trap.isTriggered}
										<div class="mt-2 flex flex-col gap-2">
											<div class="flex items-center justify-between gap-2 text-xs">
												<span class="text-bone/60">Aventureiro:</span>
												<select 
													bind:value={selectedCharacterId} 
													class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-32"
												>
													<option value="">Selecione...</option>
													{#if props.characters}
														{#each props.characters as char}
															<option value={char.id}>{char.name}</option>
														{/each}
													{/if}
												</select>
											</div>
											
											<div class="flex items-center justify-between gap-2 text-xs">
												<span class="text-bone/60">Rolagem d20:</span>
												<input 
													type="number" 
													min="1" 
													max="20" 
													bind:value={rollOverride}
													class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-16 text-center" 
												/>
											</div>

											<div class="flex gap-2 mt-1">
												<button
													type="button"
													disabled={!selectedCharacterId}
													onclick={() => handleDisarm(trap.id, true)}
													class="flex-1 bg-void border border-emerald-poison/40 hover:bg-ruin disabled:opacity-50 disabled:cursor-not-allowed text-emerald-poison font-bold text-[10px] py-2 px-1 uppercase tracking-wider rounded transition-all"
												>
													⚒️ Desarmar (Treinado)
												</button>
												<button
													type="button"
													disabled={!selectedCharacterId}
													onclick={() => handleDisarm(trap.id, false)}
													class="flex-1 bg-void border border-bronze/40 hover:bg-ruin disabled:opacity-50 disabled:cursor-not-allowed text-ether font-bold text-[10px] py-2 px-1 uppercase tracking-wider rounded transition-all"
												>
													Destreinado (-4)
												</button>
											</div>
										</div>
									{/if}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
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
