<script lang="ts">
import { onMount } from "svelte";
import { WorkerCampRepository } from "$lib/entities/camp/infrastructure/WorkerCampRepository";
import type { CampSessionRecord } from "$lib/entities/camp/model/campSchema";
import type { CampActivity } from "../domain/CampService";
import { CampService } from "../domain/CampService";
import {
	BanqueteDecorator,
	StandardRecovery,
} from "../domain/recoveryDecorators";

interface Props {
	isRestBlocked?: boolean;
	isInfectionBlocked?: boolean;
	characterName?: string;
	onRestSuccess?: () => void | Promise<void>;
	rations?: number;
	onConsumeRation?: (amount: number) => void;

	// Estado global de Fama e Dívida compartilhados
	fame?: number;
	bloodDebt?: number;
	characters?: { id: string; name: string }[];
	onUpdateDangerCounter?: (val: number) => void;
}

let {
	isRestBlocked = false,
	isInfectionBlocked = false,
	characterName = "Andarilho",
	onRestSuccess,
	rations = 5,
	onConsumeRation,
	fame = 2,
	bloodDebt = 3,
	characters = [],
	onUpdateDangerCounter,
}: Props = $props();

// Instanciação física do repositório de Worker e do serviço
const repository = new WorkerCampRepository();
const service = new CampService(repository);

// Identificador único da sessão de acampamento desta noite
const SESSION_ID = "active_camp_session";

// Estados Svelte 5
let session = $state<CampSessionRecord | null>(null);
let totalHours = $state(12);
let sleepHours = $state(8);
let _message = $state("Prepare seu acampamento sob as estrelas de Éter...");

// Seleção de atividade ativa na UI
let selectedCharacterId = $state("");
let selectedActivityId = $state("vigilia_ativa");
let leaderModifier = $state(2);
let d20Roll = $state(10);
let fireActive = $state(false);

// Resultados GM
let _lastActivitySuccess = $state<boolean | null>(null);
let _lastEncounterRoll = $state<number | null>(null);
let lastEncounterEvent = $state<string | null>(null);

// Catálogo com as 15 Atividades Táticas do Códex do Pandorha
const ACTIVITIES_CATALOG = [
	// Físico
	{
		id: "vigilia_ativa",
		name: "🛡️ Vigília Ativa",
		matrix: "Physical",
		difficulty: 10,
		isCollective: false,
		desc: "Mitiga o perigo do local (-2 de perigo se sucesso).",
	},
	{
		id: "reparar_armaduras",
		name: "🔨 Reparar Armaduras",
		matrix: "Physical",
		difficulty: 12,
		isCollective: false,
		desc: "Restaura integridade dos equipamentos e kits.",
	},
	{
		id: "cacar_ruinas",
		name: "🏹 Caçar nas Ruínas",
		matrix: "Physical",
		difficulty: 12,
		isCollective: false,
		desc: "Busca alimentos no entorno (+1d2 Rações se sucesso).",
	},
	{
		id: "fortificar_perimetro",
		name: "🧱 Fortificar Perímetro",
		matrix: "Physical",
		difficulty: 12,
		isCollective: true,
		maxSuccess: 3,
		desc: "Relógio de Grupo (3 sucessos). Reduz letalidade de emboscadas.",
	},
	{
		id: "limpar_perimetro",
		name: "🧹 Limpar Perímetro",
		matrix: "Physical",
		difficulty: 8,
		isCollective: false,
		desc: "Reduz a chance de rastro térmico do calor de éter.",
	},

	// Mental
	{
		id: "destilar_alquimia",
		name: "🧪 Destilar Alquimia",
		matrix: "Mental",
		difficulty: 14,
		isCollective: false,
		desc: "Cria um frasco de medicamento biomecânico (cura infecção).",
	},
	{
		id: "mapear_entorno",
		name: "🗺️ Mapear Entorno",
		matrix: "Mental",
		difficulty: 12,
		isCollective: false,
		desc: "Concede +1 nas jogadas de travessia do próximo recesso.",
	},
	{
		id: "analisar_tecnofagia",
		name: "🔬 Analisar Tecnofagia",
		matrix: "Mental",
		difficulty: 15,
		isCollective: false,
		desc: "Decodifica nanorobôs hostis para obter pistas arqueológicas.",
	},
	{
		id: "meditar_eter",
		name: "🔮 Meditar no Éter",
		matrix: "Mental",
		difficulty: 10,
		isCollective: false,
		desc: "Permite recuperar 1 Ponto de Energia de Feitiço (EE).",
	},
	{
		id: "diario_borda",
		name: "📝 Diário de Borda",
		matrix: "Mental",
		difficulty: 8,
		isCollective: false,
		desc: "Registra os dados da viagem para obter bônus de XP de grupo.",
	},

	// Social
	{
		id: "preparar_banquete",
		name: "🍳 Preparar Banquete",
		matrix: "Social",
		difficulty: 10,
		isCollective: false,
		desc: "Culinária premium. Habilita o Decorador de cura (+25% cura no descanso).",
	},
	{
		id: "contar_historias",
		name: "🎶 Contar Histórias",
		matrix: "Social",
		difficulty: 10,
		isCollective: false,
		desc: "Eleva o moral. Cura 1 ponto de HP Mental de exaustão.",
	},
	{
		id: "xadrez_eter",
		name: "♟️ Xadrez de Éter",
		matrix: "Social",
		difficulty: 12,
		isCollective: false,
		desc: "Concede +2 de Iniciativa no próximo combate tático.",
	},
	{
		id: "pactuar_segredos",
		name: "🤝 Pactuar Segredos",
		matrix: "Social",
		difficulty: 14,
		isCollective: false,
		desc: "Estreita laços com um herói, gerando 1 ponto de sinergia.",
	},
	{
		id: "orar_ancestrais",
		name: "📿 Orar aos Ancestrais",
		matrix: "Social",
		difficulty: 10,
		isCollective: false,
		desc: "Abencoa o grupo (pode refazer 1 falha tática no próximo turno).",
	},
];

let selectedActivity = $derived(
	ACTIVITIES_CATALOG.find((act) => act.id === selectedActivityId) ??
		ACTIVITIES_CATALOG[0]!,
);

let isBloodDebtBlocked = $derived(bloodDebt > fame * 3);

// Tenta recuperar sessão existente no banco
async function loadActiveSession() {
	const res = await repository.findById(SESSION_ID);
	if (res.success) {
		session = res.data;
		fireActive = JSON.parse(session.activeActivitiesJson).some(
			(a: any) => a.id === "fogueira_ativa",
		);
		_message = "🔥 Sessão de acampamento ativa carregada do banco local.";
		if (onUpdateDangerCounter) {
			onUpdateDangerCounter(session.dangerCounter);
		}
	} else {
		session = null;
	}
}

onMount(async () => {
	if (characters.length > 0) {
		selectedCharacterId = characters[0].id;
	}
	await loadActiveSession();
});

// Inicia acampamento
async function _startCamp() {
	if (isRestBlocked || isBloodDebtBlocked) {
		_message =
			"⚠️ O acampamento foi bloqueado! Perigo imediato ou cobrança de sangue ativa.";
		return;
	}

	const res = await service.createSession(SESSION_ID, {
		totalTime: totalHours,
		sleepHours,
	});
	if (res.success) {
		session = res.data;
		fireActive = false;
		_message =
			"🔥 Acampamento montado sob as ruínas. Aloque cada aventureiro para realizar tarefas.";
		if (onUpdateDangerCounter) {
			onUpdateDangerCounter(session.dangerCounter);
		}
	} else {
		_message = `❌ Falha ao montar acampamento: ${res.error.message}`;
	}
}

// Acende ou apaga fogueira (+3 perigo)
async function _handleToggleFire() {
	if (!session) return;
	const nextState = !fireActive;
	const res = await service.toggleFogueira(SESSION_ID, nextState);
	if (res.success) {
		session = res.data;
		fireActive = nextState;
		_message = fireActive
			? "🔥 Fogueira de Éter acesa! (+3 perigo acumulado devido à visibilidade)."
			: "💨 Fogueira apagada. O perigo térmico foi mitigado.";
		if (onUpdateDangerCounter) {
			onUpdateDangerCounter(session.dangerCounter);
		}
	} else {
		_message = `❌ Falha ao alterar fogueira: ${res.error.message}`;
	}
}

// Executa atividade selecionada
async function _handleExecuteActivity() {
	if (!session) return;

	const performer = characters.find((c) => c.id === selectedCharacterId);
	if (!performer) {
		_message = "❌ Selecione um aventureiro válido.";
		return;
	}

	const activityParams = {
		id: selectedActivity.id,
		name: selectedActivity.name,
		performerId: performer.id,
		matrix: selectedActivity.matrix as "Physical" | "Mental" | "Social",
		difficulty: selectedActivity.difficulty,
	};

	const res = await service.executeActivity(
		SESSION_ID,
		activityParams,
		leaderModifier,
		d20Roll,
		selectedActivity.isCollective,
		selectedActivity.maxSuccess ?? 3,
	);

	if (res.success) {
		const data = res.data;
		session = data.session;
		_lastActivitySuccess = data.success;

		let detail = "";
		if (data.clockProgress) {
			detail = ` [Relógio Coletivo: ${data.clockProgress.current}/${data.clockProgress.max}${data.clockProgress.completed ? " - CONCLUÍDO!" : ""}]`;
		}

		_message =
			`🎲 ${performer.name} realizou a tarefa "${selectedActivity.name}" (Rolagem: ${d20Roll} + ${leaderModifier} = ${d20Roll + leaderModifier} vs CD ${selectedActivity.difficulty}).\n` +
			`• Resultado: ${data.success ? "✅ SUCESSO!" : "❌ FALHA!"}${detail}\n` +
			`• Perigo acumulado na hora: +${data.dangerAdded}% (Total: ${session.dangerCounter}%)`;

		if (onUpdateDangerCounter) {
			onUpdateDangerCounter(session.dangerCounter);
		}
	} else {
		_message = `❌ Erro ao executar tarefa: ${res.error.message}`;
	}
}

// Rola patrulha / encontro
async function _handleRollEncounter() {
	if (!session) return;

	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	const generatedRoll = (array[0] % 20) + 1;

	const res = await service.rollEncounter(SESSION_ID, generatedRoll);
	if (res.success) {
		const data = res.data;
		session = data.session;
		_lastEncounterRoll = generatedRoll;

		if (data.eventTriggered) {
			lastEncounterEvent = data.eventDescription ?? "";
			_message =
				`⚠️ ENCONTRO DISPARADO! A rolagem (${generatedRoll}) foi menor ou igual ao perigo acumulado.\n` +
				`• Evento: ${lastEncounterEvent}\n` +
				`• O Contador de Perigo foi zerado para dar lugar ao combate.`;
		} else {
			lastEncounterEvent = null;
			_message = `🎲 Rolagem de Patrulha: ${generatedRoll} (Seguro! O perigo acumulado de ${session.dangerCounter}% não foi superado).`;
		}

		if (onUpdateDangerCounter) {
			onUpdateDangerCounter(session.dangerCounter);
		}
	} else {
		_message = `❌ Erro ao testar patrulha: ${res.error.message}`;
	}
}

// Execução de descanso final
async function _handleRest() {
	if (!session) return;
	if (isRestBlocked || isBloodDebtBlocked) {
		_message =
			"⚠️ O descanso foi completamente impedido pelos cobradores ou perseguições.";
		return;
	}

	const activeActivities: CampActivity[] = JSON.parse(
		session.activeActivitiesJson,
	);
	const hasBanquete = activeActivities.some((act) =>
		act.id.startsWith("preparar_banquete"),
	);

	// Consome rações centralizadas se a função estiver disponível
	const numCharacters = characters.length > 0 ? characters.length : 1;
	if (rations < numCharacters) {
		_message = `❌ Rações insuficientes! O descanso requer ${numCharacters} rações (Possui: ${rations}).`;
		return;
	}

	if (onConsumeRation) {
		onConsumeRation(numCharacters);
	}

	// Execução do pipeline de recuperação HP via Decorator
	let recoveryPipe = new StandardRecovery();
	if (hasBanquete) {
		recoveryPipe = new BanqueteDecorator(recoveryPipe);
	}

	const baseCuraHP = 20;
	const curaFinal = recoveryPipe.calculate(baseCuraHP);

	// Deleta a sessão de acampamento após concluída
	await repository.listAll(); // garante banco vivo
	await service.rollEncounter(SESSION_ID, 20); // garante reset

	const deleteRes = await repository.save({
		...session,
		availableActions: 0,
		dangerCounter: Math.min(100, session.dangerCounter + 15), // Descanso acumula perigo base +15
		activeActivitiesJson: JSON.stringify([]),
		updatedAt: new Date().toISOString(),
	});

	if (deleteRes.success) {
		session = deleteRes.data;
	}

	if (onRestSuccess) {
		await onRestSuccess();
	}

	let logMsg = `🔥 REPOUSO CONCLUÍDO!\n`;
	logMsg += `• Rações consumidas: ${numCharacters}x\n`;
	if (hasBanquete) {
		logMsg += `• Cozinha Premium: O aroma do banquete etérico garantiu cura de +25% (Recuperados ${curaFinal} PV)!\n`;
	} else {
		logMsg += `• Recuperação Padrão: Recuperados ${curaFinal} PV.\n`;
	}

	if (isInfectionBlocked) {
		logMsg += `⚠️ AVISO: Aventureiros com infecções biomecânicas não recuperaram vida natural!\n`;
	}

	_message = logMsg;
}

// Desmonta/exclui sessão do banco local
async function _dismantleCamp() {
	if (!session) return;
	session = null;
	_lastActivitySuccess = null;
	_lastEncounterRoll = null;
	lastEncounterEvent = null;
	_message = "O acampamento foi desmontado. A noite segue fria.";
}
</script>

<div class="max-w-[800px] my-8 mx-auto p-6 bg-void text-bone rounded-lg border border-bronze shadow-2xl relative overflow-hidden font-sans">
	
	<!-- Elemento visual decorativo -->
	<div class="absolute top-0 right-0 p-4 opacity-15 pointer-events-none">
		<span class="text-6xl text-bronze">🔥</span>
	</div>

	<header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-bronze/30 pb-4">
		<div>
			<h2 class="text-2xl font-bold text-ether tracking-wide flex items-center gap-2">
				🔥 Códex de Acampamento & Sobrevivência
			</h2>
			<span class="text-[10px] text-bone/50 font-mono tracking-widest uppercase block mt-1">Vigílias, Repousos e Ofícios Noturnos</span>
		</div>
		<div class="flex items-center gap-3">
			<div class="text-right">
				<span class="text-[9px] block text-bone/55 uppercase font-mono">Fama da Guilda</span>
				<span class="text-xs font-bold text-ether font-mono">★ {fame}</span>
			</div>
			<div class="h-8 w-[1px] bg-bronze/25"></div>
			<div class="text-right">
				<span class="text-[9px] block text-bone/55 uppercase font-mono">Dívida de Sangue</span>
				<span class="text-xs font-bold text-blood font-mono">☠ {bloodDebt} / {fame * 3}</span>
			</div>
		</div>
	</header>

	{#if isInfectionBlocked}
		<div class="p-3 bg-ruin border border-bronze rounded flex flex-col gap-1 text-center my-3 text-xs">
			<h4 class="text-xs font-bold text-bronze uppercase tracking-widest">⚠️ INFECÇÃO BIOMECÂNICA ATIVA</h4>
			<p class="text-bone/70">
				Os aventureiros <span class="text-ether font-bold">{characterName}</span> estão com infecções. A cura natural está bloqueada até o tratamento alquímico!
			</p>
		</div>
	{/if}

	{#if isBloodDebtBlocked}
		<div class="p-4 bg-blood-shadow border border-blood rounded-lg flex flex-col gap-2 text-center my-3 animate-pulse">
			<h3 class="text-xs font-bold text-blood uppercase tracking-widest">⚠️ PERSEGUIÇÃO DOS COBRADORES DE DÍZIMO ⚠️</h3>
			<p class="text-xs text-bone/75">
				O descanso está **IMPOSSIBILITADO**! Sua Dívida de Sangue ({bloodDebt}) supera o limite tolerável da Fama ({fame * 3}). O esquadrão do favor impossível vigia a área!
			</p>
		</div>
	{/if}

	{#if !session}
		<div class="flex flex-col gap-4 items-center py-8 bg-ruin/10 rounded border border-bronze/10">
			<p class="text-xs italic text-bone/70">Configure as horas e vigília planejadas para o repouso temporário:</p>
			<div class="flex flex-wrap gap-4 justify-center items-center">
				<div class="flex items-center gap-2 bg-void px-3 py-1.5 rounded border border-bronze/25">
					<span class="text-[10px] text-bone/55 uppercase font-mono">Horas Totais:</span>
					<input type="number" bind:value={totalHours} min="8" max="24" class="w-12 bg-transparent text-center text-xs font-mono font-bold text-ether outline-none" />
				</div>
				<div class="flex items-center gap-2 bg-void px-3 py-1.5 rounded border border-bronze/25">
					<span class="text-[10px] text-bone/55 uppercase font-mono">Sono Requerido:</span>
					<input type="number" bind:value={sleepHours} min="4" max="12" class="w-12 bg-transparent text-center text-xs font-mono font-bold text-ether outline-none" />
				</div>
				<button 
					onclick={startCamp}
					disabled={isBloodDebtBlocked}
					class="px-5 py-2 bg-bronze hover:bg-ether hover:text-void text-bone text-xs font-bold rounded uppercase tracking-wider transition-all disabled:opacity-40"
				>
					Montar Acampamento
				</button>
			</div>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			
			<!-- Coluna 1: Realização de Atividades (15 opções) -->
			<div class="md:col-span-2 flex flex-col gap-4 bg-ruin/10 p-4 rounded border border-bronze/10">
				<div class="flex justify-between items-center border-b border-bronze/20 pb-2">
					<h3 class="text-xs font-bold uppercase tracking-widest text-ether">📋 Realizar Atividade Noturna</h3>
					<span class="text-[10px] text-ether font-mono font-bold">Ações Restantes: {session.availableActions}</span>
				</div>

				{#if session.availableActions <= 0}
					<div class="py-8 text-center bg-void rounded border border-bronze/5">
						<span class="text-xs text-bone/45 italic">O tempo de vigília expirou. Iniciem o repouso.</span>
					</div>
				{:else}
					<div class="flex flex-col gap-3">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<!-- Seleção de Aventureiro -->
							<div class="flex flex-col gap-1.5">
								<span class="text-[9px] text-bone/60 uppercase font-mono">Aventureiro Executando:</span>
								<select 
									bind:value={selectedCharacterId}
									class="p-2 bg-void border border-bronze/35 rounded text-xs text-bone outline-none"
								>
									{#each characters as char}
										<option value={char.id}>{char.name}</option>
									{/each}
								</select>
							</div>

							<!-- Seleção de Atividade (15 opções) -->
							<div class="flex flex-col gap-1.5">
								<span class="text-[9px] text-bone/60 uppercase font-mono">Atividade (Ofício):</span>
								<select 
									bind:value={selectedActivityId}
									class="p-2 bg-void border border-bronze/35 rounded text-xs text-bone outline-none"
								>
									{#each ACTIVITIES_CATALOG as act}
										<option value={act.id}>{act.name} (CD {act.difficulty})</option>
									{/each}
								</select>
							</div>
						</div>

						<p class="text-[10px] text-bone/60 italic leading-relaxed px-2 bg-void py-1.5 rounded border border-bronze/5">
							ℹ️ {selectedActivity.desc}
						</p>

						<!-- Modificadores de Rolagem -->
						<div class="grid grid-cols-2 gap-3 items-center bg-void/50 p-3 rounded border border-bronze/10">
							<div class="flex flex-col gap-1">
								<span class="text-[9px] text-bone/55 uppercase font-mono">Modificador de Atributo:</span>
								<input type="number" bind:value={leaderModifier} class="p-1.5 bg-void border border-bronze/25 text-center text-xs font-mono text-bone outline-none rounded" />
							</div>
							<div class="flex flex-col gap-1">
								<span class="text-[9px] text-bone/55 uppercase font-mono">Rolagem d20:</span>
								<input type="number" bind:value={d20Roll} min="1" max="20" class="p-1.5 bg-void border border-bronze/25 text-center text-xs font-mono text-bone outline-none rounded" />
							</div>
						</div>

						<button 
							onclick={handleExecuteActivity}
							class="w-full py-2 bg-bronze hover:bg-ether hover:text-void text-bone text-xs font-bold uppercase rounded tracking-wider transition-all mt-1"
						>
							Executar Tarefa Noturna (Consome 1 Ação)
						</button>
					</div>
				{/if}
			</div>

			<!-- Coluna 2: Status, Fogueira e Patrulha -->
			<div class="flex flex-col gap-4 bg-ruin/10 p-4 rounded border border-bronze/10">
				<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/20 pb-2">🔥 Status & Perigo</h3>

				<!-- Contador de Perigo -->
				<div class="p-3 bg-void rounded border border-bronze/5 flex flex-col gap-2">
					<div class="flex justify-between items-center text-xs">
						<span class="font-bold text-bone">💀 PERIGO LOCAL:</span>
						<span class="font-mono text-ether font-bold">{session.dangerCounter}%</span>
					</div>
					<div class="w-full bg-ruin h-2 rounded border border-bronze/25 p-[1px]">
						<div 
							class="h-full rounded transition-all duration-300 {session.dangerCounter >= 75 ? 'bg-blood' : session.dangerCounter >= 40 ? 'bg-bronze' : 'bg-ether'}" 
							style="width: {session.dangerCounter}%"
						></div>
					</div>
				</div>

				<!-- Botão Fogueira -->
				<div class="p-3 bg-void rounded border border-bronze/5 flex flex-col gap-2 text-xs">
					<div class="flex justify-between items-center">
						<span class="text-bone/70">Fogueira de Éter:</span>
						<span class="font-bold font-mono {fireActive ? 'text-ether' : 'text-bone/40'}">
							{fireActive ? "ACESA (+3 Perigo)" : "APAGADA"}
						</span>
					</div>
					<button 
						onclick={handleToggleFire}
						class="w-full py-1 bg-ruin border border-bronze/25 text-[10px] text-bone font-bold uppercase hover:bg-ether hover:text-void rounded transition-colors"
					>
						{fireActive ? "Apagar Fogueira" : "Acender Fogueira"}
					</button>
				</div>

				<!-- Suprimentos -->
				<div class="p-3 bg-void rounded border border-bronze/5 text-xs flex justify-between items-center">
					<span class="text-bone/70">Rações de Comida:</span>
					<span class="font-bold text-ether font-mono">{rations}x 🍖</span>
				</div>

				<!-- Patrulhas -->
				<div class="p-3 bg-void rounded border border-bronze/5 flex flex-col gap-2 text-xs">
					<span class="text-[9px] text-bone/55 uppercase font-mono">Testar Emboscada Noturna:</span>
					<button 
						onclick={handleRollEncounter}
						class="w-full py-1 bg-ruin border border-bronze/25 text-[10px] text-bone font-bold uppercase hover:bg-blood hover:text-white rounded transition-colors"
					>
						🎲 Rolar Patrulha (d20)
					</button>
				</div>
			</div>
		</div>

		<!-- Log de Atividades e Botões de Descanso -->
		<div class="mt-6 border-t border-bronze/20 pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
			
			<!-- Log Console -->
			<div class="md:col-span-2 bg-void p-3 rounded border border-bronze/35 min-h-[120px] whitespace-pre-line font-mono text-xs text-bone/85 leading-relaxed">
				<span class="text-ether font-bold"># DIÁRIO DO ACAMPAMENTO:</span>
				{message}
			</div>

			<!-- Ações Finais -->
			<div class="flex flex-col gap-3 justify-center">
				<button 
					onclick={handleRest}
					class="w-full py-3 bg-bronze text-void hover:bg-ether font-bold text-xs uppercase tracking-widest rounded transition-all shadow-md"
				>
					🔥 Iniciar Repouso
				</button>
				
				<button 
					onclick={dismantleCamp}
					class="w-full py-1.5 bg-void border border-bronze/30 text-bone/55 hover:text-bone text-[9px] uppercase tracking-wider rounded transition-colors"
				>
					Desmontar Acampamento
				</button>
			</div>
		</div>
	{/if}
</div>
