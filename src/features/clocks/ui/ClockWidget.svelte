<script lang="ts">
import type { ClockData } from "../../../entities/clocks/model-api";

let { clock } = $props<{ clock: ClockData }>();

// Calculate percentage for SVG dasharray
const radius = 16;
const circumference = 2 * Math.PI * radius;

// A small gap between segments if needed can be done via dasharray logic
// But simplest pie chart approach:
let fillPercentage = $derived(clock.filledSegments / clock.totalSegments);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let strokeDasharray = $derived(
	`${fillPercentage * circumference} ${circumference}`,
);
</script>

<div class="flex flex-col items-center gap-2 p-4 bg-ruin border border-bronze rounded-lg min-w-48 text-center relative overflow-hidden">
	<!-- Status glow if completed -->
	{#if clock.isCompleted}
		<div class="absolute inset-0 bg-blood-shadow/20 animate-pulse pointer-events-none"></div>
	{/if}

	<h3 class="font-semibold text-bone z-10">{clock.name}</h3>
	
	<div class="relative w-16 h-16 my-2 z-10 flex items-center justify-center">
		<!-- Background circle -->
		<svg class="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
			<!-- Track -->
			<circle 
				cx="18" 
				cy="18" 
				r="16" 
				fill="none" 
				class="stroke-void" 
				stroke-width="4" 
			/>
			
			<!-- Segments dividers (basic visual approximation) -->
			<!-- It is tricky to draw exact segment lines purely in standard SVG without generating paths, 
			     so we use a solid background track and a filled overlay -->
			
			<!-- Fill progress -->
			<circle 
				cx="18" 
				cy="18" 
				r="16" 
				fill="none" 
				class="stroke-bronze transition-all duration-300 ease-in-out" 
				stroke-width="4" 
				stroke-dasharray={strokeDasharray}
			/>
		</svg>

		<!-- Central text fraction -->
		<span class="text-xs font-mono text-ether font-bold">
			{clock.filledSegments}/{clock.totalSegments}
		</span>
	</div>

	{#if clock.isCompleted}
		<span class="text-xs text-blood-light font-bold uppercase tracking-widest z-10">
			Engatilhado
		</span>
		{#if clock.triggerEvent}
			<span class="text-[10px] text-ether opacity-70 z-10">{clock.triggerEvent}</span>
		{/if}
	{:else}
		<span class="text-xs text-ether opacity-50 z-10">Ativo</span>
	{/if}
</div>
