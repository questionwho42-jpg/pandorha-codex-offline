<script lang="ts">
import { CampService } from "../domain/CampService";
import {
	BanqueteDecorator,
	StandardRecovery,
} from "../domain/recoveryDecorators";
import type { CampSession } from "../domain/types";

interface Props {
	isRestBlocked?: boolean;
	isInfectionBlocked?: boolean;
	characterName?: string;
	onRestSuccess?: () => void | Promise<void>;
	rations?: number;
	onConsumeRation?: () => void;
	// Bastião Avançado & Logística Premium:
	fame?: number;
	bloodDebt?: number;
	dangerCounter?: number;
	// biome-ignore lint/suspicious/noExplicitAny: Drizzle dynamic record models
	characters?: any[];
	onUpdateFame?: (val: number) => void;
	onUpdateBloodDebt?: (val: number) => void;
	onUpdateDangerCounter?: (val: number) => void;
}

let props: Props = $props();

// Getters derivados para preservar a reatividade do Svelte 5 e evitar warnings de capturing initial value
let isRestBlocked = $derived(props.isRestBlocked ?? false);
let isInfectionBlocked = $derived(props.isInfectionBlocked ?? false);
let fame = $derived(props.fame ?? 2);
let bloodDebt = $derived(props.bloodDebt ?? 3);
let dangerCounter = $derived(props.dangerCounter ?? 15);
let characters = $derived(props.characters ?? []);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let characterName = $derived(props.characterName ?? "Andarilho");
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let rations = $derived(props.rations ?? 3);

// Instância do serviço
const campService = new CampService();

// Estado reativo (Svelte 5 Runes)
let totalHours = $state(12);
let session = $state<CampSession | null>(null);
let dangerRoll = $state<number | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let message = $state("Prepare seu acampamento...");

// Dicionário reativo de alocação de atividades por personagem
// Chave: ID do Personagem, Valor: 'guard' (Vigília) | 'repair' (Reparo) | 'cook' (Cozinhar)
let activities = $state<Record<string, "guard" | "repair" | "cook">>({});

// Se a Dívida de Sangue superar o triplo da Fama, o descanso fica fisicamente bloqueado pelas regras do Códex!
let isBloodDebtBlocked = $derived(bloodDebt > fame * 3);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function startCamp() {
	if (isRestBlocked || isBloodDebtBlocked) {
		message =
			"⚠️ O acampamento falhou! Os cobradores de sangue ou aflições sociais estão no seu encalço.";
		return;
	}
	session = campService.createSession({ totalTime: totalHours });

	// Inicializa a atividade de cada aventureiro ativo como Vigília ('guard') por padrão
	activities = {};
	for (const char of characters) {
		activities[char.id] = "guard";
	}

	message =
		"🔥 Acampamento montado sob as estrelas de Éter. Aloque cada aventureiro em sua tarefa noturna.";
}

// Alterna a atividade de um aventureiro específico
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function setActivity(charId: string, task: "guard" | "repair" | "cook") {
	activities[charId] = task;
	message = `Atividade de tarefa redefinida para o aventureiro.`;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function passHour() {
	if (!session) return;
	if (session.availableActions <= 0) {
		message = "Todas as ações de vigília foram consumidas.";
		return;
	}

	session.availableActions--;

	// Cada hora que passa aumenta ligeiramente o perigo se o grupo estiver desatento
	const guardCount = Object.values(activities).filter(
		(v) => v === "guard",
	).length;
	const increment = Math.max(1, 5 - guardCount);

	if (props.onUpdateDangerCounter) {
		props.onUpdateDangerCounter(Math.min(100, dangerCounter + increment));
	}

	session = { ...session };
	message = `Uma hora se passou. O perigo das ruínas aumenta silenciosamente (Atual: ${dangerCounter}%).`;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function checkEncounter() {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	dangerRoll = (array[0] % 20) + 1;

	// O contador de perigo atual determina a dificuldade do teste de segurança
	const currentDangerThreshold = Math.floor(dangerCounter / 5);

	if (dangerRoll <= currentDangerThreshold) {
		message =
			"⚠️ CONTATO IMINENTE! Criaturas biomecânicas detectaram o calor da fogueira de Éter! O perigo acumulado foi zerado para dar lugar ao combate.";
		if (props.onUpdateDangerCounter) {
			props.onUpdateDangerCounter(0);
		}
	} else {
		message =
			"Os detectores de movimento indicam que a escuridão ao redor continua limpa...";
	}
}

/**
 * 🧅 EXPLICANDO O PADRÃO DECORATOR DIDATICAMENTE NO CÓDEX DO ACAMPAMENTO:
 *
 * Por que herança falharia aqui?
 * Se tentássemos estender a classe de Recuperação para cada combinação de benefícios do acampamento,
 * teríamos uma "Explosão de Classes":
 * - BanqueteRecovery
 * - AbrigoRecovery
 * - BanqueteEAbrigoRecovery
 * - BanqueteEAbrigoEVigiliaRecovery...
 * E a adição de novas melhorias de bastião exigiria novas classes estáticas exponenciais.
 *
 * Com o padrão Decorator (Composição sobre Herança):
 * Nós simplesmente criamos um objeto base concreto (StandardRecovery) e "embrulhamos" (wrap)
 * o cálculo dinamicamente na hora do descanso:
 * new BanqueteDecorator(new StandardRecovery())
 *
 * A chamada recursiva executa como as camadas de uma cebola (efeito cebola 🧅):
 * O decorador mais externo chama super.calculate(), descendo até o componente concreto (StandardRecovery),
 * e depois retorna aplicando os modificadores cumulativos (ex: +25% de cura pelo banquete).
 */
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
async function executeRest() {
	if (!session) return;
	if (isRestBlocked || isBloodDebtBlocked) {
		message =
			"⚠️ O descanso foi impedido! Os cobradores de sangue do Esquadrão do Favor Impossível cercaram o perímetro.";
		return;
	}

	// 1. Consome rações (deduzido centralizadamente por herói no App.svelte)
	if (props.onConsumeRation) {
		props.onConsumeRation();
	}

	// 2. Calcula modificadores e incrementos baseado nas atividades do grupo
	const guardCount = Object.values(activities).filter(
		(v) => v === "guard",
	).length;
	const repairCount = Object.values(activities).filter(
		(v) => v === "repair",
	).length;
	const cookCount = Object.values(activities).filter(
		(v) => v === "cook",
	).length;

	// Ajuste do Contador de Perigo baseado na guarda
	// Base de acúmulo de perigo por descanso: +25%
	// Cada guarda ativo reduz o acúmulo em -10% (mínimo de +5% de perigo acumulado)
	const dangerIncrement = Math.max(5, 25 - guardCount * 10);
	if (props.onUpdateDangerCounter) {
		props.onUpdateDangerCounter(Math.min(100, dangerCounter + dangerIncrement));
	}

	// Execução do pipeline monádico do Decorator para recuperação de HP
	let recoveryPipe = new StandardRecovery();
	if (cookCount > 0) {
		// Se houver heróis cozinhando, embrulhamos a recuperação com o BanqueteDecorator
		recoveryPipe = new BanqueteDecorator(recoveryPipe);
	}

	const baseCuraHP = 20; // 20 PV base recuperados por um repouso
	const curaFinal = recoveryPipe.calculate(baseCuraHP);

	if (props.onRestSuccess) {
		await props.onRestSuccess();
	}

	session.availableActions = 0;
	session = { ...session };

	// Geração de Logs Imersivos e Temáticos de Bastião
	let logMsg = `🔥 DESCANSO FINALIZADO!\n`;
	logMsg += `• Suprimentos: 1 Ração consumida.\n`;
	logMsg += `• Perigo Acumulado: +${dangerIncrement}% de risco local (Atual: ${dangerCounter}%).\n`;

	if (cookCount > 0) {
		logMsg += `• Cozinha: O aroma do banquete etérico preparado pelos cozinheiros garantiu um bônus de +25% na cura final (Recuperados ${curaFinal} PV)! \n`;
	} else {
		logMsg += `• Recuperação Natural: Recuperados ${curaFinal} PV padrão.\n`;
	}

	if (repairCount > 0) {
		logMsg += `• Reparo: ${repairCount} aventureiro(s) passaram a noite sob fagulhas de bigorna, afiando armaduras e eliminando marcas de desgaste dos equipamentos do grupo. \n`;
	}

	if (isInfectionBlocked) {
		logMsg += `⚠️ AVISO: Aventureiros com Infecção Biomecânica não se beneficiaram da cura natural e exigem cuidados médicos!`;
	}

	message = logMsg;
}

// Simulador rápido para playtesting e didática do usuário
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function adjustFame(amount: number) {
	if (props.onUpdateFame) {
		props.onUpdateFame(Math.max(0, fame + amount));
		message = `Fama ajustada para ${fame + amount}.`;
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function adjustBloodDebt(amount: number) {
	if (props.onUpdateBloodDebt) {
		props.onUpdateBloodDebt(Math.max(0, bloodDebt + amount));
		message = `Dívida de Sangue ajustada para ${bloodDebt + amount}.`;
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte template.
function resetDanger() {
	if (props.onUpdateDangerCounter) {
		props.onUpdateDangerCounter(0);
		message = "Contador de Perigo redefinido para 0%.";
	}
}
</script>

<div class="max-w-[700px] my-8 mx-auto p-6 bg-ruin text-bone rounded-lg border border-bronze shadow-2xl relative overflow-hidden">
	<div class="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
		<span class="text-5xl text-bronze">🔥</span>
	</div>

	<header class="flex justify-between items-center mb-6 border-b border-bronze/30 pb-4 z-10">
		<div class="flex flex-col">
			<h2 class="text-xl font-bold text-ether tracking-wide">🔥 Códex de Acampamento & Bastião</h2>
			<span class="text-[9px] text-bone/50 font-mono tracking-widest uppercase">Sobrevivência Tática Avançada</span>
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
		<!-- Alerta de bloqueio imersivo: Infecção de Ferida -->
		<div class="p-4 bg-void border border-bronze rounded-lg flex flex-col gap-2 text-center my-4 z-10">
			<h3 class="text-sm font-bold text-bronze uppercase tracking-widest">⚠️ INFECÇÃO BIOMECÂNICA ATIVA</h3>
			<p class="text-xs text-bone/70 leading-relaxed">
				Os aventureiros <span class="text-ether font-bold">{characterName}</span> estão com infecções de feridas biomecânicas. A cura natural do repouso está bloqueada para eles até que sejam tratados com medicamentos alquímicos!
			</p>
		</div>
	{/if}

	{#if isBloodDebtBlocked}
		<!-- Alerta Crítico: Esquadrão do Favor Impossível (Dívida de Sangue > Fama * 3) -->
		<div class="p-5 bg-blood-shadow border border-blood rounded-lg flex flex-col gap-3 text-center my-4 z-10 animate-pulse">
			<h3 class="text-md font-bold text-blood uppercase tracking-widest">⚠️ MARCA DOS COBRADORES DE DÍZIMO ⚠️</h3>
			<p class="text-xs text-bone/75 leading-relaxed">
				O repouso foi completamente **IMPOSSIBILITADO**! Sua Dívida de Sangue (<span class="text-blood font-bold">{bloodDebt}</span>) supera o limite tolerável da sua Fama (<span class="text-ether font-bold">{fame * 3}</span>). O implacável **Esquadrão do Favor Impossível** vigia o perímetro, impedindo qualquer abrigo!
			</p>
			<div class="px-3 py-1.5 bg-void rounded border border-blood/40 text-[10px] text-blood font-mono">
				BLOQUEIO ATIVO: Reduza sua Dívida de Sangue ou aumente sua Fama para poder acampar em segurança.
			</div>
		</div>
	{/if}

	<!-- Barra Pulsante do Contador de Perigo do Bastião -->
	<div class="mb-6 p-4 bg-void border border-bronze/20 rounded z-10">
		<div class="flex justify-between items-center mb-2">
			<span class="text-xs font-bold uppercase tracking-wider text-ether flex items-center gap-1.5">
				💀 CONTADOR DE PERIGO DAS RUÍNAS
				{#if dangerCounter >= 75}
					<span class="text-[9px] px-1.5 py-0.5 rounded bg-blood-shadow border border-blood text-blood animate-pulse">ALTO RISCO</span>
				{/if}
			</span>
			<span class="text-xs font-mono text-ether font-bold">{dangerCounter}%</span>
		</div>
		<div class="w-full bg-ruin h-3 rounded overflow-hidden border border-bronze/35 p-[2px]">
			<div 
				class="h-full rounded-sm transition-all duration-500 {dangerCounter >= 75 ? 'bg-blood animate-pulse' : dangerCounter >= 40 ? 'bg-bronze' : 'bg-ether'}"
				style="width: {dangerCounter}%"
			></div>
		</div>
		{#if dangerCounter >= 100}
			<p class="text-[10px] text-blood font-bold uppercase tracking-wide text-center mt-2 animate-bounce">
				⚠️ ALERTA DE EMBOSCADA! As defesas do acampamento caíram! Preparem as armas!
			</p>
		{/if}
	</div>

	{#if !session}
		<div class="setup-view flex flex-col gap-4 items-center py-6 z-10">
			<p class="text-sm italic text-bone/80">Quantas horas o grupo pretende passar no abrigo temporário?</p>
			<div class="flex items-center gap-4">
				<input 
					type="number" 
					bind:value={totalHours} 
					min="8" 
					max="24"
					disabled={isBloodDebtBlocked}
					class="w-20 p-2 bg-void border border-bronze rounded text-center text-bone font-mono outline-none focus:border-ether disabled:opacity-40"
				/>
				<button 
					onclick={startCamp}
					disabled={isBloodDebtBlocked}
					class="px-6 py-2 bg-bronze hover:bg-ether hover:text-void text-bone rounded font-bold transition-all shadow-md uppercase tracking-wider text-xs disabled:opacity-40"
				>
					Montar Acampamento
				</button>
			</div>
		</div>
	{:else}
		<div class="session-view flex flex-col gap-6 z-10">
			
			<!-- Seção de Alocação de Tarefas Noturnas por Aventureiro -->
			<div class="bg-void border border-bronze/30 p-4 rounded flex flex-col gap-4">
				<div class="border-b border-bronze/20 pb-2 flex justify-between items-center">
					<h3 class="text-xs font-bold uppercase tracking-widest text-ether">📋 Alocação de Tarefas Noturnas</h3>
					<span class="text-[9px] text-bone/55 font-mono">Heróis ativos: {characters.length}</span>
				</div>
				
				{#if characters.length === 0}
					<p class="text-xs text-bone/45 text-center italic py-2">Nenhum herói ativo na guilda para alocar tarefas.</p>
				{:else}
					<div class="flex flex-col gap-3">
						{#each characters as char (char.id)}
							<div class="p-3 bg-ruin rounded border border-bronze/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
								<div class="flex items-center gap-2">
									<div class="h-2 w-2 rounded-full bg-ether animate-pulse"></div>
									<div>
										<span class="text-xs font-bold text-bone">{char.name}</span>
										<span class="text-[9px] text-bone/40 block font-mono">ID: {char.id.slice(0,6)}</span>
									</div>
								</div>
								
								<!-- Botões Rápidos de Tarefa -->
								<div class="flex gap-1.5">
									<button
										type="button"
										onclick={() => setActivity(char.id, "guard")}
										class="px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all
											{activities[char.id] === 'guard' 
												? 'bg-ether border-ether/40 text-void font-extrabold shadow-[0_0_6px_rgba(218,185,115,0.2)]' 
												: 'bg-void border-bronze/30 text-bone/60 hover:text-bone hover:border-bronze'}"
									>
										🛡️ Vigília
									</button>
									
									<button
										type="button"
										onclick={() => setActivity(char.id, "repair")}
										class="px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all
											{activities[char.id] === 'repair' 
												? 'bg-bronze border-bronze/40 text-void font-extrabold shadow-[0_0_6px_rgba(168,120,50,0.2)]' 
												: 'bg-void border-bronze/30 text-bone/60 hover:text-bone hover:border-bronze'}"
									>
										🔧 Reparo
									</button>
									
									<button
										type="button"
										onclick={() => setActivity(char.id, "cook")}
										class="px-2.5 py-1 text-[9px] font-bold uppercase rounded border transition-all
											{activities[char.id] === 'cook' 
												? 'bg-blood-shadow border-blood text-ether font-extrabold shadow-[0_0_6px_rgba(26,15,15,0.4)]' 
												: 'bg-void border-bronze/30 text-bone/60 hover:text-bone hover:border-bronze'}"
									>
										🍳 Cozinha
									</button>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="stats-panel bg-void border border-bronze/50 p-4 rounded flex flex-col gap-3">
					<h3 class="text-[10px] font-bold uppercase tracking-widest text-ether border-b border-bronze/20 pb-2">Status do Turno</h3>
					<div class="flex flex-col gap-2">
						<div class="flex justify-between items-center text-xs">
							<span class="text-bone/70">Horas de Turno:</span>
							<span class="font-mono text-ether">{session.totalTime}h</span>
						</div>
						<div class="flex justify-between items-center text-xs">
							<span class="text-bone/70">Ações de Vigília:</span>
							<span class="font-mono text-ether">{session.availableActions}</span>
						</div>
						<div class="flex justify-between items-center text-xs border-t border-bronze/10 pt-2">
							<span class="text-bone/70">Rações de Sobrevivência:</span>
							<span class="font-mono text-ether font-bold">{rations}x 🍖</span>
						</div>
					</div>
				</div>

				<div class="actions-panel flex flex-col gap-3.5 justify-center">
					<button 
						onclick={passHour}
						disabled={session.availableActions <= 0}
						class="w-full py-2.5 bg-void border border-ether text-ether hover:bg-ether hover:text-void disabled:opacity-40 disabled:border-bronze disabled:text-bone rounded font-bold transition-all uppercase tracking-widest text-[9px]"
					>
						⌛ Passar Hora (Avançar Perigo)
					</button>

					<button 
						onclick={executeRest}
						disabled={session.availableActions <= 0}
						class="w-full py-2.5 bg-bronze text-void hover:bg-ether disabled:opacity-40 disabled:bg-ruin disabled:text-bone rounded font-bold transition-all uppercase tracking-widest text-[9px]"
					>
						🔥 Iniciar Repouso (Custo: 1 Ração/Herói)
					</button>
					
					{#if rations <= 0}
						<p class="text-[9px] text-blood font-bold uppercase tracking-wider text-center mt-1 animate-pulse">
							⚠️ Sem Suprimentos Alimentares! O repouso causará FOME.
						</p>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<button 
					onclick={checkEncounter}
					class="w-full py-2 bg-void border border-bronze text-bone hover:bg-bronze hover:text-void rounded font-bold transition-all uppercase tracking-widest text-[9px]"
				>
					🎲 Testar Patrulha das Ruínas (d20)
				</button>

				{#if dangerRoll !== null}
					<div class="roll-result text-center p-2 bg-void rounded border border-ether animate-pulse flex items-center justify-between px-4">
						<span class="text-[9px] text-bone/55 uppercase font-mono">Rolagem do Destino:</span>
						<span class="font-bold text-lg text-ether">{dangerRoll}</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="log-view mt-6 p-4 bg-void rounded border border-bronze/30 min-h-20 z-10 whitespace-pre-line font-mono text-xs text-bone/85 leading-relaxed">
			<span class="text-ether font-bold"># LOG DE CAMPANHA:</span>
			{message}
		</div>

		<div class="mt-6 flex justify-center z-10">
			<button 
				onclick={() => { session = null; dangerRoll = null; }}
				class="text-[9px] text-bone/35 hover:text-ether transition-colors uppercase tracking-widest underline"
			>
				Desmontar Acampamento
			</button>
		</div>
	{/if}

	<!-- 🔧 Simulador GM Didático Premium (Regras do Usuário de Praticidade) -->
	<div class="mt-8 pt-6 border-t border-bronze/25 bg-void/50 p-4 rounded-lg z-10">
		<h4 class="text-[10px] font-bold uppercase tracking-widest text-ether mb-3 text-center">🔧 Painel de Simulação Rápida (Playtesting GM)</h4>
		<div class="flex flex-wrap gap-3 justify-center">
			<div class="flex items-center gap-1.5 bg-ruin p-1 rounded border border-bronze/20">
				<span class="text-[9px] text-bone/60 uppercase font-mono px-2">Fama:</span>
				<button onclick={() => adjustFame(-1)} class="px-2 py-0.5 bg-void text-xs rounded hover:bg-bronze hover:text-void">-</button>
				<span class="text-xs font-bold text-ether font-mono">{fame}</span>
				<button onclick={() => adjustFame(1)} class="px-2 py-0.5 bg-void text-xs rounded hover:bg-bronze hover:text-void">+</button>
			</div>

			<div class="flex items-center gap-1.5 bg-ruin p-1 rounded border border-bronze/20">
				<span class="text-[9px] text-bone/60 uppercase font-mono px-2">Dívida:</span>
				<button onclick={() => adjustBloodDebt(-1)} class="px-2 py-0.5 bg-void text-xs rounded hover:bg-bronze hover:text-void">-</button>
				<span class="text-xs font-bold text-blood font-mono">{bloodDebt}</span>
				<button onclick={() => adjustBloodDebt(1)} class="px-2 py-0.5 bg-void text-xs rounded hover:bg-bronze hover:text-void">+</button>
			</div>

			<button 
				onclick={resetDanger}
				class="px-3 py-1.5 bg-ruin hover:bg-ether hover:text-void text-bone border border-bronze/30 rounded text-[9px] font-bold uppercase tracking-wide"
			>
				🧹 Limpar Perigo
			</button>
		</div>
	</div>
</div>
