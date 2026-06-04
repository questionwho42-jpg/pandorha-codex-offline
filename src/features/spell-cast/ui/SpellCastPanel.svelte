<script lang="ts">
import type { SpellRecord } from "$lib/entities/spell";
import type { Result } from "$lib/shared/lib/result";

type SpellCastActor = {
	readonly availableEther: number;
	readonly id: string;
	readonly label: string;
};

type SpellCastTarget = {
	readonly id: string;
	readonly label: string;
};

type Props = {
	caster: SpellCastActor;
	spells: readonly SpellRecord[];
	targets: readonly SpellCastTarget[];
	onCastSpell: (payload: {
		casterId: string;
		targetId: string;
		spellId: string;
		upcastLevel: number;
	}) => Promise<Result<unknown, { code: string; message: string }>>;
};

let { caster, spells, targets, onCastSpell }: Props = $props();

// UI State Runes (Svelte 5)
let selectedSpellId = $state(spells[0]?.id ?? "");
let selectedTargetId = $state(targets[0]?.id ?? "");
let upcastLevel = $state(0);
let selectedMetamagics = $state<string[]>([]);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isCasting = $state(false);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let errorMessage = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let successMessage = $state<string | null>(null);

// Derived states
let selectedSpell = $derived(
	spells.find((s) => s.id === selectedSpellId) ?? null,
);
let selectedTarget = $derived(
	targets.find((t) => t.id === selectedTargetId) ?? null,
);

// Calculate Metamagic cost
let metamagicCost = $derived.by(() => {
	if (selectedMetamagics.includes("distant-spell")) return 1;
	if (selectedMetamagics.includes("resonant-spell")) return 2;
	if (selectedMetamagics.includes("echoing-spell")) return 4;
	return 0;
});

// Calculate maximum upcast level based on caster's available EE
let maxUpcastLevel = $derived.by(() => {
	if (!selectedSpell) return 0;
	const formula = selectedSpell.upcastFormula;
	if (!formula || formula.etherCostPerCircle <= 0) return 0;

	const available = caster.availableEther;
	const baseCost = selectedSpell.etherCost;
	const remaining = available - baseCost - metamagicCost;
	if (remaining < 0) return 0;

	return Math.floor(remaining / formula.etherCostPerCircle);
});

// Reset upcast level when selected spell changes
$effect(() => {
	// Register dependencies
	selectedSpellId;
	upcastLevel = 0;
});

// Reset upcast level if metamagic cost causes available EE to exceed limit
$effect(() => {
	if (upcastLevel > maxUpcastLevel) {
		upcastLevel = maxUpcastLevel;
	}
});

// Calculate total cost (base cost + upcast cost + metamagic)
let totalCost = $derived.by(() => {
	if (!selectedSpell) return 0;
	const formula = selectedSpell.upcastFormula;
	const upcastCost = formula ? upcastLevel * formula.etherCostPerCircle : 0;
	return selectedSpell.etherCost + upcastCost + metamagicCost;
});

// Duration of status effect (base duration + upcast increase)
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let finalDuration = $derived.by(() => {
	if (!selectedSpell) return 0;
	const formula = selectedSpell.upcastFormula;
	const increase = formula
		? upcastLevel * formula.durationIncreasePerCircle
		: 0;
	return selectedSpell.baseDuration + increase;
});

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function toggleMetamagic(id: string, checked: boolean): void {
	if (checked) {
		selectedMetamagics = [id];
	} else {
		selectedMetamagics = [];
	}
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function handleCast(): Promise<void> {
	if (!selectedSpell || !selectedTarget) return;

	isCasting = true;
	errorMessage = null;
	successMessage = null;

	const result = await onCastSpell({
		casterId: caster.id,
		targetId: selectedTarget.id,
		spellId: selectedSpell.id,
		upcastLevel: upcastLevel,
	});

	isCasting = false;

	if (result.success) {
		const targetLabel = selectedTarget.label;
		const spellLabel = selectedSpell.label;
		successMessage = `Magia [${spellLabel}] conjurada com sucesso em [${targetLabel}]! Custo total: ${totalCost} EE. Efeitos de status aplicados no banco local.`;
		errorMessage = null;
	} else {
		errorMessage = result.error.message;
		successMessage = null;
	}
}
</script>

<section aria-labelledby="spell-cast-title" data-testid="spell-cast-panel" class="p-6 bg-ruin/5 border border-bronze/30 rounded-xl backdrop-blur-md">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-bold uppercase tracking-wider text-ether">Grimório & Conjunção</p>
			<h2 id="spell-cast-title" class="mt-2 text-3xl font-bold text-bone">
				Painel de Conjunção Operacional
			</h2>
			<p class="mt-3 max-w-3xl text-sm leading-relaxed text-bone/80">
				Amplie suas magias através de Upcast e aplique efeitos de status persistidos diretamente nos alvos selecionados no banco SQLite local.
			</p>
		</div>
		<div class="text-right">
			<p class="text-xs font-semibold text-bone/60 uppercase tracking-widest">Conjurador Ativo</p>
			<p class="mt-1 text-base font-bold text-ether" data-testid="spell-cast-caster">
				{caster.label} · {caster.availableEther} EE Disponível
			</p>
		</div>
	</div>

	<!-- Visual Circles Stack -->
	{#if selectedSpell}
		<div class="mt-6 flex flex-col items-center justify-center py-8 border border-bronze/20 bg-void/40 rounded-xl relative overflow-hidden">
			<!-- Background ether glow -->
			<div class="absolute w-48 h-48 rounded-full bg-ether/5 blur-3xl pointer-events-none"></div>
			
			<p class="text-xs font-semibold uppercase tracking-widest text-ether mb-4">Círculos de Conjunção Rúnica</p>
			
			<!-- Visual stack of circles -->
			<div class="relative flex items-center justify-center h-32 w-full select-none pointer-events-none">
				<div class="relative flex items-center justify-center">
					<!-- Outer Upcast circles, looping to render nested rings -->
					{#if upcastLevel > 0}
						{#each Array(upcastLevel) as _, i}
							<div 
								class="absolute rounded-full border-2 border-dashed border-ether/40 animate-spin"
								style="width: {90 + (i + 1) * 28}px; height: {90 + (i + 1) * 28}px; animation-duration: {15 + i * 5}s; animation-direction: {i % 2 === 0 ? 'normal' : 'reverse'}"
							></div>
						{/each}
					{/if}
					
					<!-- Base circle -->
					<div class="z-10 flex flex-col items-center justify-center rounded-full bg-void border-2 border-ether shadow-[0_0_25px_rgba(var(--color-ether-rgb,114,137,218),0.4)] w-20 h-20 transition-all duration-300">
						<span class="text-ether font-extrabold text-2xl tracking-tighter">
							{selectedSpell.circle === 0 ? "T" : selectedSpell.circle + upcastLevel}
						</span>
						<span class="text-[9px] uppercase tracking-wider font-semibold text-bone/60 -mt-0.5">
							{selectedSpell.circle === 0 ? "Truque" : "Círculo"}
						</span>
					</div>
				</div>
			</div>
			
			<p class="text-xs font-semibold text-bone/70 mt-4">
				{#if selectedSpell.circle === 0}
					Truque Base (Círculo 0) - Não amplificável
				{:else}
					Círculo {selectedSpell.circle} Base + {upcastLevel} Amplificação = Círculo {selectedSpell.circle + upcastLevel}
				{/if}
			</p>
		</div>
	{/if}

	<div class="mt-6 grid gap-5 md:grid-cols-2">
		<!-- Spell Selector -->
		<label class="block">
			<span class="text-xs font-bold uppercase tracking-wider text-ether">Magia Selecionada</span>
			<select
				bind:value={selectedSpellId}
				data-testid="spell-cast-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-4 py-2.5 rounded text-bone outline-none focus:border-ether font-semibold transition-colors cursor-pointer"
			>
				{#each spells as spell}
					<option value={spell.id}>{spell.label} (Círculo {spell.circle})</option>
				{/each}
			</select>
		</label>

		<!-- Target Selector -->
		<label class="block">
			<span class="text-xs font-bold uppercase tracking-wider text-ether">Alvo da Magia</span>
			<select
				bind:value={selectedTargetId}
				data-testid="spell-cast-target-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-4 py-2.5 rounded text-bone outline-none focus:border-ether font-semibold transition-colors cursor-pointer"
			>
				{#each targets as t}
					<option value={t.id}>{t.label}</option>
				{/each}
			</select>
		</label>
	</div>

	<!-- Upcast Control Slider -->
	{#if selectedSpell && selectedSpell.upcastFormula && selectedSpell.upcastFormula.etherCostPerCircle > 0}
		<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-4 rounded-lg">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
				<div>
					<p class="text-sm font-semibold text-ether">Amplificação Etérica (Upcast)</p>
					<p class="text-xs text-bone/70 mt-1 leading-relaxed font-semibold">
						Aumente o círculo da magia para intensificar seus efeitos e aumentar a duração dos status.
					</p>
				</div>
				<div class="text-right">
					<span class="text-xs font-bold text-ether bg-ether/10 border border-ether/30 px-3 py-1 rounded">
						+{upcastLevel} Círculo{upcastLevel !== 1 ? 's' : ''}
					</span>
				</div>
			</div>
			
			<div class="mt-4 flex items-center gap-4">
				<span class="text-xs text-bone/50 font-bold">Base</span>
				<input 
					type="range" 
					min="0" 
					max={maxUpcastLevel} 
					bind:value={upcastLevel}
					disabled={maxUpcastLevel === 0}
					class="flex-1 accent-ether cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
				/>
				<span class="text-xs text-bone/50 font-bold">Máximo (+{maxUpcastLevel})</span>
			</div>
			
			<div class="mt-3 flex justify-between text-xs font-semibold text-bone/60">
				<span>Custo Adicional: +{upcastLevel * selectedSpell.upcastFormula.etherCostPerCircle} EE</span>
				<span>Duração Adicional: +{upcastLevel * selectedSpell.upcastFormula.durationIncreasePerCircle} Rodada{upcastLevel * selectedSpell.upcastFormula.durationIncreasePerCircle !== 1 ? 's' : ''}</span>
			</div>
		</div>
	{/if}

	<!-- Metamagic Section -->
	<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-4 rounded-lg">
		<p class="text-sm font-semibold text-ether">Metamagias Aplicadas (As Quebras)</p>
		<p class="text-xs text-bone/70 mt-1 mb-4 leading-relaxed font-semibold">
			Selecione uma metamagia universal para alterar as propriedades físicas e o custo etérico da conjuração (limite de 1 ativa):
		</p>
		<div class="grid gap-3 sm:grid-cols-3">
			<label class="flex items-start gap-3 rounded border border-bronze/40 bg-void/30 p-3 hover:border-ether/60 cursor-pointer transition-all">
				<input
					type="checkbox"
					value="distant-spell"
					checked={selectedMetamagics.includes("distant-spell")}
					onchange={(e) => toggleMetamagic("distant-spell", e.currentTarget.checked)}
					class="mt-1 accent-ether"
				/>
				<div>
					<p class="text-sm font-semibold text-bone">Extensa (Sniper)</p>
					<p class="text-xs text-bone/60 mt-0.5 font-medium">+1 EE · Duplica alcance</p>
				</div>
			</label>
			<label class="flex items-start gap-3 rounded border border-bronze/40 bg-void/30 p-3 hover:border-ether/60 cursor-pointer transition-all">
				<input
					type="checkbox"
					value="resonant-spell"
					checked={selectedMetamagics.includes("resonant-spell")}
					onchange={(e) => toggleMetamagic("resonant-spell", e.currentTarget.checked)}
					class="mt-1 accent-ether"
				/>
				<div>
					<p class="text-sm font-semibold text-bone">Ressonante (Multiplicadora)</p>
					<p class="text-xs text-bone/60 mt-0.5 font-medium">+2 EE · Multiplica cura</p>
				</div>
			</label>
			<label class="flex items-start gap-3 rounded border border-bronze/40 bg-void/30 p-3 hover:border-ether/60 cursor-pointer transition-all">
				<input
					type="checkbox"
					value="echoing-spell"
					checked={selectedMetamagics.includes("echoing-spell")}
					onchange={(e) => toggleMetamagic("echoing-spell", e.currentTarget.checked)}
					class="mt-1 accent-ether"
				/>
				<div>
					<p class="text-sm font-semibold text-bone">Ecoante (Repetição)</p>
					<p class="text-xs text-bone/60 mt-0.5 font-medium">+4 EE · Repete feitiço</p>
				</div>
			</label>
		</div>
	</div>

	<!-- Recalculated Spell Properties Grid -->
	<div class="mt-6 grid gap-3 md:grid-cols-4">
		<div class="border border-bronze bg-blood-shadow px-4 py-3 rounded">
			<p class="text-xs font-semibold text-ether uppercase tracking-wider">Custo Total</p>
			<p class="mt-1 text-lg font-bold text-bone" data-testid="spell-cast-cost">
				{totalCost} EE
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3 rounded">
			<p class="text-xs font-semibold text-ether uppercase tracking-wider">Componentes</p>
			<p class="mt-1 text-base font-bold text-bone">
				{selectedSpell ? selectedSpell.components.join(", ") : "-"}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3 rounded">
			<p class="text-xs font-semibold text-ether uppercase tracking-wider">Efeitos de Status</p>
			<p class="mt-1 text-base font-bold text-bone">
				{#if selectedSpell && selectedSpell.targetEffects.length > 0}
					{selectedSpell.targetEffects.join(", ")} ({finalDuration} rodada{finalDuration !== 1 ? 's' : ''})
				{:else}
					Nenhum
				{/if}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3 rounded">
			<p class="text-xs font-semibold text-ether uppercase tracking-wider">Resolução</p>
			<p class="mt-1 text-xs font-bold text-bone leading-tight">
				{#if selectedSpell}
					{#if selectedSpell.requiresAttackRoll && selectedSpell.requiresSavingThrow}
						Ataque Mágico & Resistência
					{:else if selectedSpell.requiresAttackRoll}
						Ataque Mágico d20
					{:else if selectedSpell.requiresSavingThrow}
						Teste de Resistência
					{:else}
						Acerto Automático
					{/if}
				{:else}
					-
				{/if}
			</p>
		</div>
	</div>

	<!-- Spell Description Card -->
	{#if selectedSpell}
		<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-5 rounded-lg">
			<h3 class="text-lg font-bold text-bone" data-testid="spell-cast-spell-title">
				{selectedSpell.label}
			</h3>
			<p class="mt-3 text-sm leading-relaxed text-bone/90" data-testid="spell-cast-summary">
				{selectedSpell.summary}
			</p>
			<p class="mt-3 text-xs font-semibold text-ether/85" data-testid="spell-cast-source">
				Fonte: {selectedSpell.sourceFile}
			</p>
		</div>
	{/if}

	<!-- Cast Action Block -->
	<div class="mt-6 flex flex-wrap items-center gap-4">
		<button
			type="button"
			disabled={!selectedSpell || !selectedTarget || isCasting || caster.availableEther < totalCost}
			onclick={handleCast}
			data-testid="spell-cast-button"
			class="border border-ether bg-ether px-6 py-2.5 text-sm font-bold text-void rounded transition-all hover:bg-bone hover:border-bone disabled:border-bronze disabled:bg-ruin disabled:text-bone/50 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider"
		>
			{isCasting ? "Conjurando..." : "Conjurar Magia"}
		</button>
		
		{#if selectedSpell && caster.availableEther < totalCost}
			<p class="text-sm text-[#f87171] font-bold">
				Esforço Extra (EE) insuficiente para esta conjuração.
			</p>
		{:else}
			<p class="text-xs font-semibold text-bone/60">
				Consumirá {totalCost} EE e aplicará os status correspondentes no alvo.
			</p>
		{/if}
	</div>

	<!-- Messages Feedback -->
	{#if errorMessage}
		<div
			class="mt-5 border border-[#ef4444]/40 bg-[#450a0a]/20 px-4 py-3 rounded text-sm text-bone font-medium"
			data-testid="spell-cast-error"
		>
			❌ Erro: {errorMessage}
		</div>
	{/if}

	{#if successMessage}
		<div
			class="mt-5 border border-[#10b981]/40 bg-[#022c22]/20 px-5 py-4 rounded text-sm text-bone font-medium"
			data-testid="spell-cast-result"
		>
			✨ {successMessage}
		</div>
	{/if}
</section>
