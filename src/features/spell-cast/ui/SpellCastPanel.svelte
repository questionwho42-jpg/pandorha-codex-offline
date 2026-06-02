<script lang="ts">
import type { SpellRecord } from "$lib/entities/spell";
import type { Result } from "$lib/shared/lib/result";
import type {
	SpellCastBuildResult,
	SpellCastFailure,
	SpellCastInput,
} from "../model/spellCastBuilderTypes";
import {
	createSpellCastPanelView,
	mapSpellCastFailureToMessage,
} from "../model/spellCastView";

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
	buildCastCommand: (
		input: unknown,
	) => Promise<Result<SpellCastBuildResult, SpellCastFailure>>;
	caster: SpellCastActor;
	createCastInput: (spellId: string) => SpellCastInput;
	spells: readonly SpellRecord[];
	target: SpellCastTarget;
};

let {
	buildCastCommand,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	caster,
	createCastInput,
	spells,
	target,
}: Props = $props();

// svelte-ignore state_referenced_locally: fixed training spell catalog props are intentionally captured for the initial selected spell.
let selectedSpellId = $state(spells[0]?.id ?? "");
let buildResult = $state<SpellCastBuildResult | null>(null);
let errorMessage = $state<string | null>(null);
// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
let isPreparing = $state(false);

let view = $derived(
	createSpellCastPanelView({
		spells,
		selectedSpellId,
		targetLabel: target.label,
		buildResult,
		errorMessage,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectSpell(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedSpellId = event.currentTarget.value;
	buildResult = null;
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
async function prepareCast(): Promise<void> {
	if (!view.canPrepare) {
		return;
	}

	isPreparing = true;
	const result = await buildCastCommand(createCastInput(selectedSpellId));
	isPreparing = false;

	if (!result.success) {
		errorMessage = mapSpellCastFailureToMessage(result.error);
		buildResult = null;
		return;
	}

	buildResult = result.data;
	errorMessage = null;
}
</script>

<section aria-labelledby="spell-cast-title" data-testid="spell-cast-panel">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Magia</p>
			<h2 id="spell-cast-title" class="mt-2 text-2xl font-semibold text-bone">
				Conjuração de treino
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Prepare um comando de magia sem gastar EE, rolar ataque ou aplicar efeito.
			</p>
		</div>
		<p class="text-sm font-semibold text-ether" data-testid="spell-cast-caster">
			{caster.label} · {caster.availableEther} EE
		</p>
	</div>

	<div class="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
		<label class="block">
			<span class="text-sm font-semibold text-ether">Magia</span>
			<select
				bind:value={selectedSpellId}
				onchange={selectSpell}
				data-testid="spell-cast-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
			>
				{#each view.spellOptions as option}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</label>

		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Alvo fixo</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="spell-cast-target"
			>
				{view.targetLabel}
			</p>
		</div>
	</div>

	<div class="mt-6 grid gap-3 md:grid-cols-4">
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Custo</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="spell-cast-cost"
			>
				{view.costLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Componentes</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="spell-cast-components"
			>
				{view.componentsLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Resolução</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="spell-cast-resolution"
			>
				{view.resolutionLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Estado</p>
			<p class="mt-1 text-lg font-semibold text-bone">Preparação</p>
		</div>
	</div>

	<div class="mt-6 border border-bronze bg-blood-shadow px-5 py-5">
		<h3
			class="text-lg font-semibold text-bone"
			data-testid="spell-cast-spell-title"
		>
			{view.selectedSpellLabel}
		</h3>
		<p class="mt-3 leading-7 text-bone" data-testid="spell-cast-summary">
			{view.summary}
		</p>
		<p
			class="mt-3 text-sm font-semibold text-ether"
			data-testid="spell-cast-source"
		>
			{view.sourceLabel}
		</p>
	</div>

	<div class="mt-6 flex flex-wrap items-center gap-3">
		<button
			type="button"
			disabled={!view.canPrepare || isPreparing}
			onclick={prepareCast}
			data-testid="spell-cast-prepare-button"
			class="border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-colors hover:border-bone hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-ruin disabled:text-bone"
		>
			{isPreparing ? "Preparando..." : "Preparar conjuração"}
		</button>
		<p class="text-sm text-bone">{view.initialInstruction}</p>
	</div>

	{#if view.errorMessage}
		<div
			class="mt-5 border border-bronze bg-blood-shadow px-4 py-3 text-bone"
			data-testid="spell-cast-error"
		>
			{view.errorMessage}
		</div>
	{/if}

	{#if view.resultTitle && view.resultDescription}
		<div
			class="mt-5 border border-ether bg-blood-shadow px-5 py-4"
			data-testid="spell-cast-result"
		>
			<p class="text-sm font-semibold text-ether">{view.resultTitle}</p>
			<p class="mt-2 leading-7 text-bone">{view.resultDescription}</p>
		</div>
	{/if}
</section>
