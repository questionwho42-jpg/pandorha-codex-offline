<script lang="ts">
import { onMount } from "svelte";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup directive.
import { fade } from "svelte/transition";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
import { InvestigationService } from "$lib/entities/investigation/domain/InvestigationService";
import { WorkerInvestigationRepository } from "$lib/entities/investigation/infrastructure/WorkerInvestigationRepository";
import type { InvestigationRecord } from "$lib/entities/investigation/model/investigationSchema";
import { WorldStateService } from "$lib/entities/world-state/domain/WorldStateService";
import { InMemoryWorldStateRepository } from "$lib/entities/world-state/testing/InMemoryWorldStateRepository";
import type { JsonObject, SaveGameSnapshot } from "$lib/shared/rpc";

// Props do Svelte 5 usando Runes
interface Props {
	characters: CharacterRecord[];
}
let { characters }: Props = $props();

// Repositórios e Serviços do Client
const repository = new WorkerInvestigationRepository();

// Estados Reativos do Painel
let activeProjects = $state<InvestigationRecord[]>([]);
let selectedMonsterId = $state("serpente_sombras");
let selectedResearchType = $state<"short_rest" | "weekly_metropolis">(
	"short_rest",
);
let selectedCharacterId = $state("");
let useVigorCost = $state(false);

// Sub-abas de Investigação (Projetos vs Teia de Pistas)
let activeSubTab = $state<"projects" | "clues">("projects");
let unlockedClues = $state<string[]>([]);
let completedDeductions = $state<string[]>([]);
let selectedClues = $state<string[]>([]);

// World State da Reserva de Insight
let insightTargetId = $state("");
let insightTokensCount = $state(0);
let gameSnapshot = $state<SaveGameSnapshot | null>(null);

// UI Alerts
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let successNotification = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let errorNotification = $state<string | null>(null);
let logs = $state<string[]>([]);

// Animação de Rolagem
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isRolling = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let rolledD20Value = $state<number | null>(null);
let rolledTotalValue = $state<number | null>(null);

// Bestiário de Pandorha com atributos para calcular a DC Passiva (10 + Nível + Mental + Resistência)
const BESTIARY = [
	{
		id: "serpente_sombras",
		name: "Serpente das Sombras (Tier 1)",
		level: 2,
		mental: 1,
		resistance: 2,
		dc: 15,
		description:
			"Uma criatura esguia de escamas fumegantes que desliza entre os planos físicos e etéricos.",
	},
	{
		id: "gigante_tempestade",
		name: "Gigante da Tempestade (Tier 2)",
		level: 6,
		mental: 1,
		resistance: 3,
		dc: 20,
		description:
			"Um titã menor capaz de canalizar a eletricidade da alta atmosfera através de sua fúria.",
	},
	{
		id: "horror_eterico",
		name: "Horror Etérico de Xal'atath (Tier 3)",
		level: 10,
		mental: 2,
		resistance: 3,
		dc: 25,
		description:
			"Uma manifestação aberrante que consome a sanidade de quem o fita por tempo demais.",
	},
	{
		id: "tita_ancestral",
		name: "Titã Ancestral de Éter (Tier 4)",
		level: 15,
		mental: 2,
		resistance: 3,
		dc: 30,
		description:
			"Uma divindade colossal adormecida cuja própria presença dobra as leis físicas locais.",
	},
];

let selectedMonster = $derived(
	BESTIARY.find((m) => m.id === selectedMonsterId) || BESTIARY[0],
);

onMount(async () => {
	await loadAllData();
	loadCluesAndDeductions();
	if (characters.length > 0) {
		selectedCharacterId = characters[0].id;
	}
});

function log(msg: string) {
	logs = [msg, ...logs].slice(0, 15);
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

function loadCluesAndDeductions() {
	const storedClues = localStorage.getItem("pandorha_unlocked_clues");
	if (storedClues) {
		try {
			unlockedClues = JSON.parse(storedClues);
		} catch (e) {
			console.error("Erro ao carregar pistas:", e);
		}
	} else {
		unlockedClues = [];
	}

	const storedDeductions = localStorage.getItem(
		"pandorha_completed_deductions",
	);
	if (storedDeductions) {
		try {
			completedDeductions = JSON.parse(storedDeductions);
		} catch (e) {
			console.error("Erro ao carregar deduções:", e);
		}
	} else {
		completedDeductions = [];
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleAddDemoClues() {
	const demoClues = [
		"clue-secret-inventory",
		"clue-magic-amulet",
		"clue-elixir-mastery",
		"clue-bastion-location",
	];
	unlockedClues = demoClues;
	localStorage.setItem(
		"pandorha_unlocked_clues",
		JSON.stringify(unlockedClues),
	);
	triggerSuccess("Pistas de demonstração inseridas no diário local!");
	log("[Depuração] Pistas de demonstração adicionadas para teste de conexões.");
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function handleToggleClue(id: string) {
	if (selectedClues.includes(id)) {
		selectedClues = selectedClues.filter((c) => c !== id);
	} else {
		if (selectedClues.length >= 2) {
			selectedClues = [selectedClues[1], id];
		} else {
			selectedClues = [...selectedClues, id];
		}
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function getClueLabel(id: string): string {
	const labels: Record<string, string> = {
		"clue-secret-inventory": "Inventário Secreto do Silas",
		"clue-magic-amulet": "Inscrição Rúnica do Amuleto",
		"clue-elixir-mastery": "Receita do Elixir das Névoas",
		"clue-bastion-location": "Localização do Bastião Antigo",
	};
	return labels[id] || id;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleConnectClues() {
	if (selectedClues.length !== 2) {
		triggerError("Selecione exatamente duas pistas para conectar!");
		return;
	}

	const c1 = selectedClues[0];
	const c2 = selectedClues[1];

	let revelationName = "";
	let rewardMessage = "";

	const isRunicSegred =
		(c1 === "clue-magic-amulet" && c2 === "clue-bastion-location") ||
		(c2 === "clue-magic-amulet" && c1 === "clue-bastion-location");

	const isContrabando =
		(c1 === "clue-secret-inventory" && c2 === "clue-elixir-mastery") ||
		(c2 === "clue-secret-inventory" && c1 === "clue-elixir-mastery");

	if (isRunicSegred) {
		revelationName = "Dedução: O Segredo de Selen-Ghar";
		rewardMessage =
			"Conexão estabelecida! Descoberto que a inscrição do amuleto atua como chave ressonante para abrir o cofre de Selen-Ghar no Bastião Antigo. (+100 XP)";
	} else if (isContrabando) {
		revelationName = "Dedução: Contrabando Alquímico";
		rewardMessage =
			"Conexão estabelecida! Eldrin está usando as entregas de poções de Silas para contrabandear éter destilado. (Ganhou 150 PO)";
	}

	if (revelationName) {
		if (completedDeductions.includes(revelationName)) {
			triggerError("Você já desvendou essa dedução anteriormente!");
			selectedClues = [];
			return;
		}

		completedDeductions = [...completedDeductions, revelationName];
		localStorage.setItem(
			"pandorha_completed_deductions",
			JSON.stringify(completedDeductions),
		);
		triggerSuccess(`Nova dedução concluída: ${revelationName}!`);
		log(`[Revelação] ${rewardMessage}`);
		selectedClues = [];
	} else {
		triggerError(
			"As pistas selecionadas não parecem se encaixar de forma lógica na sua mente.",
		);
		selectedClues = [];
	}
}

// Carrega os projetos do SQLite e a reserva do WorldState via snapshot de jogo
async function loadAllData() {
	try {
		// 1. Carregar projetos ativos
		const listRes = await repository.listActive();
		if (listRes.success) {
			activeProjects = [...listRes.data];
		}

		// 2. Carregar o snapshot completo do jogo para obter o WorldState
		const snapRes = await repository.loadGameSnapshot();
		if (snapRes.success && snapRes.data?.snapshot) {
			gameSnapshot = snapRes.data.snapshot;
			const ws = (gameSnapshot.worldState || []) as unknown as Record<
				string,
				unknown
			>[];

			const targetFlag = ws.find(
				(entry) => entry.key === "plot:insight_target_id",
			);
			const countFlag = ws.find(
				(entry) => entry.key === "plot:insight_tokens_count",
			);

			insightTargetId = targetFlag ? String(targetFlag.value) : "";
			insightTokensCount = countFlag ? Number(countFlag.value) : 0;
		}
	} catch (err) {
		console.error("Erro ao carregar dados de investigação:", err);
	}
}

// Salva o WorldState modificado de volta no SQLite do Worker
async function persistWorldState(targetId: string, tokensCount: number) {
	if (!gameSnapshot) {
		const snapRes = await repository.loadGameSnapshot();
		if (snapRes.success && snapRes.data?.snapshot) {
			gameSnapshot = snapRes.data.snapshot;
		} else {
			gameSnapshot = {
				version: 1,
				savedAt: new Date().toISOString(),
				worldState: [],
			};
		}
	}

	const ws = (gameSnapshot.worldState || []) as unknown as Record<
		string,
		unknown
	>[];

	// Atualiza ou insere plot:insight_target_id
	const targetIdx = ws.findIndex(
		(entry) => entry.key === "plot:insight_target_id",
	);
	const targetEntry = {
		key: "plot:insight_target_id",
		value: targetId,
		updatedAt: new Date().toISOString(),
	};
	if (targetIdx >= 0) ws[targetIdx] = targetEntry;
	else ws.push(targetEntry);

	// Atualiza ou insere plot:insight_tokens_count
	const countIdx = ws.findIndex(
		(entry) => entry.key === "plot:insight_tokens_count",
	);
	const countEntry = {
		key: "plot:insight_tokens_count",
		value: tokensCount,
		updatedAt: new Date().toISOString(),
	};
	if (countIdx >= 0) ws[countIdx] = countEntry;
	else ws.push(countEntry);

	gameSnapshot.worldState = ws as unknown as JsonObject[];

	const saveRes = await repository.saveGameSnapshot(gameSnapshot);
	if (saveRes.success) {
		insightTargetId = targetId;
		insightTokensCount = tokensCount;
	} else {
		triggerError("Falha ao salvar a reserva de insight do grupo no SQLite.");
	}
}

// Inicializa um novo projeto de investigação
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleStartProject() {
	// Checa se já existe investigação ativa para o alvo
	const alreadyActive = activeProjects.some(
		(p) => p.targetId === selectedMonster.id,
	);
	if (alreadyActive) {
		triggerError("Já existe uma investigação em andamento para este monstro!");
		return;
	}

	// Como o WorldStateService é instanciado em memória, criamos um repositório mock temporário
	const mockWsRepo = new InMemoryWorldStateRepository();
	const mockWsService = new WorldStateService(mockWsRepo);

	const idProvider = { generate: () => crypto.randomUUID() };
	const clock = { now: () => new Date().toISOString() };

	const service = new InvestigationService(
		repository,
		mockWsService,
		idProvider,
		clock,
	);

	const res = await service.startInvestigation({
		targetId: selectedMonster.id,
		targetName: selectedMonster.name,
		type: selectedResearchType,
		tier:
			selectedMonster.id === "serpente_sombras"
				? 1
				: selectedMonster.id === "gigante_tempestade"
					? 2
					: selectedMonster.id === "horror_eterico"
						? 3
						: 4,
		dc: selectedMonster.dc,
	});

	if (res.success) {
		triggerSuccess(`Pesquisa iniciada para ${selectedMonster.name}!`);
		log(
			`[Projeto] Iniciada pesquisa (${selectedResearchType === "short_rest" ? "Descanso Curto" : "Semanal"}) contra ${selectedMonster.name}.`,
		);
		await loadAllData();
	} else {
		triggerError(res.error.message);
	}
}

// Criptograficamente seguro
function getSecureRandom(): number {
	const array = new Uint32Array(1);
	window.crypto.getRandomValues(array);
	return array[0] / 4294967296;
}

// Realiza o Teste Global de Pesquisa com animação de d20
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleRollTest(project: InvestigationRecord) {
	const char = characters.find((c) => c.id === selectedCharacterId);
	if (!char) {
		triggerError("Selecione um Andarilho ativo para realizar a pesquisa!");
		return;
	}

	// Bônus: Nível Global + Mental + Eixo (maior entre interação e conflito)
	const modMental = char.mental;
	const modEixo = Math.max(char.interaction || 0, char.conflict || 0);
	const totalModifier = char.level + modMental + modEixo;

	// Inicia animação
	isRolling = true;
	rolledD20Value = null;
	rolledTotalValue = null;

	// Simula a rolagem física
	let count = 0;
	const interval = setInterval(() => {
		rolledD20Value = Math.floor(getSecureRandom() * 20) + 1;
		count++;
		if (count > 8) {
			clearInterval(interval);
			executeRoll();
		}
	}, 100);

	async function executeRoll() {
		const finalD20 = Math.floor(getSecureRandom() * 20) + 1;
		rolledD20Value = finalD20;
		rolledTotalValue = finalD20 + totalModifier;
		isRolling = false;

		// Configura o serviço de domínio do client sincronizado com o WorldState carregado
		const mockWsRepo = new InMemoryWorldStateRepository();
		const mockWsService = new WorldStateService(mockWsRepo);

		// Inicializa o mock com as flags do SQLite atuais
		await mockWsService.setNarrativeFlag({
			key: "plot:insight_target_id",
			value: insightTargetId,
			updatedAt: new Date().toISOString(),
		});
		await mockWsService.setNarrativeFlag({
			key: "plot:insight_tokens_count",
			value: insightTokensCount,
			updatedAt: new Date().toISOString(),
		});

		const idProvider = { generate: () => crypto.randomUUID() };
		const clock = { now: () => new Date().toISOString() };
		const service = new InvestigationService(
			repository,
			mockWsService,
			idProvider,
			clock,
		);

		const res = await service.rollResearchTest({
			id: project.id,
			d20Roll: finalD20,
			modifier: totalModifier,
			useVigorCost,
		});

		if (res.success) {
			const outcome = res.data.outcome;
			const inv = res.data.investigation;
			const rwd = res.data.rewards;

			let msgLog = `[Pesquisa] ${char.name} rolou d20: ${finalD20} + Mod: ${totalModifier} = ${rolledTotalValue} vs DC ${project.dc}. `;

			if (outcome === "critical") {
				msgLog += `CRÍTICO! Adicionados +2 Sucessos. (EE recuperada!)`;
				triggerSuccess("Sucesso Crítico na Pesquisa!");
			} else if (outcome === "success") {
				msgLog += `SUCESSO! Adicionado +1 Sucesso.`;
				triggerSuccess("Sucesso na Pesquisa!");
			} else if (outcome === "success_with_cost") {
				if (useVigorCost) {
					msgLog += `SUCESSO COM CUSTO! Adicionado +1 Sucesso ao custo de 1 PV de Vigor.`;
				} else {
					msgLog += `SUCESSO COM CUSTO! Adicionado +1 Sucesso (custo de Ouro dobrado para o teste).`;
				}
				triggerSuccess("Sucesso com Custo!");
			} else {
				msgLog += `FALHA! A tolerância a falhas diminuiu.`;
				triggerError("Falha na Pesquisa.");
			}

			log(msgLog);

			// Se o projeto terminou (concluído ou falhado)
			if (inv.status !== "active") {
				if (inv.status.startsWith("completed")) {
					log(
						`[Conclusão Perfeita] Pesquisa de ${project.targetName} finalizada com sucesso! Reserva de Insight do grupo atualizada.`,
					);
					// Sincroniza tokens ganhos de volta ao SQLite físico
					const tokensCount = rwd?.tokensAwarded ?? 0;
					await persistWorldState(inv.targetId, tokensCount);
				} else if (inv.status === "failed") {
					log(
						`[Colapso] Pesquisa contra ${project.targetName} falhou miseravelmente! O grupo será Surpreendido no próximo combate.`,
					);
				}
			}

			await loadAllData();
		} else {
			triggerError(res.error.message);
		}
	}
}

// Gasta um token de insight do grupo contra o alvo atualizado
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleUseInsightToken() {
	if (insightTokensCount <= 0) {
		triggerError("Você não possui tokens de Insight restantes!");
		return;
	}

	const newCount = insightTokensCount - 1;
	await persistWorldState(insightTargetId, newCount);
	triggerSuccess("Token de Insight gasto!");
	log(
		`[Insight] Usado 1 Token de Insight contra o alvo ${insightTargetId.toUpperCase()}. Restantes: ${newCount}.`,
	);
}

// Limpa a reserva de tokens para poder focar em outro alvo
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleClearInsightTarget() {
	await persistWorldState("", 0);
	triggerSuccess("Foco de Insight limpo!");
	log(`[Insight] Reserva de foco de insight limpa.`);
}
</script>

<div class="investigation-container animate-fade">
	{#if successNotification}
		<div class="alert success-alert" transition:fade>
			<span>✔️ {successNotification}</span>
		</div>
	{/if}
	{#if errorNotification}
		<div class="alert error-alert" transition:fade>
			<span>⚠️ {errorNotification}</span>
		</div>
	{/if}

	<div class="header-section">
		<h1>Investigação & Descoberta</h1>
		<p class="subtitle">Desvende a biologia e as fraquezas arcanas de monstros acumulando Tokens de Insight.</p>
	</div>

	<!-- Navegação de Sub-Abas -->
	<div class="tabs-header flex gap-3 mb-6">
		<button class="tab-btn" class:active={activeSubTab === "projects"} onclick={() => activeSubTab = "projects"} data-testid="tab-projects">
			Projetos de Pesquisa
		</button>
		<button class="tab-btn" class:active={activeSubTab === "clues"} onclick={() => { activeSubTab = "clues"; loadCluesAndDeductions(); }} data-testid="tab-clues">
			Mesa de Deduções &amp; Pistas
		</button>
	</div>

	{#if activeSubTab === "projects"}
		<!-- Grade Principal -->
		<div class="grid-layout">
			<!-- Coluna da Esquerda: Projetos e Reserva de Insight -->
			<div class="left-col">
				<!-- Reserva Global de Insight (WorldState) -->
				<div class="panel insight-panel glass">
					<h2>Reserva de Insight do Grupo</h2>
					{#if insightTargetId}
						{@const monster = BESTIARY.find(m => m.id === insightTargetId)}
						<div class="insight-active">
							<div class="insight-meta">
								<span class="label">Alvo Focado:</span>
								<span class="value font-bold text-bronze">{monster ? monster.name : insightTargetId.replace("_", " ").toUpperCase()}</span>
							</div>
							<div class="insight-tokens">
								<span class="label">Tokens de Insight:</span>
								<div class="token-container">
									{#each Array(3) as _, i}
										<div class="token-dot" class:active={i < insightTokensCount}>
											👁️
										</div>
									{/each}
									<span class="token-text">({insightTokensCount} / 3)</span>
								</div>
							</div>

							<p class="insight-help">Gaste 1 Token durante o combate como Ação Grátis [F] para aplicar manobras do Códex.</p>
							
							<div class="btn-group">
								<button class="btn btn-primary" onclick={handleUseInsightToken} disabled={insightTokensCount <= 0}>
									Consumir Token
								</button>
								<button class="btn btn-outline" onclick={handleClearInsightTarget}>
									Limpar Foco
								</button>
							</div>
						</div>
					{:else}
						<div class="insight-empty">
							<p>Nenhuma reserva de insight ativa. Conclua uma pesquisa para acumular tokens.</p>
						</div>
					{/if}
				</div>

				<!-- Projetos Ativos -->
				<div class="panel active-panel glass">
					<h2>Projetos de Pesquisa Ativos</h2>
					{#if activeProjects.length === 0}
						<p class="empty">Nenhuma pesquisa sendo executada no momento.</p>
					{:else}
						{#each activeProjects as p (p.id)}
							<div class="project-card border border-bronze/20" data-testid={`project-card-${p.id}`}>
								<div class="card-header">
									<h3>{p.targetName}</h3>
									<span class="badge type-badge">{p.type === 'short_rest' ? '1h Descanso' : 'Semanal'}</span>
								</div>

								<!-- Relógios de Progresso -->
								<div class="clock-row">
									<div class="clock-label">
										<span>Sucessos Requeridos:</span>
										<span class="font-bold">{p.successesAccumulated} / {p.successesRequired}</span>
									</div>
									<div class="bar-bg">
										<div class="bar-fill success-fill" style="width: {(p.successesAccumulated / p.successesRequired) * 100}%"></div>
									</div>
								</div>

								<div class="clock-row mt-2">
									<div class="clock-label">
										<span>Falhas Máximas (Tolerância):</span>
										<span class="font-bold text-blood">{p.failuresAccumulated} / {p.failuresMax}</span>
									</div>
									<div class="bar-bg">
										<div class="bar-fill failure-fill" style="width: {(p.failuresAccumulated / p.failuresMax) * 100}%"></div>
									</div>
								</div>

								<!-- Seletor de Andarilho e Rolagem -->
								<div class="roll-section border-t border-bronze/10 mt-4 pt-3">
									<div class="input-group">
										<label for="researcher">Pesquisador:</label>
										<select id="researcher" bind:value={selectedCharacterId}>
											{#each characters as char}
												{@const bonus = char.level + char.mental + Math.max(char.interaction || 0, char.conflict || 0)}
												<option value={char.id}>
													{char.name} (Nível {char.level} | Mental +{char.mental} | Bônus: +{bonus})
												</option>
											{/each}
										</select>
									</div>

									<div class="cost-checkbox mt-2">
										<label class="flex items-center gap-2 cursor-pointer">
											<input type="checkbox" bind:checked={useVigorCost} />
											<span class="text-xs text-bone/80">Usar 1 PV de Vigor em vez de dobrar Ouro no Sucesso com Custo</span>
										</label>
									</div>

									<div class="roll-actions mt-3">
										<button class="btn btn-primary w-full btn-roll" onclick={() => handleRollTest(p)} disabled={isRolling}>
											{#if isRolling}
												⚙️ Pesquisando...
											{:else}
												🎲 Realizar Rolagem (DC {p.dc})
											{/if}
										</button>
									</div>

									{#if rolledD20Value !== null}
										<div class="dice-box animate-scale mt-3">
											<div class="dice-d20" class:rolling={isRolling}>
												<span>{rolledD20Value}</span>
											</div>
											<div class="dice-result">
												<span class="text-xs text-bone/60">Dado ({rolledD20Value}) + Bônus</span>
												<span class="total-val text-bronze">{rolledTotalValue}</span>
											</div>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<!-- Coluna da Direita: Bestiário e Iniciar Pesquisa, Logs -->
			<div class="right-col">
				<!-- Bestiário para Iniciar Pesquisa -->
				<div class="panel bestiary-panel glass">
					<h2>Iniciar Nova Investigação</h2>
					<p class="subtitle text-xs">Selecione uma criatura para focar os esforços intelectuais do grupo.</p>

					<div class="input-group mt-3">
						<label for="monster-select">Monstro Alvo:</label>
						<select id="monster-select" bind:value={selectedMonsterId}>
							{#each BESTIARY as m}
								<option value={m.id}>{m.name} (DC {m.dc})</option>
							{/each}
						</select>
					</div>

					<div class="monster-desc-card mt-3 border border-bronze/15">
						<p class="text-xs italic text-bone/90">"{selectedMonster.description}"</p>
						<div class="stats-mini mt-2 text-xs flex gap-4 text-bronze">
							<span>Nível: {selectedMonster.level}</span>
							<span>Mental: +{selectedMonster.mental}</span>
							<span>Resistência: +{selectedMonster.resistance}</span>
						</div>
					</div>

					<div class="research-options mt-4">
						<label class="option-card" class:selected={selectedResearchType === "short_rest"}>
							<input type="radio" bind:group={selectedResearchType} value="short_rest" />
							<div class="option-content">
								<h4>Pesquisa Rápida (Descanso Curto)</h4>
								<p class="text-xs text-bone/70">1h de descanso. Custo: 0 PO. Requer 3 sucessos. Tolerância a falhas: 1.</p>
							</div>
						</label>

						<label class="option-card mt-2" class:selected={selectedResearchType === "weekly_metropolis"}>
							<input type="radio" bind:group={selectedResearchType} value="weekly_metropolis" />
							<div class="option-content">
								<h4>Pesquisa de Campo (Semanal)</h4>
								<p class="text-xs text-bone/70">1 semana de Downtime. Custo: 25 a 2000 PO/teste. Requer 6 ou 9 sucessos. Tolerância: 2 ou 3.</p>
							</div>
						</label>
					</div>

					<button class="btn btn-primary w-full mt-4" onclick={handleStartProject} data-testid="start-project-btn">
						Iniciar Projeto de Pesquisa
					</button>
				</div>

				<!-- Histórico / Logs -->
				<div class="panel log-panel glass">
					<h2>Histórico Científico</h2>
					<div class="logs-wrapper">
						{#each logs as lMsg}
							<div class="log-entry">{lMsg}</div>
						{/each}
						{#if logs.length === 0}
							<p class="empty">Nenhuma pesquisa realizada nesta crônica.</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Grade de Deduções e Conexão de Pistas -->
		<div class="grid-layout">
			<!-- Coluna da Esquerda: Lista de Pistas -->
			<div class="left-col">
				<div class="panel clues-list-panel glass">
					<h2>🔑 Pistas Disponíveis no Caderno</h2>
					<p class="subtitle text-xs">Selecione duas pistas para tentar encontrar uma conexão lógica.</p>

					{#if unlockedClues.length === 0}
						<div class="empty-clues py-6 text-center">
							<p class="text-bone/50 italic text-sm">Nenhuma pista no caderno de anotações.</p>
							<p class="text-[10px] text-ether/60 mt-1">Interrogue Silas ou Eldrin na aba de Diálogos para encontrar pistas.</p>
						</div>
					{:else}
						<div class="clues-grid flex flex-col gap-2.5 mt-4">
							{#each unlockedClues as clueId}
								{@const isSelected = selectedClues.includes(clueId)}
								<button
									type="button"
									class="clue-item-btn p-3 bg-void border rounded text-left transition-all flex items-center justify-between gap-3 cursor-pointer
										{isSelected 
											? 'border-ether bg-ether/10 shadow-[0_0_12px_rgba(192,132,252,0.2)] text-ether font-bold' 
											: 'border-bronze/30 hover:border-bronze hover:bg-ruin/20 text-bone/90'}"
									onclick={() => handleToggleClue(clueId)}
									data-testid={`clue-item-${clueId}`}
								>
									<div class="flex flex-col">
										<span class="text-xs font-semibold">{getClueLabel(clueId)}</span>
										<span class="text-[9px] text-bone/40 font-mono mt-0.5">{clueId}</span>
									</div>
									{#if isSelected}
										<span class="text-xs text-ether">✔️</span>
									{/if}
								</button>
							{/each}
						</div>
					{/if}

					<!-- Botão de debug para homologação/testes -->
					<div class="dev-controls mt-6 border-t border-bronze/10 pt-4 flex justify-between items-center">
						<span class="text-[10px] text-bone/40 uppercase">Apenas para Testes</span>
						<button
							type="button"
							class="btn btn-outline text-[10px] py-1 px-3"
							onclick={handleAddDemoClues}
							data-testid="add-demo-clues-btn"
						>
							🔍 Adicionar Pistas de Demonstração
						</button>
					</div>
				</div>
			</div>

			<!-- Coluna da Direita: Forja de Deduções e Revelações -->
			<div class="right-col flex flex-col gap-6">
				<!-- Conector Rúnico -->
				<div class="panel connector-panel glass">
					<h2>🔮 Forja de Revelações</h2>
					<p class="subtitle text-xs">Forje deduções a partir de correlações arcanas e históricas.</p>

					<div class="connector-visual bg-void/60 border border-bronze/20 rounded p-4 mt-4 min-h-[120px] flex flex-col items-center justify-center gap-3 relative">
						{#if selectedClues.length === 0}
							<p class="text-xs text-bone/40 italic">Selecione duas pistas na lista ao lado.</p>
						{:else}
							<div class="selected-clues-display flex flex-wrap gap-2 justify-center w-full">
								{#each selectedClues as sc}
									<div class="selected-clue-badge px-3 py-1.5 bg-ruin border border-ether/40 text-ether rounded text-xs animate-scale flex items-center gap-2">
										<span>🔑</span>
										<span>{getClueLabel(sc)}</span>
										<button type="button" class="text-blood font-bold hover:text-blood/80 cursor-pointer" onclick={() => handleToggleClue(sc)}>×</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<button
						type="button"
						class="btn btn-primary w-full mt-4"
						disabled={selectedClues.length !== 2}
						onclick={handleConnectClues}
						data-testid="connect-clues-btn"
					>
						🔮 Conectar Pistas
					</button>
				</div>

				<!-- Revelações Concluídas -->
				<div class="panel deductions-panel glass">
					<h2>📜 Revelações Concluídas ({completedDeductions.length})</h2>
					<p class="subtitle text-xs">Mitos resolvidos e mistérios desvendados nesta crônica.</p>

					<div class="deductions-list flex flex-col gap-2 mt-3">
						{#each completedDeductions as deduction}
							<div class="deduction-card p-3 bg-void/50 border border-bronze/30 rounded text-xs flex flex-col gap-1 shadow-inner animate-fade-in" data-testid={`deduction-card-${deduction.replace(/[^a-zA-Z0-9]/g, "-")}`}>
								<div class="flex items-center gap-2 text-bronze font-bold">
									<span>✦</span>
									<span>{deduction}</span>
								</div>
								<p class="text-[10px] text-bone/60">
									{#if deduction.includes("Selen-Ghar")}
										A chave rúnica foi decifrada e o cofre do Bastião pode ser aberto.
									{:else}
										Eldrin foi exposto por contrabando de éter através da rede de Silas.
									{/if}
								</p>
							</div>
						{/each}

						{#if completedDeductions.length === 0}
							<p class="text-xs text-bone/40 italic py-3 text-center">Nenhuma revelação forjada na teia até agora.</p>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
