<script lang="ts">
import { onMount } from "svelte";
import { rpcCache } from "$lib/shared/rpc";

interface CampaignEvent {
	readonly id: string;
	readonly campaignId: string;
	readonly eventType: string;
	readonly description: string;
	readonly createdAt: string;
}

interface RuleToggle {
	readonly key: string;
	readonly label: string;
	readonly description: string;
	value: boolean;
}

let {
	campaignId = "primary",
	worker: propWorker = null,
	onTimelineLoaded = () => {},
	onRuleChanged = () => {},
} = $props<{
	campaignId?: string;
	worker?: Worker | null;
	onTimelineLoaded?: (events: readonly CampaignEvent[]) => void;
	onRuleChanged?: (key: string, value: boolean) => void;
}>();

// Estado reativo Svelte 5
let worker = $state<Worker | null>(null);
let events = $state<CampaignEvent[]>([]);
let activeFilter = $state<string>("all");
let isRulesLoading = $state(true);

// Lista de regras configuráveis (Toggles) com seus metadados
let rules = $state<RuleToggle[]>([
	{
		key: "system:rules:siege_on_extreme_infamy",
		label: "Cerco por Infâmia Extrema",
		description:
			"Inicia um Cerco militar automático contra o Bastião caso a infâmia com alguma facção atinja -10 ou menos.",
		value: true,
	},
	{
		key: "system:rules:block_rest_on_debt_marked",
		label: "Bloquear Descanso por Dívida",
		description:
			"Andarilhos sob o estado 'Marcado pela Dívida' têm seu Descanso de Acampamento interrompido por emboscadas garantidas.",
		value: true,
	},
	{
		key: "system:rules:weather_clear_on_clock_end",
		label: "Limpar Clima ao Concluir Relógio",
		description:
			"Limpa automaticamente o clima extremo do WorldState assim que o Relógio de Clima associado for totalmente preenchido.",
		value: true,
	},
	{
		key: "system:rules:threat_clock_cyclic",
		label: "Relógios de Ameaça Cíclicos",
		description:
			"Zera o progresso de Relógios de Ameaça em vez de deletá-los ao serem completados, gerando ameaças cíclicas recorrentes.",
		value: true,
	},
]);

// Logs de debug interno
let debugLogs = $state<string[]>([]);

function addDebugLog(msg: string) {
	debugLogs = [
		`[${new Date().toLocaleTimeString("pt-BR")}] ${msg}`,
		...debugLogs,
	];
}

// Inicialização e gerenciamento do Worker
onMount(async () => {
	if (propWorker) {
		worker = propWorker;
		addDebugLog("Utilizando Worker fornecido via propriedades.");
	} else {
		try {
			worker = new Worker(
				new URL(
					"../../../shared/persistence/worker/pandorhaDatabase.worker.ts",
					import.meta.url,
				),
				{ type: "module" },
			);
			addDebugLog("Worker local inicializado com sucesso.");
		} catch (err: any) {
			addDebugLog(`Falha ao instanciar Worker: ${err.message}`);
		}
	}

	if (worker) {
		// Registra o listener principal para respostas do Worker
		worker.addEventListener("message", handleWorkerResponse);

		// Carrega dados iniciais
		await loadTimeline();
		await loadRulesState();
	}
});

// Manipulador de respostas do worker
function handleWorkerResponse(event: MessageEvent) {
	const response = event.data;
	if (!response) return;

	if (response.success) {
		if (response.type === "GET_CAMPAIGN_TIMELINE") {
			events = response.data || [];
			addDebugLog(`Timeline carregada: ${events.length} eventos.`);
			onTimelineLoaded(events);
		} else if (response.type === "RECORD_CAMPAIGN_EVENT") {
			addDebugLog("Novo evento registrado manualmente no SQLite.");
			void loadTimeline();
		} else if (response.type === "SET_WORLD_STATE_FLAG") {
			addDebugLog("WorldState atualizado no SQLite.");
		} else if (response.type === "LIST_WORLD_STATE_FLAGS") {
			const flags = response.data || [];
			// Atualiza os valores das regras baseadas no WorldState carregado
			for (const rule of rules) {
				const match = flags.find((f: any) => f.key === rule.key);
				if (match) {
					rule.value = match.value === true;
				} else {
					rule.value = true; // Valor padrão ativo
				}
			}
			isRulesLoading = false;
			addDebugLog("Estado das regras de campanha sincronizado.");
		}
	} else {
		addDebugLog(
			`Erro do worker: ${response.error?.message || "Erro desconhecido"}`,
		);
	}
}

// Carrega a linha do tempo de eventos de campanha
async function loadTimeline() {
	if (!worker) return;
	rpcCache.invalidate("GET_CAMPAIGN_TIMELINE");

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "GET_CAMPAIGN_TIMELINE",
		payload: { campaignId },
	});
}

// Carrega o estado atual das regras de campanha do WorldState
async function loadRulesState() {
	if (!worker) return;
	isRulesLoading = true;
	rpcCache.invalidate("LIST_WORLD_STATE_FLAGS");

	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "LIST_WORLD_STATE_FLAGS",
		payload: {},
	});
}

// Atualiza o valor de uma regra
function toggleRule(ruleKey: string, currentValue: boolean) {
	if (!worker) return;
	const newValue = !currentValue;

	// Invalida o cache RPC relevante
	rpcCache.invalidate("SET_WORLD_STATE_FLAG");

	// Envia alteração para o banco
	worker.postMessage({
		messageId: crypto.randomUUID(),
		type: "SET_WORLD_STATE_FLAG",
		payload: {
			key: ruleKey,
			value: newValue,
		},
	});

	// Otimisticamente atualiza o estado local
	for (const rule of rules) {
		if (rule.key === ruleKey) {
			rule.value = newValue;
		}
	}

	addDebugLog(`Alterando regra '${ruleKey}' para ${newValue}.`);
	onRuleChanged(ruleKey, newValue);
}

// Filtro computado reativo
let filteredEvents = $derived(() => {
	if (activeFilter === "all") return events;
	return events.filter((e) => {
		if (activeFilter === "siege") return e.eventType.includes("siege");
		if (activeFilter === "weather") return e.eventType.includes("weather");
		if (activeFilter === "clock") return e.eventType.includes("clock");
		return e.eventType === activeFilter;
	});
});

// Mapeia o tipo de evento para cores e classes neon
function getEventColorClass(eventType: string): string {
	if (eventType.includes("siege")) return "event-red";
	if (eventType.includes("weather")) return "event-orange";
	if (eventType.includes("clock")) return "event-green";
	if (eventType.includes("pact") || eventType.includes("metamagic"))
		return "event-purple";
	return "event-blue";
}

// Formata o tipo de evento para exibição legível
function formatEventType(eventType: string): string {
	switch (eventType) {
		case "siege_start":
			return "💀 Cerco Iniciado";
		case "siege_resolve":
			return "🛡️ Cerco Resolvido";
		case "clock_advance":
			return "⏱️ Relógio Avançado";
		case "weather_shift":
			return "⛈️ Clima Alterado";
		case "faction_pact":
			return "🔮 Pacto de Patrocínio";
		case "ambience_change":
			return "🔔 Mudança Ambiental";
		default:
			return "📝 Evento Geral";
	}
}

// Formata data ISO para pt-BR amigável
function formatTime(isoStr: string): string {
	try {
		const date = new Date(isoStr);
		return (
			date.toLocaleDateString("pt-BR") +
			" " +
			date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
		);
	} catch {
		return isoStr;
	}
}
</script>

<div class="campaign-timeline-panel" data-testid="campaign-timeline-panel">
	<!-- Top Bar / Cabecalho -->
	<div class="panel-header">
		<div class="header-left">
			<h2 class="title">🌌 Crônica da Campanha</h2>
			<p class="subtitle">Registros históricos e governança de regras reativas para o Tier de Pandorha</p>
		</div>
		<span class="campaign-id-badge">ID: {campaignId}</span>
	</div>

	<div class="panel-content-grid">
		<!-- Linha do Tempo Principal (Esquerda) -->
		<div class="timeline-area">
			<div class="area-header">
				<h3 class="area-title">📜 Registro Histórico (Timeline)</h3>
				
				<!-- Filtros Interativos -->
				<div class="filters-container" data-testid="filters-container">
					<button 
						type="button"
						onclick={() => activeFilter = "all"}
						class="filter-btn"
						class:active={activeFilter === "all"}>
						Todos
					</button>
					<button 
						type="button"
						onclick={() => activeFilter = "siege"}
						class="filter-btn text-neon-red"
						class:active={activeFilter === "siege"}>
						Cercos
					</button>
					<button 
						type="button"
						onclick={() => activeFilter = "clock"}
						class="filter-btn text-neon-green"
						class:active={activeFilter === "clock"}>
						Clocks
					</button>
					<button 
						type="button"
						onclick={() => activeFilter = "weather"}
						class="filter-btn text-neon-orange"
						class:active={activeFilter === "weather"}>
						Clima
					</button>
				</div>
			</div>

			<!-- Lista de Eventos -->
			<div class="events-scroll-container" data-testid="event-list">
				{#each filteredEvents() as ev (ev.id)}
					<div class="timeline-item {getEventColorClass(ev.eventType)}" data-testid={`event-item-${ev.id}`}>
						<div class="timeline-marker"></div>
						<div class="event-card">
							<div class="event-card-header">
								<span class="event-type">{formatEventType(ev.eventType)}</span>
								<span class="event-date">{formatTime(ev.createdAt)}</span>
							</div>
							<p class="event-desc">{ev.description}</p>
						</div>
					</div>
				{:else}
					<div class="empty-state">
						<span class="empty-icon">📜</span>
						<p>Nenhum evento registrado nesta categoria na linha do tempo.</p>
					</div>
				{/each}
			</div>
		</div>

		<!-- Painel de Regras Customizaveis e Configuracoes (Direita) -->
		<div class="config-sidebar">
			<div class="area-header">
				<h3 class="area-title">⚙️ Regras Toggleable da Campanha</h3>
			</div>

			<div class="rules-container" data-testid="rules-container">
				{#if isRulesLoading}
					<div class="loading-state">
						<span class="loading-spinner"></span>
						<p>Sincronizando estado com o SQLite...</p>
					</div>
				{:else}
					{#each rules as rule (rule.key)}
						<div class="rule-card" class:rule-enabled={rule.value}>
							<div class="rule-info">
								<h4 class="rule-label">{rule.label}</h4>
								<p class="rule-description">{rule.description}</p>
								<span class="rule-namespace">{rule.key}</span>
							</div>
							
							<!-- Switch Customizado -->
							<button 
								type="button" 
								onclick={() => toggleRule(rule.key, rule.value)}
								class="switch-control"
								aria-label={`Toggle rule ${rule.label}`}
								data-testid={`rule-toggle-${rule.key.split(":").pop()}`}>
								<span class="switch-slider"></span>
							</button>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Debug console oculto ou historico de acoes da timeline -->
			<div class="debug-console">
				<h4 class="debug-title">🔌 Estado do barramento RPC</h4>
				<div class="debug-logs">
					{#each debugLogs as log}
						<div class="debug-entry">{log}</div>
					{:else}
						<div class="debug-empty">Nenhuma mensagem trafegada.</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>
