<script lang="ts">
// biome-ignore-all lint/correctness/noUnusedImports: Usados no template Svelte 5
// biome-ignore-all lint/correctness/noUnusedVariables: Usados no template Svelte 5
import { slide } from "svelte/transition";

export interface RollResult {
	success: boolean;
	degree: "criticalSuccess" | "success" | "successWithCost" | "failure";
	naturalRoll: number;
	totalRoll: number;
	dc: number;
	modifier: number;
	message: string;
	details: string;
	itemCreated?: {
		label: string;
		isSharp: boolean;
		isReinforced: boolean;
		isRunic: boolean;
		slots: number;
		damageBonus: number;
		runeSlots: number;
	} | null;
}

interface Props {
	lastRollResult: RollResult | null;
	characterName: string;
}

let { lastRollResult, characterName }: Props = $props();
</script>

{#if lastRollResult}
	<div 
		transition:slide={{ duration: 400 }}
		class="roll-result-panel p-5 rounded-lg border flex flex-col gap-3 text-xs z-10
			{lastRollResult.degree === 'criticalSuccess' ? 'bg-void border-ether/40 text-ether' :
			lastRollResult.degree === 'success' ? 'bg-ruin border-bronze/30 text-[#ecece3]' :
			lastRollResult.degree === 'successWithCost' ? 'bg-void border-bronze/20 text-[#ecece3]' :
			'bg-blood-shadow/20 border-blood/20 text-[#ecece3]'}"
	>
		<div class="flex justify-between items-center border-b pb-2 border-current/20">
			<span class="font-bold text-sm uppercase tracking-wider">{lastRollResult.message}</span>
			<div class="flex items-center gap-2">
				<span class="text-[10px] uppercase font-bold tracking-widest text-bone/60">Teste de Artífice</span>
				<span class="font-mono font-bold bg-void px-2 py-0.5 rounded border border-current/20 text-sm">
					d20 ({lastRollResult.naturalRoll}) + {lastRollResult.modifier} = {lastRollResult.totalRoll} (CD {lastRollResult.dc})
				</span>
			</div>
		</div>

		<p class="leading-relaxed italic text-bone/80">
			{lastRollResult.details}
		</p>

		{#if lastRollResult.itemCreated}
			<div class="item-card bg-void border border-bronze/20 p-4 rounded mt-2 flex flex-col gap-2">
				<div class="flex justify-between items-center">
					<span class="font-bold text-sm text-ether">{lastRollResult.itemCreated.label}</span>
					<span class="text-[10px] uppercase tracking-wider font-mono font-bold bg-bronze/20 text-bronze px-2 py-0.5 rounded">
						Forjado por {characterName}
					</span>
				</div>
				
				<div class="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono text-bone/75">
					<div class="bg-void p-1.5 rounded border border-bronze/10 text-center">
						<span class="block text-bone/40 uppercase">Carga</span>
						<strong class="text-bone text-xs">{lastRollResult.itemCreated.slots} Slot{lastRollResult.itemCreated.slots !== 1 ? 's' : ''}</strong>
					</div>
					<div class="bg-void p-1.5 rounded border border-bronze/10 text-center">
						<span class="block text-bone/40 uppercase">Dano Extra</span>
						<strong class="text-bone text-xs">+{lastRollResult.itemCreated.damageBonus}</strong>
					</div>
					<div class="bg-void p-1.5 rounded border border-bronze/10 text-center">
						<span class="block text-bone/40 uppercase">Slots Runas</span>
						<strong class="text-bone text-xs">{lastRollResult.itemCreated.runeSlots}</strong>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
