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
	onRepair: (m: BastionModuleRecord) => Promise<void>;
	onUpgrade: (m: BastionModuleRecord, trophyId?: string) => Promise<void>;
}

let {
	modules,
	characters,
	moduleCatalog,
	onAdvance,
	onRepair,
	onUpgrade,
}: Props = $props();

// Silence unused variable warnings for Biome (used in markup)
void modules;
void characters;
void moduleCatalog;
void onAdvance;
void onRepair;
void onUpgrade;
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
				onRepair={onRepair}
				onUpgrade={onUpgrade}
			/>
		{/each}
	</div>
</div>


