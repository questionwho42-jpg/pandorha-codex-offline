<script lang="ts">
// biome-ignore lint/correctness/noUnusedImports: consumed by Svelte markup.
import { fade } from "svelte/transition";
import type { CharacterCraftedItemRecord } from "$lib/entities/equipment/model/craftingSchema";

interface Props {
	characterItems: readonly CharacterCraftedItemRecord[];
	characterName: string;
	getFinalSlotCost: (item: CharacterCraftedItemRecord) => number;
	toggleEquipItem: (id: string) => void;
	deleteItem: (id: string) => void;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup
let props: Props = $props();
</script>

<div class="crafted-items-section flex flex-col gap-4 bg-ruin p-4 rounded border border-bronze/20 mt-2 z-10">
	<div class="flex justify-between items-center border-b border-bronze/10 pb-2">
		<h3 class="text-xs font-bold uppercase tracking-widest text-ether">3. Acervo de Armas e Armaduras Forjadas</h3>
		<span class="text-[10px] text-bone/50 italic">Itens deste personagem</span>
	</div>

	{#if props.characterItems.length === 0}
		<p class="text-xs text-bone/40 italic py-4 text-center">Nenhum item foi forjado para {props.characterName}. Acione o fole e comece a forja!</p>
	{:else}
		<div class="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
			{#each props.characterItems as item (item.id)}
				<div 
					transition:fade={{ duration: 200 }}
					class="item-row flex justify-between items-center bg-void border p-2.5 rounded hover:border-ether/40 transition-all text-xs
						{item.isEquipped === 1 ? 'border-ether/55 shadow-[0_0_8px_rgba(218,185,115,0.08)] bg-void' : 'border-bronze/15 bg-void'}"
				>
					<div class="flex flex-col gap-1">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="font-bold {item.isEquipped === 1 ? 'text-ether' : 'text-bone'}">
								{item.label}
							</span>
							<span class="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-ruin border border-bronze/20 text-bone/60">
								Slots: {props.getFinalSlotCost(item)}
							</span>
							{#if item.isEquipped === 1}
								<span class="text-[9px] uppercase font-bold font-mono px-1.5 py-0.5 rounded bg-ether/10 border border-ether/30 text-ether">
									Equipado
								</span>
							{/if}
							<!-- Tags de modificadores (cores oficiais de Pandorha) -->
							{#if item.isSharp === 1}
								<span class="text-[9px] uppercase font-mono px-1 rounded bg-blood-shadow/40 border border-blood/20 text-blood">Afiado</span>
							{/if}
							{#if item.isReinforced === 1}
								<span class="text-[9px] uppercase font-mono px-1 rounded bg-ruin border border-ether/20 text-ether">Reforçado (-1 Carga)</span>
							{/if}
							{#if item.isRunic === 1}
								<span class="text-[9px] uppercase font-mono px-1 rounded bg-ruin border border-bronze/20 text-bronze">Rúnica</span>
							{/if}
						</div>
						<span class="text-[10px] text-bone/50">
							Durabilidade: <strong class="font-mono text-bone/70">{item.durabilityCurrent}/{item.durabilityMax}</strong>
						</span>
					</div>

					<div class="flex items-center gap-2">
						<button 
							onclick={() => props.toggleEquipItem(item.id)}
							class="px-2 py-1 rounded font-bold text-[10px] uppercase tracking-wider transition-all border
								{item.isEquipped === 1 ? 'bg-bronze/10 border-bronze/35 text-bronze hover:bg-bronze/25' : 
								'bg-ether/10 border-ether/30 text-ether hover:bg-ether/25'}"
						>
							{item.isEquipped === 1 ? 'Desequipar' : 'Equipar'}
						</button>

						<button 
							onclick={() => props.deleteItem(item.id)}
							class="px-2 py-1 rounded bg-blood-shadow border border-blood/25 text-blood hover:bg-blood-shadow/60 font-bold text-[10px] uppercase tracking-wider transition-all"
						>
							Excluir
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
