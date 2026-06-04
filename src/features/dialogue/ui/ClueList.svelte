<script lang="ts">
interface Props {
	unlockedClues: readonly string[];
}

let props: Props = $props();
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let unlockedClues = $derived(props.unlockedClues);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function getClueLabel(id: string): string {
	const labels: Record<string, string> = {
		"clue-secret-inventory": "Inventário Secreto do Mercador",
		"clue-magic-amulet": "Inscrição Rúnica do Amuleto",
		"clue-elixir-mastery": "Receita do Elixir das Névoas",
		"clue-bastion-location": "Localização do Bastião Antigo",
	};
	return labels[id] || id;
}
</script>

<div class="p-4 bg-ruin/75 border border-bronze/45 rounded-lg shadow-xl flex flex-col gap-3">
	<h3 class="font-bold text-xs uppercase text-ether tracking-wider border-b border-ether/20 pb-2">
		🔑 Pistas Desvendadas
	</h3>
	{#if unlockedClues.length > 0}
		<div class="flex flex-col gap-2">
			{#each unlockedClues as clue}
				<div class="p-2.5 bg-void border border-ether/25 rounded text-xs flex items-center gap-2 shadow-inner animate-fade-in">
					<span class="text-ether font-bold">✓</span>
					<div class="flex-1">
						<span class="font-semibold text-bone block">{getClueLabel(clue)}</span>
						<span class="text-[9px] text-bone/40 font-mono block">{clue}</span>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<p class="text-xs text-bone/40 italic py-4 text-center">Nenhuma pista desvendada nesta campanha.</p>
	{/if}
</div>
