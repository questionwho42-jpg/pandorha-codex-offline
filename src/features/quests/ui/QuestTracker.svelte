<script lang="ts">
import { onMount } from "svelte";
import { WorkerClockRepository } from "$lib/entities/clocks/infrastructure/WorkerClockRepository";
import { WorkerMercenaryRepository } from "$lib/entities/mercenary/infrastructure/WorkerMercenaryRepository";
import type { MercenarySquadRecord } from "$lib/entities/mercenary/model/mercenarySchema";
import { QuestService } from "$lib/entities/quest/domain/QuestService";
import { WorkerQuestRepository } from "$lib/entities/quest/infrastructure/WorkerQuestRepository";
import type {
	QuestObjectiveRecord,
	QuestRecord,
} from "$lib/entities/quest/model/questSchema";

// Repositórios
const questRepository = new WorkerQuestRepository();
const questService = new QuestService(questRepository);
const mercenaryRepository = new WorkerMercenaryRepository();
const clockRepository = new WorkerClockRepository();

// Estados Reativos do Svelte 5
let activeQuests = $state<QuestRecord[]>([]);
let questObjectivesMap = $state<Record<string, QuestObjectiveRecord[]>>({});
let activeDispatches = $state<
	{ squad: MercenarySquadRecord; clock: any | null }[]
>([]);
let isLoading = $state(true);

async function loadTrackerData() {
	try {
		// 1. Carregar Quests Ativas
		const questsRes = await questService.listQuests();
		if (questsRes.success) {
			activeQuests = questsRes.data.filter((q) => q.status === "active");

			// Carrega os objetivos de cada missão
			const objectivesMap: Record<string, QuestObjectiveRecord[]> = {};
			for (const quest of activeQuests) {
				const objRes = await questService.listObjectives(quest.id);
				if (objRes.success) {
					objectivesMap[quest.id] = objRes.data;
				}
			}
			questObjectivesMap = objectivesMap;
		}

		// 2. Carregar Despachos de Mercenários Ativos
		const compRes = await mercenaryRepository.listCompanies();
		if (compRes.success && compRes.data.length > 0) {
			const dispatchesList: {
				squad: MercenarySquadRecord;
				clock: any | null;
			}[] = [];
			for (const comp of compRes.data) {
				const squadRes = await mercenaryRepository.listSquadsByCompany(comp.id);
				if (squadRes.success) {
					const squadsOnMission = squadRes.data.filter(
						(s) => s.status === "on_mission" && s.assignedMissionId,
					);
					for (const squad of squadsOnMission) {
						let clockData: any | null = null;
						if (squad.assignedMissionId) {
							const clockRes = await clockRepository.findById(
								squad.assignedMissionId,
							);
							if (clockRes.success && clockRes.data) {
								clockData = clockRes.data;
							}
						}
						dispatchesList.push({ squad, clock: clockData });
					}
				}
			}
			activeDispatches = dispatchesList;
		}
	} catch (error) {
		console.error("Erro ao carregar dados do rastreador de missões:", error);
	} finally {
		isLoading = false;
	}
}

onMount(async () => {
	await loadTrackerData();

	// Atualização automática a cada 10 segundos
	const interval = setInterval(loadTrackerData, 10000);
	return () => clearInterval(interval);
});
</script>

<div class="quest-tracker-widget glass border border-bronze/25">
	<div class="tracker-header">
		<h3 class="tracker-title font-bold">Rastreador de Objetivos</h3>
		<button class="btn-refresh" onclick={loadTrackerData} title="Atualizar">🔄</button>
	</div>

	{#if isLoading}
		<div class="loading-state">
			<span class="spinner">⚙️</span>
			<span>Carregando crônicas...</span>
		</div>
	{:else}
		<div class="tracker-content">
			<!-- Seção de Missões -->
			<div class="section-title">Missões em Andamento ({activeQuests.length})</div>
			{#if activeQuests.length === 0}
				<div class="empty-state">Nenhuma missão ativa no diário.</div>
			{:else}
				<div class="quests-list">
					{#each activeQuests as q (q.id)}
						{@const objs = questObjectivesMap[q.id] || []}
						<div class="quest-item">
							<div class="quest-title-row">
								<span class="quest-scope-badge" class:guild={q.scope === 'guild'}>
									{q.scope === 'guild' ? 'GUILDA' : 'HISTÓRIA'}
								</span>
								<span class="quest-name font-bold">{q.title}</span>
							</div>

							<!-- Lista de Objetivos da Quest -->
							{#if objs.length === 0}
								<p class="quest-no-objectives">Nenhum objetivo registrado.</p>
							{:else}
								<div class="objectives-list">
									{#each objs as o (o.id)}
										<div class="objective-item" class:completed={o.status === 'completed'}>
											<span class="status-icon">
												{o.status === 'completed' ? '✔️' : '⭕'}
											</span>
											<div class="objective-details">
												<span class="objective-desc">{o.description}</span>
												{#if o.type === 'kill' || o.type === 'collect'}
													<span class="objective-progress font-mono">
														({o.currentAmount} / {o.requiredAmount})
													</span>
												{/if}
											</div>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<!-- Seção de Despachos Mercenários -->
			<div class="section-title mt-4">Despachos Ativos ({activeDispatches.length})</div>
			{#if activeDispatches.length === 0}
				<div class="empty-state">Nenhum esquadrão em expedição externa.</div>
			{:else}
				<div class="dispatches-list">
					{#each activeDispatches as d (d.squad.id)}
						<div class="dispatch-item">
							<div class="dispatch-header">
								<span class="squad-name font-bold">🛡️ {d.squad.name}</span>
								<span class="tactic-tag font-mono">{d.squad.commandTactic.toUpperCase()}</span>
							</div>
							
							{#if d.clock}
								<div class="dispatch-progress-row">
									<div class="dispatch-bar-bg">
										<div class="dispatch-bar-fill" style="width: {(d.clock.filledSegments / d.clock.totalSegments) * 100}%"></div>
									</div>
									<span class="progress-val font-mono">{d.clock.filledSegments}/{d.clock.totalSegments} Seg</span>
								</div>
								<span class="progress-desc">Expedição ativa na região da CD.</span>
							{:else}
								<span class="progress-desc">Retornando com relatórios...</span>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

