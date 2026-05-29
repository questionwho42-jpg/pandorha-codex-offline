<script lang="ts">
import type { BastionModuleRecord } from "$lib/entities/bastion/model/bastionSchema";
import type { CharacterRecord } from "$lib/entities/character/model/characterSchema";
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup
import BastionStructureCard from "./BastionStructureCard.svelte";

// Props usando Runes no Svelte 5
interface Props {
	modules: BastionModuleRecord[];
	characters: CharacterRecord[];
	moduleCatalog: Array<{
		id: string;
		name: string;
		tier: number;
		cost: number;
		dc: number;
		desc: string;
	}>;
	onAdvance: (m: BastionModuleRecord, characterId: string) => Promise<void>;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let { modules, characters, moduleCatalog, onAdvance }: Props = $props();
</script>

<div class="panel build-panel glass">
	<h2>Projetos de Obra Ativos</h2>
	{#if modules.length === 0}
		<p class="empty">Nenhum projeto de obra no momento.</p>
	{/if}

	<div class="active-modules-list">
		{#each modules as m (m.id)}
			{@const cat = moduleCatalog.find((item) => item.id === m.moduleId)}
			<BastionStructureCard
				module={m}
				catalogItem={cat}
				characters={characters}
				onAdvance={onAdvance}
			/>
		{/each}
	</div>
</div>

<style>
	.panel {
		background: rgba(30, 27, 75, 0.4);
		backdrop-filter: blur(12px);
		border: 1px solid rgba(139, 92, 246, 0.2);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
		box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
	}

	h2 {
		color: #a78bfa;
		font-size: 1.5rem;
		margin-top: 0;
		margin-bottom: 1rem;
		border-bottom: 1px solid rgba(139, 92, 246, 0.1);
		padding-bottom: 0.5rem;
	}

	.active-modules-list {
		display: grid;
		grid-template-columns: 1fr;
		gap: 1rem;
	}

	.empty {
		color: #94a3b8;
		font-style: italic;
		text-align: center;
		padding: 1.5rem;
	}
</style>
