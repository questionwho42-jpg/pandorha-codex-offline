<script lang="ts">
import { chatState } from "../model/chatState.svelte";

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isOpen = $state(false);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function setRollType(type: "Normal" | "Vantagem" | "Desvantagem") {
	chatState.rollType = type;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function adjustBonus(amount: number) {
	chatState.customBonus += amount;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function resetModifiers() {
	chatState.rollType = "Normal";
	chatState.customBonus = 0;
}
</script>

<div class="border border-bronze/40 bg-ruin/60 rounded-md overflow-hidden transition-all duration-300">
	<!-- Cabeçalho / Toggle do Drawer -->
	<button
		type="button"
		class="w-full flex items-center justify-between px-4 py-3 bg-void/80 hover:bg-void/40 transition-colors text-left"
		onclick={() => isOpen = !isOpen}
	>
		<div class="flex items-center gap-2">
			<span class="text-xs">🎲</span>
			<span class="text-xs font-bold uppercase tracking-wider text-ether">
				Modificadores Globais
			</span>
			<div class="flex items-center gap-1.5 ml-2">
				{#if chatState.rollType === 'Vantagem'}
					<span class="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-poison/15 border border-emerald-poison/40 text-emerald-poison rounded-sm animate-pulse">
						VANTAGEM
					</span>
				{:else}
					{#if chatState.rollType === 'Desvantagem'}
						<span class="px-1.5 py-0.5 text-[10px] font-bold bg-blood-shadow/20 border border-blood/40 text-blood rounded-sm animate-pulse">
							DESVANTAGEM
						</span>
					{:else}
						<span class="px-1.5 py-0.5 text-[10px] font-bold bg-void border border-bronze/35 text-ether/60 rounded-sm">
							NORMAL
						</span>
					{/if}
				{/if}

				{#if chatState.customBonus !== 0}
					<span class="px-1.5 py-0.5 text-[10px] font-bold bg-purple-runic/15 border border-purple-runic/40 text-purple-runic rounded-sm">
						{chatState.customBonus >= 0 ? '+' : ''}{chatState.customBonus} BÔNUS
					</span>
				{/if}
			</div>
		</div>
		<span class="text-xs text-ether/60 transform transition-transform duration-300" class:rotate-180={isOpen}>
			▼
		</span>
	</button>

	<!-- Painel Retrátil -->
	{#if isOpen}
		<div class="px-4 py-3 border-t border-bronze/30 bg-void/50 flex flex-col gap-3 transition-all duration-300">
			<!-- Seletor de Tipo -->
			<div class="flex flex-col gap-1.5">
				<span class="text-[10px] uppercase font-bold text-ether/70 tracking-wider">Modo de Rolagem</span>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all duration-200
							{chatState.rollType === 'Normal' 
								? 'bg-ruin border-ether/40 text-bone' 
								: 'bg-void/40 border-bronze/30 text-bone/50 hover:border-bronze hover:text-bone'}"
						onclick={() => setRollType("Normal")}
					>
						Normal
					</button>
					<button
						type="button"
						class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all duration-200
							{chatState.rollType === 'Vantagem' 
								? 'bg-emerald-poison/15 border-emerald-poison text-emerald-poison shadow-[0_0_8px_rgba(16,185,129,0.15)] animate-pulse' 
								: 'bg-void/40 border-bronze/30 text-bone/50 hover:border-bronze hover:text-bone'}"
						onclick={() => setRollType("Vantagem")}
					>
						Vantagem
					</button>
					<button
						type="button"
						class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all duration-200
							{chatState.rollType === 'Desvantagem' 
								? 'bg-blood-shadow/20 border-blood text-blood shadow-[0_0_8px_rgba(220,38,38,0.15)] animate-pulse' 
								: 'bg-void/40 border-bronze/30 text-bone/50 hover:border-bronze hover:text-bone'}"
						onclick={() => setRollType("Desvantagem")}
					>
						Desvantagem
					</button>
				</div>
			</div>

			<!-- Ajuste de Bônus Numérico -->
			<div class="flex items-center justify-between gap-4 mt-1">
				<div class="flex flex-col gap-0.5">
					<span class="text-[10px] uppercase font-bold text-ether/70 tracking-wider">Modificador Numérico</span>
					<span class="text-[10px] text-ether/50 font-medium">Aplica-se às rolagens rápidas</span>
				</div>
				<div class="flex items-center gap-1.5">
					<button
						type="button"
						class="w-8 h-8 rounded border border-bronze bg-ruin text-bone hover:bg-void transition-colors flex items-center justify-center font-bold text-sm"
						onclick={() => adjustBonus(-1)}
					>
						-
					</button>
					<div class="w-12 h-8 rounded border border-bronze/50 bg-void flex items-center justify-center font-bold text-sm text-bone">
						{chatState.customBonus >= 0 ? '+' : ''}{chatState.customBonus}
					</div>
					<button
						type="button"
						class="w-8 h-8 rounded border border-bronze bg-ruin text-bone hover:bg-void transition-colors flex items-center justify-center font-bold text-sm"
						onclick={() => adjustBonus(1)}
					>
						+
					</button>
				</div>
			</div>

			<!-- Botão de Limpar -->
			{#if chatState.rollType !== 'Normal' || chatState.customBonus !== 0}
				<button
					type="button"
					class="w-full text-center py-1 mt-1 text-[10px] font-bold uppercase tracking-wider border border-bronze/30 bg-ruin/20 text-ether/60 hover:text-ether hover:bg-ruin/50 transition-all duration-200"
					onclick={resetModifiers}
				>
					Limpar Modificadores
				</button>
			{/if}
		</div>
	{/if}
</div>
