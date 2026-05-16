<script lang="ts">
import type { SocialTarget } from "../model-api";

interface Props {
	target: SocialTarget;
}
let { target }: Props = $props();

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let patiencePercentage = $derived(
	target.patience.baseValue > 0
		? (target.patience.currentValue / target.patience.baseValue) * 100
		: 0,
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let trackPercentage = $derived(
	target.persuasion.totalSegments > 0
		? (target.persuasion.completedSegments / target.persuasion.totalSegments) *
				100
		: 0,
);
</script>

<div class="flex flex-col gap-3 p-5 bg-ruin border border-bronze rounded-lg shadow-2xl relative overflow-hidden text-bone">
	<div class="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
		<span class="text-4xl text-bronze">⚜</span>
	</div>

	<div class="flex justify-between items-center z-10">
		<h3 class="text-lg font-bold tracking-wide">{target.label}</h3>
		<span class="px-2.5 py-1 bg-void border border-bronze/50 rounded text-xs uppercase tracking-widest text-ether font-bold">
			{target.attitude}
		</span>
	</div>
	
	<div class="flex flex-col gap-2 mt-2 z-10">
		<!-- Patience Bar -->
		<div class="flex flex-col gap-1">
			<div class="flex justify-between text-[10px] font-bold uppercase text-bone/60">
				<span>Reserva de Paciência</span>
				<span class="text-bronze">{target.patience.currentValue} / {target.patience.baseValue}</span>
			</div>
			<div class="w-full bg-void rounded-full h-2 overflow-hidden border border-bronze/30 shadow-inner">
				<div 
					class="bg-bronze h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(205,127,50,0.5)]" 
					style="width: {patiencePercentage}%"
				></div>
			</div>
		</div>

		<!-- Persuasion Bar -->
		<div class="flex flex-col gap-1">
			<div class="flex justify-between text-[10px] font-bold uppercase text-bone/60">
				<span>Trilha de Persuasão</span>
				<span class="text-ether">{target.persuasion.completedSegments} / {target.persuasion.totalSegments}</span>
			</div>
			<div class="w-full bg-void rounded-full h-2 overflow-hidden border border-bronze/30 shadow-inner">
				<div 
					class="bg-ether h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(148,163,184,0.5)]" 
					style="width: {trackPercentage}%"
				></div>
			</div>
		</div>
	</div>
</div>
