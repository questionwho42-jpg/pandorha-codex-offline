<script lang="ts">
import { onMount } from "svelte";
import { rpcCache } from "$lib/shared/rpc";

interface CharacterRecord {
	readonly id: string;
	readonly name: string;
}

interface ClockRecord {
	readonly id: string;
	readonly name: string;
	readonly totalSegments: number;
	readonly filledSegments: number;
	readonly isCompleted: boolean;
	readonly triggerEvent?: string;
}

let {
	characters = [],
	onSpawnCreature = () => {},
	onRenownMutated = () => {},
	onClockMutated = () => {},
} = $props<{
	characters: readonly CharacterRecord[];
	onSpawnCreature?: (creature: {
		actorId: string;
		label: string;
		profile: "brute" | "sniper" | "controller";
		hitPoints: number;
		initiativeBase: number;
	}) => void;
	onRenownMutated?: () => void;
	onClockMutated?: () => void;
}>();

// Estado reativo do componente
let clocks = $state<ClockRecord[]>([]);
let activeCharacterId = $state("");
let activeFactionId = $state("guild_explorers");
let renownNewValue = $state(10);
let targetSpawnName = $state("Rastejador das Brumas");
let targetSpawnProfile = $state<"brute" | "sniper" | "controller">("brute");
let targetSpawnHp = $state(45);
let targetSpawnInitiative = $state(4);

let customWorldStateKey = $state("plot:pista_revelada");
let customWorldStateValue = $state("true");

let worker = $state<Worker | null>(null);
let logs = $state<string[]>([]);

// Variáveis para aplicação de status effects na sandbox
let activeCharacterStatusEffects = $state<any[]>([]);
let selectedStatusType = $state<
	"eter_fever" | "wound_infection" | "viper_poison"
>("eter_fever");
let statusDurationTurns = $state<number | null>(3);

// Carrega efeitos de status ativos do herói selecionado
async function loadStatusEffects() {
	if (!worker || !activeCharacterId) {
		activeCharacterStatusEffects = [];
		return;
	}

	const messageId = crypto.randomUUID();
	worker.postMessage({
		messageId,
		type: "FIND_STATUS_EFFECTS",
		payload: { characterId: activeCharacterId },
	});

	const tempListener = (event: MessageEvent) => {
		const response = event.data;
		if (response.messageId === messageId && response.success) {
			activeCharacterStatusEffects = response.data || [];
			worker?.removeEventListener("message", tempListener);
		}
	};
	worker.addEventListener("message", tempListener);
}

// Aplica um novo efeito de status
function handleApplyStatusEffect() {
	if (!worker || !activeCharacterId) {
		addLog("Selecione um aventureiro válido.");
		return;
	}

	rpcCache.invalidate("SAVE_STATUS_EFFECT");

	const newEffect = {
		id: crypto.randomUUID(),
		characterId: activeCharacterId,
		type: selectedStatusType,
		severity: 2,
		severityMax: 4,
		isAggravated: false,
		createdAt: new Date().toISOString(),
		durationTurns: statusDurationTurns,
	};

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "SAVE_STATUS_EFFECT",
		payload: { effect: newEffect },
	});

	addLog(
		`Aplicando status [${selectedStatusType}] em ${activeCharacterId} com duração de ${statusDurationTurns} turnos...`,
	);

	// Aguarda e recarrega
	setTimeout(loadStatusEffects, 200);
}

// Remove um efeito de status ativo
function handleRemoveStatusEffect(effectId: string) {
	if (!worker) return;

	rpcCache.invalidate("DELETE_STATUS_EFFECT");

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "DELETE_STATUS_EFFECT",
		payload: { id: effectId },
	});

	addLog(`Removendo status effect ${effectId}...`);

	// Aguarda e recarrega
	setTimeout(loadStatusEffects, 200);
}

// Carregar efeitos de status reativamente ao alterar herói
$effect(() => {
	if (activeCharacterId && worker) {
		void loadStatusEffects();
	}
});

const FACTIONS = [
	{ id: "guild_explorers", name: "Guilda dos Exploradores" },
	{ id: "iron_order", name: "Ordem de Ferro" },
	{ id: "whispering_coven", name: "Aliança do Sussurro" },
];

function addLog(msg: string) {
	logs = [`[${new Date().toLocaleTimeString("pt-BR")}] ${msg}`, ...logs];
}

onMount(async () => {
	// Instancia o Worker
	worker = new Worker(
		new URL(
			"../../../shared/persistence/worker/pandorhaDatabase.worker.ts",
			import.meta.url,
		),
		{ type: "module" },
	);

	worker.onmessage = (event) => {
		const response = event.data;
		if (response.success) {
			if (response.data && response.data.clock) {
				addLog(`Relógio atualizado com sucesso!`);
				onClockMutated();
				void loadClocks();
			} else if (response.data && response.data.mutated) {
				addLog(`World State / Renome mutado com sucesso!`);
				onRenownMutated();
			} else if (response.data && response.data.spawned) {
				addLog(`Criatura '${response.data.actor.label}' spawnada com sucesso!`);
				onSpawnCreature(response.data.actor);
			} else {
				addLog(`Ação do Mestre executada no banco.`);
			}
		} else {
			addLog(`Erro do banco: ${response.error.message}`);
		}
	};

	if (characters.length > 0) {
		activeCharacterId = characters[0].id;
	}

	await loadClocks();
});

// Carrega os relógios a partir do banco de dados local via RPC
async function loadClocks() {
	if (!worker) return;
	rpcCache.invalidate("LIST_CLOCKS");

	const messageId = crypto.randomUUID();
	worker.postMessage({
		messageId,
		type: "LIST_CLOCKS",
		payload: {},
	});

	// Para lidar com a natureza assíncrona da listagem
	const tempListener = (event: MessageEvent) => {
		const response = event.data;
		if (response.messageId === messageId && response.success) {
			clocks = response.data || [];
			worker?.removeEventListener("message", tempListener);
		}
	};
	worker.addEventListener("message", tempListener);
}

// Envia comando para mutar Clocks manualmente
function handleTickClock(clockId: string, delta: number) {
	if (!worker) return;
	rpcCache.invalidate("TICK_CLOCK_MANUAL");

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "TICK_CLOCK_MANUAL",
		payload: { clockId, delta },
	});
}

// Envia comando para mutar reputação/renown
function handleMutateRenown() {
	if (!worker || !activeCharacterId) {
		addLog("Selecione um herói válido.");
		return;
	}

	rpcCache.invalidate("MUTATE_WORLD_STATE");

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "MUTATE_WORLD_STATE",
		payload: {
			factionRenownMutations: [
				{
					characterId: activeCharacterId,
					factionId: activeFactionId,
					value: renownNewValue,
				},
			],
		},
	});

	addLog(`Mutando renome do herói na facção para ${renownNewValue}...`);
}

// Envia comando para mutar chaves de World State
function handleMutateWorldState() {
	if (!worker || !customWorldStateKey) {
		addLog("Preencha a chave do World State.");
		return;
	}

	rpcCache.invalidate("MUTATE_WORLD_STATE");

	let parsedValue: any = customWorldStateValue;
	if (customWorldStateValue.toLowerCase() === "true") parsedValue = true;
	else if (customWorldStateValue.toLowerCase() === "false") parsedValue = false;
	else if (!Number.isNaN(Number(customWorldStateValue)))
		parsedValue = Number(customWorldStateValue);

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "MUTATE_WORLD_STATE",
		payload: {
			worldStateMutations: [
				{
					key: customWorldStateKey,
					value: parsedValue,
				},
			],
		},
	});

	addLog(`Configurando chave '${customWorldStateKey}' = ${parsedValue}...`);
}

// Envia comando para forçar spawn de criatura
function handleForceSpawn() {
	if (!worker || !targetSpawnName) return;

	rpcCache.invalidate("FORCE_SPAWN_ACTOR");

	const newActor = {
		actorId: `spawned-${crypto.randomUUID().substring(0, 8)}`,
		label: targetSpawnName,
		profile: targetSpawnProfile,
		hitPoints: targetSpawnHp,
		initiativeBase: targetSpawnInitiative,
	};

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "FORCE_SPAWN_ACTOR",
		payload: newActor,
	});

	addLog(
		`Solicitando spawn de ${targetSpawnName} (${targetSpawnProfile.toUpperCase()})...`,
	);
}
</script>

<div class="gm-sandbox-panel">
	<div class="header">
		<h2 class="title">🔮 Console de Sandbox do Narrador</h2>
		<span class="badge">Master Mode</span>
	</div>

	<div class="grid">
		<!-- CLOCKS E CONTROLE DE TEMPO -->
		<div class="card">
			<h3 class="card-title">🕒 Relógios de Progresso (SQLite)</h3>
			<div class="clock-list">
				{#each clocks as clock (clock.id)}
					<div class="clock-row">
						<div class="clock-info">
							<span class="clock-name">{clock.name}</span>
							<span class="clock-prog">{clock.filledSegments} / {clock.totalSegments}</span>
						</div>
						<div class="clock-actions">
							<button 
								type="button" 
								onclick={() => handleTickClock(clock.id, -1)} 
								disabled={clock.filledSegments <= 0}
								class="btn btn-sm btn-outline">-1</button>
							<button 
								type="button" 
								onclick={() => handleTickClock(clock.id, 1)} 
								disabled={clock.isCompleted}
								class="btn btn-sm btn-outline">+1</button>
						</div>
					</div>
				{:else}
					<p class="empty-msg">Nenhum relógio encontrado no SQLite.</p>
				{/each}
			</div>
			<div class="card-footer">
				<button type="button" onclick={loadClocks} class="btn btn-block">Recarregar Relógios</button>
			</div>
		</div>

		<!-- REPUTAÇÃO E RENOME -->
		<div class="card">
			<h3 class="card-title">🛡️ Mutador de Renome & Facções</h3>
			
			<div class="form-group">
				<label for="gm-renown-char">Aventureiro</label>
				<select id="gm-renown-char" bind:value={activeCharacterId} class="input">
					{#each characters as char (char.id)}
						<option value={char.id}>{char.name}</option>
					{:else}
						<option value="">Nenhum personagem criado</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="gm-renown-fac">Facção</label>
				<select id="gm-renown-fac" bind:value={activeFactionId} class="input">
					{#each FACTIONS as fac (fac.id)}
						<option value={fac.id}>{fac.name}</option>
					{/each}
				</select>
			</div>

			<div class="form-group">
				<label for="gm-renown-val">Novo Renome (Fama/Infâmia)</label>
				<input id="gm-renown-val" type="number" bind:value={renownNewValue} class="input" />
			</div>

			<button type="button" onclick={handleMutateRenown} class="btn btn-block btn-primary">Aplicar Mutação de Renome</button>
		</div>

		<!-- EFEITOS DE STATUS -->
		<div class="card" data-testid="gm-status-panel">
			<h3 class="card-title">🦠 Efeitos de Status Reativos (SQLite)</h3>
			
			<div class="form-group">
				<label for="gm-status-char">Aventureiro</label>
				<select id="gm-status-char" bind:value={activeCharacterId} class="input">
					{#each characters as char (char.id)}
						<option value={char.id}>{char.name}</option>
					{:else}
						<option value="">Nenhum personagem criado</option>
					{/each}
				</select>
			</div>

			<div class="form-row">
				<div class="form-group flex-1">
					<label for="gm-status-type">Efeito de Status</label>
					<select id="gm-status-type" bind:value={selectedStatusType} class="input">
						<option value="eter_fever">Febre do Éter (eter_fever)</option>
						<option value="wound_infection">Infecção de Ferida (wound_infection)</option>
						<option value="viper_poison">Veneno de Víbora (viper_poison)</option>
					</select>
				</div>

				<div class="form-group w-32">
					<label for="gm-status-turns">Duração (Turnos)</label>
					<input id="gm-status-turns" type="number" placeholder="Indefinido" bind:value={statusDurationTurns} class="input" />
				</div>
			</div>

			<button type="button" onclick={handleApplyStatusEffect} class="btn btn-block btn-primary">Aplicar Efeito de Status</button>

			<div class="border-t border-bronze/10 pt-3 mt-2">
				<p class="text-xs font-bold text-ether uppercase tracking-wider mb-2">Efeitos Ativos no SQLite:</p>
				<div class="clock-list" style="max-height: 100px;">
					{#each activeCharacterStatusEffects as effect (effect.id)}
						<div class="clock-row">
							<div class="clock-info">
								<span class="clock-name">{effect.type}</span>
								<span class="clock-prog">
									Duração: {effect.durationTurns !== null && effect.durationTurns !== undefined ? `${effect.durationTurns} turnos` : 'Infinito'}
								</span>
							</div>
							<button 
								type="button" 
								onclick={() => handleRemoveStatusEffect(effect.id)} 
								class="btn btn-sm btn-danger">Remover</button>
						</div>
					{:else}
						<p class="empty-msg">Nenhum efeito de status ativo neste personagem.</p>
					{/each}
				</div>
			</div>
		</div>

		<!-- WORLD STATE FLAGS -->
		<div class="card">
			<h3 class="card-title">🎚️ Flags Narrativas (World State)</h3>
			
			<div class="form-group">
				<label for="gm-ws-key">Chave da Flag</label>
				<input id="gm-ws-key" type="text" placeholder="plot:nome_pista" bind:value={customWorldStateKey} class="input" />
			</div>

			<div class="form-group">
				<label for="gm-ws-val">Valor (booleano, número ou texto)</label>
				<input id="gm-ws-val" type="text" placeholder="true / 42 / revelada" bind:value={customWorldStateValue} class="input" />
			</div>

			<button type="button" onclick={handleMutateWorldState} class="btn btn-block btn-secondary">Alterar Flag do Mundo</button>
		</div>

		<!-- SPAWN DE MONSTROS -->
		<div class="card">
			<h3 class="card-title">👹 Spawn Tático de Criaturas</h3>

			<div class="form-group">
				<label for="gm-spawn-name">Nome do Monstro</label>
				<input id="gm-spawn-name" type="text" bind:value={targetSpawnName} class="input" />
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="gm-spawn-prof">Papel Tático</label>
					<select id="gm-spawn-prof" bind:value={targetSpawnProfile} class="input">
						<option value="brute">Brute (Corpo-a-corpo / Alta CA)</option>
						<option value="sniper">Sniper (Distância / Frágil)</option>
						<option value="controller">Controller (Debuffs / Magia)</option>
					</select>
				</div>
				
				<div class="form-group w-24">
					<label for="gm-spawn-hp">HP Máx</label>
					<input id="gm-spawn-hp" type="number" min="1" bind:value={targetSpawnHp} class="input" />
				</div>

				<div class="form-group w-20">
					<label for="gm-spawn-init">Inic</label>
					<input id="gm-spawn-init" type="number" min="0" bind:value={targetSpawnInitiative} class="input" />
				</div>
			</div>

			<button type="button" onclick={handleForceSpawn} class="btn btn-block btn-danger">Forçar Spawn em Combate</button>
		</div>
	</div>

	<!-- LOGS DE EVENTO DO CONSOLE -->
	<div class="console-logs">
		<h4 class="logs-title">📜 Console de Ações do Narrador</h4>
		<div class="logs-container">
			{#each logs as log}
				<div class="log-entry">> {log}</div>
			{:else}
				<div class="log-empty">Console ocioso. Aguardando intervenções...</div>
			{/each}
		</div>
	</div>
</div>

