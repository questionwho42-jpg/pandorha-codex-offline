<script lang="ts">
import type { BastionModuleRecord } from "$lib/entities/bastion/model/bastionSchema";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";

// Props do Svelte 5 usando Runes
interface Props {
	module: BastionModuleRecord;
	catalogItem:
		| {
				id: string;
				name: string;
				tier: number;
				cost: number;
				dc: number;
				desc: string;
		  }
		| undefined;
	characters: CharacterRecord[];
	onAdvance: (m: BastionModuleRecord, characterId: string) => Promise<void>;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let { module, catalogItem, characters, onAdvance }: Props = $props();

let selectedCharacterId = $state("");

// Inicializa o personagem selecionado
$effect(() => {
	if (characters.length > 0 && !selectedCharacterId) {
		selectedCharacterId = characters[0].id;
	}
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
const isCompleted = $derived(module.progressCurrent >= module.progressMax);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
const progressPercent = $derived(
	(module.progressCurrent / module.progressMax) * 100,
);
</script>

<div class="module-card-active glass">
	<div class="module-header">
		<div>
			<h3>{catalogItem?.name || module.moduleId}</h3>
			<span class="tier-label">Tier {module.tier}</span>
		</div>
		{#if isCompleted}
			<span class="status-done">Ativo</span>
		{:else}
			<span class="status-building">Em Obra</span>
		{/if}
	</div>

	<div class="module-progress">
		<div class="stat-header">
			<span>Progresso da Obra</span>
			<span>{module.progressCurrent} / {module.progressMax}</span>
		</div>
		<div class="progress-bar-bg">
			<div class="progress-bar-fill work-fill" style="width: {progressPercent}%"></div>
		</div>
	</div>

	{#if !isCompleted}
		<div class="work-action-row">
			<select bind:value={selectedCharacterId}>
				{#each characters as c}
					<option value={c.id}>{c.name} (Mental: {c.mental})</option>
				{/each}
			</select>
			<button class="btn btn-sm btn-primary" onclick={() => onAdvance(module, selectedCharacterId)}>
				🔨 Bater Martelo
			</button>
		</div>
	{/if}
</div>

<style>
	.module-card-active {
		background: rgba(15, 10, 30, 0.4);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 8px;
		padding: 1rem;
		transition: transform 0.2s, border-color 0.2s;
	}

	.module-card-active:hover {
		border-color: rgba(139, 92, 246, 0.4);
	}

	.module-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.module-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: #e2e8f0;
	}

	.tier-label {
		font-size: 0.75rem;
		color: #a78bfa;
	}

	.status-done {
		color: #10b981;
		font-weight: 700;
		font-size: 0.75rem;
		background: rgba(16, 185, 129, 0.1);
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
	}

	.status-building {
		color: #3b82f6;
		font-weight: 700;
		font-size: 0.75rem;
		background: rgba(59, 130, 246, 0.1);
		padding: 0.125rem 0.5rem;
		border-radius: 4px;
	}

	.module-progress {
		margin-bottom: 1rem;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: #cbd5e1;
		margin-bottom: 0.5rem;
	}

	.progress-bar-bg {
		background: rgba(15, 10, 30, 0.8);
		border-radius: 9999px;
		height: 10px;
		overflow: hidden;
		border: 1px solid rgba(139, 92, 246, 0.2);
	}

	.progress-bar-fill {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.3s;
	}

	.work-fill {
		background: linear-gradient(90deg, #8b5cf6, #3b82f6);
	}

	.work-action-row {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	select {
		background: rgba(15, 10, 30, 0.8);
		border: 1px solid rgba(139, 92, 246, 0.4);
		color: #e2e8f0;
		padding: 0.5rem;
		border-radius: 6px;
		flex-grow: 1;
		font-size: 0.875rem;
		outline: none;
	}

	select:focus {
		border-color: #8b5cf6;
	}

	.btn {
		cursor: pointer;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.875rem;
		transition: background-color 0.2s, transform 0.1s;
		border: none;
	}

	.btn:active {
		transform: scale(0.98);
	}

	.btn-primary {
		background: linear-gradient(135deg, #6d28d9 0%, #4c1d95 100%);
		color: #fff;
		white-space: nowrap;
	}

	.btn-primary:hover {
		background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
	}
</style>
