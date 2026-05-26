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
