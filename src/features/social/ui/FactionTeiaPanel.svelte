<script lang="ts">
import { onMount } from "svelte";
import type { ClockData } from "$lib/entities/clocks/model-api";
import { WorkerClockRepository } from "$lib/entities/clocks/model-api";
import {
	PatronageService,
	WorkerFactionRepository,
} from "$lib/entities/social";
import type { FactionPatronageRecord } from "$lib/entities/social/model/socialSchema";
import { ClockService } from "$lib/features/clocks";

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
interface Props {
	characterId?: string;
	onPledgeChange?: () => void;
}

let { characterId = "char-wanderer", onPledgeChange }: Props = $props();

// Inicializações dos Serviços locais conectados ao Web Worker
const repository = new WorkerFactionRepository();
const patronageService = new PatronageService(repository);
const clockService = new ClockService(new WorkerClockRepository());

// Estados Reativos (Svelte 5 Runes)
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let patronages = $state<Record<string, FactionPatronageRecord>>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let threatClocks = $state<Record<string, ClockData>>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let reputations = $state<Record<string, number>>({});
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let feedbackMessage = $state("");
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let selectedFactionId = $state<string>("fac-ether");

// Carrega os dados das facções e relógios de ameaça
async function loadPatronageData() {
	// 1. Carrega reputações do personagem
	// Como o repository herda SocialRepository e FactionRepository, buscamos as reputações
	const repsRes = await repository.findReputation(characterId, "fac-ether");
	const repsRuinRes = await repository.findReputation(characterId, "fac-ruin");
	const repsBronzeRes = await repository.findReputation(
		characterId,
		"fac-bronze",
	);

	reputations = {
		"fac-ether": repsRes.success && repsRes.data ? repsRes.data.value : 0,
		"fac-ruin":
			repsRuinRes.success && repsRuinRes.data ? repsRuinRes.data.value : 0,
		"fac-bronze":
			repsBronzeRes.success && repsBronzeRes.data
				? repsBronzeRes.data.value
				: 0,
	};

	// 2. Carrega patrocínios de facção
	const patEther = await patronageService.getOrCreatePatronage("fac-ether");
	const patRuin = await patronageService.getOrCreatePatronage("fac-ruin");
	const patBronze = await patronageService.getOrCreatePatronage("fac-bronze");

	patronages = {
		"fac-ether": patEther.success
			? patEther.data
			: createFallbackPatronage("fac-ether"),
		"fac-ruin": patRuin.success
			? patRuin.data
			: createFallbackPatronage("fac-ruin"),
		"fac-bronze": patBronze.success
			? patBronze.data
			: createFallbackPatronage("fac-bronze"),
	};

	// 3. Carrega clocks ativos
	const clocksRes = await clockService.list();
	if (clocksRes.success) {
		const clockMap: Record<string, ClockData> = {};
		for (const clock of clocksRes.data) {
			if (clock.name.includes("Ameaça:")) {
				clockMap[clock.name] = clock;
			}
		}
		threatClocks = clockMap;
	}
}

function createFallbackPatronage(factionId: string): FactionPatronageRecord {
	return {
		id: crypto.randomUUID(),
		factionId,
		famaLevel: 1,
		bloodDebt: 0,
		relicsCount: 0,
		ultimatumWeeksRemaining: null,
		isAlmaPledged: false,
		activeBonus: null,
	};
}

onMount(async () => {
	await loadPatronageData();
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handlePledge(
	factionId: string,
	bonusType: "economic" | "military",
) {
	// Validação de reputação negativa
	if (reputations[factionId] < 0) {
		feedbackMessage =
			"Não é possível pactuar com facções que possuem reputação negativa (Infâmia)!";
		return;
	}

	const res = await patronageService.pledgePatronage(factionId, bonusType);
	if (res.success) {
		const { clockMutations } = res.data;

		// Executa o avanço/criação dos relógios de ameaça rival no Worker SQLite
		for (const mut of clockMutations) {
			const listRes = await clockService.list();
			if (listRes.success) {
				const existing = listRes.data.find((c) => c.name === mut.name);
				if (existing) {
					if (!existing.isCompleted) {
						const remaining = existing.totalSegments - existing.filledSegments;
						const advanceAmt = Math.min(mut.segments, remaining);
						if (advanceAmt > 0) {
							await clockService.advance(existing.id, advanceAmt);
						}
					}
				} else {
					// Cria novo relógio com 6 segmentos
					const createRes = await clockService.create(
						mut.name,
						6,
						mut.triggerEvent,
					);
					if (createRes.success) {
						await clockService.advance(createRes.data.id, mut.segments);
					}
				}
			}
		}

		feedbackMessage = `Pacto firmado (${bonusType === "economic" ? "Econômico" : "Militar"})! Clocks rivais avançados.`;
		await loadPatronageData();
		if (onPledgeChange) onPledgeChange();
	} else {
		feedbackMessage = `Erro ao firmar patrocínio: ${res.error.message}`;
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleRevoke(factionId: string) {
	const res = await patronageService.revokePatronage(factionId);
	if (res.success) {
		feedbackMessage = "Patrocínio revogado. O bônus passivo foi anulado.";
		await loadPatronageData();
		if (onPledgeChange) onPledgeChange();
	} else {
		feedbackMessage = `Erro ao revogar: ${res.error.message}`;
	}
}

// Detalhes estáticos de design das facções
const factionMeta: Record<
	string,
	{
		name: string;
		title: string;
		desc: string;
		alignment: string;
		color: string;
		hoverColor: string;
	}
> = {
	"fac-ether": {
		name: "fac-ether",
		title: "Guardiões do Ether",
		desc: "Controlam a ordem mágica e defendem o equilíbrio espiritual contra a ruína cósmica.",
		alignment: "Ordem",
		color: "text-sky-runic border-sky-runic/40",
		hoverColor: "hover:border-sky-runic",
	},
	"fac-ruin": {
		name: "fac-ruin",
		title: "Sectários da Ruína",
		desc: "Entidades caóticas que utilizam as energias corrosivas da entropia para subverter a realidade.",
		alignment: "Caos",
		color: "text-blood border-blood/40",
		hoverColor: "hover:border-blood",
	},
	"fac-bronze": {
		name: "fac-bronze",
		title: "Sindicato de Bronze",
		desc: "Mercadores, contrabandistas e inventores que operam de forma pragmática e comercial.",
		alignment: "Neutro",
		color: "text-bronze border-bronze/40",
		hoverColor: "hover:border-bronze",
	},
};
</script>

<div class="flex flex-col lg:flex-row gap-6 p-6 bg-ruin/80 border border-bronze/35 backdrop-blur-md rounded-xl text-bone w-full shadow-2xl relative overflow-hidden">
	<!-- Camada decorativa com ícone rúnico transparente de fundo -->
	<div class="absolute -top-10 -right-10 opacity-[0.03] text-[200px] pointer-events-none select-none font-mono">
		☼
	</div>

	<!-- LADO ESQUERDO: Teia de Relações (Grafo SVG e Clocks de Ameaça) -->
	<div class="flex-1 flex flex-col gap-6">
		<header class="border-b border-bronze/20 pb-3">
			<h3 class="font-bold text-base text-ether uppercase tracking-widest flex items-center gap-2">
				<span>🕸️</span> Teia de Relações & Ameaças
			</h3>
			<p class="text-[11px] text-bone/60 mt-1 leading-relaxed">
				Contrate patrocínios de facções para obter bônus. Pledges geram retaliação e avançam os Clocks de Ameaça de facções rivais.
			</p>
		</header>

		<!-- Grafo SVG de Facções -->
		<div class="relative h-60 bg-void/50 border border-bronze/10 rounded-lg flex items-center justify-center overflow-hidden">
			<!-- SVG Dinâmico mostrando linhas e fluxos de influência -->
			<svg class="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
				<!-- Conexão Ether <-> Ruína (Rivalidade Vermelha / Neon) -->
				<line 
					x1="50%" y1="20%" x2="25%" y2="75%" 
					class="stroke-blood stroke-[2] stroke-dasharray-[5,5]"
					class:animate-[dash_2s_linear_infinite]={patronages['fac-ether']?.activeBonus || patronages['fac-ruin']?.activeBonus} 
				/>
				<!-- Conexão Ether <-> Bronze (Transações Comerciais) -->
				<line 
					x1="50%" y1="20%" x2="75%" y2="75%" 
					class="stroke-bronze/55 stroke-[1.5]"
					class:animate-[dash_4s_linear_infinite]={patronages['fac-ether']?.activeBonus || patronages['fac-bronze']?.activeBonus}
				/>
				<!-- Conexão Ruína <-> Bronze (Contrabando / Double Dealing) -->
				<line 
					x1="25%" y1="75%" x2="75%" y2="75%" 
					class="stroke-orange-hungry/40 stroke-[1.5] stroke-dasharray-[3,3]"
					class:animate-[dash_3s_linear_infinite]={patronages['fac-ruin']?.activeBonus || patronages['fac-bronze']?.activeBonus}
				/>
			</svg>

			<!-- Nós de Facções posicionados de forma absoluta -->
			<!-- Guardiões do Ether (Nó Superior) -->
			<button 
				type="button"
				onclick={() => { selectedFactionId = "fac-ether"; }}
				class="absolute top-[10%] left-[50%] -translate-x-1/2 p-3 bg-void border rounded-full transition-all flex flex-col items-center justify-center w-24 h-24 text-center cursor-pointer shadow-lg
				{selectedFactionId === 'fac-ether' ? 'border-sky-runic shadow-[0_0_15px_rgba(56,189,248,0.3)] bg-void/80' : 'border-sky-runic/20 hover:border-sky-runic/60'}"
			>
				<span class="text-xs font-bold text-sky-runic leading-tight">Guardiões</span>
				<span class="text-[9px] uppercase tracking-wider text-sky-runic/70">Ether</span>
				{#if patronages['fac-ether']?.activeBonus}
					<span class="absolute -bottom-1 text-[8px] bg-sky-runic text-void px-1.5 py-0.5 rounded font-extrabold uppercase tracking-tighter">PLEDGED</span>
				{/if}
			</button>

			<!-- Sectários da Ruína (Nó Inferior Esquerdo) -->
			<button 
				type="button"
				onclick={() => { selectedFactionId = "fac-ruin"; }}
				class="absolute bottom-[10%] left-[15%] p-3 bg-void border rounded-full transition-all flex flex-col items-center justify-center w-24 h-24 text-center cursor-pointer shadow-lg
				{selectedFactionId === 'fac-ruin' ? 'border-blood shadow-[0_0_15px_rgba(153,27,27,0.3)] bg-void/80' : 'border-blood/20 hover:border-blood/60'}"
			>
				<span class="text-xs font-bold text-blood leading-tight">Sectários</span>
				<span class="text-[9px] uppercase tracking-wider text-blood/70">Ruína</span>
				{#if patronages['fac-ruin']?.activeBonus}
					<span class="absolute -bottom-1 text-[8px] bg-blood text-bone px-1.5 py-0.5 rounded font-extrabold uppercase tracking-tighter">PLEDGED</span>
				{/if}
			</button>

			<!-- Sindicato de Bronze (Nó Inferior Direito) -->
			<button 
				type="button"
				onclick={() => { selectedFactionId = "fac-bronze"; }}
				class="absolute bottom-[10%] right-[15%] p-3 bg-void border rounded-full transition-all flex flex-col items-center justify-center w-24 h-24 text-center cursor-pointer shadow-lg
				{selectedFactionId === 'fac-bronze' ? 'border-bronze shadow-[0_0_15px_rgba(168,120,50,0.3)] bg-void/80' : 'border-bronze/20 hover:border-bronze/60'}"
			>
				<span class="text-xs font-bold text-bronze leading-tight">Sindicato</span>
				<span class="text-[9px] uppercase tracking-wider text-bronze/70">Bronze</span>
				{#if patronages['fac-bronze']?.activeBonus}
					<span class="absolute -bottom-1 text-[8px] bg-bronze text-void px-1.5 py-0.5 rounded font-extrabold uppercase tracking-tighter">PLEDGED</span>
				{/if}
			</button>

			<div class="absolute bottom-2 left-2 text-[9px] text-bone/45 uppercase font-mono">
				Clique nos nós para inspecionar
			</div>
		</div>

		<!-- Clocks de Ameaça Ativos -->
		<div class="flex flex-col gap-3 bg-void/30 p-4 border border-bronze/10 rounded-lg">
			<h4 class="text-xs font-bold text-ether uppercase tracking-wider">⏱️ Clocks de Retaliação Ativos</h4>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<!-- Clock de Ameaça: Guardiões -->
				<div class="bg-void/60 border border-bronze/20 p-3 rounded flex flex-col gap-2 relative">
					<div class="flex justify-between items-center">
						<span class="text-xs font-bold text-bone">Ameaça: Guardiões</span>
						<span class="text-[10px] font-mono text-sky-runic font-bold">
							{threatClocks['Ameaça: Guardiões do Ether']?.filledSegments ?? 0}/6
						</span>
					</div>
					<!-- Barra de progresso do Clock -->
					<div class="h-2.5 w-full bg-void rounded-full overflow-hidden border border-bronze/10">
						<div 
							class="h-full bg-sky-runic transition-all duration-300"
							style="width: {((threatClocks['Ameaça: Guardiões do Ether']?.filledSegments ?? 0) / 6) * 100}%"
						></div>
					</div>
					{#if threatClocks['Ameaça: Guardiões do Ether']?.isCompleted}
						<span class="text-[9px] text-blood uppercase tracking-widest font-extrabold animate-pulse">⚠️ Invasão de Ordem Iminente!</span>
					{:else}
						<span class="text-[9px] text-bone/40 italic">Invasão armada ao preencher os 6 segmentos.</span>
					{/if}
				</div>

				<!-- Clock de Ameaça: Sectários -->
				<div class="bg-void/60 border border-bronze/20 p-3 rounded flex flex-col gap-2 relative">
					<div class="flex justify-between items-center">
						<span class="text-xs font-bold text-bone">Ameaça: Sectários</span>
						<span class="text-[10px] font-mono text-blood font-bold">
							{threatClocks['Ameaça: Sectários da Ruína']?.filledSegments ?? 0}/6
						</span>
					</div>
					<!-- Barra de progresso do Clock -->
					<div class="h-2.5 w-full bg-void rounded-full overflow-hidden border border-bronze/10">
						<div 
							class="h-full bg-blood transition-all duration-300"
							style="width: {((threatClocks['Ameaça: Sectários da Ruína']?.filledSegments ?? 0) / 6) * 100}%"
						></div>
					</div>
					{#if threatClocks['Ameaça: Sectários da Ruína']?.isCompleted}
						<span class="text-[9px] text-blood uppercase tracking-widest font-extrabold animate-pulse">⚠️ Cerco de Caos Iminente!</span>
					{:else}
						<span class="text-[9px] text-bone/40 italic">Horda mutante ataca se completar.</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- LADO DIREITO: Inspeção & Ações de Aliança -->
	<div class="w-full lg:w-80 flex flex-col gap-4 bg-void/40 border border-bronze/25 p-5 rounded-lg">
		<h4 class="text-xs font-bold text-ether uppercase tracking-widest border-b border-bronze/20 pb-2">
			🛡️ Pactuar Aliança
		</h4>

		{#if selectedFactionId}
			{@const faction = factionMeta[selectedFactionId]}
			{@const patronage = patronages[selectedFactionId]}
			{@const rep = reputations[selectedFactionId]}

			<div class="flex flex-col gap-4">
				<div>
					<div class="flex justify-between items-start">
						<h5 class="font-bold text-sm text-bone">{faction.title}</h5>
						<span class="text-[9px] uppercase px-1.5 py-0.5 rounded border {faction.color} font-mono">
							{faction.alignment}
						</span>
					</div>
					<p class="text-[10px] text-bone/60 italic leading-snug mt-1.5">{faction.desc}</p>
				</div>

				<div class="border-t border-bronze/15 pt-3 flex flex-col gap-2">
					<div class="flex justify-between items-center text-xs">
						<span class="text-bone/50">Reputação:</span>
						<span class="font-bold {rep >= 0 ? 'text-emerald-poison' : 'text-blood'}">
							{rep >= 0 ? `+${rep} (Fama)` : `${rep} (Infâmia)`}
						</span>
					</div>
					<div class="flex justify-between items-center text-xs">
						<span class="text-bone/50">Patrocínio Ativo:</span>
						{#if patronage?.activeBonus}
							<span class="font-extrabold text-emerald-poison uppercase text-[10px] bg-emerald-poison/15 border border-emerald-poison/20 px-1.5 py-0.5 rounded">
								{patronage.activeBonus === 'economic' ? '💰 Econômico' : '⚔️ Militar'}
							</span>
						{:else}
							<span class="text-bone/40 italic text-[10px]">Nenhum</span>
						{/if}
					</div>
				</div>

				<!-- Ações de Pacto -->
				<div class="border-t border-bronze/15 pt-4 flex flex-col gap-2">
					{#if !patronage?.activeBonus}
						<span class="text-[9px] uppercase tracking-wider text-bone/40 font-mono">Firmar Pacto (Requer Fama >= 0)</span>
						<button
							type="button"
							disabled={rep < 0}
							onclick={() => handlePledge(selectedFactionId, "economic")}
							class="w-full py-2 bg-void border border-bronze/50 hover:bg-bronze hover:text-void text-bone rounded font-bold text-[10px] transition-all uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						>
							💰 Pacto Econômico (+20% Ouro)
						</button>
						<button
							type="button"
							disabled={rep < 0}
							onclick={() => handlePledge(selectedFactionId, "military")}
							class="w-full py-2 bg-void border border-bronze/50 hover:bg-bronze hover:text-void text-bone rounded font-bold text-[10px] transition-all uppercase tracking-wider cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
						>
							⚔️ Pacto Militar (+2 Defesa)
						</button>
					{:else}
						<span class="text-[9px] uppercase tracking-wider text-emerald-poison font-mono font-semibold">Aliança Estabelecida</span>
						<button
							type="button"
							onclick={() => handleRevoke(selectedFactionId)}
							class="w-full py-2 bg-blood/10 border border-blood hover:bg-blood hover:text-bone text-blood rounded font-bold text-[10px] transition-all uppercase tracking-wider cursor-pointer"
						>
							❌ Revogar Patrocínio
						</button>
					{/if}
				</div>

				<!-- Detalhamento de Penalidades e Consequências de Lore -->
				<div class="bg-void/50 p-2.5 rounded border border-bronze/10 text-[9px] leading-relaxed text-bone/50">
					{#if selectedFactionId === "fac-ether"}
						<strong class="text-sky-runic block mb-0.5">Efeito Colateral: Ameaça de Caos</strong>
						Pactuar com a Ordem avança em <strong class="text-blood">2 segmentos</strong> a invasão dos Sectários da Ruína.
					{:else if selectedFactionId === "fac-ruin"}
						<strong class="text-blood block mb-0.5">Efeito Colateral: Ameaça de Ordem</strong>
						Pactuar com o Caos avança em <strong class="text-sky-runic">2 segmentos</strong> a retaliação armada dos Guardiões do Ether.
					{:else if selectedFactionId === "fac-bronze"}
						<strong class="text-bronze block mb-0.5">Efeito Colateral: Ameaça Dupla</strong>
						Pactuar com os contrabandistas avança em <strong class="text-bone">1 segmento</strong> ambos os relógios de ameaça (Ordem e Caos).
					{/if}
				</div>
			</div>
		{:else}
			<p class="text-xs text-bone/40 italic text-center py-6">Selecione uma facção no grafo de teias...</p>
		{/if}

		{#if feedbackMessage}
			<div class="mt-auto border-t border-bronze/20 pt-3 text-[10px] text-ether font-mono leading-tight text-center animate-pulse">
				# {feedbackMessage}
			</div>
		{/if}
	</div>
</div>
