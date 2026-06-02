<script lang="ts">
import { onMount } from "svelte";
import { fade } from "svelte/transition";
import { RetrainService } from "$lib/entities/character/domain/RetrainService";
import {
	applyStatusEffects,
	BaseCharacterStats,
} from "$lib/entities/character/domain/StatusEffectDecorator";
import type {
	CharacterRecord,
	CharacterStatusEffectRecord,
} from "$lib/entities/character/model/characterSchema";

interface Props {
	characters: CharacterRecord[];
	// biome-ignore lint/suspicious/noExplicitAny: generic character session repository
	characterRepository: any;
	activeStatusEffects: CharacterStatusEffectRecord[];
	onUpdateCharacters: (records: CharacterRecord[]) => void;
	onUpdateStatusEffects: (effects: CharacterStatusEffectRecord[]) => void;
}
let {
	characters,
	characterRepository,
	activeStatusEffects,
	onUpdateCharacters,
	onUpdateStatusEffects,
}: Props = $props();

// Inicializa o serviço com o repositório
const retrainService = new RetrainService(characterRepository);

// Estados Reativos do Interlúdio
let selectedCharacterId = $state("");
let availableDowntimeDays = $state(15);

// Form Eixos
let axisToReplace = $state("conflict");
let newAxis = $state("mental");

// Form Talentos
let oldTalentId = $state("Foco em Espada");
let newTalentId = $state("Mapeador dos Ermos");

// UI Alerts
let successMsg = $state<string | null>(null);
let errorMsg = $state<string | null>(null);
let retrainLogs = $state<string[]>([]);

let selectedChar = $derived(
	characters.find((c) => c.id === selectedCharacterId) || characters[0],
);

// Calcula estatísticas decoradas via cebola reativa
let decoratedStats = $derived.by(() => {
	if (!selectedChar) return null;
	const base = new BaseCharacterStats(selectedChar, {
		id: selectedChar.classId,
		baseHp: 10,
	});
	const charEffects = activeStatusEffects.filter(
		(e) => e.characterId === selectedChar.id,
	);
	return applyStatusEffects(base, charEffects);
});

onMount(() => {
	if (characters.length > 0) {
		selectedCharacterId = characters[0].id;
	}
});

function addLog(msg: string) {
	retrainLogs = [msg, ...retrainLogs].slice(0, 10);
}

function showSuccess(msg: string) {
	successMsg = msg;
	setTimeout(() => {
		successMsg = null;
	}, 3500);
}

function showError(msg: string) {
	errorMsg = msg;
	setTimeout(() => {
		errorMsg = null;
	}, 3500);
}

async function handleRetrainTalent() {
	if (!selectedChar) return;

	const res = await retrainService.retrainTalent({
		characterId: selectedChar.id,
		oldTalentId,
		newTalentId,
		currentDowntimeDays: availableDowntimeDays,
	});

	if (res.success) {
		const data = res.data;
		availableDowntimeDays -= data.downtimeDaysSpent;

		// Atualiza lista de personagens do client
		onUpdateCharacters(
			characters.map((c) => (c.id === selectedChar.id ? data.character : c)),
		);

		showSuccess(`Talento de ${selectedChar.name} retreinado com sucesso!`);
		addLog(
			`[Retreino] ${selectedChar.name} substituiu "${oldTalentId}" por "${newTalentId}". Custo: ${data.goldSpent} PO e 3 dias de Downtime.`,
		);
	} else {
		showError(res.error.message);
	}
}

async function handleReconditionAxis() {
	if (!selectedChar) return;
	if (axisToReplace === newAxis) {
		showError("Os eixos de origem e destino devem ser diferentes!");
		return;
	}

	// Valida se o herói tem pelo menos 2 pontos no eixo de origem para não zerar
	// biome-ignore lint/suspicious/noExplicitAny: dynamic axis access
	const currentVal = (selectedChar as any)[axisToReplace] ?? 0;
	if (currentVal <= 1) {
		showError(
			`Eixo ${axisToReplace.toUpperCase()} muito baixo para recondicionar (mínimo de 2 pontos necessários).`,
		);
		return;
	}

	const res = await retrainService.reconditionAxis({
		characterId: selectedChar.id,
		axisToReplace,
		newAxis,
		currentDowntimeDays: availableDowntimeDays,
	});

	if (res.success) {
		const data = res.data;
		availableDowntimeDays -= data.downtimeDaysSpent;

		onUpdateCharacters(
			characters.map((c) => (c.id === selectedChar.id ? data.character : c)),
		);
		onUpdateStatusEffects([...activeStatusEffects, data.statusEffect]);

		showSuccess(`Eixo recondicionado! Descoordenação Latente aplicada.`);
		addLog(
			`[Recondicionamento] ${selectedChar.name} transferiu 1 ponto de ${axisToReplace.toUpperCase()} para ${newAxis.toUpperCase()}. Custo: ${data.goldSpent} PO e 9 dias.`,
		);
	} else {
		showError(res.error.message);
	}
}

async function handleRetrainFamiliar() {
	if (!selectedChar) return;

	const res = await retrainService.retrainFamiliar({
		characterId: selectedChar.id,
		currentDowntimeDays: availableDowntimeDays,
	});

	if (res.success) {
		const data = res.data;
		availableDowntimeDays -= data.downtimeDaysSpent;

		onUpdateCharacters(
			characters.map((c) => (c.id === selectedChar.id ? data.character : c)),
		);

		showSuccess(`Truques do familiar místico retreinados!`);
		addLog(
			`[Familiar] Familiar de ${selectedChar.name} retreinou truques de éter. Custo: 50 PO e 3 dias.`,
		);
	} else {
		showError(res.error.message);
	}
}

// Simula um teste sob perigo usando o eixo novo para gastar a descoordenação latente de forma reativa
async function simulateTestUsage(axis: string) {
	if (!selectedChar) return;

	const res = await retrainService.registerTestUsage(selectedChar.id, axis);
	if (res.success) {
		const data = res.data;

		// Recarrega todos os status effects do banco local do client
		const allEffectsRes =
			await characterRepository.findStatusEffectsByCharacterId(selectedChar.id);
		if (allEffectsRes.success) {
			// Filtra efeitos dos outros personagens e une com os novos efeitos atualizados
			const otherEffects = activeStatusEffects.filter(
				(e) => e.characterId !== selectedChar.id,
			);
			onUpdateStatusEffects([...otherEffects, ...allEffectsRes.data]);
		}

		if (data.active) {
			addLog(
				`[Teste sob Perigo] ${selectedChar.name} rolou teste com o eixo ${axis.toUpperCase()} sob DESVANTAGEM. Testes restantes: ${data.testsLeft}.`,
			);
			triggerAlertAnimate();
		} else {
			addLog(
				`[Adaptação Concluída] ${selectedChar.name} consolidou os instintos do eixo ${axis.toUpperCase()}! Status de Descoordenação Latente expilado.`,
			);
			showSuccess("Eixo adaptado com sucesso!");
		}
	} else {
		showError(res.error.message);
	}
}

let shakeTrigger = $state(false);
function triggerAlertAnimate() {
	shakeTrigger = true;
	setTimeout(() => {
		shakeTrigger = false;
	}, 500);
}
</script>

<div class="retrain-wrapper animate-fade">
	<!-- Notificações -->
	{#if successMsg}
		<div class="alert-premium success-runic" transition:fade>
			<span>✔️ {successMsg}</span>
		</div>
	{/if}
	{#if errorMsg}
		<div class="alert-premium error-runic" transition:fade>
			<span>⚠️ {errorMsg}</span>
		</div>
	{/if}

	<div class="panel-retrain glass-runic">
		<div class="panel-header border-b border-ether/20 pb-4">
			<h2 class="title-runic">⚒️ Oficina de Retreino de Downtime (Interlúdio)</h2>
			<p class="subtitle-runic text-xs">Substitua talentos obsoletos ou recondicione matrizes físicas e mentais de seus Andarilhos.</p>
			
			<div class="flex flex-wrap items-center justify-between gap-4 mt-3 bg-void/40 p-3 rounded border border-ether/10">
				<div class="flex items-center gap-2">
					<label class="text-xs text-ether font-bold uppercase" for="active-hero">Herói Selecionado:</label>
					<select id="active-hero" class="runic-select max-w-[200px]" bind:value={selectedCharacterId}>
						{#each characters as char}
							<option value={char.id}>{char.name} (Nível {char.level})</option>
						{/each}
					</select>
				</div>
				<div class="text-xs text-bronze font-mono">
					⏳ Dias de Interlúdio Disponíveis: <span class="font-extrabold text-bone">{availableDowntimeDays} dias</span>
				</div>
			</div>
		</div>

		{#if selectedChar && decoratedStats}
			<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
				<!-- Ficha de Atributos e Decoradores Ativos -->
				<div class="col-span-1 border-r border-ether/10 pr-6 flex flex-col gap-4">
					<h3 class="text-sm font-bold text-ether uppercase tracking-wider">📊 Estatísticas e Efeitos</h3>
					
					<div class="stats-card bg-void/50 p-4 rounded border border-ether/10">
						<h4 class="text-xs font-bold text-bone mb-2">Atributos de Eixo:</h4>
						<div class="flex flex-col gap-1.5 text-xs">
							<div class="flex justify-between">
								<span class="text-bone/60">Físico (Physical):</span>
								<span class="font-bold text-ether">{decoratedStats.physical} (Base: {selectedChar.physical})</span>
							</div>
							<div class="flex justify-between">
								<span class="text-bone/60">Mental (Mental):</span>
								<span class="font-bold text-ether">{decoratedStats.mental} (Base: {selectedChar.mental})</span>
							</div>
							<div class="flex justify-between">
								<span class="text-bone/60">Social (Social):</span>
								<span class="font-bold text-ether">{decoratedStats.social} (Base: {selectedChar.social})</span>
							</div>
						</div>

						<h4 class="text-xs font-bold text-bone mt-4 mb-2">Aplicações Táticas:</h4>
						<div class="flex flex-col gap-1.5 text-xs">
							<div class="flex justify-between">
								<span class="text-bone/60">Conflito (Conflict):</span>
								<span class="font-bold text-ether">{decoratedStats.conflict} (Base: {selectedChar.conflict})</span>
							</div>
							<div class="flex justify-between">
								<span class="text-bone/60">Interação (Interaction):</span>
								<span class="font-bold text-ether">{decoratedStats.interaction} (Base: {selectedChar.interaction})</span>
							</div>
							<div class="flex justify-between">
								<span class="text-bone/60">Resistência (Resistance):</span>
								<span class="font-bold text-ether">{decoratedStats.resistance} (Base: {selectedChar.resistance})</span>
							</div>
						</div>
					</div>

					<!-- Alertas de Descoordenação Latente Ativa -->
					{#if decoratedStats.hasLatentDiscoordination}
						<div class="latent-alert-box bg-blood-shadow/20 border border-blood rounded p-3 text-xs" class:shake={shakeTrigger}>
							<p class="text-blood font-bold uppercase tracking-wider flex items-center gap-1.5">
								⚠️ Descoordenação Latente Ativa!
							</p>
							<p class="text-bone/80 mt-1">
								O eixo <span class="font-bold text-ether">{decoratedStats.latentDiscoordinationAxis?.toUpperCase()}</span> sofre 
								<strong>DESVANTAGEM</strong> automática nas próximas rolagens táticas de perigo.
							</p>
							<div class="flex items-center gap-1 mt-2">
								<span>Rolagens Restantes:</span>
								<div class="flex gap-1">
									{#each Array(3) as _, i}
										<span class="h-2 w-2 rounded-full {i < (decoratedStats.latentDiscoordinationTestsLeft ?? 0) ? 'bg-blood' : 'bg-ether/20'}"></span>
									{/each}
								</div>
							</div>
							<button class="btn-runic w-full mt-3 text-[10px] py-1 border-blood/40 bg-blood/10 hover:bg-blood/20" onclick={() => simulateTestUsage(decoratedStats.latentDiscoordinationAxis || "mental")}>
								🎯 Simular Teste de Perigo
							</button>
						</div>
					{:else}
						<div class="bg-void/30 border border-ether/10 rounded p-3 text-xs text-bone/60 text-center">
							Nenhuma descoordenação latente ativa no momento.
						</div>
					{/if}
				</div>

				<!-- Ações de Retreino e Recondicionamento -->
				<div class="col-span-2 flex flex-col gap-6">
					<!-- Bloco de Recondicionamento de Eixo -->
					<div class="action-section border border-ether/10 p-4 rounded bg-void/25">
						<h3 class="text-xs font-bold text-ether uppercase tracking-wider flex items-center gap-2">
							🔄 Recondicionar Eixo Muscular/Mental
						</h3>
						<p class="text-[11px] text-bone/70 mt-1">Transfere 1 ponto de um eixo ou aplicação para outro. Aplica descoordenação latente.</p>
						
						<div class="grid grid-cols-2 gap-4 mt-3">
							<div class="field-runic">
								<label for="axis-source">Retirar de (Origem):</label>
								<select id="axis-source" class="runic-select" bind:value={axisToReplace}>
									<option value="physical">Físico (Physical)</option>
									<option value="mental">Mental (Mental)</option>
									<option value="social">Social (Social)</option>
									<option value="conflict">Conflito (Conflict)</option>
									<option value="interaction">Interação (Interaction)</option>
									<option value="resistance">Resistência (Resistance)</option>
								</select>
							</div>
							<div class="field-runic">
								<label for="axis-dest">Transferir para (Destino):</label>
								<select id="axis-dest" class="runic-select" bind:value={newAxis}>
									<option value="physical">Físico (Physical)</option>
									<option value="mental">Mental (Mental)</option>
									<option value="social">Social (Social)</option>
									<option value="conflict">Conflito (Conflict)</option>
									<option value="interaction">Interação (Interaction)</option>
									<option value="resistance">Resistência (Resistance)</option>
								</select>
							</div>
						</div>

						<div class="flex items-center justify-between mt-4">
							<div class="text-[11px] text-bronze font-mono">
								Custo: <span class="text-bone">{selectedChar.level * 30} PO</span> + <span class="text-bone">9 dias</span>
							</div>
							<button class="btn-runic py-1.5" onclick={handleReconditionAxis}>
								Executar Recondicionamento
							</button>
						</div>
					</div>

					<!-- Bloco de Retreino de Talentos -->
					<div class="action-section border border-ether/10 p-4 rounded bg-void/25">
						<h3 class="text-xs font-bold text-ether uppercase tracking-wider flex items-center gap-2">
							📚 Substituir Talento Geral / Classe
						</h3>
						<p class="text-[11px] text-bone/70 mt-1">Desaprende um talento e escolhe um novo de mesmo tier.</p>
						
						<div class="grid grid-cols-2 gap-4 mt-3">
							<div class="field-runic">
								<label for="talent-old">Talento a Desaprender:</label>
								<input type="text" id="talent-old" class="runic-input" bind:value={oldTalentId} />
							</div>
							<div class="field-runic">
								<label for="talent-new">Novo Talento Escolhido:</label>
								<input type="text" id="talent-new" class="runic-input" bind:value={newTalentId} />
							</div>
						</div>

						<div class="flex items-center justify-between mt-4">
							<div class="text-[11px] text-bronze font-mono">
								Custo: <span class="text-bone">{selectedChar.level * 10} PO</span> + <span class="text-bone">3 dias</span>
							</div>
							<button class="btn-runic py-1.5" onclick={handleRetrainTalent}>
								Substituir Talento
							</button>
						</div>
					</div>

					<!-- Bloco de Truques de Familiar -->
					<div class="action-section border border-ether/10 p-4 rounded bg-void/25">
						<h3 class="text-xs font-bold text-ether uppercase tracking-wider flex items-center gap-2">
							🧪 Retreinar Truques de Familiar Místico
						</h3>
						<p class="text-[11px] text-bone/70 mt-1">Troca a lista de magias passivas e truques vinculados do familiar de éter.</p>
						
						<div class="flex items-center justify-between mt-4">
							<div class="text-[11px] text-bronze font-mono">
								Custo Fixo: <span class="text-bone">50 PO</span> + <span class="text-bone">3 dias</span>
							</div>
							<button class="btn-runic py-1.5" onclick={handleRetrainFamiliar} disabled={selectedChar.classId !== 'weaver'}>
								{selectedChar.classId === 'weaver' ? 'Retreinar Familiar' : 'Apenas para conjuradores (Tecelões)'}
							</button>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Console do Diário de Bordo -->
	<div class="panel-retrain glass-runic mt-4 p-4 border border-ether/15">
		<h3 class="text-xs font-bold text-ether uppercase tracking-wider">📜 Histórico do Acampamento</h3>
		<div class="logs-runic mt-2">
			{#each retrainLogs as entry}
				<div class="log-runic-entry">{entry}</div>
			{/each}
			{#if retrainLogs.length === 0}
				<p class="empty-runic text-center text-xs py-4">Nenhum recondicionamento realizado nesta paragem.</p>
			{/if}
		</div>
	</div>
</div>

