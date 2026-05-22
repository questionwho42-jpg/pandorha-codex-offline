<script lang="ts">
interface Props {
	isCrafting: boolean;
	showSpark: boolean;
	hasEnoughResources: boolean;
	triggerCraft: () => void | Promise<void>;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let { isCrafting, showSpark, hasEnoughResources, triggerCraft }: Props =
	$props();
</script>

<div class="anvil-workspace bg-void border border-bronze/35 rounded-lg p-6 flex flex-col items-center justify-center min-h-[160px] relative">
	<!-- Fogo de fundo e faísca -->
	{#if isCrafting}
		<div class="absolute inset-0 bg-ether/10 filter blur-xl animate-pulse"></div>
	{/if}

	{#if showSpark}
		<div class="spark-overlay absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-r from-[#dab973] via-[#a87832] to-[#dab973] rounded-full filter blur-md animate-ping pointer-events-none opacity-80"></div>
		<div class="absolute text-ether text-3xl font-extrabold tracking-widest animate-bounce">⚡ SPARKS! ⚡</div>
	{/if}

	<!-- Elemento da Bigorna CSS -->
	<div class="flex flex-col items-center z-10 {isCrafting ? 'animate-wiggle' : ''}">
		<!-- Martelo de Forja -->
		<div class="hammer text-5xl transition-transform duration-300 {isCrafting ? 'animate-strike' : 'hover:-rotate-12 cursor-pointer'}">
			🔨
		</div>
		<!-- Bigorna Clássica -->
		<div class="anvil-icon text-7xl mt-2 select-none">
			🔘
		</div>
		<div class="text-[10px] uppercase font-bold text-ether tracking-widest mt-3">Bigorna de Pandorha</div>
	</div>

	<!-- Botão Ativar Forja -->
	<button
		onclick={triggerCraft}
		disabled={!hasEnoughResources || isCrafting}
		class="w-full max-w-sm mt-5 py-3 rounded font-bold uppercase tracking-widest transition-all z-10 text-xs 
			{!hasEnoughResources ? 'bg-void border border-bronze/30 text-bone/40 cursor-not-allowed' :
			isCrafting ? 'bg-gradient-to-r from-bronze to-ether text-white cursor-wait animate-pulse' :
			'bg-bronze hover:bg-ether border border-bronze text-white active:scale-95 shadow-md shadow-ether/10 transition-all'}"
	>
		{#if !hasEnoughResources}
			⚠️ Recursos Insuficientes
		{:else if isCrafting}
			🔨 Malhando o Ferro...
		{:else}
			🔥 Acionar a Forja (CC & Materiais)
		{/if}
	</button>
</div>
