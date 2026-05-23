<script lang="ts">
import { onMount } from "svelte";
import { QuestService } from "$lib/entities/quest/domain/QuestService";
import { WorkerQuestRepository } from "$lib/entities/quest/infrastructure/WorkerQuestRepository";
import type { QuestRecord } from "$lib/entities/quest/model/questSchema";

// Repositório e Serviço de Quests via RPC/Worker
const repository = new WorkerQuestRepository();
const service = new QuestService(repository);

// Estados Reativos do Svelte 5
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let activeTab = $state<"active" | "completed" | "rumors">("active");
let quests = $state<QuestRecord[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let successNotification = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let errorNotification = $state<string | null>(null);

// Filtragem Reativa de Quests
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
const activeQuests = $derived(quests.filter((q) => q.status === "active"));
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
const completedQuests = $derived(
	quests.filter((q) => q.status === "completed" || q.status === "failed"),
);

// Catálogo de Rumores Estáticos Narrativos para Lore
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
const rumors = [
	{
		id: "rumor_1",
		text: "Há boatos de que Silas o Mercador esconde um pergaminho antigo de transmutação em sua carroça. Dizem que ele exige um favor de sangue para revelá-lo.",
		source: "Silas o Mercador",
	},
	{
		id: "rumor_2",
		text: "Andarilhos que cruzaram a Névoa do Sul falam de estruturas de pedra que emitem um brilho rúnico à noite. Pode ser o antigo Bastião Caído dos Reis do Sol.",
		source: "Explorador da Caravana",
	},
	{
		id: "rumor_3",
		text: "Uma febre estranha assola os vilarejos de fronteira. Alquimistas dizem que apenas o extrato da Flor de Eter cultivada em solo sagrado pode curá-la.",
		source: "Horticultor de Alvorada",
	},
];

onMount(async () => {
	await loadQuestsFromStore();
});

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

async function loadQuestsFromStore() {
	const res = await service.listQuests();
	if (res.success) {
		quests = res.data;
	} else {
		console.warn("Falha ao ler diário de missões do worker.");
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleCompleteQuest(id: string) {
	const res = await service.completeQuest(id);
	if (res.success) {
		await loadQuestsFromStore();
		triggerSuccess("Missão concluída com sucesso! Recompensas distribuídas.");
	} else {
		triggerError(res.error.message);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleFailQuest(id: string) {
	const res = await service.failQuest(id);
	if (res.success) {
		await loadQuestsFromStore();
		triggerSuccess("Missão marcada como fracassada no diário de campanha.");
	} else {
		triggerError(res.error.message);
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
async function handleCreateTestQuest() {
	const testId = `quest_${crypto.randomUUID().slice(0, 8)}`;
	const res = await service.acceptQuest(
		testId,
		"Investigar o Bastião Caído",
		"Encontre as ruínas arqueológicas na Névoa do Sul, derrote os guardiões de ferro e recupere o Conduíte de Cristal Rúnico.",
		["pista_bastiao"],
		{ gold: 250, renown: 10, xp: 500 },
	);

	if (res.success) {
		await loadQuestsFromStore();
		triggerSuccess("Nova missão adicionada ao diário!");
	} else {
		triggerError(res.error.message);
	}
}

// Helper para parsear as recompensas de forma segura
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function getRewards(rewardsJson: string) {
	try {
		return JSON.parse(rewardsJson);
	} catch {
		return {};
	}
}

// Helper para parsear os requisitos de forma segura
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
function getRequirements(reqJson: string): string[] {
	try {
		return JSON.parse(reqJson);
	} catch {
		return [];
	}
}
</script>

<div class="quest-log-container">
	{#if successNotification}
		<div class="alert success-alert animate-fade">
			<span>✔️ {successNotification}</span>
		</div>
	{/if}
	{#if errorNotification}
		<div class="alert error-alert animate-fade">
			<span>⚠️ {errorNotification}</span>
		</div>
	{/if}

	<div class="panel header-panel">
		<h1>Diário de Missões & Rumores</h1>
		<p class="subtitle">O escriba registra cada passo na escuridão; o diário é a prova de que lutamos.</p>

		<div class="tabs-header">
			<button class="tab-btn" class:active={activeTab === "active"} onclick={() => activeTab = "active"}>
				Missões Ativas ({activeQuests.length})
			</button>
			<button class="tab-btn" class:active={activeTab === "completed"} onclick={() => activeTab = "completed"}>
				Histórico ({completedQuests.length})
			</button>
			<button class="tab-btn" class:active={activeTab === "rumors"} onclick={() => activeTab = "rumors"}>
				Boatos & Rumores ({rumors.length})
			</button>
		</div>

		{#if activeTab === "active"}
			<div class="quest-list">
				{#each activeQuests as q (q.id)}
					{@const r = getRewards(q.rewardsJson)}
					{@const reqs = getRequirements(q.requirementsJson)}
					<div class="quest-card">
						<div class="quest-header">
							<h3>{q.title}</h3>
							<span class="quest-status-badge status-active">Ativa</span>
						</div>
						<p class="quest-desc">{q.description}</p>
						
						<div class="quest-meta">
							{#if reqs.length > 0}
								<div class="meta-section">
									<h4>Requisitos</h4>
									<div class="clues-list">
										{#each reqs as rKey}
											<span class="clue-tag">{rKey.replace("pista_", "Pista: ").toUpperCase()}</span>
										{/each}
									</div>
								</div>
							{/if}

							<div class="meta-section">
								<h4>Recompensas</h4>
								<div class="rewards-list">
									{#if r.gold}
										<div class="reward-item">🪙 {r.gold} PO</div>
									{/if}
									{#if r.renown}
										<div class="reward-item reward-renown">🛡️ +{r.renown} Renome</div>
									{/if}
									{#if r.xp}
										<div class="reward-item reward-xp">✨ {r.xp} XP</div>
									{/if}
								</div>
							</div>
						</div>

						<div class="quest-actions">
							<button class="btn btn-sm btn-primary" onclick={() => handleCompleteQuest(q.id)}>Concluir</button>
							<button class="btn btn-sm btn-danger" onclick={() => handleFailQuest(q.id)}>Falhar</button>
						</div>
					</div>
				{/each}

				{#if activeQuests.length === 0}
					<p class="empty">Nenhuma missão ativa no momento. Procure Silas ou Silas de Alvorada por boatos.</p>
				{/if}
			</div>
		{:else if activeTab === "completed"}
			<div class="quest-list">
				{#each completedQuests as q (q.id)}
					{@const r = getRewards(q.rewardsJson)}
					<div class="quest-card">
						<div class="quest-header">
							<h3>{q.title}</h3>
							<span class="quest-status-badge" class:status-completed={q.status === "completed"} class:status-failed={q.status === "failed"}>
								{q.status.toUpperCase()}
							</span>
						</div>
						<p class="quest-desc">{q.description}</p>

						<div class="quest-meta">
							<div class="meta-section">
								<h4>Recompensas Registradas</h4>
								<div class="rewards-list">
									{#if r.gold}
										<div class="reward-item">🪙 {r.gold} PO</div>
									{/if}
									{#if r.renown}
										<div class="reward-item reward-renown">🛡️ {r.renown} Renome</div>
									{/if}
								</div>
							</div>
						</div>
					</div>
				{/each}

				{#if completedQuests.length === 0}
					<p class="empty">Nenhuma missão concluída ou falhada até agora.</p>
				{/if}
			</div>
		{:else if activeTab === "rumors"}
			<div class="rumors-grid">
				{#each rumors as rum (rum.id)}
					<div class="rumor-card">
						<p>"{rum.text}"</p>
						<span class="rumor-source">— Fonte: {rum.source}</span>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Seção de Depuração e Homologação Local -->
		<div class="dev-controls">
			<button class="btn btn-outline" onclick={handleCreateTestQuest}>
				📜 Adicionar Missão de Teste (Bastião)
			</button>
		</div>
	</div>
</div>

<style>
	@import "./questLog.css";
</style>
