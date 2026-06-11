<script lang="ts">
import { fade } from "svelte/transition";
import type { SpellRecord } from "$lib/entities/spell";
import type { Result } from "$lib/shared/lib/result";
import type {
	SpellCastBuildResult,
	SpellCastFailure,
} from "../model/spellCastBuilderTypes";

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
		metamagicIds: string[];
	}) => Promise<Result<unknown, { code: string; message: string }>>;
	buildCastCommand: (
		input: any,
	) => Promise<Result<SpellCastBuildResult, SpellCastFailure>>;
};

let props: Props = $props();

const caster = $derived(props.caster);
const spells = $derived(props.spells);
const targets = $derived(props.targets);
const onCastSpell = $derived(props.onCastSpell);
const buildCastCommand = $derived(props.buildCastCommand);

// Wizard Steps: 'Draft' | 'Weaving' | 'Audit' | 'Commit'
let currentStep = $state<"Draft" | "Weaving" | "Audit" | "Commit">("Draft");

// UI State Runes (Svelte 5)
const initialSpellId = props.spells[0]?.id ?? "";
const initialTargetId = props.targets[0]?.id ?? "";
let selectedSpellId = $state(initialSpellId);
let selectedTargetId = $state(initialTargetId);
let upcastLevel = $state(0);
let selectedMetamagics = $state<string[]>([]);
let isCasting = $state(false);
let errorMessage = $state<string | null>(null);
let successMessage = $state<string | null>(null);
let auditResult = $state<SpellCastBuildResult | null>(null);

// Derived states
let selectedSpell = $derived(
	spells.find((s) => s.id === selectedSpellId) ?? null,
);
let selectedTarget = $derived(
	targets.find((t) => t.id === selectedTargetId) ?? null,
);

// Calculate Metamagic cost
let metamagicCost = $derived.by(() => {
	let cost = 0;
	for (const id of selectedMetamagics) {
		if (id === "distant-spell" || id === "subtle-spell") cost += 1;
		else if (
			id === "resonant-spell" ||
			id === "bulwark-spell" ||
			id === "echoing-spell"
		)
			cost += 2;
		else if (id === "vampiric-spell") cost += 3;
		else if (id === "twin-spell") {
			cost += selectedSpell ? Math.max(1, selectedSpell.etherCost) : 1;
		}
	}
	return cost;
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
let finalDuration = $derived.by(() => {
	if (!selectedSpell) return 0;
	const formula = selectedSpell.upcastFormula;
	const increase = formula
		? upcastLevel * formula.durationIncreasePerCircle
		: 0;
	return selectedSpell.baseDuration + increase;
});

// Metamagic handler
function toggleMetamagic(id: string, checked: boolean): void {
	if (checked) {
		// Limit to 1 active metamagic for simplicity and balance
		selectedMetamagics = [id];
	} else {
		selectedMetamagics = [];
	}
}

// State Machine Navigation
function startWeaving() {
	if (!selectedSpell || !selectedTarget) return;
	errorMessage = null;
	currentStep = "Weaving";
}

async function runAudit() {
	if (!selectedSpell || !selectedTarget) return;
	errorMessage = null;
	currentStep = "Audit";

	// Invoca o SpellCastBuilderService via prop para auditar
	const payload = {
		commandId: `audit-cast-${Date.now()}`,
		casterId: caster.id,
		targetId: selectedTarget.id,
		spellId: selectedSpell.id,
		availableEther: caster.availableEther,
		metamagicIds: selectedMetamagics,
		createdAt: new Date().toISOString(),
	};

	const result = await buildCastCommand(payload);
	if (result.success) {
		auditResult = result.data;
		errorMessage = null;
	} else {
		auditResult = null;
		errorMessage = result.error.message;
	}
}

async function handleCommit() {
	if (!selectedSpell || !selectedTarget) return;

	isCasting = true;
	errorMessage = null;
	successMessage = null;
	currentStep = "Commit";

	const result = await onCastSpell({
		casterId: caster.id,
		targetId: selectedTarget.id,
		spellId: selectedSpell.id,
		upcastLevel: upcastLevel,
		metamagicIds: selectedMetamagics,
	});

	isCasting = false;

	if (result.success) {
		const targetLabel = selectedTarget.label;
		const spellLabel = selectedSpell.label;
		successMessage = `Magia [${spellLabel}] conjurada com sucesso em [${targetLabel}]! Efeitos aplicados no banco local.`;
		errorMessage = null;
	} else {
		errorMessage = result.error.message;
		successMessage = null;
	}
}

function resetWizard() {
	currentStep = "Draft";
	upcastLevel = 0;
	selectedMetamagics = [];
	errorMessage = null;
	successMessage = null;
	auditResult = null;
}
</script>

<section aria-labelledby="spellbook-title" data-testid="spellbook-panel" class="p-6 bg-ruin/5 border border-bronze/30 rounded-xl backdrop-blur-md text-bone flex flex-col gap-6">
	<!-- Cabeçalho -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-bronze/20 pb-4">
		<div>
			<p class="text-sm font-bold uppercase tracking-wider text-ether">Grimório & Conjunção Rúnica</p>
			<h2 id="spellbook-title" class="text-2xl font-bold text-bone">
				Teia de Conjunção Espiritual
			</h2>
		</div>
		<div class="text-right">
			<span class="text-xs text-bone/60 uppercase font-mono tracking-widest block">Conjurador Ativo</span>
			<span class="text-sm font-bold text-ether" data-testid="caster-ether-display">
				{caster.label} · {caster.availableEther} EE
			</span>
		</div>
	</div>

	<!-- Barra de Progresso Rúnica dos Passos -->
	<div class="flex justify-between items-center bg-void/50 border border-bronze/20 rounded p-3 select-none">
		<span class="text-xs font-bold font-mono tracking-widest px-2.5 py-1 rounded transition-all
			{currentStep === 'Draft' ? 'bg-ether/20 text-ether border border-ether/40' : 'text-bone/45'}">
			1. DRAFT (ESBOÇO)
		</span>
		<span class="text-bone/20 font-bold">➔</span>
		<span class="text-xs font-bold font-mono tracking-widest px-2.5 py-1 rounded transition-all
			{currentStep === 'Weaving' ? 'bg-purple-runic/20 text-purple-runic border border-purple-runic/40' : 'text-bone/45'}">
			2. WEAVING (TECITURA)
		</span>
		<span class="text-bone/20 font-bold">➔</span>
		<span class="text-xs font-bold font-mono tracking-widest px-2.5 py-1 rounded transition-all
			{currentStep === 'Audit' ? 'bg-orange-hungry/20 text-orange-hungry border border-orange-hungry/40' : 'text-bone/45'}">
			3. AUDIT (AUDITORIA)
		</span>
		<span class="text-bone/20 font-bold">➔</span>
		<span class="text-xs font-bold font-mono tracking-widest px-2.5 py-1 rounded transition-all
			{currentStep === 'Commit' ? 'bg-emerald-poison/20 text-emerald-poison border border-emerald-poison/40' : 'text-bone/45'}">
			4. COMMIT (CONJURAÇÃO)
		</span>
	</div>

	<!-- Conteúdo dos Passos -->
	{#if currentStep === "Draft"}
		<!-- Passo 1: Draft -->
		<div class="flex flex-col gap-6" in:fade>
			<div class="grid gap-6 md:grid-cols-[1fr_280px]">
				<!-- Lista de Magias -->
				<div class="flex flex-col gap-3">
					<h3 class="text-sm font-bold uppercase tracking-wider text-ether">Selecione o Feitiço do Grimório</h3>
					<div class="grid gap-3 sm:grid-cols-2 max-h-[300px] overflow-y-auto pr-1">
						{#each spells as spell}
							<button
								type="button"
								class="border p-3 rounded text-left transition-all hover:bg-ruin/5 flex flex-col gap-1 cursor-pointer
									{selectedSpellId === spell.id ? 'border-ether bg-ether/5 shadow-[0_0_10px_rgba(218,185,115,0.15)]' : 'border-bronze/25 bg-void/30'}"
								onclick={() => selectedSpellId = spell.id}
								data-testid="spell-card-{spell.id}"
							>
								<div class="flex justify-between items-center">
									<span class="text-xs font-bold text-bone">{spell.label}</span>
									<span class="text-[9px] px-1.5 py-0.5 border border-bronze/35 rounded text-ether uppercase font-mono">
										Círculo {spell.circle}
									</span>
								</div>
								<p class="text-[10px] text-bone/60 leading-relaxed truncate max-w-full">{spell.summary}</p>
							</button>
						{/each}
					</div>
				</div>

				<!-- Detalhes e Alvo -->
				<div class="border border-bronze/30 bg-void/40 p-4 rounded flex flex-col gap-4 justify-between">
					<div class="flex flex-col gap-3">
						<label class="block">
							<span class="text-xs font-bold uppercase tracking-wider text-ether">Alvo da Magia</span>
							<select
								bind:value={selectedTargetId}
								data-testid="spellbook-target-select"
								class="mt-2 w-full border border-bronze/30 bg-void px-3 py-2 rounded text-bone outline-none focus:border-ether text-xs font-semibold cursor-pointer"
							>
								{#each targets as t}
									<option value={t.id}>{t.label}</option>
								{/each}
							</select>
						</label>

						{#if selectedSpell}
							<div class="border-t border-bronze/20 pt-3 flex flex-col gap-1.5">
								<h4 class="text-xs font-bold text-bone">{selectedSpell.label}</h4>
								<p class="text-[10px] text-bone/60 leading-normal">{selectedSpell.summary}</p>
								<div class="flex justify-between text-[9px] font-mono text-ether mt-1">
									<span>Custo Base: {selectedSpell.etherCost} EE</span>
									<span>Duração: {selectedSpell.baseDuration} Rds</span>
								</div>
							</div>
						{/if}
					</div>

					<button
						type="button"
						onclick={startWeaving}
						disabled={!selectedSpell || !selectedTarget}
						data-testid="start-weaving-button"
						class="w-full py-2.5 rounded bg-ether text-void text-xs font-extrabold uppercase tracking-wider hover:bg-ether/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
					>
						✨ Iniciar Tecitura
					</button>
				</div>
			</div>
		</div>
	{:else if currentStep === "Weaving"}
		<!-- Passo 2: Weaving -->
		<div class="flex flex-col gap-6" in:fade>
			{#if selectedSpell}
				<div class="grid gap-6 md:grid-cols-2">
					<!-- Upcast and Cost recalculations -->
					<div class="flex flex-col gap-4">
						<h3 class="text-sm font-bold uppercase tracking-wider text-ether">Tecitura de Círculo e Energia</h3>

						{#if selectedSpell.upcastFormula && selectedSpell.upcastFormula.etherCostPerCircle > 0}
							<div class="border border-bronze/20 bg-void/50 p-4 rounded flex flex-col gap-3">
								<div class="flex justify-between items-center">
									<span class="text-xs font-bold text-bone">Amplificação Etérica (Upcast)</span>
									<span class="text-xs font-bold text-ether bg-ether/10 border border-ether/30 px-2 py-0.5 rounded">
										+{upcastLevel} Círculo{upcastLevel !== 1 ? 's' : ''}
									</span>
								</div>
								<input 
									type="range" 
									min="0" 
									max={maxUpcastLevel} 
									bind:value={upcastLevel}
									disabled={maxUpcastLevel === 0}
									class="w-full accent-ether cursor-pointer"
								/>
								<div class="flex justify-between text-[10px] text-bone/60 font-mono">
									<span>Custo Adicional: +{upcastLevel * selectedSpell.upcastFormula.etherCostPerCircle} EE</span>
									<span>Máximo possível: +{maxUpcastLevel}</span>
								</div>
							</div>
						{:else}
							<div class="border border-bronze/10 bg-void/20 p-4 rounded text-center text-xs text-bone/50 italic">
								Magia de Círculo 0 ou não amplificável.
							</div>
						{/if}

						<div class="border border-bronze/25 bg-void/50 p-4 rounded flex flex-col gap-3">
							<span class="text-xs font-bold text-bone">Recálculo de Conjuração</span>
							<div class="grid grid-cols-3 gap-2 text-center">
								<div class="bg-void/70 p-2 border border-bronze/10 rounded">
									<p class="text-[9px] uppercase tracking-wider text-bone/50">Custo Base</p>
									<p class="text-base font-bold text-bone font-mono">{selectedSpell.etherCost} EE</p>
								</div>
								<div class="bg-void/70 p-2 border border-bronze/10 rounded">
									<p class="text-[9px] uppercase tracking-wider text-bone/50">Upcast/Quebras</p>
									<p class="text-base font-bold text-bone font-mono">+{upcastLevel * (selectedSpell.upcastFormula?.etherCostPerCircle ?? 0) + metamagicCost} EE</p>
								</div>
								<div class="bg-void/70 p-2 border border-bronze/10 rounded">
									<p class="text-[9px] uppercase tracking-wider text-bone/50">Custo Final</p>
									<p class="text-base font-bold text-ether font-mono" data-testid="weaving-total-cost">{totalCost} EE</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Metamagic Selector -->
					<div class="flex flex-col gap-3 border border-bronze/30 bg-void/40 p-4 rounded justify-between">
						<div class="flex flex-col gap-3">
							<h3 class="text-xs font-bold uppercase tracking-wider text-ether">Metamagias Universais (As Quebras)</h3>
							<p class="text-[10px] text-bone/60">Tecer modificadores que alteram o alcance, alvos ou eficácia (limite de 1 ativa):</p>
							
							<div class="flex flex-col gap-2.5">
								<label class="flex items-start gap-3 rounded border border-bronze/20 bg-void/50 p-2.5 hover:border-ether/50 cursor-pointer">
									<input
										type="checkbox"
										value="distant-spell"
										checked={selectedMetamagics.includes("distant-spell")}
										onchange={(e) => toggleMetamagic("distant-spell", e.currentTarget.checked)}
										class="mt-0.5 accent-ether"
										data-testid="metamagic-checkbox-distant-spell"
									/>
									<div>
										<p class="text-xs font-bold text-bone">Distant (Extensa)</p>
										<p class="text-[9px] text-bone/60">+1 EE · Duplica alcance</p>
									</div>
								</label>

								<label class="flex items-start gap-3 rounded border border-bronze/20 bg-void/50 p-2.5 hover:border-ether/50 cursor-pointer">
									<input
										type="checkbox"
										value="resonant-spell"
										checked={selectedMetamagics.includes("resonant-spell")}
										onchange={(e) => toggleMetamagic("resonant-spell", e.currentTarget.checked)}
										class="mt-0.5 accent-ether"
										data-testid="metamagic-checkbox-resonant-spell"
									/>
									<div>
										<p class="text-xs font-bold text-bone">Resonant (Ressonante)</p>
										<p class="text-[9px] text-bone/60">+2 EE · Multiplica eficácia ou alvos</p>
									</div>
								</label>

								<label class="flex items-start gap-3 rounded border border-bronze/20 bg-void/50 p-2.5 hover:border-ether/50 cursor-pointer">
									<input
										type="checkbox"
										value="echoing-spell"
										checked={selectedMetamagics.includes("echoing-spell")}
										onchange={(e) => toggleMetamagic("echoing-spell", e.currentTarget.checked)}
										class="mt-0.5 accent-ether"
										data-testid="metamagic-checkbox-echoing-spell"
									/>
									<div>
										<p class="text-xs font-bold text-bone">Echoing (Ecoante)</p>
										<p class="text-[9px] text-bone/60">+4 EE · Repete efeito após 1 rodada</p>
									</div>
								</label>
							</div>
						</div>

						<div class="flex gap-3 mt-4 border-t border-bronze/20 pt-3">
							<button
								type="button"
								onclick={() => currentStep = "Draft"}
								class="flex-1 py-2 rounded border border-bronze/35 bg-void text-bone text-xs font-bold hover:bg-ruin/10 cursor-pointer"
							>
								Voltar
							</button>
							<button
								type="button"
								onclick={runAudit}
								class="flex-1 py-2 rounded bg-ether text-void text-xs font-extrabold uppercase tracking-wider hover:bg-ether/90 cursor-pointer transition-all"
								data-testid="run-audit-button"
							>
								Auditar Feitiço
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else if currentStep === "Audit"}
		<!-- Passo 3: Audit -->
		<div class="flex flex-col gap-4 border border-bronze/35 bg-void/50 p-5 rounded-lg" in:fade>
			<h3 class="text-sm font-bold uppercase tracking-wider text-ether border-b border-bronze/25 pb-2">
				🔍 Relatório de Auditoria Etérica (SpellCastBuilder)
			</h3>

			{#if errorMessage}
				<div class="border border-blood bg-blood-shadow/20 p-4 rounded flex flex-col gap-2 text-sm text-bone">
					<p class="font-bold text-blood">⚠️ Bloqueio de Conjuração Detectado</p>
					<p>{errorMessage}</p>
				</div>
			{:else if auditResult}
				<div class="grid gap-4 sm:grid-cols-2 text-xs leading-normal">
					<div class="flex flex-col gap-2 bg-void/30 p-3 rounded border border-bronze/10">
						<p class="font-bold text-ether">Propriedades Físicas:</p>
						<p>• <strong>Magia:</strong> {selectedSpell?.label} (Círculo {selectedSpell?.circle})</p>
						<p>• <strong>Alvo:</strong> {selectedTarget?.label}</p>
						<p>• <strong>Componentes:</strong> {selectedSpell?.components.join(", ")}</p>
						<p>• <strong>Resolução:</strong> 
							{#if selectedSpell?.requiresAttackRoll}Ataque Mágico d20{:else}Acerto Automático{/if}
						</p>
					</div>

					<div class="flex flex-col gap-2 bg-void/30 p-3 rounded border border-bronze/10">
						<p class="font-bold text-ether">Auditoria de Energia Etérica (EE):</p>
						<p>• <strong>Disponível no Andarilho:</strong> {auditResult.audit.availableEther} EE</p>
						<p>• <strong>Custo de Base:</strong> {auditResult.audit.baseEtherCost} EE</p>
						<p>• <strong>Custo de Metamagia/Upcast:</strong> {auditResult.audit.metamagicEtherCost} EE</p>
						<p class="border-t border-bronze/15 pt-1 font-bold text-bone">
							• Custo Total: {auditResult.audit.totalEtherCost} EE
						</p>
					</div>
				</div>

				<div class="text-[10px] text-bone/50 font-mono mt-2 bg-void/70 p-2 rounded">
					ID do Comando: {auditResult.command.id} · Token: Weaved & Validated successfully.
				</div>
			{:else}
				<p class="text-center py-6 text-xs text-bone/45 animate-pulse">Auditando fluxo etérico...</p>
			{/if}

			<div class="flex justify-end gap-3 mt-4 border-t border-bronze/20 pt-3">
				<button
					type="button"
					onclick={() => currentStep = "Weaving"}
					class="px-5 py-2 rounded border border-bronze/35 bg-void text-bone text-xs font-bold hover:bg-ruin/10 cursor-pointer"
				>
					Ajustar Tecitura
				</button>
				<button
					type="button"
					onclick={handleCommit}
					disabled={!!errorMessage || isCasting}
					data-testid="confirm-cast-button"
					class="px-5 py-2 rounded bg-emerald-poison/80 text-void text-xs font-extrabold uppercase tracking-wider hover:bg-emerald-poison disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
				>
					Confirmar Conjuração (Commit)
				</button>
			</div>
		</div>
	{:else if currentStep === "Commit"}
		<!-- Passo 4: Commit/Result -->
		<div class="flex flex-col gap-5 border border-bronze/30 bg-void/45 p-6 rounded-lg text-center items-center" in:fade>
			{#if isCasting}
				<div class="h-10 w-10 animate-spin rounded-full border-4 border-ether border-t-transparent mb-2"></div>
				<h3 class="text-lg font-bold text-ether animate-pulse">Trazendo o Feitiço da Realidade...</h3>
				<p class="text-xs text-bone/60">Sincronizando banco SQLite e aplicando modificadores rúnicos...</p>
			{:else}
				{#if errorMessage}
					<span class="text-5xl">💥</span>
					<h3 class="text-lg font-bold text-blood mt-2">Falha na Conjuração</h3>
					<p class="text-xs text-bone/80 mt-1 max-w-md">{errorMessage}</p>
				{:else}
					<span class="text-5xl animate-bounce">✨</span>
					<h3 class="text-lg font-bold text-emerald-poison mt-2" data-testid="cast-success-message">Magia Conjurada com Sucesso!</h3>
					<p class="text-xs text-bone/80 mt-1 max-w-md">{successMessage}</p>
				{/if}

				<button
					type="button"
					onclick={resetWizard}
					class="mt-4 px-6 py-2 rounded bg-ether text-void text-xs font-bold uppercase tracking-wider hover:bg-ether/90 cursor-pointer"
				>
					Nova Conjuração
				</button>
			{/if}
		</div>
	{/if}
</section>
