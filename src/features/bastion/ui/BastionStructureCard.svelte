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
	onRepair: (m: BastionModuleRecord) => Promise<void>;
	onUpgrade: (m: BastionModuleRecord, trophyId?: string) => Promise<void>;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let { module, catalogItem, characters, onAdvance, onRepair, onUpgrade }: Props =
	$props();

let selectedCharacterId = $state("");
let _trophyId = $state("");

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

<div class="module-card-active glass" class:module-broken={module.isBroken}>
	<div class="module-header">
		<div>
			<h3>{catalogItem?.name || module.moduleId}</h3>
			<span class="tier-label">Tier {module.tier}</span>
		</div>
		{#if module.isBroken}
			<span class="status-broken">Quebrado</span>
		{:else}
			{#if isCompleted}
				<span class="status-done">Ativo</span>
			{:else}
				<span class="status-building">Em Obra</span>
			{/if}
		{/if}
	</div>

	{#if module.isBroken}
		<div class="broken-actions">
			<p class="alert-desc">Este módulo foi danificado durante um cerco e está inoperante.</p>
			<button class="btn btn-sm btn-danger" onclick={() => onRepair(module)}>
				🔧 Reparar (Custo: {module.tier * 100} PO)
			</button>
		</div>
	{:else}
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
		{:else if module.tier < 4}
			<div class="upgrade-row">
				{#if module.tier >= 2}
					<input type="text" placeholder="ID do Troféu de Criatura" bind:value={trophyId} />
				{/if}
				<button class="btn btn-sm btn-upgrade" onclick={() => { onUpgrade(module, trophyId); trophyId = ""; }}>
					🚀 Evoluir para Tier {module.tier + 1} ({(module.tier + 1) * 150} PO)
				</button>
			</div>
		{/if}
	{/if}
</div>
