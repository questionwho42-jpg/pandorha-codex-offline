<script lang="ts">
import { fade, scale } from "svelte/transition";
import type { CharacterRecord } from "../../../entities/character";
import type {
	DungeonBiome,
	DungeonDelveRecord,
	DungeonRoomRecord,
} from "../../../entities/dungeon/model/dungeonSchema";
import type { TrapRecord } from "../../../entities/traps";

type Props = {
	campaignId: string;
	activeDelve: DungeonDelveRecord | null;
	rooms: DungeonRoomRecord[];
	isProcessing: boolean;
	onStartDelve: (
		biome: DungeonBiome,
		seed: number,
		dangerLevel: number,
	) => Promise<void>;
	onMoveParty: (roomId: string) => Promise<void>;
	onEscapeDelve?: () => Promise<void>;
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

let activeDelve = $derived(props.activeDelve);
let rooms = $derived(props.rooms);
let isProcessing = $derived(props.isProcessing);
let onStartDelve = $derived(props.onStartDelve);
let onMoveParty = $derived(props.onMoveParty);
let onEscapeDelve = $derived(props.onEscapeDelve);
let onDetectTrap = $derived(props.onDetectTrap);
let onDisarmTrap = $derived(props.onDisarmTrap);

// Controles locais de RPG
let selectedCharacterId = $state("");
let rollOverride = $state(10);

let currentTraps = $derived(
	props.currentTraps?.filter(
		(t) => t.tileId === `${activeDelve?.id}:${selectedRoom?.roomId}`,
	) ?? [],
);

async function handleDetect(trapId: string) {
	if (!selectedCharacterId || !onDetectTrap) return;
	await onDetectTrap(trapId, selectedCharacterId, rollOverride);
}

async function handleDisarm(trapId: string, isTrained: boolean) {
	if (!selectedCharacterId || !onDisarmTrap) return;
	await onDisarmTrap(trapId, selectedCharacterId, rollOverride, isTrained);
}

function generateSecureSeed(): number {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	const val = array[0];
	if (val === undefined) return 123456;
	return val % 1000000;
}

// Form state
let selectedBiome = $state<DungeonBiome>("ruins");
let seedInput = $state<number>(generateSecureSeed());
let dangerLevelInput = $state<number>(1);

// Visual state
let selectedRoomId = $state<string | null>(null);
let hoverRoomId = $state<string | null>(null);

// Determine the player's current position (the most recently cleared room, defaulting to room_0_0)
let currentRoomId = $derived.by(() => {
	if (rooms.length === 0) return "room_0_0";
	const clearedRooms = rooms.filter((r) => r.status === "cleared");
	if (clearedRooms.length === 0) return "room_0_0";

	// Sort by updatedAt or coordinate sum to find the latest explored room
	const sorted = [...clearedRooms].sort((a, b) => {
		const timeA = new Date(a.updatedAt).getTime();
		const timeB = new Date(b.updatedAt).getTime();
		if (timeA !== timeB) return timeB - timeA;
		return b.coordinateX + b.coordinateY - (a.coordinateX + a.coordinateY);
	});
	return sorted[0]?.roomId ?? "room_0_0";
});

// Grid helper
const gridSize = 4;
let grid = $derived.by(() => {
	const matrix: (DungeonRoomRecord | null)[][] = Array(gridSize)
		.fill(null)
		.map(() => Array(gridSize).fill(null));

	for (const room of rooms) {
		if (
			room.coordinateX >= 0 &&
			room.coordinateX < gridSize &&
			room.coordinateY >= 0 &&
			room.coordinateY < gridSize
		) {
			matrix[room.coordinateY][room.coordinateX] = room; // y-axis represents rows, x-axis represents columns
		}
	}
	return matrix;
});

// Room translations and styles
function getRoomTypeLabel(type: string): string {
	switch (type) {
		case "rest":
			return "Repouso";
		case "combat":
			return "Combate";
		case "treasure":
			return "Tesouro";
		case "puzzle":
			return "Enigma";
		case "boss":
			return "Chefe";
		default:
			return type;
	}
}

function getRoomTypeIcon(type: string): string {
	switch (type) {
		case "rest":
			return "⛺";
		case "combat":
			return "⚔️";
		case "treasure":
			return "📦";
		case "puzzle":
			return "🧩";
		case "boss":
			return "💀";
		default:
			return "❓";
	}
}

function getRoomColorClass(
	room: DungeonRoomRecord,
	isCurrent: boolean,
): string {
	if (room.status === "hidden") {
		return "border-void bg-void/80 text-bone/20";
	}

	const baseStyles =
		"transition-all duration-300 backdrop-blur-md cursor-pointer ";
	let statusStyles = "";

	if (room.status === "cleared") {
		statusStyles = "border-[2px] shadow-[0_0_15px_rgba(var(--neon-rgb),0.25)] ";
	} else if (room.status === "revealed") {
		statusStyles =
			"border-[2px] border-dashed opacity-80 hover:opacity-100 hover:scale-105 ";
	}

	let typeColors = "";
	let rgb = "200, 200, 200"; // fallback default

	if (room.status === "cleared" || room.status === "revealed") {
		switch (room.type) {
			case "rest":
				rgb = "16, 185, 129"; // green-500
				typeColors =
					room.status === "cleared"
						? "border-emerald-poison/80 bg-emerald-poison/20 text-emerald-poison"
						: "border-emerald-poison/40 bg-emerald-poison/10 text-emerald-poison/70 hover:border-emerald-poison";
				break;
			case "combat":
				rgb = "239, 68, 68"; // red-500
				typeColors =
					room.status === "cleared"
						? "border-blood/80 bg-blood/20 text-blood"
						: "border-blood/40 bg-blood/10 text-blood/70 hover:border-blood";
				break;
			case "treasure":
				rgb = "234, 179, 8"; // yellow-500
				typeColors =
					room.status === "cleared"
						? "border-orange-hungry/80 bg-orange-hungry/20 text-orange-hungry"
						: "border-orange-hungry/40 bg-orange-hungry/10 text-orange-hungry/70 hover:border-orange-hungry";
				break;
			case "puzzle":
				rgb = "6, 182, 212"; // cyan-500
				typeColors =
					room.status === "cleared"
						? "border-sky-runic/80 bg-sky-runic/20 text-sky-runic"
						: "border-sky-runic/40 bg-sky-runic/10 text-sky-runic/70 hover:border-sky-runic";
				break;
			case "boss":
				rgb = "168, 85, 247"; // purple-500
				typeColors =
					room.status === "cleared"
						? "border-purple-runic/80 bg-purple-runic/20 text-purple-runic"
						: "border-purple-runic/40 bg-purple-runic/10 text-purple-runic/70 hover:border-purple-runic";
				break;
		}
	}

	if (isCurrent) {
		typeColors +=
			" ring-2 ring-ether ring-offset-2 ring-offset-void animate-pulse";
	}

	return `${baseStyles} ${statusStyles} ${typeColors}`.trim();
}

function handleSelectRoom(room: DungeonRoomRecord) {
	if (room.status === "hidden") return;
	selectedRoomId = room.roomId;
}

async function handleMove(room: DungeonRoomRecord) {
	if (room.status !== "revealed" || isProcessing) return;
	await onMoveParty(room.roomId);
	selectedRoomId = room.roomId;
}

function randomizeSeed() {
	seedInput = generateSecureSeed();
}

// Derived logs from cleared rooms
let exploreLogs = $derived.by(() => {
	if (rooms.length === 0) return [];
	return rooms
		.filter((r) => r.status === "cleared")
		.sort(
			(a, b) =>
				new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
		)
		.map((r) => {
			const time = new Date(r.updatedAt).toLocaleTimeString("pt-BR", {
				hour: "2-digit",
				minute: "2-digit",
				second: "2-digit",
			});
			return `[${time}] Sala desbravada em (${r.coordinateX}, ${r.coordinateY}) -> Tipo: ${getRoomTypeLabel(r.type)}`;
		});
});

let selectedRoom = $derived(rooms.find((r) => r.roomId === selectedRoomId));
</script>

<div class="flex flex-col gap-6 text-bone">
	{#if !activeDelve}
		<!-- Form para iniciar delve -->
		<div class="rounded-lg border border-bronze/30 bg-ruin/15 p-6 backdrop-blur-md" in:fade>
			<h2 class="text-xl font-bold text-ether border-b border-bronze/20 pb-2 mb-4 flex items-center gap-2">
				⚔️ Nova Incursão de Masmorra
			</h2>
			<p class="text-xs text-bone/70 mb-6">
				Gere e explore deterministicamente masmorras biomecânicas. Cada semente gerará o mesmo layout de perigo e tesouros.
			</p>

			<div class="grid gap-6 md:grid-cols-3 mb-6">
				<!-- Biome Select -->
				<div class="flex flex-col gap-1.5">
					<label for="dungeon-biome" class="text-xs font-bold uppercase tracking-wider text-bronze">Bioma Subterrâneo</label>
					<select
						id="dungeon-biome"
						bind:value={selectedBiome}
						class="rounded border border-bronze/40 bg-void px-3 py-2 text-sm text-bone focus:border-ether focus:outline-none"
					>
						<option value="ruins">🏛️ Ruínas Antigas</option>
						<option value="caverns">🕸️ Cavernas Biomecânicas</option>
						<option value="crypt">⚰️ Cripta das Almas</option>
					</select>
				</div>

				<!-- Seed input -->
				<div class="flex flex-col gap-1.5">
					<label for="dungeon-seed" class="text-xs font-bold uppercase tracking-wider text-bronze">Semente Numérica (Seed)</label>
					<div class="flex gap-2">
						<input
							id="dungeon-seed"
							type="number"
							bind:value={seedInput}
							class="w-full rounded border border-bronze/40 bg-void px-3 py-2 text-sm text-bone focus:border-ether focus:outline-none"
						/>
						<button
							type="button"
							onclick={randomizeSeed}
							class="rounded border border-bronze/50 bg-ruin px-3 text-xs font-bold hover:border-ether hover:text-ether transition-colors"
							title="Randomizar Semente"
						>
							🎲
						</button>
					</div>
				</div>

				<!-- Danger Level input -->
				<div class="flex flex-col gap-1.5">
					<label for="dungeon-danger" class="text-xs font-bold uppercase tracking-wider text-bronze">Nível de Ameaça (1-5)</label>
					<input
						id="dungeon-danger"
						type="number"
						min="1"
						max="5"
						bind:value={dangerLevelInput}
						class="rounded border border-bronze/40 bg-void px-3 py-2 text-sm text-bone focus:border-ether focus:outline-none"
					/>
				</div>
			</div>

			<div class="flex justify-end border-t border-bronze/20 pt-4">
				<button
					type="button"
					onclick={() => onStartDelve(selectedBiome, seedInput, dangerLevelInput)}
					disabled={isProcessing}
					class="inline-flex items-center gap-2 rounded border border-ether/40 bg-ether px-6 py-2.5 text-sm font-extrabold uppercase tracking-wider text-void transition-all hover:bg-ether/85 hover:shadow-[0_0_12px_rgba(218,185,115,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				>
					{#if isProcessing}
						<span class="h-4 w-4 animate-spin rounded-full border-2 border-void border-t-transparent"></span>
						GERANDO...
					{:else}
						⚔️ Iniciar Incursão
					{/if}
				</button>
			</div>
		</div>
	{:else}
		<!-- Masmorra ativa -->
		<div class="grid gap-6 lg:grid-cols-[1fr_360px]" in:fade>
			<!-- Grid da Masmorra -->
			<div class="rounded-lg border border-bronze/35 bg-ruin/5 p-6 backdrop-blur-md flex flex-col gap-4">
				<div class="flex flex-wrap items-center justify-between gap-4 border-b border-bronze/20 pb-3">
					<div>
						<div class="flex items-center gap-2">
							<span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-bronze/20 text-bronze">
								{#if activeDelve.biome === "ruins"}🏛️ Ruínas
								{:else}🕸️ Cavernas
								{/if}
							</span>
							<span class="text-xs font-mono text-bone/60">Seed: {activeDelve.seed}</span>
						</div>
						<h2 class="text-lg font-bold text-bone mt-1">
							Incursão Ativa — Ameaça {activeDelve.dangerLevel}
						</h2>
					</div>

					<div class="flex gap-2">
						{#if onEscapeDelve}
							<button
								type="button"
								onclick={onEscapeDelve}
								disabled={isProcessing}
								class="px-4 py-1.5 border border-blood/50 bg-blood-shadow/20 text-blood rounded text-xs font-bold hover:bg-blood/20 transition-all uppercase tracking-wider cursor-pointer"
							>
								🚪 Escapar
							</button>
						{/if}
					</div>
				</div>

				<!-- Visual Grid Container -->
				<div class="flex justify-center items-center py-6 bg-void/40 rounded-md border border-bronze/10 relative overflow-hidden">
					<!-- Fundo runico sutil -->
					<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--neon-rgb),0.05),transparent_60%)] pointer-events-none"></div>
					
					<!-- 4x4 Room Grid -->
					<div class="grid grid-cols-4 gap-8 md:gap-12 relative z-10 p-4">
						{#each grid as row, y}
							{#each row as room, x}
								{#if room}
									{@const isCurrent = room.roomId === currentRoomId}
									<!-- Célula da Sala -->
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<div
										class="relative w-16 h-16 md:w-20 md:h-20 rounded-lg flex flex-col justify-center items-center select-none {getRoomColorClass(room, isCurrent)}"
										style="--neon-rgb: {room.type === 'rest' ? '16, 185, 129' : room.type === 'combat' ? '239, 68, 68' : room.type === 'treasure' ? '234, 179, 8' : room.type === 'puzzle' ? '6, 182, 212' : '168, 85, 247'}"
										onclick={() => handleSelectRoom(room)}
										ondblclick={() => handleMove(room)}
										onmouseenter={() => hoverRoomId = room.roomId}
										onmouseleave={() => hoverRoomId = null}
									>
										{#if room.status === "hidden"}
											<span class="text-lg text-bone/20 font-bold">?</span>
										{:else}
											<span class="text-2xl md:text-3xl filter drop-shadow-[0_0_8px_rgba(var(--neon-rgb),0.6)]">
												{getRoomTypeIcon(room.type)}
											</span>
											<span class="text-[9px] md:text-[10px] font-bold tracking-wider mt-1 opacity-80 uppercase">
												{getRoomTypeLabel(room.type)}
											</span>
										{/if}

										<!-- Marcador de Grupo -->
										{#if isCurrent}
											<div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-ether border border-void text-void text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded shadow-[0_0_8px_#dab973] animate-bounce">
												Grupo
											</div>
										{/if}
										
										<!-- Indicador de destino elegível para movimento -->
										{#if room.status === "revealed" && !isProcessing}
											<div class="absolute inset-0 border border-sky-runic/30 rounded-lg animate-ping pointer-events-none"></div>
										{/if}
									</div>
								{:else}
									<div class="w-16 h-16 md:w-20 md:h-20 border border-dashed border-bronze/10 rounded-lg opacity-20"></div>
								{/if}
							{/each}
						{/each}
					</div>
				</div>

				<div class="text-xs text-bone/60 italic text-center">
					💡 Dica: Clique duplo em uma sala revelada (tracejada) para se mover até ela.
				</div>
			</div>

			<!-- Painel de Inspeção Lateral -->
			<div class="flex flex-col gap-6">
				<!-- Detalhes da Sala Selecionada -->
				<div class="rounded-lg border border-bronze/35 bg-ruin/5 p-4 backdrop-blur-md">
					<h3 class="text-sm font-bold uppercase tracking-wider text-ether border-b border-bronze/20 pb-2 mb-3">
						🔍 Inspecionar Sala
					</h3>

					{#if selectedRoom}
						<div class="flex flex-col gap-3" in:fade={{ duration: 150 }}>
							<div class="flex items-center justify-between">
								<span class="text-xs font-mono text-bone/60">Coordenadas: ({selectedRoom.coordinateX}, {selectedRoom.coordinateY})</span>
								<span class="text-xs font-bold uppercase px-2 py-0.5 rounded
									{selectedRoom.status === 'cleared' ? 'bg-emerald-poison/20 text-emerald-poison' : 'bg-sky-runic/20 text-sky-runic'}">
									{selectedRoom.status === 'cleared' ? 'Explorada' : 'Revelada'}
								</span>
							</div>

							<div class="flex items-center gap-2 my-1">
								<span class="text-3xl">{getRoomTypeIcon(selectedRoom.type)}</span>
								<div>
									<h4 class="font-bold text-bone">{getRoomTypeLabel(selectedRoom.type)}</h4>
									<p class="text-xs text-bone/60">Câmara Subterrânea</p>
								</div>
							</div>

							<div class="text-xs bg-void/60 p-3 rounded border border-bronze/10">
								{#if selectedRoom.type === "combat"}
									⚔️ **Câmara Hostil:** Inimigos biomecânicos barram sua passagem. É necessário derrotá-los para desbravar os arredores.
								{:else}
									{#if selectedRoom.type === "treasure"}
										📦 **Tesouro Oculto:** Caixa de suprimentos rúnicos e ligas metálicas deixadas por civilizações anteriores.
									{:else}
										{#if selectedRoom.type === "puzzle"}
											🧩 **Enigma Criptográfico:** Um mecanismo de engrenagens rúnicas bloqueia os acessos. Exige um teste mental para decifrar.
										{:else}
											{#if selectedRoom.type === "rest"}
												🏕️ **Área de Descanso:** Fresta segura contra as intempéries climáticas. Ótimo ponto para montar acampamento.
											{:else}
												💀 **Câmara do Chefe:** Presença de alta letalidade detectada. Vencer este combate garantirá a sobrevivência e conclusão da masmorra.
											{/if}
										{/if}
									{/if}
								{/if}
							</div>

							{#if selectedRoom.status === "revealed" && !isProcessing}
								<button
									type="button"
									onclick={() => handleMove(selectedRoom!)}
									class="w-full mt-2 rounded border border-sky-runic/50 bg-sky-runic/20 text-sky-runic py-2 text-xs font-bold uppercase tracking-wider hover:bg-sky-runic/40 hover:text-bone transition-all cursor-pointer"
								>
									🚀 Entrar nesta Sala
								</button>
							{/if}

							<!-- Painel de Armadilhas e Perigos na Sala da Masmorra -->
							{#if currentTraps && currentTraps.length > 0}
								<div class="mt-4 border-t border-bronze/40 pt-4">
									<p class="text-xs font-semibold text-bronze uppercase tracking-wider">⚠️ Perigos no Bloco</p>
									
									{#each currentTraps as trap (trap.id)}
										<div class="mt-2 border border-bronze/30 bg-ruin px-3 py-3 rounded flex flex-col gap-2 shadow-[0_4px_12px_rgba(26,15,15,0.15)] transition-all duration-300">
											
											{#if !trap.isDetected}
												<div class="flex flex-col gap-1.5 items-center justify-center text-center">
													<p class="text-[11px] text-bone/60 font-semibold italic">
														Algo parece suspeito nesta sala...
													</p>
													
													<div class="w-full flex flex-col gap-1.5">
														<div class="flex items-center justify-between gap-2 text-xs">
															<span class="text-bone/60">Aventureiro:</span>
															<select 
																bind:value={selectedCharacterId} 
																class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-28"
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
																class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-12 text-center" 
															/>
														</div>

														<button
															type="button"
															disabled={!selectedCharacterId}
															onclick={() => handleDetect(trap.id)}
															class="w-full mt-1 bg-bronze border border-ether/35 hover:bg-ether hover:text-void disabled:opacity-50 disabled:cursor-not-allowed text-void font-bold text-[10px] py-1.5 px-2 uppercase tracking-wider rounded transition-all cursor-pointer"
														>
															🔍 Teste de Vigília
														</button>
													</div>
												</div>
											{:else}
												<div class="flex flex-col gap-1.5">
													<div class="flex items-center justify-between gap-2">
														<span class="text-xs font-bold text-bone">{trap.name}</span>
														{#if trap.isDisarmed}
															<span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-ruin border border-emerald-poison/30 text-emerald-poison">
																✅ Desarmada
															</span>
														{:else if trap.isTriggered}
															<span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-blood-shadow border border-blood/30 text-blood">
																💥 Disparada
															</span>
														{:else}
															<span class="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-ruin border border-bronze/30 text-ether">
																⚠️ Ativa
															</span>
														{/if}
													</div>

													<div class="grid grid-cols-2 gap-1 text-[10px] text-bone/70 border-b border-bronze/20 pb-1.5">
														<div><span class="text-ether font-semibold">Tipo:</span> {trap.type === 'magical' ? 'Mágica' : 'Mecânica'}</div>
														<div><span class="text-ether font-semibold">Dificuldade:</span> {trap.dc + 10}</div>
														<div><span class="text-ether font-semibold">Severidade:</span> {trap.severity}</div>
														<div><span class="text-ether font-semibold">Dano Base:</span> {trap.damage} PV</div>
													</div>

													{#if !trap.isDisarmed && !trap.isTriggered}
														<div class="mt-1 flex flex-col gap-1.5">
															<div class="flex items-center justify-between gap-2 text-xs">
																<span class="text-bone/60">Aventureiro:</span>
																<select 
																	bind:value={selectedCharacterId} 
																	class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-28"
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
																	class="bg-void text-bone border border-bronze/40 px-2 py-1 rounded text-xs focus:outline-none focus:border-ether w-12 text-center" 
																/>
															</div>

															<div class="flex gap-1.5 mt-1">
																<button
																	type="button"
																	disabled={!selectedCharacterId}
																	onclick={() => handleDisarm(trap.id, true)}
																	class="flex-1 bg-void border border-emerald-poison/40 hover:bg-ruin disabled:opacity-50 disabled:cursor-not-allowed text-emerald-poison font-bold text-[9px] py-1.5 px-1 uppercase tracking-wider rounded transition-all cursor-pointer"
																>
																	⚒️ Desarmar (Treinado)
																</button>
																<button
																	type="button"
																	disabled={!selectedCharacterId}
																	onclick={() => handleDisarm(trap.id, false)}
																	class="flex-1 bg-void border border-bronze/40 hover:bg-ruin disabled:opacity-50 disabled:cursor-not-allowed text-ether font-bold text-[9px] py-1.5 px-1 uppercase tracking-wider rounded transition-all cursor-pointer"
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
						</div>
					{:else}
						<p class="text-xs text-bone/50 italic text-center py-6">
							Selecione uma sala no mapa para inspecionar seus perigos ou recursos.
						</p>
					{/if}
				</div>

				<!-- Log de Exploração -->
				<div class="rounded-lg border border-bronze/35 bg-ruin/5 p-4 backdrop-blur-md flex-1 min-h-[200px] flex flex-col">
					<h3 class="text-sm font-bold uppercase tracking-wider text-ether border-b border-bronze/20 pb-2 mb-3">
						📜 Relatório de Exploração
					</h3>

					<div class="flex-1 overflow-y-auto max-h-[250px] pr-1 flex flex-col gap-2 font-mono text-[10px] text-bone/75">
						{#if exploreLogs.length === 0}
							<p class="italic text-bone/40 text-center py-6">Nenhum evento registrado ainda.</p>
						{:else}
							{#each exploreLogs as log}
								<div class="border-b border-bronze/5 pb-1 last:border-0">{log}</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
