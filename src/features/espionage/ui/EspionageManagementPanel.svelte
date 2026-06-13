<script lang="ts">
import { onMount } from "svelte";
import { fade, slide } from "svelte/transition";
import type { CharacterRecord } from "../../../entities/character";
import type { CompanionRecord } from "../../../entities/companions";
import { WorkerCompanionRepository } from "../../../entities/companions";
import {
	type EspionageCellRecord,
	EspionageService,
	type OperationResult,
	WorkerEspionageRepository,
} from "../../../entities/espionage";
import type {
	CampaignSocialLedgerRecord,
	FactionRecord,
} from "../../../entities/social";
import { WorkerSocialRepository } from "../../../entities/social";
import { WorkerWorldStateRepository } from "../../../entities/world-state";

// Props
interface Props {
	guildGold: number;
	onUpdateGuildGold: (val: number) => void;
	characters: readonly CharacterRecord[];
	characterSession: any;
	isTest?: boolean;
}

let {
	guildGold = $bindable(),
	onUpdateGuildGold,
	characters = [],
	characterSession,
	isTest = false,
}: Props = $props();

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function testableSlide(node: HTMLElement, options: unknown) {
	if (isTest) return {};
	return slide(node, options as any);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function testableFade(node: HTMLElement, options: unknown) {
	if (isTest) return {};
	return fade(node, options as any);
}
const espionageRepo = new WorkerEspionageRepository();
const socialRepo = new WorkerSocialRepository();
const companionRepo = new WorkerCompanionRepository();
const worldStateRepo = new WorkerWorldStateRepository();

let service = $derived(
	new EspionageService(
		espionageRepo,
		// biome-ignore lint/suspicious/noExplicitAny: mocked socialRepo type
		socialRepo as any,
		// biome-ignore lint/suspicious/noExplicitAny: mocked companionRepo type
		companionRepo as any,
		characterSession.repository,
		worldStateRepo,
	),
);

const campaignId = "campaign_default";

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let cells = $state<EspionageCellRecord[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let factionsList = $state<FactionRecord[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let companionsList = $state<CompanionRecord[]>([]);
let selectedCharacterId = $state<string>("");
let ledger = $state<CampaignSocialLedgerRecord | null>(null);

// Estado do Formulário de Fundação
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let showNewCellForm = $state(false);
let newCellFactionId = $state("");
let newCellRegionId = $state("");
let newCellTenenteId = $state("");
let newCellAxis = $state<"physical" | "mental" | "social">("physical");
let newCellTierString = $state("tier-1");
let newCellTier = $derived(Number(newCellTierString.replace("tier-", "")));

// Estado de Resolução de Missão
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let activeMissionCellId = $state<string | null>(null);
let missionTargetDc = $state(15);
let useBribery = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let lastMissionResult = $state<OperationResult | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let showResultModal = $state(false);
let isRolling = $state(false);
let d20VisualRoll = $state(20);

// Inicialização de Dados
onMount(async () => {
	if (characters.length > 0) {
		const firstChar = characters[0];
		if (firstChar) {
			selectedCharacterId = firstChar.id;
		}
	}
	await loadData();
});

// Recarrega companheiros quando o personagem ativo muda
$effect(() => {
	if (selectedCharacterId) {
		void loadCompanionsForCharacter(selectedCharacterId);
	}
});

async function loadData() {
	const recessRes = await service.processWeeklyMaintenanceByTime({
		campaignId,
		availableGold: guildGold,
		timestamp: new Date().toISOString(),
	});

	if (
		recessRes.success &&
		recessRes.data.maintenanceRun &&
		recessRes.data.goldSpent > 0
	) {
		onUpdateGuildGold(guildGold - recessRes.data.goldSpent);
		guildGold = guildGold - recessRes.data.goldSpent;
	}

	// Carregar Células
	const cellsRes = await espionageRepo.listByCampaign(campaignId);
	if (cellsRes.success) {
		cells = [...cellsRes.data];
	}

	// Carregar Facções
	const factionsRes = await socialRepo.listFactions();
	if (factionsRes.success) {
		factionsList = [...factionsRes.data];
	}

	// Carregar Ledger
	const ledgerRes = await socialRepo.getLedger(campaignId);
	if (ledgerRes.success && ledgerRes.data) {
		ledger = { ...ledgerRes.data };
	}
}

async function loadCompanionsForCharacter(charId: string) {
	const compRes = await companionRepo.findCompanionsByCharacter(charId);
	if (compRes.success) {
		// Apenas companheiros não dissipados podem ser tenentes
		companionsList = compRes.data.filter((c) => !c.isDissipated);
	}
}

// Fundação de Nova Célula
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleCreateCell() {
	console.log("[DEBUG CREATE CELL] handleCreateCell chamado", {
		newCellFactionId,
		newCellRegionId,
		newCellTenenteId,
		selectedCharacterId,
		newCellTier,
		newCellTierString,
	});
	if (
		!newCellFactionId ||
		!newCellRegionId ||
		!newCellTenenteId ||
		!selectedCharacterId
	) {
		alert("Preencha todos os campos obrigatórios.");
		return;
	}

	const res = await service.establishCell({
		campaignId,
		characterId: selectedCharacterId,
		factionId: newCellFactionId,
		regionId: newCellRegionId,
		tenenteCompanionId: newCellTenenteId,
		specializedAxis: newCellAxis,
		tier: newCellTier,
		availableGold: guildGold,
		timestamp: new Date().toISOString(),
	});

	if (res.success) {
		onUpdateGuildGold(guildGold - res.data.goldSpent);
		showNewCellForm = false;
		// Reset form
		newCellFactionId = "";
		newCellRegionId = "";
		newCellTenenteId = "";
		await loadData();
	} else {
		alert(`Falha ao fundar célula: ${res.error.message}`);
	}
}

// Rola d20 determinístico/aleatório seguro contra Biome Math.random
function getRandomD20(): number {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	const val = array[0];
	if (val === undefined) return 1;
	return (val % 20) + 1;
}

// Executa Missão Downtime
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleRunMission(
	cell: EspionageCellRecord,
	type: "autonomous" | "coordinated",
) {
	console.log("[DEBUG TEST] handleRunMission chamando. isTest =", isTest);
	if (isRolling) return;
	isRolling = true;
	lastMissionResult = null;

	if (isTest) {
		d20VisualRoll = getRandomD20();
		console.log(
			"[DEBUG TEST] handleRunMission chamando executeActualRoll com d20 =",
			d20VisualRoll,
		);
		await executeActualRoll(cell, type);
		console.log("[DEBUG TEST] handleRunMission executeActualRoll terminou.");
		return;
	}

	// Efeito visual de dados rolando
	let counter = 0;
	const interval = setInterval(() => {
		d20VisualRoll = getRandomD20();
		counter++;
		if (counter > 15) {
			clearInterval(interval);
			executeActualRoll(cell, type);
		}
	}, 80);
}

async function executeActualRoll(
	cell: EspionageCellRecord,
	type: "autonomous" | "coordinated",
) {
	const rollValue = d20VisualRoll;
	// biome-ignore lint/suspicious/noExplicitAny: service response type
	let res: any;
	console.log(
		"[DEBUG TEST] executeActualRoll iniciando. type =",
		type,
		"rollValue =",
		rollValue,
	);

	if (type === "autonomous") {
		res = await service.runAutonomousOperation({
			cellId: cell.id,
			targetDc: missionTargetDc,
			roll: rollValue,
			timestamp: new Date().toISOString(),
			goldenRuleResolution: "heat", // Escolha padrão do PWA
			usePreventionBribery: useBribery,
			availableGold: guildGold,
		});
	} else {
		// Coordenado usa bônus do herói ativo
		const char = characters.find((c) => c.id === selectedCharacterId);
		const heroModifier = char ? Math.max(char.mental, char.social) : 2;
		res = await service.runCoordinatedOperation({
			cellId: cell.id,
			heroLevel: char?.level ?? 1,
			heroModifier,
			fameLevel: ledger?.fameLevel ?? 1,
			targetDc: missionTargetDc,
			roll: rollValue,
			timestamp: new Date().toISOString(),
			goldenRuleResolution: "heat",
			usePreventionBribery: useBribery,
			availableGold: guildGold,
		});
	}

	isRolling = false;
	console.log(
		"[DEBUG TEST] executeActualRoll resultado res.success =",
		res.success,
	);

	if (res.success) {
		lastMissionResult = res.data;
		if (res.data.goldSpent > 0) {
			onUpdateGuildGold(guildGold - res.data.goldSpent);
		}
		showResultModal = true;
		activeMissionCellId = null;
		await loadData();
	} else {
		alert(`Erro na missão: ${res.error.message}`);
	}
}

// Ações Semanais e Resfriamento
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleCoolDown(cellId: string) {
	const res = await service.coolDownCell(cellId, new Date().toISOString());
	if (res.success) {
		await loadData();
	} else {
		alert(`Erro: ${res.error.message}`);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleClearHeat(cellId: string, method: "gold" | "favor") {
	const res = await service.clearHeatWithResources({
		cellId,
		method,
		availableGold: guildGold,
		campaignId,
		timestamp: new Date().toISOString(),
	});

	if (res.success) {
		if (res.data.goldSpent > 0) {
			onUpdateGuildGold(guildGold - res.data.goldSpent);
		}
		await loadData();
	} else {
		alert(`Erro ao limpar Heat: ${res.error.message}`);
	}
}
</script>

<div class="p-6 bg-gradient-to-br from-[#120a21] via-[#0c0514] to-black rounded-lg border border-[#a855f7]/25 shadow-2xl text-[#e9d5ff]">
	<!-- Cabeçalho -->
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#a855f7]/30 pb-4 mb-6 gap-4">
		<div>
			<h1 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] to-[#ec4899] tracking-wider">
				🕸️ CÓDICE DE ESPIONAGEM: A TEIA
			</h1>
			<p class="text-xs text-[#d8b4fe]/70 mt-1">Gerencie células de informantes, espione facções e opere na metrópole durante o Downtime.</p>
		</div>

		<!-- Social Ledger -->
		<div class="flex items-center gap-4 bg-[#12072b]/40 p-3 rounded-lg border border-[#a855f7]/20 backdrop-blur-md">
			<div class="text-center px-2">
				<span class="block text-2xs uppercase tracking-widest text-[#c084fc]">Nível Fama</span>
				<span class="text-xl font-black text-[#f472b6]">{ledger?.fameLevel ?? 0}</span>
			</div>
			<div class="h-8 w-px bg-[#a855f7]/20"></div>
			<div class="text-center px-2">
				<span class="block text-2xs uppercase tracking-widest text-[#c084fc]">Fama XP</span>
				<span class="text-sm font-bold">{ledger?.fameXp ?? 0} XP</span>
			</div>
			<div class="h-8 w-px bg-[#a855f7]/20"></div>
			<div class="text-center px-2">
				<span class="block text-2xs uppercase tracking-widest text-[#c084fc]">Favores</span>
				<span class="text-xl font-black text-[#22d3ee]">{ledger?.favorPoints ?? 0}F</span>
			</div>
			<div class="h-8 w-px bg-[#a855f7]/20"></div>
			<div class="text-center px-2">
				<span class="block text-2xs uppercase tracking-widest text-[#c084fc]">Ouro Total</span>
				<span class="text-sm font-bold text-[#fbbf24]">{guildGold} PO</span>
			</div>
		</div>
	</div>

	<!-- Barra de Ações Rápidas -->
	<div class="flex flex-wrap gap-3 mb-6 bg-[#160d29]/40 p-3 rounded-lg border border-[#a855f7]/10">
		<div class="flex items-center gap-2">
			<label class="text-xs font-semibold text-[#c084fc]" for="hero-select">Herói Ativo:</label>
			<select
				id="hero-select"
				class="bg-[#1b1033] border border-[#a855f7]/30 text-[#e9d5ff] rounded px-2 py-1 text-xs focus:ring-1 focus:ring-[#a855f7] focus:outline-none"
				bind:value={selectedCharacterId}
			>
				{#each characters as char}
					<option value={char.id}>{char.name} (Nível {char.level})</option>
				{/each}
			</select>
		</div>

		<button
			type="button"
			class="ml-auto px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all bg-gradient-to-r from-[#9333ea] to-[#4338ca] hover:from-[#a855f7] hover:to-[#4f46e5] border border-[#c084fc]/40 text-white shadow-lg"
			onclick={() => showNewCellForm = !showNewCellForm}
		>
			🕸️ Fundar Nova Célula
		</button>
	</div>

	<!-- Formulário de Fundação -->
	{#if showNewCellForm}
		<div class="bg-[#12072b]/25 p-5 rounded-lg border border-[#a855f7]/30 mb-6" transition:testableSlide={{ duration: 250 }}>
			<h2 class="text-md font-bold text-[#f472b6] uppercase tracking-wider mb-4 border-b border-[#a855f7]/10 pb-1">Fundar Nova Célula de Espionagem</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="flex flex-col gap-1">
					<label class="text-2xs uppercase tracking-wider text-[#c084fc]" for="faction-select">Facção Local:</label>
					<select
						id="faction-select"
						class="bg-[#1a0e30] border border-[#a855f7]/30 text-[#e9d5ff] rounded px-3 py-2 text-xs focus:outline-none"
						value={newCellFactionId}
						onchange={(e) => newCellFactionId = e.currentTarget.value}
					>
						<option value="">Selecione uma facção</option>
						{#each factionsList as faction}
							<option value={faction.id}>{faction.name}</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-2xs uppercase tracking-wider text-[#c084fc]" for="region-input">Região e Tier:</label>
					<div class="flex gap-2">
						<input
							id="region-input"
							type="text"
							placeholder="Nome da Região"
							class="bg-[#1a0e30] border border-[#a855f7]/30 text-[#e9d5ff] rounded px-3 py-2 text-xs focus:outline-none flex-1"
							bind:value={newCellRegionId}
						/>
						<select
							aria-label="Tier da Região"
							class="bg-[#1a0e30] border border-[#a855f7]/30 text-[#e9d5ff] rounded px-2 py-2 text-xs focus:outline-none w-20"
							value={newCellTierString}
							onchange={(e) => newCellTierString = e.currentTarget.value}
						>
							<option value="tier-1">Tier I</option>
							<option value="tier-2">Tier II</option>
							<option value="tier-3">Tier III</option>
							<option value="tier-4">Tier IV</option>
						</select>
					</div>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-2xs uppercase tracking-wider text-[#c084fc]" for="tenente-select">Tenente Encarregado:</label>
					<select
						id="tenente-select"
						class="bg-[#1a0e30] border border-[#a855f7]/30 text-[#e9d5ff] rounded px-3 py-2 text-xs focus:outline-none"
						value={newCellTenenteId}
						onchange={(e) => newCellTenenteId = e.currentTarget.value}
					>
						<option value="">Selecione um aliado</option>
						{#each companionsList as companion}
							<option value={companion.id}>{companion.name} (Tier {companion.tier})</option>
						{/each}
					</select>
				</div>

				<div class="flex flex-col gap-1">
					<label class="text-2xs uppercase tracking-wider text-[#c084fc]" for="axis-select">Matriz de Especialização:</label>
					<select
						id="axis-select"
						class="bg-[#1a0e30] border border-[#a855f7]/30 text-[#e9d5ff] rounded px-3 py-2 text-xs focus:outline-none"
						value={newCellAxis}
						onchange={(e) => newCellAxis = e.currentTarget.value as any}
					>
						<option value="physical">Físico (Furtividade/Abates)</option>
						<option value="mental">Mental (Dossiês/Rotas)</option>
						<option value="social">Social (Favores/Infiltração)</option>
					</select>
				</div>

				<div class="flex items-end md:col-span-2">
					<div class="text-xs text-[#d8b4fe]/70 mr-auto mb-2">
						Custo de Fundação: <span class="text-[#fbbf24] font-semibold">{100 * newCellTier} PO</span> e <span class="text-[#22d3ee] font-semibold">3 Favores</span>.
					</div>
					<button
						type="button"
						class="px-5 py-2 rounded text-xs font-bold uppercase bg-gradient-to-r from-[#059669] to-[#0f766e] hover:from-[#10b981] hover:to-[#0d9488] text-white shadow-lg mr-2"
						onclick={handleCreateCell}
					>
						Confirmar Fundação
					</button>
					<button
						type="button"
						class="px-5 py-2 rounded text-xs font-bold uppercase bg-ruin border border-[#a855f7]/30 text-[#d8b4fe] hover:bg-[#20102b]"
						onclick={() => showNewCellForm = false}
					>
						Cancelar
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Células Ativas (Grid) -->
	<h2 class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#c084fc] to-[#ec4899] uppercase tracking-widest mb-4">Células da Teia Ativas</h2>
	{#if cells.length === 0}
		<div class="p-8 text-center bg-[#150c25]/30 rounded-lg border border-[#a855f7]/10 text-[#d8b4fe]/50">
			Nenhuma célula fundada nesta campanha. Aumente seu Nível de Fama e recrute tenentes para fundar.
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each cells as cell (cell.id)}
				<div class="bg-[#190e2d]/60 rounded-lg border {cell.isLockdown ? 'border-[#ef4444]/30 bg-[#2d0e19]/30' : 'border-[#a855f7]/25'} p-5 flex flex-col relative overflow-hidden backdrop-blur-sm transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.15)]">
					<!-- Indicador de Lockdown -->
					{#if cell.isLockdown}
						<div class="absolute top-0 right-0 bg-[#dc2626] text-white font-extrabold text-3xs uppercase px-2 py-0.5 tracking-widest">
							Lockdown: {cell.lockdownWeeksRemaining} sem.
						</div>
					{/if}

					<!-- Header Célula -->
					<div class="mb-3">
						<span class="text-2xs uppercase font-extrabold text-[#c084fc] tracking-wider">Região de {cell.regionId} (Tier {cell.tier})</span>
						<h3 class="text-lg font-black text-[#f3e8ff] mt-0.5">
							{factionsList.find((f) => f.id === cell.factionId)?.name ?? "Facção Desconhecida"}
						</h3>
					</div>

					<!-- Atributos -->
					<div class="text-xs space-y-1 text-[#d8b4fe]/80 mb-4 flex-1">
						<div>Tenente: <span class="text-[#e9d5ff] font-semibold">{companionsList.find((c) => c.id === cell.tenenteCompanionId)?.name ?? "Bob"}</span></div>
						<div>Foco da Célula: 
							<span class="px-2 py-0.5 rounded text-3xs font-extrabold uppercase tracking-wide
								{cell.specializedAxis === 'physical' ? 'bg-[#451a03]/60 text-[#fbbf24] border border-[#f59e0b]/20' : ''}
								{cell.specializedAxis === 'mental' ? 'bg-[#172554]/60 text-[#60a5fa] border border-[#3b82f6]/20' : ''}
								{cell.specializedAxis === 'social' ? 'bg-[#500724]/60 text-[#f472b6] border border-[#ec4899]/20' : ''}
							">
								{cell.specializedAxis}
							</span>
						</div>
						<!-- Heat Bar -->
						<div class="flex items-center gap-2 pt-2">
							<span class="text-2xs uppercase tracking-wider text-[#c084fc]">Heat Regional:</span>
							<div class="flex gap-1">
								{#each Array(3) as _, idx}
									<div class="w-5 h-2 rounded-2xs border border-[#a855f7]/20
										{idx < cell.vigilanceHeat 
											? (cell.vigilanceHeat === 3 ? 'bg-[#ef4444] shadow-[0_0_4px_#ef4444]' : 'bg-[#ec4899]') 
											: 'bg-[#12072b]/60'}"
									></div>
								{/each}
							</div>
							<span class="text-3xs font-extrabold text-[#f472b6]">H{cell.vigilanceHeat}</span>
						</div>
					</div>

					<!-- Ações Célula -->
					<div class="border-t border-[#a855f7]/10 pt-4 flex flex-col gap-2">
						{#if !cell.isLockdown}
							<div class="flex gap-2">
								<button
									type="button"
									class="flex-1 px-3 py-1.5 rounded text-2xs font-extrabold uppercase tracking-wider bg-[#581c87]/50 hover:bg-[#6b21a8]/60 text-[#f3e8ff] border border-[#a855f7]/30"
									onclick={() => {
										activeMissionCellId = cell.id;
										lastMissionResult = null;
									}}
								>
									🎯 Rodar Missão
								</button>
								<button
									type="button"
									class="px-2.5 py-1.5 rounded text-2xs font-extrabold bg-[#221035] hover:bg-[#34184f] border border-[#a855f7]/20 text-[#d8b4fe]"
									onclick={() => handleCoolDown(cell.id)}
									title="Resfriamento Passivo: Inativa a célula por 1 semana para reduzir -1 Heat."
								>
									❄️ Resfriar
								</button>
							</div>

							<!-- Limpeza Ativa -->
							{#if cell.vigilanceHeat > 0}
								<div class="flex gap-1.5 mt-1 border-t border-[#a855f7]/5 pt-2">
									<button
										type="button"
										class="flex-1 py-1 rounded text-3xs font-bold uppercase bg-[#451a03]/50 hover:bg-[#78350f]/60 text-[#fbbf24] border border-[#f59e0b]/20"
										onclick={() => handleClearHeat(cell.id, "gold")}
									>
										🧹 Limpar: {100 * cell.tier} PO
									</button>
									<button
										type="button"
										class="flex-1 py-1 rounded text-3xs font-bold uppercase bg-[#083344]/50 hover:bg-[#164e63]/60 text-[#22d3ee] border border-[#06b6d4]/20"
										onclick={() => handleClearHeat(cell.id, "favor")}
									>
										🗣️ Limpar: 1 Favor
									</button>
								</div>
							{/if}
						{:else}
							<div class="text-center text-3xs uppercase tracking-widest text-[#f87171] py-2 border border-[#ef4444]/10 bg-[#450a0a]/10">
								Aguardando Recesso Semanal
							</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Painel Executar Missão -->
	{#if activeMissionCellId}
		{@const cell = cells.find((c) => c.id === activeMissionCellId)}
		{#if cell}
			<div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 backdrop-blur-sm" transition:testableFade={{ duration: 150 }}>
				<div class="bg-[#1b0e33] border border-[#a855f7]/40 p-6 rounded-lg shadow-2xl max-w-md w-full text-[#e9d5ff]">
					<h3 class="text-lg font-black text-[#f472b6] uppercase tracking-widest border-b border-[#a855f7]/10 pb-2 mb-4">🎯 Preparar Operação</h3>

					<div class="space-y-4 text-xs">
						<div>
							<span class="block text-2xs uppercase text-[#c084fc] mb-1">Célula Líder:</span>
							<div class="p-2.5 rounded bg-[#12072b]/30 border border-[#a855f7]/10">
								<span class="font-extrabold text-[#f3e8ff]">{factionsList.find((f) => f.id === cell.factionId)?.name}</span> na região de {cell.regionId}.
							</div>
						</div>

						<div class="flex gap-4">
							<div class="flex-1 flex flex-col gap-1">
								<label class="text-2xs uppercase text-[#c084fc]" for="dc-input">Dificuldade da Missão (DC):</label>
								<input
									id="dc-input"
									type="number"
									class="bg-[#120a24] border border-[#a855f7]/30 rounded p-2 text-[#f3e8ff] focus:outline-none"
									bind:value={missionTargetDc}
								/>
							</div>
							<div class="flex items-center pt-5">
								<label class="flex items-center gap-2 cursor-pointer" for="bribery-checkbox">
									<input
										id="bribery-checkbox"
										type="checkbox"
										class="accent-[#9333ea] h-4 w-4"
										bind:checked={useBribery}
									/>
									<span>Suborno de Proteção ({50 * cell.tier} PO)</span>
								</label>
							</div>
						</div>

						<div class="p-3 bg-[#12072b]/40 rounded border border-[#a855f7]/10 text-[#d8b4fe]">
							<p><strong>Operação Autônoma</strong>: Rola `1d20 + Nível do Tenente (Tier: {companionsList.find((c) => c.id === cell.tenenteCompanionId)?.tier})`.</p>
							<p class="mt-1"><strong>Operação Coordenada</strong>: Rola `1d20 + Nível do Herói + Modificador + Fama`.</p>
						</div>

						<!-- Seção de Rolagem Visual d20 -->
						<div class="flex flex-col items-center py-4 border-t border-b border-[#a855f7]/10">
							<div class="w-16 h-16 rounded-lg bg-gradient-to-br from-[#9333ea] to-[#4338ca] flex items-center justify-center border-2 border-[#f472b6]/50 shadow-lg mb-2 relative overflow-hidden">
								<span class="text-2xl font-black text-white">{d20VisualRoll}</span>
								{#if isRolling}
									<div class="absolute inset-0 bg-[#9333ea]/30 flex items-center justify-center animate-pulse"></div>
								{/if}
							</div>
							<span class="text-3xs uppercase tracking-widest text-[#c084fc] font-extrabold">Virtual d20 Roll</span>
						</div>

						<div class="flex gap-2 pt-2 justify-end">
							<button
								type="button"
								class="px-4 py-2 rounded font-bold uppercase tracking-wider bg-gradient-to-r from-[#9333ea] to-[#db2777] hover:from-[#a855f7] hover:to-[#ec4899] text-white shadow-lg disabled:opacity-50"
								disabled={isRolling}
								onclick={() => handleRunMission(cell, "autonomous")}
							>
								Autônoma
							</button>
							<button
								type="button"
								class="px-4 py-2 rounded font-bold uppercase tracking-wider bg-[#221035] hover:bg-[#34184f] border border-[#a855f7]/30 text-[#d8b4fe] disabled:opacity-50"
								disabled={isRolling}
								onclick={() => handleRunMission(cell, "coordinated")}
							>
								Coordenada
							</button>
							<button
								type="button"
								class="px-4 py-2 rounded font-bold bg-transparent border border-[#a855f7]/10 text-[#c084fc] hover:text-[#d8b4fe] ml-auto"
								onclick={() => activeMissionCellId = null}
							>
								Fechar
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}

	<!-- Modal de Resultado -->
	{#if showResultModal && lastMissionResult}
		<div class="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 backdrop-blur-md" transition:testableFade={{ duration: 150 }}>
			<div class="bg-[#120721] border border-[#a855f7]/40 p-6 rounded-lg shadow-2xl max-w-sm w-full text-[#e9d5ff] text-center">
				<h3 class="text-xl font-black uppercase tracking-wider mb-2
					{lastMissionResult.success ? 'text-[#34d399]' : 'text-[#f87171]'}"
				>
					{lastMissionResult.success ? '🎉 MISSÃO CONCLUÍDA!' : '⚠️ FALHA OPERACIONAL'}
				</h3>
				<p class="text-3xs uppercase tracking-widest text-[#c084fc] mb-4">Relatório de Downtime</p>

				<div class="space-y-3 text-xs mb-6 text-left">
					<div class="p-3 bg-[#12072b]/20 rounded border border-[#a855f7]/10">
						<div class="flex justify-between">
							<span>Rolagem do Dado:</span>
							<span class="font-extrabold text-[#f3e8ff]">d20 ({d20VisualRoll})</span>
						</div>
						<div class="flex justify-between">
							<span>Total com Bônus:</span>
							<span class="font-bold text-[#f3e8ff]">{lastMissionResult.totalRoll}</span>
						</div>
						<div class="flex justify-between border-b border-[#a855f7]/10 pb-1 mb-1">
							<span>Dificuldade Efetiva (DC):</span>
							<span class="font-bold text-[#f3e8ff]">{lastMissionResult.effectiveDc}</span>
						</div>
						<div class="text-[#d8b4fe] pt-1 text-center font-bold">
							Resultado: {lastMissionResult.status.toUpperCase()}
						</div>
					</div>

					<p class="text-center font-medium italic text-[#e9d5ff]">{lastMissionResult.message}</p>

					{#if lastMissionResult.triumphBenefit}
						<div class="p-2.5 bg-[#064e3b]/30 border border-[#10b981]/30 rounded text-[#34d399] text-2xs font-extrabold">
							🎁 Benefício de Triunfo: {lastMissionResult.triumphBenefit}
						</div>
					{/if}

					<div class="flex flex-col gap-1 text-2xs text-[#c084fc]/80 border-t border-[#a855f7]/5 pt-2">
						{#if lastMissionResult.goldSpent > 0}
							<div>Ouro gasto na operação: <span class="text-[#fbbf24] font-semibold">-{lastMissionResult.goldSpent} PO</span></div>
						{/if}
						{#if lastMissionResult.infamyGained > 0}
							<div>Infâmia gerada: <span class="text-[#f472b6] font-semibold">+{lastMissionResult.infamyGained} XP</span></div>
						{/if}
						{#if lastMissionResult.heatGained > 0}
							<div>Heat regional gerado: <span class="text-[#f87171] font-semibold">+{lastMissionResult.heatGained} Ponto</span></div>
						{/if}
					</div>
				</div>

				<button
					type="button"
					class="w-full px-4 py-2 rounded font-bold uppercase tracking-wider bg-gradient-to-r from-[#9333ea] to-[#4338ca] hover:from-[#a855f7] hover:to-[#4f46e5] text-white"
					onclick={() => showResultModal = false}
				>
					Fechar Relatório
				</button>
			</div>
		</div>
	{/if}
</div>
