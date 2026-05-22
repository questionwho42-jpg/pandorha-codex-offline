<script lang="ts">
import { onMount } from "svelte";
import type { CharacterRecord } from "$lib/entities/character";
import type { CharacterClassRecord } from "$lib/entities/character-class";
import { OFFICIAL_EQUIPMENT } from "$lib/entities/equipment/model/equipmentCatalog";
import type { CharacterCraftedItemRecord } from "../../crafting/model/craftingSchema";
import { CombatTurnService } from "../domain/CombatTurnService";
import { createCombatAttackerStatsView } from "../model/combatAttackerStatsView";
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
	createCombatAttackerOptions,
	findCombatAttackerOptionById,
} from "../model/combatSessionAttacker";
import {
	type CombatTrainingAttackProfile,
	createCombatTrainingAttackProfile,
} from "../model/combatTrainingAttackProfile";
import {
	type CombatTrainingTarget,
	findTrainingTargetById,
} from "../model/combatTrainingTargetCatalog";
import { createCombatTrainingTargetTurnLog } from "../model/combatTrainingTargetTurn";
import type {
	CombatTurnFailure,
	CombatTurnState,
} from "../model/combatTurnTypes";

type Props = {
	attacker: CombatEncounterActorRef;
	characterClasses: readonly CharacterClassRecord[];
	characters: readonly CharacterRecord[];
	createAttackInput: (
		attacker: CombatEncounterActorRef,
		target: CombatTrainingTarget,
		targetHitPoints: number,
		attackProfile: CombatTrainingAttackProfile,
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

const turnService = new CombatTurnService();

let {
	attacker,
	characterClasses,
	characters,
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
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial selected attacker.
let selectedAttackerId = $state(attacker.id);
let lastState = $state<CombatEncounterState | null>(null);
let errorMessage = $state<string | null>(null);
let log = $state<readonly string[]>([]);
// svelte-ignore state_referenced_locally: fixed training encounter props are intentionally captured for the initial turn state.
let turnState = $state<CombatTurnState>(
	createInitialTurnState(attacker.id, initialTarget.id),
);

// Estado de itens artesanais carregados do localStorage
let craftedItems = $state<CharacterCraftedItemRecord[]>([]);
// biome-ignore lint/suspicious/noExplicitAny: status effects loaded dynamically from local storage
let activeEffects = $state<any[]>([]);

onMount(() => {
	if (typeof window !== "undefined") {
		const stored = localStorage.getItem("pandorha_crafted_items");
		if (stored) {
			try {
				craftedItems = JSON.parse(stored);
			} catch (e) {
				console.error("Erro ao carregar itens da forja no combate", e);
			}
		}

		const storedEffects = localStorage.getItem("pandorha_status_effects");
		if (storedEffects) {
			try {
				activeEffects = JSON.parse(storedEffects);
			} catch (e) {
				console.error("Erro ao carregar status effects no combate", e);
			}
		}
	}
});

// Sincronização reativa sempre que o atacante for alterado
$effect(() => {
	if (typeof window !== "undefined" && selectedAttackerId) {
		const stored = localStorage.getItem("pandorha_crafted_items");
		if (stored) {
			try {
				craftedItems = JSON.parse(stored);
			} catch (e) {
				console.error("Erro ao ler itens do localStorage", e);
			}
		}

		const storedEffects = localStorage.getItem("pandorha_status_effects");
		if (storedEffects) {
			try {
				activeEffects = JSON.parse(storedEffects);
			} catch (e) {
				console.error("Erro ao ler status effects do localStorage", e);
			}
		}
	}
});

// Cálculo reativo das propriedades de carga e arma equipada do personagem
let characterItems = $derived(
	craftedItems.filter((i) => i.characterId === selectedAttackerId),
);

let attackerActiveEffects = $derived(
	activeEffects.filter((e) => e.characterId === selectedAttackerId),
);

let equippedWeapon = $derived(
	characterItems.find((i) => {
		if (i.isEquipped !== 1) return false;
		const eqInfo = OFFICIAL_EQUIPMENT.find((eq) => eq.id === i.equipmentId);
		return eqInfo?.kind === "weapon";
	}),
);

let equippedWeight = $derived(
	characterItems.reduce((acc, item) => {
		if (item.isEquipped === 1) {
			const eqInfo = OFFICIAL_EQUIPMENT.find(
				(eq) => eq.id === item.equipmentId,
			);
			const weight = eqInfo ? eqInfo.slotCost : 1;
			return acc + weight;
		}
		return acc;
	}, 0),
);

let attackerOptions = $derived(createCombatAttackerOptions(characters));
let selectedAttacker = $derived(getCombatAttacker(selectedAttackerId));

let attackerStatsView = $derived(
	createCombatAttackerStatsView({
		attacker: selectedAttacker,
		characterClasses,
		characters,
		equippedWeight,
		activeEffects: attackerActiveEffects,
	}),
);

let trainingAttackProfile = $derived(
	createCombatTrainingAttackProfile(
		{
			attacker: selectedAttacker,
			characters,
			activeEffects: attackerActiveEffects,
			characterClasses,
		},
		equippedWeapon,
	),
);

let selectedTarget = $derived(getTrainingTarget(selectedTargetId));

let view = $derived<CombatEncounterView>(
	createCombatEncounterView({
		attacker: selectedAttacker,
		attackerOptions,
		target: selectedTarget,
		targetDescription: selectedTarget.description,
		targetHitPoints,
		lastState,
		log,
		errorMessage,
		turn: turnState,
	}),
);

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function attack(): void {
	if (!view.canAttack) {
		return;
	}

	if (attackerStatsView.carrySlotLimitLabel.includes("OVERLOADED")) {
		errorMessage =
			"⚠️ PERSONAGEM IMOBILIZADO: Sobrecarga extrema! Ataques bloqueados e velocidade zero!";
		return;
	}

	const result = resolveAttack(
		createAttackInput(
			selectedAttacker,
			selectedTarget,
			targetHitPoints,
			trainingAttackProfile,
		),
	);
	if (!result.success) {
		errorMessage = mapCombatEncounterFailure(result.error);
		return;
	}

	const spentAction = turnService.spendAction({
		state: turnState,
		actorId: selectedAttacker.id,
		actionCost: 1,
	});
	if (!spentAction.success) {
		errorMessage = mapCombatTurnFailure(spentAction.error);
		return;
	}

	turnState = spentAction.data;
	lastState = result.data;
	targetHitPoints = result.data.target.currentHitPoints;
	log = [...log, ...result.data.log];
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function endTurn(): void {
	if (!view.canEndTurn) {
		return;
	}

	const targetTurnLog = createCombatTrainingTargetTurnLog({
		activeActorId: turnState.activeActorId,
		target: selectedTarget,
	});
	const endedTurn = turnService.endTurn({
		state: turnState,
		actorId: turnState.activeActorId,
	});
	if (!endedTurn.success) {
		errorMessage = mapCombatTurnFailure(endedTurn.error);
		return;
	}

	turnState = endedTurn.data;
	log = targetTurnLog ? [...log, targetTurnLog] : log;
	errorMessage = null;
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function resetEncounter(): void {
	targetHitPoints = selectedTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
	turnState = createInitialTurnState(selectedAttacker.id, selectedTarget.id);
}

// biome-ignore lint/correctness/noUnusedVariables: consumed by Svelte markup.
function selectAttacker(event: Event): void {
	if (!(event.currentTarget instanceof HTMLSelectElement)) {
		return;
	}

	selectedAttackerId = event.currentTarget.value;
	targetHitPoints = selectedTarget.currentHitPoints;
	lastState = null;
	errorMessage = null;
	log = [];
	turnState = createInitialTurnState(selectedAttackerId, selectedTarget.id);
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
	turnState = createInitialTurnState(selectedAttacker.id, nextTarget.id);
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

function mapCombatTurnFailure(failure: CombatTurnFailure): string {
	switch (failure.code) {
		case "INVALID_TURN_INPUT":
			return "O turno recebeu dados inv\u00e1lidos.";
		case "UNKNOWN_TURN_ACTOR":
			return "O participante do turno n\u00e3o foi encontrado.";
		case "INACTIVE_TURN_ACTOR":
			return "Este participante n\u00e3o est\u00e1 com o turno ativo.";
		case "INSUFFICIENT_ACTION_POINTS":
			return "N\u00e3o h\u00e1 a\u00e7\u00f5es suficientes para atacar.";
	}
}

function getInitialTargetHitPoints(target: CombatTrainingTarget): number {
	return target.currentHitPoints;
}

function getTrainingTarget(id: string): CombatTrainingTarget {
	return findTrainingTargetById(id) ?? initialTarget;
}

function getCombatAttacker(id: string): CombatEncounterActorRef {
	return findCombatAttackerOptionById(attackerOptions, id) ?? attacker;
}

function createInitialTurnState(
	attackerId: string,
	targetId: string,
): CombatTurnState {
	const startedTurn = turnService.startTurnOrder({
		actorOrder: [attackerId, targetId],
	});

	return startedTurn.success
		? startedTurn.data
		: {
				round: 1,
				activeActorId: attackerId,
				activeActorIndex: 0,
				actorOrder: [attackerId, targetId],
				actionPointsRemaining: 3,
				maxActionPoints: 3,
				events: [],
			};
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

	<div class="mt-6 grid gap-3 md:grid-cols-3">
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Rodada</p>
			<p class="mt-1 text-lg font-semibold text-bone" data-testid="combat-round">
				{view.roundLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">Turno</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="combat-active-turn"
			>
				{view.activeTurnLabel}
			</p>
		</div>
		<div class="border border-bronze bg-blood-shadow px-4 py-3">
			<p class="text-sm font-semibold text-ether">A&ccedil;&otilde;es</p>
			<p
				class="mt-1 text-lg font-semibold text-bone"
				data-testid="combat-action-points"
			>
				{view.actionPointsLabel}
			</p>
		</div>
	</div>
	<p class="mt-3 leading-7 text-bone" data-testid="combat-turn-instruction">
		{view.turnInstruction}
	</p>

	<div class="mt-6 grid gap-4 md:grid-cols-2">
		<label class="block">
			<span class="text-sm font-semibold text-ether">Atacante</span>
			<select
				bind:value={selectedAttackerId}
				onchange={selectAttacker}
				data-testid="combat-attacker-select"
				class="mt-2 w-full border border-bronze bg-blood-shadow px-3 py-2 text-bone outline-none focus:border-ether"
			>
				{#each view.attackerOptions as option}
					<option value={option.id}>{option.label}</option>
				{/each}
			</select>
		</label>

		<label class="block">
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
	</div>

	<div class="mt-6 grid gap-4 md:grid-cols-2">
		<div class="border border-bronze bg-blood-shadow px-5 py-4">
			<p class="text-sm font-semibold text-ether">Atacante</p>
			<h3 class="mt-2 text-xl font-semibold text-bone">{view.attackerLabel}</h3>
			<div
				class="mt-4 border-t border-bronze pt-4"
				data-testid="combat-attacker-stats"
			>
				<div class="flex flex-wrap items-center justify-between gap-2">
					<p class="text-sm font-semibold text-ether">
						{attackerStatsView.heading}
					</p>
					<p
						class="text-sm font-semibold text-bone"
						data-testid="combat-attacker-stats-source"
					>
						{attackerStatsView.sourceLabel}
					</p>
				</div>
				<dl class="mt-3 grid gap-2 text-sm">
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Classe</dt>
						<dd class="text-right text-bone" data-testid="combat-attacker-class">
							{attackerStatsView.classLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">HP</dt>
						<dd class="text-right text-bone" data-testid="combat-attacker-max-hp">
							{attackerStatsView.maxHpLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Iniciativa</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-attacker-initiative"
						>
							{attackerStatsView.initiativeLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Carga</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-attacker-carry"
						>
							{attackerStatsView.carrySlotLimitLabel}
						</dd>
					</div>
				</dl>
				<p class="mt-3 text-sm leading-6 text-bone">
					{attackerStatsView.helperText}
				</p>
				{#if attackerStatsView.activeEffectsLabels && attackerStatsView.activeEffectsLabels.length > 0}
					<div class="mt-3 border border-[#ef4444]/30 bg-[#1e1212] p-2.5 rounded-sm">
						<p class="text-xs font-semibold text-[#ef4444] uppercase tracking-wider flex items-center gap-1.5">
							🤢 Aflições Ativas do Códex:
						</p>
						<div class="mt-1.5 flex flex-col gap-1">
							{#each attackerStatsView.activeEffectsLabels as effect}
								<span class="text-xs font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1.5" style="color: {effect.color}; background-color: {effect.color}15; border: 1px solid {effect.color}40;">
									{effect.label}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			<div
				class="mt-4 border-t border-bronze pt-4"
				data-testid="combat-training-damage-profile"
			>
				<p class="text-sm font-semibold text-ether">Perfil de dano</p>
				<dl class="mt-3 grid gap-2 text-sm">
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Matriz</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-training-damage-matrix"
						>
							{trainingAttackProfile.matrixLabel}
						</dd>
					</div>
					<div class="flex items-center justify-between gap-3">
						<dt class="text-ether">Treino</dt>
						<dd
							class="text-right text-bone"
							data-testid="combat-training-damage-summary"
						>
							{trainingAttackProfile.summaryLabel}
						</dd>
					</div>
				</dl>
				<p class="mt-3 text-sm leading-6 text-bone">
					{trainingAttackProfile.helperText}
				</p>
				{#if equippedWeapon}
					<div class="mt-3 border border-[#DAB973]/30 bg-[#1A1412] p-2.5 rounded-sm">
						<p class="text-xs font-semibold text-[#DAB973] uppercase tracking-wider flex items-center gap-1.5">
							⚔️ Arma Equipada: {equippedWeapon.label}
						</p>
						<div class="mt-1.5 flex flex-wrap gap-1">
							{#if equippedWeapon.isSharp === 1}
								<span class="text-[10px] font-bold bg-[#DAB973]/20 text-[#DAB973] px-1.5 py-0.5 border border-[#DAB973]/40 rounded-sm">
									AFIADA (+2 Margem, +1 Dano)
								</span>
							{/if}
							{#if equippedWeapon.isRunic === 1}
								<span class="text-[10px] font-bold bg-[#38bdf8]/20 text-[#38bdf8] px-1.5 py-0.5 border border-[#38bdf8]/40 rounded-sm">
									RÚNICA (Dano de Éter)
								</span>
							{/if}
						</div>
					</div>
				{/if}
			</div>
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
			disabled={!view.canReset}
			data-testid="combat-reset-button"
			class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether"
		>
			Reiniciar encontro
		</button>
		<button
			type="button"
			disabled={!view.canEndTurn}
			onclick={endTurn}
			data-testid="combat-end-turn-button"
			class="border border-bronze bg-ruin px-4 py-2 text-sm font-semibold text-bone transition-colors hover:border-ether hover:text-ether focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ether disabled:border-bronze disabled:bg-blood-shadow disabled:text-bone"
		>
			Encerrar turno
		</button>
	</div>

	{#if view.isEncounterComplete}
		<div
			class="mt-5 border border-ether bg-blood-shadow px-5 py-4"
			data-testid="combat-outcome"
		>
			<p class="text-sm font-semibold text-ether">
				{view.encounterOutcomeLabel}
			</p>
			<p class="mt-2 leading-7 text-bone">
				{view.encounterOutcomeDescription}
			</p>
		</div>
	{/if}

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
