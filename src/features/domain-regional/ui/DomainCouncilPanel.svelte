<script lang="ts">
import { onMount } from "svelte";
import { RegionalDomainService } from "$lib/entities/domain-regional/domain/RegionalDomainService";
import { WorkerRegionalDomainRepository } from "$lib/entities/domain-regional/infrastructure/WorkerRegionalDomainRepository";
import type { RegionalDomainRecord } from "$lib/entities/domain-regional/model/regionalDomainSchema";

interface Props {
	// Opcional: permite injetar fundos da guilda compartilhada no App.svelte
	guildGold?: number;
	onUpdateGuildGold?: (amount: number) => void;
}

let { guildGold = 1000, onUpdateGuildGold }: Props = $props();

// Instanciação física do Repositório do Worker e do Serviço
const repository = new WorkerRegionalDomainRepository();
const idProvider = { generate: () => crypto.randomUUID() };
const clock = { now: () => new Date().toISOString() };
const service = new RegionalDomainService(repository, idProvider, clock);

// Estados Reativos Svelte 5
let domains = $state<readonly RegionalDomainRecord[]>([]);
let activeDomain = $state<RegionalDomainRecord | null>(null);
let message = $state("Selecione ou crie um Domínio Regional para governar...");
let isCreating = $state(false);
let selectedTier = $state(1);

// Inputs de Simulação GM/Líder
let leaderAttribute = $state(3); // Modificador de atributo do líder
let d20Roll = $state(10);
let d20RollTax1 = $state(12);
let d20RollTax2 = $state(8);

// Estados de crise gerados em tempo de execução
let lastTaxResult = $state<{
	revenue: number;
	stabilityRoll: number;
	cd: number;
	hasCrisis: boolean;
} | null>(null);

let lastStabilityResult = $state<{
	roll: number;
	cd: number;
	hasCrisis: boolean;
} | null>(null);

let activeCrisis = $state<{
	matrix: "physical" | "mental" | "social";
} | null>(null);

// Carrega os domínios do banco local
async function loadDomains() {
	const result = await repository.listAll();
	if (result.success) {
		domains = result.data;
		if (domains.length > 0 && !activeDomain) {
			activeDomain = domains[0]!;
		}
	} else {
		message = `⚠️ Erro ao listar domínios: ${result.error.message}`;
	}
}

onMount(async () => {
	await loadDomains();
});

// Cria um novo domínio regional
async function handleCreateDomain() {
	const res = await service.createDomain({ tier: selectedTier });
	if (res.success) {
		activeDomain = res.data;
		message = `👑 Novo Domínio Regional de Tier ${selectedTier} fundado com sucesso!`;
		isCreating = false;
		await loadDomains();
	} else {
		message = `❌ Falha ao fundar domínio: ${res.error.message}`;
	}
}

// Evolução de Matriz
async function handleUpgradeMatrix(matrix: "physical" | "mental" | "social") {
	if (!activeDomain) return;
	const res = await service.upgradeMatrix({ id: activeDomain.id, matrix });
	if (res.success) {
		activeDomain = res.data;
		message = `📈 Matriz ${matrix === "physical" ? "Física" : matrix === "mental" ? "Mental" : "Social"} evoluída com sucesso!`;
		await loadDomains();
	} else {
		message = `⚠️ Não foi possível evoluir matriz: ${res.error.message}`;
	}
}

// Contratação de Regente
async function handleToggleRegent() {
	if (!activeDomain) return;
	const nextRegent = activeDomain.regentId ? null : "regente_nomade_local";
	const res = await service.hireRegent({
		id: activeDomain.id,
		regentId: nextRegent,
	});
	if (res.success) {
		activeDomain = res.data;
		message = nextRegent
			? "👤 Regente contratado! A taxa de perseguição de ausência foi reduzida pela metade."
			: "👤 Regente demitido. O território agora está vulnerável à ausência da guilda.";
		await loadDomains();
	} else {
		message = `⚠️ Falha ao alterar regente: ${res.error.message}`;
	}
}

// Semanas de Ausência
async function handleAdjustWeeks(amount: number) {
	if (!activeDomain) return;
	if (amount > 0) {
		const res = await service.addWeeksAway({
			id: activeDomain.id,
			weeks: amount,
		});
		if (res.success) {
			activeDomain = res.data;
			message = `⏳ O tempo passa... Mais ${amount} semana(s) de ausência acumuladas no território.`;
			await loadDomains();
		}
	} else {
		const res = await service.resetWeeksAway({ id: activeDomain.id });
		if (res.success) {
			activeDomain = res.data;
			message =
				"✨ A guilda retornou ao território! Contador de ausência redefinido para 0.";
			await loadDomains();
		}
	}
}

// Teste de Estabilidade Ativo
async function handleStabilityCheck(matrix: "physical" | "mental" | "social") {
	if (!activeDomain) return;
	const res = await service.resolveStabilityCheck({
		id: activeDomain.id,
		matrix,
		leaderAttribute,
		d20Roll,
	});

	if (res.success) {
		const data = res.data;
		lastStabilityResult = {
			roll: data.roll,
			cd: data.cd,
			hasCrisis: data.hasCrisis,
		};
		lastTaxResult = null;

		if (data.hasCrisis) {
			activeCrisis = { matrix };
			message = `⚠️ CRRISE ESTOURADA! O teste de Estabilidade falhou (Rolagem: ${data.roll} vs CD ${data.cd}). A região sofre com instabilidade!`;
		} else {
			message = `❇️ Sucesso! O território manteve-se estável sob sua influência (Rolagem: ${data.roll} vs CD ${data.cd}).`;
		}
	} else {
		message = `❌ Falha ao rolar estabilidade: ${res.error.message}`;
	}
}

// Coleta de Impostos (Com Desvantagem)
async function handleCollectTaxes() {
	if (!activeDomain) return;
	const res = await service.collectTaxes({
		id: activeDomain.id,
		leaderCarisma: leaderAttribute,
		d20Roll1: d20RollTax1,
		d20Roll2: d20RollTax2,
	});

	if (res.success) {
		const data = res.data;
		lastTaxResult = {
			revenue: data.revenue,
			stabilityRoll: data.stabilityRoll,
			cd: data.cd,
			hasCrisis: data.hasCrisis,
		};
		lastStabilityResult = null;

		if (onUpdateGuildGold) {
			onUpdateGuildGold(guildGold + data.revenue);
		}

		if (data.hasCrisis) {
			activeCrisis = { matrix: "social" };
			message = `💰 Impostos cobrados! Renda gerada: +${data.revenue} Ouro. Contudo, a cobrança gerou revolta social! CRISE ATIVA (Teste: ${data.stabilityRoll} vs CD ${data.cd}).`;
		} else {
			message = `💰 Impostos cobrados com sucesso! Renda gerada: +${data.revenue} Ouro. O povo permanece leal e estável.`;
		}
	} else {
		message = `❌ Falha na cobrança: ${res.error.message}`;
	}
}

// Resolução de Crise
async function handleResolveCrisis(resolution: "delegate" | "negligence") {
	if (!activeDomain || !activeCrisis) return;
	const matrix = activeCrisis.matrix;

	// Se for delegar, verificar custo de Ouro
	let level = 0;
	if (matrix === "physical") level = activeDomain.physicalLevel;
	else if (matrix === "mental") level = activeDomain.mentalLevel;
	else if (matrix === "social") level = activeDomain.socialLevel;

	const cost = 5 * 10 ** activeDomain.tier * level;

	if (resolution === "delegate" && guildGold < cost) {
		message = `❌ Ouro insuficiente da guilda! A delegação custa ${cost} Ouro (Possui: ${guildGold}).`;
		return;
	}

	const res = await service.resolveCrisis({
		id: activeDomain.id,
		matrix,
		resolution,
	});

	if (res.success) {
		activeDomain = res.data.domain;
		activeCrisis = null;
		lastTaxResult = null;
		lastStabilityResult = null;

		if (resolution === "delegate") {
			if (onUpdateGuildGold) {
				onUpdateGuildGold(guildGold - cost);
			}
			message = `✨ Crise resolvida! Ouro pago: ${cost} Ouro. Nenhuma perda de matriz ocorreu.`;
		} else {
			message = `⚠️ Crise resolvida por negligência. O território sofreu degradação e perdeu 1 nível na matriz de ${matrix === "physical" ? "Física" : matrix === "mental" ? "Mental" : "Social"}.`;
		}
		await loadDomains();
	} else {
		message = `❌ Erro ao resolver crise: ${res.error.message}`;
	}
}

// Realocar Níveis
async function handleReallocate(p: number, m: number, s: number) {
	if (!activeDomain) return;
	const cost = 25 * 10 ** activeDomain.tier;
	if (guildGold < cost) {
		message = `❌ Ouro insuficiente! A realocação custa ${cost} Ouro.`;
		return;
	}

	const res = await service.reallocateLevels({
		id: activeDomain.id,
		physical: p,
		mental: m,
		social: s,
	});

	if (res.success) {
		activeDomain = res.data.domain;
		if (onUpdateGuildGold) {
			onUpdateGuildGold(guildGold - cost);
		}
		message = `🔮 Realocação efetuada! Custo: ${cost} Ouro. Matrizes redistribuídas.`;
		await loadDomains();
	} else {
		message = `⚠️ Realocação inválida: ${res.error.message}`;
	}
}
</script>

<div class="max-w-[850px] my-8 mx-auto p-6 bg-void text-bone rounded-lg border border-bronze shadow-2xl relative overflow-hidden font-sans">
	
	<!-- Glow decorativo superior -->
	<div class="absolute -top-24 -left-24 w-48 h-48 bg-ether/10 rounded-full blur-3xl pointer-events-none"></div>
	<div class="absolute -bottom-24 -right-24 w-48 h-48 bg-blood/10 rounded-full blur-3xl pointer-events-none"></div>

	<header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-bronze/30 pb-4">
		<div>
			<h2 class="text-2xl font-bold text-ether tracking-wide flex items-center gap-2">
				<span>👑</span> Conselho Regional & Influência
			</h2>
			<span class="text-[10px] text-bone/50 font-mono tracking-widest uppercase block mt-1">Códex de Governança Territorial</span>
		</div>
		<div class="flex items-center gap-4 bg-ruin/50 px-4 py-2 rounded border border-bronze/20">
			<div class="text-right">
				<span class="text-[9px] block text-bone/55 uppercase font-mono">Ouro da Guilda</span>
				<span class="text-sm font-bold text-ether font-mono">{guildGold} Ouro</span>
			</div>
			{#if activeDomain}
				<div class="h-8 w-[1px] bg-bronze/25"></div>
				<div class="text-right">
					<span class="text-[9px] block text-bone/55 uppercase font-mono">Território Ativo</span>
					<span class="text-xs font-bold text-bronze uppercase font-mono">Tier {activeDomain.tier}</span>
				</div>
			{/if}
		</div>
	</header>

	{#if activeCrisis}
		<div class="mb-6 p-4 bg-blood-shadow border border-blood rounded-lg flex flex-col gap-3 text-center animate-pulse">
			<h3 class="text-sm font-bold text-blood uppercase tracking-widest">⚠️ INSTABILIDADE REGIONAL ATIVA</h3>
			<p class="text-xs text-bone/85 leading-relaxed">
				Uma crise na matriz <span class="text-blood font-bold uppercase">{activeCrisis.matrix === "physical" ? "Física" : activeCrisis.matrix === "mental" ? "Mental" : "Social"}</span> está assolando seu domínio! Escolha como agir:
			</p>
			<div class="flex justify-center gap-3">
				<button 
					onclick={() => handleResolveCrisis("delegate")}
					class="px-4 py-1.5 bg-ether text-void text-xs font-bold rounded hover:bg-white transition-all uppercase tracking-wider"
				>
					💸 Delegar (Pagar Ouro)
				</button>
				<button 
					onclick={() => handleResolveCrisis("negligence")}
					class="px-4 py-1.5 bg-void border border-blood text-blood text-xs font-bold rounded hover:bg-blood hover:text-white transition-all uppercase tracking-wider"
				>
					Negligenciar (Perder -1 Nível)
				</button>
			</div>
		</div>
	{/if}

	<!-- Seleção de Domínio -->
	<div class="mb-6 flex flex-wrap gap-3 items-center justify-between bg-ruin/20 p-4 rounded border border-bronze/10">
		<div class="flex items-center gap-3">
			<span class="text-xs font-bold uppercase text-bone/70">Domínio:</span>
			{#if domains.length === 0}
				<span class="text-xs text-bone/40 italic">Nenhum domínio cadastrado</span>
			{:else}
				<select 
					bind:value={activeDomain}
					class="p-1.5 bg-void border border-bronze/35 rounded text-xs text-bone font-mono outline-none"
				>
					{#each domains as dom}
						<option value={dom}>ID: {dom.id.slice(0, 8)} (Tier {dom.tier})</option>
					{/each}
				</select>
			{/if}
		</div>

		<div class="flex items-center gap-2">
			{#if isCreating}
				<div class="flex items-center gap-2 bg-void p-1 rounded border border-bronze/45">
					<span class="text-[10px] text-bone/55 uppercase font-mono px-2">Tier:</span>
					<select bind:value={selectedTier} class="bg-ruin border border-bronze/25 text-xs text-bone font-mono p-0.5 rounded">
						<option value={1}>1</option>
						<option value={2}>2</option>
						<option value={3}>3</option>
						<option value={4}>4</option>
					</select>
					<button onclick={handleCreateDomain} class="px-2 py-0.5 bg-ether text-void font-bold text-xs rounded hover:bg-white transition-all">OK</button>
					<button onclick={() => isCreating = false} class="px-2 py-0.5 bg-ruin text-bone text-xs rounded hover:bg-[#7f1d1d] transition-all">X</button>
				</div>
			{:else}
				<button 
					onclick={() => isCreating = true}
					class="px-3 py-1.5 bg-bronze hover:bg-ether hover:text-void text-bone text-xs font-bold rounded uppercase tracking-wider transition-all"
				>
					✙ Fundar Domínio
				</button>
			{/if}
		</div>
	</div>

	{#if activeDomain}
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			
			<!-- Coluna 1: As Três Matrizes de Influência (Regra 5/3/1) -->
			<div class="md:col-span-2 flex flex-col gap-4 bg-ruin/20 p-4 rounded border border-bronze/10">
				<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/15 pb-2">📋 Matrizes de Influência (Regra 5/3/1)</h3>
				
				<!-- Matriz Física -->
				<div class="flex flex-col gap-1.5 p-3 bg-void rounded border border-bronze/5">
					<div class="flex justify-between items-center text-xs">
						<span class="font-bold text-bone flex items-center gap-1.5">🛡️ Matriz Física (Fis)</span>
						<span class="font-mono text-ether font-bold">{activeDomain.physicalLevel} / 5</span>
					</div>
					<div class="w-full bg-ruin h-2.5 rounded border border-bronze/20 p-[1px]">
						<div class="h-full rounded bg-ether transition-all duration-300" style="width: {activeDomain.physicalLevel * 20}%"></div>
					</div>
					<div class="flex justify-end gap-1.5 mt-1">
						<button 
							onclick={() => handleUpgradeMatrix("physical")}
							disabled={activeDomain.physicalLevel >= 5}
							class="text-[9px] px-2 py-0.5 bg-ruin hover:bg-ether hover:text-void text-bone border border-bronze/20 rounded font-bold uppercase"
						>
							▲ Evoluir
						</button>
					</div>
				</div>

				<!-- Matriz Mental -->
				<div class="flex flex-col gap-1.5 p-3 bg-void rounded border border-bronze/5">
					<div class="flex justify-between items-center text-xs">
						<span class="font-bold text-bone flex items-center gap-1.5">🧠 Matriz Mental (Men)</span>
						<span class="font-mono text-ether font-bold">{activeDomain.mentalLevel} / 5</span>
					</div>
					<div class="w-full bg-ruin h-2.5 rounded border border-bronze/20 p-[1px]">
						<div class="h-full rounded bg-ether transition-all duration-300" style="width: {activeDomain.mentalLevel * 20}%"></div>
					</div>
					<div class="flex justify-end gap-1.5 mt-1">
						<button 
							onclick={() => handleUpgradeMatrix("mental")}
							disabled={activeDomain.mentalLevel >= 5}
							class="text-[9px] px-2 py-0.5 bg-ruin hover:bg-ether hover:text-void text-bone border border-bronze/20 rounded font-bold uppercase"
						>
							▲ Evoluir
						</button>
					</div>
				</div>

				<!-- Matriz Social -->
				<div class="flex flex-col gap-1.5 p-3 bg-void rounded border border-bronze/5">
					<div class="flex justify-between items-center text-xs">
						<span class="font-bold text-bone flex items-center gap-1.5">🤝 Matriz Social (Soc)</span>
						<span class="font-mono text-ether font-bold">{activeDomain.socialLevel} / 5</span>
					</div>
					<div class="w-full bg-ruin h-2.5 rounded border border-bronze/20 p-[1px]">
						<div class="h-full rounded bg-ether transition-all duration-300" style="width: {activeDomain.socialLevel * 20}%"></div>
					</div>
					<div class="flex justify-end gap-1.5 mt-1">
						<button 
							onclick={() => handleUpgradeMatrix("social")}
							disabled={activeDomain.socialLevel >= 5}
							class="text-[9px] px-2 py-0.5 bg-ruin hover:bg-ether hover:text-void text-bone border border-bronze/20 rounded font-bold uppercase"
						>
							▲ Evoluir
						</button>
					</div>
				</div>

				<div class="mt-2 p-3 bg-void rounded border border-bronze/10 text-[10px] text-bone/60 leading-relaxed">
					ℹ️ **Regra de Foco 5/3/1**: As três matrizes evoluem assimetricamente. A de nível mais alto pode chegar a **5**, a secundária a **3** e a terciária a **1**. A soma total reflete a especialização tática da região.
				</div>
			</div>

			<!-- Coluna 2: Regente, Ausência e Tempo -->
			<div class="flex flex-col gap-4 bg-ruin/20 p-4 rounded border border-bronze/10">
				<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/15 pb-2">⏳ Administração & Tempo</h3>
				
				<div class="flex flex-col gap-2 p-3 bg-void rounded border border-bronze/5 text-xs">
					<div class="flex justify-between items-center">
						<span class="text-bone/65">Regente Contratado:</span>
						<span class="font-bold text-ether font-mono">{activeDomain.regentId ? "SIM" : "NÃO"}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-bone/65">Penalidade por Semana:</span>
						<span class="font-bold text-blood font-mono">+{activeDomain.regentId ? "1 CD" : "2 CD"}</span>
					</div>
					<button 
						onclick={handleToggleRegent}
						class="w-full mt-2 py-1 bg-ruin border border-bronze/20 text-[10px] text-bone font-bold uppercase hover:bg-ether hover:text-void rounded transition-colors"
					>
						{activeDomain.regentId ? "Demitir Regente" : "Contratar Regente"}
					</button>
				</div>

				<div class="flex flex-col gap-2 p-3 bg-void rounded border border-bronze/5 text-xs">
					<div class="flex justify-between items-center">
						<span class="text-bone/65">Semanas Ausente:</span>
						<span class="font-bold text-ether font-mono">{activeDomain.weeksAway} semanas</span>
					</div>
					<div class="flex justify-between items-center border-t border-bronze/10 pt-2 text-[10px]">
						<span class="text-bone/50 uppercase">Perigo Acumulado:</span>
						<span class="font-bold text-blood font-mono">+{activeDomain.weeksAway * (activeDomain.regentId ? 1 : 2)} CD</span>
					</div>
					<div class="flex gap-2 mt-2">
						<button 
							onclick={() => handleAdjustWeeks(1)}
							class="flex-1 py-1 bg-ruin border border-bronze/20 text-[9px] text-bone font-bold uppercase hover:bg-bronze rounded transition-colors"
						>
							+1 Semana
						</button>
						<button 
							onclick={() => handleAdjustWeeks(0)}
							class="flex-1 py-1 bg-ruin border border-bronze/20 text-[9px] text-bone font-bold uppercase hover:bg-ether hover:text-void rounded transition-colors"
						>
							Retornar (Zerar)
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Painel de Ações e Simulador GM -->
		<div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-bronze/20 pt-6">
			
			<div class="bg-ruin/20 p-4 rounded border border-bronze/10 flex flex-col gap-4">
				<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/15 pb-2">🎲 Simular Ações do Conselho</h3>
				
				<!-- Coleta de Impostos -->
				<div class="flex flex-col gap-3 p-3 bg-void rounded border border-bronze/5">
					<h4 class="text-[10px] font-bold text-ether uppercase tracking-wider">💰 Coletar Impostos (Com Desvantagem)</h4>
					<p class="text-[10px] text-bone/60">Gera renda à guilda, mas aumenta a tensão local (CD de Estabilidade +5. O teste é feito rolando dois d20 e escolhendo o menor).</p>
					
					<div class="grid grid-cols-3 gap-2 items-center">
						<div class="flex flex-col gap-1">
							<span class="text-[8px] text-bone/55 uppercase font-mono">Carisma Líder</span>
							<input type="number" bind:value={leaderAttribute} class="p-1 bg-ruin border border-bronze/20 text-center text-xs font-mono text-bone outline-none rounded" />
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-[8px] text-bone/55 uppercase font-mono">d20 Rolagem 1</span>
							<input type="number" bind:value={d20RollTax1} min="1" max="20" class="p-1 bg-ruin border border-bronze/20 text-center text-xs font-mono text-bone outline-none rounded" />
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-[8px] text-bone/55 uppercase font-mono">d20 Rolagem 2</span>
							<input type="number" bind:value={d20RollTax2} min="1" max="20" class="p-1 bg-ruin border border-bronze/20 text-center text-xs font-mono text-bone outline-none rounded" />
						</div>
					</div>

					<button 
						onclick={handleCollectTaxes}
						class="w-full py-1.5 bg-bronze hover:bg-ether hover:text-void text-bone text-xs font-bold uppercase rounded transition-all mt-1"
					>
						Executar Coleta
					</button>
				</div>

				<!-- Teste de Estabilidade Ativo -->
				<div class="flex flex-col gap-3 p-3 bg-void rounded border border-bronze/5">
					<h4 class="text-[10px] font-bold text-ether uppercase tracking-wider">🎲 Testar Estabilidade do Território</h4>
					<p class="text-[10px] text-bone/60">Para eventos fortuitos. Escolha qual matriz testar:</p>

					<div class="grid grid-cols-2 gap-2">
						<div class="flex flex-col gap-1">
							<span class="text-[8px] text-bone/55 uppercase font-mono">Mod Atributo</span>
							<input type="number" bind:value={leaderAttribute} class="p-1 bg-ruin border border-bronze/20 text-center text-xs font-mono text-bone outline-none rounded" />
						</div>
						<div class="flex flex-col gap-1">
							<span class="text-[8px] text-bone/55 uppercase font-mono">Rolagem d20</span>
							<input type="number" bind:value={d20Roll} min="1" max="20" class="p-1 bg-ruin border border-bronze/20 text-center text-xs font-mono text-bone outline-none rounded" />
						</div>
					</div>

					<div class="flex gap-2">
						<button onclick={() => handleStabilityCheck("physical")} class="flex-1 py-1.5 bg-ruin hover:bg-ether hover:text-void border border-bronze/20 text-[9px] text-bone font-bold uppercase rounded">🛡️ Física</button>
						<button onclick={() => handleStabilityCheck("mental")} class="flex-1 py-1.5 bg-ruin hover:bg-ether hover:text-void border border-bronze/20 text-[9px] text-bone font-bold uppercase rounded">🧠 Mental</button>
						<button onclick={() => handleStabilityCheck("social")} class="flex-1 py-1.5 bg-ruin hover:bg-ether hover:text-void border border-bronze/20 text-[9px] text-bone font-bold uppercase rounded">🤝 Social</button>
					</div>
				</div>
			</div>

			<!-- Console de Logs e Resultados de Rolagem -->
			<div class="bg-ruin/20 p-4 rounded border border-bronze/10 flex flex-col gap-4">
				<h3 class="text-xs font-bold uppercase tracking-widest text-ether border-b border-bronze/15 pb-2"># Console do Conselho</h3>
				
				{#if lastTaxResult}
					<div class="p-3 bg-void rounded border border-bronze/15 text-xs flex flex-col gap-2 font-mono">
						<div class="border-b border-bronze/10 pb-1 text-ether font-bold">RESULTADO DA COLETA:</div>
						<div>• Ouro Gerado: <span class="text-ether font-bold">+{lastTaxResult.revenue} GP</span></div>
						<div>• d20 Escolhido (Menor): <span class="font-bold">{Math.min(d20RollTax1, d20RollTax2)}</span></div>
						<div>• Modificador Carisma: <span class="font-bold">+{leaderAttribute}</span></div>
						<div>• Nível Matriz Social: <span class="font-bold">+{activeDomain.socialLevel}</span></div>
						<div>• Total Obtido: <span class="font-bold text-ether">{lastTaxResult.stabilityRoll}</span></div>
						<div>• CD de Estabilidade: <span class="font-bold text-blood">{lastTaxResult.cd}</span></div>
						<div class="mt-1 border-t border-bronze/10 pt-1 text-[10px] font-bold">
							Resultado: 
							{#if lastTaxResult.hasCrisis}
								<span class="text-blood">❌ FALHA - CRISE SOCIAL GERADA</span>
							{:else}
								<span class="text-[#22c55e]">❇️ SUCESSO - Povo leal</span>
							{/if}
						</div>
					</div>
				{:else if lastStabilityResult}
					<div class="p-3 bg-void rounded border border-bronze/15 text-xs flex flex-col gap-2 font-mono">
						<div class="border-b border-bronze/10 pb-1 text-ether font-bold">TESTE DE ESTABILIDADE:</div>
						<div>• Rolagem d20: <span class="font-bold">{d20Roll}</span></div>
						<div>• Mod Atributo: <span class="font-bold">+{leaderAttribute}</span></div>
						<div>• Total Obtido: <span class="font-bold text-ether">{lastStabilityResult.roll}</span></div>
						<div>• CD Requerida: <span class="font-bold text-blood">{lastStabilityResult.cd}</span></div>
						<div class="mt-1 border-t border-bronze/10 pt-1 text-[10px] font-bold">
							Resultado: 
							{#if lastStabilityResult.hasCrisis}
								<span class="text-blood">❌ CRISE DETECTADA</span>
							{:else}
								<span class="text-[#22c55e]">❇️ SUCESSO - Sem crise</span>
							{/if}
						</div>
					</div>
				{/if}

				<div class="p-3 bg-void rounded border border-bronze/35 min-h-[100px] flex-1 whitespace-pre-line font-mono text-xs text-bone/85 leading-relaxed">
					<span class="text-ether font-bold"># LOG DE CONSELHO:</span>
					{message}
				</div>

				<!-- Menu de Realocação Didática -->
				<div class="p-3 bg-void rounded border border-bronze/10 flex flex-col gap-2">
					<div class="flex justify-between items-center text-[10px] font-bold uppercase text-ether">
						<span>🔮 Realocação de Matrizes</span>
						<span class="text-[8px] text-bone/50">Custo: {25 * Math.pow(10, activeDomain.tier)} Ouro</span>
					</div>
					<div class="flex gap-2">
						<button onclick={() => handleReallocate(5, 3, 1)} class="flex-1 py-1 bg-ruin hover:bg-ether hover:text-void border border-bronze/20 text-[8px] font-bold rounded">Fis 5 / Men 3 / Soc 1</button>
						<button onclick={() => handleReallocate(1, 5, 3)} class="flex-1 py-1 bg-ruin hover:bg-ether hover:text-void border border-bronze/20 text-[8px] font-bold rounded">Fis 1 / Men 5 / Soc 3</button>
						<button onclick={() => handleReallocate(3, 1, 5)} class="flex-1 py-1 bg-ruin hover:bg-ether hover:text-void border border-bronze/20 text-[8px] font-bold rounded">Fis 3 / Men 1 / Soc 5</button>
					</div>
				</div>
			</div>
		</div>
	{:else}
		<div class="py-12 text-center bg-ruin/5 rounded border border-bronze/10">
			<span class="text-4xl">👑</span>
			<p class="text-xs text-bone/50 italic mt-3">Nenhum território governado. Funde um novo Domínio Regional acima.</p>
		</div>
	{/if}
</div>
