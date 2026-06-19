<script lang="ts">
// biome-ignore-all lint/correctness/noUnusedImports: Usados no template Svelte 5
// biome-ignore-all lint/correctness/noUnusedVariables: Usados no template Svelte 5
import { onMount, untrack } from "svelte";
import type { CharacterRecord } from "$lib/entities/character";
import { WorkerDowntimeRepository } from "$lib/entities/downtime/infrastructure/WorkerDowntimeRepository";
import { chatState } from "$lib/features/chat";

interface Props {
	characters: readonly CharacterRecord[];
	onDowntimeResolved?: (result: any) => void;
}

let props: Props = $props();
let characters = $derived(props.characters);

// Repositório do Downtime
const repository = new WorkerDowntimeRepository();

// Estados Reativos do Svelte 5
let recessDays = $state(0);
let currentDateDays = $state(0);
let location = $state<"city" | "bastion">("city");
let isResolving = $state(false);
let logs = $state<string[]>([]);
let successNotification = $state<string | null>(null);
let errorNotification = $state<string | null>(null);

// Definição das alocações dos andarilhos
interface AllocationState {
	characterId: string;
	actionTag: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
	// Parâmetros dinâmicos
	tier: "sustento" | "militar" | "lorde";
	statName: string;
	regionId: string;
	bossId: string;
	dc: number;
	subornoPO: number;
	goldSpent: number;
	oldTalentId: string;
	newTalentId: string;
	actionType: "subir_nivel" | "coleta_impostos" | "manutencao_crise";
}

let allocations = $state<Record<string, AllocationState>>({});

// Inicializa ou atualiza as alocações padrão para os andarilhos
$effect(() => {
	if (characters && characters.length > 0) {
		const currentAllocations = untrack(() => allocations);
		const nextAllocations = { ...currentAllocations };
		let changed = false;
		for (const char of characters) {
			if (!nextAllocations[char.id]) {
				nextAllocations[char.id] = {
					characterId: char.id,
					actionTag: "A",
					tier: "sustento",
					statName: "physical",
					regionId: "fac-ruin",
					bossId: "boss_default",
					dc: 15,
					subornoPO: 10,
					goldSpent: 15,
					oldTalentId: "talent_vigil",
					newTalentId: "talent_artifice",
					actionType: "coleta_impostos",
				};
				changed = true;
			}
		}
		if (changed) {
			allocations = nextAllocations;
		}
	}
});

onMount(async () => {
	await loadRecessStatus();
});

async function loadRecessStatus() {
	const res = await repository.getCampaignRecess("campaign_default");
	if (res.success && res.data) {
		recessDays = res.data.recessDays;
		currentDateDays = res.data.currentDateDays;
	}
}

function triggerSuccess(msg: string) {
	successNotification = msg;
	setTimeout(() => {
		successNotification = null;
	}, 4000);
}

function triggerError(msg: string) {
	errorNotification = msg;
	setTimeout(() => {
		errorNotification = null;
	}, 4000);
}

async function handleAddRecess() {
	isResolving = true;
	const res = await repository.addRecessDays("campaign_default", 7);
	isResolving = false;
	if (res.success && res.data) {
		recessDays = res.data.recessDays;
		currentDateDays = res.data.currentDateDays;
		triggerSuccess("Simulado +7 dias de recesso global no banco local!");
	} else {
		triggerError("Falha ao adicionar dias de recesso.");
	}
}

async function handleResolveWeek() {
	if (recessDays < 7) {
		triggerError("Dias de recesso insuficientes (mínimo de 7 dias exigido).");
		return;
	}

	isResolving = true;
	errorNotification = null;
	successNotification = null;

	const formattedAllocations = characters.map((char) => {
		const alloc = allocations[char.id];
		const params: any = {};

		if (alloc.actionTag === "A") {
			params.tier = alloc.tier;
			params.statName = alloc.statName;
			params.regionId = alloc.regionId;
		} else if (alloc.actionTag === "C") {
			params.bossId = alloc.bossId;
			params.dc = Number(alloc.dc);
			params.subornoPO = Number(alloc.subornoPO);
		} else if (alloc.actionTag === "D") {
			params.statName = alloc.statName;
		} else if (alloc.actionTag === "E") {
			params.regionId = alloc.regionId;
			params.goldSpent = Number(alloc.goldSpent);
			params.statName = alloc.statName;
			params.dc = Number(alloc.dc);
		} else if (alloc.actionTag === "F") {
			params.oldTalentId = alloc.oldTalentId;
			params.newTalentId = alloc.newTalentId;
		} else if (alloc.actionTag === "G") {
			params.actionType = alloc.actionType;
			params.statName = alloc.statName;
		} else if (alloc.actionTag === "H") {
			params.factionId = alloc.regionId;
			params.statName = alloc.statName;
			params.dc = Number(alloc.dc);
		}

		return {
			characterId: char.id,
			actionTag: alloc.actionTag,
			params,
		};
	});

	const res = await repository.resolveDowntimeWeek({
		campaignId: "campaign_default",
		location,
		allocations: formattedAllocations,
	});

	isResolving = false;

	if (res.success) {
		const outcome = res.data;
		recessDays = outcome.recessDays;
		currentDateDays = outcome.currentDateDays;

		triggerSuccess("Semana de Downtime resolvida com sucesso!");

		// Registrar logs retornados
		if (outcome.logs && outcome.logs.length > 0) {
			const roundLogs: string[] = [];
			for (const logItem of outcome.logs) {
				const char = characters.find((c) => c.id === logItem.characterId);
				const charName = char
					? char.name
					: `Andarilho [${logItem.characterId}]`;
				const msg = `[Tag ${logItem.actionTag}] ${charName}: ${logItem.outcomeDetails} (Rolagem: ${logItem.rollResult ?? "N/A"})`;
				roundLogs.push(msg);

				// Enviar para o chat de campanha global
				chatState.addMessage({
					type: "camp",
					content: `💤 **Downtime - ${charName}**: ${logItem.outcomeDetails} ${logItem.rollResult !== null && logItem.rollResult !== undefined ? `(Rolado: ${logItem.rollResult})` : ""}`,
				});
			}
			logs = [...roundLogs, ...logs].slice(0, 20);
		}

		if (outcome.clocksAdvanced && outcome.clocksAdvanced.length > 0) {
			for (const clk of outcome.clocksAdvanced) {
				chatState.addMessage({
					type: "narrative",
					sender: "Relógios",
					content: `⏰ O Relógio de Facção **${clk.clockName}** avançou para **${clk.currentSegments}/${clk.maxSegments}**!`,
				});
			}
		}

		if (outcome.siegeTriggered) {
			chatState.addMessage({
				type: "combat",
				sender: "Bastião",
				content: `🚨 **ALERTA MILITAR**: Um cerco violento foi iniciado nas portas do Bastião devido ao avanço dos Relógios de Facção!`,
			});
		} else if (location === "bastion") {
			chatState.addMessage({
				type: "camp",
				content: `🛡️ **Bastião Seguro**: Recesso executado na base. Atenuação de perigo militar aplicada com sucesso nesta semana.`,
			});
		}

		props.onDowntimeResolved?.(outcome);
	} else {
		triggerError(
			res.error.message || "Falha na transação atômica do SQLite WASM.",
		);
	}
}

const tagCatalog = [
	{
		id: "A",
		name: "Tag A: Busca Legal de Ouro (Sustento)",
		desc: "Trabalhe comercialmente ou militarmente na região para obter moedas de ouro ou sustento semanal.",
	},
	{
		id: "B",
		name: "Tag B: Recuperação Prolongada (Curas)",
		desc: "Gaste 100 PO no santuário para remover enfermidades graves e patologias acumuladas.",
	},
	{
		id: "C",
		name: "Tag C: Investigação Arcana/Urbana",
		desc: "Invista moedas de suborno e rola Mental + Interaction para revelar imunidades e fraquezas de um monstro.",
	},
	{
		id: "D",
		name: "Tag D: Compra e Venda Especulativa",
		desc: "Barganhe com contrabandistas rúnicos no submundo regional para obter descontos/bônus comerciais.",
	},
	{
		id: "E",
		name: "Tag E: Boemia e Lavagem de Infâmia",
		desc: "Organize banquetes extravagantes de 15 a 50 PO para atenuar sua infâmia regional política.",
	},
	{
		id: "F",
		name: "Tag F: Re-Treinamento (Respec)",
		desc: "Intercambie talentos ativos sob a supervisão de mestres da guilda para redefinir sua build.",
	},
	{
		id: "G",
		name: "Tag G: Gestão de Domínio Regional",
		desc: "Coleta impostos, resolva crises territoriais ou administre a infraestrutura tributária da fortaleza.",
	},
	{
		id: "H",
		name: "Tag H: Juramento de Sangue",
		desc: "Sela pactos duradouros com facções locais pagando contribuições de aliança de 500 PO por nível.",
	},
] as const;

const regionalFactions = [
	{ id: "fac-ruin", name: "Sectários da Ruína" },
	{ id: "fac-ether", name: "Guardiões do Ether" },
	{ id: "fac-bronze", name: "Sindicato de Bronze" },
];
</script>

<div class="downtime-panel bg-void text-bone rounded-lg border border-bronze/35 p-6 flex flex-col gap-6 relative overflow-hidden shadow-2xl">
	
	<!-- Luz de fundo pulsante neon eleriana -->
	<div class="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-runic/5 filter blur-[80px] pointer-events-none"></div>

	<!-- Cabeçalho Principal -->
	<div class="border-b border-bronze/20 pb-4 z-10">
		<h2 class="text-xl font-bold uppercase tracking-wider text-purple-runic flex items-center gap-2">
			<span>💤</span> Downtime e Recesso dos Andarilhos
		</h2>
		<p class="text-xs text-bone/60 italic mt-1 leading-relaxed">
			Gerencie o interlúdio de recesso semanal do seu grupo de Andarilhos. Distribua as atividades das <strong class="text-purple-runic">Tags A a H</strong> e execute ações de repouso, curas, treino e política.
		</p>
	</div>

	<!-- Notificações -->
	{#if successNotification}
		<div class="downtime-alert success-alert animate-pulse">
			✔️ {successNotification}
		</div>
	{/if}
	{#if errorNotification}
		<div class="downtime-alert error-alert animate-pulse">
			⚠️ {errorNotification}
		</div>
	{/if}

	<!-- Barra de Status do Recesso Global -->
	<div class="grid md:grid-cols-3 gap-4 bg-ruin/20 p-4 rounded border border-bronze/10 z-10">
		<div class="flex flex-col gap-1.5">
			<span class="text-[10px] uppercase font-bold text-bone/50 tracking-wider">Semanas Totais Calendário:</span>
			<span class="font-mono text-base text-bone font-bold">Semana {Math.floor(currentDateDays / 7) + 1} ({currentDateDays} dias acumulados)</span>
		</div>
		<div class="flex flex-col gap-1.5 md:col-span-2">
			<div class="flex justify-between items-center text-[10px] uppercase font-bold text-bone/50 tracking-wider">
				<span>Saldo de Recesso Disponível:</span>
				<span class="text-purple-runic font-bold">{recessDays} dias ({Math.floor(recessDays / 7)} semanas)</span>
			</div>
			<div class="h-3 w-full bg-void rounded border border-bronze/25 overflow-hidden flex items-center">
				<div class="h-full bg-gradient-to-r from-purple-runic to-ether transition-all duration-500" style="width: {Math.min(100, (recessDays / 28) * 100)}%"></div>
			</div>
		</div>
	</div>

	<!-- Controles Gerais de Configuração -->
	<div class="grid md:grid-cols-2 gap-4 z-10 bg-void/50 p-4 rounded border border-bronze/15">
		<!-- Localização do Recesso -->
		<div class="flex flex-col gap-2">
			<span class="text-xs font-bold uppercase tracking-wider text-bone/70">Local de Repouso:</span>
			<div class="flex gap-4">
				<label class="flex items-center gap-2 text-xs cursor-pointer text-bone hover:text-ether transition-colors">
					<input type="radio" bind:group={location} value="city" class="accent-purple-runic" />
					<span>🏙️ Cidade Livre (Sem proteção extra)</span>
				</label>
				<label class="flex items-center gap-2 text-xs cursor-pointer text-bone hover:text-purple-runic transition-colors">
					<input type="radio" bind:group={location} value="bastion" class="accent-purple-runic" />
					<span>🏰 Bastião Seguro (Atenua cercos e clocks)</span>
				</label>
			</div>
		</div>

		<!-- Ferramentas de Testes -->
		<div class="flex items-end justify-end gap-2">
			<button
				type="button"
				class="px-4 py-2 bg-ruin border border-bronze/30 text-bone hover:border-ether hover:text-ether text-xs font-bold uppercase tracking-wider rounded transition-all duration-300"
				onclick={handleAddRecess}
				disabled={isResolving}
			>
				➕ Simular +7 Dias
			</button>
			<button
				type="button"
				class="px-5 py-2 bg-purple-runic text-void border border-purple-runic/40 hover:bg-ether hover:border-ether font-black text-xs uppercase tracking-wider rounded shadow-lg shadow-purple-runic/20 transition-all duration-300 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
				onclick={handleResolveWeek}
				disabled={isResolving || recessDays < 7 || characters.length === 0}
			>
				🎲 Resolver Recesso Semanal
			</button>
		</div>
	</div>

	<!-- Grade de Alocação de Andarilhos -->
	<div class="flex flex-col gap-4 z-10">
		<h3 class="text-xs font-bold uppercase tracking-widest text-purple-runic border-b border-bronze/10 pb-2">
			👥 Alocação de Andarilhos do Grupo
		</h3>

		{#if characters.length === 0}
			<p class="text-xs text-bone/50 italic py-4 text-center">Nenhum Andarilho cadastrado para o recesso. Crie personagens na aba correspondente.</p>
		{:else}
			<div class="grid gap-6">
				{#each characters as char}
					{#if allocations[char.id]}
						<div class="bg-void/80 p-4 rounded border border-bronze/25 flex flex-col md:grid md:grid-cols-[200px_1fr] gap-4 relative overflow-hidden">
							
							<!-- Esquerda: Ficha Rápida do Personagem -->
							<div class="flex flex-col border-b md:border-b-0 md:border-r border-bronze/10 pb-3 md:pb-0 md:pr-4">
								<h4 class="font-bold text-bone text-sm">{char.name}</h4>
								<span class="text-[10px] text-ether uppercase tracking-wider mt-0.5">
									Nível {char.level} • Class: {char.classId.toUpperCase()}
								</span>
								<div class="grid grid-cols-3 gap-1 mt-3 text-[10px] font-mono text-center">
									<div class="bg-ruin/40 p-1 rounded">
										<div class="text-bone/50">FIS</div>
										<div class="text-ether font-bold">+{char.physical}</div>
									</div>
									<div class="bg-ruin/40 p-1 rounded">
										<div class="text-bone/50">MEN</div>
										<div class="text-ether font-bold">+{char.mental}</div>
									</div>
									<div class="bg-ruin/40 p-1 rounded">
										<div class="text-bone/50">SOC</div>
										<div class="text-ether font-bold">+{char.social}</div>
									</div>
								</div>
							</div>

							<!-- Direita: Alocação da Ação -->
							<div class="flex flex-col gap-3">
								<div class="grid sm:grid-cols-2 gap-3">
									<!-- Seletor de Tag -->
									<div class="flex flex-col gap-1 text-xs">
										<label for="tag-select-{char.id}" class="text-bone/70 font-semibold">Selecione a Ação de Downtime:</label>
										<select
											id="tag-select-{char.id}"
											bind:value={allocations[char.id].actionTag}
											class="bg-void border border-bronze/35 rounded p-2 text-xs font-semibold text-purple-runic focus:outline-none focus:border-purple-runic"
										>
											{#each tagCatalog as tagItem}
												<option value={tagItem.id} class="bg-void text-bone">{tagItem.name}</option>
											{/each}
										</select>
									</div>

									<!-- Descrição Rápida -->
									<div class="flex items-center text-xs text-bone/60 italic leading-relaxed pt-2 sm:pt-4">
										{tagCatalog.find(t => t.id === allocations[char.id].actionTag)?.desc}
									</div>
								</div>

								<!-- Parâmetros Dinâmicos Baseados na Tag Selecionada -->
								<div class="bg-ruin/20 p-3 rounded border border-bronze/10 text-xs flex flex-col gap-3">
									{#if allocations[char.id].actionTag === "A"}
										<!-- Parâmetros Tag A -->
										<div class="grid sm:grid-cols-3 gap-3">
											<div class="flex flex-col gap-1">
												<label for="tagA-tier-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Categoria de Trabalho:</label>
												<select id="tagA-tier-{char.id}" bind:value={allocations[char.id].tier} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													<option value="sustento">Sustento Básico (DC 10)</option>
													<option value="militar">Guarda Militar (DC 15 - ganha PO)</option>
													<option value="lorde">Alta Corte de Lorde (DC 20 - ganha muito PO)</option>
												</select>
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagA-stat-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Atributo Aplicado:</label>
												<select id="tagA-stat-{char.id}" bind:value={allocations[char.id].statName} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													<option value="physical">Físico (+{char.physical})</option>
													<option value="mental">Mental (+{char.mental})</option>
													<option value="social">Social (+{char.social})</option>
												</select>
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagA-region-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Região de Influência:</label>
												<select id="tagA-region-{char.id}" bind:value={allocations[char.id].regionId} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													{#each regionalFactions as fac}
														<option value={fac.id}>{fac.name}</option>
													{/each}
												</select>
											</div>
										</div>
									{:else if allocations[char.id].actionTag === "B"}
										<!-- Parâmetros Tag B -->
										<div class="text-bone/70 flex items-center gap-2">
											<span class="text-orange-hungry">❤️</span>
											<span>Esta ação deduzirá **100 PO** do cofre central para curar todas as enfermidades, toxinas e status degradados de **{char.name}**.</span>
										</div>
									{:else if allocations[char.id].actionTag === "C"}
										<!-- Parâmetros Tag C -->
										<div class="grid sm:grid-cols-3 gap-3">
											<div class="flex flex-col gap-1">
												<label for="tagC-boss-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Criatura/Chefe Alvo:</label>
												<input id="tagC-boss-{char.id}" type="text" bind:value={allocations[char.id].bossId} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagC-dc-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Dificuldade da Trilha (DC):</label>
												<input id="tagC-dc-{char.id}" type="number" bind:value={allocations[char.id].dc} min="10" max="30" class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagC-bri-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Suborno Oferecido (PO):</label>
												<input id="tagC-bri-{char.id}" type="number" bind:value={allocations[char.id].subornoPO} min="0" class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
										</div>
									{:else if allocations[char.id].actionTag === "D"}
										<!-- Parâmetros Tag D -->
										<div class="flex flex-col gap-1 max-w-xs">
											<label for="tagD-stat-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Atributo de Barganha:</label>
											<select id="tagD-stat-{char.id}" bind:value={allocations[char.id].statName} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
												<option value="social">Social (Lábia/Barganha: +{char.social})</option>
												<option value="mental">Mental (Conhecimento Rúnico: +{char.mental})</option>
											</select>
										</div>
									{:else if allocations[char.id].actionTag === "E"}
										<!-- Parâmetros Tag E -->
										<div class="grid sm:grid-cols-4 gap-3">
											<div class="flex flex-col gap-1">
												<label for="tagE-region-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Região de Tavernas:</label>
												<select id="tagE-region-{char.id}" bind:value={allocations[char.id].regionId} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													{#each regionalFactions as fac}
														<option value={fac.id}>{fac.name}</option>
													{/each}
												</select>
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagE-gold-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Gastos Boêmios (15-50 PO):</label>
												<input id="tagE-gold-{char.id}" type="number" bind:value={allocations[char.id].goldSpent} min="15" max="50" class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagE-stat-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Atributo Social:</label>
												<select id="tagE-stat-{char.id}" bind:value={allocations[char.id].statName} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													<option value="social">Social (Oratória: +{char.social})</option>
													<option value="mental">Mental (Cálculo Político: +{char.mental})</option>
												</select>
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagE-dc-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Dificuldade Político (DC):</label>
												<input id="tagE-dc-{char.id}" type="number" bind:value={allocations[char.id].dc} min="10" max="30" class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
										</div>
									{:else if allocations[char.id].actionTag === "F"}
										<!-- Parâmetros Tag F -->
										<div class="grid sm:grid-cols-2 gap-3">
											<div class="flex flex-col gap-1">
												<label for="tagF-old-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Habilidade/Talento a Esquecer:</label>
												<input id="tagF-old-{char.id}" type="text" bind:value={allocations[char.id].oldTalentId} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagF-new-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Nova Habilidade a Aprender:</label>
												<input id="tagF-new-{char.id}" type="text" bind:value={allocations[char.id].newTalentId} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
										</div>
									{:else if allocations[char.id].actionTag === "G"}
										<!-- Parâmetros Tag G -->
										<div class="grid sm:grid-cols-2 gap-3">
											<div class="flex flex-col gap-1">
												<label for="tagG-type-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Operação de Domínio:</label>
												<select id="tagG-type-{char.id}" bind:value={allocations[char.id].actionType} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													<option value="coleta_impostos">Coleta de Impostos do Bastião</option>
													<option value="subir_nivel">Fomento e Evolução Regional</option>
													<option value="manutencao_crise">Atenuação e Segurança de Território</option>
												</select>
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagG-stat-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Atributo de Gestão:</label>
												<select id="tagG-stat-{char.id}" bind:value={allocations[char.id].statName} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													<option value="mental">Mental (Estratégia: +{char.mental})</option>
													<option value="physical">Físico (Presença Militar: +{char.physical})</option>
													<option value="social">Social (Negociação Fiscal: +{char.social})</option>
												</select>
											</div>
										</div>
									{:else if allocations[char.id].actionTag === "H"}
										<!-- Parâmetros Tag H -->
										<div class="grid sm:grid-cols-3 gap-3">
											<div class="flex flex-col gap-1">
												<label for="tagH-faction-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Facção Pactuada:</label>
												<select id="tagH-faction-{char.id}" bind:value={allocations[char.id].regionId} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													{#each regionalFactions as fac}
														<option value={fac.id}>{fac.name}</option>
													{/each}
												</select>
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagH-stat-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Atributo de Aliança:</label>
												<select id="tagH-stat-{char.id}" bind:value={allocations[char.id].statName} class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether">
													<option value="social">Social (Carisma/Pacto: +{char.social})</option>
													<option value="mental">Mental (Cálculo Hermético: +{char.mental})</option>
												</select>
											</div>
											<div class="flex flex-col gap-1">
												<label for="tagH-dc-{char.id}" class="text-bone/60 text-[10px] uppercase font-bold">Dificuldade da Aliança (DC):</label>
												<input id="tagH-dc-{char.id}" type="number" bind:value={allocations[char.id].dc} min="15" max="35" class="bg-void border border-bronze/35 rounded p-1 text-xs text-ether font-mono" />
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	</div>

	<!-- Log Histórico Visual -->
	<div class="panel log-panel glass bg-ruin/5 rounded border border-bronze/20 p-4 z-10">
		<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/10 pb-2 mb-3">
			📜 Histórico de Resoluções Recentes
		</h3>
		<div class="logs-container max-h-48 overflow-y-auto flex flex-col gap-1.5 font-mono text-[10px] text-bone/85">
			{#each logs as logMsg}
				<div class="p-1.5 bg-void/50 border-l-2 border-purple-runic rounded-r">{logMsg}</div>
			{/each}
			{#if logs.length === 0}
				<p class="text-xs text-bone/50 italic text-center py-4">Nenhum recesso semanal resolvido nesta sessão.</p>
			{/if}
		</div>
	</div>
</div>

