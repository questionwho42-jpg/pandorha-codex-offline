<script lang="ts">
import type { CharacterRecord } from "$lib/entities/character";
import { BaseCharacterStats } from "$lib/entities/character/domain/StatusEffectDecorator";
import type { TrapRecord } from "$lib/entities/traps";
import type { WorldTileRecord } from "$lib/entities/world-tile";
import { EncounterService } from "$lib/entities/world-tile/domain/EncounterService";
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
	onMoveSuccess?: (
		toTileBiome: string,
		toTileId?: string,
		encounterEvent?: EncounterEvent,
	) => void | Promise<void>;
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
	viewItems?: readonly any[];
};

let props: Props = $props();

let createMovementInput = $derived(props.createMovementInput);
let moveParty = $derived(props.moveParty);
let tiles = $derived(props.tiles);
let onMoveSuccess = $derived(props.onMoveSuccess);
let onDetectTrap = $derived(props.onDetectTrap);
let onDisarmTrap = $derived(props.onDisarmTrap);
let initialTileId = $derived(props.initialTileId);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let viewItems = $derived(props.viewItems);

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

// Controles da jornada de exploração (Batedor)
let selectedScoutId = $state("");
let scoutAttribute = $state<"physical" | "mental">("physical");
let ritmo = $state<"fast" | "normal" | "cautious">("normal");
let climaAdverso = $state(false);
let visibilidadeNula = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let selectedScoutView = $derived(
	props.viewItems?.find((c) => c.id === selectedScoutId),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function getClimateLabel(biome: string): string | null {
	if (biome === "marsh") return "🔥 Calor Extremo";
	if (biome === "forest") return "⚡ Tempestade Biomecânica";
	if (biome === "barrow" || biome === "ridge") return "❄️ Frio Extremo";
	return null;
}

let view = $derived(
	createHexcrawlMapView({
		currentTileId,
		discoveredTileIds,
		errorMessage,
		events,
		tiles,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function getBiomeClass(
	tileId: string,
	isCurrent: boolean,
	canMove: boolean,
): string {
	const originalTile = tiles.find((t) => t.id === tileId);
	const biome = originalTile?.biome ?? "road";

	if (isCurrent) {
		return "min-h-32 border px-4 py-4 text-left transition-all duration-300 border-ether bg-ether text-void font-bold shadow-[0_0_15px_rgba(218,185,115,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:cursor-not-allowed";
	}

	let baseClass =
		"min-h-32 border px-4 py-4 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:cursor-not-allowed ";

	if (!canMove) {
		baseClass += "opacity-60 cursor-not-allowed ";
	} else {
		baseClass += "hover:scale-[1.02] active:scale-[0.98] cursor-pointer ";
	}

	switch (biome) {
		case "road":
			return (
				baseClass +
				"border-bronze/35 bg-ruin/60 text-bone hover:border-ether/40 hover:bg-ruin"
			);
		case "forest":
			return (
				baseClass +
				"border-emerald-poison/40 bg-emerald-poison/10 text-bone hover:border-emerald-poison/70 hover:bg-emerald-poison/20"
			);
		case "watch":
			return (
				baseClass +
				"border-sky-runic/40 bg-sky-runic/10 text-bone hover:border-sky-runic/70 hover:bg-sky-runic/20"
			);
		case "ruins":
			return (
				baseClass +
				"border-purple-runic/40 bg-purple-runic/10 text-bone hover:border-purple-runic/70 hover:bg-purple-runic/20"
			);
		case "marsh":
			return (
				baseClass +
				"border-orange-hungry/40 bg-orange-hungry/10 text-bone hover:border-orange-hungry/70 hover:bg-orange-hungry/20"
			);
		case "barrow":
			return (
				baseClass +
				"border-bronze/20 bg-ruin/30 text-bone hover:border-bronze/50 hover:bg-ruin/50"
			);
		case "ridge":
			return (
				baseClass +
				"border-bronze/20 bg-ruin/30 text-bone hover:border-bronze/50 hover:bg-ruin/50"
			);
		default:
			return (
				baseClass +
				"border-bronze bg-blood-shadow text-bone hover:border-ether/40"
			);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function moveToTile(targetTileId: string): Promise<void> {
	const target = view.tiles.find((tile) => tile.id === targetTileId);
	if (!target?.canMove || isMoving) {
		return;
	}

	// Regra de RPG: Bloqueia movimento se nenhum batedor estiver alocado para a viagem
	if (!selectedScoutId) {
		errorMessage =
			"Selecione um batedor na seção de Preparação antes de viajar!";
		return;
	}

	const scout = props.characters?.find((c) => c.id === selectedScoutId);
	if (!scout) {
		errorMessage = "O batedor selecionado é inválido.";
		return;
	}

	const targetTileRecord = tiles.find((tile) => tile.id === targetTileId);
	if (!targetTileRecord) {
		errorMessage = "Hexágono de destino não encontrado.";
		return;
	}

	// 1. Instanciar o estado estatístico decorado do batedor
	const scoutStats = new BaseCharacterStats(scout, {
		id: scout.classId || "vanguard",
		baseHp: 8,
	});

	// 2. Chamar o serviço de exploração para realizar o teste do batedor
	const encounterService = new EncounterService();
	const checkResult = encounterService.resolveScoutCheck({
		scoutStats,
		attribute: scoutAttribute,
		targetTile: targetTileRecord,
		ritmo,
		climaAdverso,
		visibilidadeNula,
	});

	if (!checkResult.success) {
		errorMessage = checkResult.error.message;
		return;
	}

	const data = checkResult.data;

	// 3. Realizar o avanço no mapa hexagonal
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
	errorMessage = null;

	// 4. Anexar logs reativos descritivos e matemáticos da viagem
	const scoutEvent: HexcrawlMovementEvent = {
		type: "encounter-check-pending",
		message: `🧭 Batedor: ${scout.name} | Teste: ${scoutAttribute === "physical" ? "Físico" : "Mental"} | Rolagem: d20=${data.diceRoll}${data.diceRollAlt !== undefined ? ` (Alt=${data.diceRollAlt})` : ""} + mod=${data.attributeValue} | Total: ${data.totalRoll} vs CD Final: ${data.cdFinal} (Base=${data.cdBase}${data.modifiersApplied.difficultTerrain ? " + Terreno=3" : ""}${data.modifiersApplied.climaAdverso ? " + Clima=3" : ""}${data.modifiersApplied.visibilidadeNula ? " + Visibilidade=5" : ""}) | Resultado: ${data.outcome.toUpperCase()}`,
		tileId: targetTileId,
		createdAt: new Date().toISOString(),
	};

	let newEvents = [...result.data.events, scoutEvent];

	if (data.encounterEvent) {
		const encounterLogEvent: HexcrawlMovementEvent = {
			type: "encounter-check-pending",
			message: `⚠️ ENCONTRO! [${data.encounterEvent.type.toUpperCase()}] ${data.encounterEvent.name}: ${data.encounterEvent.description}`,
			tileId: targetTileId,
			createdAt: new Date().toISOString(),
		};
		newEvents.push(encounterLogEvent);
	}

	events = newEvents;

	// Resetar selecao de personagem de armadilhas ao mudar de bloco
	selectedCharacterId = "";

	if (onMoveSuccess) {
		// biome-ignore lint/suspicious/noExplicitAny: supports both old and new callback parameters
		await (onMoveSuccess as any)(
			result.data.toTile.biome,
			result.data.toTile.id,
			data.encounterEvent,
			visibilidadeNula,
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
					class={getBiomeClass(tile.id, tile.isCurrent, tile.canMove)}
				>
					<span class="block text-sm font-semibold">
						{tile.stateLabel}
					</span>
					<span class="mt-2 block text-lg font-semibold">{tile.label}</span>
					<span class="mt-3 block text-sm">
						{tile.biomeLabel} · {tile.regionTierLabel}
					</span>
					{#if getClimateLabel(tile.biome)}
						<span class="mt-2 inline-flex items-center gap-1 rounded bg-void/50 backdrop-blur-sm border border-ether/30 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-ether">
							{getClimateLabel(tile.biome)}
						</span>
					{/if}
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

			<!-- Preparação de Viagem (Batedor) -->
			<div class="mt-6 border-t border-bronze/40 pt-5">
				<p class="text-sm font-semibold text-ether uppercase tracking-wider">🧭 Preparação de Viagem</p>
				
				<div class="mt-3 flex flex-col gap-3">
					<!-- Seleção do Batedor -->
					<div class="flex flex-col gap-1">
						<span class="text-xs text-bone/60 font-semibold">Batedor Alocado:</span>
						<select 
							bind:value={selectedScoutId} 
							class="bg-void text-bone border border-bronze/40 px-2 py-1.5 rounded text-xs focus:outline-none focus:border-ether w-full"
						>
							<option value="">Selecione um batedor...</option>
							{#if props.characters}
								{#each props.characters as char}
									<option value={char.id}>{char.name}</option>
								{/each}
							{/if}
						</select>
						{#if selectedScoutView && selectedScoutView.statusEffects.length > 0}
							<div class="mt-2 flex flex-wrap gap-1.5">
								{#each selectedScoutView.statusEffects as effect}
									<span class="inline-flex items-center gap-1 rounded bg-blood-shadow/50 border border-blood/40 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-blood shadow-[0_0_8px_rgba(220,38,38,0.25)]">
										⚠️ {effect.label}
									</span>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Atributo do Teste -->
					<div class="flex flex-col gap-1">
						<span class="text-xs text-bone/60 font-semibold">Atributo do Teste:</span>
						<select 
							bind:value={scoutAttribute} 
							class="bg-void text-bone border border-bronze/40 px-2 py-1.5 rounded text-xs focus:outline-none focus:border-ether w-full"
						>
							<option value="physical">Físico</option>
							<option value="mental">Mental</option>
						</select>
					</div>

					<!-- Ritmo de Viagem -->
					<div class="flex flex-col gap-1">
						<span class="text-xs text-bone/60 font-semibold">Ritmo de Viagem:</span>
						<select 
							bind:value={ritmo} 
							class="bg-void text-bone border border-bronze/40 px-2 py-1.5 rounded text-xs focus:outline-none focus:border-ether w-full"
						>
							<option value="normal">Normal (Sem Modificadores)</option>
							<option value="fast">Rápido (-4 no Teste, Viagem Veloz)</option>
							<option value="cautious">Cauteloso (+4 no Teste, Viagem Lenta)</option>
						</select>
					</div>

					<!-- Condições Adversas -->
					<div class="flex flex-col gap-2 mt-1 border-t border-bronze/20 pt-2">
						<label class="flex items-center gap-2 text-xs text-bone/70 cursor-pointer">
							<input 
								type="checkbox" 
								bind:checked={climaAdverso} 
								class="accent-ether border-bronze/40"
							/>
							<span>🌧️ Clima Adverso (+3 CD)</span>
						</label>
						
						<label class="flex items-center gap-2 text-xs text-bone/70 cursor-pointer">
							<input 
								type="checkbox" 
								bind:checked={visibilidadeNula} 
								class="accent-ether border-bronze/40"
							/>
							<span>🌑 Visibilidade Nula (+5 CD)</span>
						</label>
					</div>
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
