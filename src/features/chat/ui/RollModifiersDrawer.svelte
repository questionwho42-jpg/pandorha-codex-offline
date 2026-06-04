<script lang="ts">
import { chatState } from "../model/chatState.svelte";

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let isOpen = $state(false);
let selectedAttribute = $state("");

// Derived modifiers based on the selected attribute and active status effects
let modifiers = $derived(
	chatState.getStatusModifiersForAttribute(selectedAttribute),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let displayRollType = $derived(
	modifiers.forcedRollType !== null
		? modifiers.forcedRollType
		: chatState.rollType,
);

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
let totalBonus = $derived(chatState.customBonus + modifiers.statusBonus);

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
function setRollType(type: "Normal" | "Vantagem" | "Desvantagem") {
	if (modifiers.forcedRollType === null) {
		chatState.rollType = type;
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
function adjustBonus(amount: number) {
	chatState.customBonus += amount;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
function resetModifiers() {
	chatState.rollType = "Normal";
	chatState.customBonus = 0;
	selectedAttribute = "";
}

// biome-ignore lint/correctness/noUnusedVariables: consumed in Svelte markup
function rollD20() {
	if (!chatState.activeCharacterName || !selectedAttribute) return;

	const allStats = [...chatState.activeAxes, ...chatState.activeApplications];
	const stat = allStats.find((s) => s.label === selectedAttribute);
	const value = stat ? stat.value : 0;

	chatState.rollD20(chatState.activeCharacterName, selectedAttribute, value);
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
				{#if displayRollType === 'Vantagem'}
					<span class="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-poison/15 border border-emerald-poison/40 text-emerald-poison rounded-sm animate-pulse">
						VANTAGEM
					</span>
				{:else}
					{#if displayRollType === 'Desvantagem'}
						<span class="px-1.5 py-0.5 text-[10px] font-bold bg-blood-shadow/20 border border-blood/40 text-blood rounded-sm animate-pulse">
							DESVANTAGEM
						</span>
					{:else}
						<span class="px-1.5 py-0.5 text-[10px] font-bold bg-void border border-bronze/35 text-ether/60 rounded-sm">
							NORMAL
						</span>
					{/if}
				{/if}

				{#if totalBonus !== 0}
					<span class="px-1.5 py-0.5 text-[10px] font-bold bg-purple-runic/15 border border-purple-runic/40 text-purple-runic rounded-sm">
						{totalBonus >= 0 ? '+' : ''}{totalBonus} BÔNUS
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
		<div class="px-4 py-3 border-t border-bronze/30 bg-void/50 flex flex-col gap-3 transition-all duration-300 animate-fade-in">
			
			<!-- Seletor de Atributo -->
			<div class="flex flex-col gap-1.5">
				<label for="roll-attribute-select" class="text-[10px] uppercase font-bold text-ether/70 tracking-wider">Atributo do Teste</label>
				<select
					id="roll-attribute-select"
					bind:value={selectedAttribute}
					class="w-full bg-void text-bone border border-bronze/45 px-2.5 py-1.5 text-xs rounded focus:outline-none focus:border-ether transition-all"
				>
					<option value="">Nenhum (Apenas Modificadores Manuais)</option>
					<optgroup label="Eixos">
						<option value="Físico">Físico</option>
						<option value="Mental">Mental</option>
						<option value="Social">Social</option>
					</optgroup>
					<optgroup label="Aplicações">
						<option value="Conflito">Conflito</option>
						<option value="Interação">Interação</option>
						<option value="Resistência">Resistência</option>
					</optgroup>
				</select>
			</div>

			<!-- Seletor de Tipo -->
			<div class="flex flex-col gap-1.5">
				<div class="flex justify-between items-center">
					<span class="text-[10px] uppercase font-bold text-ether/70 tracking-wider">Modo de Rolagem</span>
					{#if modifiers.forcedRollType !== null}
						<span class="text-[9px] font-bold text-purple-runic flex items-center gap-0.5 animate-pulse">
							🔒 FORÇADO POR STATUS
						</span>
					{/if}
				</div>
				<div class="grid grid-cols-3 gap-2">
					<button
						type="button"
						disabled={modifiers.forcedRollType !== null}
						class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all duration-200
							{displayRollType === 'Normal' 
								? 'bg-ruin border-ether/40 text-bone' 
								: 'bg-void/40 border-bronze/30 text-bone/50 hover:border-bronze hover:text-bone'}
							disabled:opacity-50"
						onclick={() => setRollType("Normal")}
					>
						Normal
					</button>
					<button
						type="button"
						disabled={modifiers.forcedRollType !== null}
						class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all duration-200
							{displayRollType === 'Vantagem' 
								? 'bg-emerald-poison/15 border-emerald-poison text-emerald-poison shadow-[0_0_8px_rgba(16,185,129,0.15)]' 
								: 'bg-void/40 border-bronze/30 text-bone/50 hover:border-bronze hover:text-bone'}
							disabled:opacity-50"
						onclick={() => setRollType("Vantagem")}
					>
						Vantagem
					</button>
					<button
						type="button"
						disabled={modifiers.forcedRollType !== null}
						class="px-2 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all duration-200
							{displayRollType === 'Desvantagem' 
								? 'bg-blood-shadow/20 border-blood text-blood shadow-[0_0_8px_rgba(220,38,38,0.15)]' 
								: 'bg-void/40 border-bronze/30 text-bone/50 hover:border-bronze hover:text-bone'}
							disabled:opacity-50"
						onclick={() => setRollType("Desvantagem")}
					>
						Desvantagem
					</button>
				</div>
			</div>

			<!-- Ajuste de Bônus Numérico -->
			<div class="flex flex-col gap-2 mt-1">
				<div class="flex items-center justify-between gap-4">
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

				{#if modifiers.statusBonus !== 0}
					<div class="flex justify-between items-center text-[10px] bg-purple-runic/5 border border-purple-runic/25 px-2.5 py-1.5 rounded-sm">
						<span class="text-ether/80 font-medium">Bônus de Status Ativo:</span>
						<span class="font-bold text-purple-runic">+{modifiers.statusBonus}</span>
					</div>
				{/if}
			</div>

			<!-- Status Ativos do Personagem Focado -->
			{#if chatState.activeCharacterName}
				<div class="border-t border-bronze/20 pt-2 flex flex-col gap-1.5">
					<span class="text-[10px] uppercase font-bold text-ether/70 tracking-wider">
						Status: {chatState.activeCharacterName}
					</span>
					
					{#if chatState.activeStatusEffects.length > 0}
						<div class="flex flex-wrap gap-1.5">
							{#each chatState.activeStatusEffects as effect}
								{@const isAffecting = modifiers.appliedEffects.includes(effect.label)}
								<span 
									class="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold border rounded-sm transition-all duration-300
										{isAffecting 
											? 'border-purple-runic bg-purple-runic/15 text-purple-runic shadow-[0_0_6px_rgba(139,92,246,0.15)]' 
											: 'border-bronze/30 bg-void/50 text-ether/40'}"
									title={isAffecting ? 'Afetando a rolagem deste atributo' : 'Não afeta este atributo'}
								>
									{isAffecting ? '🔥' : '🔒'} {effect.label}
								</span>
							{/each}
						</div>
					{:else}
						<span class="text-[10px] italic text-ether/55">Nenhum status ativo afetando o personagem.</span>
					{/if}
				</div>
			{/if}

			<!-- Botão de Rolagem Direta -->
			{#if chatState.activeCharacterName && selectedAttribute}
				<button
					type="button"
					onclick={rollD20}
					class="w-full text-center py-2 bg-ether border border-ether text-void hover:bg-void hover:text-ether transition-all duration-300 font-extrabold uppercase tracking-wider text-xs rounded shadow-[0_0_10px_rgba(0,240,255,0.15)]"
				>
					🎲 Rolar d20 ({selectedAttribute})
				</button>
			{/if}

			<!-- Botão de Limpar -->
			{#if chatState.rollType !== 'Normal' || chatState.customBonus !== 0 || selectedAttribute !== ''}
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
