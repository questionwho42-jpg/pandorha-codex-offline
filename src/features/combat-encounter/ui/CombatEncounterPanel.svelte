<script lang="ts">
import type {
	CombatEncounterActorRef,
	CombatEncounterFailure,
	CombatEncounterInput,
	CombatEncounterState,
} from "../model/combatEncounterTypes";
import {
	type CombatEncounterView,
	createCombatEncounterView,
} from "../model/combatEncounterView";
import {
	type CombatTrainingTarget,
	findTrainingTargetById,
} from "../model/combatTrainingTargetCatalog";

type Props = {
	attacker: CombatEncounterActorRef;
	createAttackInput: (
		target: CombatTrainingTarget,
		targetHitPoints: number,
	) => CombatEncounterInput;
	initialTarget: CombatTrainingTarget;
	resolveAttack: (
		input: CombatEncounterInput,
	) => ReturnType<CombatEncounterStateResolver>;
	trainingTargets: readonly CombatTrainingTarget[];
};

type CombatEncounterStateResolver = (
	input: CombatEncounterInput,
) =>
	| { readonly success: true; readonly data: CombatEncounterState }
	| { readonly success: false; readonly error: CombatEncounterFailure };

let {
	attacker,
	createAttackInput,
	initialTarget,
	resolveAttack,
	// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
	trainingTargets,
}: Props = $props();

// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for reset.
let targetHitPoints = $state(getInitialTargetHitPoints(initialTarget));
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected target.
let selectedTargetId = $state(initialTarget.id);
let lastState = $state<CombatEncounterState | null>(null);
let errorMessage = $state<string | null>(null);
let log = $state<readonly string[]>([]);
let selectedTarget = $derived(getTrainingTarget(selectedTargetId));

let view = $derived<CombatEncounterView>(
	createCombatEncounterView({
		attacker,
		target: selectedTarget,
		targetDescription: selectedTarget.description,
		targetHitPoints,
		lastState,
		log,
		errorMessage,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function attack(): void {
	if (!view.canAttack) {
		return;
	}

	const result = resolveAttack(
		createAttackInput(selectedTarget, targetHitPoints),
	);
	if (!result.success) {
		errorMessage = mapCombatEncounterFailure(result.error);
		return;
	}

	lastState = result.data;
	targetHitPoints = result.data.target.currentHitPoints;
	log = [...log, ...result.data.log];
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function resetEncounter(): void {
	targetHitPoints = selectedTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectTarget(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedTargetId = event.currentTarget.value;
	const nextTarget = getTrainingTarget(selectedTargetId);
	targetHitPoints = nextTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
}

function mapCombatEncounterFailure(failure: CombatEncounterFailure): string {
	switch (failure.code) {
		case "INVALID_COMBAT_ENCOUNTER_INPUT":
			return "O encontro de combate recebeu dados inválidos.";
		case "ACTION_QUEUE_FAILED":
			return "Não foi possível colocar o ataque na fila de ações.";
		case "RESOLUTION_FAILED":
			return "Não foi possível resolver o teste de ataque.";
		case "DAMAGE_PIPELINE_FAILED":
			return "Não foi possível calcular o dano do ataque.";
	}
}

function getInitialTargetHitPoints(target: CombatTrainingTarget): number {
	return target.currentHitPoints;
}

function getTrainingTarget(id: string): CombatTrainingTarget {
	return findTrainingTargetById(id) ?? initialTarget;
}
</script>

<section aria-labelledby="combat-encounter-title" data-testid="combat-encounter-panel">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
		<div>
			<p class="text-sm font-semibold text-ether">Combate</p>
			<h2
				id="combat-encounter-title"
				class="mt-2 text-2xl font-semibold text-bone"
			>
				Encontro de treino
			</h2>
			<p class="mt-3 max-w-3xl leading-7 text-bone">
				Escolha um alvo de treino e resolva um ataque determinístico.
			</p>
		</div>
		<p class="text-sm font-semibold text-ether" data-testid="combat-status">
			{view.statusLabel}
		</p>
	</div>

	<label class="mt-6 block max-w-xl">
		<span class="text-sm font-semibold text-ether">Alvo de treino</span>
		<select
			bind:value={selectedTargetId}
			onchange={selectTarget}
			data-testid="combat-target-select"
			class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
		>
			{#each trainingTargets as target}
				<option value={target.id}>{target.label}</option>
			{/each}
		</select>
	</label>

	<div class="mt-6 grid gap-4 md:grid-cols-2">
		<div class="border border-bronze bg-blood-shadow px-5 py-4">
			<p class="text-sm font-semibold text-ether">Atacante</p>
			<h3 class="mt-2 text-xl font-semibold text-bone">{view.attackerLabel}</h3>
			<p class="mt-3 leading-7 text-bone">Ação disponível: ataque simples.</p>
		</div>

		<div class="border border-bronze bg-blood-shadow px-5 py-4">
			<p class="text-sm font-semibold text-ether">Alvo</p>
			<h3 class="mt-2 text-xl font-semibold text-bone">{view.targetLabel}</h3>
			<p class="mt-3 leading-7 text-bone" data-testid="combat-target-description">
				{view.targetDescription}
			</p>
			<div class="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
				<span class="border border-bronze px-3 py-1 text-bone">
					{view.targetArmorClassLabel}
				</span>
				<span class="border border-bronze px-3 py-1 text-bone">
					{view.targetHitPointsLabel}
				</span>
			</div>
		</div>
	</div>

	<div class="mt-6 flex flex-wrap gap-3">
		<button
			type="button"
			disabled={!view.canAttack}
			onclick={attack}
			data-testid="combat-attack-button"
			class="border border-ether bg-ether px-4 py-2 text-sm font-semibold text-void transition-colors hover:border-bone hover:bg-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-ruin disabled:text-bone"
		>
			Atacar
		</button>
		<button
			type="button"
			onclick={resetEncounter}
			data-testid="combat-reset-button"
			class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
		>
			Reiniciar encontro
		</button>
	</div>

	{#if view.errorMessage}
		<div
			class="mt-5 border border-bronze bg-blood-shadow px-4 py-3 text-bone"
			data-testid="combat-error"
		>
			{view.errorMessage}
		</div>
	{/if}

	<div class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
		<div class="border border-bronze bg-blood-shadow px-5 py-6">
			<p class="text-sm font-semibold text-ether">Último resultado</p>
			<p class="mt-3 leading-7 text-bone" data-testid="combat-result-summary">
				{view.resultSummary}
			</p>
		</div>

		<div class="border border-bronze bg-blood-shadow px-5 py-6">
			<p class="text-sm font-semibold text-ether">Log do encontro</p>
			<ol class="mt-4 space-y-3" data-testid="combat-log">
				{#each view.logItems as item}
					<li class="leading-7 text-bone">{item}</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
