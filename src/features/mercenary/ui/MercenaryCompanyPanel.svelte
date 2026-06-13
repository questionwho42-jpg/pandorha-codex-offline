<script lang="ts">
import { onMount } from "svelte";
import { WorkerClockRepository } from "$lib/entities/clocks/infrastructure/WorkerClockRepository";
import type { ClockData } from "$lib/entities/clocks/model/clockSchema";
import { MercenaryService } from "$lib/entities/mercenary/domain/MercenaryService";
import { WorkerMercenaryRepository } from "$lib/entities/mercenary/infrastructure/WorkerMercenaryRepository";
import type {
	MercenaryCompanyRecord,
	MercenarySquadRecord,
} from "$lib/entities/mercenary/model/mercenarySchema";

interface Props {
	guildGold?: number;
	onUpdateGuildGold?: (amount: number) => void;
}

let { guildGold = 1000, onUpdateGuildGold }: Props = $props();

// Instanciação física
const repository = new WorkerMercenaryRepository();
const clockRepository = new WorkerClockRepository();
const idProvider = { generate: () => crypto.randomUUID() };
const clock = { now: () => new Date().toISOString() };
const service = new MercenaryService(repository, idProvider, clock);

// Estados Svelte 5
let companies = $state<readonly MercenaryCompanyRecord[]>([]);
let activeCompany = $state<MercenaryCompanyRecord | null>(null);
let squads = $state<readonly MercenarySquadRecord[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let message = $state(
	"Selecione ou funde uma Companhia Mercenária para começar...",
);

// Formulário de Criação da HQ
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isCreatingHQ = $state(false);
let newHQName = $state("Guarnição do Crepúsculo");
let selectedHQTier = $state(1);

// Formulário de Recrutamento de Esquadrão
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isRecruitingSquad = $state(false);
let squadName = $state("Pioneiros do Vácuo");
let attrPhysical = $state(2);
let attrMental = $state(1);
let attrSocial = $state(1);
let selectedTags = $state<string[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
const availableTags = [
	"heavy_infantry",
	"stealth",
	"diplomacy",
	"investigation",
	"elite",
	"scout",
];

// Configuração de Missão
let selectedSquadId = $state("");
let missionMatrix = $state<"Physical" | "Mental" | "Social">("Physical");
let missionCD = $state(12);
let missionRewardGold = $state(200);
let missionRequiredTags = $state<string[]>([]);
let leaderCargo = $state<
	"Mestre de Armas" | "Estrategista" | "Emissário" | null
>(null);
let d20Roll = $state(10);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let missionConsoleLog = $state<string>("");

// Estado da missão em progresso
let missionSquadInAction = $state<MercenarySquadRecord | null>(null);
let dispatchClock = $state<ClockData | null>(null);

// Carregamento de dados
export async function loadData() {
	const compRes = await repository.listCompanies();
	if (compRes.success) {
		companies = compRes.data;
		const firstCompany = companies[0];
		if (firstCompany && !activeCompany) {
			activeCompany = firstCompany;
		}
		if (activeCompany) {
			const squadRes = await repository.listSquadsByCompany(activeCompany.id);
			if (squadRes.success) {
				squads = squadRes.data;
				const inAction = squads.find((s) => s.status === "on_mission");
				if (inAction) {
					missionSquadInAction = inAction;
					if (inAction.assignedMissionId) {
						const clockRes = await clockRepository.findById(
							inAction.assignedMissionId,
						);
						if (clockRes.success && clockRes.data) {
							dispatchClock = clockRes.data;
						}
					}
				} else {
					missionSquadInAction = null;
					dispatchClock = null;
				}
			}
		}
	} else {
		message = `⚠️ Erro ao carregar companhias: ${compRes.error.message}`;
	}
}

onMount(async () => {
	await loadData();
});

// Atualiza esquadrões se a companhia ativa mudar
$effect(() => {
	if (activeCompany) {
		void repository.listSquadsByCompany(activeCompany.id).then((res) => {
			if (res.success) squads = res.data;
		});
	} else {
		squads = [];
	}
});

// Fundar HQ
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleCreateHQ() {
	if (!newHQName.trim()) {
		message = "❌ O nome da HQ não pode ser vazio.";
		return;
	}
	const cost = 200 * selectedHQTier;
	if (guildGold < cost) {
		message = `❌ Ouro insuficiente da guilda! A fundação de Tier ${selectedHQTier} custa ${cost} Ouro (Possui: ${guildGold}).`;
		return;
	}

	const res = await service.createCompany({
		hqName: newHQName,
		tier: selectedHQTier,
		bastionId: "primary-bastion",
	});

	if (res.success) {
		activeCompany = res.data;
		message = `🏰 Companhia Mercenária "${res.data.hqName}" (Tier ${res.data.tier}) fundada com sucesso!`;
		isCreatingHQ = false;
		if (onUpdateGuildGold) {
			onUpdateGuildGold(guildGold - cost);
		}
		await loadData();
	} else {
		message = `❌ Falha ao fundar companhia: ${res.error.message}`;
	}
}

// Recrutar Esquadrão
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleRecruitSquad() {
	if (!activeCompany) return;
	if (!squadName.trim()) {
		message = "❌ Digite um nome para o esquadrão.";
		return;
	}
	const recruitCost = 100;
	if (guildGold < recruitCost) {
		message = `❌ Ouro insuficiente para recrutamento! Custo: ${recruitCost} Ouro.`;
		return;
	}

	const res = await service.recruitSquad(activeCompany.id, {
		name: squadName,
		physical: attrPhysical,
		mental: attrMental,
		social: attrSocial,
		tags: selectedTags,
	});

	if (res.success) {
		message = `🛡️ Esquadrão "${res.data.name}" recrutado e pronto para o combate!`;
		isRecruitingSquad = false;
		if (onUpdateGuildGold) {
			onUpdateGuildGold(guildGold - recruitCost);
		}
		squadName = "Recrutas de Pandorha";
		attrPhysical = 2;
		attrMental = 1;
		attrSocial = 1;
		selectedTags = [];
		await loadData();
	} else {
		message = `❌ Falha ao recrutar: ${res.error.message}`;
	}
}

// Mudar Tática
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleAssignTactic(
	squadId: string,
	tactic: "honorable" | "cruel" | "stealthy",
) {
	const res = await service.assignTactic(squadId, tactic);
	if (res.success) {
		message = `⚔️ Tática de comando do esquadrão "${res.data.name}" alterada para [${tactic.toUpperCase()}].`;
		await loadData();
	} else {
		message = `❌ Erro ao atribuir tática: ${res.error.message}`;
	}
}

// Alternar Tags de Missão e Esquadrão
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function toggleTag(tag: string, target: "newSquad" | "mission") {
	if (target === "newSquad") {
		if (selectedTags.includes(tag)) {
			selectedTags = selectedTags.filter((t) => t !== tag);
		} else {
			selectedTags = [...selectedTags, tag];
		}
	} else {
		if (missionRequiredTags.includes(tag)) {
			missionRequiredTags = missionRequiredTags.filter((t) => t !== tag);
		} else {
			missionRequiredTags = [...missionRequiredTags, tag];
		}
	}
}

// Auxiliares de cálculo reativos
const currentSquadForMission = $derived(
	squads.find((s) => s.id === selectedSquadId) || null,
);

const estimatedModifiers = $derived.by(() => {
	if (!currentSquadForMission) return null;
	const s = currentSquadForMission;

	let baseAttr = 0;
	if (missionMatrix === "Physical") baseAttr = s.physical;
	else if (missionMatrix === "Mental") baseAttr = s.mental;
	else if (missionMatrix === "Social") baseAttr = s.social;

	let lBonus = 0;
	if (leaderCargo === "Mestre de Armas" && missionMatrix === "Physical")
		lBonus = 1;
	else if (leaderCargo === "Estrategista" && missionMatrix === "Mental")
		lBonus = 1;
	else if (leaderCargo === "Emissário" && missionMatrix === "Social")
		lBonus = 1;

	const squadTags: string[] = JSON.parse(s.tagsJson);
	let tBonus = 0;
	const matchingTags: string[] = [];
	const missingTags: string[] = [];

	for (const req of missionRequiredTags) {
		if (squadTags.includes(req)) {
			tBonus += 2;
			matchingTags.push(req);
		} else {
			tBonus -= 2;
			missingTags.push(req);
		}
	}

	let tacticBonus = 0;
	if (s.commandTactic === "honorable") tacticBonus = 1;
	else if (s.commandTactic === "cruel") tacticBonus = -1;
	else if (s.commandTactic === "stealthy") {
		tacticBonus = missionRequiredTags.includes("stealth") ? 2 : -1;
	}

	const totalBonus = baseAttr + lBonus + tBonus + tacticBonus;

	return {
		baseAttr,
		leaderBonus: lBonus,
		tagsBonus: tBonus,
		tacticBonus,
		totalBonus,
		matchingTags,
		missingTags,
	};
});

// Despachar esquadrão em missão
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleAssignSquadToMission() {
	if (!selectedSquadId) return;
	const squad = squads.find((s) => s.id === selectedSquadId);
	if (!squad) return;

	const clockId = crypto.randomUUID();
	const clockSaveRes = await clockRepository.save({
		id: clockId,
		name: `Expedição: ${squad.name}`,
		totalSegments: 4,
		filledSegments: 0,
		isCompleted: false,
		triggerEvent: null,
	});

	if (!clockSaveRes.success) {
		message = `❌ Falha ao criar Relógio de Progresso: ${clockSaveRes.error.message}`;
		return;
	}

	const res = await service.assignMission(selectedSquadId, clockId);
	if (res.success) {
		missionSquadInAction = res.data;
		message = `✈️ Esquadrão "${res.data.name}" foi despachado para a missão!`;
		await loadData();
	} else {
		await clockRepository.delete(clockId);
		message = `❌ Não foi possível despachar o esquadrão: ${res.error.message}`;
	}
}

// Rolar d20 aleatório de forma segura e determinística para o linter de Math.random
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function rollD20() {
	const array = new Uint32Array(1);
	crypto.getRandomValues(array);
	const val = array[0];
	if (val !== undefined) {
		d20Roll = (val % 20) + 1;
	} else {
		d20Roll = 1;
	}
}

// Resolver a missão ativa
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleResolveMission() {
	if (!missionSquadInAction) return;

	if (!dispatchClock?.isCompleted) {
		message =
			"❌ A missão ainda não está concluída! O Relógio de Progresso precisa estar completo.";
		return;
	}

	const clockId = missionSquadInAction.assignedMissionId;

	const res = await service.resolveMission({
		squadId: missionSquadInAction.id,
		requiredTags: missionRequiredTags,
		difficulty: missionCD,
		matrix: missionMatrix,
		rewardGold: missionRewardGold,
		d20Roll: d20Roll,
		leaderCargo: leaderCargo,
	});

	if (res.success) {
		if (clockId) {
			await clockRepository.delete(clockId);
		}
		const data = res.data;
		const squadName = data.squad.name;

		let log = `🛡️ [RESOLUÇÃO DE MISSÃO: ${squadName.toUpperCase()}]\n`;
		log += `• Rolagem d20: ${d20Roll}\n`;
		if (estimatedModifiers) {
			log += `• Atributo Base: +${estimatedModifiers.baseAttr}\n`;
			log += `• Cargo de Líder: +${estimatedModifiers.leaderBonus}\n`;
			log += `• Tags Combinantes/Faltantes: +${estimatedModifiers.tagsBonus}\n`;
			log += `• Tática (${data.squad.commandTactic}): +${estimatedModifiers.tacticBonus}\n`;
			log += `• Total Modificador: +${estimatedModifiers.totalBonus}\n`;
			log += `• Total Final: ${d20Roll + estimatedModifiers.totalBonus} vs CD ${missionCD}\n`;
		}

		if (data.success) {
			log += `🏆 SUCESSO! O esquadrão cumpriu a missão de forma exemplar.\n`;
			log += `💰 GP Adquirido: +${data.goldEarned} GP adicionado ao tesouro da guilda.\n`;
			if (onUpdateGuildGold) {
				onUpdateGuildGold(guildGold + data.goldEarned);
			}
		} else {
			log += `💀 FALHA! O esquadrão foi sobrepujado pelos perigos.\n`;
		}

		log += `💔 Desgaste de Coesão: -${data.cohesionLost} Pts (Coesão Restante: ${data.squad.cohesionCurrent}/${data.squad.cohesionMax})\n`;

		if (data.squad.status === "dead") {
			log += `☠️ TRAGÉDIA: O esquadrão "${squadName}" perdeu toda a coesão e foi desfeito permanentemente!`;
		}

		missionConsoleLog = log;
		message = data.success
			? "🏆 Missão concluída com sucesso!"
			: "💀 O esquadrão falhou na missão!";
		missionSquadInAction = null;
		selectedSquadId = "";
		await loadData();
	} else {
		message = `❌ Erro ao resolver missão: ${res.error.message}`;
	}
}
</script>

<div class="max-w-[850px] my-8 mx-auto p-6 bg-void text-bone rounded-lg border border-bronze shadow-2xl relative overflow-hidden font-sans">
	
	<!-- Glows de ambientação -->
	<div class="absolute -top-24 -left-24 w-48 h-48 bg-ether/10 rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute -bottom-24 -right-24 w-48 h-48 bg-blood/10 rounded-full blur-3xl pointer-events-none"></div>

	<!-- Header -->
	<header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-bronze/30 pb-4">
		<div>
			<h2 class="text-2xl font-bold text-ether tracking-wide flex items-center gap-2">
				<span>⚔️</span> Companhias Mercenárias (Peões)
			</h2>
			<span class="text-[10px] text-bone/50 font-mono tracking-widest uppercase block mt-1">Gestão de Esquadrões & Táticas de Combate</span>
		</div>
		<div class="flex items-center gap-4 bg-ruin/50 px-4 py-2 rounded border border-bronze/20">
			<div class="text-right">
				<span class="text-[9px] block text-bone/55 uppercase font-mono">Guild Gold</span>
				<span class="text-sm font-bold text-ether font-mono">{guildGold} GP</span>
			</div>
			{#if activeCompany}
				<div class="h-8 w-[1px] bg-bronze/25"></div>
				<div class="text-right">
					<span class="text-[9px] block text-bone/55 uppercase font-mono">Tier Sede</span>
					<span class="text-xs font-bold text-bronze uppercase font-mono">Tier {activeCompany.tier}</span>
				</div>
			{/if}
		</div>
	</header>

	<!-- Seleção de Companhia / HQ -->
	<div class="mb-6 flex flex-wrap gap-3 items-center justify-between bg-ruin/20 p-4 rounded border border-bronze/10">
		<div class="flex items-center gap-3">
			<span class="text-xs font-bold uppercase text-bone/70">Companhia:</span>
			{#if companies.length === 0}
				<span class="text-xs text-bone/40 italic">Nenhuma guarnição fundada</span>
			{:else}
				<select 
					bind:value={activeCompany}
					class="p-1.5 bg-void border border-bronze/35 rounded text-xs text-bone font-mono outline-none"
				>
					{#each companies as comp}
						<option value={comp}>{comp.hqName} (Tier {comp.tier})</option>
					{/each}
				</select>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			{#if isCreatingHQ}
				<div class="flex items-center gap-2 bg-void p-1.5 rounded border border-bronze/45">
					<input type="text" bind:value={newHQName} placeholder="Nome da HQ" class="p-1 bg-ruin text-xs border border-bronze/20 text-bone outline-none rounded" />
					<select bind:value={selectedHQTier} class="bg-ruin border border-bronze/25 text-xs text-bone font-mono p-1 rounded">
						<option value={1}>Tier 1 (200 GP)</option>
						<option value={2}>Tier 2 (400 GP)</option>
						<option value={3}>Tier 3 (600 GP)</option>
						<option value={4}>Tier 4 (800 GP)</option>
					</select>
					<button onclick={handleCreateHQ} class="px-2 py-1 bg-ether text-void font-bold text-xs rounded hover:bg-white transition-all">Furar</button>
					<button onclick={() => isCreatingHQ = false} class="px-2 py-1 bg-ruin text-bone text-xs rounded hover:bg-[#7f1d1d] transition-all">X</button>
				</div>
			{:else}
				<button 
					onclick={() => isCreatingHQ = true}
					class="px-3 py-1.5 bg-bronze hover:bg-ether hover:text-void text-bone text-xs font-bold rounded uppercase tracking-wider transition-all"
				>
					✙ Fundar Guarnição
				</button>
			{/if}
		</div>
	</div>

	{#if activeCompany}
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
			<!-- Coluna da Esquerda (Lista de Esquadrões) -->
			<div class="lg:col-span-2 flex flex-col gap-4">
				<div class="flex justify-between items-center border-b border-bronze/20 pb-2">
					<h3 class="text-sm font-bold uppercase tracking-widest text-ether">🛡️ Esquadrões de Peões</h3>
					<button 
						onclick={() => isRecruitingSquad = !isRecruitingSquad}
						class="text-xs px-3 py-1 bg-ruin hover:bg-bronze border border-bronze/30 text-bone font-bold rounded uppercase tracking-wider transition-all"
					>
						{isRecruitingSquad ? "Cancelar" : "✙ Recrutar Esquadrão (100 GP)"}
					</button>
				</div>

				<!-- Collapse Recrutar Esquadrão -->
				{#if isRecruitingSquad}
					<div class="p-4 bg-ruin/30 border border-bronze/30 rounded-lg flex flex-col gap-3">
						<h4 class="text-xs font-bold text-ether uppercase">Recrutamento Militar de Peões</h4>
						
						<div class="flex flex-col gap-1">
							<span class="text-[9px] uppercase text-bone/60">Nome do Esquadrão</span>
							<input type="text" bind:value={squadName} class="p-2 bg-void border border-bronze/25 text-xs text-bone outline-none rounded" />
						</div>

						<div class="grid grid-cols-3 gap-3">
							<div class="flex flex-col gap-1 text-center">
								<span class="text-[9px] uppercase text-bone/60">🛡️ Física (Fis)</span>
								<input type="number" bind:value={attrPhysical} min="0" max="5" class="p-1 bg-void text-center text-xs border border-bronze/25 text-bone rounded font-mono" />
							</div>
							<div class="flex flex-col gap-1 text-center">
								<span class="text-[9px] uppercase text-bone/60">🧠 Mental (Men)</span>
								<input type="number" bind:value={attrMental} min="0" max="5" class="p-1 bg-void text-center text-xs border border-bronze/25 text-bone rounded font-mono" />
							</div>
							<div class="flex flex-col gap-1 text-center">
								<span class="text-[9px] uppercase text-bone/60">🤝 Social (Soc)</span>
								<input type="number" bind:value={attrSocial} min="0" max="5" class="p-1 bg-void text-center text-xs border border-bronze/25 text-bone rounded font-mono" />
							</div>
						</div>

						<!-- Seleção de Tags -->
						<div class="flex flex-col gap-1">
							<span class="text-[9px] uppercase text-bone/60">Especialidades (Tags)</span>
							<div class="flex flex-wrap gap-1.5 mt-1">
								{#each availableTags as tag}
									<button 
										onclick={() => toggleTag(tag, "newSquad")}
										class="px-2 py-0.5 rounded border text-[10px] transition-all font-mono
										{selectedTags.includes(tag) ? 'bg-ether text-void border-ether' : 'bg-void text-bone/60 border-bronze/35 hover:border-ether'}"
									>
										{tag}
									</button>
								{/each}
							</div>
						</div>

						<button 
							onclick={handleRecruitSquad}
							class="w-full mt-2 py-2 bg-ether hover:bg-white text-void font-bold text-xs uppercase tracking-wider rounded transition-all"
						>
							Assinar Contrato de Recrutamento (100 GP)
						</button>
					</div>
				{/if}

				<!-- Grid de Cartões de Esquadrão -->
				{#if squads.length === 0}
					<div class="py-8 text-center bg-void rounded border border-bronze/10 italic text-bone/40 text-xs">
						Nenhum esquadrão sob seu comando. Recrute novos peões acima.
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						{#each squads as sq}
							<div class="p-4 rounded border flex flex-col gap-3 relative transition-all duration-300
								{sq.status === 'dead' ? 'bg-void border-void opacity-40' : 'bg-void border-bronze/20 hover:border-bronze/55 shadow-md'}"
							>
								<!-- Topo Card -->
								<div class="flex justify-between items-start">
									<div>
										<h4 class="font-bold text-sm text-bone">{sq.name}</h4>
										<span class="text-[8px] font-mono tracking-widest text-bone/50 uppercase">
											{#if sq.status === 'available'}
												💚 Disponível
											{:else if sq.status === 'on_mission'}
												✈️ Em Missão
											{:else if sq.status === 'resting'}
												💤 Descansando
											{:else}
												☠️ DESTRUÍDO
											{/if}
										</span>
									</div>
									<div class="flex flex-col text-right">
										<span class="text-[9px] text-bone/40 uppercase font-mono">Coesão</span>
										<span class="text-xs font-bold font-mono {sq.cohesionCurrent <= 3 ? 'text-blood animate-pulse' : 'text-ether'}">
											{sq.cohesionCurrent} / {sq.cohesionMax}
										</span>
									</div>
								</div>

								<!-- Barra de Coesão -->
								<div class="w-full bg-ruin/60 h-1.5 rounded-full overflow-hidden p-[1px] border border-bronze/10">
									<div class="h-full rounded-full transition-all duration-500
										{sq.cohesionCurrent <= 3 ? 'bg-blood' : sq.cohesionCurrent <= 6 ? 'bg-bronze' : 'bg-ether'}" 
										style="width: {(sq.cohesionCurrent / sq.cohesionMax) * 100}%"
									></div>
								</div>

								<!-- Atributos Matrizes -->
								<div class="grid grid-cols-3 gap-2 bg-ruin/10 p-2 rounded border border-bronze/5 text-center">
									<div>
										<div class="text-[8px] text-bone/50 uppercase font-mono">Física</div>
										<div class="text-xs font-bold text-ether font-mono">+{sq.physical}</div>
									</div>
									<div>
										<div class="text-[8px] text-bone/50 uppercase font-mono">Mental</div>
										<div class="text-xs font-bold text-ether font-mono">+{sq.mental}</div>
									</div>
									<div>
										<div class="text-[8px] text-bone/50 uppercase font-mono">Social</div>
										<div class="text-xs font-bold text-ether font-mono">+{sq.social}</div>
									</div>
								</div>

								<!-- Especialidades e Tática -->
								<div class="flex flex-wrap gap-1 items-center">
									<span class="text-[8px] text-bone/40 uppercase font-mono">Tags:</span>
									{#each JSON.parse(sq.tagsJson) as t}
										<span class="px-1.5 py-0.5 bg-ruin/40 border border-bronze/20 text-[8px] text-bone/70 rounded font-mono">{t}</span>
									{/each}
								</div>

								{#if sq.status !== 'dead'}
									<div class="flex justify-between items-center border-t border-bronze/10 pt-2 mt-1">
										<span class="text-[9px] text-bone/50 font-mono">Tática: <strong class="text-bronze uppercase">{sq.commandTactic}</strong></span>
										<div class="flex gap-1">
											<button onclick={() => handleAssignTactic(sq.id, "honorable")} disabled={sq.commandTactic === 'honorable'} class="px-1.5 py-0.5 bg-ruin border border-bronze/10 text-[8px] rounded uppercase font-bold text-bone/70 hover:bg-ether hover:text-void">Honesta</button>
											<button onclick={() => handleAssignTactic(sq.id, "cruel")} disabled={sq.commandTactic === 'cruel'} class="px-1.5 py-0.5 bg-ruin border border-bronze/10 text-[8px] rounded uppercase font-bold text-bone/70 hover:bg-ether hover:text-void">Cruel</button>
											<button onclick={() => handleAssignTactic(sq.id, "stealthy")} disabled={sq.commandTactic === 'stealthy'} class="px-1.5 py-0.5 bg-ruin border border-bronze/10 text-[8px] rounded uppercase font-bold text-bone/70 hover:bg-ether hover:text-void">Furtiva</button>
										</div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Coluna da Direita (Missões e Despacho) -->
			<div class="flex flex-col gap-4 bg-ruin/20 p-4 rounded border border-bronze/10">
				<h3 class="text-sm font-bold uppercase tracking-widest text-ether border-b border-bronze/15 pb-2">✈️ Despachar Missão</h3>

				{#if missionSquadInAction}
					<!-- Missão Ativa em Resolução -->
					<div class="p-3 bg-void rounded border border-blood flex flex-col gap-3 text-center">
						<h4 class="text-xs font-bold text-blood uppercase tracking-widest animate-pulse">✈️ Missão em Andamento</h4>
						<p class="text-xs text-bone/80">
							Esquadrão <strong class="text-ether">{missionSquadInAction.name}</strong> em ação!<br>
							Defina a rolagem d20 e clique em resolver.
						</p>

						{#if dispatchClock}
							<div class="flex flex-col gap-1.5 bg-ruin/20 p-2.5 rounded border border-bronze/10 text-left font-sans">
								<div class="flex justify-between items-center text-[10px] uppercase font-mono text-bone/65">
									<span>Relógio de Progresso:</span>
									<span class="text-ether font-bold">{dispatchClock.filledSegments} / {dispatchClock.totalSegments}</span>
								</div>
								<div class="w-full bg-void h-3 rounded-full overflow-hidden p-[2px] border border-bronze/30">
									<div class="h-full rounded-full bg-ether transition-all duration-300" style="width: {(dispatchClock.filledSegments / dispatchClock.totalSegments) * 100}%"></div>
								</div>
								{#if !dispatchClock.isCompleted}
									<span class="text-[9px] text-bronze/70 italic text-center block mt-1">🕒 Avance no hexcrawl ou descanse no acampamento para progredir.</span>
								{:else}
									<span class="text-[9px] text-ether font-bold text-center block mt-1 animate-pulse">✓ Pronto para resolução!</span>
								{/if}
							</div>
						{/if}

						<div class="flex flex-col gap-1.5 bg-ruin/20 p-2.5 rounded border border-bronze/10">
							<span class="text-[9px] uppercase text-bone/60 font-mono">Rolagem d20</span>
							<div class="flex gap-2">
								<input type="number" bind:value={d20Roll} min="1" max="20" class="flex-1 p-1 bg-void text-center font-mono text-xs border border-bronze/25 text-bone outline-none rounded" />
								<button onclick={rollD20} class="px-3 py-1 bg-ether text-void font-bold text-xs rounded hover:bg-white">Rolar</button>
							</div>
						</div>

						<button 
							onclick={handleResolveMission}
							disabled={dispatchClock ? !dispatchClock.isCompleted : false}
							class="w-full py-2 bg-blood hover:bg-[#991b1b] text-white font-bold text-xs uppercase tracking-wider rounded transition-all mt-1 disabled:opacity-40 disabled:pointer-events-none"
						>
							⚔️ Resolver Missão
						</button>
					</div>
				{:else}
					<!-- Configuração da Missão -->
					<div class="flex flex-col gap-3">
						<div class="flex flex-col gap-1">
							<span class="text-[9px] uppercase text-bone/60" data-debug-squad-id={selectedSquadId}>1. Selecionar Esquadrão</span>
							<select 
								bind:value={selectedSquadId}
								class="p-2 bg-void border border-bronze/35 rounded text-xs text-bone outline-none font-mono"
							>
								<option value="">Selecione...</option>
								{#each squads.filter(s => s.status === 'available') as sq}
									<option value={sq.id}>{sq.name} (Fis {sq.physical})</option>
								{/each}
							</select>
						</div>

						<div class="flex flex-col gap-1">
							<span class="text-[9px] uppercase text-bone/60">2. Matriz da Missão</span>
							<select 
								bind:value={missionMatrix}
								class="p-2 bg-void border border-bronze/35 rounded text-xs text-bone outline-none font-mono"
							>
								<option value="Physical">🛡️ Física (Physical)</option>
								<option value="Mental">🧠 Mental (Mental)</option>
								<option value="Social">🤝 Social (Social)</option>
							</select>
						</div>

						<div class="grid grid-cols-2 gap-2">
							<div class="flex flex-col gap-1">
								<span class="text-[9px] uppercase text-bone/60">3. Dificuldade (CD)</span>
								<input type="number" bind:value={missionCD} min="5" max="30" class="p-2 bg-void text-center font-mono text-xs border border-bronze/25 text-bone outline-none rounded" />
							</div>
							<div class="flex flex-col gap-1">
								<span class="text-[9px] uppercase text-bone/60">4. Recompensa (Ouro)</span>
								<input type="number" bind:value={missionRewardGold} min="10" class="p-2 bg-void text-center font-mono text-xs border border-bronze/25 text-bone outline-none rounded" />
							</div>
						</div>

						<!-- Tags da Missão -->
						<div class="flex flex-col gap-1">
							<span class="text-[9px] uppercase text-bone/60">5. Especialidades Requeridas</span>
							<div class="flex flex-wrap gap-1.5 mt-1">
								{#each availableTags as tag}
									<button 
										onclick={() => toggleTag(tag, "mission")}
										class="px-2 py-0.5 rounded border text-[10px] transition-all font-mono
										{missionRequiredTags.includes(tag) ? 'bg-blood text-white border-blood' : 'bg-void text-bone/60 border-bronze/35 hover:border-blood'}"
									>
										{tag}
									</button>
								{/each}
							</div>
						</div>

						<!-- Cargo de Liderança de Andarilho -->
						<div class="flex flex-col gap-1">
							<span class="text-[9px] uppercase text-bone/60">6. Cargo de Líder (Andarilho)</span>
							<select 
								bind:value={leaderCargo}
								class="p-2 bg-void border border-bronze/35 rounded text-xs text-bone outline-none font-mono"
							>
								<option value={null}>Nenhum (+0)</option>
								<option value="Mestre de Armas">Mestre de Armas (bônus Fis +1)</option>
								<option value="Estrategista">Estrategista (bônus Men +1)</option>
								<option value="Emissário">Emissário (bônus Soc +1)</option>
							</select>
						</div>

						<!-- Cálculo Reativo dos Modificadores -->
						{#if currentSquadForMission && estimatedModifiers}
							<div class="p-3 bg-void rounded border border-bronze/15 text-xs font-mono flex flex-col gap-1 text-bone/80">
								<div class="text-ether font-bold border-b border-bronze/10 pb-1 uppercase text-[10px]">Modificadores de Rolagem:</div>
								<div class="flex justify-between">
									<span>• Atributo da Matriz:</span>
									<span class="text-ether font-bold">+{estimatedModifiers.baseAttr}</span>
								</div>
								<div class="flex justify-between">
									<span>• Bônus Cargo Andarilho:</span>
									<span class="text-ether">+{estimatedModifiers.leaderBonus}</span>
								</div>
								<div class="flex justify-between">
									<span>• Adaptação de Tags:</span>
									<span class="{estimatedModifiers.tagsBonus < 0 ? 'text-blood' : 'text-ether'}">
										{estimatedModifiers.tagsBonus >= 0 ? '+' : ''}{estimatedModifiers.tagsBonus}
									</span>
								</div>
								<div class="flex justify-between">
									<span>• Tática ({currentSquadForMission.commandTactic}):</span>
									<span class="{estimatedModifiers.tacticBonus < 0 ? 'text-blood' : 'text-ether'}">
										{estimatedModifiers.tacticBonus >= 0 ? '+' : ''}{estimatedModifiers.tacticBonus}
									</span>
								</div>
								<div class="border-t border-bronze/10 pt-1 mt-1 flex justify-between font-bold text-ether">
									<span>Estimativa Total:</span>
									<span>{estimatedModifiers.totalBonus >= 0 ? '+' : ''}{estimatedModifiers.totalBonus}</span>
								</div>
								
								<!-- Tags Feedback -->
								{#if estimatedModifiers.matchingTags.length > 0}
									<div class="text-[8px] text-ether mt-1">✓ Match: {estimatedModifiers.matchingTags.join(", ")}</div>
								{/if}
								{#if estimatedModifiers.missingTags.length > 0}
									<div class="text-[8px] text-blood">✗ Falta: {estimatedModifiers.missingTags.join(", ")}</div>
								{/if}
							</div>
						{/if}

						<button 
							onclick={handleAssignSquadToMission}
							disabled={!selectedSquadId}
							class="w-full py-2 bg-bronze hover:bg-ether hover:text-void text-bone font-bold text-xs uppercase tracking-wider rounded transition-all mt-1 disabled:opacity-40 disabled:pointer-events-none"
						>
							✈️ Enviar Esquadrão
						</button>
					</div>
				{/if}

				<!-- Logs e Console -->
				<div class="mt-4 flex flex-col gap-2">
					<span class="text-[10px] font-bold text-ether uppercase font-mono"># Log da Guarnição:</span>
					<div class="p-3 bg-void rounded border border-bronze/35 min-h-[90px] whitespace-pre-line font-mono text-[11px] text-bone/85 leading-relaxed">
						{message}
					</div>
				</div>

				{#if missionConsoleLog}
					<div class="p-3 bg-void rounded border border-ether text-xs font-mono text-ether/90 leading-relaxed whitespace-pre-line">
						{missionConsoleLog}
					</div>
				{/if}
			</div>
		</div>
	{:else}
		<div class="py-12 text-center bg-ruin/5 rounded border border-bronze/10">
			<span class="text-4xl">🏰</span>
			<p class="text-xs text-bone/50 italic mt-3">Sua guilda não possui uma sede de companhia mercenária ativa. Funde uma guarnição acima.</p>
		</div>
	{/if}
</div>
