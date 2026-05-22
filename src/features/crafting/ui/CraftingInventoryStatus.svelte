<script lang="ts">
// biome-ignore-all lint/correctness/noUnusedImports: Usados no template Svelte 5
// biome-ignore-all lint/correctness/noUnusedVariables: Usados no template Svelte 5

// Componente de UI para o status de inventário e capacidade de carga no contexto de Pandorha Engine
// Didática baseada no Modo Professor: explica de maneira legível como os Decorators influenciam a mobilidade

interface Props {
	equippedWeight: number;
	// biome-ignore lint/suspicious/noExplicitAny: Aceita o decorator reativo complexo do Svelte 5
	finalStats: any;
	// biome-ignore lint/suspicious/noExplicitAny: Aceita o registro de personagem da sessão
	activeCharacterRecord: any;
}

let { equippedWeight, finalStats, activeCharacterRecord }: Props = $props();
</script>

<div class="bg-ruin p-5 rounded border border-bronze/20 z-10 flex flex-col gap-4">
	<div class="flex justify-between items-center border-b border-bronze/10 pb-3">
		<div>
			<h3 class="text-xs font-bold uppercase tracking-widest text-ether">🎒 Inventário Tático & Capacidade de Carga</h3>
			<p class="text-[10px] text-bone/50 mt-0.5">Equipe itens e gerencie seu peso sob os Decoradores de logística.</p>
		</div>
		<div class="flex items-center gap-3">
			<span class="text-[10px] uppercase font-mono text-bone/60">Carga Ativa:</span>
			<span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-void border border-bronze/35 text-ether">
				{equippedWeight} / {finalStats.carrySlotLimit} Slots
			</span>
		</div>
	</div>

	<!-- Barra de Carga -->
	<div class="w-full bg-void rounded-full h-3.5 border border-bronze/20 overflow-hidden p-0.5 relative">
		<div class="absolute top-0 bottom-0 left-[75%] border-r border-[#A87832]/50 z-20"></div>
		<div 
			class="h-full rounded-full transition-all duration-500
				{finalStats.encumbranceState === 'overloaded' ? 'bg-blood shadow-[0_0_10px_#1a0f0f]' :
				finalStats.encumbranceState === 'encumbered' ? 'bg-bronze shadow-[0_0_10px_#a87832]' :
				'bg-ether shadow-[0_0_10px_#dab973]'}"
			style="width: {Math.min(100, (equippedWeight / finalStats.carrySlotLimit) * 100)}%"
		></div>
	</div>

	<!-- Estado Atual e Atributos Finais -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
		<div class="bg-void p-2.5 rounded border border-bronze/10 text-center">
			<span class="block text-[10px] uppercase text-bone/55">Velocidade Final</span>
			<strong class="text-bone text-sm font-mono">{finalStats.movementSpeedBase}m</strong>
		</div>
		<div class="bg-void p-2.5 rounded border border-bronze/10 text-center">
			<span class="block text-[10px] uppercase text-bone/55">Iniciativa Final</span>
			<strong class="text-bone text-sm font-mono">+{finalStats.conflict}</strong>
		</div>
		<div class="bg-void p-2.5 rounded border border-bronze/10 text-center">
			<span class="block text-[10px] uppercase text-bone/55">Estado de Carga</span>
			<strong class="text-sm font-mono uppercase tracking-wider
				{finalStats.encumbranceState === 'overloaded' ? 'text-blood' :
				finalStats.encumbranceState === 'encumbered' ? 'text-bronze' :
				'text-ether'}"
			>
				{finalStats.encumbranceState === 'overloaded' ? 'Imobilizado' :
				finalStats.encumbranceState === 'encumbered' ? 'Sobrecarga' :
				'Livre'}
			</strong>
		</div>
		<div class="bg-void p-2.5 rounded border border-bronze/10 text-center">
			<span class="block text-[10px] uppercase text-bone/55">Ajuste de Carga</span>
			<strong class="text-ether text-[10px] font-mono">
				{activeCharacterRecord.ancestryId === 'dwarf' ? 'Anão (+2 Slots)' : 'Padrão'}
			</strong>
		</div>
	</div>

	<!-- Alerta de Penalidade Ativa -->
	{#if finalStats.encumbranceState !== 'light'}
		<div class="p-3 rounded border text-[11px] leading-relaxed flex items-center gap-3 animate-pulse
			{finalStats.encumbranceState === 'overloaded' ? 'bg-blood-shadow/20 border-blood/30 text-blood' :
			'bg-bronze/10 border-bronze/30 text-bronze'}"
		>
			<span class="text-lg">⚠️</span>
			<div>
				{#if finalStats.encumbranceState === 'overloaded'}
					<strong>IMOBILIZADO TOTALMENTE!</strong> Sua velocidade base foi reduzida a zero devido ao peso excessivo dos itens equipados. Remova ou desequipe equipamentos para conseguir se mover.
				{:else}
					<strong>PENALIDADE DE SOBRECARGA LEVE!</strong> Sua velocidade base é reduzida em -3 metros e você recebe uma penalidade de -2 na Iniciativa (incorporado reativamente no Decorador).
				{/if}
			</div>
		</div>
	{/if}
</div>
